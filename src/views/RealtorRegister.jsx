"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Eye, EyeOff, Building2, MapPin, Award, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/auth';
import DropdownSelect from '../components/DropdownSelect';

const STATES_CITIES = {
  Haryana: ['Jhajjar', 'Gurgaon', 'Faridabad', 'Rohtak', 'Panipat', 'Karnal', 'Hisar', 'Sonipat'],
  Gujarat: ['Ahmedabad', 'Dholera', 'Surat', 'Vadodara', 'Rajkot'],
  Karnataka: ['Bangalore', 'Mysore', 'Mangalore'],
  Maharashtra: ['Mumbai', 'Pune', 'Nagpur', 'Nashik'],
  'Delhi NCR': ['Delhi', 'Noida', 'Greater Noida', 'Ghaziabad']
};

const CATEGORY_OPTIONS = [
  'Residential Plots',
  'Commercial',
  'Farm Land',
  'Industrial',
  'Villas',
  'Apartments'
];

export default function RealtorRegister() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    whatsappNumber: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    reraId: '',
    state: 'Haryana',
    city: 'Jhajjar',
    locality: '',
    areasServed: '',
    categoriesServed: ['Residential Plots'],
    experienceYears: '3',
    bio: '',
    address: '',
    instagram: '',
    facebook: '',
    linkedin: '',
    youtube: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useRouter();
  const { register } = useAuth();

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

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (form.password.length < 8) {
      setError('Password must be at least 8 characters long');
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
      setError(err.message || 'Registration failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface py-24 md:py-32 px-4 sm:px-6 lg:px-8 flex justify-center items-center">
      <div className="w-full max-w-3xl bg-white p-8 sm:p-10 rounded-[2.5rem] shadow-card border border-gray-100 relative">
        
        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-8">
          <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-extrabold px-3.5 py-1.5 rounded-full border border-primary/20 uppercase tracking-wider mb-2">
            <ShieldCheck size={16} /> Realtor & Partner Signup
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-text tracking-tight">
            Register as a Plotyards Realtor<span className="text-primary">.</span>
          </h1>
          <p className="text-gray-500 text-sm font-medium mt-2">
            Join the Plotyards network to get area-wise buyer leads, listing packages, and Book My Realtor directory exposure.
          </p>
        </div>

        {error && (
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
              2. Realtor Profile & Location Details
            </h3>

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
                  onChange={(val) => setForm({ ...form, state: val, city: (STATES_CITIES[val] || [])[0] || '' })}
                  options={Object.keys(STATES_CITIES).map((st) => ({ value: st, label: st }))}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text mb-1">City *</label>
                <DropdownSelect
                  value={form.city}
                  onChange={(val) => setForm({ ...form, city: val })}
                  options={(STATES_CITIES[form.state] || []).map((c) => ({ value: c, label: c }))}
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-text mb-1">Years of Experience</label>
                <input
                  type="number"
                  min="0"
                  value={form.experienceYears}
                  onChange={(e) => setForm({ ...form, experienceYears: e.target.value })}
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-text outline-none focus:border-primary/50"
                />
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
    </div>
  );
}
