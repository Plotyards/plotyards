import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, XCircle, Sparkles, Zap, Award, X } from 'lucide-react';
import { apiRequest } from '../lib/api';

const RAZORPAY_CHECKOUT_URL = 'https://checkout.razorpay.com/v1/checkout.js';

const loadRazorpayCheckout = () => new Promise((resolve) => {
  if (window.Razorpay) {
    resolve(true);
    return;
  }

  const existingScript = document.querySelector(`script[src="${RAZORPAY_CHECKOUT_URL}"]`);
  if (existingScript) {
    existingScript.addEventListener('load', () => resolve(true), { once: true });
    existingScript.addEventListener('error', () => resolve(false), { once: true });
    return;
  }

  const script = document.createElement('script');
  script.src = RAZORPAY_CHECKOUT_URL;
  script.async = true;
  script.onload = () => resolve(true);
  script.onerror = () => resolve(false);
  document.body.appendChild(script);
});

export default function SubscriptionModal({ isOpen, onClose, onSuccess, user }) {
  const [loadingPlan, setLoadingPlan] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const openRazorpayCheckout = async (subscriptionData) => {
    const isLoaded = await loadRazorpayCheckout();
    if (!isLoaded || !window.Razorpay) {
      throw new Error('Unable to load Razorpay checkout. Please try again.');
    }

    const { payment, subscription } = subscriptionData;

    return new Promise((resolve, reject) => {
      const checkout = new window.Razorpay({
        key: payment.keyId,
        amount: payment.amount,
        currency: payment.currency,
        name: 'Plotyards',
        description: subscriptionData.plan === 'book_my_realtor' ? 'Book My Realtor Lifetime Membership' : 'Plotyards Growth Subscription Plan',
        order_id: payment.order.id,
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: user?.brokerProfile?.contactPhone || user?.phone || ''
        },
        theme: {
          color: '#2563eb'
        },
        handler: async (response) => {
          try {
            const verified = await apiRequest('/service/subscriptions/verify', {
              method: 'POST',
              body: {
                subscriptionId: subscription._id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              }
            });
            resolve(verified);
          } catch (error) {
            reject(error);
          }
        },
        modal: {
          ondismiss: () => reject(new Error('Payment cancelled.'))
        }
      });

      checkout.on('payment.failed', (response) => {
        reject(new Error(response.error?.description || 'Payment failed. Please try again.'));
      });

      checkout.open();
    });
  };

  const handleSelectPlan = async (plan) => {
    setLoadingPlan(plan);
    setError('');
    setSuccessMsg('');
    try {
      const res = await apiRequest('/service/subscriptions', {
        method: 'POST',
        body: { plan }
      });

      if (res?.payment?.provider === 'razorpay') {
        const verified = await openRazorpayCheckout(res);
        setSuccessMsg(verified?.message || 'Payment Successful! Subscription activated 🎉');
      } else {
        setSuccessMsg(res?.payment?.message || res?.message || 'Plan updated successfully!');
      }

      if (onSuccess) onSuccess();
      setTimeout(() => {
        onClose();
      }, 1800);
    } catch (err) {
      setError(err.message || 'Failed to complete payment.');
    } finally {
      setLoadingPlan('');
    }
  };

  const handleJoinBookMyRealtor = async () => {
    await handleSelectPlan('book_my_realtor');
  };

  const hasActivePaidPlan = user?.brokerProfile?.subscriptionPlan === 'paid' || user?.brokerProfile?.bookMyRealtorMember;

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
        <div className={`grid grid-cols-1 ${hasActivePaidPlan ? 'md:grid-cols-2 max-w-3xl mx-auto' : 'md:grid-cols-3'} gap-6`}>

          {/* Option 1: Free Plan (Only shown for users without active paid plan) */}
          {!hasActivePaidPlan && (
            <div className="bg-surface border border-gray-200 rounded-[2rem] p-6 flex flex-col justify-between hover:shadow-md transition-all">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-extrabold text-text">Free Plan</h3>
                    <p className="text-gray-500 text-xs font-medium mt-1">Starter access for realtors</p>
                  </div>
                  <span className="text-2xl font-black text-text">₹0</span>
                </div>

                <ul className="space-y-3 text-xs sm:text-sm text-gray-700 font-medium mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" /> 2 Property Listings
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" /> Basic Realtor Profile
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" /> Direct Call & Chat
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
          )}

          {/* Option 2: Book My Realtor Lifetime Membership (Featured - Most Popular) */}
          <div className="bg-gradient-to-b from-blue-50/90 via-white to-blue-50/40 border-2 border-blue-500 rounded-[2rem] p-6 flex flex-col justify-between relative shadow-xl scale-105 z-10">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-blue-600 text-white font-extrabold text-xs uppercase tracking-wider px-4 py-1 rounded-full shadow-md flex items-center gap-1">
              Most Popular ⭐
            </div>

            <div>
              <div className="flex justify-between items-start mb-4 mt-2">
                <div>
                  <h3 className="text-xl font-extrabold text-blue-900">Book My Realtor</h3>
                  <p className="text-blue-600/80 text-xs font-semibold mt-1">One-Time Payment</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-blue-700">₹699</span>
                  <span className="text-blue-600 text-xs block font-bold">Lifetime</span>
                </div>
              </div>

              <ul className="space-y-2 text-xs text-slate-700 font-medium mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-blue-600 flex-shrink-0" /> <strong>Lifetime Realtor Profile</strong>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-blue-600 flex-shrink-0" /> Area-wise Search Visibility
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-blue-600 flex-shrink-0" /> Buyer Lead Access
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-blue-600 flex-shrink-0" /> Direct Call Button & Chat
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-blue-600 flex-shrink-0" /> WhatsApp Button Integration
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-blue-600 flex-shrink-0" /> Verified Badge & RERA
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-blue-600 flex-shrink-0" /> Social Media Links & Shareable Link
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-blue-600 flex-shrink-0" /> <strong>Unlimited Property Listings</strong>
                </li>
              </ul>
            </div>

            <button
              onClick={handleJoinBookMyRealtor}
              disabled={loadingPlan === 'book_my_realtor' || Boolean(user?.brokerProfile?.bookMyRealtorMember)}
              className={`w-full py-3.5 rounded-xl font-extrabold text-sm transition-colors shadow-md disabled:opacity-80 ${
                user?.brokerProfile?.bookMyRealtorMember
                  ? 'bg-emerald-600 text-white cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {loadingPlan === 'book_my_realtor'
                ? 'Activating...'
                : user?.brokerProfile?.bookMyRealtorMember
                  ? 'Active Membership ✓'
                  : 'Join Now'}
            </button>
          </div>

          {/* Option 3: Growth Plan */}
          <div className="bg-surface border border-gray-200 rounded-[2rem] p-6 flex flex-col justify-between hover:shadow-md transition-all">
            <div>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-extrabold text-text">Growth Plan</h3>
                  <p className="text-gray-500 text-xs font-semibold mt-1">Full Agency Marketing</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-primary">₹25,000</span>
                  <span className="text-gray-400 text-xs block font-bold">/ Month</span>
                </div>
              </div>

              <ul className="space-y-2 text-xs text-text font-medium mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-primary flex-shrink-0" /> <strong>Unlimited Property Listings</strong>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-primary flex-shrink-0" /> <strong>10 UGC Ad Videos</strong>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-primary flex-shrink-0" /> Professional Shoot & Editing
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-primary flex-shrink-0" /> Script Writing & Content Planning
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-primary flex-shrink-0" /> Brand & Social Media Promotion
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-primary flex-shrink-0" /> Premium Lead Access & Priority Listing
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-primary flex-shrink-0" /> Dedicated Marketing Support
                </li>
              </ul>
            </div>

            <button
              onClick={() => handleSelectPlan('paid')}
              disabled={loadingPlan === 'paid'}
              className="w-full py-3.5 rounded-xl font-extrabold bg-primary hover:bg-rose-600 text-white transition-colors shadow-sm disabled:opacity-50 text-sm"
            >
              {loadingPlan === 'paid' ? 'Processing...' : 'Upgrade Now'}
            </button>
          </div>

        </div>

        <div className="mt-8 text-center text-xs font-medium text-gray-400">
          * Book My Realtor (₹699 Lifetime) is a one-time payment plan for lifetime visibility & unlimited listings.
        </div>

      </div>
    </div>
  );
}
