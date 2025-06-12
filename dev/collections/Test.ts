import type { CollectionConfig } from 'payload'

export const Test: CollectionConfig = {
  slug: 'test',
  admin: {
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      localized: true,
      required: true,
    },
    {
      name: 'excerpt',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'content',
      type: 'richText',
      localized: true,
    },
    {
      name: 'publishedDate',
      type: 'date',
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
    },
  ],
} 