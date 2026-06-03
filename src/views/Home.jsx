"use client";

import { Search, MapPin, ChevronDown, CheckCircle2, ShieldCheck, Heart, Camera, Check, Star, Download, Paperclip, Scale, BookOpen, ArrowRight, Menu, TrendingUp, Sparkles, Share2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { DEFAULT_TOP_CITIES } from '../data/topCities';
import { apiRequest } from '../lib/api';
import { isAdminSearchQuery, openAdminEntry } from '../utils/adminAccess';
import { buildListingsSearchUrl } from '../utils/propertySearch';
import { adaptProperties } from '../utils/propertyAdapter';

import { propertyListings } from '../data/properties';
import { useCompare } from '../context/CompareContext';

const whatsappNumber = '918287697756';

const homeMoreLinks = [
  {
    href: `https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hi i want to talk about Legal assistance')}`,
    label: 'Legal Assistance',
    external: true,
    icon: Scale
  },
  {
    href: `https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hi i want to talk about Loan assistance')}`,
    label: 'Loan Assistance',
    external: true,
    icon: TrendingUp
  },
  { href: '/help-center', label: 'Help Center', icon: BookOpen },
  { href: '/privacy', label: 'Privacy Policy', icon: ShieldCheck },
  { href: '/terms', label: 'Terms & Conditions', icon: Paperclip },
  { href: '/refund-policy', label: 'Refund Policy', icon: CheckCircle2 }
];

const heroSearchTabs = [
  { label: 'Plots', type: 'Residential' },
  { label: 'Farm Land', type: 'Farm Land' },
  { label: 'Industrial Land', query: 'Industrial Land' },
  { label: 'Commercial Plots', type: 'Commercial' },
  { label: 'New Launch', query: 'New Projects' }
];

const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearchTab, setActiveSearchTab] = useState('Plots');
  const [propertyType, setPropertyType] = useState('Residential');
  const [selectedState, setSelectedState] = useState('All India');
  const [isStateMenuOpen, setIsStateMenuOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [showStickyMobileSearch, setShowStickyMobileSearch] = useState(false);
  const [activeFeaturedCategory, setActiveFeaturedCategory] = useState('Residential');
  const [topCities, setTopCities] = useState(DEFAULT_TOP_CITIES);
  const [stats, setStats] = useState({ totalProperties: 0, totalBrokers: 0 });
  const [statsLoaded, setStatsLoaded] = useState(false);
  const [realProperties, setRealProperties] = useState([]);
  const [loadingReal, setLoadingReal] = useState(true);
  const [latestBlogs, setLatestBlogs] = useState([]);
  const stateMenuRef = useRef(null);
  const moreMenuRef = useRef(null);
  const mobileHeroSearchRef = useRef(null);
  const navigate = useRouter();
  const { compareList, toggleCompare } = useCompare();

  const stateOptions = [
    'All India',
    'Andhra Pradesh',
    'Delhi',
    'Gujarat',
    'Haryana',
    'Karnataka',
    'Maharashtra',
    'Punjab',
    'Rajasthan',
    'Tamil Nadu',
    'Telangana',
    'Uttar Pradesh',
    'Uttarakhand',
    'West Bengal'
  ];

  const featuredCategories = [
    { name: 'Residential', icon: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z', filter: { type: 'Residential' } },
    { name: 'Commercial', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4', filter: { type: 'Commercial' } },
    { name: 'Farm Land', icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z', filter: { type: 'Farm Land' } },
    { name: 'RERA Approved', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', filter: { approvedOnly: true }, query: 'rera' },
    { name: 'Investment Hotspots', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6', query: 'investment' },
    { name: 'Premium', icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z', query: 'premium' }
  ];

  const hasLiveDatabase = stats.totalProperties > 0 || realProperties.length > 0;
  const canShowDemoProperties = statsLoaded && !loadingReal && stats.totalProperties === 0 && realProperties.length === 0;

  const displayProperties = hasLiveDatabase
    ? realProperties.filter((p) => p.featured)
    : canShowDemoProperties ? propertyListings.filter((p) => p.featured) : [];

  const filteredFeaturedPlots = displayProperties.filter((plot) => {
    const category = featuredCategories.find((item) => item.name === activeFeaturedCategory);
    if (!category) return true;

    const plotType = (plot.type || '').toLowerCase();
    const catType = (category.filter?.type || '').toLowerCase();

    if (catType) {
      if (catType === 'farm land') {
        return plotType === 'farmland' || plotType === 'farm land';
      }
      return plotType === catType;
    }

    if (category.filter?.approvedOnly) {
      return plot.approved === true;
    }

    if (category.query) {
      const query = category.query.toLowerCase();
      return (plot.title || '').toLowerCase().includes(query)
        || (plot.tags || []).some((tag) => (tag || '').toLowerCase().includes(query));
    }

    return true;
  });
  const visibleFeaturedPlots = filteredFeaturedPlots.slice(0, 5);

  const displayTrending = hasLiveDatabase
    ? [...realProperties].sort((a, b) => (b.viewsCount || 0) - (a.viewsCount || 0)).slice(0, 5)
    : canShowDemoProperties ? propertyListings.slice(0, 5) : [];
  const featuredSubtitle = loadingReal
    ? 'Loading live featured plots from verified associate partners.'
    : hasLiveDatabase
      ? "Hand-picked verified listings across India's growth corridors"
      : canShowDemoProperties
        ? 'Demo listings are visible because the live database is empty.'
        : 'Live listings will appear here after associate partners post properties.';

  const handleSeeAllClick = () => {
    const category = featuredCategories.find((item) => item.name === activeFeaturedCategory) || {};
    const query = category.query || '';
    const filters = category.filter || {};
    navigate.push(buildListingsSearchUrl(query, filters));
  };

  const submitSearch = (query = searchQuery) => {
    if (isAdminSearchQuery(query)) {
      openAdminEntry(navigate);
      return;
    }

    const filters = {};
    const terms = [query];
    const activeTab = heroSearchTabs.find((tab) => tab.label === activeSearchTab);

    if (activeTab?.type) {
      filters.type = activeTab.type;
    } else if (propertyType !== 'All') {
      filters.type = propertyType;
    }

    if (activeTab?.query) {
      terms.push(activeTab.query);
    }

    if (selectedState !== 'All India') {
      terms.push(selectedState);
    }

    navigate.push(buildListingsSearchUrl(terms.filter(Boolean).join(' '), filters));
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (stateMenuRef.current && !stateMenuRef.current.contains(event.target)) {
        setIsStateMenuOpen(false);
      }

      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target)) {
        setIsMoreMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const searchNode = mobileHeroSearchRef.current;
    if (!searchNode) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => setShowStickyMobileSearch(!entry.isIntersecting && entry.boundingClientRect.top < 0),
      { threshold: 0 }
    );

    observer.observe(searchNode);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isMoreMenuOpen) return undefined;

    const closeOnScroll = () => setIsMoreMenuOpen(false);
    window.addEventListener('scroll', closeOnScroll, { passive: true });
    window.addEventListener('touchmove', closeOnScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', closeOnScroll);
      window.removeEventListener('touchmove', closeOnScroll);
    };
  }, [isMoreMenuOpen]);

  useEffect(() => {
    let isMounted = true;

    const fetchAllData = () => {
      apiRequest('/site/top-cities')
        .then((data) => {
          if (isMounted && Array.isArray(data.topCities)) {
            setTopCities(data.topCities);
          }
        })
        .catch(() => {});

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

      apiRequest('/properties?limit=100')
        .then((data) => {
          if (isMounted && data && Array.isArray(data.properties)) {
            setRealProperties(adaptProperties(data.properties));
          }
        })
        .catch(() => {})
        .finally(() => isMounted && setLoadingReal(false));

      apiRequest('/blogs?limit=6')
        .then((data) => {
          if (isMounted && Array.isArray(data.blogs)) {
            setLatestBlogs(data.blogs);
          }
        })
        .catch(() => {});
    };

    fetchAllData();
    // Poll every 30 seconds for seamless real-time updates
    const interval = setInterval(fetchAllData, 30000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const renderHomePropertyCard = (plot, index) => {
    const imageUrl = plot.image || plot.img;
    const locationText = plot.location || plot.loc;
    const sizeText = plot.size || plot.sqyd || 'Size on request';
    const priceText = plot.price || 'Price on request';
    const rateText = plot.rate || 'Rate on request';
    const roiText = plot.roi || '12%';
    const photoCount = plot.photoCount ?? 12;
    const linkId = plot.id || plot._id;
    const isCompared = compareList.some((item) => String(item.id || item._id) === String(linkId));

    return (
      <Link
        href={`/property/${linkId}`}
        key={linkId || plot.title}
        className={`group flex w-[236px] min-w-[236px] flex-shrink-0 snap-start cursor-pointer flex-col rounded-2xl border border-border bg-white p-2 shadow-sm transition-all active:scale-[0.99] sm:w-[260px] sm:min-w-[260px] md:w-auto md:min-w-0 md:overflow-hidden md:rounded-[2rem] md:p-0 md:hover:-translate-y-2 md:hover:shadow-xl${index >= 3 ? ' md:hidden' : ''}`}
      >
        <div className="relative mb-3 aspect-[4/3] overflow-hidden rounded-[1.15rem] shadow-sm transition-all group-hover:shadow-md md:mb-0 md:rounded-none">
          <img src={imageUrl} alt={plot.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />

          <div className="pointer-events-none absolute inset-0 hidden bg-gradient-to-t from-black/60 via-transparent to-black/20 md:block"></div>

          <div className="absolute left-4 top-4 hidden flex-wrap gap-2 md:flex">
            {plot.isDemo && (
              <span className="rounded bg-amber-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-700 shadow-sm">
                Demo property
              </span>
            )}
            {plot.featured && (
              <span className="inline-flex items-center gap-1 rounded bg-primary px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
                <Sparkles size={12} />
                Featured
              </span>
            )}
            {plot.approved ? (
              <span className="inline-flex items-center gap-1 rounded bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-text shadow-sm">
                <CheckCircle2 size={12} className="text-green-500" />
                RERA Approved
              </span>
            ) : null}
          </div>

          <div className="absolute right-4 top-4 hidden flex-col gap-2 md:flex">
            <button
              type="button"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
              }}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-gray-600 shadow-sm backdrop-blur transition-colors hover:bg-white hover:text-primary"
              title="Favourite"
            >
              <Heart size={16} />
            </button>
            <button
              type="button"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                toggleCompare(plot);
              }}
              className={`flex h-9 w-9 items-center justify-center rounded-full shadow-sm backdrop-blur transition-colors ${
                isCompared ? 'bg-primary text-white' : 'bg-white/90 text-gray-600 hover:bg-white hover:text-primary'
              }`}
              title="Add to Compare"
            >
              <Scale size={16} />
            </button>
          </div>

          <div className="absolute bottom-4 right-4 hidden items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-xs font-semibold text-white shadow-sm backdrop-blur-md md:flex">
            <Camera size={12} /> {photoCount}
          </div>

          <div className="absolute bottom-4 left-4 hidden md:block">
            <span className="rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-text shadow-sm backdrop-blur-md">
              {plot.type || 'Plot'}
            </span>
          </div>
        </div>

        <div className="flex flex-1 flex-col overflow-hidden px-1 pb-1 md:p-6">
          {plot.isDemo && (
            <p className="mb-3 hidden rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-extrabold uppercase tracking-wide text-amber-700 md:block">
              This is a demo property
            </p>
          )}

          <h3 className="line-clamp-2 text-[15px] font-extrabold leading-tight text-text transition-colors group-hover:text-primary md:mb-2 md:text-xl">{plot.title}</h3>

          <p className="mt-2 flex min-w-0 items-center gap-1 text-xs font-semibold text-gray-500 md:mb-5 md:mt-0 md:gap-1.5 md:text-sm">
            <MapPin size={14} className="flex-shrink-0 text-gray-400 md:size-4" />
            <span className="min-w-0 truncate">{locationText}</span>
          </p>

          <div className="mt-3 grid grid-cols-2 gap-2 md:hidden">
            <div className="min-w-0 rounded-xl bg-surface px-3 py-2">
              <p className="text-[10px] font-bold uppercase tracking-wide text-muted">Size</p>
              <p className="mt-0.5 truncate text-xs font-extrabold text-text">{sizeText}</p>
            </div>
            <div className="min-w-0 rounded-xl bg-surface px-3 py-2">
              <p className="text-[10px] font-bold uppercase tracking-wide text-muted">Rate</p>
              <p className="mt-0.5 truncate text-xs font-extrabold text-text">{rateText}</p>
            </div>
          </div>

          <div className="mb-6 hidden grid-cols-3 gap-3 md:grid">
            <div className="rounded-xl border border-border/50 bg-surface p-3">
              <p className="text-[11px] font-bold uppercase tracking-wide text-muted">Price</p>
              <p className="mt-1 truncate text-sm font-black text-text">{priceText}</p>
            </div>
            <div className="rounded-xl border border-border/50 bg-surface p-3 text-center">
              <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted">Size</p>
              <p className="text-sm font-extrabold text-text">{sizeText}</p>
            </div>
            <div className="rounded-xl border border-border/50 bg-surface p-3 text-center">
              <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted">ROI</p>
              <p className="flex items-center justify-center gap-1 text-sm font-extrabold text-green-600">
                <TrendingUp size={12} /> {roiText}
              </p>
            </div>
          </div>

          <div className="mt-auto hidden items-center justify-between border-t border-border pt-4 md:flex">
            <div>
              <p className="text-xs font-bold text-text">{rateText}</p>
              <p className="mt-0.5 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-secondary">
                <Sparkles size={10} /> Associate Partner Verified
              </p>
            </div>
            <span className="inline-flex items-center justify-center rounded-xl bg-text px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all group-hover:bg-primary">
              View
            </span>
          </div>
        </div>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-background pb-28 font-sans md:pb-0">
      <section className="bg-white pb-4 md:hidden">
        <div className="relative z-20 bg-white px-4 pb-3 pt-3 shadow-[0_8px_22px_rgba(15,23,42,0.07)]">
          <div className="flex items-center justify-between gap-3">
            <Link href="/" className="flex min-w-0 flex-1 items-center gap-2">
              <img src="/logo.PNG" alt="Plotyards" className="h-8 w-8 flex-shrink-0 rounded-full object-cover" />
              <span className="truncate text-xl font-extrabold text-text">Plotyards</span>
            </Link>

            <div className="relative flex-shrink-0" ref={moreMenuRef}>
              <button
                type="button"
                onClick={() => setIsMoreMenuOpen((current) => !current)}
                aria-label="Open quick links"
                aria-expanded={isMoreMenuOpen}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full text-secondary"
              >
                <Menu size={25} strokeWidth={2.5} />
              </button>

              {isMoreMenuOpen && (
                <div className="fixed right-4 top-[3.75rem] z-40 w-[min(18rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-black/10 bg-white shadow-2xl">
                  <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                    <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-muted">Quick links</p>
                    <span className="h-2 w-2 rounded-full bg-primary"></span>
                  </div>
                  <div className="hero-dropdown-scroll max-h-[56vh] overflow-y-auto p-2">
                    {homeMoreLinks.map((link, index) => {
                      const Icon = link.icon;
                      const className = `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-extrabold transition-colors ${
                        index < 2 ? 'text-primary hover:bg-primary/10' : 'text-text hover:bg-surface'
                      }`;
                      const iconClassName = `flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${
                        index < 2 ? 'bg-primary/10 text-primary' : 'bg-surface text-muted'
                      }`;

                      if (link.external) {
                        return (
                          <a key={link.label} href={link.href} target="_blank" rel="noreferrer" className={className} onClick={() => setIsMoreMenuOpen(false)}>
                            <span className={iconClassName}><Icon size={16} /></span>
                            <span className="min-w-0 flex-1 truncate">{link.label}</span>
                          </a>
                        );
                      }

                      return (
                        <Link key={link.href} href={link.href} className={className} onClick={() => setIsMoreMenuOpen(false)}>
                          <span className={iconClassName}><Icon size={16} /></span>
                          <span className="min-w-0 flex-1 truncate">{link.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="relative w-full pt-3">
          <div className="relative h-[190px] w-full overflow-hidden bg-secondary shadow-sm">
            <img src="/hero-bg.jpg" alt="Premium plots" className="h-full w-full object-cover object-bottom" />
            <div className="absolute inset-0 bg-gradient-to-b from-secondary/80 via-secondary/50 to-secondary/80 mix-blend-multiply"></div>
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="absolute left-5 top-6 max-w-[85%] z-10">
              <p className="text-[11px] font-black uppercase tracking-[0.16em] text-white/90">New Launch</p>
              <h1 className="mt-2 text-[22px] font-black leading-tight text-white">India's First <span className="block text-white">Plot Marketplace</span></h1>
              <p className="mt-2 text-xs font-bold leading-5 text-white/90">Buy, Sell & Discover <span className="text-white bg-primary px-1.5 py-0.5 rounded font-bold">Verified Plots</span> Across India.</p>
            </div>
          </div>

          <form
            ref={mobileHeroSearchRef}
            onSubmit={(event) => {
              event.preventDefault();
              submitSearch();
            }}
            className="relative z-10 mx-4 -mt-10 rounded-2xl border border-border bg-white px-4 py-3 shadow-[0_12px_28px_rgba(15,23,42,0.12)]"
          >
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder='Search "plots for sale in Gurugram"'
                className="min-w-0 flex-1 bg-transparent text-[15px] font-semibold text-text outline-none placeholder:text-muted"
              />
              <button type="submit" aria-label="Search plots" className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-primary">
                <Search size={25} strokeWidth={2.5} />
              </button>
            </div>
          </form>
        </div>
      </section>

      {showStickyMobileSearch && (
      <div className="sticky top-0 z-30 border-b border-border/70 bg-white/95 px-4 py-2 shadow-sm backdrop-blur-xl md:hidden">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            submitSearch();
          }}
          className="flex h-11 items-center gap-2 rounded-xl border border-border bg-surface px-3"
        >
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder='Search "plots for sale in Gurugram"'
            className="min-w-0 flex-1 bg-transparent text-sm font-bold text-text outline-none placeholder:text-muted"
          />
          <button type="submit" aria-label="Search plots" className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-primary">
            <Search size={22} strokeWidth={2.5} />
          </button>
        </form>
      </div>
      )}

      <section className="relative hidden min-h-[90vh] flex-col items-center justify-center overflow-hidden bg-secondary px-6 pb-16 pt-24 md:flex lg:px-12">
        {/* Background Image & Gradient */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/hero-bg.jpg" 
            alt="Plots and Land" 
            className="w-full h-full object-cover object-bottom"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-secondary/80 via-secondary/50 to-secondary/80 mix-blend-multiply"></div>
          <div className="absolute inset-0 bg-black/20"></div>
        </div>

        <div className="relative z-10 w-full max-w-[1400px] mx-auto flex flex-col items-start mt-12">
          {/* Headlines */}
          <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-4 leading-[1.1] max-w-4xl tracking-tight">
            India's First <span className="block text-white">Plot Marketplace</span>
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mb-10 font-medium leading-relaxed">
            Buy, Sell & Discover <span className="text-white bg-primary px-2 py-1 rounded-md font-bold">Verified Plots</span> Across India.
          </p>

          {/* Search Container */}
          <div className="w-full bg-white rounded-3xl p-6 shadow-2xl mb-8">
            {/* Tabs */}
            <div className="flex flex-wrap items-center gap-2 mb-5 border-b border-gray-100 pb-4">
              {heroSearchTabs.map((tab) => (
                <button 
                  key={tab.label} 
                  type="button"
                  onClick={() => {
                    setActiveSearchTab(tab.label);
                    setPropertyType(tab.type || 'All');
                  }}
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                    tab.label === activeSearchTab
                      ? 'bg-primary text-white' 
                      : 'text-gray-600 hover:bg-red-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Inputs */}
            <div className="flex flex-col md:flex-row items-center gap-3 w-full">
              {/* State Dropdown */}
              <div className="relative w-full md:w-auto min-w-[210px]" ref={stateMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsStateMenuOpen((current) => !current)}
                  className="w-full flex items-center justify-between rounded-xl border border-white/60 bg-white/55 px-4 py-3 text-left shadow-sm backdrop-blur-xl transition-all hover:bg-white/75 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  aria-expanded={isStateMenuOpen}
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <MapPin size={17} className="flex-shrink-0 text-primary" />
                    <span className="truncate text-sm font-bold text-text">{selectedState}</span>
                  </span>
                  <ChevronDown size={18} className={`flex-shrink-0 text-gray-500 transition-transform ${isStateMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {isStateMenuOpen && (
                  <div className="hero-dropdown-scroll absolute left-0 right-0 top-full z-30 mt-3 max-h-48 overflow-y-auto rounded-[1.35rem] border border-white/80 bg-white/95 p-2 shadow-2xl shadow-secondary/20 ring-1 ring-black/5 backdrop-blur-2xl">
                    {stateOptions.map((stateName) => (
                      <button
                        key={stateName}
                        type="button"
                        onClick={() => {
                          setSelectedState(stateName);
                          setIsStateMenuOpen(false);
                        }}
                        className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition-colors ${
                          selectedState === stateName
                            ? 'bg-primary text-white shadow-sm'
                            : 'text-text hover:bg-white/80'
                        }`}
                      >
                        <span>{stateName}</span>
                        {selectedState === stateName && <Check size={15} />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Search Input */}
              <div className="flex-1 w-full flex items-center bg-surface rounded-xl px-4 py-3.5 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                <MapPin size={18} className="text-primary mr-3 flex-shrink-0" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      submitSearch();
                    }
                  }}
                  placeholder="Search &quot;Shadnagar&quot;, &quot;Devanahalli&quot;, or any locality" 
                  className="bg-transparent border-none outline-none text-text w-full placeholder-gray-400 font-medium text-sm" 
                />
              </div>

              {/* Search Button */}
              <button
                onClick={() => submitSearch()}
                className="w-full md:w-auto bg-primary hover:bg-rose-600 text-white px-8 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <Search size={18} />
                <span>Search</span>
              </button>
            </div>

            {/* Popular Tags */}
            <div className="flex flex-wrap items-center gap-2 mt-5">
              <span className="text-xs text-gray-400 font-medium uppercase tracking-wide mr-2">Popular:</span>
              {['Gurugram', 'Noida', 'Delhi', 'Mumbai' , 'Bangalore'].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    setSearchQuery(tag);
                    submitSearch(tag);
                  }}
                  className="text-xs font-medium text-gray-600 bg-surface px-3 py-1.5 rounded-full cursor-pointer hover:bg-gray-200 transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center gap-6 md:gap-10 text-white/90">
            <div className="flex items-center gap-2 font-medium text-sm">
              <ShieldCheck size={18} />
              <span>RERA Verified</span>
            </div>
            <div className="flex items-center gap-2 font-medium text-sm">
              <CheckCircle2 size={18} />
              <span>{statsLoaded ? `${stats.totalProperties.toLocaleString('en-IN')} Live Listings` : 'Loading Live listings'}</span>
            </div>
            <div className="flex items-center gap-2 font-medium text-sm">
              <CheckCircle2 size={18} />
              <span>{statsLoaded ? `${stats.totalBrokers.toLocaleString('en-IN')} Trusted Associate Partners` : 'Loading Trusted Associate Partners'}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Plots Section */}
      <section className="px-6 py-8 md:py-10 lg:px-12 max-w-[1400px] mx-auto">
        {/* Category Icons Navigation */}
        <div className="mb-12 hidden overflow-x-auto no-scrollbar gap-8 border-b border-border pb-4 md:flex">
          {featuredCategories.map((cat) => (
            <button
              key={cat.name}
              type="button"
              onClick={() => setActiveFeaturedCategory(cat.name)}
              className={`flex flex-col items-center gap-2 min-w-max pb-3 border-b-2 transition-colors ${
                cat.name === activeFeaturedCategory
                  ? 'border-text text-text'
                  : 'border-transparent text-gray-500 hover:text-text'
              }`}
            >
               <svg
      className="w-7 h-7"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
                 >
                <path strokeLinecap="round" strokeLinejoin="round" d={cat.icon} />
              </svg>
              <span className="text-sm font-semibold">{cat.name}</span>
            </button>
          )
          )
          }
        </div>

        <div className="mb-5 flex items-end justify-between gap-4 md:mb-8">
          <div>
            <h2 className="mb-2 text-3xl font-extrabold text-text">
              <span className="md:hidden text-[20px]">Plots in High Demand</span>
              <span className="hidden md:inline">Featured Plots Near You</span>
            </h2>
            <p className="font-medium text-muted">
              <span className="md:hidden">Most explored verified plots and land picks</span>
              <span className="hidden md:inline">{featuredSubtitle}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={handleSeeAllClick}
            className="text-sm font-semibold text-secondary flex items-center gap-1 hover:underline"
          >
            See all &rarr;
          </button>
        </div>

        {/* Listings Grid */}
        <div className="-mx-2 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-5 no-scrollbar md:mx-0 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:px-0 md:pb-0">
          {visibleFeaturedPlots.map((plot, index) => renderHomePropertyCard(plot, index))}
          {filteredFeaturedPlots.length === 0 && (
            <div className="col-span-full rounded-[2rem] border border-dashed border-border bg-white p-12 text-center shadow-sm">
              <p className="text-lg font-extrabold text-text">No featured plots available</p>
              <p className="mt-2 text-sm font-medium text-muted">Check back later for curated plots from Plotyards.</p>
            </div>
          )}
        </div>
      </section>

      {/* Explore top cities */}
      {topCities.length > 0 && (
      <section className="my-6 px-6 py-9 md:my-6 md:py-8 lg:px-12 max-w-[1400px] mx-auto bg-gray-50/50 rounded-[3rem]">
        <div className="mb-8">
          <h2 className="text-3xl font-extrabold text-text mb-2">Explore Plots In Top Cities</h2>
          <p className="text-gray-500 font-medium">Where investors are putting their money in 2026</p>
        </div>
        
        <div className="-mx-2 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-6 no-scrollbar md:mx-0 md:px-0">
          {topCities.map((city) => (
            <Link key={city.name} href={buildListingsSearchUrl(city.name, { city: city.name })} className="group relative h-[300px] w-[calc(100vw-3rem)] min-w-[calc(100vw-3rem)] flex-shrink-0 snap-start cursor-pointer overflow-hidden rounded-2xl shadow-sm transition-shadow hover:shadow-md sm:w-[260px] sm:min-w-[260px] md:h-[320px]">
              <img src={city.image || DEFAULT_TOP_CITIES[0].image} alt={city.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
              <div className="absolute bottom-6 left-6">
                <h3 className="text-xl font-bold text-white mb-1">{city.name}</h3>
                <p className="text-xs text-white/80 font-medium">
                  {city.propertyCount ?? city.plots} plots &bull; {city.price === 'Price on request' ? 'price on request' : `from ${city.price}`}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
      )}

      {/* Trending Projects Section */}
      <section className="px-6 py-9 md:py-10 lg:px-12 max-w-[1400px] mx-auto">
        <div className="mb-5 md:mb-8">
          <h2 className="text-3xl font-extrabold text-text mb-2">Trending Projects</h2>
          <p className="text-gray-500 font-medium">Most-viewed plot layouts this week</p>
        </div>

        {/* Listings Grid */}
        <div className="-mx-2 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-5 no-scrollbar md:mx-0 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:px-0 md:pb-0">
          {displayTrending.map((plot, index) => renderHomePropertyCard(plot, index))}
        </div>
      </section>

      {latestBlogs.length > 0 && (
        <section className="px-6 py-6 md:py-10 lg:px-12 max-w-[1400px] mx-auto">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-primary">
                <BookOpen size={14} />
                Latest insights
              </p>
              <h2 className="mt-2 text-xl md:text-3xl font-extrabold text-text md:mt-4 capitalize">Spotlight</h2>
              <p className="mt-2 max-w-2xl text-sm font-medium leading-7 text-muted">Success Stories, Investment Guides & Industry Updates</p>
            </div>
            <div className="hidden md:flex md:flex-wrap items-center gap-2 ">
              <Link href="/blogs" className="inline-flex  w-fit items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-extrabold text-white transition-colors hover:bg-rose-600">
                View all articles <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          <div className="mt-5 md:mt-8">
            <div className="relative md:hidden">
              <div className="grid grid-cols-2 gap-3">
                {latestBlogs.slice(0, 4).map((blog) => (
                  <Link key={blog.slug} href={`/blogs/${blog.slug}`} className="group min-w-0 overflow-hidden rounded-2xl border border-border bg-white shadow-sm transition-all duration-500 active:translate-y-0.5 active:rotate-1">
                    <div className="relative aspect-[16/10] overflow-hidden bg-surface">
                      <img src={blog.coverImage || '/hero-bg.jpg'} alt={blog.title} className="h-full w-full object-cover transition-transform duration-500 group-active:scale-105" />
                      <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-black/35 to-transparent"></div>
                      <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-black/35 to-transparent"></div>
                    </div>
                    <div className="p-3">
                      <span className="rounded-full bg-primary/10 px-2 py-1 text-[10px] font-extrabold uppercase tracking-wide text-primary">{blog.category || 'Real Estate'}</span>
                      <h3 className="mt-3 line-clamp-2 text-sm font-extrabold leading-tight text-text">{blog.title}</h3>
                      <div className="mt-3 flex items-center justify-between">
                        <p className="text-[11px] font-bold text-muted">{blog.readingTime || 1} min read</p>
                        <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); if(navigator.share) { navigator.share({ title: blog.title, url: `${window.location.origin}/blogs/${blog.slug}` }); } else { navigator.clipboard.writeText(`${window.location.origin}/blogs/${blog.slug}`); alert('Link copied!'); } }} className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-surface text-muted transition-colors hover:bg-primary/10 hover:text-primary">
                          <Share2 size={12} />
                        </button>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              <Link href="/blogs" className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-extrabold text-white transition-colors active:bg-rose-600">
                Show more <ArrowRight size={16} />
              </Link>
            </div>
            <div className="hidden md:grid md:grid-cols-3 md:gap-5">
              {latestBlogs.map((blog) => (
                <Link key={blog.slug} href={`/blogs/${blog.slug}`} className="group overflow-hidden rounded-2xl border border-border bg-white shadow-sm transition-all duration-500 active:translate-y-0.5 active:rotate-1 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl">
                <div className="relative aspect-[16/10] overflow-hidden bg-surface">
                  <img src={blog.coverImage || '/hero-bg.jpg'} alt={blog.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-black/35 to-transparent"></div>
                  <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-black/35 to-transparent"></div>
                </div>
                <div className="p-3 md:p-5">
                  <span className="rounded-full bg-primary/10 px-2 py-1 text-[10px] font-extrabold uppercase tracking-wide text-primary md:px-3 md:text-xs">{blog.category || 'Real Estate'}</span>
                  <h3 className="mt-3 line-clamp-2 text-sm font-extrabold leading-tight text-text group-hover:text-primary md:mt-4 md:text-xl">{blog.title}</h3>
                  <p className="mt-2 hidden text-sm font-medium leading-7 text-muted md:line-clamp-3">{blog.excerpt}</p>
                  <div className="mt-3 flex items-center justify-between md:mt-5">
                    <p className="text-[10px] font-bold text-muted md:text-xs">{blog.readingTime || 1} min read</p>
                    <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); if(navigator.share) { navigator.share({ title: blog.title, url: `${window.location.origin}/blogs/${blog.slug}` }); } else { navigator.clipboard.writeText(`${window.location.origin}/blogs/${blog.slug}`); alert('Link copied!'); } }} className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-surface text-muted transition-colors hover:bg-primary/10 hover:text-primary">
                      <Share2 size={14} />
                    </button>
                  </div>
                </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Trust Section */}
      <section className="bg-secondary text-white py-12 mt-12">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl lg:text-5xl font-extrabold mb-12 leading-tight">
              Why 38,000+ Buyers Trust Plotyards Every Month.
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-6 xl:gap-10">
              <div>
                <div className="flex items-start gap-2 mb-3">
                  <ShieldCheck className="text-primary shrink-0 mt-0.5" size={20} />
                  <h3 className="font-bold text-lg leading-snug">Only Verified Listings</h3>
                </div>
                <p className="text-white/70 text-sm leading-relaxed">
                  Every plot is checked for approval, ownership and pricing before going live.
                </p>
              </div>
              <div>
                <div className="flex items-start gap-2 mb-3">
                  <ShieldCheck className="text-primary shrink-0 mt-0.5" size={20} />
                  <h3 className="font-bold text-lg leading-snug xl:whitespace-nowrap">Direct Associate Partner Contact</h3>
                </div>
                <p className="text-white/70 text-sm leading-relaxed">
                  Call or WhatsApp associate partners directly - no middlemen, no spam routing.
                </p>
              </div>
              <div>
                <div className="flex items-start gap-2 mb-3">
                  <ShieldCheck className="text-primary shrink-0 mt-0.5" size={20} />
                  <h3 className="font-bold text-lg leading-snug">Investment-Grade Filters</h3>
                </div>
                <p className="text-white/70 text-sm leading-relaxed">
                  Filter by approval, registry-readiness, zoning and per-sq-yd rate.
                </p>
              </div>
              <div>
                <div className="flex items-start gap-2 mb-3">
                  <ShieldCheck className="text-primary shrink-0 mt-0.5" size={20} />
                  <h3 className="font-bold text-lg leading-snug">Free Site Visit Help</h3>
                </div>
                <p className="text-white/70 text-sm leading-relaxed">
                  We coordinate visits and document checks with the associate partner on your behalf.
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center lg:justify-end">
            <div className="bg-white rounded-[2rem] p-8 w-full max-w-md text-text shadow-2xl">
              <p className="text-primary text-xs font-bold uppercase tracking-wider mb-2">Get the App</p>
              <h3 className="text-2xl font-extrabold mb-3">India's First Plots-Only App.</h3>
              <p className="text-gray-500 text-sm mb-8">
                Saved Plots, Instant Alerts, Live Associate Partner Chat. Install In Seconds.
              </p>
              
              <div className="flex flex-col gap-3 mb-6">
                <Link href="/app-coming-soon" className="bg-[#0a0a0a] hover:bg-black text-white rounded-xl py-3.5 flex items-center justify-center gap-2 font-semibold transition-colors">
                  <Download size={18} /> Download for iOS
                </Link>
                <Link href="/app-coming-soon" className="bg-white border-2 border-gray-200 hover:border-gray-300 rounded-xl py-3 flex items-center justify-center gap-2 font-semibold transition-colors">
                  <Download size={18} /> Get it on Android
                </Link>
              </div>
              
              <div className="pt-6 border-t border-gray-100 flex items-center gap-2">
                <div className="flex text-amber-400">
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                </div>
                <span className="text-xs text-gray-500 font-medium">4.8 - 12,400 reviews on Play Store</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
