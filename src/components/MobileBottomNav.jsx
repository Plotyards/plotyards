"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Lightbulb, Loader2, PlusSquare, Search, User, X } from 'lucide-react';
import { useAuth } from '../context/auth';

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/listings', label: 'Explore', icon: Search },
  { href: '/post-property', label: 'Sell/Rent', icon: PlusSquare, isPrimary: true },
  { href: '/blogs', label: 'Articles', icon: Lightbulb }
];

const MobileBottomNav = () => {
  const pathname = usePathname() || '/';
  const navigate = useRouter();
  const { user, login, logout } = useAuth();
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
        <div className="mx-auto grid h-[72px] max-w-[420px] grid-cols-5 items-center gap-1 rounded-[1.4rem] border border-gray-200/80 bg-white/95 px-2 py-2 shadow-[0_-12px_34px_rgba(15,23,42,0.14)] backdrop-blur-xl">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={`group flex min-w-0 flex-col items-center justify-center gap-1 rounded-2xl px-1 py-1.5 text-[11px] font-extrabold transition-colors ${
                  isActive ? 'text-primary' : 'text-gray-500 hover:text-text'
                } ${item.isPrimary ? '-mt-7 text-text' : ''}`}
              >
                <span className={`flex items-center justify-center transition-all ${
                  item.isPrimary
                    ? 'h-14 w-14 rounded-full bg-primary text-white shadow-lg shadow-primary/25 ring-4 ring-white'
                    : `h-9 w-9 rounded-2xl ${isActive ? 'bg-primary/10 text-primary' : 'text-gray-500 group-hover:bg-gray-100'}`
                }`}>
                  <Icon size={item.isPrimary ? 25 : 22} strokeWidth={isActive ? 2.6 : 2.1} fill={isActive && !item.isPrimary ? 'currentColor' : 'none'} />
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
            aria-label={user ? 'Open dashboard' : 'Open login and sign up'}
          >
            <span className={`flex h-9 w-9 items-center justify-center rounded-2xl transition-all ${
              isProfileActive ? 'bg-primary/10 text-primary' : 'text-gray-500 group-hover:bg-gray-100'
            }`}>
              {user ? (
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
                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-primary">Account</p>
                <h2 className="mt-1 text-2xl font-extrabold leading-tight text-text">
                  {user ? 'Account' : 'Welcome back'}
                </h2>
                <p className="mt-1 text-sm font-medium text-muted">
                  {user ? 'Dashboard, saved plots, policies, and assistance links.' : authMode === 'login' ? 'Sign in to save plots and view enquiries.' : 'Join to shortlist verified plots and contact associate partners.'}
                </p>
              </div>
              <button type="button" onClick={closeAuth} aria-label="Close auth form" className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-600">
                <X size={20} />
              </button>
            </div>

            {user ? (
              <>
                <div className="rounded-2xl border border-gray-100 bg-surface p-4">
                  <p className="text-lg font-extrabold text-text">{user.name}</p>
                  <p className="mt-1 text-sm font-bold capitalize text-muted">{user.role === 'user' ? 'Buyer' : user.role}</p>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <Link href="/dashboard" onClick={closeAuth} className="rounded-xl bg-primary px-4 py-3 text-center text-sm font-extrabold text-white">
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
                    ['login', 'Login'],
                    ['signup', 'Sign up']
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

            <div className="mt-5 grid grid-cols-2 gap-2 border-t border-gray-100 pt-5">
              <a href="https://wa.me/918287697756?text=Hi%20i%20want%20to%20talk%20about%20Legal%20assistance" target="_blank" rel="noreferrer" className="rounded-xl bg-gray-50 px-2 py-3 text-center text-[12px] font-extrabold text-text transition-colors hover:bg-gray-100">
                Legal Assistance
              </a>
              <a href="https://wa.me/918287697756?text=Hi%20i%20want%20to%20talk%20about%20Loan%20assistance" target="_blank" rel="noreferrer" className="rounded-xl bg-gray-50 px-2 py-3 text-center text-[12px] font-extrabold text-text transition-colors hover:bg-gray-100">
                Loan Assistance
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MobileBottomNav;
