/**
 * Mock Preferences Store for Testing
 */

export const usePreferencesStore = jest.fn((selector) => {
  const defaultState = {
    theme: 'light' as const,
    language: 'ko' as const,
    currency: 'KRW' as const,
    dateFormat: 'YYYY-MM-DD' as const,
    fontScale: 'medium' as const,
    highContrast: false,
    reducedMotion: false,
    setTheme: jest.fn(),
    setLanguage: jest.fn(),
    setCurrency: jest.fn(),
    setDateFormat: jest.fn(),
    setFontScale: jest.fn(),
    setHighContrast: jest.fn(),
    setReducedMotion: jest.fn(),
  }

  if (selector) {
    return selector(defaultState)
  }
  return defaultState
})

