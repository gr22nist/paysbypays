"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo } from "react";
import { useTranslation } from "@hua-labs/i18n-core";
import { useTransactions } from "@/hooks/useTransactions";
import { useMerchant } from "@/hooks/useMerchant";
import { Sidebar } from "@/components/layout/Sidebar";
import type { Transaction } from "@/lib/api/types";
import { TransactionBasicInfoCard } from "@/components/transactions/TransactionBasicInfoCard";
import { TransactionMerchantInfoCard } from "@/components/transactions/TransactionMerchantInfoCard";
import { TransactionRelatedLinksCard } from "@/components/transactions/TransactionRelatedLinksCard";

export default function TransactionDetailPage() {
  const { t } = useTranslation();
  const params = useParams();
  const router = useRouter();
  const transactionId = params.id as string;

  const { data: transactionsData, isLoading, error } = useTransactions({
    page: 0,
    size: 1000,
  });

  const transaction = useMemo(() => {
    if (!transactionsData?.content) return null;
    return transactionsData.content.find((tx) => tx.id === transactionId);
  }, [transactionsData, transactionId]);

  type TransactionWithMchtCode = Transaction & { mchtCode?: string };
  
  const transactionWithMchtCode = transaction as TransactionWithMchtCode | null;
  const mchtCode = transactionWithMchtCode?.mchtCode || transaction?.merchantId;
  const { data: merchant, isLoading: merchantLoading } = useMerchant(mchtCode || "");

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* 고정 사이드바 */}
      <div className="sticky top-0 h-screen overflow-y-auto">
        <Sidebar activeItem="transactions" />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 헤더 */}
        <div className="p-6 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <button
                onClick={() => router.back()}
                className="text-sm text-gray-600 hover:text-gray-900 mb-2"
              >
                ← {t("common:actions.back")}
              </button>
              <h1 className="text-2xl font-bold text-gray-900">{t("transactions:detail.title")}</h1>
              <p className="text-sm text-gray-500 mt-1">{t("transactions:detail.transactionCode")}: {transactionId}</p>
            </div>
            <Link
              href="/transactions"
              className="text-sm text-brand-primary hover:text-brand-primary-dark"
            >
              {t("transactions:page.viewAll")} →
            </Link>
          </div>
        </div>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
          {isLoading ? (
            <div className="space-y-6">
              <div className="micro-card rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] p-6">
                <div className="h-6 w-32 mb-4 bg-[var(--surface-muted)] rounded animate-pulse" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="flex flex-col gap-1.5">
                      <div className="h-3 w-20 bg-[var(--surface-muted)] rounded animate-pulse" />
                      <div className="h-4 w-full bg-[var(--surface-muted)] rounded animate-pulse" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600 mb-2">{t("common:states.loadingError")}</p>
              <p className="text-gray-500 text-sm">{error.message}</p>
            </div>
          ) : !transaction ? (
            <div className="text-center py-12">
              <p className="text-gray-900 mb-2">{t("transactions:page.notFound")}</p>
              <p className="text-gray-500 text-sm mb-4">{t("transactions:page.checkCode")}</p>
              <Link
                href="/transactions"
                className="text-sm text-brand-primary hover:text-brand-primary-dark"
              >
                {t("transactions:page.viewAll")} →
              </Link>
            </div>
          ) : (
            <>
              <TransactionBasicInfoCard transaction={transaction} />

              <TransactionMerchantInfoCard
                merchant={merchant || null}
                mchtCode={mchtCode || ""}
                loading={merchantLoading}
              />

              <TransactionRelatedLinksCard mchtCode={mchtCode} />
            </>
          )}
          </div>
        </main>
      </div>
    </div>
  );
}

