import { renderHook } from '@testing-library/react'
import { useDisplayFormat } from '../useDisplayFormat'
import { usePreferencesStore } from '@/store/preferences-store'

// Mock the store
jest.mock('@/store/preferences-store')

describe('useDisplayFormat', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('formatCurrency', () => {
    it('should format currency in KRW', () => {
      ;(usePreferencesStore as unknown as jest.Mock).mockImplementation((selector) => {
        const state = {
          currency: 'KRW',
          dateFormat: 'YYYY-MM-DD',
          language: 'ko',
        }
        return selector(state)
      })

      const { result } = renderHook(() => useDisplayFormat())

      expect(result.current.formatCurrency(10000)).toContain('₩')
      expect(result.current.formatCurrency(1000000)).toContain('₩')
    })

    it('should format currency in USD', () => {
      ;(usePreferencesStore as unknown as jest.Mock).mockImplementation((selector) => {
        const state = {
          currency: 'USD',
          dateFormat: 'YYYY-MM-DD',
          language: 'en',
        }
        return selector(state)
      })

      const { result } = renderHook(() => useDisplayFormat())

      const formatted = result.current.formatCurrency(1470000, { sourceCurrency: 'KRW' })
      expect(formatted).toContain('$')
    })

    it('should format currency in JPY', () => {
      ;(usePreferencesStore as unknown as jest.Mock).mockImplementation((selector) => {
        const state = {
          currency: 'JPY',
          dateFormat: 'YYYY-MM-DD',
          language: 'ja',
        }
        return selector(state)
      })

      const { result } = renderHook(() => useDisplayFormat())

      const formatted = result.current.formatCurrency(9000, { sourceCurrency: 'KRW' })
      // JPY는 ¥ 또는 ￥ 기호를 사용할 수 있음
      expect(formatted).toMatch(/[¥￥]/)
    })

    it('should handle compact notation', () => {
      ;(usePreferencesStore as unknown as jest.Mock).mockImplementation((selector) => {
        const state = {
          currency: 'KRW',
          dateFormat: 'YYYY-MM-DD',
          language: 'ko',
        }
        return selector(state)
      })

      const { result } = renderHook(() => useDisplayFormat())

      const formatted = result.current.formatCurrency(1000000, { notation: 'compact' })
      expect(formatted).toMatch(/\d+[만천]/)
    })

    it('should handle invalid values', () => {
      ;(usePreferencesStore as unknown as jest.Mock).mockImplementation((selector) => {
        const state = {
          currency: 'KRW',
          dateFormat: 'YYYY-MM-DD',
          language: 'ko',
        }
        return selector(state)
      })

      const { result } = renderHook(() => useDisplayFormat())

      expect(result.current.formatCurrency(NaN)).toBe('₩0')
      expect(result.current.formatCurrency(null as any)).toBe('₩0')
      expect(result.current.formatCurrency(undefined as any)).toBe('₩0')
    })
  })

  describe('formatDate', () => {
    it('should format date in YYYY-MM-DD format', () => {
      ;(usePreferencesStore as unknown as jest.Mock).mockImplementation((selector) => {
        const state = {
          currency: 'KRW',
          dateFormat: 'YYYY-MM-DD',
          language: 'ko',
        }
        return selector(state)
      })

      const { result } = renderHook(() => useDisplayFormat())
      const date = new Date('2025-11-29')

      expect(result.current.formatDate(date)).toBe('2025-11-29')
    })

    it('should format date in YYYY/MM/DD format', () => {
      ;(usePreferencesStore as unknown as jest.Mock).mockImplementation((selector) => {
        const state = {
          currency: 'KRW',
          dateFormat: 'YYYY/MM/DD',
          language: 'ko',
        }
        return selector(state)
      })

      const { result } = renderHook(() => useDisplayFormat())
      const date = new Date('2025-11-29')

      expect(result.current.formatDate(date)).toBe('2025/11/29')
    })

    it('should format date in MM/DD/YYYY format', () => {
      ;(usePreferencesStore as unknown as jest.Mock).mockImplementation((selector) => {
        const state = {
          currency: 'KRW',
          dateFormat: 'MM/DD/YYYY',
          language: 'ko',
        }
        return selector(state)
      })

      const { result } = renderHook(() => useDisplayFormat())
      const date = new Date('2025-11-29')

      expect(result.current.formatDate(date)).toBe('11/29/2025')
    })

    it('should handle invalid date', () => {
      ;(usePreferencesStore as unknown as jest.Mock).mockImplementation((selector) => {
        const state = {
          currency: 'KRW',
          dateFormat: 'YYYY-MM-DD',
          language: 'ko',
        }
        return selector(state)
      })

      const { result } = renderHook(() => useDisplayFormat())

      expect(result.current.formatDate('invalid')).toBe('-')
      expect(result.current.formatDate(NaN)).toBe('-')
    })
  })

  describe('formatDateTime', () => {
    it('should format date and time correctly', () => {
      ;(usePreferencesStore as unknown as jest.Mock).mockImplementation((selector) => {
        const state = {
          currency: 'KRW',
          dateFormat: 'YYYY-MM-DD',
          language: 'ko',
        }
        return selector(state)
      })

      const { result } = renderHook(() => useDisplayFormat())
      const date = new Date('2025-11-29T14:30:00')

      const formatted = result.current.formatDateTime(date)
      expect(formatted).toMatch(/2025-11-29/)
      expect(formatted).toMatch(/14:30/)
    })

    it('should handle string input', () => {
      ;(usePreferencesStore as unknown as jest.Mock).mockImplementation((selector) => {
        const state = {
          currency: 'KRW',
          dateFormat: 'YYYY-MM-DD',
          language: 'ko',
        }
        return selector(state)
      })

      const { result } = renderHook(() => useDisplayFormat())

      const formatted = result.current.formatDateTime('2025-11-29T14:30:00')
      expect(formatted).toMatch(/2025-11-29/)
      expect(formatted).toMatch(/14:30/)
    })
  })
})

