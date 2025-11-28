import { render, screen } from '@testing-library/react'
import { TransactionStatusBadge } from '../TransactionStatusBadge'

// Mock i18n-core
jest.mock('@hua-labs/i18n-core', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      // 번역 키에서 마지막 부분 추출 (예: "common:statuses.approved" -> "approved")
      const parts = key.split(':')
      const lastPart = parts[parts.length - 1]
      const keyParts = lastPart.split('.')
      const finalKey = keyParts[keyParts.length - 1]
      
      // 실제로는 번역된 텍스트를 반환하지만, 테스트에서는 키 자체를 반환
      return finalKey
    },
  }),
}))

describe('TransactionStatusBadge', () => {
  it('should render SUCCESS status correctly', () => {
    render(<TransactionStatusBadge status="SUCCESS" />)
    const badge = screen.getByText('approved')
    expect(badge).toBeInTheDocument()
  })

  it('should render FAILED status correctly', () => {
    render(<TransactionStatusBadge status="FAILED" />)
    const badge = screen.getByText('failed')
    expect(badge).toBeInTheDocument()
  })

  it('should render CANCELLED status correctly', () => {
    render(<TransactionStatusBadge status="CANCELLED" />)
    const badge = screen.getByText('cancelled')
    expect(badge).toBeInTheDocument()
  })

  it('should render null status as dash', () => {
    const { container } = render(<TransactionStatusBadge status={null} />)
    expect(container.textContent).toBe('-')
  })

  it('should render unknown status correctly', () => {
    render(<TransactionStatusBadge status="UNKNOWN" />)
    const badge = screen.getByText('-')
    expect(badge).toBeInTheDocument()
  })

  it('should apply correct className for SUCCESS', () => {
    const { container } = render(<TransactionStatusBadge status="SUCCESS" />)
    const badge = container.firstChild as HTMLElement
    expect(badge.className).toMatch(/green/)
  })

  it('should apply correct className for FAILED', () => {
    const { container } = render(<TransactionStatusBadge status="FAILED" />)
    const badge = container.firstChild as HTMLElement
    expect(badge.className).toMatch(/red/)
  })
})

