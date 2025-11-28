import { create } from "zustand";
import type { DatePreset } from "@/types/date-preset";

interface FilterState {
  selectedDatePreset: DatePreset | null;
  setSelectedDatePreset: (preset: DatePreset) => void;
  
  // 거래 내역 필터
  transactionStatus: string | undefined;
  transactionPayType: string | undefined;
  setTransactionStatus: (status: string | undefined) => void;
  setTransactionPayType: (payType: string | undefined) => void;
  resetTransactionFilters: () => void;
  
  // 가맹점 필터
  merchantSearchQuery: string;
  merchantStatus: string | undefined;
  setMerchantSearchQuery: (query: string) => void;
  setMerchantStatus: (status: string | undefined) => void;
  resetMerchantFilters: () => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  selectedDatePreset: null,
  setSelectedDatePreset: (preset) => set({ selectedDatePreset: preset }),
  
  transactionStatus: undefined,
  transactionPayType: undefined,
  setTransactionStatus: (status) => set({ transactionStatus: status }),
  setTransactionPayType: (payType) => set({ transactionPayType: payType }),
  resetTransactionFilters: () => set({ transactionStatus: undefined, transactionPayType: undefined }),
  
  merchantSearchQuery: "",
  merchantStatus: undefined,
  setMerchantSearchQuery: (query) => set({ merchantSearchQuery: query }),
  setMerchantStatus: (status) => set({ merchantStatus: status }),
  resetMerchantFilters: () => set({ merchantSearchQuery: "", merchantStatus: undefined }),
}));

