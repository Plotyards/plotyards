"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import { BarChart3, CheckCircle2, Clock, Compass, CreditCard, FileText, Heart, Home as HomeIcon, Inbox, Mail, MapPin, MessageCircle, Phone, ShieldCheck, TrendingUp, Users, Video, XCircle, Plus, Minus, Settings, User } from 'lucide-react';
import { apiRequest } from '../lib/api';
import { useAuth } from '../context/auth';
import { adaptProperty, adaptProperties } from '../utils/propertyAdapter';
import { formatPhoneForLink, formatPhoneForDisplay } from '../utils/phoneUtils';
import BlogManager from '../components/BlogManager';
import DeveloperDashboard from './DeveloperDashboard';
import DeleteAccountModal from '../components/DeleteAccountModal';
import SubscriptionModal from '../components/SubscriptionModal';
import EditProfileSection from '../components/EditProfileSection';

const TWO_DAYS_MS = 2 * 24 * 60 * 60 * 1000;
const RAZORPAY_CHECKOUT_URL = 'https://checkout.razorpay.com/v1/checkout.js';

const normalizePlan = (plan) => (['premium', 'pro', 'elite', 'developer_premium'].includes(plan) ? plan : 'free');

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

const formatDateTime = (value) => {
  if (!value) return '';
  return new Date(value).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

const Dashboard = () => {
  const pathname = usePathname();
  const navigate = useRouter();
  const { user, isBroker, updateMe, refreshMe } = useAuth();
  const [currentTime] = useState(() => Date.now());
  const isUser = user?.role === 'user' || user?.role === 'admin';
  const roleLabel = user?.role === 'user' ? 'buyer' : user?.role === 'broker' ? (user.brokerProfile?.companyType === 'developer' ? 'developer' : 'associate partner') : user?.role;
  const brokerApproved = true;
  const rejectedAt = user?.brokerProfile?.rejectedAt;
  const canReapplyAt = rejectedAt ? new Date(new Date(rejectedAt).getTime() + TWO_DAYS_MS) : null;
  const brokerReapplyLocked = user?.brokerStatus === 'rejected' && canReapplyAt && currentTime < canReapplyAt.getTime();
  const [activeTab, setActiveTab] = useState((typeof window !== 'undefined' ? window.history.state?.tab : null) || 'overview');
  const [properties, setProperties] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [favourites, setFavourites] = useState([]);
  const [historyItems, setHistoryItems] = useState([]);
  const [popup, setPopup] = useState(null);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [currentPlan, setCurrentPlan] = useState(normalizePlan(user?.brokerProfile?.subscriptionPlan));
  const [subscriptionLoading, setSubscriptionLoading] = useState(isBroker);
  const [subscriptionUpdating, setSubscriptionUpdating] = useState('');
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [loadingUserData, setLoadingUserData] = useState(isUser);
  const [brokerRequestStatus, setBrokerRequestStatus] = useState('');
  const [brokerRequesting, setBrokerRequesting] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [subscriptionProcessing, setSubscriptionProcessing] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [subscriptionHistory, setSubscriptionHistory] = useState([]);
  const [profilePhotoInput, setProfilePhotoInput] = useState('');
  const [savingPhoto, setSavingPhoto] = useState(false);

  const handleSaveProfilePhoto = async () => {
    const photoValue = profilePhotoInput || user?.brokerProfile?.photo;
    if (!photoValue) return;
    setSavingPhoto(true);
    try {
      await updateMe({
        brokerProfile: { photo: photoValue }
      });
      setPopup({ type: 'success', title: 'Profile Updated', message: 'Realtor profile photo updated successfully!' });
    } catch (err) {
      setPopup({ type: 'error', title: 'Update Failed', message: err.message || 'Failed to update profile photo.' });
    } finally {
      setSavingPhoto(false);
    }
  };

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
          setSubscriptionHistory(data.history || []);
        })
        .catch(() => {
          setCurrentSubscription(null);
          setCurrentPlan(normalizePlan(user?.brokerProfile?.subscriptionPlan));
          setSubscriptionHistory([]);
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
        description: `Premium Plan - 3 months (Quantity: ${currentSubscription?.quantity || 1})`,
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
    setPopup({ type: 'success', title: 'Plan Updated', message });
    setActiveTab('overview');
  };

  const createSubscription = async (plan) => {
    try {
      setSubscriptionUpdating(plan);
      const data = await apiRequest('/service/subscriptions', { method: 'POST', body: { plan, quantity: plan === 'free' ? 1 : quantity } });

      if (data.payment?.provider === 'razorpay' && data.payment?.order?.id) {
        setCurrentSubscription(data.subscription);
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
      setPopup({ type: 'error', title: 'Action Failed', message: error.message || 'Unable to update subscription.' });
      // Refetch the original subscription state since payment failed
      try {
        const resetData = await apiRequest('/service/subscriptions/me');
        setCurrentSubscription(resetData.subscription);
        setCurrentPlan(normalizePlan(resetData.plan));
      } catch (err) {
        console.error('Failed to reset subscription state', err);
      }
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

  const propertyViews = properties.reduce((sum, item) => sum + (Number(item.viewsCount) || 0), 0);
  const profileViews = propertyViews + (Number(user?.brokerProfile?.profileViews) || 0);
  const activeListings = properties.filter((item) => item.status !== 'sold').length;
  const avgCtr = profileViews ? `${((inquiries.length / profileViews) * 100).toFixed(1)}%` : '0%';

  const brokerStats = [
    [BarChart3, 'Profile Views', profileViews, 'from-primary/15 to-rose-50 text-primary'],
    [Users, 'Leads', inquiries.length, 'from-sky-100 to-blue-50 text-sky-700'],
    [HomeIcon, 'Active Listings', activeListings, 'from-emerald-100 to-green-50 text-emerald-700'],
    [TrendingUp, 'Avg. CTR', avgCtr, 'from-amber-100 to-yellow-50 text-amber-700']
  ];

  const userStats = [
    [Clock, 'Viewed', historyItems.length, 'from-indigo-100 to-violet-50 text-indigo-700'],
    [Compass, 'Explore', 'Discover new listings', 'from-emerald-100 to-green-50 text-emerald-700']
  ];

  const activePlan = user?.brokerProfile?.subscriptionPlan === 'paid' ? 'paid' : user?.brokerProfile?.bookMyRealtorMember ? 'book_my_realtor' : 'free';
  const isPremiumActive = activePlan === 'paid' || activePlan === 'book_my_realtor' || Boolean(user?.brokerProfile?.bookMyRealtorMember);
  const isDeveloper = user?.role === 'developer' || user?.brokerProfile?.companyType === 'developer';

  const allSubscriptionPlans = [
    {
      id: 'free',
      name: 'Free Plan',
      price: '₹0',
      period: '',
      accent: 'border-gray-200 bg-gray-50/50',
      cta: 'Continue Free',
      highlights: ['2 Property Listings', 'Basic Realtor Profile', 'Direct Call & Chat'],
      icon: ShieldCheck,
      isPremium: false
    },
    {
      id: 'book_my_realtor',
      name: 'Book My Realtor',
      price: '₹699',
      period: 'Lifetime',
      badge: 'Most Popular ⭐ Recommended',
      accent: 'border-blue-500 bg-blue-50/30 ring-2 ring-blue-500/20',
      cta: 'Join Now',
      highlights: [
        'Lifetime Realtor Profile',
        'Area-wise Search Visibility',
        'Buyer Lead Access',
        'Direct Call & WhatsApp',
        'Verified Badge & Social Links',
        'Unlimited Listings'
      ],
      icon: CreditCard,
      isPremium: true,
      isPopular: true
    },
    {
      id: 'paid',
      name: 'Growth Plan',
      price: '₹25,000',
      period: 'Month',
      accent: 'border-purple-500 bg-purple-50/30 ring-2 ring-purple-500/20',
      cta: 'Upgrade Now',
      highlights: [
        'Unlimited Property Listings',
        '10 UGC Advertisement Videos',
        'Professional Shoot & Editing',
        'Script & Content Planning',
        'Brand & Social Media Promotion',
        'Premium Lead Access & Priority'
      ],
      icon: TrendingUp,
      isPremium: true
    }
  ];

  const subscriptionPlans = allSubscriptionPlans.filter(p => p.id !== 'free');

  const navItems = isBroker
    ? (brokerApproved
        ? [
            ['overview', BarChart3, 'Overview'],
            ['profile', User, 'Edit Profile'],
            ['leads', Inbox, 'Leads'],
            ['listings', HomeIcon, 'My Listings'],
            ['blogs', FileText, 'Blogs'],
            ['subscription', CreditCard, 'Subscription'],
            ['settings', Settings, 'Account Settings']
          ]
        : [
            ['profile', User, 'Edit Profile'],
            ['subscription', CreditCard, 'Subscription'],
            ['settings', Settings, 'Account Settings']
          ])
    : [
        ['overview', Users, 'Overview'],
        ['profile', User, 'Edit Profile'],
        ['history', Clock, 'History'],
        ['settings', Settings, 'Account Settings']
      ];

  return (
    <div className="min-h-screen pt-28 pb-12 bg-surface font-sans">
      <div className="container mx-auto px-6 lg:px-12 max-w-[1400px]">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 sticky top-32">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center text-white text-xl font-bold overflow-hidden border border-gray-200 shadow-sm">
                  {user?.brokerProfile?.photo ? (
                    <img src={user.brokerProfile.photo} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    user?.name?.charAt(0) || 'U'
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-text leading-tight">{user?.name}</h3>
                  <p className="text-xs text-primary font-bold uppercase">{roleLabel}</p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('profile')}
                    className="mt-1 text-[11px] text-blue-600 hover:underline font-bold flex items-center gap-1"
                  >
                    <User size={12} /> Edit Profile
                  </button>
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
              (activeTab === 'profile' || activeTab === 'settings') ? (
                <div className="space-y-8">
                  <EditProfileSection
                    user={user}
                    updateMe={updateMe}
                    refreshMe={refreshMe}
                    onSaved={() => setPopup({ type: 'success', title: 'Profile Updated', message: 'Your profile details have been saved successfully!' })}
                  />
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 sm:p-8">
                    <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-rose-900">Danger Zone</h3>
                        <p className="mt-1 text-sm text-rose-700 max-w-lg font-medium">
                          Permanently delete your account, including all your listings, leads, and personal data. This action cannot be undone.
                        </p>
                      </div>
                      <button
                        onClick={() => setIsDeleteModalOpen(true)}
                        className="shrink-0 inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-rose-700 shadow-sm"
                      >
                        Delete My Account
                      </button>
                    </div>
                  </div>
                </div>
              ) : activeTab === 'subscription' ? (
                <div className="space-y-8">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <h2 className="text-3xl font-extrabold text-text">Associate Partner Subscription</h2>
                      <p className="mt-2 text-gray-500 font-medium">Manage your active plans, directory profile, and listing permissions.</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-xs font-extrabold uppercase text-primary">
                        <ShieldCheck size={15} />
                        {subscriptionLoading ? 'Checking plan' : (user?.brokerProfile?.subscriptionPlan === 'paid' || user?.brokerProfile?.bookMyRealtorMember) ? 'Active Member' : 'Free Starter Plan'}
                      </span>
                    </div>
                  </div>

                  {/* Growth Plan Convincing Upsell Banner for Realtors */}
                  {user?.brokerProfile?.subscriptionPlan !== 'paid' && (
                    <div className="rounded-3xl border border-purple-200 bg-gradient-to-r from-purple-950 via-indigo-900 to-purple-900 p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                      <div className="space-y-2 max-w-2xl">
                        <div className="flex items-center gap-2">
                          <span className="bg-amber-400 text-purple-950 font-black text-[10px] uppercase px-3 py-1 rounded-full tracking-wider">
                            🔥 Recommended Agency Upgrade
                          </span>
                          {user?.brokerProfile?.bookMyRealtorMember && (
                            <span className="bg-blue-500/30 text-blue-200 border border-blue-400/30 font-bold text-xs px-3 py-1 rounded-full">
                              Verified Realtor Directory Active
                            </span>
                          )}
                        </div>
                        <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
                          Scale Your Business with Growth Plan (₹25,000 / Month)
                        </h3>
                        <p className="text-purple-200 text-xs sm:text-sm font-medium leading-relaxed">
                          Unlock <strong className="text-white">Unlimited Property Listings</strong>, <strong className="text-white">10 Professional UGC Video Ads</strong>, HD Video Shoot & Scripting, Social Media Brand Promotion, and Dedicated Marketing Support.
                        </p>
                      </div>

                      <button
                        onClick={() => createSubscription('paid')}
                        disabled={subscriptionUpdating === 'paid'}
                        className="shrink-0 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-purple-950 font-black text-sm px-6 py-4 rounded-2xl shadow-lg transition-all hover:scale-105 active:scale-95 whitespace-nowrap self-start md:self-auto"
                      >
                        {subscriptionUpdating === 'paid' ? 'Processing...' : 'Upgrade to Growth Plan (₹25,000) →'}
                      </button>
                    </div>
                  )}

                  <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                    <div className="rounded-[2rem] border-4 border-white/60 bg-[#f0f4f8] p-6 shadow-[inset_6px_6px_12px_rgba(0,0,0,0.06),inset_-6px_-6px_12px_rgba(255,255,255,1),8px_8px_20px_rgba(0,0,0,0.06),-8px_-8px_20px_rgba(255,255,255,1)]">
                      <p className="text-xs font-extrabold uppercase tracking-wide text-gray-500">Current subscription status</p>
                      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                          <p className="text-2xl font-extrabold text-gray-800">
                            {subscriptionLoading
                              ? 'Loading...'
                              : user?.brokerProfile?.subscriptionPlan === 'paid'
                                ? 'Growth Plan (₹25,000/Mo)'
                                : user?.brokerProfile?.bookMyRealtorMember
                                  ? 'Book My Realtor (₹699 Lifetime)'
                                  : 'Free Plan (2 Listings)'}
                          </p>
                          <p className="text-sm font-semibold text-gray-500 mt-1">
                            {user?.brokerProfile?.subscriptionPlan === 'paid'
                              ? 'Unlimited Listings • 10 UGC Videos • Priority Leads'
                              : user?.brokerProfile?.bookMyRealtorMember
                                ? 'Directory Profile Active • 2 Property Listings Quota (Upgrade for Unlimited)'
                                : 'Starter Access (2 Active Property Listings Limit)'}
                          </p>
                        </div>
                        <span className={`inline-flex w-fit rounded-full px-4 py-1.5 text-xs font-extrabold uppercase shadow-sm ${
                          user?.brokerProfile?.subscriptionPlan === 'paid' || user?.brokerProfile?.bookMyRealtorMember
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-blue-100 text-blue-800 border border-blue-300'
                        }`}>
                          Active
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 rounded-[2rem] border-4 border-white/60 bg-[#f0f4f8] p-5 shadow-[inset_6px_6px_12px_rgba(0,0,0,0.06),inset_-6px_-6px_12px_rgba(255,255,255,1),8px_8px_20px_rgba(0,0,0,0.06),-8px_-8px_20px_rgba(255,255,255,1)]">
                      <div className="flex flex-col items-center sm:items-start">
                        <div className="p-2 rounded-xl bg-white shadow-sm text-primary">
                          <HomeIcon size={18} />
                        </div>
                        <p className="mt-3 text-2xl font-extrabold text-gray-800">
                          {user?.brokerProfile?.subscriptionPlan === 'paid' ? '∞' : '2'}
                        </p>
                        <p className="text-[11px] uppercase tracking-wider font-extrabold text-gray-500">Listings Limit</p>
                      </div>
                      <div className="flex flex-col items-center sm:items-start">
                        <div className="p-2 rounded-xl bg-white shadow-sm text-secondary">
                          <Video size={18} />
                        </div>
                        <p className="mt-3 text-2xl font-extrabold text-gray-800">
                          {user?.brokerProfile?.subscriptionPlan === 'paid' ? '10' : '0'}
                        </p>
                        <p className="text-[11px] uppercase tracking-wider font-extrabold text-gray-500">UGC Ads</p>
                      </div>
                      <div className="flex flex-col items-center sm:items-start">
                        <div className="p-2 rounded-xl bg-white shadow-sm text-emerald-600">
                          <Users size={18} />
                        </div>
                        <p className="mt-3 text-2xl font-extrabold text-gray-800">
                          {user?.brokerProfile?.subscriptionPlan === 'paid' || user?.brokerProfile?.bookMyRealtorMember ? 'Unlocked' : 'Basic'}
                        </p>
                        <p className="text-[11px] uppercase tracking-wider font-extrabold text-gray-500">Buyer Leads</p>
                      </div>
                    </div>
                  </div>

                    {subscriptionHistory.length > 0 && (
                      <div className="rounded-2xl border border-border bg-white p-5 shadow-sm lg:col-span-2">
                        <p className="text-xs font-extrabold uppercase tracking-wide text-muted mb-4">Subscription & Payment History</p>
                        <div className="space-y-4">
                          {subscriptionHistory.map((sub, index) => {
                            const planLabel = sub.plan === 'book_my_realtor'
                              ? 'Book My Realtor (₹699 Lifetime)'
                              : sub.plan === 'paid'
                                ? 'Growth Plan (₹25,000 / Month)'
                                : 'Free Starter Plan';

                            return (
                              <div key={sub._id || index} className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border last:border-0 pb-4 last:pb-0 gap-2">
                                <div>
                                  <p className="font-extrabold text-text text-sm">
                                    {planLabel}
                                  </p>
                                  <p className="text-xs font-semibold text-muted flex items-center gap-1.5 mt-1">
                                    <Clock size={13} className="text-primary" />
                                    Purchased on {formatDateTime(sub.createdAt)}
                                  </p>
                                </div>
                                <div className="mt-1 sm:mt-0 text-left sm:text-right">
                                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    Successful ✓
                                  </span>
                                  {sub.expiresAt ? (
                                    <p className="text-xs font-bold text-muted mt-1">
                                      Valid until {formatDate(sub.expiresAt)}
                                    </p>
                                  ) : (
                                    <p className="text-xs font-bold text-blue-600 mt-1">
                                      Lifetime Validity
                                    </p>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 w-full max-w-5xl mx-auto">
                    {subscriptionPlans.map((plan) => {
                      const Icon = plan.icon;
                      const isThisBookMyRealtorActive = plan.id === 'book_my_realtor' && Boolean(user?.brokerProfile?.bookMyRealtorMember);
                      const isThisGrowthActive = plan.id === 'paid' && user?.brokerProfile?.subscriptionPlan === 'paid';
                      const isUpdating = subscriptionUpdating === plan.id;

                      return (
                        <div key={plan.id} className={`flex flex-col h-full w-full max-w-md mx-auto rounded-[2.5rem] p-8 transition-transform duration-300 hover:-translate-y-2 relative ${
                          plan.isPopular 
                            ? 'bg-gradient-to-b from-blue-50/90 via-white to-blue-50/40 border-4 border-blue-500/80 shadow-[0_10px_30px_rgba(59,130,246,0.25)]' 
                            : plan.isPremium 
                              ? 'bg-[#fef2f2] shadow-[inset_6px_6px_12px_rgba(248,14,17,0.08),inset_-6px_-6px_12px_rgba(255,255,255,1),8px_8px_20px_rgba(0,0,0,0.06),-8px_-8px_20px_rgba(255,255,255,1)] border-4 border-white/60' 
                              : 'bg-[#f0f4f8] shadow-[inset_6px_6px_12px_rgba(0,0,0,0.06),inset_-6px_-6px_12px_rgba(255,255,255,1),8px_8px_20px_rgba(0,0,0,0.06),-8px_-8px_20px_rgba(255,255,255,1)] border-4 border-white/60'
                        }`}>
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className={`inline-flex h-11 w-11 items-center justify-center rounded-[1rem] shadow-[4px_4px_8px_rgba(0,0,0,0.1),-4px_-4px_8px_rgba(255,255,255,1)] ${plan.isPopular ? 'bg-blue-600 text-white' : plan.isPremium ? 'bg-primary text-white' : 'bg-white text-gray-700'}`}>
                                  <Icon size={20} />
                                </span>
                                <h3 className="text-xl font-extrabold text-gray-800">{plan.name}</h3>
                              </div>
                              <div className="mt-6 flex items-end gap-2">
                                <p className="text-4xl font-extrabold text-gray-800">{plan.price}</p>
                                {plan.period && <p className="pb-1 text-sm font-bold text-gray-500">/ {plan.period}</p>}
                              </div>
                            </div>

                            {isThisBookMyRealtorActive && (
                              <span className="rounded-full px-4 py-1.5 text-[10px] font-extrabold uppercase shadow-sm bg-emerald-100 text-emerald-800 border border-emerald-300">
                                Active Lifetime
                              </span>
                            )}
                            {isThisGrowthActive && (
                              <span className="rounded-full px-4 py-1.5 text-[10px] font-extrabold uppercase shadow-sm bg-purple-100 text-purple-800 border border-purple-300">
                                Active Plan
                              </span>
                            )}
                          </div>

                          <div className="mt-6 flex-1 flex flex-col gap-3">
                            {plan.highlights.map((item) => (
                              <p key={item} className="flex items-center gap-2 text-sm font-bold text-muted">
                                <CheckCircle2 size={16} className={plan.isPopular ? 'text-blue-600' : 'text-emerald-600'} />
                                {item}
                              </p>
                            ))}
                          </div>

                          <button
                            onClick={() => createSubscription(plan.id)}
                            disabled={isUpdating || isThisBookMyRealtorActive || (plan.id === 'free' && (user?.brokerProfile?.subscriptionPlan === 'paid' || user?.brokerProfile?.bookMyRealtorMember))}
                            className={`mt-8 w-full font-extrabold py-4 rounded-[1.5rem] transition-all duration-300 flex items-center justify-center gap-2 text-sm disabled:opacity-70 ${
                              isThisBookMyRealtorActive
                                ? 'bg-emerald-600 text-white cursor-not-allowed shadow-none'
                                : plan.isPopular
                                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md active:scale-95'
                                  : plan.isPremium 
                                    ? 'bg-primary text-white shadow-md active:scale-95' 
                                    : 'bg-[#f0f4f8] text-gray-700 shadow-sm'
                            }`}
                          >
                            {isUpdating 
                              ? 'Processing...' 
                              : isThisBookMyRealtorActive 
                                ? 'Active Membership ✓' 
                                : isThisGrowthActive 
                                  ? 'Upgrade / Extend Plan' 
                                  : plan.cta
                            }
                          </button>
                          {(plan.isPremium || plan.isPopular) && !isThisBookMyRealtorActive && (
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
                  canCreate={!subscriptionLoading && isPremiumActive}
                  lockedMessage="Spotlight is available only for Premium Associate Partners and Developers. Upgrade to Premium to publish SEO articles, location guides, and property investment content."
                  title="Spotlight"
                  description="Premium accounts can publish buyer guides and property investment articles on Plotyards."
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
                                      {formatPhoneForDisplay(lead.phone)}
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
                              {lead.isLocked ? (
                                <button onClick={() => setActiveTab('subscription')} className="inline-flex items-center gap-1 rounded-xl border border-primary bg-primary px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-rose-600">
                                  <ShieldCheck size={14} />
                                  Upgrade to Access
                                </button>
                              ) : (
                                <>
                                  <a href={`tel:+${formatPhoneForLink(lead.phone)}`} className="inline-flex items-center gap-1 rounded-xl border border-border px-3 py-2 text-xs font-bold text-text transition-colors hover:border-primary hover:text-primary">
                                    <Phone size={14} />
                                    Call
                                  </a>
                                  {lead.email && (
                                    <a href={`mailto:${lead.email}`} className="inline-flex items-center gap-1 rounded-xl border border-border px-3 py-2 text-xs font-bold text-text transition-colors hover:border-primary hover:text-primary">
                                      <Mail size={14} />
                                      Email
                                    </a>
                                  )}
                                </>
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
                </div>
              ) : activeTab === 'settings' ? (
                <div className="grid gap-6">
                  <div className="flex items-end justify-between">
                    <div>
                      <h2 className="text-2xl font-extrabold text-gray-900">Account Settings & Profile Photo</h2>
                      <p className="mt-1 text-sm text-gray-500 font-medium">Manage your profile details and update your realtor profile photo</p>
                    </div>
                  </div>

                  {/* Realtor Profile Photo Card */}
                  <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm">
                    <h3 className="text-lg font-extrabold text-text mb-4">Realtor Profile Picture</h3>
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                      <div className="w-24 h-24 rounded-2xl bg-secondary/10 border-2 border-primary/20 flex items-center justify-center text-primary text-3xl font-extrabold overflow-hidden relative shadow-md">
                        {profilePhotoInput || user?.brokerProfile?.photo ? (
                          <img src={profilePhotoInput || user?.brokerProfile?.photo} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          user?.name?.charAt(0) || 'R'
                        )}
                      </div>

                      <div className="flex-1 space-y-3 w-full">
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">
                          Upload Photo / Image Link
                        </label>
                        <div className="flex flex-col sm:flex-row gap-3">
                          <input
                            type="text"
                            value={profilePhotoInput}
                            onChange={(e) => setProfilePhotoInput(e.target.value)}
                            placeholder="Paste image URL (https://...)"
                            className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                          />
                          <label className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-text text-xs font-bold px-4 py-2.5 transition-colors border border-gray-200 whitespace-nowrap">
                            📷 Pick File
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                    setProfilePhotoInput(reader.result);
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                          </label>
                        </div>
                        <button
                          onClick={handleSaveProfilePhoto}
                          disabled={savingPhoto}
                          className="inline-flex items-center gap-2 rounded-xl bg-primary hover:bg-rose-600 text-white text-xs font-extrabold px-5 py-2.5 shadow-sm transition-all disabled:opacity-60"
                        >
                          {savingPhoto ? 'Saving...' : 'Save Profile Photo'}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 sm:p-8 mt-4">
                    <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-rose-900">Danger Zone</h3>
                        <p className="mt-1 text-sm text-rose-700 max-w-lg font-medium">
                          Permanently delete your account, including all your listings, leads, and personal data. This action cannot be undone.
                        </p>
                      </div>
                      <button
                        onClick={() => setIsDeleteModalOpen(true)}
                        className="shrink-0 inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-rose-700 shadow-sm"
                      >
                        Delete My Account
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-text mb-1">Welcome back, {user?.name}</h2>
                    <p className="text-gray-500 font-medium text-sm">Here is your live real estate dashboard & leads overview.</p>
                  </div>

                  {/* Realtor Active Subscription Card - Theme matched & shows ALL active memberships */}
                  <div className="p-6 rounded-3xl border border-gray-200 bg-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center font-bold shadow-md shrink-0 mt-0.5">
                        <ShieldCheck size={26} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">Active Membership Status</span>
                          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Active
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          {user?.brokerProfile?.bookMyRealtorMember && (
                            <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-800 border border-blue-200 text-xs font-black px-3.5 py-1.5 rounded-xl shadow-xs">
                              🔵 Book My Realtor – ₹699 Lifetime Directory Member
                            </span>
                          )}
                          {user?.brokerProfile?.subscriptionPlan === 'paid' && (
                            <span className="inline-flex items-center gap-1.5 bg-purple-50 text-purple-800 border border-purple-200 text-xs font-black px-3.5 py-1.5 rounded-xl shadow-xs">
                              🟣 Growth Plan – ₹25,000 / Month Agency Pack
                            </span>
                          )}
                          {!user?.brokerProfile?.bookMyRealtorMember && user?.brokerProfile?.subscriptionPlan !== 'paid' && (
                            <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-black px-3.5 py-1.5 rounded-xl shadow-xs">
                              🟢 Free Starter Plan (2 Property Listings Quota)
                            </span>
                          )}
                        </div>

                        <p className="text-xs font-semibold text-gray-500 mt-2">
                          {user?.brokerProfile?.subscriptionPlan === 'paid'
                            ? 'Unlimited Property Listings • 10 UGC Video Ads • Priority Buyer Leads'
                            : user?.brokerProfile?.bookMyRealtorMember
                              ? 'Verified Directory Profile • Area-Wise Search Visibility • Direct Call & WhatsApp Enquiries'
                              : 'Upgrade to Growth Plan (₹25,000/mo) for Unlimited Listings & UGC Ads'}
                        </p>
                      </div>
                    </div>

                    {!user?.brokerProfile?.bookMyRealtorMember && user?.brokerProfile?.subscriptionPlan !== 'paid' && (
                      <button
                        onClick={() => setIsSubModalOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all whitespace-nowrap self-start md:self-auto"
                      >
                        Join Book My Realtor (₹699) →
                      </button>
                    )}
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
                  ) : (activeTab === 'settings' || activeTab === 'profile') ? (
                    <div className="grid gap-6">
                      <EditProfileSection
                        user={user}
                        updateMe={updateMe}
                        refreshMe={refreshMe}
                        onSaved={() => setPopup({ type: 'success', title: 'Profile Updated', message: 'Your profile details have been saved successfully!' })}
                      />

                      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 sm:p-8 mt-4">
                        <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between">
                          <div>
                            <h3 className="text-lg font-bold text-rose-900">Danger Zone</h3>
                            <p className="mt-1 text-sm text-rose-700 max-w-lg font-medium">
                              Permanently delete your account, including all your listings, leads, and personal data. This action cannot be undone.
                            </p>
                          </div>
                          <button
                            onClick={() => setIsDeleteModalOpen(true)}
                            className="shrink-0 inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-rose-700 shadow-sm"
                          >
                            Delete My Account
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="rounded-2xl border border-border bg-surface p-8">
                        <h3 className="text-xl font-bold text-text">Start browsing</h3>
                        <p className="mt-2 text-sm text-muted">Find the best listings from verified associate partners on Plotyards.</p>
                        <Link href="/listings" className="mt-4 inline-flex rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white">Browse listings</Link>
                      </div>
                      <div className="grid gap-4 lg:grid-cols-2">
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

      <DeleteAccountModal 
        isOpen={isDeleteModalOpen} 
        onClose={() => setIsDeleteModalOpen(false)} 
      />

      <SubscriptionModal 
        isOpen={isSubModalOpen} 
        onClose={() => setIsSubModalOpen(false)} 
        onSuccess={refreshMe} 
        user={user} 
      />

      {popup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl animate-in zoom-in-95 fade-in duration-200 text-center">
            <div className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full ${popup.type === 'error' ? 'bg-rose-100 text-primary' : 'bg-green-100 text-green-600'}`}>
              <span className="text-2xl font-bold">!</span>
            </div>
            <h3 className="mb-2 text-xl font-extrabold text-text">{popup.title || (popup.type === 'error' ? 'Oops!' : 'Success')}</h3>
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

export default Dashboard;
