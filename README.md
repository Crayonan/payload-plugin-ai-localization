# AI Localization Plugin for Payload CMS

A Payload CMS plugin that provides AI-powered content translation using OpenAI, designed to work seamlessly with Payload's built-in localization system.

## Features

- **Leverages Existing Localization**: Works with the languages you've already configured in your Payload localization settings
- **Context-Aware UI**: Adds an "Auto-Translate" button that appears alongside any localized field when you are viewing a non-primary language
- **One-Click Translations**: With a single click, the system fetches the content from the document's main language and translates it to the current locale
- **Smart Field Detection**: Only shows translation buttons on fields you've configured for translation
- **Multiple Field Types**: Supports text, textarea, and rich text fields

## Installation

```bash
npm install payload-plugin-ai-localization
```

## Configuration

First, ensure your Payload config has localization enabled:

```typescript
import { buildConfig } from 'payload'
import { aiLocalization } from 'payload-plugin-ai-localization'

export default buildConfig({
  // ... other config
  localization: {
    locales: ['en', 'de', 'fr', 'es'], // Configure your supported locales
    defaultLocale: 'en', // Set your default locale
  },
  plugins: [
    aiLocalization({
      openai: {
        apiKey: process.env.OPENAI_API_KEY, // Your OpenAI API key
        model: 'gpt-4.1-nano', // Optional: specify the model (defaults to gpt-4.1-nano)
      },
      collections: {
        posts: {
          fields: ['title', 'excerpt', 'content'], // Fields that should have auto-translate buttons
        },
        pages: {
          fields: ['title', 'description'],
        },
      },
    }),
  ],
})
```

## Usage

1. **Create or edit a document** in your Payload admin panel
2. **Switch to a non-primary language** using Payload's built-in language switcher
3. **Click the "Auto-translate from English" button** that appears below any configured field
4. **The content will be automatically translated** from the primary language to the current locale

## Environment Variables

Make sure to set your OpenAI API key in your environment variables of PayloadCMS:

```bash
OPENAI_API_KEY=your_openai_api_key_here
```

## How It Works

The plugin integrates with Payload's native localization system by:

1. **Detecting the current locale** from Payload's context
2. **Fetching content from the primary locale** when you click translate
3. **Using OpenAI to translate the content** to the target language
4. **Updating the field in the current locale** with the translated content

## Supported Field Types

- `text` - Single line text fields
- `textarea` - Multi-line text fields  
- `richText` - Rich text editor fields (preserves formatting)

## API Endpoints

The plugin adds these endpoints to your Payload app:

- `POST /api/ai-localization/translate-bulk` - Translates content between locales

## License

MIT

## Contributing

Contributions are welcome! Please read the contributing guidelines before submitting PRs.

## Support

For issues and questions:
- Create an issue on GitHub
- Check the Payload CMS Discord community
- Review the documentation

---

**Note**: This plugin requires Payload CMS v3.37.0 or higher and an OpenAI API key.
