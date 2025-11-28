"use client";

import { ConfirmModal } from "@hua-labs/ui";
import { useTranslation } from "@hua-labs/i18n-core";

interface LogoutConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function LogoutConfirmModal({
  open,
  onOpenChange,
  onConfirm,
}: LogoutConfirmModalProps) {
  const { t } = useTranslation();

  const handleConfirm = () => {
    // Mock 로그아웃 (장식용)
    onConfirm();
    onOpenChange(false);
  };

  return (
    <div className="logout-modal-wrapper">
      <ConfirmModal
        isOpen={open}
        onClose={() => onOpenChange(false)}
        onConfirm={handleConfirm}
        title={t("common:logout.title")}
        message={t("common:logout.message")}
        confirmText={t("common:logout.confirm")}
        cancelText={t("common:actions.cancel")}
        type="danger"
      />
    </div>
  );
}

