"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Lightbulb, Loader2, PlusSquare, Search, User, UserCheck, X } from 'lucide-react';
import { useAuth } from '../context/auth';
import VerifyDocumentModal from './VerifyDocumentModal';
function CalendarClockIcon({ size = 26, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Binder tabs at top */}
      <rect x="7" y="2" width="2" height="3" rx="1" fill="currentColor" />
      <rect x="15" y="2" width="2" height="3" rx="1" fill="currentColor" />

      {/* Main calendar box */}
      <rect x="3.5" y="4.5" width="17" height="16" rx="2.5" stroke="currentColor" strokeWidth="2" fill="none" />

      {/* Top bar divider */}
      <line x1="3.5" y1="9.5" x2="20.5" y2="9.5" stroke="currentColor" strokeWidth="2" />

      {/* Date grid squares */}
      <rect x="6.5" y="11.8" width="2" height="2" rx="0.5" fill="currentColor" />
      <rect x="10.5" y="11.8" width="2" height="2" rx="0.5" fill="currentColor" />
      <rect x="6.5" y="15" width="2" height="2" rx="0.5" fill="currentColor" />

      {/* Clock circle in bottom right */}
      <circle cx="15.5" cy="15.5" r="4.2" stroke="currentColor" strokeWidth="1.8" fill="#f80e11" />
      <polyline points="15.5 13.5 15.5 15.5 17 15.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/listings', label: 'Explore', icon: Search },
  { href: '/book-my-realtor', label: 'Book Realtor', icon: CalendarClockIcon, isPrimary: true },
  { href: '/blogs', label: 'Spotlight', icon: Lightbulb }
];

const MobileBottomNav = () => {
  const pathname = usePathname() || '/';
  const navigate = useRouter();
  const { user, login, logout } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [loginForm, setLoginForm] = useState({ identifier: '', password: '' });
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const closeAuth = () => {
    setIsAuthOpen(false);
    setAuthError('');
  };

  const openProfile = () => {
    setIsAuthOpen(true);
  };

  const submitLogin = async (event) => {
    event.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    try {
      const user = await login(loginForm);
      closeAuth();
      navigate.push(user.role === 'broker' ? '/dashboard?tab=subscription' : '/');
    } catch (error) {
      setAuthError(error.message || 'Unable to sign in. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  const isProfileActive = pathname.startsWith('/dashboard') || pathname.startsWith('/login') || pathname.startsWith('/register');

  return (
    <>
      <nav className="fixed inset-x-0 bottom-0 z-50 px-3 pb-[max(env(safe-area-inset-bottom),0.65rem)] pt-2 md:hidden" aria-label="Mobile navigation">
        <div className="relative mx-auto grid h-[66px] max-w-[420px] grid-cols-5 items-center gap-1 rounded-[1.6rem] border border-gray-200/80 bg-white/95 px-2 py-1 shadow-[0_-8px_30px_rgba(15,23,42,0.12)] backdrop-blur-xl">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);

            if (item.isPrimary) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? 'page' : undefined}
                  aria-label={item.label}
                  className="group relative flex flex-col items-center justify-center -mt-6"
                >
                  <div className="relative flex items-center justify-center p-[5px] rounded-full bg-primary/20 shadow-[0_6px_22px_rgba(248,14,17,0.45)] transition-transform group-active:scale-95">
                    <div className="flex h-[58px] w-[58px] items-center justify-center rounded-full bg-primary text-white shadow-lg">
                      <Icon size={28} />
                    </div>
                  </div>
                </Link>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={`group flex min-w-0 flex-col items-center justify-center gap-1 rounded-2xl px-1 py-1.5 text-[11px] font-extrabold transition-colors ${
                  isActive ? 'text-primary' : 'text-gray-500 hover:text-text'
                }`}
              >
                <span className={`flex items-center justify-center transition-all ${
                  `h-9 w-9 rounded-2xl ${isActive ? 'bg-primary/10 text-primary' : 'text-gray-500 group-hover:bg-gray-100'}`
                }`}>
                  <Icon size={22} strokeWidth={isActive ? 2.6 : 2.1} fill={isActive && !item.isPrimary ? 'currentColor' : 'none'} />
                </span>
                <span className="truncate leading-none">{item.label}</span>
              </Link>
            );
          })}

          <button
            type="button"
            onClick={openProfile}
            className={`group flex min-w-0 flex-col items-center justify-center gap-1 rounded-2xl px-1 py-1.5 text-[11px] font-extrabold transition-colors ${
              isProfileActive ? 'text-primary' : 'text-gray-500 hover:text-text'
            }`}
            aria-label={(mounted && user) ? 'Open dashboard' : 'Open login and sign up'}
          >
            <span className={`flex h-9 w-9 items-center justify-center rounded-2xl transition-all ${
              isProfileActive ? 'bg-primary/10 text-primary' : 'text-gray-500 group-hover:bg-gray-100'
            }`}>
              {(mounted && user) ? (
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-xs font-extrabold uppercase text-white">
                  {user.name?.charAt(0) || 'B'}
                </span>
              ) : (
                <User size={22} strokeWidth={2.1} />
              )}
            </span>
            <span className="truncate leading-none">Profile</span>
          </button>
        </div>
      </nav>

      {isAuthOpen && (
        <div className="fixed inset-0 z-[70] bg-secondary/45 backdrop-blur-sm md:hidden" role="dialog" aria-modal="true">
          <button type="button" className="absolute inset-0 h-full w-full cursor-default" aria-label="Close auth form" onClick={closeAuth}></button>

          <div className="absolute inset-x-0 bottom-0 max-h-[90vh] overflow-y-auto rounded-t-[1.65rem] bg-white px-5 pb-[max(env(safe-area-inset-bottom),1.35rem)] pt-4 shadow-2xl">
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-gray-200"></div>

            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-primary">Account & Actions</p>
                <h2 className="mt-1 text-2xl font-extrabold leading-tight text-text">
                  {user ? `Hello, ${user.name}` : 'Welcome back'}
                </h2>
                <p className="mt-1 text-sm font-medium text-muted">
                  {user ? 'Manage listings, post properties & partner options.' : authMode === 'login' ? 'Sign in to access realtor dashboard.' : 'Join to post properties and contact buyers.'}
                </p>
              </div>
              <button type="button" onClick={closeAuth} aria-label="Close auth form" className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-600">
                <X size={20} />
              </button>
            </div>

            {/* Quick Action: Post Property */}
            <div className="mb-4">
              <Link
                href="/post-property"
                onClick={closeAuth}
                className="flex items-center justify-center gap-2 w-full rounded-2xl bg-gradient-to-r from-primary to-rose-600 p-3.5 text-center text-sm font-extrabold text-white shadow-lg shadow-primary/20 hover:opacity-95 transition-all"
              >
                <PlusSquare size={18} />
                <span>+ Post New Property Listing</span>
              </Link>
            </div>

            {user ? (
              <>
                <div className="rounded-2xl border border-gray-100 bg-surface p-4">
                  <p className="text-lg font-extrabold text-text">{user.name}</p>
                  <p className="mt-1 text-sm font-bold capitalize text-muted">{user.role === 'user' ? 'Buyer' : user.role}</p>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <Link href="/dashboard" onClick={closeAuth} className="rounded-xl bg-slate-900 px-4 py-3 text-center text-sm font-extrabold text-white">
                      Dashboard
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        closeAuth();
                        logout();
                        navigate.push('/');
                      }}
                      className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-extrabold text-text"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="mb-5 grid grid-cols-2 rounded-xl bg-gray-100 p-1">
                  {[
                    ['login', 'Realtor Login'],
                    ['signup', 'Realtor Signup']
                  ].map(([mode, label]) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => {
                        if (mode === 'signup') {
                          closeAuth();
                          navigate.push('/register');
                          return;
                        }
                        setAuthMode(mode);
                        setAuthError('');
                      }}
                      className={`rounded-lg py-3 text-sm font-extrabold transition-colors ${
                        authMode === mode ? 'bg-white text-primary shadow-sm' : 'text-gray-500'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {authError && (
                  <p className="mb-4 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-bold text-primary">
                    {authError}
                  </p>
                )}

                <form onSubmit={submitLogin} className="grid gap-4">
                  <input
                    value={loginForm.identifier}
                    onChange={(event) => setLoginForm({ ...loginForm, identifier: event.target.value })}
                    className="h-[52px] rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm font-semibold text-text outline-none transition-colors focus:border-primary/40 focus:bg-white"
                    placeholder="Email or phone"
                    required
                  />
                  <input
                    value={loginForm.password}
                    onChange={(event) => setLoginForm({ ...loginForm, password: event.target.value })}
                    type="password"
                    className="h-[52px] rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm font-semibold text-text outline-none transition-colors focus:border-primary/40 focus:bg-white"
                    placeholder="Password"
                    required
                  />
                  <div className="flex justify-end -mt-2 -mb-1">
                    <Link href="/forgot-password" onClick={closeAuth} className="text-[12px] text-primary hover:text-rose-600 font-bold transition-colors">
                      Forgot Password?
                    </Link>
                  </div>
                  <button disabled={authLoading} className="mt-1 flex h-[52px] items-center justify-center rounded-xl bg-primary text-base font-extrabold text-white shadow-lg shadow-primary/20 disabled:opacity-60">
                    {authLoading ? <Loader2 className="animate-spin" size={20} /> : 'Login'}
                  </button>
                </form>

                <Link
                  href="/login"
                  onClick={closeAuth}
                  className="mt-4 block text-center text-sm font-bold text-secondary"
                >
                  Open full login page
                </Link>
              </>
            )}

            <div className="mt-5 border-t border-gray-100 pt-5">
              <button
                onClick={() => {
                  closeAuth();
                  setIsVerifyModalOpen(true);
                }}
                className="w-full rounded-xl bg-gray-50 px-2 py-3 text-center text-sm font-extrabold text-text transition-colors hover:bg-gray-100"
              >
                Verify Property Documents
              </button>
            </div>
          </div>
        </div>
      )}
      <VerifyDocumentModal isOpen={isVerifyModalOpen} onClose={() => setIsVerifyModalOpen(false)} />
    </>
  );
};

export default MobileBottomNav;
