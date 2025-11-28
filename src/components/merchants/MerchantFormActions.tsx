"use client";

import { useTranslation } from "@hua-labs/i18n-core";

interface MerchantFormActionsProps {
  isSubmitting: boolean;
  submitError?: string;
  onCancel: () => void;
}

export function MerchantFormActions({
  isSubmitting,
  submitError,
  onCancel,
}: MerchantFormActionsProps) {
  const { t } = useTranslation();
  
  return (
    <>
      {/* 제출 에러 */}
      {submitError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
          <p className="text-sm text-red-800 dark:text-red-200">{submitError}</p>
        </div>
      )}

      {/* 버튼 */}
      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="micro-button flex-1 rounded-lg border border-[var(--border-subtle)] px-4 py-2.5 text-sm font-medium text-[var(--text-strong)] hover:bg-[var(--surface-muted)]"
        >
          {t("common:actions.cancel")}
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="micro-button flex-1 rounded-lg bg-brand-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? t("merchants:form.actions.submitting") : t("merchants:form.actions.register")}
        </button>
      </div>
    </>
  );
}

