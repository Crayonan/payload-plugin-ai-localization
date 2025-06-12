import type { CollectionConfig, Config, Field } from 'payload'
import { translateBulkHandler } from './endpoints/translateBulk.js'

const AutoTranslateAllButton = 'ai-localization/client#AutoTranslateAllButton'
const AiLocalizationProvider = 'ai-localization/client#AiLocalizationProvider'
const CssInjector = 'ai-localization/client#CssInjector'

export type AiLocalizationConfig = {
  /**
   * Collections to enable AI translation for
   */
  collections: {
    [collectionSlug: string]: {
      /**
       * Fields that should be translated (must have localized: true)
       */
      fields: string[]
    }
  }
  /**
   * OpenAI API configuration
   */
  openai: {
    apiKey: string
    model?: string
  }
}

export const aiLocalization =
  (pluginOptions: AiLocalizationConfig) =>
  (config: Config): Config => {
    // Validation
    if (!pluginOptions.collections || Object.keys(pluginOptions.collections).length === 0) {
      throw new Error('AI Localization plugin requires at least one collection to be configured.')
    }

    if (!pluginOptions.openai?.apiKey) {
      throw new Error('AI Localization plugin requires OpenAI API key.')
    }

    // Check if localization is enabled in the main config
    if (!config.localization) {
      throw new Error(
        'AI Localization plugin requires Payload localization to be enabled in your config.',
      )
    }

    const newConfig: Config = {
      ...config,
      admin: {
        ...config.admin,
        components: {
          ...config.admin?.components,
          providers: [...(config.admin?.components?.providers || []), AiLocalizationProvider],
          afterLogin: [...(config.admin?.components?.afterLogin || []), CssInjector],
        },
      },
    }

    // Add the bulk translate button to the sidebar of configured collections
    if (pluginOptions.collections && newConfig.collections) {
      for (const collectionSlug in pluginOptions.collections) {
        const collectionIndex = newConfig.collections.findIndex(
          (c) => c.slug === collectionSlug,
        )

        if (collectionIndex > -1) {
          const collection = newConfig.collections[collectionIndex]

          // Add the bulk translate button to the edit view
          if (!collection.admin) collection.admin = {}
          if (!collection.admin.components) collection.admin.components = {}
          if (!collection.admin.components.edit) collection.admin.components.edit = {}

          // Place the button before document controls (top of the edit view)
          collection.admin.components.edit.beforeDocumentControls = [
            ...(collection.admin.components.edit.beforeDocumentControls || []),
            AutoTranslateAllButton,
          ]
        }
      }
    }

    // Add API endpoints
    if (!newConfig.endpoints) newConfig.endpoints = []
    newConfig.endpoints.push(
      {
        path: '/ai-localization/translate-bulk',
        method: 'post',
        handler: translateBulkHandler(pluginOptions),
      }
    )

    return newConfig
  }
