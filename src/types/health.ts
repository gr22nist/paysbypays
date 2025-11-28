export type HealthStatus = "healthy" | "degraded" | "down" | "unknown";

export interface HealthGroup {
  id: string;
  label: string;
  status: HealthStatus;
  latencyMs?: number;
  lastCheckedAt?: string;
  message?: string;
}

export interface HealthSnapshot {
  timestamp: string;
  groups: HealthGroup[];
  overallStatus: HealthStatus;
}

export interface NormalizedHealthPayload {
  timestamp: string;
  overallStatus: HealthStatus;
  groups: Record<string, HealthGroup>;
  snapshot: HealthSnapshot;
}


