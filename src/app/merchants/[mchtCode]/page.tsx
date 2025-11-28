"use client";

import { useTranslation } from "@hua-labs/i18n-core";
import { useMerchant } from "@/hooks/useMerchant";
import { useTransactions } from "@/hooks/useTransactions";
import { useTransactionSummary } from "@/hooks/useTransactionSummary";
import { useMerchants } from "@/hooks/useMerchants";
import { Sidebar } from "@/components/layout/Sidebar";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { TransactionDetailDrawer } from "@/components/transactions/TransactionDetailDrawer";
import { useTransactionDrawer } from "@/hooks/useTransactionDrawer";
import type { Transaction } from "@/lib/api/types";
import { MerchantDetailStatsPanel } from "@/components/merchants/MerchantDetailStatsPanel";
import { MerchantBasicInfoCard } from "@/components/merchants/MerchantBasicInfoCard";
import { MerchantContactInfoCard } from "@/components/merchants/MerchantContactInfoCard";
import { MerchantTransactionsTable } from "@/components/merchants/MerchantTransactionsTable";

export default function MerchantDetailPage() {
  const { t } = useTranslation();
  const params = useParams();
  const mchtCode = params.mchtCode as string;
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 20;
  const { selectedTransaction, drawerOpen, openDrawer, closeDrawer } = useTransactionDrawer();

  const { data: merchant, isLoading: merchantLoading, error: merchantError } = useMerchant(mchtCode);

  const { data: merchantsData } = useMerchants({ page: 0, size: 1000 });
  const merchantNameMap = useMemo(() => {
    if (!merchantsData?.content) return new Map();
    return new Map(merchantsData.content.map((m) => [m.mchtCode, m.mchtName]));
  }, [merchantsData]);

  const { data: summaryData, isLoading: summaryLoading } = useTransactionSummary({
    mchtCode: mchtCode,
  });

  const { data: transactionsData, isLoading: transactionsLoading } = useTransactions({
    page: currentPage,
    size: pageSize,
    mchtCode: mchtCode,
  });

  type TransactionWithMchtCode = Transaction & { mchtCode?: string; merchantId?: string };

  const merchantTransactions = useMemo(() => {
    if (!transactionsData?.content) return [] as TransactionWithMchtCode[];
    return (transactionsData.content as TransactionWithMchtCode[]).filter((tx) => {
      const txMchtCode = tx.mchtCode || tx.merchantId || "";
      return txMchtCode === mchtCode;
    });
  }, [transactionsData, mchtCode]);

  const stats = useMemo(() => {
    if (summaryData && summaryData.totalCount !== undefined) {
      return {
        totalTransactions: summaryData.totalCount,
        totalAmount: summaryData.totalAmount,
        approvedCount: summaryData.approvedCount,
        failedCount: summaryData.failedCount,
      };
    }

    const totalAmount = merchantTransactions.reduce((acc, tx) => acc + (tx.amount || 0), 0);
    const approvedCount = merchantTransactions.filter((tx) => {
      const status = (tx.status || "").toLowerCase();
      return status === "success" || status === "approved";
    }).length;
    const failedCount = merchantTransactions.filter((tx) => {
      const status = (tx.status || "").toLowerCase();
      return status.includes("fail") || status === "failed";
    }).length;

    return {
      totalTransactions: merchantTransactions.length,
      totalAmount,
      approvedCount,
      failedCount,
    };
  }, [summaryData, merchantTransactions]);

  const approvalRate = stats.totalTransactions > 0 
    ? (stats.approvedCount / stats.totalTransactions) * 100 
    : 0;

  // 거래 내역 데이터 변환 및 필터링 (해당 가맹점만 표시)
  const transactionListData = useMemo(() => {
    return merchantTransactions.map((tx) => {
      const status = (tx.status || "").toLowerCase();
      let mappedStatus: "approved" | "pending" | "failed" = "pending";
      if (status === "success" || status === "approved") {
        mappedStatus = "approved";
      } else if (status === "failed" || status.includes("fail")) {
        mappedStatus = "failed";
      }

      // Transaction 타입에서 merchantId 또는 mchtCode 추출
      const txMchtCode = tx.mchtCode || tx.merchantId || "";
      const merchantName = merchantNameMap.get(txMchtCode) || merchant?.mchtName || "Unknown";

      return {
        id: tx.id || "",
        merchant: merchantName,
        amount: tx.amount || 0,
        currency: tx.currency || "KRW",
        status: mappedStatus,
        method: tx.payType || tx.paymentMethod || "",
        date: tx.createdAt || new Date().toISOString(),
        customer: tx.customerName || "",
      };
    });
  }, [merchantTransactions, merchantNameMap, merchant, mchtCode]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* 고정 사이드바 */}
      <div className="sticky top-0 h-screen overflow-y-auto">
        <Sidebar activeItem="merchants" />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">{merchant?.mchtName || t("merchants:drawer.title")}</h1>
          <p className="text-sm text-gray-500 mt-1">{merchant?.mchtCode || ""}</p>
        </div>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
          {merchantLoading ? (
            <div className="space-y-6">
              <div className="micro-card rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] p-6">
                <div className="h-6 w-32 mb-4 bg-[var(--surface-muted)] rounded animate-pulse" />
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex flex-col gap-2">
                      <div className="h-3 w-16 bg-[var(--surface-muted)] rounded animate-pulse" />
                      <div className="h-8 w-24 bg-[var(--surface-muted)] rounded animate-pulse" />
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                {[1, 2].map((i) => (
                  <div key={i} className="micro-card rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] p-6">
                    <div className="h-5 w-24 mb-4 bg-[var(--surface-muted)] rounded animate-pulse" />
                    <div className="space-y-3">
                      {[1, 2, 3, 4].map((j) => (
                        <div key={j} className="flex flex-col gap-1.5">
                          <div className="h-3 w-20 bg-[var(--surface-muted)] rounded animate-pulse" />
                          <div className="h-4 w-full bg-[var(--surface-muted)] rounded animate-pulse" />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : merchantError ? (
            <div className="text-center py-8">
              <p className="text-red-600 mb-2">{t("common:states.loadingError")}</p>
              <p className="text-gray-500 text-sm">{merchantError.message}</p>
            </div>
          ) : !merchant ? (
            <div className="text-center text-gray-500 py-8">
              {t("merchants:page.notFound")}
            </div>
          ) : (
            <>
              <MerchantDetailStatsPanel
                stats={stats}
                merchantName={merchant.mchtName}
                approvalRate={approvalRate}
                loading={summaryLoading || transactionsLoading}
              />

              {merchant && (
                <div className="grid gap-5 md:grid-cols-2 mb-6">
                  <MerchantBasicInfoCard merchant={merchant} />
                  <MerchantContactInfoCard merchant={merchant} />
                </div>
              )}

              <MerchantTransactionsTable
                transactions={transactionListData}
                mchtCode={mchtCode}
                loading={transactionsLoading}
                currentPage={currentPage}
                totalPages={transactionsData?.totalPages || 1}
                onPageChange={setCurrentPage}
                onTransactionClick={openDrawer}
              />
            </>
          )}
          </div>
        </main>
      </div>

      <TransactionDetailDrawer
        open={drawerOpen}
        onOpenChange={closeDrawer}
        transaction={selectedTransaction}
      />
    </div>
  );
}

