import type { PayloadHandler } from 'payload'
import { z } from 'zod'
import OpenAI from 'openai'
import type { AiLocalizationConfig } from '../index.js'
import { getLanguageName } from '../helpers/languageHelpers.js'

const translateBulkRequestSchema = z.object({
  docId: z.string(),
  collection: z.string(),
  sourceLocale: z.string(),
  targetLocale: z.string(),
})

export const translateBulkHandler =
  (pluginOptions: AiLocalizationConfig): PayloadHandler =>
  async (req) => {
    try {
      // Parse request body
      let requestBody
      if (req.json && typeof req.json === 'function') {
        requestBody = await req.json()
      } else {
        requestBody = req.body
      }

      const { docId, collection, sourceLocale, targetLocale } =
        translateBulkRequestSchema.parse(requestBody)

      // Get the collection configuration to find which fields to translate
      const collectionConfig = pluginOptions.collections[collection]
      if (!collectionConfig) {
        return Response.json(
          { error: `Collection '${collection}' not configured for translation` },
          { status: 400 },
        )
      }

      // Initialize OpenAI
      const openai = new OpenAI({
        apiKey: pluginOptions.openai.apiKey,
      })

      // Fetch the document in the source locale
      const sourceDoc = await req.payload.findByID({
        collection,
        id: docId,
        locale: sourceLocale,
      })

      if (!sourceDoc) {
        return Response.json({ error: 'Document not found' }, { status: 404 })
      }

      // Get the collection schema to identify localized fields
      const payloadCollection = req.payload.collections[collection]
      if (!payloadCollection) {
        return Response.json({ error: `Collection '${collection}' not found` }, { status: 404 })
      }

      // Find fields that are both configured for translation AND have localized: true
      const fieldsToTranslate = collectionConfig.fields.filter((fieldName) => {
        const field = payloadCollection.config.fields.find(
          (f) => 'name' in f && f.name === fieldName,
        )
        return field && 'localized' in field && field.localized === true
      })

      if (fieldsToTranslate.length === 0) {
        return Response.json({ error: 'No localized fields found for translation' }, { status: 400 })
      }

      // Prepare content for bulk translation
      const contentToTranslate: { [fieldName: string]: string } = {}
      const fieldsWithContent: string[] = []

      for (const fieldName of fieldsToTranslate) {
        const sourceContent = sourceDoc[fieldName]
        if (sourceContent) {
          if (typeof sourceContent === 'string') {
            contentToTranslate[fieldName] = sourceContent
            fieldsWithContent.push(fieldName)
          } else if (typeof sourceContent === 'object' && sourceContent !== null) {
            contentToTranslate[fieldName] = JSON.stringify(sourceContent)
            fieldsWithContent.push(fieldName)
          }
        }
      }

      if (fieldsWithContent.length === 0) {
        return Response.json({ error: 'No content found in configured fields' }, { status: 400 })
      }

      // Get language names for better prompts
      const targetLanguageName = getLanguageName(targetLocale)
      const sourceLanguageName = getLanguageName(sourceLocale)

      // Create bulk translation prompt
      const contentEntries = Object.entries(contentToTranslate)
        .map(([field, content]) => `${field}: ${content}`)
        .join('\n\n')

      const prompt = `Translate the following content from ${sourceLanguageName} to ${targetLanguageName}. 

For each field, preserve the exact format:
- If content is JSON (rich text), preserve the exact JSON structure and only translate text values
- If content is plain text, return only the translated text
- Maintain the field name format: "fieldName: translatedContent"

Content to translate:
${contentEntries}`

      // Call OpenAI API for bulk translation
      const completion = await openai.chat.completions.create({
        model: pluginOptions.openai.model || 'gpt-4.1-nano',
        messages: [
          {
            role: 'system',
            content:
              'You are a professional translator. Translate content accurately while preserving formatting and structure. Return the translated content in the same format as provided.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
      })

      const translatedContent = completion.choices[0]?.message?.content
      if (!translatedContent) {
        return Response.json({ error: 'Translation failed - no content returned' }, { status: 500 })
      }

      // Parse the bulk translated content
      const translatedFields: { [fieldName: string]: any } = {}
      const lines = translatedContent.split('\n\n')

      for (const line of lines) {
        const colonIndex = line.indexOf(': ')
        if (colonIndex > 0) {
          const fieldName = line.substring(0, colonIndex).trim()
          const translatedText = line.substring(colonIndex + 2).trim()

          if (fieldsWithContent.includes(fieldName)) {
            // Try to parse as JSON first (for rich text fields)
            try {
              translatedFields[fieldName] = JSON.parse(translatedText)
            } catch {
              // If parsing fails, treat as plain text
              translatedFields[fieldName] = translatedText
            }
          }
        }
      }

      // Update the document with all translated fields
      await req.payload.update({
        collection,
        id: docId,
        data: translatedFields,
        locale: targetLocale,
      })

      return Response.json({
        success: true,
        message: `Successfully translated ${
          Object.keys(translatedFields).length
        } field(s) from ${sourceLanguageName} to ${targetLanguageName}`,
        translatedFields: Object.keys(translatedFields),
        translatedContent: translatedFields,
      })
    } catch (error) {
      console.error('Bulk translation error:', error)

      if (error instanceof z.ZodError) {
        return Response.json({ error: 'Invalid request data', details: error.errors }, { status: 400 })
      }

      return Response.json(
        {
          error:
            error instanceof Error ? error.message : 'An unknown error occurred during translation',
        },
        { status: 500 },
      )
    }
  } 