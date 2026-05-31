import Link from 'next/link';


const NotFound = () => {
  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,#ecfeff_0%,#ffffff_42%,#fff7ed_100%)] px-6 pt-32 pb-12">
      <div className="mx-auto grid max-w-5xl items-center gap-10 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <p className="inline-flex rounded-full border border-black/10 bg-white/80 px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-secondary shadow-sm">
            404 connection lost
          </p>
          <h1 className="mt-5 text-4xl font-extrabold leading-tight text-text sm:text-5xl">
            This page is not connected to Plotyards.
          </h1>
          <p className="mt-4 max-w-lg text-sm font-medium leading-7 text-muted">
            The link may be old, the address may be mistyped, or this route may not exist anymore.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/" className="rounded-xl bg-primary px-5 py-3 text-sm font-extrabold text-white shadow-lg shadow-primary/20 transition-colors hover:bg-rose-600">
              Go Home
            </Link>
            <Link href="/listings" className="rounded-xl border border-black/10 bg-white px-5 py-3 text-sm font-extrabold text-text shadow-sm transition-colors hover:bg-surface">
              Browse Listings
            </Link>
          </div>
        </div>

        <div className="rounded-[2rem] border border-black/10 bg-white/80 p-6 shadow-2xl shadow-cyan-900/10 backdrop-blur">
          <svg viewBox="0 0 680 460" role="img" aria-label="Disconnected page illustration" className="h-auto w-full">
            <defs>
              <linearGradient id="wireGradient" x1="80" x2="600" y1="160" y2="320" gradientUnits="userSpaceOnUse">
                <stop stopColor="#00697a" />
                <stop offset="1" stopColor="#f80e11" />
              </linearGradient>
              <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="18" stdDeviation="18" floodColor="#052f35" floodOpacity=".14" />
              </filter>
            </defs>
            <rect width="680" height="460" rx="36" fill="#f8fafc" />
            <path d="M90 318c58-83 125-112 201-88 55 18 83 7 123-46 41-54 96-58 166-13" fill="none" stroke="url(#wireGradient)" strokeWidth="18" strokeLinecap="round" strokeDasharray="1 34" />
            <g filter="url(#softShadow)">
              <rect x="86" y="96" width="188" height="148" rx="28" fill="#ffffff" stroke="#111827" strokeOpacity=".12" />
              <rect x="116" y="132" width="88" height="12" rx="6" fill="#00697a" fillOpacity=".22" />
              <rect x="116" y="160" width="126" height="12" rx="6" fill="#111827" fillOpacity=".10" />
              <rect x="116" y="188" width="96" height="12" rx="6" fill="#111827" fillOpacity=".10" />
              <circle cx="228" cy="132" r="18" fill="#f80e11" fillOpacity=".16" />
            </g>
            <g filter="url(#softShadow)">
              <rect x="406" y="214" width="188" height="148" rx="28" fill="#ffffff" stroke="#111827" strokeOpacity=".12" />
              <rect x="436" y="250" width="86" height="12" rx="6" fill="#f80e11" fillOpacity=".20" />
              <rect x="436" y="278" width="126" height="12" rx="6" fill="#111827" fillOpacity=".10" />
              <rect x="436" y="306" width="96" height="12" rx="6" fill="#111827" fillOpacity=".10" />
              <circle cx="548" cy="250" r="18" fill="#00697a" fillOpacity=".16" />
            </g>
            <path d="M286 247l34-34m0 34l-34-34" stroke="#f80e11" strokeWidth="12" strokeLinecap="round" />
            <path d="M340 247l34-34m0 34l-34-34" stroke="#00697a" strokeWidth="12" strokeLinecap="round" />
            <circle cx="328" cy="230" r="76" fill="#ffffff" fillOpacity=".66" stroke="#111827" strokeOpacity=".08" />
            <text x="328" y="245" textAnchor="middle" fontFamily="Inter, Arial, sans-serif" fontSize="54" fontWeight="800" fill="#222222">404</text>
          </svg>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
