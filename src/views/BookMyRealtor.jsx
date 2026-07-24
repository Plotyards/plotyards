import React, { useState, useEffect } from 'react';
import { Search, MapPin, Phone, MessageCircle, CheckCircle2, ShieldCheck, Award, Briefcase, ExternalLink, Filter } from 'lucide-react';
import { apiRequest } from '../lib/api';
import { formatPhoneForDisplay } from '../utils/phoneUtils';

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
    <div className="min-h-screen bg-surface pb-16 pt-24 md:pt-32">
      <div className="container mx-auto max-w-[1440px] px-6 lg:px-12">

        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-extrabold px-4 py-1.5 rounded-full border border-primary/20 uppercase tracking-wider mb-3">
            <ShieldCheck size={16} /> Verified Realtor Directory
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-text tracking-tight leading-tight">
            Book My Realtor<span className="text-primary">.</span>
          </h1>
          <p className="text-gray-500 font-medium text-base sm:text-lg mt-3">
            Discover and connect directly with verified real estate experts in your locality. No middlemen. Direct Call, WhatsApp & Chat.
          </p>
        </div>

        {/* Search & Filter Card */}
        <form onSubmit={handleSearchSubmit} className="bg-white rounded-3xl p-6 sm:p-8 mb-12 shadow-card border border-gray-100 relative overflow-hidden">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            
            {/* State Dropdown */}
            <div>
              <label className="block text-xs font-bold text-text uppercase tracking-wider mb-2">State</label>
              <select
                value={state}
                onChange={(e) => {
                  setState(e.target.value);
                  setCity('');
                }}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-text outline-none focus:border-primary/50 transition-colors"
              >
                <option value="">All States</option>
                {Object.keys(STATES_CITIES).map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            {/* City Dropdown */}
            <div>
              <label className="block text-xs font-bold text-text uppercase tracking-wider mb-2">City</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-text outline-none focus:border-primary/50 transition-colors"
              >
                <option value="">All Cities</option>
                {(state ? STATES_CITIES[state] || [] : Object.values(STATES_CITIES).flat()).map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Area / Locality Input */}
            <div>
              <label className="block text-xs font-bold text-text uppercase tracking-wider mb-2">Area / Locality</label>
              <input
                type="text"
                placeholder="e.g. Sector 14, Dholera SIR..."
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-text outline-none focus:border-primary/50 transition-colors placeholder:text-gray-400"
              />
            </div>

            {/* Category Dropdown */}
            <div>
              <label className="block text-xs font-bold text-text uppercase tracking-wider mb-2">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-text outline-none focus:border-primary/50 transition-colors"
              >
                <option value="">All Categories</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-2 bg-primary hover:bg-rose-600 text-white font-bold px-8 py-3.5 rounded-xl transition-all text-sm shadow-sm hover:shadow-md"
            >
              <Search size={16} /> Search Realtors
            </button>
          </div>
        </form>

        {/* Directory Listing Grid */}
        {loading ? (
          <div className="py-20 text-center text-gray-500 font-medium">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            Loading active realtors...
          </div>
        ) : realtors.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-3xl p-12 text-center max-w-xl mx-auto shadow-card">
            <ShieldCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-extrabold text-text mb-2">No Realtors Found</h3>
            <p className="text-gray-500 text-sm font-medium">
              There are no active Book My Realtor members matching your search filters right now. Try adjusting your search.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {realtors.map((realtor) => {
              const bp = realtor.brokerProfile || {};
              const rawPhone = bp.contactPhone || realtor.phone || '';
              const displayPhone = formatPhoneForDisplay(rawPhone);
              const whatsappNum = bp.whatsappNumber || rawPhone;

              return (
                <div
                  key={realtor._id}
                  className="bg-white border border-gray-100 rounded-3xl p-6 flex flex-col justify-between shadow-card hover:shadow-xl transition-all duration-300 group"
                >

                  <div>
                    {/* Header: Photo, Name, RERA Badge */}
                    <div className="flex items-start gap-4 mb-4">
                      <img
                        src={bp.photo || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=200&auto=format&fit=crop'}
                        alt={realtor.name}
                        className="w-16 h-16 rounded-2xl object-cover border-2 border-gray-100 group-hover:border-primary/50 transition-colors shadow-sm"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className="text-lg font-extrabold text-text truncate">{realtor.name}</h3>
                          {bp.isReraVerified && (
                            <span className="bg-emerald-50 text-emerald-700 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-200 inline-flex items-center gap-1">
                              <CheckCircle2 size={12} className="text-emerald-600" />
                              RERA Certified
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-semibold text-gray-500 truncate mt-0.5">
                          {bp.companyName || 'Independent Realtor'}
                        </p>
                        {bp.experienceYears > 0 && (
                          <span className="inline-flex items-center gap-1 text-xs text-primary font-bold mt-1">
                            <Briefcase size={13} /> {bp.experienceYears}+ Years Experience
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Short Bio */}
                    {bp.bio && (
                      <p className="text-xs font-medium text-gray-600 line-clamp-2 mb-4 italic bg-gray-50/80 p-2.5 rounded-xl border border-gray-100">
                        "{bp.bio}"
                      </p>
                    )}

                    {/* Location & Areas Served */}
                    <div className="mb-4">
                      <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                        <MapPin size={12} /> Areas Served
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {bp.city && (
                          <span className="bg-gray-100 text-text text-xs px-2.5 py-1 rounded-lg font-bold">
                            {bp.city}
                          </span>
                        )}
                        {(bp.areasServed || []).slice(0, 3).map((areaItem, i) => (
                          <span key={i} className="bg-gray-50 border border-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded-md font-medium">
                            {areaItem}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Categories Served */}
                    {(bp.categoriesServed || []).length > 0 && (
                      <div className="mb-4">
                        <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                          Categories
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {bp.categoriesServed.map((catItem, i) => (
                            <span key={i} className="bg-rose-50 border border-rose-100 text-primary text-[11px] font-bold px-2 py-0.5 rounded-md">
                              {catItem}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Social Media Links */}
                    {bp.socialLinks && (
                      <div className="flex items-center gap-3 mb-6 pt-3 border-t border-gray-100">
                        {bp.socialLinks.instagram && (
                          <a href={bp.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-pink-600 transition-colors text-xs font-bold flex items-center gap-0.5">
                            Instagram <ExternalLink size={10} />
                          </a>
                        )}
                        {bp.socialLinks.facebook && (
                          <a href={bp.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-blue-600 transition-colors text-xs font-bold flex items-center gap-0.5">
                            Facebook <ExternalLink size={10} />
                          </a>
                        )}
                        {bp.socialLinks.linkedin && (
                          <a href={bp.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-sky-600 transition-colors text-xs font-bold flex items-center gap-0.5">
                            LinkedIn <ExternalLink size={10} />
                          </a>
                        )}
                        {bp.socialLinks.youtube && (
                          <a href={bp.socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-red-600 transition-colors text-xs font-bold flex items-center gap-0.5">
                            YouTube <ExternalLink size={10} />
                          </a>
                        )}
                      </div>
                    )}

                  </div>

                  {/* Buyer Contact Actions */}
                  <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-100">
                    <a
                      href={`tel:${rawPhone}`}
                      className="flex items-center justify-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-text font-bold py-2.5 px-3 rounded-xl text-xs transition-colors"
                    >
                      <Phone size={14} className="text-primary" />
                      Direct Call
                    </a>

                    <a
                      href={`https://wa.me/91${whatsappNum.replace(/\D/g, '')}?text=Hi%20${encodeURIComponent(realtor.name)},%20I%20found%20your%20profile%20on%20Plotyards.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-3 rounded-xl text-xs transition-colors shadow-sm"
                    >
                      <MessageCircle size={14} />
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
