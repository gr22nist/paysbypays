"use client";

import { useMemo } from "react";
import { useTranslation } from "@hua-labs/i18n-core";
import { useTransactions } from "@/hooks/useTransactions";
import { useMerchants } from "@/hooks/useMerchants";
import { useTransactionSummary } from "@/hooks/useTransactionSummary";
import { useTransactionChart } from "@/hooks/useTransactionChart";
import { useCommonCodes } from "@/hooks/useCommonCodes";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { SystemHealthCard } from "@/components/health/SystemHealthCard";
import { useDisplayFormat } from "@/hooks/useDisplayFormat";
import { DashboardStatsPanel } from "@/components/dashboard/DashboardStatsPanel";
import { TransactionTrendChart } from "@/components/dashboard/TransactionTrendChart";
import { TopMerchantsList } from "@/components/dashboard/TopMerchantsList";
import { RecentTransactionsTable } from "@/components/dashboard/RecentTransactionsTable";
import { SettlementAlertCard } from "@/components/dashboard/SettlementAlertCard";
import { MerchantStatusSummary } from "@/components/dashboard/MerchantStatusSummary";

export default function Home() {
  const { t } = useTranslation();
  // 실제 API 호출 (대시보드에는 더 많은 데이터 표시)
  const { data: transactionsData, isLoading: transactionsLoading } = useTransactions({
    page: 0,
    size: 50, // 대시보드에는 더 많은 거래 표시
  });

  const { data: summaryData, isLoading: summaryLoading } = useTransactionSummary();

  // 가맹점 목록 로드 (가맹점 이름 매핑용)
  const { data: merchantsData } = useMerchants({ size: 1000 }); // 충분히 큰 사이즈로 전체 가맹점 로드

  // 가맹점 코드 -> 이름 매핑 생성
  const merchantNameMap = useMemo(() => {
    const map = new Map<string, string>();
    if (merchantsData?.content) {
      merchantsData.content.forEach((merchant) => {
        map.set(merchant.mchtCode, merchant.mchtName);
      });
    }
    return map;
  }, [merchantsData]);

  // 결제수단 매핑
  const { payTypes } = useCommonCodes();
  const payTypeMap = useMemo(() => {
    const map = new Map<string, string>();
    
    // 번역된 결제수단 매핑
    const localizedMapping: Record<string, string> = {
      CARD: t("transactions:payTypes.card"),
      MOBILE: t("transactions:payTypes.mobile"),
      ONLINE: t("transactions:payTypes.online"),
      DEVICE: t("transactions:payTypes.device"),
      BANK_TRANSFER: t("transactions:payTypes.bankTransfer"),
      VIRTUAL_ACCOUNT: t("transactions:payTypes.virtualAccount"),
      EASY_PAY: t("transactions:payTypes.easyPay"),
      SUBSCRIPTION: t("transactions:payTypes.subscription"),
    };

    Object.entries(localizedMapping).forEach(([type, label]) => {
      map.set(type.toUpperCase(), label);
    });

    // API description으로 보완 (번역에 없는 경우만)
    if (payTypes) {
      payTypes.forEach((pt) => {
        const upperType = pt.type.toUpperCase();
        if (!map.has(upperType) && pt.description) {
          map.set(upperType, pt.description);
        }
      });
    }
    
    return map;
  }, [payTypes, t]);

  // 총 거래 금액 계산 (summaryData 우선)
  const totalVolume = summaryData?.totalAmount ?? 0;

  // 거래 건수 계산
  const totalCount = summaryData?.totalCount ?? 0;

  // 승인률 계산
  const approvalRate = summaryData?.approvalRate ?? 0;

  // 평균 거래 금액 계산
  const averageAmount = summaryData?.averageAmount ?? (totalCount > 0 ? totalVolume / totalCount : 0);

  // 차트 데이터 생성
  const chartData = useTransactionChart(
    transactionsData?.content || [],
    "day"
  );

  // 가맹점별 통계 계산 (최다금액/최다승인)
  const merchantStats = useMemo(() => {
    if (!transactionsData?.content || transactionsData.content.length === 0) {
      return {
        topByAmount: [],
        topByApproval: [],
      };
    }

    // 가맹점별 집계
    const merchantMap = new Map<string, {
      mchtCode: string;
      mchtName: string;
      totalAmount: number;
      approvedCount: number;
      totalCount: number;
    }>();

    transactionsData.content.forEach((tx) => {
      // 한화(KRW) 통화만 집계
      const currency = (tx.currency || "").toUpperCase();
      if (currency !== "KRW") {
        return; // KRW가 아닌 통화는 제외
      }

      const mchtCode = tx.merchantId || "";
      const mchtName = tx.merchantName || merchantNameMap.get(mchtCode) || "Unknown";
      
      if (!merchantMap.has(mchtCode)) {
        merchantMap.set(mchtCode, {
          mchtCode,
          mchtName,
          totalAmount: 0,
          approvedCount: 0,
          totalCount: 0,
        });
      }

      const stats = merchantMap.get(mchtCode)!;
      stats.totalAmount += tx.amount || 0;
      stats.totalCount += 1;
      
      const status = (tx.status || "").toLowerCase();
      if (status === "success") {
        stats.approvedCount += 1;
      }
    });

    // 정렬
    const allMerchants = Array.from(merchantMap.values());
    const topByAmount = [...allMerchants]
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .slice(0, 5);
    
    const topByApproval = [...allMerchants]
      .sort((a, b) => b.approvedCount - a.approvedCount)
      .slice(0, 5);

    return {
      topByAmount,
      topByApproval,
    };
  }, [transactionsData, merchantNameMap]);

  const { formatCurrency, formatDateTime } = useDisplayFormat();
  const panelClass =
    "micro-card rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] shadow-sm";

  return (
    <DashboardLayout
      title={t("layout:pages.dashboard.title")}
      description={t("layout:pages.dashboard.description")}
      activeItem="dashboard"
    >
      <div className="flex flex-col gap-6">
        {/* 통계 요약 및 시스템 상태 - PC에서 2컬럼 */}
        <section className="grid gap-6 lg:grid-cols-2">
          <DashboardStatsPanel
            totalVolume={totalVolume}
            totalCount={totalCount}
            approvalRate={approvalRate}
            averageAmount={averageAmount}
            loading={summaryLoading || transactionsLoading}
            formatCurrency={formatCurrency}
            panelClass={panelClass}
          />
          <SystemHealthCard className={panelClass} />
        </section>

        <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <TransactionTrendChart
            series={chartData.series}
            categories={chartData.categories}
            loading={transactionsLoading}
            panelClass={panelClass}
          />

          <TopMerchantsList
            merchants={merchantStats.topByAmount}
            type="amount"
            loading={transactionsLoading}
            panelClass={panelClass}
          />

          <TopMerchantsList
            merchants={merchantStats.topByApproval}
            type="approval"
            loading={transactionsLoading}
            panelClass={panelClass}
          />
        </section>

        {/* 최근 거래 - 전체 폭 */}
        <section className="w-full">
          <RecentTransactionsTable
            transactions={transactionsData?.content || []}
            merchantNameMap={merchantNameMap}
            payTypeMap={payTypeMap}
            loading={transactionsLoading}
            formatCurrency={formatCurrency}
            formatDateTime={formatDateTime}
            panelClass={panelClass}
          />
        </section>

        {/* Phase 3: 정산 알림 및 가맹점 상태 */}
        <section className="grid gap-6 md:grid-cols-2">
          <SettlementAlertCard />
          <MerchantStatusSummary />
        </section>
      </div>
    </DashboardLayout>
  );
}
