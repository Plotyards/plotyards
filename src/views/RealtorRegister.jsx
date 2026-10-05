"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Eye, EyeOff, Building2, MapPin, Award, CheckCircle2, CheckCheck } from 'lucide-react';
import { useAuth } from '../context/auth';
import DropdownSelect from '../components/DropdownSelect';

// API used for states and cities dynamically

const CATEGORY_OPTIONS = [
  'Residential Plots',
  'Commercial',
  'Farmhouse',
  'Industrial',
  'Villas',
  'Apartments',
  'Other'
];

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

export default function RealtorRegister() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    whatsappNumber: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    photo: '',
    reraId: '',
    state: 'Haryana',
    city: 'Jhajjar',
    locality: '',
    areasServed: '',
    categoriesServed: ['Residential Plots'],
    experienceYears: '3',
    closedDeals: '100+',
    totalSales: '₹50Cr+',
    bio: '',
    address: '',
    instagram: '',
    facebook: '',
    linkedin: '',
    youtube: ''
  });

  const [error, setError] = useState('');
  const [popup, setPopup] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useRouter();
  const { register } = useAuth();

  const [statesList, setStatesList] = useState(['Haryana', 'Gujarat', 'Karnataka', 'Maharashtra']);
  const [citiesList, setCitiesList] = useState([]);
  const [uploadConfig, setUploadConfig] = useState(null);
  const [photoUploading, setPhotoUploading] = useState(false);

  useEffect(() => {
    fetch('/api/service/uploads/signature')
      .then(res => res.json())
      .then(data => setUploadConfig(data))
      .catch(() => setUploadConfig(null));
  }, []);

  const handlePhotoFileSelect = async (file) => {
    if (!file) return;
    setPhotoUploading(true);

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
          setPhotoUploading(false);
          return;
        }
      }
    } catch (err) {
      console.warn('Cloudinary upload fallback:', err);
    }

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
            if (!normalizedCities.includes(form.city)) {
              setForm(prev => ({ ...prev, city: normalizedCities[0] || '' }));
            }
          } else {
             setCitiesList([]);
          }
        })
        .catch(err => console.error('Failed to fetch cities', err));
    }
  }, [form.state]);

  const toggleCategory = (cat) => {
    setForm((prev) => {
      const exists = prev.categoriesServed.includes(cat);
      const updated = exists
        ? prev.categoriesServed.filter((c) => c !== cat)
        : [...prev.categoriesServed, cat];
      return { ...prev, categoriesServed: updated };
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setPopup(null);

    if (form.password !== form.confirmPassword) {
      setPopup({ type: 'error', message: 'Passwords do not match' });
      return;
    }

    if (form.password.length < 8) {
      setPopup({ type: 'error', message: 'Password must be at least 8 characters long' });
      return;
    }

    setLoading(true);

    try {
      const areasList = form.areasServed
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const user = await register({
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        isBroker: true,
        brokerProfile: {
          companyName: form.companyName || `${form.name} Realty`,
          companyType: 'broker',
          photo: form.photo,
          contactPhone: form.phone,
          whatsappNumber: form.whatsappNumber || form.phone,
          reraId: form.reraId,
          address: form.address,
          state: form.state,
          city: form.city,
          locality: form.locality,
          areasServed: areasList.length ? areasList : [form.city],
          categoriesServed: form.categoriesServed,
          experienceYears: Number(form.experienceYears) || 0,
          closedDeals: form.closedDeals || '',
          totalSales: form.totalSales || '',
          bio: form.bio,
          socialLinks: {
            instagram: form.instagram,
            facebook: form.facebook,
            linkedin: form.linkedin,
            youtube: form.youtube
          }
        }
      });

      // Redirect to plan & directory subscription page
      navigate.push('/subscribe');
    } catch (err) {
      setPopup({ type: 'error', message: err.message || 'Registration failed. Please check your details.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface py-24 md:py-32 px-4 sm:px-6 lg:px-8 flex justify-center items-center">
      <div className="w-full max-w-3xl bg-white p-8 sm:p-10 rounded-[2.5rem] shadow-card border border-gray-100 relative">
        
        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-8">
          <div className="inline-flex items-center gap-1.5 bg-rose-50 text-primary text-xs font-extrabold px-3.5 py-1.5 rounded-full border border-rose-200 uppercase tracking-wider mb-2">
            <ShieldCheck size={16} /> Realtor & Partner Signup
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-text tracking-tight">
            Register as a Plotyards Realtor<span className="text-primary">.</span>
          </h1>
          <p className="text-gray-500 text-sm font-medium mt-2">
            Join the Plotyards network to get area-wise buyer leads, listing packages, and Book My Realtor directory exposure.
          </p>

          {/* Book My Realtor Plan Banner */}
          <div className="mt-6 bg-gradient-to-r from-secondary via-[#005765] to-[#00424d] text-white p-5 sm:p-6 rounded-3xl text-left shadow-xl border border-secondary/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative overflow-hidden">
            <div className="absolute -right-10 -bottom-10 w-36 h-36 bg-primary/20 rounded-full blur-2xl pointer-events-none"></div>
            <div className="relative z-10 flex-1">
              <div className="inline-flex items-center gap-1.5 bg-primary text-white font-extrabold text-[10px] uppercase tracking-wider px-3 py-1 rounded-full shadow-sm mb-2">
                Most Popular ⭐ Recommended
              </div>
              <h4 className="text-lg sm:text-xl font-black text-white tracking-tight">Book My Realtor – ₹699 Lifetime</h4>
              <p className="text-teal-100/90 text-xs font-medium mt-1 leading-relaxed">
                Unlimited Property Listings • Buyer Lead Access • Direct Call & WhatsApp
              </p>
            </div>
            <div className="relative z-10 shrink-0 bg-white/15 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/25 text-center shadow-sm">
              <span className="text-2xl font-black text-white block">₹699</span>
              <span className="text-[10px] text-teal-100 font-extrabold uppercase tracking-wider">Lifetime</span>
            </div>
          </div>
        </div>

        {error && !popup && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-primary text-sm font-bold rounded-2xl text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-6">

          {/* Section 1: Basic & Credentials */}
          <div className="bg-gray-50/80 p-6 rounded-2xl border border-gray-200/80 space-y-4">
            <h3 className="text-sm font-extrabold text-text uppercase tracking-wider border-b border-gray-200 pb-2">
              1. Basic Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-text mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Rajesh Kumar"
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-text outline-none focus:border-primary/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text mb-1">Mobile Number *</label>
                <input
                  type="tel"
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-text outline-none focus:border-primary/50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-text mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="realtor@example.com"
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-text outline-none focus:border-primary/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text mb-1">WhatsApp Number (Optional)</label>
                <input
                  type="tel"
                  value={form.whatsappNumber}
                  onChange={(e) => setForm({ ...form, whatsappNumber: e.target.value })}
                  placeholder="WhatsApp number if different"
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-text outline-none focus:border-primary/50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-text mb-1">Password *</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="Min 8 characters"
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm font-bold text-text outline-none focus:border-primary/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-text"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-text mb-1">Confirm Password *</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    value={form.confirmPassword}
                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                    placeholder="Confirm password"
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm font-bold text-text outline-none focus:border-primary/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-text"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Business & Directory Profile */}
          <div className="bg-gray-50/80 p-6 rounded-2xl border border-gray-200/80 space-y-4">
            <h3 className="text-sm font-extrabold text-text uppercase tracking-wider border-b border-gray-200 pb-2">
              2. Profile & Location Details
            </h3>

            {/* Profile Photo Upload */}
            <div>
              <label className="block text-xs font-bold text-text mb-1">Profile Photo (Optional)</label>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gray-200 border border-gray-300 flex items-center justify-center text-gray-500 overflow-hidden shrink-0">
                  {form.photo ? (
                    <img src={form.photo} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    '📷'
                  )}
                </div>
                <div className="flex-1 flex gap-2">
                  <input
                    type="text"
                    value={form.photo}
                    onChange={(e) => setForm({ ...form, photo: e.target.value })}
                    placeholder="Image URL (https://...)"
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-bold text-text outline-none focus:border-primary/50"
                  />
                  <label className="cursor-pointer bg-white border border-gray-200 hover:bg-gray-100 px-3 py-2.5 rounded-xl text-xs font-bold text-text shrink-0 flex items-center gap-1">
                    {photoUploading ? 'Uploading...' : 'Pick File'}
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-text mb-1">Agency / Company Name *</label>
                <input
                  type="text"
                  required
                  value={form.companyName}
                  onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                  placeholder="e.g. Haryana Plot Experts"
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-text outline-none focus:border-primary/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text mb-1">RERA Registration No. (Optional)</label>
                <input
                  type="text"
                  value={form.reraId}
                  onChange={(e) => setForm({ ...form, reraId: e.target.value })}
                  placeholder="e.g. HRERA-PKL-REA-123"
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-text outline-none focus:border-primary/50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-text mb-1">State *</label>
                <DropdownSelect
                  value={form.state}
                  onChange={(val) => setForm({ ...form, state: val })}
                  options={statesList.map((st) => ({ value: st, label: st }))}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text mb-1">City *</label>
                <DropdownSelect
                  value={form.city}
                  onChange={(val) => setForm({ ...form, city: val })}
                  options={citiesList.length > 0 ? citiesList.map((c) => ({ value: c, label: c })) : [{ value: form.city, label: form.city || 'Loading cities...' }]}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-text mb-1">Areas / Localities Served (Comma separated)</label>
              <input
                type="text"
                value={form.areasServed}
                onChange={(e) => setForm({ ...form, areasServed: e.target.value })}
                placeholder="e.g. Sector 14, Main Bypass, Dholera SIR..."
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-text outline-none focus:border-primary/50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-text mb-2">Property Categories Served</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
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
                      {checked && <CheckCircle2 size={14} className="text-primary" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-text mb-1">Years of Experience</label>
                <input
                  type="number"
                  min="0"
                  value={form.experienceYears}
                  onChange={(e) => setForm({ ...form, experienceYears: e.target.value })}
                  placeholder="e.g. 5"
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-text outline-none focus:border-primary/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text mb-1">Deals Closed</label>
                <input
                  type="text"
                  value={form.closedDeals}
                  onChange={(e) => setForm({ ...form, closedDeals: e.target.value })}
                  placeholder="e.g. 250+"
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-text outline-none focus:border-primary/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text mb-1">Total Sales Volume</label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-sm font-extrabold text-gray-500 pointer-events-none select-none">₹</span>
                  <input
                    type="text"
                    value={form.totalSales?.replace(/^₹\s*/, '') || ''}
                    onChange={(e) => {
                      const val = e.target.value.replace(/^₹\s*/, '');
                      setForm({ ...form, totalSales: val ? `₹${val}` : '₹' });
                    }}
                    placeholder="150Cr+"
                    className="w-full bg-white border border-gray-200 rounded-xl pl-7 pr-4 py-3 text-sm font-bold text-text outline-none focus:border-primary/50"
                  />
                </div>
              </div>
            </div>

              <div>
                <label className="block text-xs font-bold text-text mb-1">Short Bio / Tagline</label>
                <input
                  type="text"
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  placeholder="e.g. 10+ years expert in Dholera SIR plots"
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-text outline-none focus:border-primary/50"
                />
              </div>

            <div>
              <label className="block text-xs font-bold text-text mb-1">Office Address</label>
              <textarea
                rows="2"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Full office address"
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-text outline-none focus:border-primary/50"
              />
            </div>
          </div>

          {/* Section 3: Social Media Links */}
          <div className="bg-gray-50/80 p-6 rounded-2xl border border-gray-200/80 space-y-4">
            <h3 className="text-sm font-extrabold text-text uppercase tracking-wider border-b border-gray-200 pb-2">
              3. Social Media Links (Optional)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-text mb-1">Instagram Profile</label>
                <input
                  type="url"
                  value={form.instagram}
                  onChange={(e) => setForm({ ...form, instagram: e.target.value })}
                  placeholder="https://instagram.com/yourhandle"
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-xs font-bold text-text outline-none focus:border-primary/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text mb-1">Facebook Page</label>
                <input
                  type="url"
                  value={form.facebook}
                  onChange={(e) => setForm({ ...form, facebook: e.target.value })}
                  placeholder="https://facebook.com/yourpage"
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-xs font-bold text-text outline-none focus:border-primary/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text mb-1">LinkedIn Profile</label>
                <input
                  type="url"
                  value={form.linkedin}
                  onChange={(e) => setForm({ ...form, linkedin: e.target.value })}
                  placeholder="https://linkedin.com/in/yourprofile"
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-xs font-bold text-text outline-none focus:border-primary/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text mb-1">YouTube Channel</label>
                <input
                  type="url"
                  value={form.youtube}
                  onChange={(e) => setForm({ ...form, youtube: e.target.value })}
                  placeholder="https://youtube.com/@yourchannel"
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-xs font-bold text-text outline-none focus:border-primary/50"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-rose-600 disabled:opacity-60 text-white font-extrabold py-4 rounded-xl transition-all text-lg shadow-sm"
          >
            {loading ? 'Creating Realtor Profile...' : 'Complete Realtor Signup & Select Plan →'}
          </button>

          <div className="text-center text-sm font-medium text-gray-500">
            Already registered?{' '}
            <Link href="/login" className="text-primary hover:text-rose-600 font-bold">
              Sign In Here
            </Link>
          </div>

        </form>
      </div>

      {popup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl animate-in zoom-in-95 fade-in duration-200 text-center">
            <div className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full ${popup.type === 'error' ? 'bg-rose-100 text-primary' : 'bg-green-100 text-green-600'}`}>
              {popup.type === 'error' ? <span className="text-2xl font-bold">!</span> : <CheckCheck size={24} />}
            </div>
            <h3 className="mb-2 text-xl font-extrabold text-text">{popup.type === 'error' ? 'Oops!' : 'Success'}</h3>
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
}
