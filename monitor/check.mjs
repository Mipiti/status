#!/usr/bin/env node
// Runs inside a GitHub Actions cron workflow (every 5 minutes).
// Performs an inner loop of HTTP checks at the configured interval,
// updates state.json on transitions, commits immediately on state change,
// and commits once at end of window even if no state change occurred
// (so lastCheckedAt stays fresh and staleness detection works).
//
// Intentionally logs only {url, status_code, latency_ms, timestamp} —
// never response bodies — because workflow logs are public.

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';

const CONFIG_PATH = 'monitor/config.json';
const STATE_PATH = 'monitor/state.json';

const cfg = JSON.parse(readFileSync(CONFIG_PATH, 'utf8'));

const nowIso = () => new Date().toISOString();

function loadState() {
  if (!existsSync(STATE_PATH)) {
    const components = Object.fromEntries(
      cfg.components.map((c) => [
        c.id,
        {
          status: 'operational',
          consecutiveFailures: 0,
          consecutiveSuccesses: 0,
          lastCheckedAt: nowIso(),
          lastChangedAt: nowIso(),
        },
      ]),
    );
    return { updatedAt: nowIso(), components };
  }
  return JSON.parse(readFileSync(STATE_PATH, 'utf8'));
}

function saveState(state) {
  writeFileSync(STATE_PATH, JSON.stringify(state, null, 2) + '\n');
}

async function probe(url, timeoutSec) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutSec * 1000);
  const start = Date.now();
  try {
    const res = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      redirect: 'follow',
    });
    return { ok: true, status: res.status, latencyMs: Date.now() - start };
  } catch {
    return { ok: false, status: 0, latencyMs: Date.now() - start };
  } finally {
    clearTimeout(t);
  }
}

async function canariesHealthy() {
  const results = await Promise.all(
    cfg.canaries.map((u) => probe(u, cfg.timeoutSec)),
  );
  const successes = results.filter((r) => r.ok && r.status < 500).length;
  return successes >= cfg.canaryThreshold;
}

function commitAndPush(message) {
  // Skip commit if nothing actually changed (git diff --quiet = no diff).
  const changed =
    execSync(`git diff --quiet ${STATE_PATH} || echo CHANGED`, { encoding: 'utf8' }).trim() ===
    'CHANGED';
  if (!changed) return false;

  execSync(`git config user.email "actions@github.com"`);
  execSync(`git config user.name "Mipiti Status Monitor"`);
  execSync(`git add ${STATE_PATH}`);
  execSync(`git commit -m "${message.replaceAll('"', '\\"')}"`);
  // Defensive pull-rebase in case a concurrent workflow committed elsewhere.
  try {
    execSync(`git pull --rebase origin main`, { stdio: 'pipe' });
  } catch {
    // Continue — push will surface any remaining conflict.
  }
  execSync(`git push origin HEAD:main`);
  return true;
}

function applyResultToComponent(compState, ok) {
  let transitioned = null;
  if (ok) {
    compState.consecutiveFailures = 0;
    compState.consecutiveSuccesses += 1;
    if (
      compState.status !== 'operational' &&
      compState.consecutiveSuccesses >= cfg.successesForUp
    ) {
      compState.status = 'operational';
      compState.lastChangedAt = nowIso();
      transitioned = 'operational';
    }
  } else {
    compState.consecutiveSuccesses = 0;
    compState.consecutiveFailures += 1;
    if (
      compState.status === 'operational' &&
      compState.consecutiveFailures >= cfg.failuresForDown
    ) {
      compState.status = 'major_outage';
      compState.lastChangedAt = nowIso();
      transitioned = 'major_outage';
    }
  }
  compState.lastCheckedAt = nowIso();
  return transitioned;
}

async function main() {
  const windowStartMs = Date.now();
  const windowEndMs = windowStartMs + cfg.windowDurationSec * 1000;
  const state = loadState();
  const transitions = [];
  let firstIterationCommitted = false;

  while (Date.now() < windowEndMs) {
    const iterStart = Date.now();

    const canaryOk = await canariesHealthy();
    if (!canaryOk) {
      console.log(
        JSON.stringify({ ts: nowIso(), canary: 'unhealthy', action: 'skip_iteration' }),
      );
      const elapsed = Date.now() - iterStart;
      const remaining = cfg.innerLoopIntervalSec * 1000 - elapsed;
      if (remaining > 0 && Date.now() + remaining < windowEndMs) await sleep(remaining);
      continue;
    }

    const results = await Promise.all(
      cfg.components.map(async (c) => ({
        id: c.id,
        probe: await probe(c.url, cfg.timeoutSec),
        expectedStatus: c.expectedStatus,
      })),
    );

    for (const { id, probe: p, expectedStatus } of results) {
      const ok = p.ok && p.status === expectedStatus;
      console.log(
        JSON.stringify({
          ts: nowIso(),
          component: id,
          status_code: p.status,
          latency_ms: p.latencyMs,
          ok,
        }),
      );
      const transitioned = applyResultToComponent(state.components[id], ok);
      if (transitioned) transitions.push({ id, to: transitioned });
    }

    state.updatedAt = nowIso();

    if (transitions.length > 0) {
      saveState(state);
      const msg = transitions.map((t) => `${t.id} -> ${t.to}`).join(', ');
      const pushed = commitAndPush(`status: ${msg}`);
      if (pushed) console.log(JSON.stringify({ ts: nowIso(), event: 'committed', msg }));
      transitions.length = 0;
      firstIterationCommitted = true;
    } else if (!firstIterationCommitted) {
      saveState(state);
      commitAndPush(`status: ${nowIso()}`);
      firstIterationCommitted = true;
    }

    const elapsed = Date.now() - iterStart;
    const remaining = cfg.innerLoopIntervalSec * 1000 - elapsed;
    if (remaining > 0 && Date.now() + remaining < windowEndMs) await sleep(remaining);
  }
}

main().catch(() => {
  console.error('monitor run failed');
  process.exit(1);
});
