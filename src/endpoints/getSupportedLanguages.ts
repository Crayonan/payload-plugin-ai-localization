import type { PayloadHandler } from 'payload'

export const getSupportedLanguagesHandler = (): PayloadHandler => {
  return async (req) => {
    try {
      // Get localization config from Payload
      const localizationConfig = req.payload.config.localization
      
      if (!localizationConfig) {
        return Response.json({
          error: 'Localization is not enabled in Payload config',
        }, { status: 400 })
      }
      
      const locales = localizationConfig.locales || []
      
      const languages = locales.map((locale: any) => {
        const localeCode = typeof locale === 'string' ? locale : locale.code
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
        }
        
        return {
          code: localeCode,
          name: languageNames[localeCode] || localeCode.toUpperCase()
        }
      })

      return Response.json({
        success: true,
        languages,
        defaultLocale: localizationConfig.defaultLocale || 'en',
      })
    } catch (error) {
      console.error('Get supported languages endpoint error:', error)
      return Response.json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }, { status: 500 })
    }
  }
} 