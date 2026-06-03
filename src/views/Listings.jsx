"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

import { ArrowUpDown, Camera, CheckCircle2, Filter, Heart, MapPin, RotateCcw, Search, Sparkles, TrendingUp, Scale } from 'lucide-react';
import { motion } from 'framer-motion';
import DropdownSelect from '../components/DropdownSelect';
import { propertyListings } from '../data/properties';
import { advancedPropertySearch } from '../utils/propertySearch';
import { apiRequest, buildQuery } from '../lib/api';
import { adaptProperties, propertyTypeToApiValue } from '../utils/propertyAdapter';
import { useAuth } from '../context/auth';
import { isAdminSearchQuery, openAdminEntry } from '../utils/adminAccess';

import { useCompare } from '../context/CompareContext';

const sortOptions = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' }
];

const typeFilterOptions = [
  { value: '', label: 'All types' },
  { value: 'Residential', label: 'Residential' },
  { value: 'Commercial', label: 'Commercial' },
  { value: 'Farm Land', label: 'Farm Land' }
];

const isMongoId = (val) => /^[0-9a-fA-F]{24}$/.test(String(val));

const listingFilterKeys = ['city', 'type', 'approvedOnly', 'minPrice', 'maxPrice', 'minSize', 'maxSize'];
const LISTINGS_PAGE_SIZE = 10;

const Listings = () => {
  const searchParams = useSearchParams();
  const [remoteProperties, setRemoteProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [stats, setStats] = useState({ totalProperties: 0, totalBrokers: 0 });
  const [statsLoaded, setStatsLoaded] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const { user } = useAuth();
  const { compareList, toggleCompare } = useCompare();
  const navigate = useRouter();
  const query = searchParams.get('q') || '';
  const [searchInput, setSearchInput] = useState('');
  const sortBy = searchParams.get('sort') || 'recommended';
  const requestedPage = Number(searchParams.get('page') || 1);
  const currentPage = Number.isFinite(requestedPage) && requestedPage > 0 ? Math.floor(requestedPage) : 1;

  const urlFilters = useMemo(() => {
    const filters = {};
    listingFilterKeys.forEach((key) => {
      const value = searchParams.get(key);
      if (value) {
        filters[key] = value;
      }
    });
    return filters;
  }, [searchParams]);

  useEffect(() => {
    if (!user) return undefined;

    let cancelled = false;

    apiRequest('/favourites')
      .then((data) => {
        if (!cancelled) {
          setFavoriteIds(new Set(data.favourites.map((item) => String(item.property._id || item.property.id))));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setFavoriteIds(new Set());
        }
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  const dbHasProperties = stats.totalProperties > 0 || remoteProperties.length > 0;
  const canShowDemoListings = statsLoaded && !loading && !usingFallback && stats.totalProperties === 0 && remoteProperties.length === 0;
  const visibleListingsSource = useMemo(() => {
    if (dbHasProperties) return remoteProperties;
    if (canShowDemoListings) return propertyListings;
    return [];
  }, [dbHasProperties, remoteProperties, canShowDemoListings]);

  const sortedListings = useMemo(() => {
    const source = advancedPropertySearch(visibleListingsSource, query, urlFilters);
    const list = [...source];
    const featuredFirst = (a, b) => (
      Number(Boolean(b.featured)) - Number(Boolean(a.featured))
      || Number(Boolean(b.approved)) - Number(Boolean(a.approved))
    );

    if (sortBy === 'price-low') {
      return list.sort((a, b) => featuredFirst(a, b) || (a.priceValue || 0) - (b.priceValue || 0));
    }

    if (sortBy === 'price-high') {
      return list.sort((a, b) => featuredFirst(a, b) || (b.priceValue || 0) - (a.priceValue || 0));
    }

    return list.sort((a, b) => (
      featuredFirst(a, b)
      || (b.viewsCount || 0) - (a.viewsCount || 0)
      || (b.priceValue || 0) - (a.priceValue || 0)
    ));
  }, [query, sortBy, urlFilters, visibleListingsSource]);

  const pageCount = Math.max(1, Math.ceil(sortedListings.length / LISTINGS_PAGE_SIZE));
  const safePage = Math.min(currentPage, pageCount);
  const pageStart = (safePage - 1) * LISTINGS_PAGE_SIZE;
  const paginatedListings = sortedListings.slice(pageStart, pageStart + LISTINGS_PAGE_SIZE);
  const visibleStart = sortedListings.length > 0 ? pageStart + 1 : 0;
  const visibleEnd = pageStart + paginatedListings.length;
  const paginationItems = useMemo(() => {
    const pages = pageCount <= 7
      ? Array.from({ length: pageCount }, (_, index) => index + 1)
      : [...new Set([1, safePage - 1, safePage, safePage + 1, pageCount].filter((page) => page >= 1 && page <= pageCount))]
        .sort((a, b) => a - b);

    return pages.reduce((items, page, index) => {
      if (index > 0 && page - pages[index - 1] > 1) {
        items.push(`gap-${pages[index - 1]}-${page}`);
      }
      items.push(page);
      return items;
    }, []);
  }, [pageCount, safePage]);

  const suggestedProperties = useMemo(() => {
    const source = visibleListingsSource.length ? visibleListingsSource : propertyListings;
    const featured = source.filter((p) => p.featured);
    return (featured.length ? featured : source).slice(0, 5);
  }, [visibleListingsSource]);

  const cityFilterOptions = useMemo(() => {
    const source = dbHasProperties ? remoteProperties : canShowDemoListings ? propertyListings : [];
    const cityNames = [...new Set(source.map((property) => property.city).filter(Boolean))].sort((a, b) => a.localeCompare(b));
    return [{ value: '', label: 'All cities' }, ...cityNames.map((city) => ({ value: city, label: city }))];
  }, [remoteProperties, dbHasProperties, canShowDemoListings]);

  const activeFilterBadges = useMemo(() => ([
    urlFilters.city && `City: ${urlFilters.city}`,
    urlFilters.type && `Type: ${urlFilters.type}`,
    urlFilters.minPrice && `Min Rs ${Number(urlFilters.minPrice).toLocaleString('en-IN')}`,
    urlFilters.maxPrice && `Max Rs ${Number(urlFilters.maxPrice).toLocaleString('en-IN')}`,
    urlFilters.approvedOnly === 'true' && 'Approved only'
  ].filter(Boolean)), [urlFilters]);

  useEffect(() => {
    let isMounted = true;
    
    // Only set loading true on initial mount or filter change, not on background polls
    setLoading(true);

    const loadProperties = async () => {
      try {
        const data = await apiRequest(`/properties${buildQuery({
          limit: 500,
          city: urlFilters.city,
          propertyType: urlFilters.type ? propertyTypeToApiValue(urlFilters.type) : undefined,
          approvedOnly: urlFilters.approvedOnly,
          minPrice: urlFilters.minPrice,
          maxPrice: urlFilters.maxPrice,
          minSize: urlFilters.minSize,
          maxSize: urlFilters.maxSize
        })}`);
        
        if (isMounted) {
          setRemoteProperties(adaptProperties(data.properties));
          setUsingFallback(false);
        }
      } catch {
        if (isMounted) {
          setRemoteProperties([]);
          setUsingFallback(true);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadProperties();
    const interval = setInterval(loadProperties, 30000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [urlFilters]); // 'query' is handled client-side in useMemo sortedListings, API query takes urlFilters

  useEffect(() => {
    let isMounted = true;
    const loadStats = () => {
      apiRequest('/site/stats')
        .then((data) => {
          if (isMounted && data && typeof data.totalProperties === 'number') {
            setStats({
              totalProperties: data.totalProperties,
              totalBrokers: data.totalBrokers
            });
          }
        })
        .catch(() => {})
        .finally(() => isMounted && setStatsLoaded(true));
    };

    loadStats();
    const interval = setInterval(loadStats, 30000);
    
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const applySearchToUrl = () => {
    const nextQuery = searchInput.trim();

    if (isAdminSearchQuery(nextQuery)) {
      openAdminEntry(navigate);
      setSearchInput('');
      return;
    }

    const nextParams = new URLSearchParams(searchParams);

    if (nextQuery) nextParams.set('q', nextQuery);
    else nextParams.delete('q');
    if (sortBy !== 'recommended') nextParams.set('sort', sortBy);
    else nextParams.delete('sort');
    nextParams.delete('page');

    navigate.push(`?${nextParams.toString()}`);
    setSearchInput('');
  };

  const handleSortChange = (value) => {
    const nextParams = new URLSearchParams(searchParams);

    if (value === 'recommended') nextParams.delete('sort');
    else nextParams.set('sort', value);

    if (query.trim()) nextParams.set('q', query.trim());
    nextParams.delete('page');
    navigate.push(`?${nextParams.toString()}`);
  };

  const handleFilterChange = (key, value) => {
    const nextParams = new URLSearchParams(searchParams);

    if (value) nextParams.set(key, value);
    else nextParams.delete(key);
    nextParams.delete('page');

    navigate.push(`?${nextParams.toString()}`);
  };

  const resetFilters = () => {
    const nextParams = new URLSearchParams(searchParams);
    listingFilterKeys.forEach((key) => nextParams.delete(key));
    nextParams.delete('page');
    navigate.push(`?${nextParams.toString()}`);
  };

  const handlePageChange = (page) => {
    const targetPage = Math.min(Math.max(page, 1), pageCount);
    const nextParams = new URLSearchParams(searchParams);

    if (targetPage <= 1) nextParams.delete('page');
    else nextParams.set('page', String(targetPage));

    navigate.push(`?${nextParams.toString()}`);
  };

  const handleCardClick = (e, propertyId) => {
    if (e.target.closest('button') || e.target.closest('a')) {
      return;
    }
    navigate.push(`/property/${propertyId}`);
  };

  const toggleFavourite = async (propertyId) => {
    if (!user) {
      navigate.push('/login?from=' + encodeURIComponent('/listings' ));
      return;
    }

    const idString = String(propertyId);
    if (!isMongoId(idString)) {
      setFavoriteIds((current) => {
        const next = new Set(current);
        if (next.has(idString)) {
          next.delete(idString);
        } else {
          next.add(idString);
        }
        return next;
      });
      return;
    }

    try {
      if (favoriteIds.has(idString)) {
        await apiRequest(`/favourites/${idString}`, { method: 'DELETE' });
        setFavoriteIds((current) => {
          const next = new Set(current);
          next.delete(idString);
          return next;
        });
      } else {
        await apiRequest(`/favourites/${idString}`, { method: 'POST' });
        setFavoriteIds((current) => {
          const next = new Set(current);
          next.add(idString);
          return next;
        });
      }
    } catch {
      // Keep UI stable if the request fails.
    }
  };

  return (
    <div className="min-h-screen bg-surface pb-12 pt-0 md:pt-28">
      
      <div className="container mx-auto max-w-[1440px] px-6 lg:px-12">
        <div className="sticky top-0 z-40 -mx-6 mb-5 border-b border-border/70 bg-white/95 px-4 py-3 shadow-sm backdrop-blur-xl md:hidden">
          <div className="flex items-center gap-2">
            <label className="flex h-11 min-w-0 flex-1 items-center gap-2 rounded-xl border border-border bg-surface px-3">
              <Search size={17} className="flex-shrink-0 text-primary" />
              <input
                type="text"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') applySearchToUrl();
                }}
                placeholder="Search Plots In Gurugram"
                className="min-w-0 flex-1 bg-transparent text-sm font-bold text-text outline-none placeholder:text-muted"
              />
            </label>
            <button
              type="button"
              onClick={() => setFiltersOpen((current) => !current)}
              className="flex h-11 items-center gap-1.5 rounded-xl bg-primary px-3 text-xs font-extrabold text-white shadow-sm"
              aria-expanded={filtersOpen}
            >
              <Filter size={15} />
              Filters
            </button>
          </div>

          {filtersOpen && (
            <div className="mt-3 grid gap-2 rounded-2xl border border-border bg-white p-3 shadow-lg">
              <div className="grid grid-cols-2 gap-2">
                <DropdownSelect
                  value={urlFilters.city || ''}
                  onChange={(value) => handleFilterChange('city', value)}
                  options={cityFilterOptions}
                  icon={MapPin}
                />
                <DropdownSelect
                  value={urlFilters.type || ''}
                  onChange={(value) => handleFilterChange('type', value)}
                  options={typeFilterOptions}
                  icon={Filter}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  value={urlFilters.minPrice || ''}
                  onChange={(event) => handleFilterChange('minPrice', event.target.value)}
                  className="min-h-11 rounded-xl border border-border bg-surface px-3 text-xs font-bold text-text outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Min price"
                />
                <input
                  type="number"
                  value={urlFilters.maxPrice || ''}
                  onChange={(event) => handleFilterChange('maxPrice', event.target.value)}
                  className="min-h-11 rounded-xl border border-border bg-surface px-3 text-xs font-bold text-text outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Max price"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <label className={`flex min-h-11 items-center justify-center gap-2 rounded-xl border px-3 text-xs font-extrabold ${urlFilters.approvedOnly ? 'border-green-200 bg-green-50 text-green-700' : 'border-border bg-surface text-muted'}`}>
                  <input
                    type="checkbox"
                    checked={urlFilters.approvedOnly === 'true'}
                    onChange={(event) => handleFilterChange('approvedOnly', event.target.checked ? 'true' : '')}
                    className="h-4 w-4 accent-green-600"
                  />
                  Approved
                </label>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border bg-white px-3 text-xs font-extrabold text-text"
                >
                  <RotateCcw size={14} />
                  Reset
                </button>
              </div>
            </div>
          )}
        </div>

        <section className="mb-6 md:mb-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary">
                <Sparkles size={14} />
                Verified plot marketplace
              </div>
              <h1 className="text-3xl font-extrabold text-text sm:text-4xl">Premium plots matched to your investment goals</h1>
              <p className="mt-3 max-w-xl text-sm font-medium leading-6 text-muted">
                Browse RERA-ready layouts, associate partner-verified parcels, and high-growth land opportunities.
              </p>
            </div>

            <div className="grid grid-cols-2 overflow-hidden rounded-2xl border border-white/80 bg-white/70 shadow-lg shadow-gray-200/70 backdrop-blur-xl sm:min-w-[320px]">
              {[
                [String(sortedListings.length), 'Matches'],
                [stats.totalBrokers > 0 ? `${stats.totalBrokers}+` : '850+', 'Associate Partners']
              ].map(([value, label]) => (
                <div key={label} className="border-r border-border px-4 py-4 last:border-r-0">
                  <p className="text-xl font-extrabold text-text">{value}</p>
                  <p className="mt-0.5 text-xs font-semibold text-muted">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="relative z-30 mb-8 hidden rounded-[1.75rem] border border-white/70 bg-white/60 p-3 shadow-2xl shadow-gray-200/70 backdrop-blur-2xl md:block">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <label className="flex min-h-12 flex-1 items-center gap-3 rounded-2xl border border-white/60 bg-white/70 px-4 shadow-inner backdrop-blur-xl">
              <Search size={18} className="text-muted" />
              <input
                type="text"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') applySearchToUrl();
                }}
                placeholder="Search Locality, Project, Or Associate Partner"
                className="w-full bg-transparent text-sm font-semibold text-text outline-none placeholder:text-muted"
              />
            </label>

            <DropdownSelect
              value={sortBy}
              onChange={handleSortChange}
              options={sortOptions}
              icon={ArrowUpDown}
              className="lg:w-[260px]"
            />

            <button
              onClick={applySearchToUrl}
              className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-primary px-6 text-sm font-extrabold text-white shadow-lg shadow-primary/20 transition-colors hover:bg-rose-600"
            >
              <Search size={17} />
              Search
            </button>
          </div>

          <div className="mt-3 grid gap-3 rounded-2xl border border-white/70 bg-white/70 p-3 lg:grid-cols-[1fr_1fr_0.8fr_0.8fr_auto_auto] lg:items-center">
            <DropdownSelect
              value={urlFilters.city || ''}
              onChange={(value) => handleFilterChange('city', value)}
              options={cityFilterOptions}
              icon={MapPin}
            />
            <DropdownSelect
              value={urlFilters.type || ''}
              onChange={(value) => handleFilterChange('type', value)}
              options={typeFilterOptions}
              icon={Filter}
            />
            <input
              type="number"
              value={urlFilters.minPrice || ''}
              onChange={(event) => handleFilterChange('minPrice', event.target.value)}
              className="min-h-12 rounded-xl border border-black/10 bg-white/80 px-4 py-3 text-sm font-bold text-text outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="Min price"
            />
            <input
              type="number"
              value={urlFilters.maxPrice || ''}
              onChange={(event) => handleFilterChange('maxPrice', event.target.value)}
              className="min-h-12 rounded-xl border border-black/10 bg-white/80 px-4 py-3 text-sm font-bold text-text outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="Max price"
            />
            <label className={`flex min-h-12 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-extrabold transition-colors ${urlFilters.approvedOnly ? 'border-green-200 bg-green-50 text-green-700' : 'border-black/10 bg-white/80 text-muted'}`}>
              <input
                type="checkbox"
                checked={urlFilters.approvedOnly === 'true'}
                onChange={(event) => handleFilterChange('approvedOnly', event.target.checked ? 'true' : '')}
                className="h-4 w-4 accent-green-600"
              />
              Approved
            </label>
            <button
              type="button"
              onClick={resetFilters}
              className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-black/10 bg-white px-4 text-sm font-extrabold text-text transition-colors hover:bg-surface"
            >
              <RotateCcw size={16} />
              Reset
            </button>
          </div>

          {activeFilterBadges.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2 px-1">
              {activeFilterBadges.map((badge) => (
                <span key={badge} className="rounded-full border border-primary/15 bg-primary/10 px-3 py-1 text-xs font-extrabold text-primary">
                  {badge}
                </span>
              ))}
            </div>
          )}
        </div>

        {suggestedProperties.length > 0 && (
          <section className="mb-6 md:hidden">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-text">Suggestions</h2>
              <span className="text-xs font-bold text-primary">Swipe</span>
            </div>
            <div className="-mx-2 flex snap-x snap-mandatory gap-3 overflow-x-auto px-6 pb-2 no-scrollbar">
              {suggestedProperties.map((suggestion) => (
                <Link
                  key={suggestion.id}
                  href={`/property/${suggestion.id}`}
                  className="w-[220px] min-w-[220px] snap-start overflow-hidden rounded-2xl border border-border bg-white shadow-sm"
                >
                  <div className="relative h-28 overflow-hidden">
                    <img src={suggestion.image || suggestion.img} alt={suggestion.title} className="h-full w-full object-cover" />
                    <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black/65 to-transparent"></div>
                    <p className="absolute bottom-2 left-3 right-3 truncate text-xs font-extrabold text-white">{suggestion.title}</p>
                  </div>
                  <div className="p-3">
                    <p className="truncate text-sm font-extrabold text-text">{suggestion.price}</p>
                    <p className="mt-1 truncate text-xs font-semibold text-muted">{suggestion.location || suggestion.loc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        <main className="relative z-0">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold text-text">
                Showing {sortedListings.length === 0 ? '0' : `${visibleStart}-${visibleEnd}`} of {sortedListings.length} properties
              </p>
              <p className="text-xs font-medium text-muted">
                {loading || !statsLoaded ? 'Loading live listings...' : usingFallback ? 'Unable to load live listings right now' : dbHasProperties ? 'Showing live approved listings' : canShowDemoListings ? 'Showing demo listings because database is empty' : 'No live listings yet'}
              </p>
            </div>
            <p className="text-sm font-bold text-primary">
              Sort: {sortOptions.find((option) => option.value === sortBy)?.label}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-2 md:gap-8 xl:grid-cols-3">
              {paginatedListings.map((listing, index) => (
                <motion.article
                  key={listing.id}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.06 }}
                  onClick={(e) => handleCardClick(e, listing.id)}
                  whileTap={{ rotate: index % 2 === 0 ? 1.5 : -1.5, scale: 0.985 }}
                  className="group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-xl md:rounded-[2rem]"
                >
                  {/* Image Container */}
                  <div className="relative aspect-square w-full overflow-hidden md:aspect-[4/3]">
                    <img src={listing.image} alt={listing.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    
                    {/* Gradient Overlay for Text Readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none"></div>

                    {/* Top Badges */}
                    <div className="absolute left-2 top-2 flex flex-wrap gap-1.5 md:left-4 md:top-4 md:gap-2">
                      {listing.isDemo && (
                        <span className="hidden rounded bg-amber-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-700 shadow-sm md:inline-flex">
                          This is a demo property
                        </span>
                      )}
                      {listing.featured && (
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white shadow-sm md:h-auto md:w-auto md:rounded md:px-2.5 md:py-1 md:text-[10px] md:font-bold md:uppercase md:tracking-wider">
                          <Sparkles size={13} className="md:hidden" />
                          <span className="hidden md:inline">Featured</span>
                        </span>
                      )}
                      {listing.approved ? (
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-green-600 shadow-sm md:h-auto md:w-auto md:gap-1 md:rounded md:px-2 md:py-1 md:text-[10px] md:font-bold md:uppercase md:tracking-wider md:text-text">
                          <CheckCircle2 size={12} className="text-green-500" /> <span className="hidden md:inline">RERA Approved</span>
                        </span>
                      ) : null}
                    </div>

                    {/* Action Buttons */}
                    <div className="absolute right-2 top-2 hidden flex-col gap-1.5 md:right-4 md:top-4 md:flex md:gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleFavourite(String(listing.id)); }}
                        className={`flex h-8 w-8 items-center justify-center rounded-full shadow-sm backdrop-blur transition-colors md:h-9 md:w-9 ${user && favoriteIds.has(String(listing.id)) ? 'bg-primary text-white border-none' : 'bg-white/90 text-gray-600 hover:text-primary hover:bg-white'}`}
                        title="Favourite"
                      >
                        <Heart size={16} fill={user && favoriteIds.has(String(listing.id)) ? 'currentColor' : 'none'} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleCompare(listing); }}
                        className={`hidden rounded-full shadow-sm backdrop-blur transition-colors md:flex md:h-9 md:w-9 md:items-center md:justify-center ${compareList.some(p => String(p.id) === String(listing.id)) ? 'bg-primary text-white border-none' : 'bg-white/90 text-gray-600 hover:text-primary hover:bg-white'}`}
                        title="Add to Compare"
                      >
                        <Scale size={16} />
                      </button>
                    </div>

                    {/* Bottom Badge - Photo Count */}
                    <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-[10px] font-semibold text-white shadow-sm backdrop-blur-md md:bottom-4 md:right-4 md:gap-1.5 md:px-2.5 md:text-xs">
                      <Camera size={12} /> {listing.photoCount ?? 12}
                    </div>

                    {/* Property Type Floating Badge */}
                    <div className="absolute bottom-2 left-2 md:bottom-4 md:left-4">
                      <span className="rounded-full bg-white/95 px-2 py-1 text-[10px] font-bold text-text shadow-sm backdrop-blur-md md:px-3 md:text-xs">
                        {listing.type}
                      </span>
                    </div>
                  </div>

                  {/* Details Section */}
                  <div className="flex flex-1 flex-col p-3 md:p-6">
                    {listing.isDemo && (
                      <p className="mb-3 hidden rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-extrabold uppercase tracking-wide text-amber-700 md:block">
                        This is a demo property
                      </p>
                    )}
                    <h3 className="mb-1 line-clamp-2 text-[15px] font-extrabold leading-tight text-text transition-colors group-hover:text-primary md:mb-2 md:text-xl">{listing.title}</h3>
                    
                    <p className="mb-2 flex min-w-0 items-center gap-1 text-xs font-semibold text-muted md:mb-5 md:gap-1.5 md:text-sm">
                      <MapPin size={14} className="flex-shrink-0 text-gray-400 md:size-4" />
                      <span className="min-w-0 truncate">{listing.location}</span>
                    </p>

                    <div className="mb-3 grid grid-cols-1 gap-1.5 md:mb-6 md:grid-cols-3 md:gap-3">
                      <div className="rounded-xl bg-surface md:border md:border-border/50">
                        <div className="px-2 py-2 md:px-3 md:py-3">
                          <p className="hidden text-[11px] font-bold uppercase tracking-wide text-muted md:block">Price</p>
                          <p className="truncate text-[15px] font-black text-text md:mt-1 md:text-sm">{listing.price}</p>
                        </div>
                      </div>
                      <p className="flex items-center gap-1 text-[11px] font-semibold text-muted md:hidden">
                        <span className="h-1 w-1 rounded-full bg-primary"></span>
                        {listing.size}
                      </p>
                      <div className="hidden rounded-xl border border-border/50 bg-surface p-3 text-center md:block">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted mb-1">Size</p>
                        <p className="text-sm font-extrabold text-text">{listing.size}</p>
                      </div>
                      <div className="hidden rounded-xl border border-border/50 bg-surface p-3 text-center md:block">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted mb-1">ROI</p>
                        <p className="text-sm font-extrabold text-green-600 flex items-center justify-center gap-1">
                          <TrendingUp size={12} /> {listing.roi}
                        </p>
                      </div>
                    </div>

                    <div className="mt-auto flex items-center justify-between border-t border-border pt-3 md:pt-4">
                      <div>
                        <p className="hidden text-xs font-bold text-text md:block">{listing.rate}</p>
                        <p className="mt-0.5 flex items-center gap-1 text-[9px] font-semibold uppercase tracking-wider text-secondary md:text-[10px]">
                          <Sparkles size={10} /> Associate Partner verified
                        </p>
                      </div>
                      <span className="inline-flex items-center justify-center rounded-lg bg-text px-3 py-2 text-xs font-bold text-white shadow-sm transition-all hover:shadow-primary/30 group-hover:bg-primary md:rounded-xl md:px-5 md:py-2.5 md:text-sm">
                        View
                      </span>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>

          {sortedListings.length > LISTINGS_PAGE_SIZE && (
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => handlePageChange(safePage - 1)}
                disabled={safePage === 1}
                className="min-h-10 rounded-xl border border-border bg-white px-4 text-sm font-extrabold text-text shadow-sm transition-colors hover:border-primary/40 disabled:cursor-not-allowed disabled:opacity-45"
              >
                Previous
              </button>
              {paginationItems.map((item) => (
                typeof item === 'number' ? (
                  <button
                    type="button"
                    key={item}
                    onClick={() => handlePageChange(item)}
                    className={`flex h-10 min-w-10 items-center justify-center rounded-xl border px-3 text-sm font-extrabold shadow-sm transition-colors ${
                      item === safePage
                        ? 'border-primary bg-primary text-white'
                        : 'border-border bg-white text-text hover:border-primary/40'
                    }`}
                    aria-current={item === safePage ? 'page' : undefined}
                  >
                    {item}
                  </button>
                ) : (
                  <span key={item} className="px-1 text-sm font-extrabold text-muted">...</span>
                )
              ))}
              <button
                type="button"
                onClick={() => handlePageChange(safePage + 1)}
                disabled={safePage === pageCount}
                className="min-h-10 rounded-xl border border-border bg-white px-4 text-sm font-extrabold text-text shadow-sm transition-colors hover:border-primary/40 disabled:cursor-not-allowed disabled:opacity-45"
              >
                Next
              </button>
            </div>
          )}

          {sortedListings.length === 0 && (
            <>
              <div className="rounded-2xl border border-dashed border-border bg-white p-10 text-center">
                <p className="text-lg font-extrabold text-text">No matching plots found</p>
                <p className="mt-2 text-sm font-medium text-muted">Try a broader search term like "approved Hyderabad plots".</p>
              </div>

              {suggestedProperties.length > 0 && (
                <div className="mt-14">
                  <div className="mb-6">
                    <h2 className="text-2xl font-extrabold text-text">Suggested Properties for You</h2>
                    <p className="mt-1 text-sm font-medium text-muted">Handpicked verified plots matching popular investment trends.</p>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {suggestedProperties.map((suggestion) => (
                      <Link
                        key={suggestion.id}
                        href={`/property/${suggestion.id}`}
                        className="group overflow-hidden rounded-2xl border border-border bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-card"
                      >
                        <div className="relative h-52 overflow-hidden">
                          <img
                            src={suggestion.image || suggestion.img}
                            alt={suggestion.title}
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                          {suggestion.featured && (
                            <span className="absolute left-3 top-3 rounded-full bg-primary px-3 py-1 text-xs font-extrabold text-white">
                              Featured
                            </span>
                          )}
                          {suggestion.isDemo && (
                            <span className="absolute left-3 top-12 rounded-full bg-amber-50 px-3 py-1 text-xs font-extrabold text-amber-700 shadow-sm">
                              This is a demo property
                            </span>
                          )}
                          <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-white flex items-center gap-1.5 text-xs font-medium">
                            <Camera size={12} /> {suggestion.photoCount ?? 1}
                          </div>
                        </div>
                        <div className="p-5">
                          {suggestion.isDemo && (
                            <p className="mb-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-extrabold uppercase tracking-wide text-amber-700">
                              This is a demo property
                            </p>
                          )}
                          <div className="mb-3 flex items-center gap-2">
                            <span className="rounded-full bg-surface px-3 py-1 text-xs font-bold text-text">{suggestion.type}</span>
                            <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700">
                              <CheckCircle2 size={13} />
                              Approved
                            </span>
                          </div>
                          <h3 className="line-clamp-2 text-lg font-extrabold text-text">{suggestion.title}</h3>
                          <p className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-muted">
                            <MapPin size={15} />
                            {suggestion.location || suggestion.loc}
                          </p>
                          <div className="mt-5 flex items-end justify-between gap-4">
                            <div>
                              <p className="text-xl font-extrabold text-text">{suggestion.price}</p>
                              <p className="text-xs font-semibold text-muted">{suggestion.size || suggestion.sqyd} - {suggestion.rate}</p>
                            </div>
                            <span className="text-sm font-bold text-secondary">Details</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default Listings;
