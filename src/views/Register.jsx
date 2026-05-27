"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { useState } from 'react';
import { useAuth } from '../context/auth';

const Register = () => {
  const [accountType, setAccountType] = useState('user');
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    companyName: '',
    reraId: '',
    address: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useRouter();
  const { register } = useAuth();

  const handleRegister = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await register({
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        isBroker: accountType === 'broker',
        brokerProfile: accountType === 'broker'
          ? {
              companyName: form.companyName,
              reraId: form.reraId,
              contactPhone: form.phone,
              address: form.address
            }
          : undefined
      });

      navigate.push(user.role === 'broker' ? '/subscribe' : '/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-12 flex items-center justify-center bg-surface px-6">
      <div className="w-full max-w-xl bg-white p-8 rounded-3xl shadow-card border border-gray-100 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/10 rounded-full blur-[50px]"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-secondary/10 rounded-full blur-[50px]"></div>

        <form onSubmit={handleRegister} className="relative z-10 flex flex-col gap-5">
          <div className="text-center mb-3">
            <h2 className="text-3xl font-extrabold text-text mb-2">
              {accountType === 'broker' ? 'Broker Registration' : 'Create Buyer Account'}
            </h2>
            <p className="text-gray-500 font-medium text-sm">
              {accountType === 'broker'
                ? 'Share your business details and start managing plot listings.'
                : "Join India's premium plot investment platform"}
            </p>
          </div>

          {error && <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-bold text-primary">{error}</p>}

          <div className="grid grid-cols-2 gap-2 rounded-2xl bg-gray-50 p-1">
            {[
              ['user', 'Buyer'],
              ['broker', 'Broker']
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
          </div>
          <div>
            <label className="block text-sm font-bold text-text mb-1">Email</label>
            <input value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} type="email" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-text outline-none focus:border-primary/50 transition-colors placeholder-gray-400 font-medium" placeholder="invest@example.com" required />
          </div>
          <div>
            <label className="block text-sm font-bold text-text mb-1">Mobile Number</label>
            <input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} type="tel" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-text outline-none focus:border-primary/50 transition-colors placeholder-gray-400 font-medium" placeholder="+91 98765 43210" required />
          </div>
          <div>
            <label className="block text-sm font-bold text-text mb-1">Password</label>
            <input value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} type="password" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-text outline-none focus:border-primary/50 transition-colors placeholder-gray-400 font-medium" placeholder="Password" minLength={6} required />
          </div>

          {accountType === 'broker' && (
            <div className="grid gap-5 rounded-2xl border border-gray-100 bg-gray-50/70 p-4">
              <div>
                <label className="block text-sm font-bold text-text mb-1">Company Name</label>
                <input value={form.companyName} onChange={(event) => setForm({ ...form, companyName: event.target.value })} type="text" className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-text outline-none focus:border-primary/50 transition-colors placeholder-gray-400 font-medium" placeholder="Plotyards Realty" required />
              </div>
              <div>
                <label className="block text-sm font-bold text-text mb-1">RERA ID</label>
                <input value={form.reraId} onChange={(event) => setForm({ ...form, reraId: event.target.value })} type="text" className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-text outline-none focus:border-primary/50 transition-colors placeholder-gray-400 font-medium" placeholder="RERA registration number" required />
              </div>
              <div>
                <label className="block text-sm font-bold text-text mb-1">Office Address</label>
                <textarea value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} className="min-h-24 w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-text outline-none focus:border-primary/50 transition-colors placeholder-gray-400 font-medium" placeholder="Office address and operating city" required />
              </div>
            </div>
          )}

          <button disabled={loading} className="w-full bg-primary hover:bg-rose-600 disabled:opacity-60 text-white font-bold py-4 rounded-xl mt-2 transition-colors text-lg shadow-sm">
            {loading ? 'Creating...' : accountType === 'broker' ? 'Register as Broker' : 'Sign Up as Buyer'}
          </button>

          <div className="text-center mt-2 text-sm font-medium text-gray-500">
            Already have an account?
            <Link href="/login" className="text-primary hover:text-rose-600 font-bold ml-1 transition-colors">
              Sign In
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
