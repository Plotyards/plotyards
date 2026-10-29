"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Building2, Search, ArrowRight } from 'lucide-react';
import { apiRequest } from '../lib/api';
import { adaptProperties } from '../utils/propertyAdapter';
import BuilderCard from '../components/BuilderCard';

export const defaultBuilderProjects = [
  {
    id: 'builder-dlf-privana',
    title: 'DLF Privana West',
    subtitle: 'Luxury Plotted Residences',
    builderName: 'DLF Limited',
    location: 'Sector 76–77, Gurugram, Haryana',
    city: 'Gurugram',
    locality: 'Sector 76-77',
    price: 'Rs. 4.10 Cr',
    priceValue: 41000000,
    size: '350 Sq. Yrd',
    sizeValue: 350,
    handover: 'Q4 2028',
    rate: 'Rs. 1,17,000 / Sq. Yrd',
    type: 'Luxury Residential',
    approved: true,
    featured: true,
    isDeveloperListing: true,
    isDemo: false,
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1170&auto=format&fit=crop',
    tags: ['RERA Registered', 'Ultra Luxury', 'Aravalli Facing'],
    aboutBuilder: 'DLF has over 75 years of real estate excellence and development track record across India.'
  },
  {
    id: 'builder-godrej-riverine',
    title: 'Godrej Riverine',
    subtitle: 'Premium Residences & Plots',
    builderName: 'Godrej Properties',
    location: 'Sector 44, Noida, Uttar Pradesh',
    city: 'Noida',
    locality: 'Sector 44',
    price: 'Rs. 7.25 Cr',
    priceValue: 72500000,
    size: '420 Sq. Yrd',
    sizeValue: 420,
    handover: 'Q2 2029',
    rate: 'Rs. 1,72,000 / Sq. Yrd',
    type: 'Premium Residential',
    approved: true,
    featured: true,
    isDeveloperListing: true,
    isDemo: false,
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1170&auto=format&fit=crop',
    tags: ['Golf Course Facing', 'Resort Style', 'RERA Approved'],
    aboutBuilder: 'Godrej Properties brings the philosophy of innovation, sustainability, and excellence to real estate.'
  },
  {
    id: 'builder-lodha-bellagio',
    title: 'Lodha Bellagio',
    subtitle: 'Lakefront Plotted Estates',
    builderName: 'Lodha Group',
    location: 'Powai, Mumbai, Maharashtra',
    city: 'Mumbai',
    locality: 'Powai',
    price: 'Rs. 5.80 Cr',
    priceValue: 58000000,
    size: '300 Sq. Yrd',
    sizeValue: 300,
    handover: 'Q3 2028',
    rate: 'Rs. 1,93,333 / Sq. Yrd',
    type: 'Lakefront Luxury',
    approved: true,
    featured: true,
    isDeveloperListing: true,
    isDemo: false,
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1170&auto=format&fit=crop',
    tags: ['Lakefront Living', 'Private Deck', 'Ready Registry'],
    aboutBuilder: 'Lodha is India’s premier real estate developer renowned for world-class developments.'
  },
  {
    id: 'builder-dlf-meadows',
    title: 'DLF Gardencity Plotted Township',
    subtitle: 'Master Planned Plotted Sector',
    builderName: 'DLF Homes',
    location: 'Sector 91-92, Gurugram, Haryana',
    city: 'Gurugram',
    locality: 'Sector 91',
    price: 'Rs. 1.85 Cr',
    priceValue: 18500000,
    size: '250 Sq. Yrd',
    sizeValue: 250,
    handover: 'Ready Possession',
    rate: 'Rs. 74,000 / Sq. Yrd',
    type: 'Residential',
    approved: true,
    featured: true,
    isDeveloperListing: true,
    isDemo: false,
    image: 'https://images.unsplash.com/photo-1524813686514-a57563d77965?q=80&w=1170&auto=format&fit=crop',
    tags: ['Gated Township', 'Clubhouse Access', 'Ready Possession'],
    aboutBuilder: 'DLF has over 75 years of real estate excellence and development track record across India.'
  },
  {
    id: 'builder-godrej-retreat',
    title: 'Godrej Retreat Orchard Plots',
    subtitle: 'Resort Style Plotted Living',
    builderName: 'Godrej Properties',
    location: 'Sector 83, Faridabad, Haryana',
    city: 'Faridabad',
    locality: 'Sector 83',
    price: 'Rs. 95.00 L',
    priceValue: 9500000,
    size: '180 Sq. Yrd',
    sizeValue: 180,
    handover: 'Ready Registry',
    rate: 'Rs. 52,777 / Sq. Yrd',
    type: 'Residential',
    approved: true,
    featured: true,
    isDeveloperListing: true,
    isDemo: false,
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1170&auto=format&fit=crop',
    tags: ['Resort Living', 'RERA Approved', 'Direct Registry'],
    aboutBuilder: 'Godrej Properties brings the philosophy of innovation, sustainability, and excellence to real estate.'
  },
  {
    id: 'builder-bptp-district',
    title: 'BPTP The District Premium Plotted Sector',
    subtitle: 'Gated Township Infrastructure',
    builderName: 'BPTP Builders',
    location: 'Sector 81, Greater Faridabad, Haryana',
    city: 'Faridabad',
    locality: 'Sector 81',
    price: 'Rs. 1.20 Cr',
    priceValue: 12000000,
    size: '204 Sq. Yrd',
    sizeValue: 204,
    handover: 'Immediate Registry',
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
      {/* Top Banner with Red & White Theme */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-white via-rose-50/40 to-white text-gray-900 p-6 sm:p-10 border border-rose-100 shadow-[0_10px_35px_rgba(225,29,72,0.06)]">
          <div className="absolute right-0 top-0 -mt-10 -mr-10 h-72 w-72 rounded-full bg-primary/10 blur-3xl pointer-events-none"></div>
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-rose-50 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-primary shadow-xs">
              <Building2 size={14} className="text-primary" />
              Direct Developer & Builder Projects
            </div>
            <h1 className="mt-3 text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-gray-950">
              India's Leading <span className="text-primary">Builder Plotted</span> Townships
            </h1>
            <p className="mt-2 sm:mt-3 text-xs sm:text-base font-semibold text-gray-600 leading-relaxed">
              Explore 100% RERA verified gated layouts, expressway parcels, and luxury plotted communities directly from top builders with transparent pricing and zero brokerage.
            </p>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-gray-200/90 shadow-sm">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by builder, project name, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl bg-gray-50/80 pl-10 pr-4 py-2.5 text-xs sm:text-sm font-bold text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary border border-transparent transition-all"
            />
          </div>

          {/* City Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {cityOptions.map((city) => (
              <button
                key={city}
                onClick={() => setSelectedCity(city)}
                className={`flex-shrink-0 rounded-xl px-4 py-2 text-xs font-extrabold transition-all cursor-pointer ${
                  selectedCity === city
                    ? 'bg-primary text-white shadow-md shadow-primary/25'
                    : 'bg-white text-gray-600 border border-gray-200/80 hover:bg-rose-50/40 hover:text-primary hover:border-primary/40'
                }`}
              >
                {city}
              </button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <div className="mt-4 flex items-center justify-between px-1">
          <p className="text-xs font-bold text-gray-500">
            Showing <span className="text-gray-950 font-black">{filteredProjects.length}</span> premium builder projects
          </p>
        </div>

        {/* Builder Projects Grid */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((plot) => (
            <BuilderCard
              key={plot.id || plot._id || plot.title}
              plot={plot}
              defaultWhatsapp={defaultWhatsapp}
            />
          ))}
        </div>

        {/* Empty State */}
        {filteredProjects.length === 0 && (
          <div className="mt-12 text-center py-16 bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
            <Building2 size={48} className="mx-auto text-gray-300" />
            <h3 className="mt-4 text-lg font-bold text-gray-900">No builder projects found</h3>
            <p className="mt-1 text-sm text-gray-500">Try adjusting your search query or city filter.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCity('All');
              }}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white shadow-sm shadow-primary/20 hover:bg-rose-700 cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
