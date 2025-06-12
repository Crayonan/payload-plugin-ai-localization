export const languageNames: Record<string, string> = {
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

export function getLanguageName(locale: string): string {
  return languageNames[locale] || locale.toUpperCase()
}

export function getLanguages(locales: (string | { code: string })[]): { code: string; name: string }[] {
  return locales.map((locale: any) => {
    const localeCode = typeof locale === 'string' ? locale : locale.code
    return {
      code: localeCode,
      name: getLanguageName(localeCode),
    }
  })
} 