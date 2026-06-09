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

  const premiumPlan = {
    id: 'premium',
    name: 'Premium Associate Partner Plan',
    price: `Rs. ${(11000 * quantity).toLocaleString('en-IN')}`,
    period: '3 months',
    highlights: [
      `${6 * quantity} Active Listings`,
      `${6 * quantity} UGC Ad Reels`,
      `${100 * quantity} Buyers Inquiries`,
      'Featured on PlotYards Marketplace',
      'Reels Published on PlotYards Media Channels',
      'Collaboration Post with Broker’s Instagram',
      'Dedicated Promotion for Your Plot Inventory'
    ]
  };

  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const hasActivePlan = mounted && user?.brokerProfile?.subscriptionPlan && user?.brokerProfile?.subscriptionPlan !== 'free';

  useEffect(() => {
    if (hasActivePlan) {
      setQuantity(1);
    }
  }, [hasActivePlan]);

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
        description: 'Premium Associate Partner Subscription',
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

  const handleSubscribe = async () => {
    if (!user) {
      navigate.push('/login?from=/subscribe');
      return;
    }

    try {
      setLoading(true);
      setLoading(true);
      setStatus('');
      setPopup(null);
      const data = await apiRequest('/service/subscriptions', { 
        method: 'POST', 
        body: { plan: 'premium', quantity } 
      });

      if (data.payment?.provider === 'razorpay' && data.payment?.order?.id) {
        const verified = await openRazorpayCheckout(data);
        await refreshMe();
        setPopup({ type: 'success', title: 'Premium Activated', message: verified.message || 'Premium plan activated successfully.' });
        return;
      }

      await refreshMe();
      navigate.push('/dashboard?tab=overview');
    } catch (error) {
      const msg = error.message || '';
      if (msg.toLowerCase().includes('authentication') || msg.toLowerCase().includes('not authorized') || msg.toLowerCase().includes('log in')) {
        navigate.push('/login?from=/subscribe');
        return;
      }
      setPopup({ type: 'error', title: 'Payment Failed', message: msg || 'Unable to start subscription payment.' });
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
    <div className="min-h-screen pt-32 pb-16 flex flex-col items-center justify-center bg-surface px-6">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-card border border-gray-100 relative overflow-hidden flex flex-col">
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/10 rounded-full blur-[50px]"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-secondary/10 rounded-full blur-[50px]"></div>

        <div className="text-center mb-6 relative z-10">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-3">
            <ShieldCheck size={26} />
          </div>
          <h2 className="text-2xl font-extrabold text-text leading-tight">Associate Partner Subscription</h2>
          <p className="mt-2 text-sm font-semibold text-muted">
            Subscribe to list plots and receive direct buyer leads.
          </p>
        </div>

        <div className="flex flex-col rounded-2xl border border-primary/20 bg-white p-6 shadow-sm relative z-10 ring-4 ring-primary/[0.03]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-extrabold text-text">{premiumPlan.name}</h3>
              <div className="mt-4 flex flex-col gap-1">
                <div className="flex items-end gap-2">
                  <p className="text-4xl font-extrabold text-text">{premiumPlan.price}</p>
                  <p className="pb-1 text-sm font-bold text-muted">/ {premiumPlan.period}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-4 flex items-center justify-between border-y border-gray-100 py-4">
              <span className="text-sm font-bold text-text">Package Quantity</span>
              <div className="flex items-center gap-3 bg-gray-50 p-1 rounded-xl border border-gray-100">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-white text-gray-600 hover:text-primary hover:bg-rose-50 border border-gray-200 transition-colors"
                  disabled={quantity <= 1}
                >
                  <Minus size={16} />
                </button>
                <span className="w-6 text-center font-extrabold text-lg">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-white text-gray-600 hover:text-primary hover:bg-rose-50 border border-gray-200 transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

          {hasActivePlan && (
            <div className="mt-4 border-y border-primary/20 bg-primary/5 p-4 rounded-xl">
              <p className="text-sm font-extrabold text-primary flex items-center gap-2">
                <Plus size={16} /> Add another {6 * quantity} listings to the existing plan
              </p>
              <p className="mt-1 text-xs font-semibold text-muted">
                Validity will be extended by 3 months from your current expiry date.
              </p>
            </div>
          )}

          <div className="mt-5 space-y-3">
            {premiumPlan.highlights.map((item) => (
              <p key={item} className="flex items-start gap-2 text-xs font-bold text-muted leading-tight">
                <CheckCircle2 size={15} className="text-emerald-600 mt-0.5 flex-shrink-0" />
                <span>{item}</span>
              </p>
            ))}
          </div>

          <div className="mt-5 rounded-xl border border-primary/15 bg-primary/5 p-3">
            <p className="flex items-center gap-1.5 text-xs font-extrabold text-primary">
              <TrendingUp size={14} />
              Premium promotion package
            </p>
            <p className="mt-1 text-[11px] font-semibold text-muted leading-normal">
              Instant automatic associate partner approval, verified badge status, and unlimited buyer leads.
            </p>
          </div>

          <button
            onClick={handleSubscribe}
            disabled={loading}
            className="mt-6 w-full bg-primary hover:bg-rose-600 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl transition-colors shadow-md flex items-center justify-center gap-2"
          >
            {loading ? 'Processing...' : hasActivePlan ? 'Upgrade Plan' : 'Subscribe with Razorpay'}
          </button>
          
          <p className="mt-3 text-center text-[10px] font-semibold text-muted">
            Payment is subject to our{' '}
            <Link href="/refund-policy" className="font-extrabold text-primary hover:text-rose-600">
              Refund Policy
            </Link>
            .
          </p>
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
