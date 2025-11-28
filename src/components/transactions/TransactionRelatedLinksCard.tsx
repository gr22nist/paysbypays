"use client";

import Link from "next/link";
import { SectionHeader } from "@hua-labs/ui";
import { useTranslation } from "@hua-labs/i18n-core";

interface TransactionRelatedLinksCardProps {
  mchtCode?: string;
}

export function TransactionRelatedLinksCard({ mchtCode }: TransactionRelatedLinksCardProps) {
  const { t } = useTranslation();
  
  return (
    <div className="bg-white rounded-xl border border-gray-200">
      <SectionHeader
        title={t("transactions:relatedLinks.title")}
        description={t("transactions:relatedLinks.description")}
      />
      <div className="p-6">
        <div className="flex flex-wrap gap-4">
          {mchtCode ? (
            <>
              <Link
                href={`/merchants/${mchtCode}`}
                className="px-4 py-2 text-sm text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {t("transactions:relatedLinks.merchantDetail")}
              </Link>
              <Link
                href={`/transactions?mchtCode=${encodeURIComponent(mchtCode)}`}
                className="px-4 py-2 text-sm text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {t("transactions:relatedLinks.merchantTransactions")}
              </Link>
            </>
          ) : (
            <Link
              href="/transactions"
              className="px-4 py-2 text-sm text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {t("transactions:relatedLinks.allTransactions")}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

