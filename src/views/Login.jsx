"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

import { useAuth } from '../context/auth';

const Login = () => {
  const [form, setForm] = useState({ identifier: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useRouter();
  const pathname = usePathname();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(form);
      const from = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '').get('from');
      navigate.replace(from || (user.role === 'broker' ? '/dashboard?tab=subscription' : '/'));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-12 flex items-center justify-center bg-surface px-6">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-card border border-gray-100 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/10 rounded-full blur-[50px]"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-secondary/10 rounded-full blur-[50px]"></div>

        <form onSubmit={handleSubmit} className="relative z-10 flex flex-col gap-5">
          <div className="text-center mb-3">
            <h2 className="text-3xl font-extrabold text-text mb-2">Welcome Back</h2>
            <p className="text-gray-500 font-medium text-sm">Sign in to access your investment portfolio</p>
          </div>

          {error && <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-bold text-primary">{error}</p>}

          <div>
            <label className="block text-sm font-bold text-text mb-1">Email or Phone</label>
            <input
              value={form.identifier}
              onChange={(event) => setForm({ ...form, identifier: event.target.value })}
              type="text"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-text outline-none focus:border-primary/50 transition-colors placeholder-gray-400 font-medium"
              placeholder="invest@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-text mb-1">Password</label>
            <input
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              type="password"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-text outline-none focus:border-primary/50 transition-colors placeholder-gray-400 font-medium"
              placeholder="Password"
              required
            />
          </div>

          <button disabled={loading} className="w-full bg-primary hover:bg-rose-600 disabled:opacity-60 text-white font-bold py-4 rounded-xl mt-2 transition-colors text-lg shadow-sm">
            {loading ? 'Signing In...' : 'Sign In'}
          </button>

          <div className="text-center mt-2 text-sm font-medium text-gray-500">
            Don't have an account?
            <Link href="/register" className="text-primary hover:text-rose-600 font-bold ml-1 transition-colors">
              Register Now
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
