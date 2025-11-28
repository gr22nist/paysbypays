import { renderHook, waitFor, act } from '@testing-library/react'
import { useTransactions } from '../useTransactions'
import { transactionsApi } from '@/lib/api/client'
import { paymentListResToTransaction } from '@/lib/api/types'

// Mock the API client
jest.mock('@/lib/api/client', () => ({
  transactionsApi: {
    getTransactions: jest.fn(),
  },
}))

describe('useTransactions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should fetch transactions successfully', async () => {
    const mockApiResponse = [
      {
        paymentCode: 'PAY001',
        mchtCode: 'M001',
        amount: '10000',
        currency: 'KRW',
        payType: 'CARD',
        status: 'SUCCESS',
        paymentAt: '2025-11-29T10:00:00Z',
      },
      {
        paymentCode: 'PAY002',
        mchtCode: 'M002',
        amount: '20000',
        currency: 'KRW',
        payType: 'MOBILE',
        status: 'FAILED',
        paymentAt: '2025-11-29T11:00:00Z',
      },
    ]

    ;(transactionsApi.getTransactions as jest.Mock).mockResolvedValue({
      data: mockApiResponse,
    })

    const { result } = renderHook(() => useTransactions({ page: 1, size: 10 }))

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data).toBeDefined()
    expect(result.current.data?.content).toHaveLength(2)
    expect(result.current.data?.content[0].id).toBe('PAY001')
    expect(result.current.data?.content[0].amount).toBe(10000)
    expect(result.current.error).toBeNull()
  })

  it('should handle API errors', async () => {
    const error = new Error('API Error')
    ;(transactionsApi.getTransactions as jest.Mock).mockRejectedValue(error)

    const { result } = renderHook(() => useTransactions())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.error).toBeInstanceOf(Error)
    expect(result.current.data?.content).toEqual([])
    expect(result.current.data?.totalElements).toBe(0)
  })

  it('should handle empty response', async () => {
    ;(transactionsApi.getTransactions as jest.Mock).mockResolvedValue({
      data: null,
    })

    const { result } = renderHook(() => useTransactions())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data?.content).toEqual([])
    expect(result.current.data?.totalElements).toBe(0)
  })

  it('should not fetch when enabled is false', async () => {
    const { result } = renderHook(() =>
      useTransactions({ enabled: false })
    )

    // Should not call API
    expect(transactionsApi.getTransactions).not.toHaveBeenCalled()
    expect(result.current.isLoading).toBe(true)
  })

  it('should refetch when refetch is called', async () => {
    const mockApiResponse = [
      {
        paymentCode: 'PAY001',
        mchtCode: 'M001',
        amount: '10000',
        currency: 'KRW',
        payType: 'CARD',
        status: 'SUCCESS',
        paymentAt: '2025-11-29T10:00:00Z',
      },
    ]

    ;(transactionsApi.getTransactions as jest.Mock).mockResolvedValue({
      data: mockApiResponse,
    })

    const { result } = renderHook(() => useTransactions())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    const initialCallCount = (transactionsApi.getTransactions as jest.Mock).mock.calls.length

    // Call refetch
    await act(async () => {
      result.current.refetch()
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(transactionsApi.getTransactions).toHaveBeenCalledTimes(initialCallCount + 1)
  })

  it('should pass correct parameters to API', async () => {
    const mockApiResponse: any[] = []
    ;(transactionsApi.getTransactions as jest.Mock).mockResolvedValue({
      data: mockApiResponse,
    })

    renderHook(() =>
      useTransactions({
        page: 2,
        size: 25,
        status: 'SUCCESS',
        mchtCode: 'M001',
        from: '2025-11-01',
        to: '2025-11-30',
      })
    )

    await waitFor(() => {
      expect(transactionsApi.getTransactions).toHaveBeenCalledWith({
        page: 2,
        size: 25,
        status: 'SUCCESS',
        mchtCode: 'M001',
        from: '2025-11-01',
        to: '2025-11-30',
      })
    })
  })
})

