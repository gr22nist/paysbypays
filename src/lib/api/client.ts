/**
 * PaysByPays API Client
 * Next.js API 라우트를 통한 프록시 사용 (CORS 문제 해결)
 */

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function parseErrorBody(response: Response): Promise<unknown> {
  try {
    return await response.clone().json();
  } catch {
    try {
      const text = await response.text();
      return text || null;
    } catch {
      return null;
    }
  }
}

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  // Next.js API 프록시를 통해 호출 (CORS 문제 해결)
  // endpoint는 "/payments/list" 형태로 들어옴
  const proxyPath = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;
  const url = `/api/proxy/${proxyPath}`;
  
  console.log("API Request (via proxy):", url, options);
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    console.log("API Response Status:", response.status, response.statusText);

    if (!response.ok) {
      const errorBody = await parseErrorBody(response);
      let derivedMessage: string;
      if (
        errorBody &&
        typeof errorBody === "object" &&
        "message" in errorBody &&
        typeof (errorBody as { message?: unknown }).message === "string"
      ) {
        const message = (errorBody as { message: string }).message.trim();
        derivedMessage = message || `API Error: ${response.status} ${response.statusText}`;
      } else {
        derivedMessage = `API Error: ${response.status} ${response.statusText}`;
      }

      console.error("API Error:", {
        status: response.status,
        body: errorBody,
      });

      throw new ApiError(derivedMessage, response.status, errorBody);
    }

    const data = await response.json();
    console.log("API Response Data:", data);
    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    console.error("Network Error:", error);
    throw new ApiError(
      error instanceof Error ? error.message : "API 서버에 연결할 수 없습니다.",
      0,
      { originalError: error instanceof Error ? error.message : "Unknown error" }
    );
  }
}

// Transaction/Payment APIs
export const transactionsApi = {
  /**
   * Get payment/transaction list
   * 실제 엔드포인트: GET /api/v1/payments/list
   */
  getTransactions: async (params?: {
    page?: number;
    size?: number;
    status?: string;
    mchtCode?: string;  // merchantId 대신 mchtCode 사용
    from?: string;
    to?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.size) queryParams.append("size", params.size.toString());
    if (params?.status) queryParams.append("status", params.status);
    if (params?.mchtCode) queryParams.append("mchtCode", params.mchtCode);
    if (params?.from) queryParams.append("from", params.from);
    if (params?.to) queryParams.append("to", params.to);

    const query = queryParams.toString();
    return fetchApi<{
      status: number;
      message: string;
      data: Array<{
        paymentCode: string;
        mchtCode: string;
        amount: string;
        currency: string;
        payType: string;
        status: string;
        paymentAt: string;
      }>;
    }>(`/payments/list${query ? `?${query}` : ""}`);
  },

  /**
   * Get transaction by payment code
   * 실제 엔드포인트: GET /api/v1/payments/list?paymentCode={paymentCode}
   * 또는 별도 엔드포인트가 있을 수 있음 (확인 필요)
   */
  getTransaction: async (paymentCode: string) => {
    return fetchApi<{
      status: number;
      message: string;
      data: {
        paymentCode: string;
        mchtCode: string;
        amount: string;
        currency: string;
        payType: string;
        status: string;
        paymentAt: string;
      };
    }>(`/payments/list?paymentCode=${paymentCode}`);
  },

  /**
   * Get transaction summary/statistics
   * 실제 엔드포인트 확인 필요 (존재 여부 불확실)
   * 클라이언트 측에서 /payments/list 결과를 집계하여 사용
   */
  getSummary: async (params?: {
    from?: string;
    to?: string;
    mchtCode?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.from) queryParams.append("from", params.from);
    if (params?.to) queryParams.append("to", params.to);
    if (params?.mchtCode) queryParams.append("mchtCode", params.mchtCode);

    const query = queryParams.toString();
    // 실제 엔드포인트가 없을 경우 클라이언트 측에서 집계
    // 일단 /payments/list를 호출하고 클라이언트에서 집계
    return fetchApi<{
      status: number;
      message: string;
      data: {
        totalAmount?: number;
        totalCount?: number;
        approvedCount?: number;
        failedCount?: number;
        pendingCount?: number;
        approvalRate?: number;
        averageAmount?: number;
      };
    }>(`/payments/list${query ? `?${query}` : ""}`);
  },
};

// Merchant APIs
export const merchantsApi = {
  /**
   * Get merchant list
   * 실제 엔드포인트: GET /api/v1/merchants/list
   */
  getMerchants: async (params?: {
    page?: number;
    size?: number;
    search?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.size) queryParams.append("size", params.size.toString());
    if (params?.search) queryParams.append("search", params.search);

    const query = queryParams.toString();
    return fetchApi<{
      status: number;
      message: string;
      data: Array<{
        mchtCode: string;
        mchtName: string;
        status: string;
        bizType: string;
      }>;
    }>(`/merchants/list${query ? `?${query}` : ""}`);
  },

  /**
   * Get all merchant details
   * 실제 엔드포인트: GET /api/v1/merchants/details
   */
  getAllMerchantDetails: async () => {
    return fetchApi<{
      status: number;
      message: string;
      data: Array<{
        mchtCode: string;
        mchtName: string;
        status: string;
        bizType: string;
        bizNo: string;
        address: string;
        phone: string;
        email: string;
        registeredAt: string;
        updatedAt: string;
      }>;
    }>("/merchants/details");
  },

  /**
   * Get merchant by mchtCode
   * 실제 엔드포인트: GET /api/v1/merchants/details/{mchtCode}
   */
  getMerchant: async (mchtCode: string) => {
    return fetchApi<{
      status: number;
      message: string;
      data: {
        mchtCode: string;
        mchtName: string;
        status: string;
        bizType: string;
        bizNo: string;
        address: string;
        phone: string;
        email: string;
        registeredAt: string;
        updatedAt: string;
      };
    }>(`/merchants/details/${mchtCode}`);
  },
};

// Settlement APIs
// 실제 엔드포인트 확인 필요 (스키마에 없음)
export const settlementsApi = {
  /**
   * Get settlement list
   * 실제 엔드포인트 확인 필요
   */
  getSettlements: async (params?: {
    page?: number;
    size?: number;
    from?: string;
    to?: string;
    mchtCode?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.size) queryParams.append("size", params.size.toString());
    if (params?.from) queryParams.append("from", params.from);
    if (params?.to) queryParams.append("to", params.to);
    if (params?.mchtCode) queryParams.append("mchtCode", params.mchtCode);

    const query = queryParams.toString();
    // 실제 엔드포인트 확인 필요
    return fetchApi(`/settlements${query ? `?${query}` : ""}`);
  },

  /**
   * Get settlement by ID
   * 실제 엔드포인트 확인 필요
   */
  getSettlement: async (id: string) => {
    return fetchApi(`/settlements/${id}`);
  },
};

// Common Code APIs
export const metadataApi = {
  /**
   * Get payment status list
   * 실제 엔드포인트: GET /api/v1/common/payment-status/all
   */
  getPaymentStatuses: async () => {
    return fetchApi<{
      status: number;
      message: string;
      data: Array<{
        code: string;
        description: string;
      }>;
    }>("/common/payment-status/all");
  },

  /**
   * Get pay type list
   * 실제 엔드포인트: GET /api/v1/common/paymemt-type/all
   * 주의: 엔드포인트에 오타가 있을 수 있음 (paymemt → payment)
   */
  getPayTypes: async () => {
    return fetchApi<{
      status: number;
      message: string;
      data: Array<{
        type: string;
        description: string;
      }>;
    }>("/common/paymemt-type/all");
  },

  /**
   * Get merchant status list
   * 실제 엔드포인트: GET /api/v1/common/mcht-status/all
   */
  getMerchantStatuses: async () => {
    return fetchApi<{
      status: number;
      message: string;
      data: Array<{
        code: string;
        description: string;
      }>;
    }>("/common/mcht-status/all");
  },
};

// Health Check API
export const healthApi = {
  /**
   * Health check
   * 실제 엔드포인트: GET /health
   */
  check: async () => {
    return fetchApi<{
      status?: number;
      message?: string;
      [key: string]: unknown;
    }>("/health");
  },
};

// Analytics APIs
// 실제 엔드포인트 확인 필요 (스키마에 없음)
// 대시보드 통계는 클라이언트 측에서 /payments/list 결과를 집계하여 사용
export const analyticsApi = {
  /**
   * Get dashboard overview
   * 실제 엔드포인트가 없을 경우 클라이언트 측에서 집계
   */
  getOverview: async (params?: {
    from?: string;
    to?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.from) queryParams.append("from", params.from);
    if (params?.to) queryParams.append("to", params.to);

    const query = queryParams.toString();
    // 실제 엔드포인트가 없을 경우 /payments/list를 사용하여 클라이언트에서 집계
    return fetchApi(`/payments/list${query ? `?${query}` : ""}`);
  },
};

