import type { PayloadHandler } from 'payload'
import { z } from 'zod'
import OpenAI from 'openai'
import type { AiLocalizationConfig } from '../index.js'

const translateRequestSchema = z.object({
  docId: z.string(),
  collection: z.string(),
  fieldName: z.string(),
  sourceLocale: z.string(),
  targetLocale: z.string(),
})

export const translateDocumentHandler =
  (pluginOptions: AiLocalizationConfig): PayloadHandler =>
  async (req) => {
    try {
      // Parse request body - it might be JSON or need to be awaited
      let requestBody
      if (req.json && typeof req.json === 'function') {
        requestBody = await req.json()
      } else {
        requestBody = req.body
      }

      const { docId, collection, fieldName, sourceLocale, targetLocale } = translateRequestSchema.parse(requestBody)

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

      const sourceContent = sourceDoc[fieldName]
      if (!sourceContent) {
        return Response.json({ error: `Field '${fieldName}' not found or empty in source document` }, { status: 400 })
      }

      // Convert content to string for translation
      let contentToTranslate: string
      if (typeof sourceContent === 'string') {
        contentToTranslate = sourceContent
      } else if (typeof sourceContent === 'object' && sourceContent !== null) {
        // Handle rich text or other complex field types
        contentToTranslate = JSON.stringify(sourceContent)
      } else {
        return Response.json({ error: `Field '${fieldName}' contains unsupported content type` }, { status: 400 })
      }

      // Get target language name for better prompts
      const targetLanguageName = getLanguageName(targetLocale)
      const sourceLanguageName = getLanguageName(sourceLocale)

      // Create translation prompt
      const prompt = `Translate the following content from ${sourceLanguageName} to ${targetLanguageName}. 
      
If the content is JSON (rich text), preserve the exact JSON structure and only translate the text values within it. 
If the content is plain text, return only the translated text.

Content to translate:
${contentToTranslate}`

      // Call OpenAI API
      const completion = await openai.chat.completions.create({
        model: pluginOptions.openai.model || 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a professional translator. Translate content accurately while preserving formatting and structure.',
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

      // Parse translated content back to appropriate format
      let finalTranslatedContent: any
      try {
        // Try to parse as JSON first (for rich text fields)
        finalTranslatedContent = JSON.parse(translatedContent)
      } catch {
        // If parsing fails, treat as plain text
        finalTranslatedContent = translatedContent
      }

      // Update the document in the target locale
      await req.payload.update({
        collection,
        id: docId,
        data: {
          [fieldName]: finalTranslatedContent,
        },
        locale: targetLocale,
      })

      return Response.json({
        success: true,
        message: `Field '${fieldName}' translated from ${sourceLanguageName} to ${targetLanguageName}`,
        translatedContent: finalTranslatedContent,
      })
    } catch (error) {
      console.error('Translation error:', error)
      
      if (error instanceof z.ZodError) {
        return Response.json({ error: 'Invalid request data', details: error.errors }, { status: 400 })
      }
      
      return Response.json({ 
        error: error instanceof Error ? error.message : 'An unknown error occurred during translation' 
      }, { status: 500 })
    }
  }

// Helper function to get language names
function getLanguageName(locale: string): string {
  const languageNames: Record<string, string> = {
    en: 'English',
    de: 'German',
    fr: 'French',
    es: 'Spanish',
    it: 'Italian',
    pt: 'Portuguese',
    nl: 'Dutch',
    ru: 'Russian',
    ja: 'Japanese',
    ko: 'Korean',
    zh: 'Chinese',
    ar: 'Arabic',
    hi: 'Hindi',
  }
  
  return languageNames[locale] || locale.toUpperCase()
} 