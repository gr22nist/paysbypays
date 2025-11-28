"use client";

import { useState, useCallback } from "react";
import { useTranslation } from "@hua-labs/i18n-core";

export interface MerchantFormData {
  mchtName: string;
  bizType: string;
  bizNo: string;
  address: string;
  phone: string;
  email: string;
  status: string;
}

export interface MerchantFormErrors {
  [key: string]: string;
}

// 사업자 등록번호 유효성 검사 (간단한 형식 체크)
const validateBizNo = (bizNo: string): boolean => {
  // 숫자만 허용, 10자리
  return /^\d{10}$/.test(bizNo.replace(/-/g, ""));
};

// 전화번호 유효성 검사
const validatePhone = (phone: string): boolean => {
  // 한국 전화번호 형식: 010-1234-5678 또는 02-123-4567 등
  return /^[\d-]+$/.test(phone) && phone.replace(/-/g, "").length >= 9;
};

// 이메일 유효성 검사
const validateEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export function useMerchantForm() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<MerchantFormData>({
    mchtName: "",
    bizType: "",
    bizNo: "",
    address: "",
    phone: "",
    email: "",
    status: "ACTIVE",
  });

  const [errors, setErrors] = useState<MerchantFormErrors>({});

  const validateForm = useCallback((): boolean => {
    const newErrors: MerchantFormErrors = {};

    if (!formData.mchtName.trim()) {
      newErrors.mchtName = t("merchants:form.errors.mchtNameRequired");
    }

    if (!formData.bizType) {
      newErrors.bizType = t("merchants:form.errors.bizTypeRequired");
    }

    if (!formData.bizNo.trim()) {
      newErrors.bizNo = t("merchants:form.errors.bizNoRequired");
    } else if (!validateBizNo(formData.bizNo)) {
      newErrors.bizNo = t("merchants:form.errors.bizNoInvalid");
    }

    if (!formData.address.trim()) {
      newErrors.address = t("merchants:form.errors.addressRequired");
    }

    if (!formData.phone.trim()) {
      newErrors.phone = t("merchants:form.errors.phoneRequired");
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = t("merchants:form.errors.phoneInvalid");
    }

    if (!formData.email.trim()) {
      newErrors.email = t("merchants:form.errors.emailRequired");
    } else if (!validateEmail(formData.email)) {
      newErrors.email = t("merchants:form.errors.emailInvalid");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, t]);

  const handleChange = useCallback((field: keyof MerchantFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // 필드 변경 시 해당 필드의 에러 제거
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const setError = useCallback((field: string, message: string) => {
    setErrors((prev) => ({ ...prev, [field]: message }));
  }, []);

  const resetForm = useCallback(() => {
    setFormData({
      mchtName: "",
      bizType: "",
      bizNo: "",
      address: "",
      phone: "",
      email: "",
      status: "ACTIVE",
    });
    setErrors({});
  }, []);

  return {
    formData,
    errors,
    validateForm,
    handleChange,
    setError,
    resetForm,
  };
}

