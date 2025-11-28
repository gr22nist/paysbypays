"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@hua-labs/i18n-core";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { SectionHeaderBlock } from "@/components/sections/SectionHeaderBlock";
import { MerchantFormFields } from "@/components/merchants/MerchantFormFields";
import { MerchantFormSuccess } from "@/components/merchants/MerchantFormSuccess";
import { MerchantFormActions } from "@/components/merchants/MerchantFormActions";
import { useMerchantForm } from "@/hooks/useMerchantForm";

export default function NewMerchantPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { formData, errors, validateForm, handleChange, setError } = useMerchantForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    // Mock API 호출 시뮬레이션
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // 성공 처리
      setSubmitSuccess(true);
      setTimeout(() => {
        router.push("/merchants");
      }, 2000);
    } catch (error) {
      setError("submit", t("merchants:page.register.error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const panelClass =
    "micro-card rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] shadow-sm";

  if (submitSuccess) {
    return (
      <DashboardLayout
        title={t("merchants:page.register.title")}
        description={t("merchants:page.register.description")}
        activeItem="merchants"
      >
        <MerchantFormSuccess panelClass={panelClass} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title={t("merchants:page.register.title")}
      description={t("merchants:page.register.description")}
      activeItem="merchants"
    >
      <div className="flex flex-col gap-6">
        <div className={panelClass}>
          <SectionHeaderBlock
            title={t("merchants:page.register.formTitle")}
            description={t("merchants:page.register.formDescription")}
            containerClassName="px-6 pt-6"
          />
          <form onSubmit={handleSubmit} className="px-6 pb-6 pt-4">
            <MerchantFormFields
              formData={formData}
              errors={errors}
              onChange={handleChange}
            />
            <MerchantFormActions
              isSubmitting={isSubmitting}
              submitError={errors.submit}
              onCancel={() => router.back()}
            />
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}

