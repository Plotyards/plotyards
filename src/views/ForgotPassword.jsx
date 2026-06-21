"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiRequest } from '../lib/api';

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState('');
  const [popup, setPopup] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const navigate = useRouter();

  const handleSendOtp = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await apiRequest('/auth/forgot-password', {
        method: 'POST',
        body: { email }
      });

      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      await apiRequest('/auth/verify-reset-otp', {
        method: 'POST',
        body: { email, otp }
      });

      setStep(3);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const data = await apiRequest('/auth/reset-password', {
        method: 'POST',
        body: { email, otp, newPassword }
      });

      setPopup({ type: 'success', message: 'Your password reset successfully!' });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePopupClose = () => {
    if (popup?.type === 'success') {
      navigate.push('/login');
    }
    setPopup(null);
  };

  return (
    <div className="flex min-h-screen items-start justify-center bg-surface px-6 pb-12 pt-24 md:items-center md:pt-32">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-card border border-gray-100 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/10 rounded-full blur-[50px]"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-secondary/10 rounded-full blur-[50px]"></div>

        <div className="relative z-10 flex flex-col gap-5">
          <div className="text-center mb-1">
            <h2 className="text-3xl font-extrabold text-text mb-2">Forgot Password</h2>
            <p className="text-gray-500 font-medium text-sm">
              {step === 1 && 'Enter your email to receive a password reset OTP'}
              {step === 2 && 'Enter the OTP sent to your email'}
              {step === 3 && 'Create a new secure password'}
            </p>
          </div>

          {error && !popup && <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-bold text-primary">{error}</p>}

          {step === 1 ? (
            <form onSubmit={handleSendOtp} className="flex flex-col gap-5">
              <div>
                <label className="block text-sm font-bold text-text mb-1">Email Address</label>
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  type="email"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-text outline-none focus:border-primary/50 transition-colors placeholder-gray-400 font-medium"
                  placeholder="name@example.com"
                  required
                />
              </div>
              <button disabled={loading} className="w-full bg-primary hover:bg-rose-600 disabled:opacity-60 text-white font-bold py-4 rounded-xl mt-2 transition-colors text-lg shadow-sm">
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </button>
            </form>
          ) : step === 2 ? (
            <form onSubmit={handleVerifyOtp} className="flex flex-col gap-5">
              <div>
                <label className="block text-sm font-bold text-text mb-1">OTP</label>
                <input
                  value={otp}
                  onChange={(event) => setOtp(event.target.value)}
                  type="text"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-text outline-none focus:border-primary/50 transition-colors placeholder-gray-400 font-medium tracking-[0.5em] text-center"
                  placeholder="------"
                  maxLength={6}
                  required
                />
              </div>
              <button disabled={loading} className="w-full bg-primary hover:bg-rose-600 disabled:opacity-60 text-white font-bold py-4 rounded-xl mt-2 transition-colors text-lg shadow-sm">
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="flex flex-col gap-5">
              <div>
                <label className="block text-sm font-bold text-text mb-1">New Password</label>
                <input
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  type="password"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-text outline-none focus:border-primary/50 transition-colors placeholder-gray-400 font-medium"
                  placeholder="New Password"
                  minLength={8}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-text mb-1">Confirm Password</label>
                <input
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  type="password"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-text outline-none focus:border-primary/50 transition-colors placeholder-gray-400 font-medium"
                  placeholder="Confirm Password"
                  minLength={8}
                  required
                />
              </div>
              <button disabled={loading} className="w-full bg-primary hover:bg-rose-600 disabled:opacity-60 text-white font-bold py-4 rounded-xl mt-2 transition-colors text-lg shadow-sm">
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          )}

          <div className="text-center mt-2 text-sm font-medium text-gray-500">
            Remember your password?
            <Link href="/login" className="text-primary hover:text-rose-600 font-bold ml-1 transition-colors">
              Sign In
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
              onClick={handlePopupClose}
              className="w-full rounded-xl bg-gray-900 py-3 text-sm font-bold text-white transition-colors hover:bg-black"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ForgotPassword;
