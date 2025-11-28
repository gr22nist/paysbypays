import { useMemo, useState, useEffect } from "react";
import type { Transaction } from "@/lib/api/types";

type SortField = "id" | "merchant" | "amount" | "status" | "paymentMethod" | "createdAt";
type SortDirection = "asc" | "desc" | null;

interface UseTransactionTableOptions {
  transactions: Transaction[];
  merchantNameMap: Map<string, string>;
  mchtCodeFilter?: string;
  transactionPayType?: string;
  transactionStatus?: string;
  initialPageSize?: number;
}

interface UseTransactionTableReturn {
  sortField: SortField | null;
  sortDirection: SortDirection;
  handleSort: (field: SortField) => void;
  currentPage: number;
  pageSize: number;
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;
  filteredTransactions: Transaction[];
  paginatedTransactions: Transaction[];
  totalTransactions: number;
  totalPages: number;
  displayStart: number;
  displayEnd: number;
  normalizedPage: number;
}

export function useTransactionTable({
  transactions,
  merchantNameMap,
  mchtCodeFilter,
  transactionPayType,
  transactionStatus,
  initialPageSize = 25,
}: UseTransactionTableOptions): UseTransactionTableReturn {
  const [sortField, setSortField] = useState<SortField | null>("createdAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const filteredByMerchant = useMemo(() => {
    if (!mchtCodeFilter) return transactions;
    
    type TransactionWithMchtCode = Transaction & { mchtCode?: string };
    
    return (transactions as TransactionWithMchtCode[]).filter((tx) => {
      const txMchtCode = tx.mchtCode || tx.merchantId || "";
      return txMchtCode === mchtCodeFilter;
    });
  }, [transactions, mchtCodeFilter]);

  const finalFilteredTransactions = useMemo(() => {
    let filtered = filteredByMerchant.filter((tx) => {
      if (transactionStatus) {
        const txStatus = (tx.status || "").toLowerCase();
        const filterStatus = transactionStatus.toLowerCase();
        if (txStatus !== filterStatus && !txStatus.includes(filterStatus) && !filterStatus.includes(txStatus)) {
          return false;
        }
      }

      if (transactionPayType) {
        const payType = (tx.paymentMethod || tx.payType || "").toLowerCase();
        const filterPayType = transactionPayType.toLowerCase();
        if (payType !== filterPayType && !payType.includes(filterPayType) && !filterPayType.includes(payType)) {
          return false;
        }
      }
      return true;
    });

    if (sortField && sortDirection) {
      filtered = [...filtered].sort((a, b) => {
        let aValue: string | number = "";
        let bValue: string | number = "";

        switch (sortField) {
          case "id":
            aValue = a.id || "";
            bValue = b.id || "";
            break;
          case "merchant":
            aValue = a.merchantName || (a.merchantId ? merchantNameMap.get(a.merchantId) : "") || "";
            bValue = b.merchantName || (b.merchantId ? merchantNameMap.get(b.merchantId) : "") || "";
            break;
          case "amount":
            aValue = a.amount || 0;
            bValue = b.amount || 0;
            break;
          case "status":
            aValue = a.status || "";
            bValue = b.status || "";
            break;
          case "paymentMethod":
            aValue = a.paymentMethod || a.payType || "";
            bValue = b.paymentMethod || b.payType || "";
            break;
          case "createdAt":
            aValue = new Date(a.createdAt || 0).getTime();
            bValue = new Date(b.createdAt || 0).getTime();
            break;
        }

        if (typeof aValue === "string" && typeof bValue === "string") {
          const comparison = aValue.localeCompare(bValue);
          return sortDirection === "asc" ? comparison : -comparison;
        } else {
          const comparison = (aValue as number) - (bValue as number);
          return sortDirection === "asc" ? comparison : -comparison;
        }
      });
    } else {
      filtered = [...filtered].sort((a, b) => {
        const aTime = new Date(a.createdAt || 0).getTime();
        const bTime = new Date(b.createdAt || 0).getTime();
        return bTime - aTime;
      });
    }

    return filtered;
  }, [filteredByMerchant, transactionPayType, transactionStatus, sortField, sortDirection, merchantNameMap]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else if (sortDirection === "desc") {
        setSortField(null);
        setSortDirection(null);
      } else {
        setSortDirection("asc");
      }
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
    setCurrentPage(0);
  };

  const totalTransactions = finalFilteredTransactions.length;
  const totalPages = Math.max(1, Math.ceil(Math.max(totalTransactions, 1) / pageSize));
  const normalizedPage = Math.min(currentPage, totalPages - 1);
  const pageStart = totalTransactions === 0 ? 0 : normalizedPage * pageSize;
  const pageEnd = totalTransactions === 0 ? 0 : Math.min(pageStart + pageSize, totalTransactions);
  const displayStart = totalTransactions === 0 ? 0 : pageStart + 1;
  const     displayEnd = totalTransactions === 0 ? 0 : pageEnd;

  useEffect(() => {
    if (currentPage === normalizedPage) return;
    const frame = requestAnimationFrame(() => setCurrentPage(normalizedPage));
    return () => cancelAnimationFrame(frame);
  }, [currentPage, normalizedPage]);

  const paginatedTransactions = useMemo(
    () => finalFilteredTransactions.slice(pageStart, pageEnd),
    [finalFilteredTransactions, pageStart, pageEnd]
  );

  return {
    sortField,
    sortDirection,
    handleSort,
    currentPage,
    pageSize,
    setCurrentPage,
    setPageSize,
    filteredTransactions: finalFilteredTransactions,
    paginatedTransactions,
    totalTransactions,
    totalPages,
    displayStart,
    displayEnd,
    normalizedPage,
  };
}

