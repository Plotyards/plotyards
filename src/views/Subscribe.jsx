"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckCircle2, CreditCard, ShieldCheck, TrendingUp, XCircle } from 'lucide-react';
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
  const { user, updateMe, refreshMe } = useAuth();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const navigate = useRouter();

  const premiumPlan = {
    id: 'premium',
    name: 'Premium Associate Partner Plan',
    price: 'Rs. 11,000',
    period: '3 months',
    highlights: [
      '6 Active Listings',
      '6 UGC Ad Reels',
      '100 Buyers Inquiries',
      'Featured on PlotYards Marketplace',
      'Reels Published on PlotYards Media Channels',
      'Collaboration Post with Broker’s Instagram',
      'Dedicated Promotion for Your Plot Inventory'
    ]
  };

  useEffect(() => {
    // If buyer is not logged in, redirect to login
    if (!user) {
      navigate.push('/login?from=/subscribe');
    }
  }, [user, navigate]);

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
    try {
      setLoading(true);
      setStatus('');
      const data = await apiRequest('/service/subscriptions', { 
        method: 'POST', 
        body: { plan: 'premium' } 
      });

      if (data.payment?.provider === 'razorpay' && data.payment?.order?.id) {
        setStatus('Opening Razorpay checkout...');
        const verified = await openRazorpayCheckout(data);
        await refreshMe();
        navigate.push('/dashboard?tab=overview');
        return;
      }

      await refreshMe();
      navigate.push('/dashboard?tab=overview');
    } catch (error) {
      setStatus(error.message || 'Unable to start subscription payment.');
    } finally {
      setLoading(false);
    }
  };

  const handleContinueAsUser = async () => {
    try {
      setLoading(true);
      setStatus('Switching account to buyer...');
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

        {status && (
          <p className={`rounded-xl p-3 text-sm font-bold mb-5 z-10 ${status.toLowerCase().includes('unable') || status.toLowerCase().includes('cancelled') ? 'bg-rose-50 text-primary' : 'bg-green-50 text-green-700'}`}>
            {status}
          </p>
        )}

        <div className="flex flex-col rounded-2xl border border-primary/20 bg-white p-6 shadow-sm relative z-10 ring-4 ring-primary/[0.03]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-extrabold text-text">{premiumPlan.name}</h3>
              <div className="mt-4 flex items-end gap-2">
                <p className="text-4xl font-extrabold text-text">{premiumPlan.price}</p>
                <p className="pb-1 text-sm font-bold text-muted">/ {premiumPlan.period}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-3">
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
            {loading ? 'Processing...' : 'Subscribe with Razorpay'}
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
    </div>
  );
};

export default Subscribe;
