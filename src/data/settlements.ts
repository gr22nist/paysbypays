"use client";

import type { Transaction } from "@/lib/api/types";
import { getPayTypeMeta } from "@/data/pay-types";

export type SettlementStatus = "scheduled" | "processing" | "completed" | "delayed";

export interface SettlementBreakdown {
  method: string;
  amount: number;
  feeRate: number;
}

export interface SettlementRecord {
  id: string;
  merchantCode: string;
  merchantName: string;
  grossAmount: number;
  feeAmount: number;
  netAmount: number;
  scheduledDate: string;
  payoutDate?: string;
  status: SettlementStatus;
  methodBreakdown: SettlementBreakdown[];
  source: "mock" | "real";
}

export interface SettlementSummary {
  totalGross: number;
  totalNet: number;
  scheduledCount: number;
  completedCount: number;
  delayedCount: number;
}

const DEFAULT_FEE_RATE = 0.025;
const METHOD_FEE_MAP: Record<string, number> = {
  CARD: 0.025,
  MOBILE: 0.027,
  TERMINAL: 0.022,
  BANK_TRANSFER: 0.004,
  VIRTUAL_ACCOUNT: 0.005,
  QR: 0.015,
  CASH: 0,
};

export const mockSettlementRecords: SettlementRecord[] = [
  {
    id: "STL-20250901-APLUS",
    merchantCode: "APLUS-SHOP",
    merchantName: "에이플러스 쇼핑",
    grossAmount: 13800000,
    feeAmount: 345000,
    netAmount: 13455000,
    scheduledDate: "2025-09-03",
    payoutDate: "2025-09-04",
    status: "completed",
    methodBreakdown: [
      { method: "신용카드", amount: 11800000, feeRate: METHOD_FEE_MAP.CARD },
      { method: "온라인", amount: 2000000, feeRate: METHOD_FEE_MAP.QR },
    ],
    source: "mock",
  },
  {
    id: "STL-20250912-PAYS",
    merchantCode: "PAYSPB-SUB",
    merchantName: "올페이즈 구독 앱",
    grossAmount: 2750000,
    feeAmount: 67500,
    netAmount: 2682500,
    scheduledDate: "2025-09-13",
    payoutDate: "2025-09-14",
    status: "completed",
    methodBreakdown: [
      { method: "정기결제", amount: 2750000, feeRate: METHOD_FEE_MAP.MOBILE },
    ],
    source: "mock",
  },
  {
    id: "STL-20250920-BRC",
    merchantCode: "BRUNCH-SEOUL",
    merchantName: "브런치커피 강남점",
    grossAmount: 1860000,
    feeAmount: 41000,
    netAmount: 1819000,
    scheduledDate: "2025-09-21",
    payoutDate: "2025-09-22",
    status: "completed",
    methodBreakdown: [
      { method: "모바일", amount: 930000, feeRate: METHOD_FEE_MAP.MOBILE },
      { method: "단말기", amount: 930000, feeRate: METHOD_FEE_MAP.TERMINAL },
    ],
    source: "mock",
  },
  {
    id: "STL-2025001",
    merchantCode: "MCHT-001",
    merchantName: "에이플러스 쇼핑",
    grossAmount: 12500000,
    feeAmount: 310000,
    netAmount: 12190000,
    scheduledDate: "2025-10-04",
    payoutDate: "2025-10-05",
    status: "completed",
    methodBreakdown: [
      { method: "CARD", amount: 9800000, feeRate: METHOD_FEE_MAP.CARD },
      { method: "MOBILE", amount: 2700000, feeRate: METHOD_FEE_MAP.MOBILE },
    ],
    source: "mock",
  },
  {
    id: "STL-2025002",
    merchantCode: "MCHT-002",
    merchantName: "멜론서브 구독",
    grossAmount: 4200000,
    feeAmount: 98000,
    netAmount: 4102000,
    scheduledDate: "2025-10-08",
    payoutDate: "2025-10-09",
    status: "completed",
    methodBreakdown: [
      { method: "CARD", amount: 3600000, feeRate: METHOD_FEE_MAP.CARD },
      { method: "BANK_TRANSFER", amount: 600000, feeRate: METHOD_FEE_MAP.BANK_TRANSFER },
    ],
    source: "mock",
  },
  {
    id: "STL-2025003",
    merchantCode: "MCHT-005",
    merchantName: "큐브 편의점",
    grossAmount: 2150000,
    feeAmount: 72000,
    netAmount: 2078000,
    scheduledDate: "2025-10-15",
    payoutDate: "2025-10-16",
    status: "completed",
    methodBreakdown: [
      { method: "TERMINAL", amount: 1500000, feeRate: METHOD_FEE_MAP.TERMINAL },
      { method: "QR", amount: 650000, feeRate: METHOD_FEE_MAP.QR },
    ],
    source: "mock",
  },
  {
    id: "STL-2025004",
    merchantCode: "MCHT-008",
    merchantName: "그로서리 라이프",
    grossAmount: 3200000,
    feeAmount: 80000,
    netAmount: 3120000,
    scheduledDate: "2025-11-25",
    status: "delayed",
    methodBreakdown: [
      { method: "CARD", amount: 2400000, feeRate: METHOD_FEE_MAP.CARD },
      { method: "MOBILE", amount: 800000, feeRate: METHOD_FEE_MAP.MOBILE },
    ],
    source: "mock",
  },
  {
    id: "STL-2025005",
    merchantCode: "MCHT-012",
    merchantName: "테크샵 온라인",
    grossAmount: 1850000,
    feeAmount: 46000,
    netAmount: 1804000,
    scheduledDate: "2025-11-26",
    status: "delayed",
    methodBreakdown: [
      { method: "CARD", amount: 1500000, feeRate: METHOD_FEE_MAP.CARD },
      { method: "ONLINE", amount: 350000, feeRate: METHOD_FEE_MAP.QR },
    ],
    source: "mock",
  },
  {
    id: "STL-2025006",
    merchantCode: "MCHT-015",
    merchantName: "카페 드림",
    grossAmount: 2800000,
    feeAmount: 70000,
    netAmount: 2730000,
    scheduledDate: "2025-11-28",
    status: "scheduled",
    methodBreakdown: [
      { method: "CARD", amount: 2000000, feeRate: METHOD_FEE_MAP.CARD },
      { method: "TERMINAL", amount: 800000, feeRate: METHOD_FEE_MAP.TERMINAL },
    ],
    source: "mock",
  },
  {
    id: "STL-2025007",
    merchantCode: "MCHT-020",
    merchantName: "패션 스토어",
    grossAmount: 4500000,
    feeAmount: 112500,
    netAmount: 4387500,
    scheduledDate: "2025-11-29",
    status: "scheduled",
    methodBreakdown: [
      { method: "CARD", amount: 3500000, feeRate: METHOD_FEE_MAP.CARD },
      { method: "MOBILE", amount: 1000000, feeRate: METHOD_FEE_MAP.MOBILE },
    ],
    source: "mock",
  },
];

function calcFeeRate(method?: string) {
  if (!method) return DEFAULT_FEE_RATE;
  return METHOD_FEE_MAP[method.toUpperCase()] ?? DEFAULT_FEE_RATE;
}

export function deriveSettlementsFromTransactions(
  transactions: Transaction[],
  merchantNameMap?: Map<string, string>
): SettlementRecord[] {
  const grouped = new Map<
    string,
    {
      merchantName: string;
      amount: number;
      methods: Record<string, number>;
      latestPaymentAt: string;
    }
  >();

  transactions.forEach((tx) => {
    if (!tx.merchantId) return;
    const key = tx.merchantId;
    const existing = grouped.get(key);
    const methodLabel = tx.paymentMethod || tx.payType || "CARD";
    const amount = tx.amount || 0;

    if (!existing) {
      grouped.set(key, {
        merchantName:
          tx.merchantName ||
          merchantNameMap?.get(key) ||
          `가맹점 ${key.slice(-4)}`,
        amount,
        methods: { [methodLabel]: amount },
        latestPaymentAt: tx.createdAt,
      });
    } else {
      existing.amount += amount;
      existing.methods[methodLabel] = (existing.methods[methodLabel] || 0) + amount;
      if (new Date(tx.createdAt).getTime() > new Date(existing.latestPaymentAt).getTime()) {
        existing.latestPaymentAt = tx.createdAt;
      }
    }
  });

  const records: SettlementRecord[] = [];

  grouped.forEach((value, merchantCode) => {
    const methodBreakdown: SettlementBreakdown[] = Object.entries(value.methods).map(([method, amount]) => ({
      method: getPayTypeMeta(method).label,
      amount,
      feeRate: calcFeeRate(method),
    }));

    const feeAmount = methodBreakdown.reduce((sum, item) => sum + item.amount * item.feeRate, 0);
    const netAmount = Math.max(0, value.amount - feeAmount);

    const scheduledDate = new Date(value.latestPaymentAt);
    scheduledDate.setDate(scheduledDate.getDate() + 2);
    
    // 지급 예정일이 오늘보다 과거면 완료로 처리
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const scheduledDateOnly = new Date(scheduledDate);
    scheduledDateOnly.setHours(0, 0, 0, 0);
    
    const isPast = scheduledDateOnly < today;
    const status: SettlementStatus = isPast ? "completed" : "scheduled";
    const payoutDate =
      status === "completed"
        ? scheduledDate.toISOString().split("T")[0]
        : undefined;

    records.push({
      id: `REAL-${merchantCode}-${value.latestPaymentAt}`,
      merchantCode,
      merchantName: value.merchantName,
      grossAmount: value.amount,
      feeAmount,
      netAmount,
      scheduledDate: scheduledDate.toISOString().split("T")[0],
      payoutDate,
      status,
      methodBreakdown,
      source: "real",
    });
  });

  return records;
}

export function mergeSettlementRecords(
  realRecords: SettlementRecord[],
  fallbackRecords: SettlementRecord[] = mockSettlementRecords
): SettlementRecord[] {
  const merged = [...fallbackRecords];
  
  // 오늘 날짜 기준으로 과거 지급 예정일을 완료로 업데이트하는 헬퍼 함수
  const updateStatusIfPast = (record: SettlementRecord): SettlementRecord => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const scheduledDateOnly = new Date(record.scheduledDate);
    scheduledDateOnly.setHours(0, 0, 0, 0);
    
    // 지급 예정일이 오늘보다 과거이고 상태가 scheduled이면 completed로 변경
    if (scheduledDateOnly < today && record.status === "scheduled") {
      return {
        ...record,
        status: "completed",
        payoutDate: record.payoutDate || record.scheduledDate,
      };
    }
    return record;
  };

  realRecords.forEach((record) => {
    const updatedRecord = updateStatusIfPast(record);
    const index = merged.findIndex(
      (item) => item.merchantCode === updatedRecord.merchantCode && item.scheduledDate === updatedRecord.scheduledDate
    );

    if (index >= 0) {
      merged[index] = {
        ...merged[index],
        ...updatedRecord,
        source: "real",
      };
    } else {
      merged.unshift(updatedRecord);
    }
  });

  // 모든 레코드의 상태를 업데이트 (과거 지급 예정일은 완료로)
  const updatedMerged = merged.map(updateStatusIfPast);

  return updatedMerged.sort(
    (a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime()
  );
}

export function summarizeSettlements(records: SettlementRecord[]): SettlementSummary {
  return records.reduce(
    (acc, record) => {
      acc.totalGross += record.grossAmount;
      acc.totalNet += record.netAmount;

      if (record.status === "completed") {
        acc.completedCount += 1;
      } else if (record.status === "delayed") {
        acc.delayedCount += 1;
      } else {
        acc.scheduledCount += 1;
      }

      return acc;
    },
    {
      totalGross: 0,
      totalNet: 0,
      scheduledCount: 0,
      completedCount: 0,
      delayedCount: 0,
    } as SettlementSummary
  );
}

export function buildSettlementTimeline(records: SettlementRecord[]) {
  const map = new Map<string, { scheduled: number; completed: number }>();

  records.forEach((record) => {
    const key = record.scheduledDate;
    if (!map.has(key)) {
      map.set(key, { scheduled: 0, completed: 0 });
    }
    const bucket = map.get(key)!;
    bucket.scheduled += record.netAmount;
    if (record.status === "completed") {
      bucket.completed += record.netAmount;
    }
  });

  const sorted = Array.from(map.entries()).sort(
    (a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime()
  );

  return sorted.map(([date, value]) => ({
    label: date,
    scheduled: value.scheduled,
    completed: value.completed,
  }));
}


