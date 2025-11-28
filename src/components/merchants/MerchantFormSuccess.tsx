"use client";

import { Icon } from "@hua-labs/ui";

interface MerchantFormSuccessProps {
  panelClass: string;
}

export function MerchantFormSuccess({ panelClass }: MerchantFormSuccessProps) {
  return (
    <div className={panelClass}>
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/20">
          <Icon name="check" size={32} className="text-emerald-600 dark:text-emerald-400" />
        </div>
        <h2 className="mb-2 text-xl font-semibold text-[var(--text-strong)]">
          가맹점 등록이 완료되었습니다
        </h2>
        <p className="text-sm text-[var(--text-muted)]">
          가맹점 목록 페이지로 이동합니다...
        </p>
      </div>
    </div>
  );
}

