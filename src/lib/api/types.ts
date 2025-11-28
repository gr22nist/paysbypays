/**
 * PaysByPays API Types
 * 실제 API 응답 스키마 기반 (docs/api-schema.md 참고)
 */

// 공통 API 응답 구조
export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

// 거래 목록 응답
export interface PaymentListRes {
  paymentCode: string;    // 거래 코드/ID
  mchtCode: string;       // 가맹점 코드
  amount: string;         // 거래 금액 (문자열)
  currency: string;       // 통화 (예: "KRW")
  payType: string;        // 결제 수단 타입
  status: string;         // 거래 상태
  paymentAt: string;      // 결제 시각 (ISO 8601 date-time)
}

export interface ApiResponseListPaymentListRes extends ApiResponse<PaymentListRes[]> {}

// 가맹점 목록 응답
export interface MerchantListRes {
  mchtCode: string;       // 가맹점 코드
  mchtName: string;       // 가맹점명
  status: string;         // 가맹점 상태
  bizType: string;        // 사업자 유형
}

export interface ApiResponseListMerchantListRes extends ApiResponse<MerchantListRes[]> {}

// 가맹점 상세 응답
export interface MerchantDetailRes {
  mchtCode: string;           // 가맹점 코드
  mchtName: string;           // 가맹점명
  status: string;             // 가맹점 상태
  bizType: string;            // 사업자 유형
  bizNo: string;              // 사업자 등록번호
  address: string;            // 주소
  phone: string;              // 전화번호
  email: string;              // 이메일
  registeredAt: string;       // 등록일시 (ISO 8601 date-time)
  updatedAt: string;          // 수정일시 (ISO 8601 date-time)
}

export interface ApiResponseMerchantDetailRes extends ApiResponse<MerchantDetailRes> {}
export interface ApiResponseListMerchantDetailRes extends ApiResponse<MerchantDetailRes[]> {}

// 상태 목록 응답
export interface StatusRes {
  code: string;              // 상태 코드
  description: string;       // 상태 설명
}

export interface ApiResponseListStatusRes extends ApiResponse<StatusRes[]> {}

// 결제 수단 목록 응답
export interface PayTypeRes {
  type: string;              // 결제 수단 타입 코드
  description: string;       // 결제 수단 설명
}

export interface ApiResponseListPayTypeRes extends ApiResponse<PayTypeRes[]> {}

// ============================================
// 호환성을 위한 기존 타입 (점진적 마이그레이션)
// ============================================

export interface Transaction {
  id: string;
  merchantId?: string;
  merchantName?: string;
  amount: number;
  currency?: string;
  status: string;
  paymentMethod?: string;
  payType?: string; // 원본 payType 보관
  createdAt: string;
  updatedAt?: string;
  customerName?: string;
  fee?: number;
}

// PaymentListRes를 Transaction으로 변환하는 헬퍼
export function paymentListResToTransaction(payment: PaymentListRes): Transaction {
  return {
    id: payment.paymentCode,
    merchantId: payment.mchtCode,
    merchantName: undefined, // 별도 조회 필요 (가맹점 API에서 조회)
    amount: parseFloat(payment.amount) || 0,
    currency: payment.currency || "KRW",
    status: payment.status || "PENDING",
    paymentMethod: payment.payType || "",
    payType: payment.payType, // 원본 데이터도 보관
    createdAt: payment.paymentAt,
    updatedAt: payment.paymentAt,
  };
}

export interface Merchant {
  id: string;
  name: string;
  status: string;
  approvalRate?: number;
  totalTransactions?: number;
  totalAmount?: number;
  riskLevel?: "low" | "medium" | "high";
}

// MerchantListRes를 Merchant로 변환하는 헬퍼
export function merchantListResToMerchant(merchant: MerchantListRes): Merchant {
  return {
    id: merchant.mchtCode,
    name: merchant.mchtName,
    status: merchant.status.toLowerCase(),
  };
}

export interface TransactionSummary {
  totalAmount: number;
  totalCount: number;
  approvedCount: number;
  failedCount: number;
  pendingCount: number;
  approvalRate: number;
  averageAmount: number;
}

export interface Settlement {
  id: string;
  merchantId: string;
  merchantName?: string;
  amount: number;
  status: string;
  scheduledDate: string;
  completedDate?: string;
}

export interface DashboardOverview {
  totalVolume: number;
  transactionCount: number;
  approvalRate: number;
  activeMerchants: number;
  averageTicketSize: number;
}

