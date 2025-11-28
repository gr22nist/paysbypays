/**
 * Mock API Client for Testing
 */

export const transactionsApi = {
  getTransactions: jest.fn(),
}

export const merchantsApi = {
  getMerchants: jest.fn(),
  getMerchantDetail: jest.fn(),
}

export const commonCodesApi = {
  getPaymentStatuses: jest.fn(),
  getPaymentTypes: jest.fn(),
}

export const healthApi = {
  getHealth: jest.fn(),
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: unknown
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

