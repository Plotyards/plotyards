"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { useAuth } from '../context/auth';

const Login = () => {
  const [form, setForm] = useState({ identifier: '', password: '' });

  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [popup, setPopup] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useRouter();

  const handleEmailSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setFieldErrors({});
    setPopup(null);
    setLoading(true);

    try {
      const user = await login(form);
      if (user?.role === 'admin') {
        navigate.push('/plotadmin');
      } else {
        navigate.push('/dashboard');
      }
    } catch (err) {
      if (err.fieldErrors) {
        const fields = {};
        err.fieldErrors.forEach(e => { fields[e.field || e.param] = e.message || e.msg });
        setFieldErrors(fields);
        setError('Please check the highlighted fields and try again.');
      } else {
        setError(err.message);
        if (err.message.toLowerCase().includes('already') || err.message.toLowerCase().includes('invalid')) {
          setPopup({ type: 'error', message: err.message });
        }
      }
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="flex min-h-screen items-start justify-center bg-surface px-6 pb-12 pt-24 md:items-center md:pt-32">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-card border border-gray-100 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/10 rounded-full blur-[50px]"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-secondary/10 rounded-full blur-[50px]"></div>

        <div className="relative z-10 flex flex-col gap-5">
          <div className="text-center mb-1">
            <h2 className="text-3xl font-extrabold text-text mb-2">Welcome Back</h2>
            <p className="text-gray-500 font-medium text-sm">Sign in to continue to Plotyards</p>
          </div>


          {error && !popup && <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-bold text-primary">{error}</p>}

          <form onSubmit={handleEmailSubmit} className="flex flex-col gap-5">
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
              {(fieldErrors.identifier || fieldErrors.email || fieldErrors.phone) && <p className="mt-1 text-xs text-primary font-bold">{fieldErrors.identifier || fieldErrors.email || fieldErrors.phone}</p>}
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
              {fieldErrors.password && <p className="mt-1 text-xs text-primary font-bold">{fieldErrors.password}</p>}
              <div className="flex justify-end mt-2">
                <Link href="/forgot-password" className="text-xs text-primary hover:text-rose-600 font-bold transition-colors">
                  Forgot Password?
                </Link>
              </div>
            </div>
            <button disabled={loading} className="w-full bg-primary hover:bg-rose-600 disabled:opacity-60 text-white font-bold py-4 rounded-xl mt-2 transition-colors text-lg shadow-sm">
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="text-center mt-2 text-sm font-medium text-gray-500">
            Don't have an account?
            <Link href="/register" className="text-primary hover:text-rose-600 font-bold ml-1 transition-colors">
              Register Now
            </Link>
          </div>
        </div>
      </div>

      {popup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl animate-in zoom-in-95 fade-in duration-200 text-center">
            <div className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full ${popup.type === 'error' ? 'bg-rose-100 text-primary' : 'bg-green-100 text-green-600'}`}>
              <span className="text-2xl font-bold">!</span>
            </div>
            <h3 className="mb-2 text-xl font-extrabold text-text">{popup.type === 'error' ? 'Oops!' : 'Success'}</h3>
            <p className="mb-6 text-sm font-medium text-gray-500">{popup.message}</p>
            <button
              onClick={() => setPopup(null)}
              className="w-full rounded-xl bg-gray-900 py-3 text-sm font-bold text-white transition-colors hover:bg-black"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
