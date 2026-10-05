"use client";

import React, { useState, useEffect } from 'react';
import { 
  User, Mail, Phone, Building2, MapPin, Award, ShieldCheck, 
  Sparkles, Camera, CheckCircle2, Save, IndianRupee, Globe,
  FileText, Check, Share2
} from 'lucide-react';
import DropdownSelect from './DropdownSelect';
import { apiRequest } from '../lib/api';

const InstagramIcon = () => (
  <svg className="w-4 h-4 text-pink-600 shrink-0 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
);

const FacebookIcon = () => (
  <svg className="w-4 h-4 text-blue-600 shrink-0 mr-2" fill="currentColor" viewBox="0 0 24 24">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);

const LinkedinIcon = () => (
  <svg className="w-4 h-4 text-blue-700 shrink-0 mr-2" fill="currentColor" viewBox="0 0 24 24">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
    <rect x="2" y="9" width="4" height="12"/>
    <circle cx="4" cy="4" r="2"/>
  </svg>
);

const YoutubeIcon = () => (
  <svg className="w-4 h-4 text-red-600 shrink-0 mr-2" fill="currentColor" viewBox="0 0 24 24">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/>
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="#fff"/>
  </svg>
);

const compressImage = (file, maxWidth = 800, maxHeight = 800, quality = 0.8) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => resolve(event.target.result);
    };
    reader.onerror = () => resolve('');
  });
};

const CATEGORY_OPTIONS = [
  'Residential Plots',
  'Commercial',
  'Farmhouse',
  'Industrial',
  'Villas',
  'Apartments',
  'Other'
];

export default function EditProfileSection({ user, updateMe, refreshMe, onSaved }) {
  const isBroker = user?.role === 'broker' || user?.isBroker;
  const bp = user?.brokerProfile || {};

  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    photo: bp.photo || '',
    companyName: bp.companyName || '',
    reraId: bp.reraId || '',
    contactPhone: bp.contactPhone || user?.phone || '',
    whatsappNumber: bp.whatsappNumber || user?.phone || '',
    state: bp.state || 'Haryana',
    city: bp.city || 'Rohtak',
    locality: bp.locality || '',
    areasServed: Array.isArray(bp.areasServed) ? bp.areasServed.join(', ') : (bp.areasServed || ''),
    categoriesServed: bp.categoriesServed && bp.categoriesServed.length > 0 ? bp.categoriesServed : ['Residential Plots'],
    experienceYears: bp.experienceYears || 0,
    closedDeals: bp.closedDeals || '100+',
    totalSales: bp.totalSales || '₹50Cr+',
    bio: bp.bio || '',
    address: bp.address || '',
    instagram: bp.socialLinks?.instagram || '',
    facebook: bp.socialLinks?.facebook || '',
    linkedin: bp.socialLinks?.linkedin || '',
    youtube: bp.socialLinks?.youtube || ''
  });

  const [statesList, setStatesList] = useState(['Haryana', 'Gujarat', 'Karnataka', 'Maharashtra', 'Delhi NCR']);
  const [citiesList, setCitiesList] = useState([]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [uploadConfig, setUploadConfig] = useState(null);
  const [photoUploading, setPhotoUploading] = useState(false);

  useEffect(() => {
    apiRequest('/service/uploads/signature')
      .then(data => setUploadConfig(data))
      .catch(() => setUploadConfig(null));
  }, []);

  const handlePhotoFileSelect = async (file) => {
    if (!file) return;
    setPhotoUploading(true);
    setMsg({ type: '', text: '' });

    try {
      if (uploadConfig?.cloudName && uploadConfig?.uploadPreset) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', uploadConfig.uploadPreset);

        const res = await fetch(`https://api.cloudinary.com/v1_1/${uploadConfig.cloudName}/image/upload`, {
          method: 'POST',
          body: formData
        });

        const data = await res.json();
        if (res.ok && data.secure_url) {
          setForm(prev => ({ ...prev, photo: data.secure_url }));
          setMsg({ type: 'success', text: 'Photo uploaded to Cloudinary successfully!' });
          return;
        }
      }
    } catch (err) {
      console.warn('Cloudinary upload fallback to canvas compression:', err);
    }

    // Fallback to canvas compression if Cloudinary is not configured or fails
    try {
      const base64 = await compressImage(file, 800, 800, 0.8);
      setForm(prev => ({ ...prev, photo: base64 }));
    } finally {
      setPhotoUploading(false);
    }
  };

  useEffect(() => {
    fetch('https://countriesnow.space/api/v0.1/countries/states', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ country: 'India' })
    })
      .then(res => res.json())
      .then(data => {
        if (!data.error && data.data?.states) {
          const normalizedStates = data.data.states.map(s => 
            s.name.normalize('NFD').replace(/[\u0300-\u036f]/g, "")
          );
          setStatesList(normalizedStates);
        }
      })
      .catch(err => console.error('Failed to fetch states', err));
  }, []);

  useEffect(() => {
    if (form.state) {
      fetch('https://countriesnow.space/api/v0.1/countries/state/cities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ country: 'India', state: form.state })
      })
        .then(res => res.json())
        .then(data => {
          if (!data.error && data.data) {
            const normalizedCities = [...new Set(data.data.map(c => 
              c.normalize('NFD').replace(/[\u0300-\u036f]/g, "")
            ))].sort();
            setCitiesList(normalizedCities);
          } else {
            setCitiesList([]);
          }
        })
        .catch(err => console.error('Failed to fetch cities', err));
    }
  }, [form.state]);

  const toggleCategory = (cat) => {
    setForm(prev => {
      const exists = prev.categoriesServed.includes(cat);
      const updated = exists
        ? prev.categoriesServed.filter(c => c !== cat)
        : [...prev.categoriesServed, cat];
      return { ...prev, categoriesServed: updated };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg({ type: '', text: '' });

    try {
      const areasList = typeof form.areasServed === 'string'
        ? form.areasServed.split(',').map(s => s.trim()).filter(Boolean)
        : form.areasServed;

      const payload = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        brokerProfile: {
          photo: form.photo,
          companyName: form.companyName,
          reraId: form.reraId,
          contactPhone: form.contactPhone,
          whatsappNumber: form.whatsappNumber,
          state: form.state,
          city: form.city,
          locality: form.locality,
          areasServed: areasList,
          categoriesServed: form.categoriesServed,
          experienceYears: Number(form.experienceYears) || 0,
          closedDeals: form.closedDeals,
          totalSales: form.totalSales,
          bio: form.bio,
          address: form.address,
          socialLinks: {
            instagram: form.instagram,
            facebook: form.facebook,
            linkedin: form.linkedin,
            youtube: form.youtube
          }
        }
      };

      await updateMe(payload);
      if (refreshMe) await refreshMe();

      setMsg({ type: 'success', text: 'Profile updated successfully!' });
      if (onSaved) onSaved();
    } catch (err) {
      console.error('Failed to update profile:', err);
      setMsg({ type: 'error', text: err.message || 'Failed to update profile. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-[2.5rem] border border-gray-100 bg-white p-6 sm:p-8 shadow-sm space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-rose-50 text-primary text-xs font-extrabold px-3 py-1 rounded-full border border-rose-200 uppercase tracking-wider mb-2">
            <User size={14} /> Profile Management
          </div>
          <h2 className="text-2xl font-black text-text">Edit Account & Realtor Profile</h2>
          <p className="text-xs font-semibold text-muted mt-1">
            Update your public profile details, contact numbers, and business metrics.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3 text-xs font-extrabold text-white shadow-md hover:bg-rose-600 active:scale-95 disabled:opacity-50 transition-all"
        >
          <Save size={16} />
          {saving ? 'Saving...' : 'Save All Changes'}
        </button>
      </div>

      {msg.text && (
        <div className={`p-4 rounded-2xl border text-xs font-bold text-center ${
          msg.type === 'error' ? 'bg-rose-50 border-rose-200 text-rose-600' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
        }`}>
          {msg.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">

        {/* ─── AVATAR & PHOTO UPLOAD ─── */}
        <div className="flex flex-col sm:flex-row items-center gap-6 p-6 rounded-3xl bg-gray-50/80 border border-gray-200/80">
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-md bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-3xl font-black text-secondary shrink-0">
              {form.photo ? (
                <img src={form.photo} alt={form.name} className="w-full h-full object-cover" />
              ) : (
                form.name?.charAt(0) || 'U'
              )}
            </div>
            <label className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full shadow-md hover:bg-rose-600 cursor-pointer transition-transform hover:scale-110">
              <Camera size={14} />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handlePhotoFileSelect(file);
                }}
              />
            </label>
          </div>

          <div className="flex-1 w-full space-y-2">
            <label className="block text-xs font-extrabold text-text uppercase tracking-wider">
              Profile Photo URL / Image Link
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={form.photo}
                onChange={(e) => setForm({ ...form, photo: e.target.value })}
                placeholder="https://images.unsplash.com/..."
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-bold text-text outline-none focus:border-primary/50"
              />
              <label className="cursor-pointer bg-white border border-gray-200 hover:bg-gray-100 px-4 py-2.5 rounded-xl text-xs font-bold text-text shrink-0 flex items-center gap-1 shadow-2xs">
                {photoUploading ? 'Uploading...' : 'Upload'}
                <input
                  type="file"
                  accept="image/*"
                  disabled={photoUploading}
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handlePhotoFileSelect(file);
                  }}
                />
              </label>
            </div>
          </div>
        </div>

        {/* ─── 1. PERSONAL INFORMATION ─── */}
        <div className="space-y-4">
          <h3 className="text-sm font-extrabold text-text uppercase tracking-wider border-b border-gray-100 pb-2 flex items-center gap-2">
            <User size={16} className="text-primary" /> Personal Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-text mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-text outline-none focus:border-primary/50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-text mb-1">Mobile Phone *</label>
              <input
                type="tel"
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-text outline-none focus:border-primary/50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-text mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-text outline-none focus:border-primary/50"
              />
            </div>
          </div>
        </div>

        {/* ─── 2. REALTOR / LOCATION & BUSINESS INFORMATION ─── */}
        <div className="space-y-6 pt-2">
          <h3 className="text-sm font-extrabold text-text uppercase tracking-wider border-b border-gray-100 pb-2 flex items-center gap-2">
            <Building2 size={16} className="text-primary" /> Location, Agency & Profile Details
          </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-text mb-1">Company / Agency Name</label>
                <input
                  type="text"
                  value={form.companyName}
                  onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                  placeholder="e.g. Rohtak Plot Experts"
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-text outline-none focus:border-primary/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text mb-1">RERA Registration No.</label>
                <input
                  type="text"
                  value={form.reraId}
                  onChange={(e) => setForm({ ...form, reraId: e.target.value })}
                  placeholder="e.g. HRERA-PKL-123"
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-text outline-none focus:border-primary/50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-text mb-1">Contact Phone (For Buyer Calls)</label>
                <input
                  type="tel"
                  value={form.contactPhone}
                  onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-text outline-none focus:border-primary/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text mb-1">WhatsApp Number</label>
                <input
                  type="tel"
                  value={form.whatsappNumber}
                  onChange={(e) => setForm({ ...form, whatsappNumber: e.target.value })}
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-text outline-none focus:border-primary/50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-text mb-1">State</label>
                <DropdownSelect
                  value={form.state}
                  onChange={(val) => setForm({ ...form, state: val })}
                  options={statesList.map(st => ({ value: st, label: st }))}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text mb-1">City</label>
                <DropdownSelect
                  value={form.city}
                  onChange={(val) => setForm({ ...form, city: val })}
                  options={citiesList.length > 0 ? citiesList.map(c => ({ value: c, label: c })) : [{ value: form.city, label: form.city || 'Select City' }]}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text mb-1">Locality / Primary Area</label>
                <input
                  type="text"
                  value={form.locality}
                  onChange={(e) => setForm({ ...form, locality: e.target.value })}
                  placeholder="e.g. Sector 14"
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-text outline-none focus:border-primary/50"
                />
              </div>
            </div>

            {/* REAL PERFORMANCE METRICS */}
            <div className="p-5 rounded-3xl bg-slate-900 text-white space-y-4 shadow-md">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <Sparkles size={14} /> Display Metrics (Shown on Realtor Card)
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-300 mb-1">Years Experience</label>
                  <input
                    type="number"
                    min="0"
                    value={form.experienceYears}
                    onChange={(e) => setForm({ ...form, experienceYears: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs font-bold text-white outline-none focus:border-emerald-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-300 mb-1">Deals Closed</label>
                  <input
                    type="text"
                    value={form.closedDeals}
                    onChange={(e) => setForm({ ...form, closedDeals: e.target.value })}
                    placeholder="e.g. 250+"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs font-bold text-white outline-none focus:border-emerald-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-300 mb-1">Total Sales Volume</label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-xs font-extrabold text-emerald-400 pointer-events-none select-none">₹</span>
                    <input
                      type="text"
                      value={form.totalSales?.replace(/^₹\s*/, '') || ''}
                      onChange={(e) => {
                        const val = e.target.value.replace(/^₹\s*/, '');
                        setForm({ ...form, totalSales: val ? `₹${val}` : '₹' });
                      }}
                      placeholder="150Cr+"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-7 pr-4 py-2.5 text-xs font-bold text-white outline-none focus:border-emerald-400"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-text mb-2">Categories Served</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {CATEGORY_OPTIONS.map((cat) => {
                  const checked = form.categoriesServed.includes(cat);
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => toggleCategory(cat)}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                        checked
                          ? 'bg-rose-50 border-primary text-primary'
                          : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <span>{cat}</span>
                      {checked && <Check size={14} className="text-primary" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-text mb-1">Areas Served (Comma separated)</label>
              <input
                type="text"
                value={form.areasServed}
                onChange={(e) => setForm({ ...form, areasServed: e.target.value })}
                placeholder="e.g. Sector 14, Main Bypass, Delhi Road"
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-text outline-none focus:border-primary/50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-text mb-1">About / Bio</label>
              <textarea
                rows={3}
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                placeholder="Brief description about your real estate expertise..."
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold text-text outline-none focus:border-primary/50 resize-none"
              />
            </div>

            {/* Social Links */}
            <div className="space-y-3 pt-2">
              <label className="block text-xs font-extrabold text-text uppercase tracking-wider">Social Media Handles</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center rounded-xl border border-gray-200 bg-white px-3 py-2">
                  <InstagramIcon />
                  <input
                    type="text"
                    value={form.instagram}
                    onChange={(e) => setForm({ ...form, instagram: e.target.value })}
                    placeholder="Instagram URL"
                    className="w-full text-xs font-semibold outline-none bg-transparent"
                  />
                </div>

                <div className="flex items-center rounded-xl border border-gray-200 bg-white px-3 py-2">
                  <FacebookIcon />
                  <input
                    type="text"
                    value={form.facebook}
                    onChange={(e) => setForm({ ...form, facebook: e.target.value })}
                    placeholder="Facebook URL"
                    className="w-full text-xs font-semibold outline-none bg-transparent"
                  />
                </div>

                <div className="flex items-center rounded-xl border border-gray-200 bg-white px-3 py-2">
                  <LinkedinIcon />
                  <input
                    type="text"
                    value={form.linkedin}
                    onChange={(e) => setForm({ ...form, linkedin: e.target.value })}
                    placeholder="LinkedIn URL"
                    className="w-full text-xs font-semibold outline-none bg-transparent"
                  />
                </div>

                <div className="flex items-center rounded-xl border border-gray-200 bg-white px-3 py-2">
                  <YoutubeIcon />
                  <input
                    type="text"
                    value={form.youtube}
                    onChange={(e) => setForm({ ...form, youtube: e.target.value })}
                    placeholder="YouTube Channel URL"
                    className="w-full text-xs font-semibold outline-none bg-transparent"
                  />
                </div>
              </div>
            </div>

          </div>

        {/* Save Button */}
        <div className="pt-4 border-t border-gray-100 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl bg-primary px-8 py-3.5 text-sm font-extrabold text-white shadow-md hover:bg-rose-600 active:scale-95 disabled:opacity-50 transition-all"
          >
            <Save size={18} />
            {saving ? 'Saving Changes...' : 'Save Profile Changes'}
          </button>
        </div>

      </form>
    </div>
  );
}
