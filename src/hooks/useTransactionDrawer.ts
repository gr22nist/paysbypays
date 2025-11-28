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

