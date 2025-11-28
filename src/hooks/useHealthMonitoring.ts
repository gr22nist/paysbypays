"use client";

import { useEffect } from "react";
import { useHealthStore } from "@/store/health-store";

export function useHealthMonitoring() {
  const startPolling = useHealthStore((state) => state.startPolling);
  const stopPolling = useHealthStore((state) => state.stopPolling);
  const manualRefresh = useHealthStore((state) => state.manualRefresh);

  useEffect(() => {
    startPolling();

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        manualRefresh();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      stopPolling();
    };
  }, [startPolling, stopPolling, manualRefresh]);
}


