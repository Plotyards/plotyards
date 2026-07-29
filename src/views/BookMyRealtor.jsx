import React, { useState, useEffect } from 'react';
import { 
  Search, MapPin, Phone, MessageCircle, CheckCircle2, ShieldCheck, 
  Award, Briefcase, Layers, Map, Users, Building2, 
  Star, Sparkles, Home, Trees, Factory, Building, X, Send, User, Mail, FileText, CheckCircle,
  Share2, Heart, Handshake, IndianRupee, Calendar, Bookmark, BadgeCheck, Quote
} from 'lucide-react';
import { apiRequest } from '../lib/api';
import { formatPhoneForDisplay, formatPhoneForLink } from '../utils/phoneUtils';
import DropdownSelect from '../components/DropdownSelect';

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
  'Apartments',
  'Other'
];

export default function BookMyRealtor() {
  const [realtors, setRealtors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [area, setArea] = useState('');
  const [category, setCategory] = useState('');
  const [savedBrokers, setSavedBrokers] = useState({});

  // Lead Form Modal State
  const [selectedRealtor, setSelectedRealtor] = useState(null);
  const [actionType, setActionType] = useState('meeting');
  const [leadForm, setLeadForm] = useState({
    name: '',
    phone: '',
    email: '',
    requirement: 'Residential Plots',
    message: ''
  });
  const [submittingLead, setSubmittingLead] = useState(false);
  const [leadSuccess, setLeadSuccess] = useState(false);
  const [leadError, setLeadError] = useState('');

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

  useEffect(() => {
    if (selectedRealtor) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedRealtor]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchRealtors();
  };

  const getInitials = (name) => {
    if (!name) return 'R';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const toggleSaveBroker = (id) => {
    setSavedBrokers(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleOpenLeadModal = (realtor, type = 'meeting') => {
    setSelectedRealtor(realtor);
    setActionType(type);
    setLeadForm({
      name: '',
      phone: '',
      email: '',
      requirement: realtor.brokerProfile?.categoriesServed?.[0] || 'Residential Plots',
      customRequirement: '',
      message: ''
    });
    setLeadSuccess(false);
    setLeadError('');
  };

  const handleCloseLeadModal = () => {
    setSelectedRealtor(null);
    setLeadSuccess(false);
    setLeadError('');
  };

  const handleLeadSubmit = async (e) => {
    e.preventDefault();
    if (!leadForm.name || !leadForm.phone) {
      setLeadError('Please fill in your Name and Phone number.');
      return;
    }

    setSubmittingLead(true);
    setLeadError('');

    try {
      await apiRequest('/inquiries/realtor', {
        method: 'POST',
        body: {
          brokerId: selectedRealtor._id,
          name: leadForm.name,
          phone: leadForm.phone,
          email: leadForm.email,
          requirement: leadForm.requirement === 'Other' && leadForm.customRequirement 
            ? `Other: ${leadForm.customRequirement}` 
            : leadForm.requirement,
          message: leadForm.message,
          source: actionType === 'call' ? 'call_click' : actionType === 'whatsapp' ? 'whatsapp_click' : 'book_my_realtor'
        }
      });

      setLeadSuccess(true);
    } catch (err) {
      console.error('Failed to submit lead:', err);
      setLeadError(err.message || 'Failed to submit inquiry. Please try again.');
    } finally {
      setSubmittingLead(false);
    }
  };

  const getCategoryIcon = (catName) => {
    const lower = (catName || '').toLowerCase();
    if (lower.includes('residential') || lower.includes('plot')) return Home;
    if (lower.includes('commercial')) return Building;
    if (lower.includes('farm') || lower.includes('land')) return Trees;
    if (lower.includes('industrial')) return Factory;
    return Building2;
  };

  return (
    <div className="min-h-screen bg-surface pb-28 font-sans md:pb-0">
      
      {/* ═══════════ HERO SECTION ═══════════ */}
      <div className="relative overflow-hidden bg-white px-6 pb-28 pt-24 md:pt-36 lg:px-12 border-b border-gray-100">
        <div className="absolute left-1/4 top-0 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-[90px]" />
        <div className="absolute right-1/4 bottom-0 h-[500px] w-[500px] translate-x-1/3 translate-y-1/3 rounded-full bg-secondary/5 blur-[90px]" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMCwwLDAsMC4wNCkiLz48L3N2Zz4=')] opacity-70"></div>
        
        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <div className="mx-auto mb-6 flex max-w-fit items-center gap-2 rounded-full border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-bold uppercase tracking-widest text-text shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
            Verified Realtor Directory
          </div>
          
          <h1 className="mb-4 text-4xl font-extrabold leading-tight tracking-tight text-text sm:text-5xl md:text-6xl">
            Find the <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-rose-400">Perfect Realtor</span>
          </h1>
          
          <p className="mx-auto mb-10 max-w-xl text-base font-medium leading-relaxed text-muted sm:text-lg">
            Directly connect with top-rated, RERA-verified real estate experts. No middlemen. No hidden fees.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-8">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-secondary shadow-xs border border-gray-100">
                <Users size={18} />
              </div>
              <div className="text-left">
                <p className="text-xl font-black text-text">{realtors.length}+</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted">Experts</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-secondary shadow-xs border border-gray-100">
                <MapPin size={18} />
              </div>
              <div className="text-left">
                <p className="text-xl font-black text-text">5+</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted">States</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/10">
                <ShieldCheck size={18} />
              </div>
              <div className="text-left">
                <p className="text-xl font-black text-text">100%</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Verified</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════ FLOATING SEARCH BAR ═══════════ */}
      <div className="relative z-40 mx-auto w-full max-w-[1150px] px-4 sm:px-6 lg:px-8 -mt-10">
        <form
          onSubmit={handleSearchSubmit}
          className="rounded-2xl border border-white bg-white/95 p-3.5 shadow-lg backdrop-blur-xl sm:p-5"
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5 items-end">
            
            <div className="w-full">
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-muted">State</label>
              <DropdownSelect
                value={state}
                onChange={(val) => { setState(val); setCity(''); }}
                placeholder="Select State"
                icon={Map}
                options={[{ value: '', label: 'All States' }, ...Object.keys(STATES_CITIES).map(st => ({ value: st, label: st }))]}
              />
            </div>

            <div className="w-full">
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-muted">City</label>
              <DropdownSelect
                value={city}
                onChange={setCity}
                placeholder="Select City"
                icon={Building2}
                options={[{ value: '', label: 'All Cities' }, ...(state ? STATES_CITIES[state] || [] : Object.values(STATES_CITIES).flat()).map(c => ({ value: c, label: c }))]}
              />
            </div>

            <div className="w-full">
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-muted">Locality</label>
              <div className="flex items-center rounded-xl border border-gray-200 bg-surface px-3 py-2.5 transition-colors focus-within:border-primary focus-within:bg-white">
                <MapPin size={15} className="mr-2 text-primary" />
                <input
                  type="text"
                  placeholder='e.g. Sector 14...'
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="w-full bg-transparent text-xs font-semibold text-text outline-none placeholder:text-gray-400"
                />
              </div>
            </div>

            <div className="w-full">
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-muted">Category</label>
              <DropdownSelect
                value={category}
                onChange={setCategory}
                placeholder="All Categories"
                icon={Layers}
                options={[{ value: '', label: 'All Categories' }, ...CATEGORIES.map(cat => ({ value: cat, label: cat }))]}
              />
            </div>

            <button
              type="submit"
              className="flex w-full h-[42px] items-center justify-center gap-2 rounded-xl bg-primary px-5 text-xs font-bold text-white shadow-md transition-all hover:bg-rose-600 active:scale-95"
            >
              <Search size={15} /> Search
            </button>
          </div>
        </form>
      </div>

      {/* ═══════════ CARDS GRID ═══════════ */}
      <div className="mx-auto w-full max-w-[1350px] px-4 py-12 lg:px-8">
        
        {!loading && realtors.length > 0 && (
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-xl font-black text-text">
              Top Realtors <span className="text-primary font-medium text-base ml-2">({realtors.length} available)</span>
            </h2>
          </div>
        )}

        {loading ? (
          <div className="py-20 text-center">
            <div className="mx-auto mb-3 h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
            <p className="text-xs font-bold text-muted uppercase tracking-widest">Loading Experts...</p>
          </div>
        ) : realtors.length === 0 ? (
          <div className="mx-auto mt-8 max-w-md rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center shadow-xs">
            <Search className="mx-auto mb-3 h-10 w-10 text-gray-300" />
            <h3 className="mb-1 text-lg font-bold text-text">No matches found</h3>
            <p className="text-xs font-medium text-muted">
              Adjust your filters to find realtors in this area.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
            {realtors.map((realtor, idx) => {
              const bp = realtor.brokerProfile || {};
              const rawPhone = bp.contactPhone || realtor.phone || '';
              const whatsappNum = bp.whatsappNumber || rawPhone;
              const hasPhoto = !!bp.photo;
              const isSaved = !!savedBrokers[realtor._id];

              const expYears = bp.experienceYears || (idx % 3 === 0 ? 10 : idx % 2 === 0 ? 7 : 5);
              const dealsClosed = bp.closedDeals || (idx % 2 === 0 ? '250+' : '180+');
              const totalSales = bp.totalSales || (idx % 2 === 0 ? '₹150Cr+' : '₹90Cr+');
              const realtorId = `PY-${10450 + idx}`;

              return (
                <div
                  key={realtor._id}
                  className="group relative flex flex-col overflow-hidden rounded-3xl bg-white border border-gray-200/80 shadow-md transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl"
                >
                  
                  {/* ─── 1. TOP CITYSCAPE BANNER ─── */}
                  <div className="relative h-[135px] w-full bg-slate-900 overflow-hidden">
                    {/* Background City Image Overlay */}
                    <img 
                      src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80" 
                      alt="City Header" 
                      className="h-full w-full object-cover opacity-50 transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20"></div>

                    {/* Top Left Badges */}
                    <div className="absolute top-3 left-3.5 z-10 flex flex-col gap-0.5">
                      <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-emerald-400">
                        <ShieldCheck size={13} strokeWidth={2.5} />
                        VERIFIED PARTNER
                      </div>
                      <div className="flex items-center gap-1 text-[11px] font-black tracking-tight text-white">
                        <Sparkles size={11} className="text-amber-400 fill-amber-400" />
                        Plotyards
                      </div>
                    </div>

                    {/* Top Right Action Icons */}
                    <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
                      <button 
                        onClick={() => {
                          if (navigator.share) {
                            navigator.share({ title: realtor.name, url: window.location.href });
                          } else {
                            navigator.clipboard.writeText(window.location.href);
                            alert('Link copied!');
                          }
                        }}
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md hover:bg-white hover:text-text transition-colors"
                        title="Share Profile"
                      >
                        <Share2 size={13} />
                      </button>

                      <button 
                        onClick={() => toggleSaveBroker(realtor._id)}
                        className={`flex h-7 w-7 items-center justify-center rounded-full backdrop-blur-md transition-colors ${
                          isSaved ? 'bg-primary text-white' : 'bg-black/40 text-white hover:bg-white hover:text-primary'
                        }`}
                        title="Save Profile"
                      >
                        <Heart size={13} className={isSaved ? 'fill-white' : ''} />
                      </button>
                    </div>
                  </div>

                  {/* ─── 2. PROFILE AVATAR OVERLAP ─── */}
                  <div className="relative z-20 -mt-[54px] flex flex-col items-center px-4">
                    <div className="relative mb-2">
                      <div className="flex h-[96px] w-[96px] items-center justify-center overflow-hidden rounded-full border-[4px] border-white bg-white shadow-xl">
                        {hasPhoto ? (
                          <img
                            src={bp.photo}
                            alt={realtor.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-secondary/10 to-primary/20 text-2xl font-black text-secondary">
                            {getInitials(realtor.name)}
                          </div>
                        )}
                      </div>
                      
                      {/* Active Online Indicator */}
                      <span className="absolute bottom-1 right-1 flex h-4 w-4 rounded-full border-2 border-white bg-emerald-500 shadow-sm" />
                    </div>

                    {/* Name & Title */}
                    <div className="text-center w-full">
                      <h3 className="flex items-center justify-center gap-1.5 text-lg font-black tracking-tight text-text">
                        {realtor.name}
                        <BadgeCheck size={18} className="text-emerald-500 fill-emerald-500/20" />
                      </h3>
                      <p className="text-xs font-semibold text-gray-500">
                        {bp.companyName || 'Senior Property Consultant'}
                      </p>

                      {/* Badges Strip */}
                      <div className="mt-2.5 flex flex-wrap items-center justify-center gap-1.5">
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-extrabold text-amber-800 border border-amber-200/70 shadow-2xs">
                          <Sparkles size={10} className="text-amber-600" /> Plotyards Verified Partner
                        </span>
                        <span className="inline-flex items-center rounded-full bg-slate-900 px-2.5 py-0.5 text-[10px] font-extrabold text-white shadow-2xs">
                          ID: {realtorId}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* ─── 3. CARD BODY ─── */}
                  <div className="flex flex-1 flex-col px-4 pt-3.5 pb-4 space-y-3.5">
                    
                    {/* 4-Column Stats Box */}
                    <div className="grid grid-cols-4 gap-1 rounded-2xl border border-gray-200/90 bg-white p-2 text-center shadow-xs">
                      <div className="flex flex-col items-center justify-center border-r border-gray-100 pr-1">
                        <Award size={15} className="mb-1 text-emerald-600" />
                        <p className="text-xs font-black text-text">{expYears}+</p>
                        <p className="text-[8px] font-bold text-gray-400 uppercase tracking-tight">Years Exp.</p>
                      </div>

                      <div className="flex flex-col items-center justify-center border-r border-gray-100 px-1">
                        <MapPin size={15} className="mb-1 text-primary" />
                        <p className="max-w-full truncate text-xs font-black text-text">{bp.city || 'Rohtak'}</p>
                        <p className="text-[8px] font-bold text-gray-400 uppercase tracking-tight">Location</p>
                      </div>

                      <div className="flex flex-col items-center justify-center border-r border-gray-100 px-1">
                        <Handshake size={15} className="mb-1 text-blue-600" />
                        <p className="text-xs font-black text-text">{dealsClosed}</p>
                        <p className="text-[8px] font-bold text-gray-400 uppercase tracking-tight">Deals Closed</p>
                      </div>

                      <div className="flex flex-col items-center justify-center pl-1">
                        <IndianRupee size={15} className="mb-1 text-amber-600" />
                        <p className="text-xs font-black text-text">{totalSales}</p>
                        <p className="text-[8px] font-bold text-gray-400 uppercase tracking-tight">Total Sales</p>
                      </div>
                    </div>

                    {/* Specializes In Grid (3x2 compact boxes) */}
                    {(bp.categoriesServed || CATEGORIES).length > 0 && (
                      <div>
                        <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-500">Specializes In</p>
                        <div className="grid grid-cols-3 gap-1.5">
                          {(bp.categoriesServed && bp.categoriesServed.length > 0 ? bp.categoriesServed : CATEGORIES).slice(0, 6).map((catItem, i) => {
                            const IconComponent = getCategoryIcon(catItem);
                            return (
                              <div
                                key={i}
                                className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-gray-50/70 p-2 text-left transition-colors hover:border-primary/40 hover:bg-white"
                              >
                                <IconComponent size={14} className="text-secondary shrink-0" />
                                <span className="line-clamp-1 text-[10px] font-bold text-text leading-tight">{catItem}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}



                  </div>

                  {/* ─── 4. BOTTOM ACTION BUTTONS ─── */}
                  <div className="p-4 pt-0 space-y-2 bg-white z-20">
                    {/* 3 Buttons Row */}
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        onClick={() => handleOpenLeadModal(realtor, 'call')}
                        className="flex items-center justify-center gap-1 rounded-xl bg-[#009688] py-2.5 text-[10px] font-extrabold text-white transition-all hover:bg-[#00796b] active:scale-95 shadow-2xs"
                      >
                        <Phone size={12} /> Call Now
                      </button>

                      <button
                        onClick={() => handleOpenLeadModal(realtor, 'whatsapp')}
                        className="flex items-center justify-center gap-1 rounded-xl bg-[#25D366] py-2.5 text-[10px] font-extrabold text-white transition-all hover:bg-[#1ebd5a] active:scale-95 shadow-2xs"
                      >
                        <MessageCircle size={12} /> WhatsApp
                      </button>

                      <button
                        onClick={() => handleOpenLeadModal(realtor, 'meeting')}
                        className="flex items-center justify-center gap-1 rounded-xl bg-[#0F172A] py-2.5 text-[10px] font-extrabold text-white transition-all hover:bg-primary active:scale-95 shadow-2xs"
                      >
                        <Calendar size={12} /> Book Meeting
                      </button>
                    </div>

                    {/* Save Realtor Outline Button */}
                    <button
                      onClick={() => toggleSaveBroker(realtor._id)}
                      className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-gray-300 bg-white py-2 text-[11px] font-extrabold text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Bookmark size={12} className={isSaved ? 'text-primary fill-primary' : 'text-gray-400'} />
                      {isSaved ? 'Realtor Saved' : 'Save Realtor'}
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* ═══════════ LEAD FORM POPUP MODAL ═══════════ */}
      {selectedRealtor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl bg-white shadow-2xl border border-gray-100">
            
            {/* Modal Header */}
            <div className="relative bg-gradient-to-r from-secondary to-teal-800 p-6 text-white rounded-t-3xl overflow-hidden">
              <button
                onClick={handleCloseLeadModal}
                className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border-2 border-white/50 bg-white/10">
                  {selectedRealtor.brokerProfile?.photo ? (
                    <img
                      src={selectedRealtor.brokerProfile.photo}
                      alt={selectedRealtor.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-xl font-bold text-white">
                      {getInitials(selectedRealtor.name)}
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-black">{selectedRealtor.name}</h3>
                  <p className="text-xs text-white/80 font-medium">
                    {selectedRealtor.brokerProfile?.companyName || 'Verified Realtor'} • {selectedRealtor.brokerProfile?.city || 'India'}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {leadSuccess ? (
                <div className="py-8 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <CheckCircle size={36} />
                  </div>
                  <h4 className="text-2xl font-black text-text">
                    {actionType === 'call' ? 'Phone Number Revealed!' : actionType === 'whatsapp' ? 'Ready to Connect!' : 'Meeting Request Sent!'}
                  </h4>
                  <p className="mt-2 text-sm font-medium text-muted">
                    {actionType === 'call' 
                      ? "You can now call the realtor directly."
                      : actionType === 'whatsapp'
                      ? "Click below to open WhatsApp."
                      : `We have shared your request with ${selectedRealtor.name}. They will contact you shortly.`}
                  </p>

                  {actionType === 'call' && (
                    <a
                      href={`tel:${selectedRealtor.brokerProfile?.contactPhone || selectedRealtor.phone}`}
                      className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#009688] px-8 py-3.5 text-sm font-bold text-white hover:bg-[#00796b] shadow-md transition-all"
                    >
                      <Phone size={18} /> {selectedRealtor.brokerProfile?.contactPhone || selectedRealtor.phone}
                    </a>
                  )}

                  {actionType === 'whatsapp' && (
                    <a
                      href={`https://wa.me/${formatPhoneForLink(selectedRealtor.brokerProfile?.whatsappNumber || selectedRealtor.phone)}?text=Hi%20${encodeURIComponent(selectedRealtor.name)},%20I%20found%20your%20profile%20on%20Plotyards.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={handleCloseLeadModal}
                      className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-8 py-3.5 text-sm font-bold text-white hover:bg-[#1ebd5a] shadow-md transition-all"
                    >
                      <MessageCircle size={18} /> Continue to WhatsApp
                    </a>
                  )}

                  <button
                    onClick={handleCloseLeadModal}
                    className={`mt-4 w-full rounded-xl px-8 py-3.5 text-sm font-bold transition-all ${actionType === 'meeting' ? 'bg-primary text-white hover:bg-rose-600 shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  >
                    {actionType === 'meeting' ? 'Done' : 'Close'}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleLeadSubmit} className="space-y-4">
                  <div>
                    <h4 className="text-lg font-black text-text">
                      {actionType === 'call' ? 'View Contact Number' : actionType === 'whatsapp' ? 'Connect on WhatsApp' : 'Book Meeting / Consultation'}
                    </h4>
                    <p className="text-xs font-medium text-muted">
                      {actionType === 'meeting' 
                        ? 'Fill in your details below to connect with this expert.' 
                        : 'Please share your details to reveal the contact information.'}
                    </p>
                  </div>

                  {leadError && (
                    <div className="rounded-xl bg-red-50 p-3 text-xs font-bold text-red-600 border border-red-200">
                      {leadError}
                    </div>
                  )}

                  <div>
                    <label className="mb-1 block text-xs font-bold text-text">Your Name *</label>
                    <div className="flex items-center rounded-xl border border-gray-200 bg-surface px-3.5 py-2.5 focus-within:border-primary focus-within:bg-white">
                      <User size={16} className="mr-2 text-gray-400" />
                      <input
                        type="text"
                        required
                        placeholder="Enter your full name"
                        value={leadForm.name}
                        onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
                        className="w-full bg-transparent text-sm font-semibold text-text outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-bold text-text">Phone Number *</label>
                    <div className="flex items-center rounded-xl border border-gray-200 bg-surface px-3.5 py-2.5 focus-within:border-primary focus-within:bg-white">
                      <Phone size={16} className="mr-2 text-gray-400" />
                      <input
                        type="tel"
                        required
                        placeholder="e.g. 9876543210"
                        value={leadForm.phone}
                        onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                        className="w-full bg-transparent text-sm font-semibold text-text outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-bold text-text">Email Address (Optional)</label>
                    <div className="flex items-center rounded-xl border border-gray-200 bg-surface px-3.5 py-2.5 focus-within:border-primary focus-within:bg-white">
                      <Mail size={16} className="mr-2 text-gray-400" />
                      <input
                        type="email"
                        placeholder="name@example.com"
                        value={leadForm.email}
                        onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                        className="w-full bg-transparent text-sm font-semibold text-text outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-bold text-text">Looking For / Requirement</label>
                    <DropdownSelect
                      value={leadForm.requirement}
                      onChange={(val) => setLeadForm({ ...leadForm, requirement: val })}
                      options={CATEGORIES.map((cat) => ({ value: cat, label: cat }))}
                      icon={Layers}
                      placeholder="Select Category"
                    />
                    {leadForm.requirement === 'Other' && (
                      <div className="mt-2 animate-in fade-in duration-150">
                        <input
                          type="text"
                          placeholder="Please specify your requirement..."
                          value={leadForm.customRequirement || ''}
                          onChange={(e) => setLeadForm({ ...leadForm, customRequirement: e.target.value })}
                          className="w-full rounded-xl border border-gray-200 bg-surface px-3.5 py-2 text-xs font-semibold text-text outline-none focus:border-primary focus:bg-white"
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-bold text-text">Message / Preferred Date</label>
                    <div className="flex items-start rounded-xl border border-gray-200 bg-surface px-3.5 py-2.5 focus-within:border-primary focus-within:bg-white">
                      <FileText size={16} className="mr-2 mt-0.5 text-gray-400" />
                      <textarea
                        rows={2}
                        placeholder="Tell the realtor what budget, location, or time you prefer..."
                        value={leadForm.message}
                        onChange={(e) => setLeadForm({ ...leadForm, message: e.target.value })}
                        className="w-full bg-transparent text-sm font-semibold text-text outline-none resize-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submittingLead}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-extrabold text-white shadow-md hover:bg-rose-600 disabled:opacity-50 transition-all"
                  >
                    {submittingLead ? (
                      <span>Processing...</span>
                    ) : (
                      <>
                        {actionType === 'call' ? <Phone size={16} /> : actionType === 'whatsapp' ? <MessageCircle size={16} /> : <Send size={16} />}
                        {actionType === 'call' ? 'Show Number' : actionType === 'whatsapp' ? 'Proceed to WhatsApp' : 'Submit Meeting Request'}
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
