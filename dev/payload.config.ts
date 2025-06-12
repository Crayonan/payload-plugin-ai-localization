import { postgresAdapter } from '@payloadcms/db-postgres'
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { aiLocalization } from '../src/index.js'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

import { testEmailAdapter } from './helpers/testEmailAdapter.js'
import { seed } from './seed.js'
import { Users } from './collections/Users.js'
import { Media } from './collections/Media.js'
import { Posts } from './collections/Posts.js'
import { Test } from './collections/Test.js'

const dirname = path.dirname(fileURLToPath(import.meta.url))

if (!process.env.ROOT_DIR) {
  process.env.ROOT_DIR = dirname
}

// Function to get the appropriate database adapter
const getDatabaseAdapter = () => {
  const databaseUri = process.env.DATABASE_URI || ''
  
  // Use PostgreSQL for testing or if DATABASE_URI contains postgres
  if (process.env.NODE_ENV === 'test' || databaseUri.includes('postgres')) {
    return postgresAdapter({
      pool: {
        connectionString: databaseUri,
      },
    })
  }
  
  // Use MongoDB for other environments
  return mongooseAdapter({
    url: databaseUri,
  })
}

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media, Posts, Test],
  editor: lexicalEditor({}),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: getDatabaseAdapter(),
  localization: {
    locales: ['en', 'de'], // required
    defaultLocale: 'en', // required
  },
  plugins: [
    aiLocalization({
      openai: {
        apiKey: process.env.OPENAI_API_KEY || 'your-openai-api-key',
        model: 'gpt-4.1-nano',
      },
      collections: {
        posts: {
          fields: ['title', 'excerpt', 'content'],
        },
        test: {
          fields: ['title', 'excerpt', 'content'],
        },
      },
    }),
  ],
  email: testEmailAdapter,
  onInit: async (payload) => {
    await seed(payload)
  },
  sharp,
})
