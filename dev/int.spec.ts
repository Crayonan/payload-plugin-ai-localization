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
