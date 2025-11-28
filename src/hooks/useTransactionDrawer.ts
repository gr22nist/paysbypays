import { useState } from "react";
import type { Transaction } from "@/lib/api/types";

interface UseTransactionDrawerReturn {
  selectedTransaction: Transaction | null;
  drawerOpen: boolean;
  openDrawer: (transaction: Transaction) => void;
  closeDrawer: () => void;
  setDrawerOpen: (open: boolean) => void;
}

export function useTransactionDrawer(): UseTransactionDrawerReturn {
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const openDrawer = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    // Drawer가 닫힌 후 약간의 지연을 두고 선택된 거래를 초기화
    // (애니메이션이 완료될 시간을 줌)
    setTimeout(() => {
      setSelectedTransaction(null);
    }, 200);
  };

  return {
    selectedTransaction,
    drawerOpen,
    openDrawer,
    closeDrawer,
    setDrawerOpen,
  };
}

