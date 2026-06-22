"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { useState } from 'react';
import { useAuth } from '../context/auth';
import { Eye, EyeOff } from 'lucide-react';

const Register = () => {
  const [accountType, setAccountType] = useState('broker');
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    phone: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    address: ''
  });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [popup, setPopup] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useRouter();
  const { register } = useAuth();
  
  // Import icons at the top in next replacement chunk


  const handleRegister = async (event) => {
    event.preventDefault();
    setError('');
    setFieldErrors({});
    setPopup(null);
    
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const user = await register({
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        isBroker: accountType === 'broker' || accountType === 'developer',
        brokerProfile: accountType === 'broker' || accountType === 'developer'
          ? {
              companyName: form.companyName,
              companyType: accountType,
              contactPhone: form.phone,
              address: form.address
            }
          : undefined
      });

      navigate.push(user.role === 'broker' ? '/subscribe' : '/');
    } catch (err) {
      if (err.fieldErrors) {
        const fields = {};
        err.fieldErrors.forEach(e => { fields[e.field || e.param] = e.message || e.msg });
        setFieldErrors(fields);
        setError('Please check the highlighted fields and try again.');
      } else {
        setError(err.message);
        if (err.message.toLowerCase().includes('already') || err.message.toLowerCase().includes('exists')) {
          setPopup({ type: 'error', message: err.message });
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-start justify-center bg-surface px-6 pb-12 pt-24 md:items-center md:pt-32">
      <div className="w-full max-w-xl bg-white p-8 rounded-3xl shadow-card border border-gray-100 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/10 rounded-full blur-[50px]"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-secondary/10 rounded-full blur-[50px]"></div>

        <form onSubmit={handleRegister} className="relative z-10 flex flex-col gap-5">
          <div className="text-center mb-3">
            <h2 className="text-3xl font-extrabold text-text mb-2">
              {accountType === 'broker' ? 'Associate Partner Registration' : 'Create Account'}
            </h2>
            <p className="text-gray-500 font-medium text-sm">
              {accountType === 'broker'
                ? 'Share your business details and start managing plot listings.'
                : 'Register as a developer and list your new projects.'}
            </p>
          </div>

          {error && !popup && <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-bold text-primary">{error}</p>}

          <div className="grid grid-cols-2 gap-2 rounded-2xl bg-gray-50 p-1">
            {[
              ['broker', 'Associate Partner'],
              ['developer', 'Developer']
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setAccountType(value)}
                className={`rounded-xl px-4 py-2.5 text-sm font-bold transition-colors ${
                  accountType === value
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-gray-500 hover:text-text'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div>
            <label className="block text-sm font-bold text-text mb-1">Full Name</label>
            <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} type="text" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-text outline-none focus:border-primary/50 transition-colors placeholder-gray-400 font-medium" placeholder="John Doe" required />
            {fieldErrors.name && <p className="mt-1 text-xs text-primary font-bold">{fieldErrors.name}</p>}
          </div>
          <div>
            <label className="block text-sm font-bold text-text mb-1">Email</label>
            <input value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} type="email" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-text outline-none focus:border-primary/50 transition-colors placeholder-gray-400 font-medium" placeholder="invest@example.com" required />
            {fieldErrors.email && <p className="mt-1 text-xs text-primary font-bold">{fieldErrors.email}</p>}
          </div>
          <div>
            <label className="block text-sm font-bold text-text mb-1">Mobile Number</label>
            <input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} type="tel" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-text outline-none focus:border-primary/50 transition-colors placeholder-gray-400 font-medium" placeholder="+91 98765 43210" required />
            {fieldErrors.phone && <p className="mt-1 text-xs text-primary font-bold">{fieldErrors.phone}</p>}
          </div>
          <div>
            <label className="block text-sm font-bold text-text mb-1">Password</label>
            <div className="relative">
              <input value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} type={showPassword ? "text" : "password"} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 pr-12 text-text outline-none focus:border-primary/50 transition-colors placeholder-gray-400 font-medium" placeholder="Minimum 8 characters" minLength={8} required />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {fieldErrors.password ? (
              <p className="mt-1 text-xs text-primary font-bold">{fieldErrors.password}</p>
            ) : (
              <p className="mt-1 text-xs text-gray-400 font-medium">Minimum 8 characters required</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-bold text-text mb-1">Confirm Password</label>
            <div className="relative">
              <input value={form.confirmPassword} onChange={(event) => setForm({ ...form, confirmPassword: event.target.value })} type={showConfirmPassword ? "text" : "password"} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 pr-12 text-text outline-none focus:border-primary/50 transition-colors placeholder-gray-400 font-medium" placeholder="Confirm your password" minLength={8} required />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {(accountType === 'broker' || accountType === 'developer') && (
            <div className="grid gap-5 rounded-2xl border border-gray-100 bg-gray-50/70 p-4">
              <div>
                <label className="block text-sm font-bold text-text mb-1">Company Name</label>
                <input value={form.companyName} onChange={(event) => setForm({ ...form, companyName: event.target.value })} type="text" className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-text outline-none focus:border-primary/50 transition-colors placeholder-gray-400 font-medium" placeholder="Plotyards Realty" required />
              </div>
              <div>
                <label className="block text-sm font-bold text-text mb-1">Office Address</label>
                <textarea value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} className="min-h-24 w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-text outline-none focus:border-primary/50 transition-colors placeholder-gray-400 font-medium" placeholder="Office address and operating city" required />
              </div>
            </div>
          )}

          <button disabled={loading} className="w-full bg-primary hover:bg-rose-600 disabled:opacity-60 text-white font-bold py-4 rounded-xl mt-2 transition-colors text-lg shadow-sm">
            {loading ? 'Creating...' : accountType === 'broker' ? 'Register as Associate Partner' : 'Register as Developer'}
          </button>

          <div className="text-center mt-2 text-sm font-medium text-gray-500">
            Already have an account?
            <Link href="/login" className="text-primary hover:text-rose-600 font-bold ml-1 transition-colors">
              Sign In
            </Link>
          </div>
        </form>
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

export default Register;
