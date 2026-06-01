"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import { BarChart3, CheckCircle2, Clock, Compass, CreditCard, FileText, Heart, Home as HomeIcon, Inbox, Mail, MapPin, MessageCircle, Phone, ShieldCheck, TrendingUp, Users, Video, XCircle } from 'lucide-react';
import { apiRequest } from '../lib/api';
import { useAuth } from '../context/auth';
import { adaptProperty, adaptProperties } from '../utils/propertyAdapter';
import BlogManager from '../components/BlogManager';

const TWO_DAYS_MS = 2 * 24 * 60 * 60 * 1000;
const RAZORPAY_CHECKOUT_URL = 'https://checkout.razorpay.com/v1/checkout.js';

const normalizePlan = (plan) => (['premium', 'pro', 'elite'].includes(plan) ? 'premium' : 'free');

const planFeatureRows = [
  ['Listings', '6', '9'],
  ['Reels Promotion', false, '9 Reels'],
  ['WhatsApp Chat Button', true, true],
  ['Leads Guarantee', false, '100 Leads'],
  ['Featured Visibility', false, true],
  ['Social Media Promotion', false, true],
  ['Associate Partner Approval', 'Admin review', 'Auto approval']
];

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

const FeatureValue = ({ value }) => {
  if (typeof value === 'boolean') {
    return value ? (
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
        <CheckCircle2 size={20} />
      </span>
    ) : (
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-rose-50 text-primary">
        <XCircle size={20} />
      </span>
    );
  }

  return <span className="text-sm font-extrabold text-text">{value}</span>;
};

const formatDate = (value) => new Date(value).toLocaleDateString('en-IN', {
  day: '2-digit',
  month: 'short',
  year: 'numeric'
});

const Dashboard = () => {
  const pathname = usePathname();
  const navigate = useRouter();
  const { user, isBroker, updateMe, refreshMe } = useAuth();
  const [currentTime] = useState(() => Date.now());
  const isUser = user?.role === 'user' || user?.role === 'admin';
  const roleLabel = user?.role === 'user' ? 'buyer' : user?.role === 'broker' ? 'associate partner' : user?.role;
  const brokerApproved = user?.role === 'admin' || user?.brokerStatus === 'approved';
  const rejectedAt = user?.brokerProfile?.rejectedAt;
  const canReapplyAt = rejectedAt ? new Date(new Date(rejectedAt).getTime() + TWO_DAYS_MS) : null;
  const brokerReapplyLocked = user?.brokerStatus === 'rejected' && canReapplyAt && currentTime < canReapplyAt.getTime();
  const [activeTab, setActiveTab] = useState((typeof window !== 'undefined' ? window.history.state?.tab : null) || 'overview');
  const [properties, setProperties] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [favourites, setFavourites] = useState([]);
  const [historyItems, setHistoryItems] = useState([]);
  const [subscriptionStatus, setSubscriptionStatus] = useState('');
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [currentPlan, setCurrentPlan] = useState(normalizePlan(user?.brokerProfile?.subscriptionPlan));
  const [subscriptionLoading, setSubscriptionLoading] = useState(isBroker);
  const [subscriptionUpdating, setSubscriptionUpdating] = useState('');
  const [loadingUserData, setLoadingUserData] = useState(isUser);
  const [brokerRequestStatus, setBrokerRequestStatus] = useState('');
  const [brokerRequesting, setBrokerRequesting] = useState(false);

  useEffect(() => {
    if (isBroker) {
      apiRequest('/properties/mine')
        .then((data) => setProperties(adaptProperties(data.properties)))
        .catch(() => setProperties([]));

      apiRequest('/inquiries/mine')
        .then((data) => setInquiries(data.inquiries))
        .catch(() => setInquiries([]));

      apiRequest('/service/subscriptions/me')
        .then((data) => {
          setCurrentSubscription(data.subscription);
          setCurrentPlan(normalizePlan(data.plan));
        })
        .catch(() => {
          setCurrentSubscription(null);
          setCurrentPlan(normalizePlan(user?.brokerProfile?.subscriptionPlan));
        })
        .finally(() => setSubscriptionLoading(false));
      return;
    }

    if (!isUser) return undefined;

    let cancelled = false;

    const loadUserData = async () => {
      try {
        const [favouritesData, historyData] = await Promise.all([apiRequest('/favourites'), apiRequest('/history')]);
        if (cancelled) return;
        setFavourites(favouritesData.favourites.map((item) => adaptProperty(item.property)));
        setHistoryItems(historyData.history.map((item) => adaptProperty(item.property)));
      } catch {
        if (cancelled) return;
        setFavourites([]);
        setHistoryItems([]);
      } finally {
        if (!cancelled) {
          setLoadingUserData(false);
        }
      }
    };

    loadUserData();
    return () => {
      cancelled = true;
    };
  }, [isBroker, isUser, user?.brokerProfile?.subscriptionPlan]);

  useEffect(() => {
    if (isBroker && !brokerApproved) {
      setActiveTab('subscription');
    }
  }, [isBroker, brokerApproved]);

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
        description: 'Premium Plan - 3 months',
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
          ondismiss: () => reject(new Error('Payment cancelled. Premium Plan was not activated.'))
        }
      });

      checkout.on('payment.failed', (response) => {
        reject(new Error(response.error?.description || 'Payment failed. Please try again.'));
      });

      checkout.open();
    });
  };

  const finishSubscriptionSelection = async (message, shouldRefreshUser = false) => {
    if (shouldRefreshUser) {
      await refreshMe();
    }
    setSubscriptionStatus(message);
    setActiveTab('overview');
  };

  const createSubscription = async (plan) => {
    try {
      setSubscriptionUpdating(plan);
      setSubscriptionStatus('');
      const data = await apiRequest('/service/subscriptions', { method: 'POST', body: { plan } });

      if (data.payment?.provider === 'razorpay' && data.payment?.order?.id) {
        setCurrentSubscription(data.subscription);
        setSubscriptionStatus('Opening Razorpay checkout...');
        const verified = await openRazorpayCheckout(data);
        setCurrentSubscription(verified.subscription);
        setCurrentPlan(normalizePlan(verified.plan));
        await finishSubscriptionSelection(verified.message || 'Premium Plan activated successfully.', true);
        return;
      }

      setCurrentSubscription(data.subscription);
      setCurrentPlan(normalizePlan(data.plan || plan));
      await finishSubscriptionSelection(data.payment?.message || `${data.plan || plan} plan activated.`, Boolean(data.user));
    } catch (error) {
      setSubscriptionStatus(error.message || 'Unable to update subscription.');
    } finally {
      setSubscriptionUpdating('');
    }
  };

  const handlePlanSelect = (plan, isActivePlan) => {
    if (isActivePlan) {
      setSubscriptionStatus(`${plan.name} selected.`);
      setActiveTab('overview');
      return;
    }

    createSubscription(plan.id);
  };

  const handleRequestBroker = async () => {
    if (!user) return;

    try {
      setBrokerRequesting(true);
      await updateMe({ requestBroker: true });
      navigate.push('/subscribe');
    } catch (error) {
      setBrokerRequestStatus(error.message || 'Unable to start associate partner upgrade.');
    } finally {
      setBrokerRequesting(false);
    }
  };

  const handleDeleteProperty = async (propertyId) => {
    if (!window.confirm('Delete this property permanently?')) return;
    await apiRequest(`/properties/${propertyId}`, { method: 'DELETE' });
    setProperties((current) => current.filter((item) => item.id !== propertyId));
  };

  const handleMarkSold = async (propertyId) => {
    if (!window.confirm('Mark this property as sold out? It will be hidden from public listings.')) return;
    const data = await apiRequest(`/properties/${propertyId}`, {
      method: 'PATCH',
      body: { status: 'sold' }
    });
    setProperties((current) => current.map((item) => (
      item.id === propertyId ? adaptProperty(data.property) : item
    )));
  };

  const profileViews = properties.reduce((sum, item) => sum + (Number(item.viewsCount) || 0), 0);
  const activeListings = properties.filter((item) => item.status !== 'sold').length;
  const avgCtr = profileViews ? `${((inquiries.length / profileViews) * 100).toFixed(1)}%` : '0%';

  const brokerStats = [
    [BarChart3, 'Profile Views', profileViews, 'from-primary/15 to-rose-50 text-primary'],
    [Users, 'Leads', inquiries.length, 'from-sky-100 to-blue-50 text-sky-700'],
    [HomeIcon, 'Active Listings', activeListings, 'from-emerald-100 to-green-50 text-emerald-700'],
    [TrendingUp, 'Avg. CTR', avgCtr, 'from-amber-100 to-yellow-50 text-amber-700']
  ];

  const userStats = [
    [Heart, 'Saved', favourites.length, 'from-primary/15 to-rose-50 text-primary'],
    [Clock, 'Viewed', historyItems.length, 'from-indigo-100 to-violet-50 text-indigo-700'],
    [Compass, 'Explore', 'Discover new listings', 'from-emerald-100 to-green-50 text-emerald-700']
  ];

  const activePlan = normalizePlan(currentPlan);
  const subscriptionPlans = [
    {
      id: 'premium',
      name: 'Premium Plan',
      price: 'Rs. 11,000',
      period: '3 months',
      accent: 'border-primary bg-white ring-2 ring-primary/10',
      cta: 'Pay with Razorpay',
      highlights: ['9 active listings', '9 reels promotion', '100 leads guarantee', 'Auto associate partner approval'],
      icon: CreditCard
    }
  ];

  const navItems = isBroker
    ? (brokerApproved
        ? [
            ['overview', BarChart3, 'Overview'],
            ['leads', Inbox, 'Leads'],
            ['listings', HomeIcon, 'My Listings'],
            ['blogs', FileText, 'Blogs'],
            ['subscription', CreditCard, 'Subscription']
          ]
        : [
            ['subscription', CreditCard, 'Subscription']
          ])
    : [
        ['overview', Users, 'Overview'],
        ['saved', Heart, 'Saved'],
        ['history', Clock, 'History']
      ];

  return (
    <div className="min-h-screen pt-28 pb-12 bg-surface font-sans">
      <div className="container mx-auto px-6 lg:px-12 max-w-[1400px]">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 sticky top-32">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center text-white text-xl font-bold">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <div>
                  <h3 className="font-bold text-text leading-tight">{user?.name}</h3>
                  <p className="text-xs text-primary font-bold uppercase">{roleLabel}</p>
                </div>
              </div>

              <nav className="flex flex-col gap-2">
                {navItems.map(([tab, Icon, label]) => (
                  <button key={tab} onClick={() => setActiveTab(tab)} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors text-left ${activeTab === tab ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
                    <Icon size={18} /> {label}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          <main className="lg:col-span-4">
            {isBroker ? (
              activeTab === 'subscription' ? (
                <div className="space-y-8">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <h2 className="text-3xl font-extrabold text-text">Associate Partner Subscription</h2>
                      <p className="mt-2 text-gray-500 font-medium">An active Premium plan is required to post property listings and unlock high-quality buyer leads.</p>
                    </div>
                    <span className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-xs font-extrabold uppercase text-primary">
                      <ShieldCheck size={15} />
                      {subscriptionLoading ? 'Checking plan' : activePlan === 'premium' ? 'Premium Plan Active' : 'Subscription Required'}
                    </span>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                    <div className="rounded-2xl border border-primary/15 bg-white p-5 shadow-sm">
                      <p className="text-xs font-extrabold uppercase tracking-wide text-muted">Current subscription status</p>
                      <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                          <p className="text-2xl font-extrabold text-text">
                            {subscriptionLoading ? 'Loading...' : activePlan === 'premium' ? 'Premium Plan' : 'No Active Subscription'}
                          </p>
                          <p className="text-sm font-semibold text-muted">
                            {currentSubscription?.expiresAt ? `Valid until ${formatDate(currentSubscription.expiresAt)}` : 'Please purchase a premium subscription to post properties'}
                          </p>
                        </div>
                        <span className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-extrabold uppercase ${activePlan === 'premium' ? 'bg-green-50 text-green-700' : 'bg-rose-50 text-primary'}`}>
                          {activePlan === 'premium' ? (currentSubscription?.status || 'active') : 'inactive'}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3 rounded-2xl border border-border bg-white p-4 shadow-sm">
                      <div>
                        <HomeIcon size={18} className="text-primary" />
                        <p className="mt-2 text-xl font-extrabold text-text">{activePlan === 'premium' ? 9 : 0}</p>
                        <p className="text-xs font-bold text-muted">Listings</p>
                      </div>
                      <div>
                        <Video size={18} className="text-secondary" />
                        <p className="mt-2 text-xl font-extrabold text-text">{activePlan === 'premium' ? 9 : 0}</p>
                        <p className="text-xs font-bold text-muted">Reels</p>
                      </div>
                      <div>
                        <Users size={18} className="text-emerald-600" />
                        <p className="mt-2 text-xl font-extrabold text-text">{activePlan === 'premium' ? 100 : 0}</p>
                        <p className="text-xs font-bold text-muted">Leads</p>
                      </div>
                    </div>
                  </div>

                  {subscriptionStatus && (
                    <p className={`rounded-xl p-3 text-sm font-bold ${subscriptionStatus.toLowerCase().includes('unable') || subscriptionStatus.toLowerCase().includes('required') || subscriptionStatus.toLowerCase().includes('cancelled') ? 'bg-rose-50 text-primary' : 'bg-green-50 text-green-700'}`}>
                      {subscriptionStatus}
                    </p>
                  )}

                  <div className="flex justify-center w-full">
                    {subscriptionPlans.map((plan) => {
                      const Icon = plan.icon;
                      const isActivePlan = activePlan === plan.id;
                      const isUpdating = subscriptionUpdating === plan.id;

                      return (
                        <div key={plan.id} className={`flex flex-col w-full max-w-md rounded-2xl border p-6 shadow-sm ${isActivePlan ? plan.accent : 'border-border bg-white'}`}>
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white">
                                  <Icon size={20} />
                                </span>
                                <h3 className="text-xl font-extrabold text-text">{plan.name}</h3>
                              </div>
                              <div className="mt-5 flex items-end gap-2">
                                <p className="text-4xl font-extrabold text-text">{plan.price}</p>
                                <p className="pb-1 text-sm font-bold text-muted">{plan.period}</p>
                              </div>
                            </div>
                            {isActivePlan && (
                              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-extrabold uppercase text-primary">Active</span>
                            )}
                          </div>

                          <div className="mt-6 grid gap-3">
                            {plan.highlights.map((item) => (
                              <p key={item} className="flex items-center gap-2 text-sm font-bold text-muted">
                                <CheckCircle2 size={16} className="text-emerald-600" />
                                {item}
                              </p>
                            ))}
                          </div>

                          {plan.id === 'premium' && (
                            <div className="mt-5 rounded-xl border border-primary/15 bg-primary/5 p-4">
                              <p className="flex items-center gap-2 text-sm font-extrabold text-primary">
                                <TrendingUp size={16} />
                                Premium promotion package
                              </p>
                              <p className="mt-1 text-xs font-semibold text-muted">Featured visibility, reels, social promotion, 100 leads guarantee, and automatic associate partner approval.</p>
                            </div>
                          )}

                          <button
                            onClick={() => handlePlanSelect(plan, isActivePlan)}
                            disabled={isUpdating}
                            className={`mt-6 w-full rounded-xl py-3 font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-70 ${isActivePlan ? 'bg-gray-100 text-muted hover:bg-gray-200' : 'bg-primary text-white hover:bg-rose-600'}`}
                          >
                            {isUpdating ? 'Processing...' : isActivePlan ? 'Continue to Dashboard' : plan.cta}
                          </button>
                          {plan.id === 'premium' && (
                            <p className="mt-3 text-center text-xs font-semibold text-muted">
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
                </div>
              ) : activeTab === 'listings' ? (
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-extrabold text-text">My Listings</h2>
                    {brokerApproved ? (
                      <Link href="/post-property" className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white">Post Property</Link>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setActiveTab('subscription')}
                        className="rounded-xl border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-bold text-primary"
                      >
                        Approval Pending
                      </button>
                    )}
                  </div>
                   {!brokerApproved && (
                    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800">
                      Associate Partner approval is required before uploading properties. Purchase the Premium subscription plan for instant automatic associate partner approval.
                    </div>
                  )}
                  {properties.map((property) => (
                    <div key={property.id} className="rounded-2xl border border-border/80 bg-white p-5 shadow-lg shadow-gray-200/70 ring-1 ring-black/5 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl">
                      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="font-extrabold text-text">{property.title}</p>
                          <p className="text-sm font-semibold text-muted">{property.location} - {property.price}</p>
                          <p className="mt-1 text-xs font-bold uppercase text-muted">Status: {property.status || 'approved'}</p>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2 md:mt-0">
                          {property.status !== 'sold' && (
                            <button
                              onClick={() => handleMarkSold(property.id)}
                              className="inline-flex rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700 transition-colors hover:bg-amber-100"
                            >
                              Mark Sold Out
                            </button>
                          )}
                          <Link
                            href={`/post-property?edit=${property.id}`}
                            className="inline-flex rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-100"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDeleteProperty(property.id)}
                            className="inline-flex rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition-colors hover:bg-rose-100"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {!properties.length && <p className="rounded-2xl bg-white p-8 text-sm font-bold text-muted">No listings yet.</p>}
                </div>
              ) : activeTab === 'blogs' ? (
                <BlogManager
                  canCreate={!subscriptionLoading && activePlan === 'premium'}
                  lockedMessage="Blogs and articles are available only for Premium Associate Partners. Upgrade to Premium to publish SEO articles, location guides, and property investment content."
                  title="Associate Partner Blogs & Articles"
                  description="Premium Associate Partners can publish buyer guides and property investment articles on Plotyards."
                />
              ) : activeTab === 'leads' ? (
                <div className="space-y-5">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <h2 className="text-2xl font-extrabold text-text">Leads</h2>
                      <p className="text-sm font-medium text-muted">Buyer inquiries grouped with the property they came from.</p>
                    </div>
                    <span className="w-fit rounded-full bg-primary/10 px-3 py-1 text-xs font-extrabold text-primary">
                      {inquiries.length} total
                    </span>
                  </div>

                  <div className="grid gap-4">
                    {inquiries.map((lead) => {
                      const propertyLocation = lead.property?.location
                        ? [lead.property.location.locality, lead.property.location.city].filter(Boolean).join(', ')
                        : '';
                      const statusClass = lead.status === 'closed'
                        ? 'bg-green-50 text-green-700'
                        : lead.status === 'contacted'
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-primary/10 text-primary';

                      return (
                        <article key={lead._id} className="rounded-2xl border border-border/80 bg-white p-5 shadow-lg shadow-gray-200/70 ring-1 ring-black/5 transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl">
                          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary text-sm font-extrabold text-white">
                                  {lead.name?.charAt(0) || 'L'}
                                </div>
                                <div>
                                  <p className="font-extrabold text-text">{lead.name}</p>
                                  <div className="mt-1 flex flex-wrap items-center gap-3 text-xs font-semibold text-muted">
                                    <span className="inline-flex items-center gap-1">
                                      <Phone size={13} />
                                      {lead.phone}
                                    </span>
                                    {lead.email && (
                                      <span className="inline-flex items-center gap-1">
                                        <Mail size={13} />
                                        {lead.email}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                              <span className={`rounded-full px-3 py-1 text-xs font-extrabold capitalize ${statusClass}`}>
                                {lead.status || 'new'}
                              </span>
                              <a href={`tel:${lead.phone}`} className="inline-flex items-center gap-1 rounded-xl border border-border px-3 py-2 text-xs font-bold text-text transition-colors hover:border-primary hover:text-primary">
                                <Phone size={14} />
                                Call
                              </a>
                              {lead.email && (
                                <a href={`mailto:${lead.email}`} className="inline-flex items-center gap-1 rounded-xl border border-border px-3 py-2 text-xs font-bold text-text transition-colors hover:border-primary hover:text-primary">
                                  <Mail size={14} />
                                  Email
                                </a>
                              )}
                            </div>
                          </div>

                          <div className="mt-5 border-t border-border pt-4">
                            {lead.property ? (
                              <Link href={`/property/${lead.property._id}`} className="group block">
                                <p className="text-xs font-bold uppercase tracking-wide text-muted">Property inquiry</p>
                                <p className="mt-1 text-base font-extrabold text-text group-hover:text-primary">{lead.property.title}</p>
                                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs font-semibold text-muted">
                                  {propertyLocation && (
                                    <span className="inline-flex items-center gap-1">
                                      <MapPin size={13} />
                                      {propertyLocation}
                                    </span>
                                  )}
                                  {lead.property.price?.label && <span>{lead.property.price.label}</span>}
                                </div>
                              </Link>
                            ) : (
                              <p className="text-sm font-bold text-muted">Property details unavailable</p>
                            )}
                          </div>

                          <div className="mt-4 flex items-start gap-2 rounded-xl bg-surface px-4 py-3 text-sm font-medium leading-6 text-muted">
                            <MessageCircle size={16} className="mt-1 flex-shrink-0 text-primary" />
                            <p>{lead.message || 'Interested in property'}</p>
                          </div>
                        </article>
                      );
                    })}
                  </div>

                  {!inquiries.length && (
                    <div className="rounded-2xl border border-dashed border-border bg-white p-8 text-center">
                      <Inbox size={26} className="mx-auto text-primary" />
                      <p className="mt-3 text-sm font-bold text-text">No leads yet.</p>
                      <p className="mt-1 text-xs font-medium text-muted">New property inquiries will appear here with buyer and listing details.</p>
                    </div>
                  )}

                  <div className="hidden">
                  <h2 className="text-2xl font-extrabold text-text mb-5">Leads</h2>
                  {inquiries.map((lead) => (
                    <div key={lead._id} className="border-t border-border py-4 first:border-t-0">
                      <p className="font-bold text-text">{lead.name} - {lead.phone}</p>
                      {lead.property && (
                        <Link
                          href={`/property/${lead.property._id}`}
                          className="mt-1 block text-sm font-bold text-primary hover:text-rose-600"
                        >
                          {lead.property.title}
                        </Link>
                      )}
                      {lead.property?.location && (
                        <p className="text-xs font-semibold text-muted">
                          {[lead.property.location.locality, lead.property.location.city].filter(Boolean).join(', ')}
                          {lead.property.price?.label ? ` - ${lead.property.price.label}` : ''}
                        </p>
                      )}
                      <p className="text-sm text-muted">{lead.message || 'Interested in property'}</p>
                    </div>
                  ))}
                  {!inquiries.length && <p className="text-sm font-bold text-muted">No leads yet.</p>}
                </div>
                </div>
              ) : (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-extrabold text-text mb-2">Welcome back, {user?.name}</h2>
                    <p className="text-gray-500 font-medium">Here is your live associate partner activity.</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {brokerStats.map(([Icon, label, value, color]) => (
                      <div key={label} className={`bg-gradient-to-br ${color} p-6 rounded-2xl border border-white/80 shadow-lg shadow-gray-200/70 ring-1 ring-black/5 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl`}>
                        <Icon size={22} className="mb-4" />
                        <h3 className="text-gray-500 text-sm font-medium mb-1">{label}</h3>
                        <p className="text-3xl font-extrabold text-text">{value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-8">
                    <h3 className="text-xl font-bold text-text mb-4">Next steps</h3>
                    <p className="text-sm font-medium text-muted flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-primary" />
                      {brokerApproved ? 'Keep listings approved and respond to leads quickly.' : 'Associate Partner approval is pending. Subscribe to the Premium plan for instant automatic associate partner approval and listing permissions.'}
                    </p>
                  </div>
                </div>
              )
            ) : (
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-extrabold text-text mb-2">Welcome back, {user?.name}</h2>
                  <p className="text-gray-500 font-medium">Your saved properties and recently viewed listings are shown below.</p>
                </div>
                {user?.role === 'user' && (
                  <div className="rounded-[2rem] border border-border/80 bg-surface p-6 shadow-lg shadow-gray-200/70 ring-1 ring-black/5">
                    <h3 className="text-xl font-bold text-text">Become an Associate Partner</h3>
                    <p className="mt-2 text-sm text-muted">Activate your Premium Associate Partner account instantly to post plot listings and receive direct buyer inquiries. No admin approval required.</p>
                    <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
                      <button
                        type="button"
                        onClick={handleRequestBroker}
                        disabled={brokerRequesting}
                        className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-rose-600 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {brokerRequesting ? 'Processing...' : 'Become an Associate Partner'}
                      </button>
                      {brokerRequestStatus && <p className="text-sm text-muted">{brokerRequestStatus}</p>}
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userStats.map(([Icon, label, value, color]) => (
                    <div key={label} className={`bg-gradient-to-br ${color} p-6 rounded-2xl border border-white/80 shadow-lg shadow-gray-200/70 ring-1 ring-black/5 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl`}>
                      <Icon size={22} className="mb-4" />
                      <h3 className="text-gray-500 text-sm font-medium mb-1">{label}</h3>
                      <p className="text-3xl font-extrabold text-text">{value}</p>
                    </div>
                  ))}
                </div>
                <div className="rounded-[2rem] border border-border/80 bg-white p-6 shadow-lg shadow-gray-200/70 ring-1 ring-black/5">
                  {loadingUserData ? (
                    <p className="text-sm font-bold text-muted">Loading your dashboard...</p>
                  ) : activeTab === 'saved' ? (
                    <div className="space-y-5">
                      <h2 className="text-2xl font-extrabold text-text">Saved Properties</h2>
                      {favourites.length ? favourites.map((property) => (
                        <div key={property.id} className="rounded-2xl border border-border p-4">
                          <p className="font-bold text-text">{property.title}</p>
                          <p className="text-sm text-muted">{property.location} - {property.price}</p>
                        </div>
                      )) : (
                        <p className="text-sm font-bold text-muted">You haven't saved any properties yet.</p>
                      )}
                    </div>
                  ) : activeTab === 'history' ? (
                    <div className="space-y-5">
                      <h2 className="text-2xl font-extrabold text-text">Recently Viewed</h2>
                      {historyItems.length ? historyItems.map((property) => (
                        <div key={property.id} className="rounded-2xl border border-border p-4">
                          <p className="font-bold text-text">{property.title}</p>
                          <p className="text-sm text-muted">{property.location} - {property.price}</p>
                        </div>
                      )) : (
                        <p className="text-sm font-bold text-muted">No recent history yet.</p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="rounded-2xl border border-border bg-surface p-8">
                        <h3 className="text-xl font-bold text-text">Start browsing</h3>
                        <p className="mt-2 text-sm text-muted">Find the best listings from verified associate partners on Plotyards.</p>
                        <Link href="/listings" className="mt-4 inline-flex rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white">Browse listings</Link>
                      </div>
                      <div className="grid gap-4 lg:grid-cols-2">
                        <Link href="/favourites" className="rounded-2xl border border-border/80 bg-white p-6 shadow-lg shadow-gray-200/70 ring-1 ring-black/5 transition-all duration-200 hover:-translate-y-1 hover:border-primary hover:shadow-xl">
                          <h3 className="font-bold text-text">Your saved properties</h3>
                          <p className="mt-2 text-sm text-muted">{favourites.length} saved properties</p>
                        </Link>
                        <Link href="/history" className="rounded-2xl border border-border/80 bg-white p-6 shadow-lg shadow-gray-200/70 ring-1 ring-black/5 transition-all duration-200 hover:-translate-y-1 hover:border-primary hover:shadow-xl">
                          <h3 className="font-bold text-text">Recently viewed</h3>
                          <p className="mt-2 text-sm text-muted">{historyItems.length} recent views</p>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
