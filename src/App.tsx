import { StatusBanner } from './components/StatusBanner';
import { ComponentGrid } from './components/ComponentGrid';
import { buildPageData } from './state';

function App() {
  const data = buildPageData();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 md:px-6 pt-8 md:pt-14 pb-20">
        <StatusBanner
          overallStatus={data.overallStatus}
          overallStale={data.overallStale}
          lastCheckedAt={data.lastCheckedAt}
        />
        <ComponentGrid components={data.components} />
      </main>

      <Footer />
    </div>
  );
}

function Header() {
  return (
    <header className="w-full border-b border-slate-100 bg-white/70 backdrop-blur-xl sticky top-0 z-10">
      <div className="max-w-4xl mx-auto px-4 md:px-6 h-14 flex items-center gap-3">
        <a
          href="https://mipiti.io"
          className="flex items-center gap-2.5 shrink-0"
          aria-label="Mipiti home"
        >
          <img
            src={`${import.meta.env.BASE_URL}mipiti-logo.svg`}
            alt=""
            className="h-7 w-7"
          />
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
      <div className="max-w-4xl mx-auto px-4 md:px-6 flex flex-col md:flex-row items-center gap-3 md:gap-0 justify-between text-xs text-slate-400">
        <div className="flex items-center gap-1.5 font-mono">
          <span>&copy; {new Date().getFullYear()} Mipiti, LLC</span>
        </div>
        <div className="flex items-center gap-4 font-mono">
          <a href="https://mipiti.io" className="hover:text-slate-700 transition-colors">
            mipiti.io
          </a>
        </div>
      </div>
    </footer>
  );
}

export default App;
