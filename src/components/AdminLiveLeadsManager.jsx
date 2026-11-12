"use client";

import { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Clock,
  Edit2,
  ExternalLink,
  Flame,
  Lock,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Plus,
  Radio,
  RefreshCw,
  Search,
  Sparkles,
  Trash2,
  Unlock,
  Users,
  X,
  Zap
} from 'lucide-react';
import { apiRequest } from '../lib/api';
import { formatPhoneForDisplay, formatPhoneForLink } from '../utils/phoneUtils';

const DEFAULT_FORM = {
  name: '',
  phone: '',
  email: '',
  city: 'Noida',
  locality: '',
  propertyType: 'Residential Plot',
  budget: '₹50 Lakhs - ₹1 Crore',
  timeline: 'Immediate (Within 15 days)',
  purpose: 'Investment',
  requirement: '',
  message: '',
  urgency: 'hot',
  maxUnlocks: 5,
  isVerified: true
};

const CITY_OPTIONS = [
  'Noida',
  'Greater Noida',
  'Yamuna Expressway',
  'Gurgaon',
  'Delhi',
  'Faridabad',
  'Lucknow',
  'Ayodhya',
  'Ghaziabad',
  'Varanasi'
];

const PROPERTY_TYPES = [
  'Residential Plot',
  'Commercial Plot',
  'Agricultural Land',
  'Villa Plot',
  'Industrial Land',
  'Luxury Farmhouse'
];

const BUDGET_PRESETS = [
  'Under ₹50 Lakhs',
  '₹50 Lakhs - ₹1 Crore',
  '₹1 Crore - ₹2 Crore',
  '₹2 Crore - ₹3.5 Crore',
  '₹3.5 Crore - ₹5 Crore',
  'Above ₹5 Crore'
];

export default function AdminLiveLeadsManager() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [cityFilter, setCityFilter] = useState('All');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [viewUnlocksLead, setViewUnlocksLead] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Form State
  const [formData, setFormData] = useState(DEFAULT_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchLeads = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await apiRequest('/admin/live-leads');
      if (res.leads) {
        setLeads(res.leads);
      }
    } catch (err) {
      console.error('Failed to fetch admin live leads:', err);
      showToast(err.message || 'Failed to load leads', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const openAddModal = () => {
    setFormData(DEFAULT_FORM);
    setEditingLead(null);
    setIsAddModalOpen(true);
  };

  const openEditModal = (lead) => {
    setEditingLead(lead);
    setFormData({
      name: lead.name || '',
      phone: lead.phone || '',
      email: lead.email || '',
      city: lead.city || 'Noida',
      locality: lead.locality || '',
      propertyType: lead.propertyType || 'Residential Plot',
      budget: lead.budget || '₹50 Lakhs - ₹1 Crore',
      timeline: lead.timeline || 'Immediate (Within 15 days)',
      purpose: lead.purpose || 'Investment',
      requirement: lead.requirement || '',
      message: lead.message || '',
      urgency: lead.urgency || 'hot',
      maxUnlocks: lead.maxUnlocks || 5,
      isVerified: lead.isVerified !== undefined ? lead.isVerified : true
    });
    setIsAddModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim() || !formData.city.trim()) {
      showToast('Name, Phone Number, and City are required', 'error');
      return;
    }

    setSubmitting(true);
    try {
      if (editingLead) {
        const res = await apiRequest(`/admin/live-leads/${editingLead._id}`, {
          method: 'PUT',
          body: formData
        });
        showToast(res.message || 'Lead updated successfully!');
      } else {
        const res = await apiRequest('/admin/live-leads', {
          method: 'POST',
          body: formData
        });
        showToast(res.message || 'Live Lead published successfully!');
      }

      setIsAddModalOpen(false);
      setEditingLead(null);
      fetchLeads();
    } catch (err) {
      showToast(err.message || 'Failed to save lead', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStatus = async (lead) => {
    const nextStatus = lead.status === 'active' ? 'paused' : 'active';
    try {
      await apiRequest(`/admin/live-leads/${lead._id}`, {
        method: 'PUT',
        body: { status: nextStatus }
      });
      setLeads((prev) =>
        prev.map((l) => (l._id === lead._id ? { ...l, status: nextStatus } : l))
      );
      showToast(`Lead status changed to ${nextStatus}`);
    } catch (err) {
      showToast(err.message || 'Failed to update status', 'error');
    }
  };

  const handleDelete = async (leadId) => {
    try {
      await apiRequest(`/admin/live-leads/${leadId}`, {
        method: 'DELETE'
      });
      setLeads((prev) => prev.filter((l) => l._id !== leadId));
      showToast('Live lead deleted permanently');
      setDeleteConfirmId(null);
    } catch (err) {
      showToast(err.message || 'Failed to delete lead', 'error');
    }
  };

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      if (cityFilter !== 'All' && lead.city?.toLowerCase() !== cityFilter.toLowerCase()) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const mName = lead.name?.toLowerCase().includes(q);
        const mPhone = lead.phone?.includes(q);
        const mCity = lead.city?.toLowerCase().includes(q);
        const mReq = lead.requirement?.toLowerCase().includes(q);
        const mType = lead.propertyType?.toLowerCase().includes(q);
        if (!mName && !mPhone && !mCity && !mReq && !mType) return false;
      }
      return true;
    });
  }, [leads, cityFilter, searchQuery]);

  const stats = useMemo(() => {
    const total = leads.length;
    const active = leads.filter((l) => l.status === 'active').length;
    const totalUnlocks = leads.reduce((acc, l) => acc + (l.unlockedBy?.length || 0), 0);
    return { total, active, totalUnlocks };
  }, [leads]);

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl px-5 py-3.5 shadow-2xl backdrop-blur-md transition-all ${
            toast.type === 'error'
              ? 'bg-rose-600 text-white shadow-rose-900/40'
              : 'bg-emerald-600 text-white shadow-emerald-900/40'
          }`}
        >
          {toast.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
          <span className="text-sm font-bold">{toast.message}</span>
        </div>
      )}

      {/* Header & Stats Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-rose-600 animate-ping" />
            <span className="text-xs font-black uppercase tracking-wider text-rose-600">
              Live Buyer Feed Control
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mt-1">
            Share & Manage Live Leads
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 font-medium mt-1">
            Publish high-intent buyer inquiries here. Associate partners and developers unlock them for ₹99 (3 leads).
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-rose-600 hover:from-rose-600 hover:to-primary px-5 py-3 text-xs sm:text-sm font-black text-white shadow-lg shadow-rose-900/20 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
        >
          <Plus size={18} />
          <span>Post Live Lead</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase font-extrabold text-gray-400">Total Live Leads</p>
          <p className="text-3xl font-black text-gray-900 mt-1">{stats.total}</p>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase font-extrabold text-gray-400">Active Live on Feed</p>
          <p className="text-3xl font-black text-emerald-600 mt-1">{stats.active}</p>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase font-extrabold text-gray-400">Total Unlocks by Brokers</p>
          <p className="text-3xl font-black text-primary mt-1">{stats.totalUnlocks}</p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-surface p-3 rounded-2xl border border-border">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search leads by buyer name, phone, city, or requirement..."
            className="w-full rounded-xl pl-9 pr-4 py-2.5 text-xs font-semibold bg-white border border-gray-200 outline-none focus:border-primary"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="rounded-xl px-3.5 py-2.5 text-xs font-bold bg-white border border-gray-200 outline-none cursor-pointer"
          >
            <option value="All">All Cities</option>
            {CITY_OPTIONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <button
            onClick={() => fetchLeads(true)}
            disabled={refreshing}
            className="rounded-xl bg-white border border-gray-200 p-2.5 text-gray-600 hover:text-primary transition-colors cursor-pointer"
            title="Refresh"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin text-primary' : ''} />
          </button>
        </div>
      </div>

      {/* Leads Table */}
      {loading ? (
        <div className="p-16 text-center space-y-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-xs font-bold text-gray-500">Loading leads...</p>
        </div>
      ) : filteredLeads.length === 0 ? (
        <div className="p-12 text-center border border-dashed rounded-2xl bg-white space-y-2">
          <Radio size={28} className="mx-auto text-gray-400 animate-pulse" />
          <p className="text-sm font-bold text-gray-700">No live leads found</p>
          <p className="text-xs text-gray-400">Click "Post Live Lead" to publish your first live buyer inquiry.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse text-left text-xs sm:text-sm">
              <thead className="bg-surface text-[11px] font-black uppercase tracking-wider text-muted">
                <tr>
                  <th className="px-4 py-3">Buyer & Contact</th>
                  <th className="px-4 py-3">Requirement & Location</th>
                  <th className="px-4 py-3">Budget & Timeline</th>
                  <th className="px-4 py-3">Urgency & Status</th>
                  <th className="px-4 py-3 text-center">Unlocks</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/10">
                {filteredLeads.map((lead) => {
                  const unlockCount = lead.unlockedBy?.length || 0;
                  const maxUnlocks = lead.maxUnlocks || 5;

                  return (
                    <tr key={lead._id} className="align-top hover:bg-surface/50 transition-colors">
                      {/* Buyer Column */}
                      <td className="px-4 py-4">
                        <p className="font-black text-gray-900 text-sm">{lead.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <a
                            href={`tel:+${formatPhoneForLink(lead.phone)}`}
                            className="inline-flex items-center gap-1 font-bold text-gray-700 hover:text-primary"
                          >
                            <Phone size={12} />
                            {formatPhoneForDisplay(lead.phone)}
                          </a>
                        </div>
                        {lead.email && (
                          <p className="text-[11px] text-gray-500 font-medium mt-0.5">{lead.email}</p>
                        )}
                        <span className="inline-block mt-1 text-[10px] font-bold text-gray-400">
                          {new Date(lead.createdAt).toLocaleDateString()}
                        </span>
                      </td>

                      {/* Requirement & Location */}
                      <td className="px-4 py-4 max-w-xs">
                        <p className="font-extrabold text-gray-900 text-xs sm:text-sm leading-snug">
                          {lead.requirement || lead.propertyType}
                        </p>
                        <p className="text-xs font-semibold text-primary mt-1">
                          📍 {lead.locality ? `${lead.locality}, ` : ''}{lead.city}
                        </p>
                        {lead.message && (
                          <p className="text-[11px] text-gray-500 italic mt-1 line-clamp-2">
                            "{lead.message}"
                          </p>
                        )}
                      </td>

                      {/* Budget & Timeline */}
                      <td className="px-4 py-4">
                        <span className="inline-block rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-black text-emerald-700">
                          {lead.budget}
                        </span>
                        <p className="text-xs text-gray-600 font-semibold mt-1">
                          ⏱️ {lead.timeline}
                        </p>
                        <p className="text-[11px] text-gray-400 font-medium">
                          🎯 {lead.purpose}
                        </p>
                      </td>

                      {/* Urgency & Status */}
                      <td className="px-4 py-4">
                        <div className="space-y-2">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-black uppercase ${
                              lead.urgency === 'hot'
                                ? 'bg-rose-100 text-rose-700'
                                : lead.urgency === 'urgent'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}
                          >
                            <Flame size={11} /> {lead.urgency}
                          </span>

                          <div>
                            <button
                              onClick={() => toggleStatus(lead)}
                              className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase cursor-pointer transition-all ${
                                lead.status === 'active'
                                  ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              }`}
                            >
                              {lead.status === 'active' ? '● Active' : '⏸️ Paused'}
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* Unlocks Column */}
                      <td className="px-4 py-4 text-center">
                        <button
                          onClick={() => setViewUnlocksLead(lead)}
                          className="inline-flex flex-col items-center gap-1 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 px-3 py-1.5 transition-colors cursor-pointer"
                        >
                          <span className="text-xs font-black text-gray-900">
                            {unlockCount} / {maxUnlocks}
                          </span>
                          <span className="text-[10px] font-bold text-primary hover:underline">
                            View Brokers
                          </span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(lead)}
                            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-blue-600 transition-colors"
                            title="Edit Lead"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(lead._id)}
                            className="rounded-lg p-2 text-gray-500 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                            title="Delete Lead"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Lead Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[2rem] bg-white p-6 sm:p-8 shadow-2xl border border-gray-200 text-gray-900">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute right-5 top-5 rounded-full p-2 text-gray-400 hover:text-gray-700 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
                <Flame size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black">
                  {editingLead ? 'Edit Live Lead' : 'Publish New Live Lead'}
                </h3>
                <p className="text-xs text-gray-500 font-medium">
                  Share direct plot buyer requirement for associate partners & developers to unlock.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Buyer Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Ramesh Chandra"
                    className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-xs font-semibold outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="e.g. 9870534978"
                    className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-xs font-semibold outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Email (Optional)</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="buyer@gmail.com"
                    className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-xs font-semibold outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">City *</label>
                  <input
                    type="text"
                    list="city-options"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="e.g. Noida, Gurgaon"
                    className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-xs font-semibold outline-none focus:border-primary"
                  />
                  <datalist id="city-options">
                    {CITY_OPTIONS.map((c) => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Locality / Sector</label>
                  <input
                    type="text"
                    value={formData.locality}
                    onChange={(e) => setFormData({ ...formData, locality: e.target.value })}
                    placeholder="e.g. Sector 150 / Expressway"
                    className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-xs font-semibold outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Property Type</label>
                  <select
                    value={formData.propertyType}
                    onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-xs font-bold outline-none focus:border-primary"
                  >
                    {PROPERTY_TYPES.map((pt) => (
                      <option key={pt} value={pt}>
                        {pt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Budget Range</label>
                  <input
                    type="text"
                    list="budget-presets"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    placeholder="e.g. ₹75 Lakhs - ₹1.2 Crore"
                    className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-xs font-semibold outline-none focus:border-primary"
                  />
                  <datalist id="budget-presets">
                    {BUDGET_PRESETS.map((b) => (
                      <option key={b} value={b} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Purchase Timeline</label>
                  <input
                    type="text"
                    value={formData.timeline}
                    onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                    placeholder="e.g. Immediate (Within 10 days)"
                    className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-xs font-semibold outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Lead Requirement Headline *
                </label>
                <input
                  type="text"
                  required
                  value={formData.requirement}
                  onChange={(e) => setFormData({ ...formData, requirement: e.target.value })}
                  placeholder="e.g. Corner Plot 200 to 250 Sq. Yd, East facing preferred"
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-xs font-semibold outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Buyer Notes / Detailed Message
                </label>
                <textarea
                  rows={3}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="e.g. Genuine cash buyer looking for clear title freehold plot, ready for site visit this Sunday."
                  className="w-full rounded-xl border border-gray-200 p-3 text-xs font-semibold outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Urgency Tag</label>
                  <select
                    value={formData.urgency}
                    onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs font-bold outline-none"
                  >
                    <option value="hot">🔥 Hot Lead</option>
                    <option value="urgent">⚡ Urgent Buyer</option>
                    <option value="fresh">✨ Fresh Verified</option>
                    <option value="normal">Normal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Max Broker Unlocks</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={formData.maxUnlocks}
                    onChange={(e) => setFormData({ ...formData, maxUnlocks: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs font-bold outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="isVerified"
                    checked={formData.isVerified}
                    onChange={(e) => setFormData({ ...formData, isVerified: e.target.checked })}
                    className="h-4 w-4 rounded text-primary focus:ring-primary"
                  />
                  <label htmlFor="isVerified" className="text-xs font-bold text-gray-700 cursor-pointer">
                    Verified Buyer
                  </label>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-xl border border-gray-200 px-5 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-gradient-to-r from-primary to-rose-600 px-6 py-2.5 text-xs font-black text-white shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingLead ? 'Update Lead' : 'Publish Live Lead'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Unlocked By Brokers Modal */}
      {viewUnlocksLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-[2rem] bg-white p-6 sm:p-8 shadow-2xl border border-gray-200 text-gray-900 space-y-4">
            <button
              onClick={() => setViewUnlocksLead(null)}
              className="absolute right-5 top-5 rounded-full p-2 text-gray-400 hover:text-gray-700 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <Users size={22} />
              </div>
              <div>
                <h3 className="text-lg font-black">Brokers Who Unlocked</h3>
                <p className="text-xs text-gray-500 font-medium">
                  {viewUnlocksLead.requirement || viewUnlocksLead.name}
                </p>
              </div>
            </div>

            <div className="divide-y divide-gray-100 max-h-60 overflow-y-auto">
              {(viewUnlocksLead.unlockedBy || []).length === 0 ? (
                <p className="py-6 text-center text-xs text-gray-400 font-bold">
                  No associate partner has unlocked this lead yet.
                </p>
              ) : (
                viewUnlocksLead.unlockedBy.map((entry, idx) => {
                  const broker = entry.user || {};
                  return (
                    <div key={idx} className="py-3 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-extrabold text-gray-900">{broker.name || 'Associate Partner'}</p>
                        <p className="text-[11px] text-gray-500">{broker.phone || broker.email || 'Verified User'}</p>
                      </div>
                      <span className="text-[11px] font-semibold text-gray-400">
                        {new Date(entry.unlockedAt || Date.now()).toLocaleDateString()}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            <button
              onClick={() => setViewUnlocksLead(null)}
              className="w-full rounded-xl bg-gray-900 py-2.5 text-xs font-bold text-white transition-colors hover:bg-black cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-[2rem] bg-white p-6 shadow-2xl border text-center space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600">
              <Trash2 size={24} />
            </div>
            <h3 className="text-lg font-black text-gray-900">Delete Live Lead?</h3>
            <p className="text-xs text-gray-500 font-medium">
              This lead will be removed permanently from the Live Leads feed.
            </p>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="rounded-xl border border-gray-200 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="rounded-xl bg-rose-600 py-2.5 text-xs font-black text-white hover:bg-rose-700 transition-colors"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
