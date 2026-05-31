import Link from 'next/link';
import { ArrowLeft, Sparkles } from 'lucide-react';

const AppComingSoon = () => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[linear-gradient(135deg,#f0fdfa_0%,#ffffff_50%,#fff1f2_100%)] px-6 pb-16 pt-32">
      {/* Static Background Orbs */}
      <div className="pointer-events-none absolute left-1/4 top-1/4 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-100/60 blur-[100px]"></div>
      <div className="pointer-events-none absolute bottom-1/4 right-1/4 h-[400px] w-[400px] translate-x-1/3 translate-y-1/3 rounded-full bg-rose-100/60 blur-[80px]"></div>

      <div className="relative mx-auto max-w-[1200px]">
        <Link href="/" className="mb-12 inline-flex items-center gap-2 rounded-full border border-black/5 bg-white/60 px-5 py-2.5 text-sm font-extrabold text-slate-600 shadow-sm backdrop-blur-md transition-colors hover:bg-white hover:text-slate-900">
          <ArrowLeft size={16} /> Back to Home
        </Link>

        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Text Content */}
          <div className="z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-extrabold uppercase tracking-widest text-primary shadow-sm">
              <Sparkles size={14} /> Under Construction
            </div>
            <h1 className="mt-8 text-5xl font-extrabold leading-[1.1] tracking-tight text-slate-900 sm:text-6xl lg:text-7xl">
              The <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-rose-400">Plotyards App</span> is dropping soon.
            </h1>
            <p className="mt-6 max-w-lg text-lg font-medium leading-8 text-slate-600">
              We're crafting a premium mobile experience for real estate and land investment. Get ready for seamless browsing, advanced ROI calculators, and instant associate partner connections right from your pocket.
            </p>
          </div>

          {/* SVG Mockup - Animates on Hover */}
          <div className="relative z-10 mx-auto w-full max-w-[300px] lg:ml-auto">
            {/* Group container triggers hover animations for the phone and the floating cards */}
            <div className="group relative cursor-pointer transition-transform duration-700 hover:-translate-y-4">
              
              {/* Device Frame */}
              <svg viewBox="0 0 400 800" className="w-full drop-shadow-[0_15px_30px_rgba(0,105,122,0.1)] transition-all duration-700 group-hover:drop-shadow-[0_30px_50px_rgba(0,105,122,0.2)]">
                <defs>
                  <linearGradient id="phoneGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#f8fafc" />
                    <stop offset="100%" stopColor="#e2e8f0" />
                  </linearGradient>
                  <linearGradient id="screenGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="100%" stopColor="#f8fafc" />
                  </linearGradient>
                  <linearGradient id="heroGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#00697a" />
                    <stop offset="100%" stopColor="#052f35" />
                  </linearGradient>
                </defs>
                
                {/* Body */}
                <rect x="20" y="20" width="360" height="760" rx="48" fill="url(#phoneGrad)" stroke="#cbd5e1" strokeWidth="4" />
                <rect x="30" y="30" width="340" height="740" rx="40" fill="url(#screenGrad)" />
                
                {/* Notch */}
                <path d="M140 30 L140 50 Q140 60 150 60 L250 60 Q260 60 260 50 L260 30 Z" fill="#f8fafc" />
                <circle cx="215" cy="45" r="4" fill="#94a3b8" />
                
                {/* App Content Fake UI */}
                <g transform="translate(50, 100)">
                  <circle cx="20" cy="20" r="20" fill="#f80e11" opacity="0.1" />
                  <path d="M13 20 L27 20 M20 13 L20 27" stroke="#f80e11" strokeWidth="3" strokeLinecap="round" />
                  <rect x="55" y="10" width="120" height="8" rx="4" fill="#94a3b8" />
                  <rect x="55" y="24" width="80" height="6" rx="3" fill="#cbd5e1" />
                  
                  <rect x="0" y="60" width="300" height="180" rx="24" fill="url(#heroGrad)" />
                  <circle cx="260" cy="100" r="80" fill="#ffffff" opacity="0.1" />
                  <rect x="20" y="180" width="100" height="24" rx="12" fill="#ffffff" />
                  <rect x="20" y="90" width="140" height="10" rx="5" fill="#ffffff" opacity="0.7" />
                  <rect x="20" y="110" width="100" height="8" rx="4" fill="#ffffff" opacity="0.5" />
                  
                  <rect x="0" y="270" width="65" height="80" rx="20" fill="#f1f5f9" />
                  <rect x="78" y="270" width="65" height="80" rx="20" fill="#f1f5f9" />
                  <rect x="156" y="270" width="65" height="80" rx="20" fill="#f1f5f9" />
                  <rect x="234" y="270" width="65" height="80" rx="20" fill="#f1f5f9" />
                  
                  <rect x="0" y="380" width="300" height="120" rx="24" fill="#ffffff" stroke="#f1f5f9" strokeWidth="2" />
                  <rect x="16" y="396" width="100" height="88" rx="16" fill="#f8fafc" />
                  <rect x="132" y="406" width="120" height="10" rx="5" fill="#94a3b8" />
                  <rect x="132" y="426" width="80" height="8" rx="4" fill="#cbd5e1" />
                  <rect x="132" y="460" width="60" height="12" rx="6" fill="#f80e11" opacity="0.2" />

                  <rect x="0" y="520" width="300" height="120" rx="24" fill="#ffffff" stroke="#f1f5f9" strokeWidth="2" />
                  <rect x="16" y="536" width="100" height="88" rx="16" fill="#f8fafc" />
                  <rect x="132" y="546" width="120" height="10" rx="5" fill="#94a3b8" />
                  <rect x="132" y="566" width="80" height="8" rx="4" fill="#cbd5e1" />
                </g>

                {/* Bottom Bar */}
                <rect x="40" y="680" width="320" height="80" rx="40" fill="#ffffff" filter="drop-shadow(0 -10px 20px rgba(0,0,0,0.05))" />
                <circle cx="90" cy="720" r="6" fill="#cbd5e1" />
                <circle cx="160" cy="720" r="6" fill="#f80e11" />
                <circle cx="230" cy="720" r="6" fill="#cbd5e1" />
                <circle cx="300" cy="720" r="6" fill="#cbd5e1" />
              </svg>

              {/* Floating Element 1 - Verification - Drifts out on hover */}
              <div className="absolute -right-8 top-32 rounded-2xl border border-black/5 bg-white/90 p-4 shadow-xl backdrop-blur-xl transition-all duration-700 group-hover:-translate-y-6 group-hover:translate-x-4 md:-right-16">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 transition-transform duration-500 group-hover:scale-110">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </div>
                  <div>
                    <div className="text-[10px] font-extrabold uppercase tracking-wide text-slate-500">Property Status</div>
                    <div className="text-sm font-extrabold text-slate-900">RERA Verified</div>
                  </div>
                </div>
              </div>

              {/* Floating Element 2 - Alert - Drifts out on hover */}
              <div className="absolute -left-8 bottom-40 rounded-2xl border border-black/5 bg-white/90 p-4 shadow-xl backdrop-blur-xl transition-all duration-700 group-hover:-translate-x-4 group-hover:translate-y-6 md:-left-16">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform duration-500 group-hover:scale-110">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                  </div>
                  <div>
                    <div className="text-[10px] font-extrabold uppercase tracking-wide text-slate-500">Lead Update</div>
                    <div className="text-sm font-extrabold text-slate-900">Associate Partner attached</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppComingSoon;
