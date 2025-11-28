/**
 * Mock i18n-core for Testing
 */

export const useTranslation = jest.fn(() => ({
  t: (key: string) => {
    // 간단한 번역 키 반환 (실제 번역 대신)
    const parts = key.split(':')
    return parts[parts.length - 1] || key
  },
}))

export const useLanguageChange = jest.fn(() => jest.fn())

export const createCoreI18n = jest.fn()

