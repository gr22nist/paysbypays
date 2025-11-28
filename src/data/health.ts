import type { RawHealthResponse, RawHealthGroup } from "@/lib/health/normalize";
import type { HealthStatus } from "@/types/health";

export const mockHealthResponse: RawHealthResponse = {
  timestamp: "2025-11-27T00:00:00.000Z",
  version: "mock-1.0",
  message: "Mock health payload for offline development",
  groups: {
    transactions: {
      status: "healthy",
      latencyMs: 420,
      lastCheckedAt: "2025-11-27T00:00:00.000Z",
    },
    merchants: {
      status: "degraded",
      latencyMs: 980,
      lastCheckedAt: "2025-11-27T00:00:00.000Z",
      message: "health:messages.merchantApiSlow",
    },
    "common-codes": {
      status: "healthy",
      latencyMs: 380,
      lastCheckedAt: "2025-11-27T00:00:00.000Z",
    },
    proxy: {
      status: "healthy",
      latencyMs: 110,
      lastCheckedAt: "2025-11-27T00:00:00.000Z",
    },
  },
};

const DEFAULT_GROUP_IDS = ["transactions", "merchants", "common-codes", "proxy"];

const STATUS_CHOICES: Array<{ status: HealthStatus; weight: number }> = [
  { status: "healthy", weight: 0.6 },
  { status: "degraded", weight: 0.25 },
  { status: "down", weight: 0.1 },
  { status: "unknown", weight: 0.05 },
];

const STATUS_MESSAGES: Record<Exclude<HealthStatus, "healthy">, string> = {
  degraded: "health:messages.responseDelay",
  down: "health:messages.noResponse",
  unknown: "health:messages.needsCheck",
};

const randomBetween = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

function pickStatus() {
  const roll = Math.random();
  let cumulative = 0;
  for (const choice of STATUS_CHOICES) {
    cumulative += choice.weight;
    if (roll <= cumulative) {
      return choice.status;
    }
  }
  return "healthy";
}

function randomLatency(status: HealthStatus) {
  if (status === "healthy") return randomBetween(120, 720);
  if (status === "degraded") return randomBetween(820, 1600);
  if (status === "down") return randomBetween(1800, 4200);
  return undefined;
}

function randomMessage(status: HealthStatus): string | undefined {
  if (status === "healthy") return undefined;
  return STATUS_MESSAGES[status as Exclude<HealthStatus, "healthy">];
}

export function generateRandomHealthResponse(
  seed: RawHealthResponse = mockHealthResponse
): RawHealthResponse {
  const timestamp = new Date().toISOString();
  const baseGroups = seed.groups ?? {};
  const groups: Record<string, RawHealthGroup> = {};

  const groupIds = new Set([
    ...DEFAULT_GROUP_IDS,
    ...Object.keys(baseGroups),
  ]);

  groupIds.forEach((id) => {
    const status = pickStatus();
    groups[id] = {
      status,
      latencyMs: randomLatency(status),
      lastCheckedAt: timestamp,
      message: randomMessage(status),
    };
  });

  return {
    ...seed,
    timestamp,
    version: "mock-random",
    message: "Randomized mock payload",
    groups,
  };
}

