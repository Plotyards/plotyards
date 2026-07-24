import React, { useState, useEffect } from 'react';
import { apiRequest } from '../lib/api';

const STATES_CITIES = {
  Haryana: ['Jhajjar', 'Gurgaon', 'Faridabad', 'Rohtak', 'Panipat', 'Karnal', 'Hisar', 'Sonipat'],
  Gujarat: ['Ahmedabad', 'Dholera', 'Surat', 'Vadodara', 'Rajkot'],
  Karnataka: ['Bangalore', 'Mysore', 'Mangalore'],
  Maharashtra: ['Mumbai', 'Pune', 'Nagpur', 'Nashik'],
  'Delhi NCR': ['Delhi', 'Noida', 'Greater Noida', 'Ghaziabad']
};

const CATEGORIES = [
  'Residential Plots',
  'Commercial',
  'Farm Land',
  'Industrial',
  'Villas',
  'Apartments'
];

export default function BookMyRealtor() {
  const [realtors, setRealtors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [area, setArea] = useState('');
  const [category, setCategory] = useState('');

  const fetchRealtors = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (state) queryParams.set('state', state);
      if (city) queryParams.set('city', city);
      if (area) queryParams.set('area', area);
      if (category) queryParams.set('category', category);

      const res = await apiRequest(`/realtors?${queryParams.toString()}`);
      setRealtors(res.realtors || []);
    } catch (err) {
      console.error('Failed to fetch realtors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRealtors();
  }, [state, city, category]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchRealtors();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="bg-blue-500/10 text-blue-400 text-xs font-semibold px-3.5 py-1.5 rounded-full border border-blue-500/20 uppercase tracking-wider">
            Verified Realtor Directory
          </span>
          <h1 className="text-3xl sm:text-5xl font-black mt-4 tracking-tight bg-gradient-to-r from-white via-slate-200 to-blue-400 bg-clip-text text-transparent">
            Book My Realtor
          </h1>
          <p className="text-slate-400 text-base sm:text-lg mt-3">
            Find and connect directly with verified real estate experts in your local area. No middlemen. Direct Call, WhatsApp & Chat.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <form onSubmit={handleSearchSubmit} className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 mb-12 shadow-2xl backdrop-blur-md">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* State Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">State</label>
              <select
                value={state}
                onChange={(e) => {
                  setState(e.target.value);
                  setCity('');
                }}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 text-white"
              >
                <option value="">All States</option>
                {Object.keys(STATES_CITIES).map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            {/* City Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">City</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 text-white"
                disabled={!state && false}
              >
                <option value="">All Cities</option>
                {(state ? STATES_CITIES[state] || [] : Object.values(STATES_CITIES).flat()).map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Area / Locality Search Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Area / Locality</label>
              <input
                type="text"
                placeholder="e.g. Sector 14, Dholera SIR..."
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 text-white placeholder-slate-500"
              />
            </div>

            {/* Property Category Filter */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 text-white"
              >
                <option value="">All Categories</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

          </div>

          <div className="mt-4 flex justify-end">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3 rounded-xl transition shadow-lg shadow-blue-600/20 text-sm"
            >
              Search Realtors
            </button>
          </div>
        </form>

        {/* Directory Listing Grid */}
        {loading ? (
          <div className="py-20 text-center text-slate-400">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            Loading active realtors...
          </div>
        ) : realtors.length === 0 ? (
          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-12 text-center max-w-xl mx-auto">
            <svg className="w-16 h-16 text-slate-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="text-xl font-bold text-white mb-2">No Realtors Found</h3>
            <p className="text-slate-400 text-sm">
              There are no active Book My Realtor members matching your search filters right now. Try clearing filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {realtors.map((realtor) => {
              const bp = realtor.brokerProfile || {};
              const phoneNum = bp.contactPhone || realtor.phone || '';
              const whatsappNum = bp.whatsappNumber || phoneNum;

              return (
                <div
                  key={realtor._id}
                  className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between hover:border-slate-700 transition shadow-xl relative overflow-hidden group"
                >

                  <div>
                    {/* Header: Photo, Name, RERA Badge */}
                    <div className="flex items-start gap-4 mb-4">
                      <img
                        src={bp.photo || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=200&auto=format&fit=crop'}
                        alt={realtor.name}
                        className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-700 group-hover:border-blue-500 transition"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className="text-lg font-bold text-white truncate">{realtor.name}</h3>
                          {bp.isReraVerified && (
                            <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                              <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              RERA Certified
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 font-medium truncate mt-0.5">
                          {bp.companyName || 'Independent Realtor'}
                        </p>
                        {bp.experienceYears > 0 && (
                          <p className="text-[11px] text-blue-400 font-semibold mt-1">
                            {bp.experienceYears}+ Years Experience
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Short Bio */}
                    {bp.bio && (
                      <p className="text-xs text-slate-300 line-clamp-2 mb-4 italic">
                        "{bp.bio}"
                      </p>
                    )}

                    {/* Location & Areas Served */}
                    <div className="mb-4">
                      <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                        Areas Served
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {bp.city && (
                          <span className="bg-slate-800 text-slate-200 text-xs px-2.5 py-1 rounded-lg font-medium">
                            📍 {bp.city}
                          </span>
                        )}
                        {(bp.areasServed || []).slice(0, 3).map((areaItem, i) => (
                          <span key={i} className="bg-slate-800/60 text-slate-300 text-xs px-2 py-0.5 rounded-md">
                            {areaItem}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Categories Served */}
                    {(bp.categoriesServed || []).length > 0 && (
                      <div className="mb-4">
                        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                          Categories
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {bp.categoriesServed.map((catItem, i) => (
                            <span key={i} className="bg-blue-950/40 border border-blue-800/40 text-blue-300 text-[11px] px-2 py-0.5 rounded-md">
                              {catItem}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Social Media Links */}
                    {bp.socialLinks && (
                      <div className="flex items-center gap-3 mb-6 pt-2 border-t border-slate-800/60">
                        {bp.socialLinks.instagram && (
                          <a href={bp.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-pink-400 transition text-xs font-semibold">
                            Instagram
                          </a>
                        )}
                        {bp.socialLinks.facebook && (
                          <a href={bp.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-blue-400 transition text-xs font-semibold">
                            Facebook
                          </a>
                        )}
                        {bp.socialLinks.linkedin && (
                          <a href={bp.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-sky-400 transition text-xs font-semibold">
                            LinkedIn
                          </a>
                        )}
                        {bp.socialLinks.youtube && (
                          <a href={bp.socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-red-400 transition text-xs font-semibold">
                            YouTube
                          </a>
                        )}
                      </div>
                    )}

                  </div>

                  {/* Buyer Contact Actions */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
                    <a
                      href={`tel:${phoneNum}`}
                      className="flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 px-3 rounded-xl text-xs transition"
                    >
                      <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      Direct Call
                    </a>

                    <a
                      href={`https://wa.me/91${whatsappNum.replace(/\D/g, '')}?text=Hi%20${encodeURIComponent(realtor.name)},%20I%20found%20your%20profile%20on%20Plotyards.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-3 rounded-xl text-xs transition"
                    >
                      WhatsApp
                    </a>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
