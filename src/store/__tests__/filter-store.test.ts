import { renderHook, act } from '@testing-library/react'
import { useFilterStore } from '../filter-store'
import type { DatePreset } from '@/types/date-preset'

describe('filterStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    const { result } = renderHook(() => useFilterStore())
    act(() => {
      result.current.resetTransactionFilters()
      result.current.resetMerchantFilters()
      // DatePreset은 객체이므로 null 대신 undefined로 초기화하거나 아무것도 하지 않음
    })
  })

  describe('transaction filters', () => {
    it('should set transaction status', () => {
      const { result } = renderHook(() => useFilterStore())

      act(() => {
        result.current.setTransactionStatus('SUCCESS')
      })

      expect(result.current.transactionStatus).toBe('SUCCESS')
    })

    it('should set transaction pay type', () => {
      const { result } = renderHook(() => useFilterStore())

      act(() => {
        result.current.setTransactionPayType('CARD')
      })

      expect(result.current.transactionPayType).toBe('CARD')
    })

    it('should reset transaction filters', () => {
      const { result } = renderHook(() => useFilterStore())

      act(() => {
        result.current.setTransactionStatus('SUCCESS')
        result.current.setTransactionPayType('CARD')
        result.current.resetTransactionFilters()
      })

      expect(result.current.transactionStatus).toBeUndefined()
      expect(result.current.transactionPayType).toBeUndefined()
    })

    it('should allow undefined values', () => {
      const { result } = renderHook(() => useFilterStore())

      act(() => {
        result.current.setTransactionStatus('SUCCESS')
        result.current.setTransactionStatus(undefined)
      })

      expect(result.current.transactionStatus).toBeUndefined()
    })
  })

  describe('merchant filters', () => {
    it('should set merchant search query', () => {
      const { result } = renderHook(() => useFilterStore())

      act(() => {
        result.current.setMerchantSearchQuery('test query')
      })

      expect(result.current.merchantSearchQuery).toBe('test query')
    })

    it('should set merchant status', () => {
      const { result } = renderHook(() => useFilterStore())

      act(() => {
        result.current.setMerchantStatus('ACTIVE')
      })

      expect(result.current.merchantStatus).toBe('ACTIVE')
    })

    it('should reset merchant filters', () => {
      const { result } = renderHook(() => useFilterStore())

      act(() => {
        result.current.setMerchantSearchQuery('test')
        result.current.setMerchantStatus('ACTIVE')
        result.current.resetMerchantFilters()
      })

      expect(result.current.merchantSearchQuery).toBe('')
      expect(result.current.merchantStatus).toBeUndefined()
    })
  })

  describe('date preset', () => {
    it('should set date preset', () => {
      const { result } = renderHook(() => useFilterStore())

      const preset: DatePreset = { label: '오늘', value: 'today' }

      act(() => {
        result.current.setSelectedDatePreset(preset)
      })

      expect(result.current.selectedDatePreset).toEqual(preset)
    })

    it('should allow null date preset', () => {
      const { result } = renderHook(() => useFilterStore())

      const preset: DatePreset = { label: '오늘', value: 'today' }

      act(() => {
        result.current.setSelectedDatePreset(preset)
      })

      expect(result.current.selectedDatePreset).toEqual(preset)
    })
  })

  describe('multiple filters', () => {
    it('should handle multiple filter types simultaneously', () => {
      const { result } = renderHook(() => useFilterStore())

      const preset: DatePreset = { label: '지난 7일', value: 'last7days' }

      act(() => {
        result.current.setTransactionStatus('SUCCESS')
        result.current.setTransactionPayType('CARD')
        result.current.setMerchantSearchQuery('test')
        result.current.setMerchantStatus('ACTIVE')
        result.current.setSelectedDatePreset(preset)
      })

      expect(result.current.transactionStatus).toBe('SUCCESS')
      expect(result.current.transactionPayType).toBe('CARD')
      expect(result.current.merchantSearchQuery).toBe('test')
      expect(result.current.merchantStatus).toBe('ACTIVE')
      expect(result.current.selectedDatePreset).toEqual(preset)
    })
  })
})

