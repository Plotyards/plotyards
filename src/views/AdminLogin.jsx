"use client";

import { useEffect, useState } from 'react';
import { LockKeyhole, ShieldCheck, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

import { useAuth } from '../context/auth';
import { ADMIN_SEARCH_PHRASE, grantAdminEntry } from '../utils/adminAccess';

const AdminLogin = () => {
  const [form, setForm] = useState({ identifier: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, logout, user } = useAuth();
  const pathname = usePathname();
  const navigate = useRouter();
  const searchParams = useSearchParams();
  const entryFromSearch = (typeof window !== 'undefined' && window.history.state?.plotadmin === true)
    || searchParams.get('entry') === ADMIN_SEARCH_PHRASE;

  useEffect(() => {
    grantAdminEntry();

    if (entryFromSearch) {
      if (searchParams.toString()) {
        navigate.replace('/plotadmin');
      }
    }
  }, [entryFromSearch, searchParams, navigate]);

  useEffect(() => {
    if (user?.role === 'admin') {
      navigate.replace('/admin');
    }
  }, [navigate, user]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const signedInUser = await login(form);

      if (signedInUser.role !== 'admin') {
        logout();
        setError('This page is for Plotyards administrators only.');
        return;
      }

      grantAdminEntry();
      navigate.replace((typeof window !== 'undefined' ? window.history.state?.from : null) || '/admin');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,#052f35_0%,#0f766e_45%,#fa3e4e_100%)] px-6 pt-32 pb-12 text-white">
      <div className="mx-auto grid max-w-5xl items-center gap-8 lg:grid-cols-[1fr_440px]">
        <div className="hidden lg:block">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/12 px-3 py-1 text-xs font-extrabold uppercase tracking-wide ring-1 ring-white/20">
            <Sparkles size={14} /> Plotadmin gateway
          </p>
          <h1 className="mt-5 max-w-xl text-5xl font-extrabold leading-tight">Admin access for listings, associate partners, and homepage controls.</h1>
          <p className="mt-5 max-w-lg text-sm font-medium leading-7 text-white/75">
            Use your administrator account to review associate partner requests, manage featured properties, edit selected top cities, and publish site announcements.
          </p>
        </div>

        <div className="rounded-[2rem] border border-white/20 bg-white/95 p-8 text-text shadow-2xl shadow-black/25">
          <div className="mb-7 flex items-center justify-between">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wide text-secondary">Admin Login</p>
              <h2 className="mt-1 text-3xl font-extrabold">Secure desk</h2>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-white">
              <ShieldCheck size={24} />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="grid gap-5">
            {error && <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-bold text-primary">{error}</p>}

            <div>
              <label className="mb-1 block text-sm font-bold text-text">Admin email or phone</label>
              <input
                value={form.identifier}
                onChange={(event) => setForm({ ...form, identifier: event.target.value })}
                type="text"
                className="w-full rounded-xl border border-cyan-100 bg-cyan-50/60 px-4 py-3 font-semibold text-text outline-none transition-colors focus:border-secondary"
                placeholder="admin@plotyards.com"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-bold text-text">Password</label>
              <div className="flex items-center rounded-xl border border-cyan-100 bg-cyan-50/60 px-4 py-3 focus-within:border-secondary">
                <LockKeyhole size={18} className="mr-3 text-secondary" />
                <input
                  value={form.password}
                  onChange={(event) => setForm({ ...form, password: event.target.value })}
                  type="password"
                  className="w-full bg-transparent font-semibold text-text outline-none"
                  placeholder="Admin password"
                  required
                />
              </div>
            </div>

            <button disabled={loading} className="rounded-xl bg-gradient-to-r from-secondary to-primary py-4 text-lg font-extrabold text-white shadow-lg shadow-cyan-900/20 transition-opacity hover:opacity-95 disabled:opacity-60">
              {loading ? 'Checking Access...' : 'Enter Admin Panel'}
            </button>

            <Link href="/login" className="text-center text-sm font-bold text-muted transition-colors hover:text-primary">
              Use regular login
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
