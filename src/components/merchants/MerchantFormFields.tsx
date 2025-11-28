"use client";

import { Icon } from "@hua-labs/ui";
import { useCommonCodes } from "@/hooks/useCommonCodes";
import { useTranslation } from "@hua-labs/i18n-core";

interface FormData {
  mchtName: string;
  bizType: string;
  bizNo: string;
  address: string;
  phone: string;
  email: string;
  status: string;
}

interface FormErrors {
  [key: string]: string;
}

interface MerchantFormFieldsProps {
  formData: FormData;
  errors: FormErrors;
  onChange: (field: keyof FormData, value: string) => void;
}

export function MerchantFormFields({
  formData,
  errors,
  onChange,
}: MerchantFormFieldsProps) {
  const { merchantStatuses } = useCommonCodes();
  const { t } = useTranslation();

  const bizTypes = [
    { code: "INDIVIDUAL", description: t("merchants:form.fields.bizTypeOptions.INDIVIDUAL") },
    { code: "CORPORATION", description: t("merchants:form.fields.bizTypeOptions.CORPORATION") },
    { code: "FREELANCER", description: t("merchants:form.fields.bizTypeOptions.FREELANCER") },
  ];

  return (
    <div className="space-y-6">
      {/* 가맹점명 */}
      <div>
        <label
          htmlFor="mchtName"
          className="mb-2 block text-sm font-medium text-[var(--text-strong)]"
        >
          {t("merchants:form.fields.mchtName")} <span className="text-red-500">*</span>
        </label>
        <input
          id="mchtName"
          type="text"
          value={formData.mchtName}
          onChange={(e) => onChange("mchtName", e.target.value)}
          className={`micro-input w-full ${errors.mchtName ? "border-red-500" : ""}`}
          placeholder={t("merchants:form.fields.mchtNamePlaceholder")}
        />
        {errors.mchtName && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.mchtName}</p>
        )}
      </div>

      {/* 사업자 유형 */}
      <div>
        <label
          htmlFor="bizType"
          className="mb-2 block text-sm font-medium text-[var(--text-strong)]"
        >
          {t("merchants:form.fields.bizType")} <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <select
            id="bizType"
            value={formData.bizType}
            onChange={(e) => onChange("bizType", e.target.value)}
            className={`micro-input w-full appearance-none rounded-lg border border-[var(--border-subtle)] bg-[var(--surface)] px-3 py-2 pr-9 text-sm font-medium text-[var(--text-strong)] transition-colors hover:border-brand-primary/50 focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 ${errors.bizType ? "border-red-500" : ""}`}
          >
            <option value="" className="bg-[var(--surface)] text-[var(--text-strong)]">{t("merchants:form.fields.select")}</option>
            {bizTypes.map((type) => (
              <option key={type.code} value={type.code} className="bg-[var(--surface)] text-[var(--text-strong)]">
                {type.description}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-muted)]">
            <Icon name="chevronDown" size={16} variant="secondary" />
          </div>
        </div>
        {errors.bizType && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.bizType}</p>
        )}
      </div>

      {/* 사업자 등록번호 */}
      <div>
        <label
          htmlFor="bizNo"
          className="mb-2 block text-sm font-medium text-[var(--text-strong)]"
        >
          {t("merchants:form.fields.bizNo")} <span className="text-red-500">*</span>
        </label>
        <input
          id="bizNo"
          type="text"
          value={formData.bizNo}
          onChange={(e) => onChange("bizNo", e.target.value.replace(/\D/g, ""))}
          className={`micro-input w-full ${errors.bizNo ? "border-red-500" : ""}`}
          placeholder={t("merchants:form.fields.bizNoPlaceholder")}
          maxLength={10}
        />
        {errors.bizNo && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.bizNo}</p>
        )}
      </div>

      {/* 주소 */}
      <div>
        <label
          htmlFor="address"
          className="mb-2 block text-sm font-medium text-[var(--text-strong)]"
        >
          {t("merchants:form.fields.address")} <span className="text-red-500">*</span>
        </label>
        <input
          id="address"
          type="text"
          value={formData.address}
          onChange={(e) => onChange("address", e.target.value)}
          className={`micro-input w-full ${errors.address ? "border-red-500" : ""}`}
          placeholder={t("merchants:form.fields.addressPlaceholder")}
        />
        {errors.address && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.address}</p>
        )}
      </div>

      {/* 전화번호 */}
      <div>
        <label
          htmlFor="phone"
          className="mb-2 block text-sm font-medium text-[var(--text-strong)]"
        >
          {t("merchants:form.fields.phone")} <span className="text-red-500">*</span>
        </label>
        <input
          id="phone"
          type="tel"
          value={formData.phone}
          onChange={(e) => onChange("phone", e.target.value)}
          className={`micro-input w-full ${errors.phone ? "border-red-500" : ""}`}
          placeholder={t("merchants:form.fields.phonePlaceholder")}
        />
        {errors.phone && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.phone}</p>
        )}
      </div>

      {/* 이메일 */}
      <div>
        <label
          htmlFor="email"
          className="mb-2 block text-sm font-medium text-[var(--text-strong)]"
        >
          {t("merchants:form.fields.email")} <span className="text-red-500">*</span>
        </label>
        <input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => onChange("email", e.target.value)}
          className={`micro-input w-full ${errors.email ? "border-red-500" : ""}`}
          placeholder={t("merchants:form.fields.emailPlaceholder")}
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
        )}
      </div>

      {/* 상태 */}
      <div>
        <label
          htmlFor="status"
          className="mb-2 block text-sm font-medium text-[var(--text-strong)]"
        >
          {t("merchants:form.fields.status")}
        </label>
        <div className="relative">
          <select
            id="status"
            value={formData.status}
            onChange={(e) => onChange("status", e.target.value)}
            className="micro-input w-full appearance-none rounded-lg border border-[var(--border-subtle)] bg-[var(--surface)] px-3 py-2 pr-9 text-sm font-medium text-[var(--text-strong)] transition-colors hover:border-brand-primary/50 focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
          >
            {merchantStatuses.map((status) => (
              <option key={status.code} value={status.code} className="bg-[var(--surface)] text-[var(--text-strong)]">
                {status.description}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-muted)]">
            <Icon name="chevronDown" size={16} variant="secondary" />
          </div>
        </div>
      </div>
    </div>
  );
}

