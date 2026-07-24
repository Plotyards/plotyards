import React, { useState } from 'react';
import { apiRequest } from '../lib/api';

export default function SubscriptionModal({ isOpen, onClose, onSuccess, user }) {
  const [loadingPlan, setLoadingPlan] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSelectPlan = async (plan) => {
    setLoadingPlan(plan);
    setError('');
    setSuccessMsg('');
    try {
      const res = await apiRequest('/realtors/subscription/select', {
        method: 'POST',
        body: JSON.stringify({ plan })
      });
      setSuccessMsg(res.message || 'Plan updated successfully!');
      if (onSuccess) onSuccess();
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to update plan');
    } finally {
      setLoadingPlan('');
    }
  };

  const handleJoinBookMyRealtor = async () => {
    setLoadingPlan('book_my_realtor');
    setError('');
    setSuccessMsg('');
    try {
      const res = await apiRequest('/realtors/membership/book-my-realtor', {
        method: 'POST'
      });
      setSuccessMsg(res.message || 'Book My Realtor Membership activated!');
      if (onSuccess) onSuccess();
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to activate membership');
    } finally {
      setLoadingPlan('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-5xl w-full p-6 sm:p-8 text-white relative shadow-2xl my-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800/80 rounded-full p-2 transition"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
          <span className="bg-emerald-500/10 text-emerald-400 text-xs font-semibold px-3 py-1 rounded-full border border-emerald-500/20 uppercase tracking-wider">
            Realtor Memberships & Plans
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold mt-3 tracking-tight bg-gradient-to-r from-white via-slate-200 to-emerald-400 bg-clip-text text-transparent">
            Choose Your Plotyards Growth Plan
          </h2>
          <p className="text-slate-400 text-sm sm:text-base mt-2">
            Grow your real estate business with Plotyards marketing, leads, and area-wise buyer discovery.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-2xl text-center text-sm font-medium">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-2xl text-center text-sm font-medium">
            {successMsg}
          </div>
        )}

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Option 1: Free Plan */}
          <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-6 flex flex-col justify-between hover:border-slate-600 transition">
            <div>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold">Free Plan</h3>
                  <p className="text-slate-400 text-xs mt-1">Starter access for realtors</p>
                </div>
                <span className="text-2xl font-extrabold text-white">₹0</span>
              </div>

              <ul className="space-y-3 text-sm text-slate-300 mb-6">
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400 font-bold">✓</span> 2 Property Listings
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400 font-bold">✓</span> Basic Realtor Profile
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400 font-bold">✓</span> Direct Call & Chat by Buyers
                </li>
                <li className="flex items-center gap-2 text-slate-500">
                  <span>✕</span> No Marketing Support
                </li>
              </ul>
            </div>

            <button
              onClick={() => handleSelectPlan('free')}
              disabled={loadingPlan === 'free'}
              className="w-full py-3 rounded-xl font-semibold bg-slate-700 hover:bg-slate-600 text-white transition disabled:opacity-50"
            >
              {loadingPlan === 'free' ? 'Updating...' : 'Continue Free'}
            </button>
          </div>

          {/* Option 2: Paid Plan (Featured) */}
          <div className="bg-gradient-to-b from-emerald-950/40 via-slate-800/80 to-slate-900 border-2 border-emerald-500/50 rounded-2xl p-6 flex flex-col justify-between relative shadow-xl shadow-emerald-950/30 scale-105 z-10">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-slate-950 font-bold text-xs uppercase tracking-wider px-3 py-0.5 rounded-full">
              Most Popular
            </div>

            <div>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-emerald-300">Paid Plan</h3>
                  <p className="text-slate-400 text-xs mt-1">Marketing-as-a-Service Package</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-extrabold text-emerald-400">₹25,000</span>
                  <span className="text-slate-400 text-xs block">/ Month</span>
                </div>
              </div>

              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-200 mb-6">
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400 font-bold">✓</span> <strong>10 Property Listings</strong>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400 font-bold">✓</span> <strong>10 UGC Ad Videos</strong>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400 font-bold">✓</span> Professional Shoot & Editing
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400 font-bold">✓</span> Script Writing & Content Planning
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400 font-bold">✓</span> Realtor Brand Promotion
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400 font-bold">✓</span> Social Media Promotion
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400 font-bold">✓</span> Direct Buyer Lead Access
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400 font-bold">✓</span> Dedicated Marketing Support
                </li>
              </ul>
            </div>

            <button
              onClick={() => handleSelectPlan('paid')}
              disabled={loadingPlan === 'paid'}
              className="w-full py-3 rounded-xl font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition shadow-lg shadow-emerald-500/20 disabled:opacity-50"
            >
              {loadingPlan === 'paid' ? 'Processing...' : 'Upgrade Now (₹25,000/mo)'}
            </button>
          </div>

          {/* Option 3: Book My Realtor Lifetime Membership */}
          <div className="bg-slate-800/50 border border-blue-500/30 rounded-2xl p-6 flex flex-col justify-between hover:border-blue-500/60 transition">
            <div>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-blue-300">Book My Realtor</h3>
                  <p className="text-slate-400 text-xs mt-1">Directory Add-On Membership</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-extrabold text-blue-400">₹249</span>
                  <span className="text-blue-300/70 text-xs block font-semibold">Lifetime</span>
                </div>
              </div>

              <ul className="space-y-3 text-sm text-slate-300 mb-6">
                <li className="flex items-center gap-2">
                  <span className="text-blue-400 font-bold">✓</span> Listed in <strong>Book My Realtor Directory</strong>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-400 font-bold">✓</span> Area & Locality Buyer Discovery
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-400 font-bold">✓</span> Direct WhatsApp & Call Buttons
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-400 font-bold">✓</span> Social Media Links Visibility
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-400 font-bold">✓</span> Verified RERA Badge (after admin check)
                </li>
              </ul>
            </div>

            <button
              onClick={handleJoinBookMyRealtor}
              disabled={loadingPlan === 'book_my_realtor'}
              className="w-full py-3 rounded-xl font-bold bg-blue-600 hover:bg-blue-500 text-white transition shadow-lg shadow-blue-600/20 disabled:opacity-50"
            >
              {loadingPlan === 'book_my_realtor' ? 'Activating...' : 'Join Now (₹249 Lifetime)'}
            </button>
          </div>

        </div>

        <div className="mt-8 text-center text-xs text-slate-500">
          * Book My Realtor (₹249 Lifetime) is an independent directory add-on available for both Free and Paid realtors.
        </div>

      </div>
    </div>
  );
}
