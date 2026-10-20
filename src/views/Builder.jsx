"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Building2, MapPin, Search, CheckCircle2, MessageCircle, ArrowRight } from 'lucide-react';
import { apiRequest } from '../lib/api';
import { adaptProperties } from '../utils/propertyAdapter';
import { formatPhoneForLink } from '../utils/phoneUtils';

const defaultBuilderProjects = [
  {
    id: 'builder-dlf-meadows',
    title: 'DLF Gardencity Plotted Township',
    builderName: 'DLF Homes',
    location: 'Sector 91-92, Gurugram',
    city: 'Gurugram',
    locality: 'Sector 91',
    price: 'Rs. 1.85 Cr',
    priceValue: 18500000,
    size: '250 Sq. Yrd',
    sizeValue: 250,
    rate: 'Rs. 74,000 / Sq. Yrd',
    type: 'Residential',
    approved: true,
    featured: true,
    isDeveloperListing: true,
    isDemo: false,
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1170&auto=format&fit=crop',
    tags: ['Gated Township', 'Clubhouse Access', 'Ready Possession'],
    aboutBuilder: 'DLF has over 75 years of real estate excellence and development track record across India.'
  },
  {
    id: 'builder-godrej-retreat',
    title: 'Godrej Retreat Orchard Plots',
    builderName: 'Godrej Properties',
    location: 'Sector 83, Faridabad',
    city: 'Faridabad',
    locality: 'Sector 83',
    price: 'Rs. 95.00 L',
    priceValue: 9500000,
    size: '180 Sq. Yrd',
    sizeValue: 180,
    rate: 'Rs. 52,777 / Sq. Yrd',
    type: 'Residential',
    approved: true,
    featured: true,
    isDeveloperListing: true,
    isDemo: false,
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1170&auto=format&fit=crop',
    tags: ['Resort Living', 'RERA Approved', 'Direct Registry'],
    aboutBuilder: 'Godrej Properties brings the philosophy of innovation, sustainability, and excellence to real estate.'
  },
  {
    id: 'builder-bptp-district',
    title: 'BPTP The District Premium Plotted Sector',
    builderName: 'BPTP Builders',
    location: 'Sector 81, Greater Faridabad',
    city: 'Faridabad',
    locality: 'Sector 81',
    price: 'Rs. 1.20 Cr',
    priceValue: 12000000,
    size: '204 Sq. Yrd',
    sizeValue: 204,
    rate: 'Rs. 58,823 / Sq. Yrd',
    type: 'Residential',
    approved: true,
    featured: true,
    isDeveloperListing: true,
    isDemo: false,
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=1175&auto=format&fit=crop',
    tags: ['Gated Security', 'Wide Roads', 'Bank Loan Ready'],
    aboutBuilder: 'BPTP has established itself as one of the key developers in NCR with master-planned townships.'
  }
];

export default function Builder() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('All');
  const [liveProperties, setLiveProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  const defaultWhatsapp = '918287697756';

  useEffect(() => {
    let isMounted = true;
    apiRequest('/properties?limit=100')
      .then((data) => {
        if (isMounted && data && Array.isArray(data.properties)) {
          const adapted = adaptProperties(data.properties);
          const devProps = adapted.filter((p) => p.isDeveloperListing);
          setLiveProperties(devProps);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Merge live developer properties with curated defaults
  const allProjects = useMemo(() => {
    const combined = [...liveProperties];
    defaultBuilderProjects.forEach((def) => {
      if (!combined.some((item) => (item.id || item._id) === def.id)) {
        combined.push(def);
      }
    });
    return combined;
  }, [liveProperties]);

  // Extract unique cities
  const cityOptions = useMemo(() => {
    const cities = new Set(allProjects.map((p) => p.city).filter(Boolean));
    return ['All', ...Array.from(cities)];
  }, [allProjects]);

  // Filter projects by search query and city
  const filteredProjects = useMemo(() => {
    return allProjects.filter((item) => {
      const matchesCity = selectedCity === 'All' || (item.city && item.city.toLowerCase() === selectedCity.toLowerCase());
      if (!matchesCity) return false;

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase();
      const title = (item.title || '').toLowerCase();
      const builder = (item.builderName || '').toLowerCase();
      const location = (item.location || '').toLowerCase();
      const locality = (item.locality || '').toLowerCase();
      const city = (item.city || '').toLowerCase();

      return title.includes(q) || builder.includes(q) || location.includes(q) || locality.includes(q) || city.includes(q);
    });
  }, [allProjects, selectedCity, searchQuery]);

  return (
    <div className="min-h-screen bg-surface pb-28 md:pb-16 pt-3 md:pt-6">
      {/* Top Banner / Hero */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-secondary via-slate-900 to-black text-white p-6 sm:p-10 shadow-2xl">
          <div className="absolute right-0 top-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-primary/20 blur-3xl pointer-events-none"></div>
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/20 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-rose-300 backdrop-blur-md">
              <Building2 size={14} className="text-primary" />
              Direct Developer & Builder Projects
            </div>
            <h1 className="mt-3 text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
              Builder Projects Showcase
            </h1>
            <p className="mt-3 text-sm sm:text-base font-medium text-slate-300 leading-relaxed">
              Explore plotted developments directly from reputed builders with clear titles, verified RERA credentials, zero brokerage, and master-planned amenities.
            </p>

            {/* Highlights row */}
            <div className="mt-6 grid grid-cols-3 gap-2 sm:gap-4 border-t border-white/10 pt-5">
              <div>
                <p className="text-base sm:text-xl font-black text-primary">100%</p>
                <p className="text-[11px] sm:text-xs text-slate-300 font-semibold">RERA Verified</p>
              </div>
              <div>
                <p className="text-base sm:text-xl font-black text-emerald-400">0%</p>
                <p className="text-[11px] sm:text-xs text-slate-300 font-semibold">Brokerage Fee</p>
              </div>
              <div>
                <p className="text-base sm:text-xl font-black text-rose-300">Direct</p>
                <p className="text-[11px] sm:text-xs text-slate-300 font-semibold">Builder Desk</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search builder, project, or location..."
              className="w-full h-12 rounded-2xl border border-gray-200 bg-white pl-11 pr-4 text-sm font-semibold text-text shadow-xs outline-none transition-colors focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* City Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {cityOptions.map((city) => (
              <button
                key={city}
                onClick={() => setSelectedCity(city)}
                className={`flex-shrink-0 rounded-xl px-4 py-2 text-xs font-extrabold transition-all ${
                  selectedCity === city
                    ? 'bg-primary text-white shadow-md shadow-primary/25'
                    : 'bg-white text-gray-600 border border-gray-200/80 hover:bg-gray-50'
                }`}
              >
                {city}
              </button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <div className="mt-4 flex items-center justify-between px-1">
          <p className="text-xs font-bold text-muted">
            Showing <span className="text-text font-black">{filteredProjects.length}</span> builder projects
          </p>
        </div>

        {/* Builder Projects Grid */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((plot) => {
            const imageUrl = plot.image || plot.images?.[0]?.url || 'https://images.unsplash.com/photo-1524813686514-a57563d77965?q=80&w=1032&auto=format&fit=crop';
            const builderName = plot.builderName || (plot.isDeveloperListing ? (plot.broker?.brokerProfile?.companyName || plot.broker?.name) : '') || 'Reputed Developer';
            const linkId = plot.id || plot._id;
            const waNumber = formatPhoneForLink(plot.broker?.whatsapp || plot.broker?.phone || defaultWhatsapp);
            const waMessage = encodeURIComponent(`Hi, I am interested in your builder project "${plot.title}" by ${builderName} listed on Plotyards.`);

            return (
              <div
                key={linkId || plot.title}
                className="group flex flex-col rounded-[2rem] border border-border bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/40 hover:shadow-xl"
              >
                {/* Image Container */}
                <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-surface shadow-sm">
                  <img
                    src={imageUrl}
                    alt={plot.title}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20"></div>

                  {/* Top Badges */}
                  <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1 text-xs font-black text-text shadow-md backdrop-blur-md">
                      <Building2 size={13} className="text-primary" />
                      {builderName}
                    </span>
                  </div>

                  <div className="absolute right-3 top-3">
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600/90 px-2.5 py-1 text-[11px] font-bold text-white shadow-md backdrop-blur-md">
                      <CheckCircle2 size={12} />
                      Verified
                    </span>
                  </div>

                  {/* Bottom Type Badge */}
                  <div className="absolute bottom-3 left-3">
                    <span className="rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-md">
                      {plot.type || 'Plotted Project'}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="mt-4 flex flex-1 flex-col">
                  <Link href={`/property/${linkId}`}>
                    <h2 className="line-clamp-2 text-base sm:text-lg font-black leading-snug text-text transition-colors group-hover:text-primary">
                      {plot.title}
                    </h2>
                  </Link>

                  <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-gray-500">
                    <MapPin size={14} className="text-primary flex-shrink-0" />
                    <span className="truncate">{plot.location}</span>
                  </p>

                  {/* Price & Size Grid */}
                  <div className="mt-4 grid grid-cols-2 gap-2 rounded-2xl bg-surface p-3 border border-border/60">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Price</p>
                      <p className="mt-0.5 truncate text-sm font-black text-text">{plot.price}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Plot Size</p>
                      <p className="mt-0.5 truncate text-sm font-extrabold text-text">{plot.size}</p>
                    </div>
                  </div>

                  {/* Highlight Tags */}
                  {Array.isArray(plot.tags) && plot.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {plot.tags.slice(0, 3).map((tag, idx) => (
                        <span key={idx} className="rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-bold capitalize text-gray-600">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="mt-5 pt-3 border-t border-border flex items-center gap-2">
                    <a
                      href={`https://wa.me/${waNumber}?text=${waMessage}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2.5 text-xs font-extrabold text-white shadow-sm transition-all hover:bg-emerald-700 active:scale-95"
                    >
                      <MessageCircle size={15} />
                      WhatsApp Builder
                    </a>

                    <Link
                      href={`/property/${linkId}`}
                      className="inline-flex items-center justify-center gap-1 rounded-xl bg-slate-900 px-3.5 py-2.5 text-xs font-extrabold text-white shadow-sm transition-all hover:bg-slate-800 active:scale-95"
                    >
                      <span>View</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredProjects.length === 0 && (
          <div className="mt-12 text-center py-16 bg-white rounded-3xl border border-gray-100 p-8">
            <Building2 size={48} className="mx-auto text-gray-300" />
            <h3 className="mt-4 text-lg font-bold text-text">No builder projects found</h3>
            <p className="mt-1 text-sm text-muted">Try adjusting your search query or city filter.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCity('All');
              }}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
