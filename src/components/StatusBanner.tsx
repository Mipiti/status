import type { StatusLevel } from '../types';

interface Props {
  overallStatus: StatusLevel;
  lastCheckedAt: string;
}

const STATUS_COPY: Record<StatusLevel, { headline: string; tone: string; dotClass: string; pulse: boolean }> = {
  operational: {
    headline: 'All Systems Operational',
    tone: 'Everything is running smoothly.',
    dotClass: 'bg-emerald-500',
    pulse: true,
  },
  degraded: {
    headline: 'Degraded Performance',
    tone: 'Some services are experiencing reduced performance.',
    dotClass: 'bg-amber-500',
    pulse: false,
  },
  partial_outage: {
    headline: 'Partial Outage',
    tone: 'One or more services are unavailable.',
    dotClass: 'bg-orange-500',
    pulse: false,
  },
  major_outage: {
    headline: 'Major Outage',
    tone: 'Multiple services are unavailable.',
    dotClass: 'bg-red-500',
    pulse: false,
  },
  maintenance: {
    headline: 'Scheduled Maintenance',
    tone: 'Planned work is in progress.',
    dotClass: 'bg-blue-500',
    pulse: false,
  },
};

export function StatusBanner({ overallStatus, lastCheckedAt }: Props) {
  const copy = STATUS_COPY[overallStatus];

  return (
    <section className="relative rounded-3xl bg-white shadow-soft-lg border border-slate-100 px-8 py-14 md:py-16 overflow-hidden animate-slide-up">
      <div className="absolute inset-0 ambient-bg pointer-events-none" aria-hidden="true" />

      <div className="relative flex flex-col items-center text-center">
        <div className="flex items-center gap-3 mb-6">
          <span
            className={`relative inline-flex h-3.5 w-3.5 rounded-full ${copy.dotClass} ${
              copy.pulse ? 'animate-status-pulse' : ''
            }`}
            aria-hidden="true"
          />
          <span className="font-mono text-xs tracking-wider uppercase text-slate-500">
            Live Status
          </span>
        </div>

        <h1 className="font-display font-bold text-3xl md:text-5xl tracking-tight text-slate-900 mb-3">
          {copy.headline}
        </h1>
        <p className="text-base md:text-lg text-slate-500 max-w-xl">{copy.tone}</p>

        <div className="mt-10 flex items-center gap-2 font-mono text-xs text-slate-400">
          <span className="h-1 w-1 rounded-full bg-slate-300" aria-hidden="true" />
          <time dateTime={lastCheckedAt}>
            Last checked {formatRelativeTime(lastCheckedAt)}
          </time>
        </div>
      </div>
    </section>
  );
}

function formatRelativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diffSec = Math.max(0, Math.round((now - then) / 1000));

  if (diffSec < 60) return `${diffSec}s ago`;
  if (diffSec < 3600) return `${Math.round(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.round(diffSec / 3600)}h ago`;
  return new Date(iso).toLocaleDateString();
}
