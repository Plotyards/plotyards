import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, XCircle, Sparkles, Zap, Award, X } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-white border border-gray-100 rounded-[2.5rem] max-w-5xl w-full p-6 sm:p-10 text-text relative shadow-2xl my-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-text bg-gray-100 rounded-full p-2.5 transition-colors"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
          <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-extrabold px-4 py-1.5 rounded-full border border-primary/20 uppercase tracking-wider">
            <ShieldCheck size={15} /> Realtor Memberships & Plans
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold mt-3 tracking-tight text-text">
            Choose Your Growth Plan<span className="text-primary">.</span>
          </h2>
          <p className="text-gray-500 font-medium text-sm sm:text-base mt-2">
            Grow your real estate business with Plotyards marketing, leads, and area-wise buyer discovery.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-primary rounded-2xl text-center text-sm font-bold">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl text-center text-sm font-bold">
            {successMsg}
          </div>
        )}

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Option 1: Free Plan */}
          <div className="bg-surface border border-gray-200 rounded-[2rem] p-6 flex flex-col justify-between hover:shadow-md transition-all">
            <div>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-extrabold text-text">Free Plan</h3>
                  <p className="text-gray-500 text-xs font-medium mt-1">Starter access for realtors</p>
                </div>
                <span className="text-2xl font-black text-text">₹0</span>
              </div>

              <ul className="space-y-3 text-sm text-gray-700 font-medium mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" /> 2 Property Listings
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" /> Basic Profile
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" /> Direct Call & Chat
                </li>
                <li className="flex items-center gap-2 text-gray-400">
                  <XCircle size={16} className="flex-shrink-0" /> No Marketing Support
                </li>
              </ul>
            </div>

            <button
              onClick={() => handleSelectPlan('free')}
              disabled={loadingPlan === 'free'}
              className="w-full py-3.5 rounded-xl font-bold bg-gray-200 hover:bg-gray-300 text-text transition-colors disabled:opacity-50 text-sm"
            >
              {loadingPlan === 'free' ? 'Updating...' : 'Continue Free'}
            </button>
          </div>

          {/* Option 2: Paid Plan (Featured) */}
          <div className="bg-gradient-to-b from-rose-50/60 via-white to-white border-2 border-primary rounded-[2rem] p-6 flex flex-col justify-between relative shadow-xl scale-105 z-10">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-primary text-white font-extrabold text-xs uppercase tracking-wider px-4 py-1 rounded-full shadow-sm">
              Most Popular
            </div>

            <div>
              <div className="flex justify-between items-start mb-4 mt-2">
                <div>
                  <h3 className="text-xl font-extrabold text-primary">Paid Plan</h3>
                  <p className="text-gray-500 text-xs font-semibold mt-1">Marketing-as-a-Service</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-primary">₹25,000</span>
                  <span className="text-gray-400 text-xs block font-bold">/ Month</span>
                </div>
              </div>

              <ul className="space-y-2.5 text-xs sm:text-sm text-text font-medium mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-primary flex-shrink-0" /> <strong>10 Property Listings</strong>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-primary flex-shrink-0" /> <strong>10 UGC Ad Videos</strong>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-primary flex-shrink-0" /> Professional Shoot & Editing
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-primary flex-shrink-0" /> Script Writing & Content Planning
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-primary flex-shrink-0" /> Realtor Brand Promotion
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-primary flex-shrink-0" /> Social Media Promotion
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-primary flex-shrink-0" /> Direct Buyer Lead Access
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-primary flex-shrink-0" /> Dedicated Marketing Support
                </li>
              </ul>
            </div>

            <button
              onClick={() => handleSelectPlan('paid')}
              disabled={loadingPlan === 'paid'}
              className="w-full py-3.5 rounded-xl font-extrabold bg-primary hover:bg-rose-600 text-white transition-colors shadow-md disabled:opacity-50 text-sm"
            >
              {loadingPlan === 'paid' ? 'Processing...' : 'Upgrade Now (₹25,000/mo)'}
            </button>
          </div>

          {/* Option 3: Book My Realtor Lifetime Membership */}
          <div className="bg-blue-50/40 border border-blue-200 rounded-[2rem] p-6 flex flex-col justify-between hover:shadow-md transition-all">
            <div>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-extrabold text-blue-900">Book My Realtor</h3>
                  <p className="text-blue-600/70 text-xs font-semibold mt-1">Directory Membership</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-blue-700">₹249</span>
                  <span className="text-blue-600 text-xs block font-bold">Lifetime</span>
                </div>
              </div>

              <ul className="space-y-3 text-sm text-slate-700 font-medium mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-blue-600 flex-shrink-0" /> Listed in <strong>Book My Realtor Directory</strong>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-blue-600 flex-shrink-0" /> Area & Locality Buyer Discovery
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-blue-600 flex-shrink-0" /> Direct WhatsApp & Call Buttons
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-blue-600 flex-shrink-0" /> Social Media Links Visibility
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-blue-600 flex-shrink-0" /> RERA Badge (after verification)
                </li>
              </ul>
            </div>

            <button
              onClick={handleJoinBookMyRealtor}
              disabled={loadingPlan === 'book_my_realtor'}
              className="w-full py-3.5 rounded-xl font-extrabold bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-sm disabled:opacity-50 text-sm"
            >
              {loadingPlan === 'book_my_realtor' ? 'Activating...' : 'Join Now (₹249 Lifetime)'}
            </button>
          </div>

        </div>

        <div className="mt-8 text-center text-xs font-medium text-gray-400">
          * Book My Realtor (₹249 Lifetime) is an independent directory membership available for both Free and Paid realtors.
        </div>

      </div>
    </div>
  );
}
