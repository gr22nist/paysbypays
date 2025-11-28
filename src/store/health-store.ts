"use client";

import { create } from "zustand";
import { healthApi } from "@/lib/api/client";
import {
  normalizeHealthResponse,
  type RawHealthResponse,
} from "@/lib/health/normalize";
import type {
  HealthGroup,
  HealthSnapshot,
  HealthStatus,
  NormalizedHealthPayload,
} from "@/types/health";
import { mockHealthResponse, generateRandomHealthResponse } from "@/data/health";

type PollStatus = "idle" | "running" | "error";

interface HealthBanner {
  level: "warning" | "error";
  message: string;
  timestamp: string;
}

interface HealthState {
  groups: Record<string, HealthGroup>;
  snapshotHistory: HealthSnapshot[];
  overallStatus: HealthStatus;
  lastUpdated?: string;
  lastSuccessfulFetch?: string;
  pollingStatus: PollStatus;
  lastError?: string;
  banner: HealthBanner | null;
  startPolling: () => void;
  stopPolling: () => void;
  manualRefresh: () => Promise<void>;
  dismissBanner: () => void;
}

const POLL_INTERVAL = 30_000;
const SNAPSHOT_LIMIT = 24;

let pollTimer: ReturnType<typeof setInterval> | null = null;

function deriveBanner(status: HealthStatus, timestamp: string): HealthBanner | null {
  if (status === "down") {
    return {
      level: "error",
      message: "health:banner.down",
      timestamp,
    };
  }
  if (status === "degraded") {
    return {
      level: "warning",
      message: "health:banner.degraded",
      timestamp,
    };
  }
  return null;
}

function extractHealthPayload(value: unknown): RawHealthResponse | null {
  if (value && typeof value === "object") {
    if ("data" in (value as Record<string, unknown>)) {
      const candidate = (value as { data?: unknown }).data;
      if (candidate && typeof candidate === "object") {
        return candidate as RawHealthResponse;
      }
    }
    return value as RawHealthResponse;
  }
  return null;
}

export const useHealthStore = create<HealthState>((set) => {
  const ingestPayload = (
    payload: NormalizedHealthPayload,
    source: "live" | "mock"
  ) => {
    set((state) => {
      const history = [payload.snapshot, ...state.snapshotHistory].slice(
        0,
        SNAPSHOT_LIMIT
      );
      const banner = deriveBanner(payload.overallStatus, payload.timestamp);

      return {
        groups: payload.groups,
        snapshotHistory: history,
        overallStatus: payload.overallStatus,
        lastUpdated: payload.timestamp,
        lastSuccessfulFetch:
          source === "live" ? payload.timestamp : state.lastSuccessfulFetch,
        pollingStatus: "running",
        banner: banner ?? (payload.overallStatus === "healthy" ? null : state.banner),
        lastError: undefined,
      };
    });
  };

  const fetchHealth = async () => {
    try {
      const response = await healthApi.check();
      const payload = extractHealthPayload(response);
      const normalized = normalizeHealthResponse(payload);
      ingestPayload(normalized, "live");
    } catch (error) {
      console.warn("Health polling failed, using mock payload", error);
      const fallbackRaw: RawHealthResponse =
        generateRandomHealthResponse(mockHealthResponse);
      const normalized = normalizeHealthResponse(fallbackRaw);
      ingestPayload(normalized, "mock");
      set({
        pollingStatus: "error",
        lastError:
          error instanceof Error ? error.message : "health:errors.unknown",
      });
    }
  };

  const startPolling = () => {
    if (pollTimer) return;
    fetchHealth();
    pollTimer = setInterval(fetchHealth, POLL_INTERVAL);
    set({ pollingStatus: "running" });
  };

  const stopPolling = () => {
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
    set({ pollingStatus: "idle" });
  };

  return {
    groups: {},
    snapshotHistory: [],
    overallStatus: "unknown",
    pollingStatus: "idle",
    banner: null,
    startPolling,
    stopPolling,
    manualRefresh: async () => {
      await fetchHealth();
    },
    dismissBanner: () => set({ banner: null }),
  };
});


