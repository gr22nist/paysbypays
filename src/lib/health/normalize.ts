import type {
  HealthGroup,
  HealthStatus,
  NormalizedHealthPayload,
} from "@/types/health";

export type RawHealthGroup = {
  status?: string;
  state?: string;
  latency?: number;
  latencyMs?: number;
  responseTime?: number;
  lastChecked?: string;
  lastCheckedAt?: string;
  checkedAt?: string;
  message?: string;
  details?: string;
  error?: string;
};

export type RawHealthResponse = {
  status?: string;
  message?: string;
  timestamp?: string;
  updatedAt?: string;
  version?: string;
  groups?: Record<string, RawHealthGroup>;
  services?: Record<string, RawHealthGroup>;
};

const STATUS_MAP: Record<string, HealthStatus> = {
  healthy: "healthy",
  ok: "healthy",
  up: "healthy",
  normal: "healthy",
  pass: "healthy",
  green: "healthy",
  degraded: "degraded",
  warning: "degraded",
  warn: "degraded",
  slow: "degraded",
  amber: "degraded",
  down: "down",
  error: "down",
  failed: "down",
  critical: "down",
  red: "down",
};

const DEFAULT_GROUPS: Array<{ id: string; labelKey: string }> = [
  { id: "transactions", labelKey: "health:groups.transactions" },
  { id: "merchants", labelKey: "health:groups.merchants" },
  { id: "common-codes", labelKey: "health:groups.commonCodes" },
  { id: "commonCodes", labelKey: "health:groups.commonCodes" },
  { id: "proxy", labelKey: "health:groups.proxy" },
];

// ID를 번역 키로 매핑하는 헬퍼 함수
function getGroupLabelKey(id: string): string {
  const group = DEFAULT_GROUPS.find((g) => g.id === id);
  if (group) return group.labelKey;
  
  // common-codes와 commonCodes 모두 지원
  if (id === "common-codes" || id === "commonCodes") {
    return "health:groups.commonCodes";
  }
  
  // 기본값: id를 기반으로 번역 키 생성 시도
  return `health:groups.${id}`;
}

// fallback 라벨 (번역 실패 시 사용)
const FALLBACK_LABELS: Record<string, string> = {
  transactions: "거래 API",
  merchants: "가맹점 API",
  "common-codes": "공통 코드 API",
  proxy: "API 프록시",
};

const MOCK_LATENCY: Record<string, number> = {
  transactions: 480,
  merchants: 620,
  "common-codes": 410,
  proxy: 95,
};

function normalizeStatus(value?: string): HealthStatus {
  if (!value) return "unknown";
  const normalized = value.toLowerCase();
  return STATUS_MAP[normalized] ?? "unknown";
}

function resolveLatency(raw?: RawHealthGroup): number | undefined {
  const latency =
    raw?.latencyMs ??
    raw?.latency ??
    raw?.responseTime ??
    undefined;
  return typeof latency === "number" && latency >= 0 ? latency : undefined;
}

function resolveTimestamp(fallback: string, raw?: RawHealthGroup): string {
  return (
    raw?.lastCheckedAt ??
    raw?.lastChecked ??
    raw?.checkedAt ??
    fallback
  );
}

function resolveMessage(raw?: RawHealthGroup): string | undefined {
  return raw?.message ?? raw?.details ?? raw?.error ?? undefined;
}

function buildGroup(
  id: string,
  label: string,
  raw: RawHealthGroup | undefined,
  fallbackTimestamp: string
): HealthGroup {
  const status = normalizeStatus(raw?.status ?? raw?.state);
  return {
    id,
    label,
    status,
    latencyMs: resolveLatency(raw),
    lastCheckedAt: resolveTimestamp(fallbackTimestamp, raw),
    message: resolveMessage(raw),
  };
}

function deriveOverallStatus(groups: Record<string, HealthGroup>): HealthStatus {
  const values = Object.values(groups);
  if (values.some((group) => group.status === "down")) return "down";
  if (values.some((group) => group.status === "degraded")) return "degraded";
  if (values.some((group) => group.status === "healthy")) return "healthy";
  return "unknown";
}

export function normalizeHealthResponse(
  raw?: RawHealthResponse | null
): NormalizedHealthPayload {
  const timestamp =
    raw?.timestamp ?? raw?.updatedAt ?? new Date().toISOString();
  const rawGroups = raw?.groups ?? raw?.services ?? {};

  const groups: Record<string, HealthGroup> = {};
  DEFAULT_GROUPS.forEach(({ id, labelKey }) => {
    // labelKey를 label로 저장 (컴포넌트에서 번역)
    groups[id] = buildGroup(id, labelKey, rawGroups[id], timestamp);
  });

  Object.entries(rawGroups).forEach(([key, value]) => {
    if (groups[key]) return;
    // 알려지지 않은 그룹도 번역 키로 변환 시도
    const labelKey = getGroupLabelKey(key);
    groups[key] = buildGroup(key, labelKey, value, timestamp);
  });

  const overallStatus = deriveOverallStatus(groups);
  const snapshot = {
    timestamp,
    overallStatus,
    groups: Object.values(groups),
  };

  return {
    timestamp,
    overallStatus,
    groups,
    snapshot,
  };
}

export function buildMockHealthPayload(): NormalizedHealthPayload {
  const timestamp = new Date().toISOString();
  const groups: Record<string, HealthGroup> = {};

  DEFAULT_GROUPS.forEach(({ id, labelKey }) => {
    const latency = MOCK_LATENCY[id] ?? 500;
    const status =
      id === "merchants"
        ? "degraded"
        : id === "proxy"
        ? "healthy"
        : "healthy";
    groups[id] = {
      id,
      label: labelKey, // 번역 키를 label로 저장
      status,
      latencyMs: latency,
      lastCheckedAt: timestamp,
      message:
        id === "merchants"
          ? "health:messages.intermittentDelay" // 번역 키로 저장
          : undefined,
    };
  });

  const overallStatus = deriveOverallStatus(groups);

  return {
    timestamp,
    overallStatus,
    groups,
    snapshot: {
      timestamp,
      overallStatus,
      groups: Object.values(groups),
    },
  };
}


