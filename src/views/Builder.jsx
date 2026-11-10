"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Building2, Search, ArrowRight } from 'lucide-react';
import { apiRequest } from '../lib/api';
import { adaptProperties } from '../utils/propertyAdapter';
import BuilderCard from '../components/BuilderCard';

export const defaultBuilderProjects = [];

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
          const devProps = adapted.filter((p) => p.isDeveloperListing && !p.isDemo);
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

  // Live developer projects only - demo projects are excluded
  const allProjects = useMemo(() => {
    return liveProperties.filter((item) => !item.isDemo);
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
    <div className="min-h-screen bg-surface pb-28 md:pb-16 pt-24 md:pt-32">
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
            {loading ? (
              'Loading builder projects...'
            ) : (
              <>
                Showing <span className="text-gray-950 font-black">{filteredProjects.length}</span> premium builder projects
              </>
            )}
          </p>
        </div>

        {/* Builder Projects Grid / Skeleton */}
        {loading ? (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-96 rounded-[2rem] bg-gray-100 animate-pulse border border-gray-200/60" />
            ))}
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            {filteredProjects.map((plot) => (
              <div key={plot.id || plot._id || plot.title} className="flex flex-col h-full">
                <BuilderCard
                  plot={plot}
                  defaultWhatsapp={defaultWhatsapp}
                />
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredProjects.length === 0 && (
          <div className="mt-12 text-center py-16 bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
            <Building2 size={48} className="mx-auto text-gray-300" />
            <h3 className="mt-4 text-lg font-bold text-gray-900">No builder projects found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchQuery || selectedCity !== 'All'
                ? 'Try adjusting your search query or city filter.'
                : 'Currently no active builder projects are listed. Check back soon!'}
            </p>
            {(searchQuery || selectedCity !== 'All') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCity('All');
                }}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white shadow-sm shadow-primary/20 hover:bg-rose-700 cursor-pointer"
              >
                Reset Filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
