'use client'
import React, { createContext, useContext } from 'react'

interface AiLocalizationContextType {
  pluginEnabled: boolean
}

const AiLocalizationContext = createContext<AiLocalizationContextType>({
  pluginEnabled: true,
})

export const useAiLocalization = () => useContext(AiLocalizationContext)

export const AiLocalizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const value = {
    pluginEnabled: true,
  }

  return (
    <AiLocalizationContext.Provider value={value}>
      {children}
    </AiLocalizationContext.Provider>
  )
} 