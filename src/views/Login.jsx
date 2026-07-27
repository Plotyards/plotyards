"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { useAuth } from '../context/auth';

import { Eye, EyeOff, CheckCheck } from 'lucide-react';

const Login = () => {
  const [form, setForm] = useState({ identifier: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

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
      <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-3xl shadow-card border border-gray-100 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/10 rounded-full blur-[50px]"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-secondary/10 rounded-full blur-[50px]"></div>

        <div className="relative z-10 flex flex-col gap-5">
          <div className="text-center mb-1">
            <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 text-[11px] font-extrabold px-3.5 py-1 rounded-full border border-blue-200 uppercase tracking-wider mb-2">
              💼 Realtor & Partner Portal
            </span>
            <h2 className="text-3xl font-extrabold text-text mb-2">Welcome Back</h2>
            <p className="text-gray-500 font-medium text-sm">Sign in to manage your listings, buyer leads & directory profile</p>
          </div>



          {error && !popup && <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-bold text-primary">{error}</p>}

          <form onSubmit={handleEmailSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-extrabold text-text uppercase tracking-wider mb-1.5">Email or Phone Number</label>
              <input
                value={form.identifier}
                onChange={(event) => setForm({ ...form, identifier: event.target.value })}
                type="text"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-text outline-none focus:border-primary/50 transition-colors placeholder-gray-400 font-medium text-sm"
                placeholder="e.g. realtor@example.com or +91 98765..."
                required
              />
              {(fieldErrors.identifier || fieldErrors.email || fieldErrors.phone) && <p className="mt-1 text-xs text-primary font-bold">{fieldErrors.identifier || fieldErrors.email || fieldErrors.phone}</p>}
            </div>
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-extrabold text-text uppercase tracking-wider">Password</label>
                <Link href="/forgot-password" className="text-xs text-primary hover:text-rose-600 font-bold transition-colors">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <input
                  value={form.password}
                  onChange={(event) => setForm({ ...form, password: event.target.value })}
                  type={showPassword ? "text" : "password"}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 pr-12 text-text outline-none focus:border-primary/50 transition-colors placeholder-gray-400 font-medium text-sm"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {fieldErrors.password && <p className="mt-1 text-xs text-primary font-bold">{fieldErrors.password}</p>}
            </div>

            <button disabled={loading} className="w-full bg-primary hover:bg-rose-600 disabled:opacity-60 text-white font-extrabold py-3.5 rounded-xl mt-2 transition-colors text-base shadow-sm">
              {loading ? 'Signing In...' : 'Sign In to Dashboard'}
            </button>
          </form>

          <div className="text-center mt-2 text-xs font-semibold text-gray-500">
            Don't have an account?
            <Link href="/realtor-register" className="text-primary hover:text-rose-600 font-extrabold ml-1 transition-colors underline">
              Register as Realtor / Partner
            </Link>
          </div>
        </div>
      </div>

      {popup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl animate-in zoom-in-95 fade-in duration-200 text-center">
            <div className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full ${popup.type === 'error' ? 'bg-rose-100 text-primary' : 'bg-green-100 text-green-600'}`}>
              {popup.type === 'error' ? <span className="text-2xl font-bold">!</span> : <CheckCheck size={24} />}
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
