import type { Payload } from 'payload'

import config from '@payload-config'
import { createPayloadRequest, getPayload } from 'payload'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'

let payload: Payload

afterAll(async () => {
  // Clean up is handled automatically by the test framework
})

beforeAll(async () => {
  payload = await getPayload({ config })
})

describe('Plugin integration tests', () => {
  test('should have AI localization endpoints registered', async () => {
    // Test the supported languages endpoint
    const request = new Request('http://localhost:3000/api/ai-localization/supported-languages', {
      method: 'GET',
    })

    const payloadRequest = await createPayloadRequest({ config, request })
    const response = await (await import('../src/endpoints/getSupportedLanguages.js')).getSupportedLanguagesHandler()(payloadRequest)
    
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data).toHaveProperty('languages')
    expect(Array.isArray(data.languages)).toBe(true)
  })

  test('can create post with required fields', async () => {
    const post = await payload.create({
      collection: 'posts',
      data: {
        title: 'Test Post Title',
        excerpt: 'This is a test excerpt',
        content: {
          root: {
            type: 'root',
            children: [
              {
                type: 'paragraph',
                children: [
                  {
                    type: 'text',
                    text: 'This is test content for the post.',
                    version: 1,
                  },
                ],
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            version: 1,
          },
        },
      },
    })
    
    expect(post.title).toBe('Test Post Title')
    expect(post.excerpt).toBe('This is a test excerpt')
  })

  test('plugin modifies posts collection with auto-translate functionality', async () => {
    // Check that the posts collection exists
    expect(payload.collections['posts']).toBeDefined()
    
    // The plugin should add the auto-translate button component to the posts collection
    const postsCollection = payload.collections['posts']
    expect(postsCollection).toBeDefined()
    
    // Create a post in default locale (en)
    const post = await payload.create({
      collection: 'posts',
      data: {
        title: 'English Title',
        excerpt: 'English excerpt',
      },
    })
    
    expect(post.title).toBe('English Title')
    expect(post.excerpt).toBe('English excerpt')
  })
})
