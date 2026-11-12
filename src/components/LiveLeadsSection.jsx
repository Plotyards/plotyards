"use client";

import { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  ExternalLink,
  Filter,
  Flame,
  Lock,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Radio,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Unlock,
  Users,
  X,
  Zap
} from 'lucide-react';
import { apiRequest } from '../lib/api';
import { formatPhoneForDisplay, formatPhoneForLink } from '../utils/phoneUtils';

const RAZORPAY_CHECKOUT_URL = 'https://checkout.razorpay.com/v1/checkout.js';

const loadRazorpayCheckout = () =>
  new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(false);
    if (window.Razorpay) return resolve(true);

    const existingScript = document.querySelector(`script[src="${RAZORPAY_CHECKOUT_URL}"]`);
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(true));
      existingScript.addEventListener('error', () => resolve(false));
      return;
    }

    const script = document.createElement('script');
    script.src = RAZORPAY_CHECKOUT_URL;
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

export default function LiveLeadsSection({ user, refreshMe, isDark = false }) {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userCredits, setUserCredits] = useState(user?.leadCredits || 0);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [viewTab, setViewTab] = useState('all'); // 'all' | 'hot' | 'unlocked'

  // Modals & Actions
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [targetLeadForPayment, setTargetLeadForPayment] = useState(null);
  const [unlockConfirmLead, setUnlockConfirmLead] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [copySuccessId, setCopySuccessId] = useState('');
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchLeads = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    try {
      const data = await apiRequest('/live-leads');
      if (data.leads) {
        setLeads(data.leads);
      }
      if (typeof data.userCredits === 'number') {
        setUserCredits(data.userCredits);
      }
    } catch (err) {
      console.error('Failed to fetch premium leads:', err);
      showToast(err.message || 'Failed to load premium leads', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  useEffect(() => {
    if (typeof user?.leadCredits === 'number') {
      setUserCredits(user.leadCredits);
    }
  }, [user?.leadCredits]);

  // Extract unique cities from current leads
  const availableCities = useMemo(() => {
    const set = new Set();
    leads.forEach((l) => {
      if (l.city) set.add(l.city);
    });
    return ['All', ...Array.from(set)];
  }, [leads]);

  const availableTypes = useMemo(() => {
    const set = new Set();
    leads.forEach((l) => {
      if (l.propertyType) set.add(l.propertyType);
    });
    return ['All', ...Array.from(set)];
  }, [leads]);

  // Filtered leads
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      if (viewTab === 'hot' && lead.urgency !== 'hot' && lead.urgency !== 'urgent') return false;
      if (viewTab === 'unlocked' && !lead.isUnlocked) return false;

      if (selectedCity !== 'All' && lead.city?.toLowerCase() !== selectedCity.toLowerCase()) {
        return false;
      }

      if (selectedType !== 'All' && lead.propertyType !== selectedType) {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = lead.name?.toLowerCase().includes(q);
        const matchCity = lead.city?.toLowerCase().includes(q);
        const matchLocality = lead.locality?.toLowerCase().includes(q);
        const matchType = lead.propertyType?.toLowerCase().includes(q);
        const matchReq = lead.requirement?.toLowerCase().includes(q);
        const matchMsg = lead.message?.toLowerCase().includes(q);
        if (!matchName && !matchCity && !matchLocality && !matchType && !matchReq && !matchMsg) {
          return false;
        }
      }

      return true;
    });
  }, [leads, viewTab, selectedCity, selectedType, searchQuery]);

  // Unlock lead handler
  const handleUnlockClick = (lead) => {
    if (lead.isUnlocked) return;

    if (userCredits > 0) {
      setUnlockConfirmLead(lead);
    } else {
      setTargetLeadForPayment(lead);
      setPaymentModalOpen(true);
    }
  };

  const confirmUnlock = async () => {
    if (!unlockConfirmLead) return;
    setActionLoading(true);
    try {
      const res = await apiRequest(`/live-leads/unlock/${unlockConfirmLead._id}`, {
        method: 'POST'
      });

      if (res.lead) {
        setLeads((prev) =>
          prev.map((l) => (l._id === res.lead._id ? res.lead : l))
        );
        setUserCredits(res.userCredits);
        if (refreshMe) refreshMe();
        showToast(res.message || '🎉 Lead unlocked successfully!');
      }
    } catch (err) {
      showToast(err.message || 'Failed to unlock lead', 'error');
    } finally {
      setActionLoading(false);
      setUnlockConfirmLead(null);
    }
  };

  // Payment flow for ₹99 -> 3 Lead Credits
  const handleBuyCredits = async (leadToAutoUnlock = null) => {
    setActionLoading(true);
    try {
      const isLoaded = await loadRazorpayCheckout();
      if (!isLoaded || !window.Razorpay) {
        throw new Error('Unable to initialize payment gateway. Please check your internet connection.');
      }

      const orderData = await apiRequest('/live-leads/order', {
        method: 'POST',
        body: { targetLeadId: leadToAutoUnlock?._id }
      });

      if (orderData.provider === 'manual') {
        showToast('Payment system is in test mode. Adding 3 credits...');
        const verifyRes = await apiRequest('/live-leads/verify-payment', {
          method: 'POST',
          body: {
            orderId: orderData.orderId,
            targetLeadId: leadToAutoUnlock?._id
          }
        });
        setUserCredits(verifyRes.userCredits);
        if (verifyRes.unlockedLead) {
          setLeads((prev) =>
            prev.map((l) => (l._id === verifyRes.unlockedLead._id ? verifyRes.unlockedLead : l))
          );
        } else {
          fetchLeads();
        }
        if (refreshMe) refreshMe();
        setPaymentModalOpen(false);
        showToast(verifyRes.message || '3 Lead credits added successfully!');
        return;
      }

      const { payment } = orderData;
      const checkout = new window.Razorpay({
        key: payment.keyId,
        amount: payment.amount,
        currency: payment.currency,
        name: 'Plotyards',
        description: '⚡ 3 Premium Leads Unlock Pack (₹99 Special)',
        order_id: payment.order.id,
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: user?.phone || user?.brokerProfile?.contactPhone || ''
        },
        theme: {
          color: '#f80e11'
        },
        handler: async (response) => {
          try {
            setActionLoading(true);
            const verified = await apiRequest('/live-leads/verify-payment', {
              method: 'POST',
              body: {
                orderId: orderData.orderId,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                targetLeadId: leadToAutoUnlock?._id
              }
            });

            setUserCredits(verified.userCredits);
            if (verified.unlockedLead) {
              setLeads((prev) =>
                prev.map((l) => (l._id === verified.unlockedLead._id ? verified.unlockedLead : l))
              );
            } else {
              fetchLeads();
            }
            if (refreshMe) refreshMe();
            setPaymentModalOpen(false);
            showToast(verified.message || 'Payment verified! 3 Credits added.');
          } catch (verifyErr) {
            showToast(verifyErr.message || 'Payment verification failed', 'error');
          } finally {
            setActionLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            setActionLoading(false);
          }
        }
      });

      checkout.on('payment.failed', (errRes) => {
        setActionLoading(false);
        showToast(errRes.error?.description || 'Payment was unsuccessful', 'error');
      });

      checkout.open();
    } catch (err) {
      showToast(err.message || 'Could not initiate purchase', 'error');
      setActionLoading(false);
    }
  };

  const copyToClipboard = (text, id) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopySuccessId(id);
    setTimeout(() => setCopySuccessId(''), 2500);
    showToast('Phone number copied to clipboard!');
  };

  const getUrgencyBadge = (urgency) => {
    switch (urgency) {
      case 'hot':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2.5 py-1 text-xs font-black text-rose-600 border border-rose-500/20">
            <Flame size={13} className="text-rose-600 fill-rose-600 animate-pulse" />
            HOT LEAD
          </span>
        );
      case 'urgent':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-black text-amber-600 border border-amber-500/20">
            <Zap size={13} className="text-amber-600 fill-amber-500" />
            URGENT BUYER
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-700 border border-emerald-500/20">
            <Sparkles size={13} />
            VERIFIED FRESH
          </span>
        );
    }
  };

  return (
    <div className={`space-y-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl px-5 py-3.5 shadow-2xl backdrop-blur-md transition-all animate-in slide-in-from-bottom-4 ${
            toast.type === 'error'
              ? 'bg-rose-600 text-white shadow-rose-900/40'
              : 'bg-emerald-600 text-white shadow-emerald-900/40'
          }`}
        >
          {toast.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
          <span className="text-sm font-bold">{toast.message}</span>
        </div>
      )}

      {/* Top Banner & Hero Section */}
      <div
        className={`relative overflow-hidden rounded-[2rem] p-6 sm:p-8 border shadow-xl transition-all ${
          isDark
            ? 'bg-gradient-to-br from-[#1c1810] via-[#111111] to-[#0a0a0a] border-[#d4af37]/30 shadow-[0_0_40px_rgba(212,175,55,0.08)]'
            : 'bg-gradient-to-br from-rose-900 via-gray-900 to-black text-white border-rose-950/20 shadow-2xl shadow-rose-950/10'
        }`}
      >
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-gradient-to-br from-rose-600/20 to-amber-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/20 px-3 py-1 text-xs font-black uppercase tracking-wider text-rose-300 border border-rose-500/30">
                <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
                <span className="h-2 w-2 rounded-full bg-rose-500 -ml-3.5" />
                Premium Buyer Feed
              </span>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-gray-200 backdrop-blur-sm">
                Direct Buyer Inquiries
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
              Exclusive Premium Leads for Plot Realtors
            </h1>

            <p className="text-sm sm:text-base text-gray-300 font-medium">
              Real-time high-intent buyers looking for residential, commercial & investment plots.
              Unlock direct buyer contact numbers & WhatsApp links instantly.
            </p>
          </div>

          {/* Credits & Action Card */}
          <div
            className={`flex flex-col sm:flex-row items-center gap-4 rounded-2xl p-4 sm:p-5 border backdrop-blur-md shrink-0 ${
              isDark
                ? 'bg-black/60 border-[#d4af37]/40 shadow-inner'
                : 'bg-white/10 border-white/20 shadow-lg'
            }`}
          >
            <div className="text-center sm:text-left">
              <p className="text-xs uppercase font-extrabold tracking-wider text-gray-300">
                Available Credits
              </p>
              <div className="flex items-center justify-center sm:justify-start gap-2 mt-0.5">
                <Zap size={22} className="text-amber-400 fill-amber-400" />
                <span className="text-3xl font-black text-white">{userCredits}</span>
                <span className="text-xs font-bold text-gray-300">Unlocks</span>
              </div>
            </div>

            <button
              onClick={() => {
                setTargetLeadForPayment(null);
                setPaymentModalOpen(true);
              }}
              disabled={actionLoading}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-rose-600 hover:from-rose-600 hover:to-primary px-5 py-3 text-xs sm:text-sm font-black text-white shadow-lg shadow-rose-900/40 hover:shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
            >
              <Sparkles size={16} />
              <span>Unlock 3 Leads for ₹99</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs & Search Filter Bar */}
      <div
        className={`rounded-2xl p-4 sm:p-5 border shadow-sm transition-all space-y-4 ${
          isDark ? 'bg-[#111] border-white/10' : 'bg-white border-gray-100'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Quick View Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
            <button
              onClick={() => setViewTab('all')}
              className={`rounded-xl px-4 py-2 text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                viewTab === 'all'
                  ? 'bg-primary text-white shadow-sm'
                  : isDark
                  ? 'bg-white/5 text-gray-400 hover:bg-white/10'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Leads ({leads.length})
            </button>
            <button
              onClick={() => setViewTab('hot')}
              className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                viewTab === 'hot'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : isDark
                  ? 'bg-white/5 text-gray-400 hover:bg-white/10'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Flame size={14} className="text-rose-500 fill-rose-500" />
              Hot Leads
            </button>
            <button
              onClick={() => setViewTab('unlocked')}
              className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                viewTab === 'unlocked'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : isDark
                  ? 'bg-white/5 text-gray-400 hover:bg-white/10'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Unlock size={14} />
              My Unlocked ({leads.filter((l) => l.isUnlocked).length})
            </button>
          </div>

          {/* Refresh Button */}
          <button
            onClick={() => fetchLeads(true)}
            disabled={refreshing}
            className={`self-end md:self-auto inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all cursor-pointer ${
              isDark
                ? 'bg-white/5 text-gray-300 hover:bg-white/10'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin text-primary' : ''} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh Feed'}</span>
          </button>
        </div>

        {/* Filter Selects & Search Input */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-gray-100 dark:border-white/5">
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by city, locality or buyer requirement..."
              className={`w-full rounded-xl pl-9 pr-4 py-2.5 text-xs font-medium border outline-none transition-all ${
                isDark
                  ? 'bg-[#1a1a1a] border-white/10 text-white focus:border-[#d4af37]'
                  : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-primary focus:bg-white'
              }`}
            />
          </div>

          <div>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className={`w-full rounded-xl px-3.5 py-2.5 text-xs font-bold border outline-none cursor-pointer transition-all ${
                isDark
                  ? 'bg-[#1a1a1a] border-white/10 text-white focus:border-[#d4af37]'
                  : 'bg-gray-50 border-gray-200 text-gray-800 focus:border-primary focus:bg-white'
              }`}
            >
              {availableCities.map((city) => (
                <option key={city} value={city}>
                  {city === 'All' ? 'All Cities' : `📍 ${city}`}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className={`w-full rounded-xl px-3.5 py-2.5 text-xs font-bold border outline-none cursor-pointer transition-all ${
                isDark
                  ? 'bg-[#1a1a1a] border-white/10 text-white focus:border-[#d4af37]'
                  : 'bg-gray-50 border-gray-200 text-gray-800 focus:border-primary focus:bg-white'
              }`}
            >
              {availableTypes.map((type) => (
                <option key={type} value={type}>
                  {type === 'All' ? 'All Property Types' : type}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2 text-xs text-gray-500 font-semibold px-1">
            <span>Showing:</span>
            <span className="font-extrabold text-primary dark:text-[#d4af37]">
              {filteredLeads.length} Leads
            </span>
          </div>
        </div>
      </div>

      {/* Leads List / Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-16 space-y-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm font-bold text-gray-500">Fetching live buyer inquiries...</p>
        </div>
      ) : filteredLeads.length === 0 ? (
        <div
          className={`rounded-[2rem] border border-dashed p-12 text-center space-y-3 ${
            isDark ? 'border-white/10 bg-[#111]' : 'border-gray-200 bg-white'
          }`}
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 text-primary dark:bg-white/5">
            <Radio size={28} className="animate-pulse" />
          </div>
          <h3 className="text-lg font-black text-gray-800 dark:text-white">No Premium Leads Matched</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto font-medium">
            Try adjusting your search criteria or city filters to see more genuine plot buyers.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCity('All');
              setSelectedType('All');
              setViewTab('all');
            }}
            className="inline-flex rounded-xl bg-gray-900 dark:bg-white dark:text-black px-4 py-2 text-xs font-bold text-white transition-all hover:bg-black"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredLeads.map((lead) => {
            const isUnlocked = lead.isUnlocked;

            return (
              <div
                key={lead._id}
                className={`group relative flex flex-col justify-between rounded-[1.75rem] p-5 sm:p-6 border transition-all duration-200 hover:-translate-y-1 ${
                  isUnlocked
                    ? isDark
                      ? 'bg-gradient-to-b from-[#16251b] to-[#0f1712] border-emerald-500/40 shadow-[0_0_30px_rgba(16,185,129,0.08)]'
                      : 'bg-emerald-50/40 border-emerald-300/80 shadow-lg shadow-emerald-950/5 ring-1 ring-emerald-500/10'
                    : isDark
                    ? 'bg-[#111] border-white/10 hover:border-[#d4af37]/40 shadow-lg'
                    : 'bg-white border-gray-200/80 hover:border-primary/40 shadow-md hover:shadow-xl'
                }`}
              >
                <div>
                  {/* Card Header: Urgency & Exclusivity Tag */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      {getUrgencyBadge(lead.urgency)}
                      {lead.isVerified && (
                        <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2.5 py-0.5 text-[11px] font-bold text-blue-600 border border-blue-500/20">
                          <Check size={11} /> Verified Buyer
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-[11px] font-extrabold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-white/5 rounded-full px-2.5 py-1">
                      <Lock size={11} />
                      <span>
                        {lead.slotsLeft > 0
                          ? `${lead.slotsLeft} slots left`
                          : 'Limit reached'}
                      </span>
                    </div>
                  </div>

                  {/* Property Requirement Title */}
                  <div className="mb-3">
                    <h3
                      className={`text-base sm:text-lg font-black leading-snug ${
                        isDark ? 'text-white' : 'text-gray-950'
                      }`}
                    >
                      {lead.requirement || `${lead.propertyType} in ${lead.city}`}
                    </h3>

                    <div className="flex flex-wrap items-center gap-2.5 mt-2 text-xs font-semibold text-gray-600 dark:text-gray-300">
                      <span className="inline-flex items-center gap-1">
                        <MapPin size={13} className="text-primary shrink-0" />
                        {lead.locality ? `${lead.locality}, ${lead.city}` : lead.city}
                      </span>
                      <span className="h-1 w-1 rounded-full bg-gray-300 dark:bg-gray-600" />
                      <span className="text-gray-500 dark:text-gray-400">{lead.propertyType}</span>
                    </div>
                  </div>

                  {/* Highlights Grid: Budget, Timeline, Purpose */}
                  <div className="grid grid-cols-2 gap-2 my-4">
                    <div
                      className={`rounded-xl p-2.5 border ${
                        isDark ? 'bg-white/5 border-white/5' : 'bg-gray-50 border-gray-100'
                      }`}
                    >
                      <p className="text-[10px] uppercase font-extrabold text-gray-400">Budget</p>
                      <p className="text-xs sm:text-sm font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                        {lead.budget}
                      </p>
                    </div>

                    <div
                      className={`rounded-xl p-2.5 border ${
                        isDark ? 'bg-white/5 border-white/5' : 'bg-gray-50 border-gray-100'
                      }`}
                    >
                      <p className="text-[10px] uppercase font-extrabold text-gray-400">Timeline</p>
                      <p
                        className={`text-xs sm:text-sm font-bold mt-0.5 ${
                          isDark ? 'text-gray-200' : 'text-gray-800'
                        }`}
                      >
                        {lead.timeline}
                      </p>
                    </div>
                  </div>

                  {/* Buyer Notes / Requirement Details */}
                  {lead.message && (
                    <div
                      className={`rounded-xl p-3 text-xs font-medium leading-relaxed mb-4 border ${
                        isDark
                          ? 'bg-[#181818] border-white/5 text-gray-300'
                          : 'bg-amber-50/50 border-amber-200/40 text-gray-700'
                      }`}
                    >
                      <p className="italic">"{lead.message}"</p>
                    </div>
                  )}
                </div>

                {/* Bottom Contact / Unlock Area */}
                <div className="pt-4 border-t border-gray-100 dark:border-white/10 mt-2">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-rose-600 text-xs font-black text-white shadow-sm">
                        {lead.name?.charAt(0) || 'B'}
                      </div>
                      <div>
                        <p
                          className={`text-xs font-black leading-tight ${
                            isDark ? 'text-white' : 'text-gray-900'
                          }`}
                        >
                          {isUnlocked ? lead.name : `${lead.name?.split(' ')[0]} (Buyer)`}
                        </p>
                        <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">
                          {lead.purpose || 'Investment'}
                        </p>
                      </div>
                    </div>

                    {isUnlocked && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-1 text-[11px] font-black text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                        <CheckCircle2 size={12} />
                        UNLOCKED
                      </span>
                    )}
                  </div>

                  {/* Contact info Reveal Box */}
                  {isUnlocked ? (
                    <div className="space-y-2.5">
                      <div
                        className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 border ${
                          isDark
                            ? 'bg-black/40 border-emerald-500/30 text-emerald-400'
                            : 'bg-emerald-100/60 border-emerald-300 text-emerald-900'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Phone size={14} className="text-emerald-600" />
                          <span className="text-xs sm:text-sm font-black tracking-wide">
                            {formatPhoneForDisplay(lead.phone)}
                          </span>
                        </div>

                        <button
                          onClick={() => copyToClipboard(lead.phone, lead._id)}
                          title="Copy Phone Number"
                          className="text-gray-500 hover:text-emerald-600 transition-colors p-1"
                        >
                          {copySuccessId === lead._id ? (
                            <Check size={14} className="text-emerald-600" />
                          ) : (
                            <Copy size={14} />
                          )}
                        </button>
                      </div>

                      {lead.email && (
                        <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400 px-1">
                          <Mail size={13} />
                          <span>{lead.email}</span>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <a
                          href={`tel:+${formatPhoneForLink(lead.phone)}`}
                          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-200 dark:text-black py-2.5 text-xs font-black text-white shadow-md transition-all active:scale-95"
                        >
                          <Phone size={13} />
                          <span>Call Buyer</span>
                        </a>

                        <a
                          href={`https://wa.me/${formatPhoneForLink(
                            lead.phone
                          )}?text=${encodeURIComponent(
                            `Hi ${lead.name || ''}, I noticed your requirement for ${
                              lead.requirement || lead.propertyType
                            } in ${lead.city} on Plotyards. I have verified options ready for you.`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 py-2.5 text-xs font-black text-white shadow-md transition-all active:scale-95"
                        >
                          <MessageCircle size={13} />
                          <span>WhatsApp</span>
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div
                        className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 border select-none ${
                          isDark
                            ? 'bg-white/5 border-white/10 text-gray-400'
                            : 'bg-gray-50 border-gray-200 text-gray-500'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Phone size={14} />
                          <span className="text-xs sm:text-sm font-extrabold tracking-widest font-mono">
                            {lead.phone}
                          </span>
                        </div>
                        <Lock size={14} className="text-gray-400" />
                      </div>

                      <button
                        onClick={() => handleUnlockClick(lead)}
                        disabled={actionLoading || lead.slotsLeft <= 0}
                        className={`w-full inline-flex items-center justify-center gap-2 rounded-xl py-3 text-xs sm:text-sm font-black text-white transition-all shadow-md active:scale-95 cursor-pointer ${
                          lead.slotsLeft <= 0
                            ? 'bg-gray-400 cursor-not-allowed opacity-60'
                            : userCredits > 0
                            ? 'bg-emerald-600 hover:bg-emerald-700 hover:shadow-lg'
                            : 'bg-gradient-to-r from-primary to-rose-600 hover:from-rose-600 hover:to-primary hover:shadow-lg shadow-rose-900/30'
                        }`}
                      >
                        {lead.slotsLeft <= 0 ? (
                          <>
                            <Lock size={15} />
                            <span>Unlock Limit Reached</span>
                          </>
                        ) : userCredits > 0 ? (
                          <>
                            <Unlock size={15} />
                            <span>Unlock Lead (1 of {userCredits} Credits)</span>
                          </>
                        ) : (
                          <>
                            <Lock size={15} />
                            <span>Unlock for ₹99 (Get 3 Leads)</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Modal for Unlocking with Credit */}
      {unlockConfirmLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm animate-in fade-in">
          <div
            className={`w-full max-w-md rounded-[2rem] p-6 sm:p-8 shadow-2xl border text-center space-y-4 ${
              isDark ? 'bg-[#141414] border-white/10 text-white' : 'bg-white border-gray-100 text-gray-900'
            }`}
          >
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600">
              <Unlock size={26} />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-black">Confirm Lead Unlock</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                Use 1 Lead Credit to reveal direct phone number, WhatsApp, and full buyer profile.
              </p>
            </div>

            <div
              className={`rounded-2xl p-4 text-left border ${
                isDark ? 'bg-white/5 border-white/5' : 'bg-gray-50 border-gray-200'
              }`}
            >
              <p className="text-xs font-bold text-gray-500 uppercase">Selected Buyer</p>
              <p className="text-sm font-black mt-0.5">{unlockConfirmLead.requirement}</p>
              <p className="text-xs font-semibold text-primary mt-1">
                📍 {unlockConfirmLead.city} • 💰 {unlockConfirmLead.budget}
              </p>
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-white/10 flex items-center justify-between text-xs font-bold">
                <span className="text-gray-500">Credits Remaining After:</span>
                <span className="text-emerald-600 font-extrabold">{userCredits - 1} Credits</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setUnlockConfirmLead(null)}
                disabled={actionLoading}
                className="rounded-xl border border-gray-200 dark:border-white/10 py-3 text-xs font-bold hover:bg-gray-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmUnlock}
                disabled={actionLoading}
                className="rounded-xl bg-emerald-600 hover:bg-emerald-700 py-3 text-xs font-black text-white shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50"
              >
                {actionLoading ? 'Unlocking...' : 'Yes, Unlock Now'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Buy Credits Modal: ₹99 for 3 Leads */}
      {paymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm animate-in fade-in">
          <div
            className={`relative w-full max-w-lg rounded-[2.5rem] p-6 sm:p-8 shadow-2xl border ${
              isDark
                ? 'bg-gradient-to-b from-[#1a1712] via-[#121212] to-[#0a0a0a] border-[#d4af37]/40 text-white shadow-[0_0_50px_rgba(212,175,55,0.15)]'
                : 'bg-white border-gray-200 text-gray-900'
            }`}
          >
            <button
              onClick={() => {
                setPaymentModalOpen(false);
                setTargetLeadForPayment(null);
              }}
              className="absolute right-5 top-5 rounded-full p-2 text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors"
            >
              <X size={18} />
            </button>

            {/* Modal Header */}
            <div className="text-center space-y-2">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary to-rose-600 text-white shadow-lg shadow-rose-900/30">
                <Flame size={28} className="fill-white" />
              </div>

              <div className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 px-3 py-1 text-xs font-black text-rose-600 uppercase tracking-wide border border-rose-500/20">
                <Sparkles size={12} />
                Special Offer • 99 me 3 Leads
              </div>

              <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                Unlock Live Buyer Leads
              </h2>

              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium max-w-md mx-auto">
                Get direct access to genuine plot buyer contact numbers, WhatsApp chats & property requirements.
              </p>
            </div>

            {/* Pricing Box */}
            <div
              className={`my-6 rounded-2xl p-5 border text-center relative overflow-hidden ${
                isDark
                  ? 'bg-white/5 border-[#d4af37]/30 shadow-inner'
                  : 'bg-gradient-to-br from-rose-50/50 to-amber-50/50 border-rose-200'
              }`}
            >
              <span className="absolute top-2 right-3 rounded-full bg-rose-600 text-white px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider">
                67% OFF
              </span>

              <p className="text-xs uppercase font-extrabold text-gray-500">Premium Leads Starter Pack</p>
              <div className="flex items-baseline justify-center gap-2 mt-1">
                <span className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white">
                  ₹99
                </span>
                <span className="text-base text-gray-400 line-through font-bold">₹299</span>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
                  Only ₹33/lead
                </span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-300 font-bold mt-2">
                ⚡ Includes 3 Verified Premium Lead Unlocks
              </p>
            </div>

            {/* Benefits Checklist */}
            <div className="space-y-2.5 mb-6 text-xs sm:text-sm font-semibold">
              <div className="flex items-center gap-2.5 text-gray-700 dark:text-gray-300">
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                <span>3 Lead Unlock Credits added immediately to your dashboard</span>
              </div>
              <div className="flex items-center gap-2.5 text-gray-700 dark:text-gray-300">
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                <span>Direct phone number & 1-click WhatsApp messaging</span>
              </div>
              <div className="flex items-center gap-2.5 text-gray-700 dark:text-gray-300">
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                <span>Exclusivity guaranteed: max 5 realtors can unlock each lead</span>
              </div>
              <div className="flex items-center gap-2.5 text-gray-700 dark:text-gray-300">
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                <span>Credits never expire — unlock now or anytime you want</span>
              </div>
            </div>

            {targetLeadForPayment && (
              <p className="text-xs font-bold text-center text-primary mb-4 bg-primary/5 py-2 px-3 rounded-xl border border-primary/20">
                👉 Will immediately unlock <strong>"{targetLeadForPayment.requirement}"</strong> + give you 2 extra lead credits!
              </p>
            )}

            {/* Pay Button */}
            <button
              type="button"
              onClick={() => handleBuyCredits(targetLeadForPayment)}
              disabled={actionLoading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-rose-600 hover:from-rose-600 hover:to-primary py-4 text-sm font-black text-white shadow-xl shadow-rose-900/30 hover:shadow-2xl hover:scale-[1.02] active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            >
              <Zap size={18} className="fill-white" />
              <span>
                {actionLoading
                  ? 'Connecting to Payment...'
                  : 'Pay ₹99 via UPI / Card & Unlock 3 Leads'}
              </span>
            </button>

            <p className="text-[11px] text-center text-gray-400 font-medium mt-3">
              100% Secure Checkout via Razorpay • Instant Delivery
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
