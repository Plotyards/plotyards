"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckCircle2, CreditCard, ShieldCheck, TrendingUp, XCircle, Plus, Minus } from 'lucide-react';
import { apiRequest } from '../lib/api';
import { useAuth } from '../context/auth';

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

const Subscribe = () => {
  const { user, loading: authLoading, updateMe, refreshMe } = useAuth();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [popup, setPopup] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const navigate = useRouter();

  const isDeveloper = user?.role === 'developer' || user?.brokerProfile?.companyType === 'developer';

  const plans = [
    {
      id: 'free',
      name: 'Free Plan',
      price: '₹0',
      period: '',
      highlights: [
        '2 Property Listings',
        'Basic Realtor Profile',
        'Direct Call & Chat'
      ],
      description: 'Free entry-level access for realtors.',
      buttonText: 'Continue Free',
      isPremium: false,
      isPopular: false
    },
    {
      id: 'book_my_realtor',
      name: 'Book My Realtor',
      price: '₹699',
      period: 'Lifetime',
      badge: 'Most Popular ⭐ Recommended',
      highlights: [
        'Lifetime Realtor Profile',
        'Area-wise Search Visibility',
        'Buyer Lead Access',
        'Direct Call Button',
        'WhatsApp Button',
        'Direct Chat',
        'Verified Badge',
        'Social Media Links',
        'Realtor Public Profile',
        'Shareable Profile Link',
        'Unlimited Listings'
      ],
      description: 'Best For: Realtors who want to generate direct buyer enquiries at an affordable one-time cost.',
      buttonText: 'Join Now',
      isPopular: true,
      isBookMyRealtor: true
    },
    {
      id: 'paid',
      name: 'Growth Plan',
      price: '₹25,000',
      period: 'Month',
      highlights: [
        'Unlimited Property Listings',
        '10 UGC Advertisement Videos',
        'Professional Shoot & Editing',
        'Script Writing',
        'Content Planning',
        'Brand Promotion',
        'Social Media Promotion',
        'Premium Lead Access',
        'Priority Listing',
        'Dedicated Marketing Support'
      ],
      description: 'Plotyards works as your complete marketing partner to generate buyer leads and visibility.',
      buttonText: 'Upgrade Now',
      isPremium: true,
      isPopular: false
    }
  ];
  // Replaced above

  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const isBookMyRealtorActive = mounted && Boolean(user?.brokerProfile?.bookMyRealtorMember);
  const isGrowthPlanActive = mounted && user?.brokerProfile?.subscriptionPlan === 'paid';

  // Free Plan is hidden only when Growth Plan (paid) is active
  const visiblePlans = plans.filter((plan) => !(isGrowthPlanActive && plan.id === 'free'));

  useEffect(() => {
    if (isGrowthPlanActive) {
      setQuantity(1);
    }
  }, [isGrowthPlanActive]);

  useEffect(() => {
    // Wait for auth to finish loading before checking
    if (authLoading) return;
    if (!user) {
      navigate.push('/login?from=/subscribe');
    }
  }, [user, authLoading, navigate]);

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
        description: isDeveloper ? 'Developer Growth Package Subscription' : 'Premium Associate Partner Subscription',
        order_id: payment.order.id,
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: user?.brokerProfile?.contactPhone || user?.phone || ''
        },
        theme: {
          color: '#f80e11'
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
          ondismiss: () => reject(new Error('Payment cancelled. Premium plan was not activated.'))
        }
      });

      checkout.on('payment.failed', (response) => {
        reject(new Error(response.error?.description || 'Payment failed. Please try again.'));
      });

      checkout.open();
    });
  };

  const handleSubscribe = async (planId) => {
    if (!user) {
      navigate.push('/login?from=/subscribe');
      return;
    }

    try {
      setLoading(true);
      setStatus('');
      setPopup(null);

      // Create subscription order (Razorpay or Manual)
      const data = await apiRequest('/service/subscriptions', {
        method: 'POST',
        body: { plan: planId, quantity }
      });

      if (data?.payment?.provider === 'razorpay') {
        // Open Razorpay Checkout modal for online payment
        const verified = await openRazorpayCheckout(data);
        await refreshMe();
        setPopup({
          type: 'success',
          title: 'Payment Successful! 🎉',
          message: verified?.message || `${planId === 'book_my_realtor' ? 'Book My Realtor Membership' : 'Growth Plan'} activated successfully!`
        });
      } else {
        // Manual activation (e.g. Free plan)
        await refreshMe();
        setPopup({
          type: 'success',
          title: planId === 'paid' ? 'Growth Plan Active' : planId === 'book_my_realtor' ? 'Book My Realtor Active' : 'Free Plan Active',
          message: data?.payment?.message || data?.message || 'Subscription updated successfully.'
        });
      }
    } catch (error) {
      const msg = error.message || '';
      if (msg.toLowerCase().includes('authentication') || msg.toLowerCase().includes('not authorized') || msg.toLowerCase().includes('log in')) {
        navigate.push('/login?from=/subscribe');
        return;
      }
      setPopup({ type: 'error', title: 'Action Failed', message: msg || 'Unable to complete subscription payment.' });
    } finally {
      setLoading(false);
    }
  };

  const handleContinueAsUser = async () => {
    try {
      setLoading(true);
      await updateMe({ downgradeToUser: true });
      navigate.push('/');
    } catch (error) {
      console.error('Error downgrading:', error);
      navigate.push('/');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-16 flex flex-col items-center justify-center bg-[#f0f4f8] px-6">
      <div className="w-full max-w-5xl bg-[#f0f4f8] p-10 rounded-[3rem] shadow-[12px_12px_24px_#d1d9e6,-12px_-12px_24px_#ffffff] border-4 border-white/50 relative overflow-hidden flex flex-col">
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/10 rounded-full blur-[50px]"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-secondary/10 rounded-full blur-[50px]"></div>

        <div className="text-center mb-6 relative z-10">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-3">
            <ShieldCheck size={26} />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-text leading-tight">{isDeveloper ? 'Developer Premium Subscription' : 'Associate Partner Subscription'}</h2>
          <p className="mt-2 text-sm font-semibold text-muted">
            Subscribe to list plots and receive direct buyer leads.
          </p>

          {/* Current Active Plan Status Banner */}
          {user && (
            <div className="mt-5 max-w-2xl mx-auto bg-white rounded-2xl p-4 border border-gray-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                  isGrowthPlanActive
                    ? 'bg-purple-100 text-purple-700'
                    : isBookMyRealtorActive
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-emerald-100 text-emerald-700'
                }`}>
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block">Your Active Memberships</span>
                  <div className="flex flex-wrap items-center gap-2 mt-0.5">
                    {isBookMyRealtorActive && (
                      <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs font-extrabold px-2.5 py-0.5 rounded-full border border-blue-200">
                        🔵 Book My Realtor (Lifetime)
                      </span>
                    )}
                    {isGrowthPlanActive && (
                      <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 text-xs font-extrabold px-2.5 py-0.5 rounded-full border border-purple-200">
                        🟣 Growth Plan (₹25k/Mo)
                      </span>
                    )}
                    {!isBookMyRealtorActive && !isGrowthPlanActive && (
                      <span className="text-sm font-extrabold text-emerald-700">🟢 Free Plan (2 Listings)</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-xs font-extrabold px-3 py-1 rounded-full border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Active
                </span>
              </div>
            </div>
          )}
        </div>

        <div className={`grid grid-cols-1 ${visiblePlans.length === 2 ? 'md:grid-cols-2 max-w-4xl mx-auto' : 'md:grid-cols-3'} gap-6 relative z-10`}>
          {visiblePlans.map((plan) => {
            const isThisBookMyRealtorActive = plan.id === 'book_my_realtor' && isBookMyRealtorActive;
            const isThisGrowthActive = plan.id === 'paid' && isGrowthPlanActive;

            return (
              <div 
                key={plan.id} 
                className={`flex flex-col rounded-[2.5rem] p-6 sm:p-8 transition-transform duration-300 hover:-translate-y-2 relative ${
                  plan.isPopular 
                    ? 'bg-gradient-to-b from-blue-50/90 via-white to-blue-50/40 border-4 border-blue-500/80 shadow-[0_10px_30px_rgba(59,130,246,0.25)] scale-[1.02] z-20' 
                    : plan.isPremium 
                      ? 'bg-[#fef2f2] shadow-[inset_6px_6px_12px_rgba(248,14,17,0.08),inset_-6px_-6px_12px_rgba(255,255,255,1),8px_8px_20px_rgba(0,0,0,0.06),-8px_-8px_20px_rgba(255,255,255,1)] border-4 border-white/60' 
                      : 'bg-[#f0f4f8] shadow-[inset_6px_6px_12px_rgba(0,0,0,0.06),inset_-6px_-6px_12px_rgba(255,255,255,1),8px_8px_20px_rgba(0,0,0,0.06),-8px_-8px_20px_rgba(255,255,255,1)] border-4 border-white/60'
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white font-extrabold text-[11px] uppercase tracking-wider px-4 py-1 rounded-full shadow-lg border border-white/40 flex items-center gap-1.5 whitespace-nowrap">
                    {isThisBookMyRealtorActive ? '🟢 Active Lifetime Member' : plan.badge}
                  </div>
                )}

                <div className="flex items-start justify-between gap-4 mt-2">
                  <div>
                    <h3 className={`text-lg font-extrabold ${plan.isPopular ? 'text-blue-900' : 'text-text'}`}>{plan.name}</h3>
                    <div className="mt-3 flex flex-col gap-0.5">
                      <div className="flex items-end gap-2">
                        <p className={`text-3xl sm:text-4xl font-extrabold ${plan.isPopular ? 'text-blue-700' : 'text-text'}`}>{plan.price}</p>
                        {plan.period && <p className="pb-1 text-xs sm:text-sm font-bold text-muted">/ {plan.period}</p>}
                      </div>
                      {plan.sublabel && (
                        <span className="text-[11px] font-extrabold text-blue-600 uppercase tracking-wider">{plan.sublabel}</span>
                      )}
                    </div>
                  </div>
                </div>
                
                {plan.isPremium && plan.id === 'paid' && (
                    <div className="mt-4 flex items-center justify-between border-y border-gray-100 py-3">
                        <span className="text-xs font-bold text-text">Package Quantity</span>
                        <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-xl border border-gray-100">
                          <button
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            className="w-7 h-7 flex items-center justify-center rounded-lg bg-white text-gray-600 hover:text-primary hover:bg-rose-50 border border-gray-200 transition-colors"
                            disabled={quantity <= 1}
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-5 text-center font-extrabold text-sm">{quantity}</span>
                          <button
                            onClick={() => setQuantity(quantity + 1)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg bg-white text-gray-600 hover:text-primary hover:bg-rose-50 border border-gray-200 transition-colors"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                    </div>
                )}

                <div className="mt-5 space-y-2.5 flex-1">
                  {plan.highlights.map((item) => (
                    <p key={item} className="flex items-start gap-2 text-xs font-bold text-muted leading-tight">
                      <CheckCircle2 size={15} className={`${plan.isPopular ? 'text-blue-600' : 'text-emerald-600'} mt-0.5 flex-shrink-0`} />
                      <span className={plan.isPopular ? 'text-gray-800 font-bold' : ''}>{item}</span>
                    </p>
                  ))}
                </div>

                <div className={`mt-5 rounded-xl p-3 border ${
                  plan.isPopular 
                    ? 'border-blue-200 bg-blue-50/70 text-blue-900' 
                    : plan.isPremium 
                      ? 'border-primary/15 bg-primary/5 text-primary' 
                      : 'border-gray-200 bg-gray-100 text-gray-700'
                }`}>
                  <p className="flex items-center gap-1.5 text-xs font-extrabold">
                    {plan.isPopular ? <ShieldCheck size={14} className="text-blue-600" /> : plan.isPremium ? <TrendingUp size={14} /> : <ShieldCheck size={14} />}
                    {plan.isPopular ? 'Recommended Directory Membership' : plan.isPremium ? 'Premium promotion package' : 'Starter access'}
                  </p>
                  <p className="mt-1 text-[11px] font-semibold text-muted leading-normal">
                    {plan.description}
                  </p>
                </div>

                <button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={loading || isThisBookMyRealtorActive || (plan.id === 'free' && (isGrowthPlanActive || isBookMyRealtorActive))}
                  className={`mt-6 w-full font-extrabold py-3.5 rounded-[1.5rem] transition-all duration-300 flex items-center justify-center gap-2 text-sm disabled:opacity-60 ${
                    isThisBookMyRealtorActive
                      ? 'bg-emerald-600 text-white cursor-not-allowed'
                      : plan.isPopular
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-[0_6px_20px_rgba(37,99,235,0.4)] active:scale-95'
                        : plan.isPremium 
                          ? 'bg-primary text-white shadow-[6px_6px_12px_rgba(248,14,17,0.3),-6px_-6px_12px_rgba(255,255,255,1)] active:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.2),inset_-4px_-4px_8px_rgba(255,255,255,0.2)]' 
                          : 'bg-[#f0f4f8] text-gray-700 shadow-[6px_6px_12px_rgba(0,0,0,0.08),-6px_-6px_12px_rgba(255,255,255,1)] active:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.1),inset_-4px_-4px_8px_rgba(255,255,255,0.8)]'
                  }`}
                >
                  {loading 
                    ? 'Processing...' 
                    : isThisBookMyRealtorActive 
                      ? 'Active Membership ✓' 
                      : isThisGrowthActive 
                        ? 'Upgrade / Extend Plan' 
                        : plan.buttonText
                  }
                </button>
                
                {plan.isPremium && (
                  <p className="mt-3 text-center text-[10px] font-semibold text-muted">
                    Payment is subject to our{' '}
                    <Link href="/refund-policy" className="font-extrabold text-primary hover:text-rose-600">
                      Refund Policy
                    </Link>
                    .
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <p className="mt-8 text-center text-sm font-medium text-gray-500 relative z-10 leading-normal">
          Don't want to list properties? <br />
          <button
            onClick={handleContinueAsUser}
            disabled={loading}
            className="text-primary hover:text-rose-600 font-extrabold transition-colors underline disabled:opacity-50"
          >
            Continue as buyer
          </button>
        </p>
      </div>

      {popup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl animate-in zoom-in-95 fade-in duration-200 text-center">
            <div className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full ${popup.type === 'error' ? 'bg-rose-100 text-primary' : 'bg-green-100 text-green-600'}`}>
              <span className="text-2xl font-bold">!</span>
            </div>
            <h3 className="mb-2 text-xl font-extrabold text-text">{popup.title || (popup.type === 'error' ? 'Oops!' : 'Success')}</h3>
            <p className="mb-6 text-sm font-medium text-gray-500">{popup.message}</p>
            <button
              onClick={() => {
                setPopup(null);
                if (popup.type === 'success') {
                  navigate.push('/dashboard?tab=overview');
                }
              }}
              className="w-full rounded-xl bg-gray-900 py-3 text-sm font-bold text-white transition-colors hover:bg-black"
            >
              {popup.type === 'success' ? 'Continue to Dashboard' : 'Close'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Subscribe;
