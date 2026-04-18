import config from '../monitor/config.json';
import rawState from '../monitor/state.json';
import type { Component, StatusLevel } from './types';

// Two-times the monitor heartbeat — catches "monitor is broken" without
// false-positives on cron drift.
const STALE_THRESHOLD_MS = 10 * 60 * 1000;

interface RawComponentState {
  status: StatusLevel;
  consecutiveFailures: number;
  consecutiveSuccesses: number;
  lastCheckedAt: string;
  lastChangedAt: string;
}

interface RawState {
  updatedAt: string;
  components: Record<string, RawComponentState>;
}

export interface PageData {
  components: Component[];
  overallStatus: StatusLevel;
  overallStale: boolean;
  lastCheckedAt: string;
}

export function buildPageData(nowMs: number = Date.now()): PageData {
  const state = rawState as RawState;

  const components: Component[] = config.components.map((c) => {
    const s = state.components[c.id];
    const lastCheckedMs = s ? new Date(s.lastCheckedAt).getTime() : 0;
    const stale = nowMs - lastCheckedMs > STALE_THRESHOLD_MS;
    return {
      id: c.id,
      name: c.name,
      description: c.description,
      status: s?.status ?? 'operational',
      lastCheckedAt: s?.lastCheckedAt ?? state.updatedAt,
      lastChangedAt: s?.lastChangedAt ?? state.updatedAt,
      stale,
    };
  });

  const overallStale = components.length > 0 && components.every((c) => c.stale);
  const overallStatus = deriveOverallStatus(components);

  return {
    components,
    overallStatus,
    overallStale,
    lastCheckedAt: state.updatedAt,
  };
}

// Aggregates component states into a single banner-level status. Any outage
// dominates; otherwise the worst non-operational state wins; otherwise
// operational. Stale components don't influence the aggregate — they're
// surfaced separately by overallStale.
function deriveOverallStatus(components: Component[]): StatusLevel {
  const fresh = components.filter((c) => !c.stale);
  if (fresh.length === 0) return 'operational';

  const order: StatusLevel[] = [
    'major_outage',
    'partial_outage',
    'degraded',
    'maintenance',
    'operational',
  ];
  for (const level of order) {
    if (fresh.some((c) => c.status === level)) return level;
  }
  return 'operational';
}
