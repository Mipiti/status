import { StatusBanner } from './components/StatusBanner';
import { ComponentGrid } from './components/ComponentGrid';
import type { Component } from './types';

const NOW_ISO = new Date().toISOString();

const PLACEHOLDER_COMPONENTS: Component[] = [
  {
    id: 'web',
    name: 'Web App',
    description: 'mipiti.io — the main web application',
    status: 'operational',
    lastCheckedAt: NOW_ISO,
  },
  {
    id: 'api',
    name: 'API',
    description: 'api.mipiti.io — REST API and streaming endpoints',
    status: 'operational',
    lastCheckedAt: NOW_ISO,
  },
  {
    id: 'mcp',
    name: 'MCP Endpoint',
    description: 'Model Context Protocol server for AI coding agents',
    status: 'operational',
    lastCheckedAt: NOW_ISO,
  },
  {
    id: 'threat-model-generation',
    name: 'Threat model generation',
    description: 'AI-powered threat model inference and refinement',
    status: 'operational',
    lastCheckedAt: NOW_ISO,
  },
  {
    id: 'sign-in-github',
    name: 'Sign-in with GitHub',
    description: 'Authentication via GitHub OAuth',
    status: 'operational',
    lastCheckedAt: NOW_ISO,
  },
  {
    id: 'sign-in-google',
    name: 'Sign-in with Google',
    description: 'Authentication via Google OAuth',
    status: 'operational',
    lastCheckedAt: NOW_ISO,
  },
  {
    id: 'jira-integration',
    name: 'Jira integration',
    description: 'Export controls as issues and sync status',
    status: 'operational',
    lastCheckedAt: NOW_ISO,
  },
  {
    id: 'billing',
    name: 'Billing',
    description: 'Checkout, subscriptions, and credit management',
    status: 'operational',
    lastCheckedAt: NOW_ISO,
  },
  {
    id: 'infrastructure',
    name: 'Infrastructure',
    description: 'Compute, networking, and TLS termination',
    status: 'operational',
    lastCheckedAt: NOW_ISO,
  },
];

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 md:px-6 pt-8 md:pt-14 pb-20">
        <StatusBanner overallStatus="operational" lastCheckedAt={NOW_ISO} />
        <ComponentGrid components={PLACEHOLDER_COMPONENTS} />
      </main>

      <Footer />
    </div>
  );
}

function Header() {
  return (
    <header className="w-full border-b border-slate-100 bg-white/70 backdrop-blur-xl sticky top-0 z-10">
      <div className="max-w-4xl mx-auto px-4 md:px-6 h-14 flex items-center gap-3">
        <a href="https://mipiti.io" className="flex items-center gap-2.5 shrink-0" aria-label="Mipiti home">
          <img src={`${import.meta.env.BASE_URL}mipiti-logo.svg`} alt="" className="h-7 w-7" />
          <span className="font-display font-bold text-sm text-slate-900">Mipiti</span>
          <span className="font-mono text-[10px] tracking-wider uppercase text-slate-400 ml-1 pt-0.5">
            Status
          </span>
        </a>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="w-full border-t border-slate-100 bg-white/50 py-6">
      <div className="max-w-4xl mx-auto px-4 md:px-6 flex flex-col md:flex-row items-center md:items-center gap-3 md:gap-0 justify-between text-xs text-slate-400">
        <div className="flex items-center gap-1.5 font-mono">
          <span>&copy; {new Date().getFullYear()} Mipiti, LLC</span>
        </div>
        <div className="flex items-center gap-4 font-mono">
          <a
            href="/feed.xml"
            className="hover:text-slate-700 transition-colors inline-flex items-center gap-1.5"
          >
            <svg viewBox="0 0 24 24" className="h-3 w-3" fill="currentColor" aria-hidden="true">
              <path d="M6.18 17.82a2.18 2.18 0 1 1-4.36 0 2.18 2.18 0 0 1 4.36 0zM2 11.73v3.09A7.18 7.18 0 0 1 9.18 22h3.09A10.27 10.27 0 0 0 2 11.73zM2 5.55v3.09A13.37 13.37 0 0 1 15.36 22h3.09A16.46 16.46 0 0 0 2 5.55z" />
            </svg>
            RSS
          </a>
          <a href="https://mipiti.io" className="hover:text-slate-700 transition-colors">
            mipiti.io
          </a>
        </div>
      </div>
    </footer>
  );
}

export default App;
