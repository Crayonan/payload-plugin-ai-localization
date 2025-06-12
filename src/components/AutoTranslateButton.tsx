'use client'
import React, { useState } from 'react'
import { useDocumentInfo, Button, toast, useLocale } from '@payloadcms/ui'

export const AutoTranslateAllButton: React.FC = () => {
  const { id, collectionSlug } = useDocumentInfo()
  const { code: currentLocale } = useLocale()
  const [isTranslating, setIsTranslating] = useState(false)

  // Only show the button if we're not in the default locale
  if (currentLocale === 'en') {
    return null
  }

  const handleBulkTranslate = async () => {
    if (!id || !collectionSlug) {
      toast.error('Document information not available.')
      return
    }

    setIsTranslating(true)

    try {
      const response = await fetch(`/api/ai-localization/translate-bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          docId: String(id),
          collection: collectionSlug,
          sourceLocale: 'en', // Default locale
          targetLocale: currentLocale,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Translation failed')
      }

      const translatedCount = result.translatedFields?.length || 0
      toast.success(`Successfully translated ${translatedCount} field(s) to ${currentLocale}. Refreshing...`)
      setTimeout(() => window.location.reload(), 1500)
    } catch (error) {
      console.error(error)
      toast.error(error instanceof Error ? error.message : 'An unknown error occurred.')
    } finally {
      setIsTranslating(false)
    }
  }

  return (
    <div style={{ 
      marginTop: '8px',
    }}>
      <Button
        buttonStyle="primary"
        icon="translate"
        onClick={handleBulkTranslate}
        disabled={isTranslating}
        size="small"
        className="auto-translate-all-button"
      >
        {isTranslating ? 'Translating All Fields...' : `Translate to ${currentLocale.toUpperCase()}`}
      </Button>
    </div>
  )
} 