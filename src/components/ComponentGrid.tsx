import type { Component, StatusLevel } from '../types';

interface Props {
  components: Component[];
}

const STATUS_LABEL: Record<StatusLevel, string> = {
  operational: 'Operational',
  degraded: 'Degraded',
  partial_outage: 'Partial Outage',
  major_outage: 'Major Outage',
  maintenance: 'Maintenance',
};

const STATUS_DOT: Record<StatusLevel, string> = {
  operational: 'bg-emerald-500',
  degraded: 'bg-amber-500',
  partial_outage: 'bg-orange-500',
  major_outage: 'bg-red-500',
  maintenance: 'bg-blue-500',
};

const STATUS_TEXT: Record<StatusLevel, string> = {
  operational: 'text-emerald-700',
  degraded: 'text-amber-700',
  partial_outage: 'text-orange-700',
  major_outage: 'text-red-700',
  maintenance: 'text-blue-700',
};

export function ComponentGrid({ components }: Props) {
  return (
    <section
      className="mt-10 rounded-3xl bg-white shadow-soft border border-slate-100 overflow-hidden animate-slide-up"
      style={{ animationDelay: '120ms' }}
    >
      <header className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
        <h2 className="font-display font-semibold text-sm text-slate-900 tracking-tight">
          Components
        </h2>
        <span className="font-mono text-[10px] tracking-wider uppercase text-slate-400">
          {components.length} monitored
        </span>
      </header>

      <ul className="divide-y divide-slate-100">
        {components.map((c) => (
          <li
            key={c.id}
            className="px-6 py-4 flex items-center gap-4 hover:bg-slate-50/60 transition-colors"
          >
            <span
              className={`shrink-0 h-2 w-2 rounded-full ${
                c.stale ? 'bg-slate-300' : STATUS_DOT[c.status]
              }`}
              aria-hidden="true"
            />

            <div className="flex-1 min-w-0">
              <div className="font-display font-semibold text-sm text-slate-900 truncate">
                {c.name}
              </div>
              <div className="text-xs text-slate-500 truncate">{c.description}</div>
            </div>

            {c.stale ? (
              <span className="shrink-0 font-mono text-xs font-medium text-slate-400">
                Stale
              </span>
            ) : (
              <span
                className={`shrink-0 font-mono text-xs font-medium ${STATUS_TEXT[c.status]}`}
              >
                {STATUS_LABEL[c.status]}
              </span>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
