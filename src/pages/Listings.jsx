import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowUpDown, Camera, CheckCircle2, Filter, Heart, MapPin, RotateCcw, Search, Sparkles, TrendingUp, Scale } from 'lucide-react';
import { motion } from 'framer-motion';
import DropdownSelect from '../components/DropdownSelect';
import { propertyListings } from '../data/properties';
import { advancedPropertySearch } from '../utils/propertySearch';
import { apiRequest, buildQuery } from '../lib/api';
import { adaptProperties, propertyTypeToApiValue } from '../utils/propertyAdapter';
import { useAuth } from '../context/auth';
import { isAdminSearchQuery, openAdminEntry } from '../utils/adminAccess';
import SEO from '../components/SEO';
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

const Listings = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [remoteProperties, setRemoteProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [stats, setStats] = useState({ totalProperties: 0, totalBrokers: 0 });
  const [statsLoaded, setStatsLoaded] = useState(false);
  const { user } = useAuth();
  const { compareList, toggleCompare } = useCompare();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';
  const sortBy = searchParams.get('sort') || 'recommended';

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

    if (sortBy === 'price-low') {
      return list.sort((a, b) => a.priceValue - b.priceValue);
    }

    if (sortBy === 'price-high') {
      return list.sort((a, b) => b.priceValue - a.priceValue);
    }

    return list;
  }, [query, sortBy, urlFilters, visibleListingsSource]);

  const suggestedProperties = useMemo(() => {
    const featured = visibleListingsSource.filter((p) => p.featured);
    return (featured.length ? featured : visibleListingsSource).slice(0, 3);
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
    const loadProperties = async () => {
      setLoading(true);
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
        setRemoteProperties(adaptProperties(data.properties));
        setUsingFallback(false);
      } catch {
        setRemoteProperties([]);
        setUsingFallback(true);
      } finally {
        setLoading(false);
      }
    };

    loadProperties();
  }, [query, urlFilters]);

  useEffect(() => {
    apiRequest('/site/stats')
      .then((data) => {
        if (data && typeof data.totalProperties === 'number') {
          setStats({
            totalProperties: data.totalProperties,
            totalBrokers: data.totalBrokers
          });
        }
      })
      .catch(() => {})
      .finally(() => setStatsLoaded(true));
  }, []);

  const applySearchToUrl = () => {
    if (isAdminSearchQuery(query)) {
      openAdminEntry(navigate);
      return;
    }

    const nextParams = new URLSearchParams(searchParams);

    if (query.trim()) nextParams.set('q', query.trim());
    else nextParams.delete('q');
    if (sortBy !== 'recommended') nextParams.set('sort', sortBy);
    else nextParams.delete('sort');

    setSearchParams(nextParams);
  };

  const handleSortChange = (value) => {
    const nextParams = new URLSearchParams(searchParams);

    if (value === 'recommended') nextParams.delete('sort');
    else nextParams.set('sort', value);

    if (query.trim()) nextParams.set('q', query.trim());
    setSearchParams(nextParams);
  };

  const handleQueryChange = (value) => {
    const nextParams = new URLSearchParams(searchParams);
    if (value) nextParams.set('q', value);
    else nextParams.delete('q');
    setSearchParams(nextParams, { replace: true });
  };

  const handleFilterChange = (key, value) => {
    const nextParams = new URLSearchParams(searchParams);

    if (value) nextParams.set(key, value);
    else nextParams.delete(key);

    setSearchParams(nextParams);
  };

  const resetFilters = () => {
    const nextParams = new URLSearchParams(searchParams);
    listingFilterKeys.forEach((key) => nextParams.delete(key));
    setSearchParams(nextParams);
  };

  const handleCardClick = (e, propertyId) => {
    if (e.target.closest('button') || e.target.closest('a')) {
      return;
    }
    navigate(`/property/${propertyId}`);
  };

  const toggleFavourite = async (propertyId) => {
    if (!user) {
      navigate('/login', { state: { from: '/listings' } });
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
    <div className="min-h-screen bg-surface pb-12 pt-28">
      <SEO 
        title="Investment Plots & Lands"
        description="Browse RERA-ready layouts, broker-verified parcels, and high-growth land opportunities across top cities."
      />
      <div className="container mx-auto max-w-[1440px] px-6 lg:px-12">
        <section className="mb-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary">
                <Sparkles size={14} />
                Verified plot marketplace
              </div>
              <h1 className="text-3xl font-extrabold text-text sm:text-4xl">Premium plots matched to your investment goals</h1>
              <p className="mt-3 max-w-xl text-sm font-medium leading-6 text-muted">
                Browse RERA-ready layouts, broker-verified parcels, and high-growth land opportunities.
              </p>
            </div>

            <div className="grid grid-cols-2 overflow-hidden rounded-2xl border border-white/80 bg-white/70 shadow-lg shadow-gray-200/70 backdrop-blur-xl sm:min-w-[320px]">
              {[
                [String(sortedListings.length), 'Matches'],
                [stats.totalBrokers > 0 ? `${stats.totalBrokers}+` : '850+', 'Brokers']
              ].map(([value, label]) => (
                <div key={label} className="border-r border-border px-4 py-4 last:border-r-0">
                  <p className="text-xl font-extrabold text-text">{value}</p>
                  <p className="mt-0.5 text-xs font-semibold text-muted">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="relative z-30 mb-8 rounded-[1.75rem] border border-white/70 bg-white/60 p-3 shadow-2xl shadow-gray-200/70 backdrop-blur-2xl">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <label className="flex min-h-12 flex-1 items-center gap-3 rounded-2xl border border-white/60 bg-white/70 px-4 shadow-inner backdrop-blur-xl">
              <Search size={18} className="text-muted" />
              <input
                type="text"
                value={query}
                onChange={(event) => handleQueryChange(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') applySearchToUrl();
                }}
                placeholder="Search locality, project, or broker"
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

        <main className="relative z-0">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold text-text">
                Showing {sortedListings.length} of {visibleListingsSource.length} properties
              </p>
              <p className="text-xs font-medium text-muted">
                {loading || !statsLoaded ? 'Loading live listings...' : usingFallback ? 'Unable to load live listings right now' : dbHasProperties ? 'Showing live approved listings' : canShowDemoListings ? 'Showing demo listings because database is empty' : 'No live listings yet'}
              </p>
            </div>
            <p className="text-sm font-bold text-primary">
              Sort: {sortOptions.find((option) => option.value === sortBy)?.label}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {sortedListings.map((listing, index) => (
                <motion.article
                  key={listing.id}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.06 }}
                  onClick={(e) => handleCardClick(e, listing.id)}
                  className="group relative overflow-hidden rounded-[2rem] bg-white border border-border shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2 cursor-pointer flex flex-col"
                >
                  {/* Image Container */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden">
                    <img src={listing.image} alt={listing.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    
                    {/* Gradient Overlay for Text Readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none"></div>

                    {/* Top Badges */}
                    <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                      {listing.isDemo && (
                        <span className="bg-amber-50 text-amber-700 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded shadow-sm">
                          This is a demo property
                        </span>
                      )}
                      {listing.featured && (
                        <span className="bg-primary text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded shadow-sm">
                          Featured
                        </span>
                      )}
                      {listing.approved ? (
                        <span className="bg-white text-text text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded shadow-sm flex items-center gap-1">
                          <CheckCircle2 size={12} className="text-green-500" /> RERA Approved
                        </span>
                      ) : null}
                    </div>

                    {/* Action Buttons */}
                    <div className="absolute right-4 top-4 flex flex-col gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleFavourite(String(listing.id)); }}
                        className={`w-9 h-9 rounded-full flex items-center justify-center backdrop-blur shadow-sm transition-colors ${user && favoriteIds.has(String(listing.id)) ? 'bg-primary text-white border-none' : 'bg-white/90 text-gray-600 hover:text-primary hover:bg-white'}`}
                        title="Favourite"
                      >
                        <Heart size={16} fill={user && favoriteIds.has(String(listing.id)) ? 'currentColor' : 'none'} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleCompare(listing); }}
                        className={`w-9 h-9 rounded-full flex items-center justify-center backdrop-blur shadow-sm transition-colors ${compareList.some(p => String(p.id) === String(listing.id)) ? 'bg-primary text-white border-none' : 'bg-white/90 text-gray-600 hover:text-primary hover:bg-white'}`}
                        title="Add to Compare"
                      >
                        <Scale size={16} />
                      </button>
                    </div>

                    {/* Bottom Badge - Photo Count */}
                    <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-white flex items-center gap-1.5 text-xs font-semibold shadow-sm">
                      <Camera size={12} /> {listing.photoCount ?? 12}
                    </div>

                    {/* Property Type Floating Badge */}
                    <div className="absolute bottom-4 left-4">
                      <span className="bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-text shadow-sm">
                        {listing.type}
                      </span>
                    </div>
                  </div>

                  {/* Details Section */}
                  <div className="flex flex-col flex-1 p-6">
                    {listing.isDemo && (
                      <p className="mb-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-extrabold uppercase tracking-wide text-amber-700">
                        This is a demo property
                      </p>
                    )}
                    <h3 className="line-clamp-2 text-xl font-extrabold leading-snug text-text mb-2 group-hover:text-primary transition-colors">{listing.title}</h3>
                    
                    <p className="flex items-center gap-1.5 text-sm font-semibold text-muted mb-5">
                      <MapPin size={16} className="text-gray-400" />
                      {listing.location}
                    </p>

                    <div className="grid grid-cols-3 gap-3 mb-6">
                      <div className="bg-surface rounded-xl">
                        <div className="px-3 py-3">
                          <p className="text-[11px] font-bold uppercase tracking-wide text-muted">Price</p>
                          <p className="mt-1 text-sm font-extrabold text-text">{listing.price}</p>
                        </div>
                      </div>
                      <div className="bg-surface rounded-xl p-3 text-center border border-border/50">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted mb-1">Size</p>
                        <p className="text-sm font-extrabold text-text">{listing.size}</p>
                      </div>
                      <div className="bg-surface rounded-xl p-3 text-center border border-border/50">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted mb-1">ROI</p>
                        <p className="text-sm font-extrabold text-green-600 flex items-center justify-center gap-1">
                          <TrendingUp size={12} /> {listing.roi}
                        </p>
                      </div>
                    </div>

                    <div className="mt-auto pt-4 border-t border-border flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-text">{listing.rate}</p>
                        <p className="text-[10px] font-semibold text-secondary uppercase tracking-wider mt-0.5 flex items-center gap-1">
                          <Sparkles size={10} /> Broker verified
                        </p>
                      </div>
                      <span className="inline-flex items-center justify-center bg-text text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all group-hover:bg-primary shadow-sm hover:shadow-primary/30">
                        View Plot
                      </span>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>

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
                        to={`/property/${suggestion.id}`}
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
