import { Search, MapPin, ChevronDown, CheckCircle2, ShieldCheck, Heart, Camera, Check, Star, Download, Paperclip, Scale, BookOpen, ArrowLeft, ArrowRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { DEFAULT_TOP_CITIES } from '../data/topCities';
import { apiRequest } from '../lib/api';
import { isAdminSearchQuery, openAdminEntry } from '../utils/adminAccess';
import { buildListingsSearchUrl } from '../utils/propertySearch';
import { adaptProperties } from '../utils/propertyAdapter';
import SEO from '../components/SEO';
import { propertyListings } from '../data/properties';
import { useCompare } from '../context/CompareContext';

const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearchTab, setActiveSearchTab] = useState('Plots / Land');
  const [propertyType, setPropertyType] = useState('Residential');
  const [selectedState, setSelectedState] = useState('All India');
  const [isStateMenuOpen, setIsStateMenuOpen] = useState(false);
  const [activeFeaturedCategory, setActiveFeaturedCategory] = useState('Residential');
  const [topCities, setTopCities] = useState(DEFAULT_TOP_CITIES);
  const [stats, setStats] = useState({ totalProperties: 0, totalBrokers: 0 });
  const [statsLoaded, setStatsLoaded] = useState(false);
  const [realProperties, setRealProperties] = useState([]);
  const [loadingReal, setLoadingReal] = useState(true);
  const [latestBlogs, setLatestBlogs] = useState([]);
  const stateMenuRef = useRef(null);
  const blogScrollerRef = useRef(null);
  const navigate = useNavigate();
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

  const displayTrending = hasLiveDatabase
    ? [...realProperties].sort((a, b) => (b.viewsCount || 0) - (a.viewsCount || 0)).slice(0, 3)
    : canShowDemoProperties ? propertyListings.slice(0, 3) : [];
  const featuredSubtitle = loadingReal
    ? 'Loading live featured plots from verified brokers.'
    : hasLiveDatabase
      ? "Hand-picked verified listings across India's growth corridors"
      : canShowDemoProperties
        ? 'Demo listings are visible because the live database is empty.'
        : 'Live listings will appear here after brokers post properties.';

  const handleSeeAllClick = () => {
    const category = featuredCategories.find((item) => item.name === activeFeaturedCategory) || {};
    const query = category.query || '';
    const filters = category.filter || {};
    navigate(buildListingsSearchUrl(query, filters));
  };

  const submitSearch = (query = searchQuery) => {
    if (isAdminSearchQuery(query)) {
      openAdminEntry(navigate);
      return;
    }

    const filters = {};
    const terms = [query];

    if (propertyType !== 'All') {
      filters.type = propertyType;
    }

    if (activeSearchTab === 'Commercial') {
      filters.type = 'Commercial';
    }

    if (activeSearchTab === 'Rent' || activeSearchTab === 'New Projects') {
      terms.push(activeSearchTab);
    }

    if (selectedState !== 'All India') {
      terms.push(selectedState);
    }

    navigate(buildListingsSearchUrl(terms.filter(Boolean).join(' '), filters));
  };

  const scrollBlogCards = (direction) => {
    if (!blogScrollerRef.current) return;

    const scrollAmount = Math.min(blogScrollerRef.current.clientWidth * 0.85, 360);
    blogScrollerRef.current.scrollBy({
      left: direction === 'next' ? scrollAmount : -scrollAmount,
      behavior: 'smooth'
    });
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (stateMenuRef.current && !stateMenuRef.current.contains(event.target)) {
        setIsStateMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    apiRequest('/site/top-cities')
      .then((data) => {
        if (Array.isArray(data.topCities)) {
          setTopCities(data.topCities);
        }
      })
      .catch(() => {});

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

    apiRequest('/properties?limit=100')
      .then((data) => {
        if (data && Array.isArray(data.properties)) {
          setRealProperties(adaptProperties(data.properties));
        }
      })
      .catch(() => {})
      .finally(() => setLoadingReal(false));

    apiRequest('/blogs?limit=3')
      .then((data) => {
        if (Array.isArray(data.blogs)) {
          setLatestBlogs(data.blogs);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-background font-sans">
      <SEO 
        title="Plotyards - Premium Plot & Land Investment Marketplace"
        description="Discover verified plots, residential lands, and high-growth commercial parcels. Broker-verified investment opportunities with transparent pricing."
      />
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center pt-24 pb-16 px-6 lg:px-12 bg-secondary overflow-hidden">
        {/* Background Image & Gradient */}
        <div className="absolute inset-0 z-0">
          <img 
            src="./hero-bg.jpg" 
            alt="Plots and Land" 
            className="w-full h-full object-cover object-bottom"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-secondary/80 via-secondary/50 to-secondary/80 mix-blend-multiply"></div>
          <div className="absolute inset-0 bg-black/20"></div>
        </div>

        <div className="relative z-10 w-full max-w-[1400px] mx-auto flex flex-col items-start mt-12">
          {/* Headlines */}
          <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-4 leading-[1.1] max-w-4xl tracking-tight">
            The smarter way to buy <span className="block">plots & land in India.</span>
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mb-10 font-medium leading-relaxed">
            {stats.totalProperties > 0 ? (
              `${stats.totalProperties.toLocaleString('en-IN')} verified plots from ${stats.totalBrokers.toLocaleString('en-IN')} trusted brokers. RERA approved layouts, ready-to-register parcels, transparent pricing.`
            ) : (
              "12,000+ verified plots from 850+ trusted brokers. RERA approved layouts, ready-to-register parcels, transparent pricing."
            )}
          </p>

          {/* Search Container */}
          <div className="w-full bg-white rounded-3xl p-6 shadow-2xl mb-8">
            {/* Tabs */}
            <div className="flex flex-wrap items-center gap-2 mb-5 border-b border-gray-100 pb-4">
              {['Buy', 'Rent', 'Commercial', 'Plots / Land', 'New Projects'].map((tab) => (
                <button 
                  key={tab} 
                  type="button"
                  onClick={() => {
                    setActiveSearchTab(tab);
                    if (tab === 'Commercial') {
                      setPropertyType('Commercial');
                    } else if (tab === 'Plots / Land' && propertyType === 'Commercial') {
                      setPropertyType('Residential');
                    }
                  }}
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                    tab === activeSearchTab
                      ? 'bg-text text-white' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {tab}
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
              {['Hyderabad', 'Bangalore', 'Pune', 'Mumbai', 'RERA approved'].map((tag) => (
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
              <span>RERA verified</span>
            </div>
            <div className="flex items-center gap-2 font-medium text-sm">
              <CheckCircle2 size={18} />
              <span>{statsLoaded ? `${stats.totalProperties.toLocaleString('en-IN')} live listings` : 'Loading live listings'}</span>
            </div>
            <div className="flex items-center gap-2 font-medium text-sm">
              <CheckCircle2 size={18} />
              <span>{statsLoaded ? `${stats.totalBrokers.toLocaleString('en-IN')} trusted brokers` : 'Loading trusted brokers'}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Plots Section */}
      <section className="py-20 px-6 lg:px-12 max-w-[1400px] mx-auto">
        {/* Category Icons Navigation */}
        <div className="flex overflow-x-auto no-scrollbar gap-8 mb-12 pb-4 border-b border-border">
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

        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-extrabold text-text mb-2">Featured plots near you</h2>
            <p className="text-gray-500 font-medium">{featuredSubtitle}</p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredFeaturedPlots.map((plot) => {
            const imageUrl = plot.image || plot.img;
            const locationText = plot.location || plot.loc;
            const sizeText = plot.size || plot.sqyd;
            const photoCount = plot.photoCount ?? 12;
            const linkId = plot.id || plot._id;

            return (
              <Link to={`/property/${linkId}`} key={linkId || plot.title} className="group cursor-pointer block">
                {/* Image Container */}
                <div className="relative rounded-2xl overflow-hidden aspect-[4/3] mb-4 shadow-sm group-hover:shadow-md transition-all">
                  <img src={imageUrl} alt={plot.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  
                  {/* Top Badges */}
                  <div className="absolute top-4 left-4 flex gap-2">
                    {plot.isDemo && (
                      <span className="bg-amber-50 text-amber-700 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded shadow-sm">
                        This is a demo property
                      </span>
                    )}
                    <span className="bg-primary text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded">
                      Featured
                    </span>
                    <span className="bg-white text-text text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded shadow-sm">
                      Ready to Register
                    </span>
                  </div>
                  
                  <div className="absolute right-4 top-4 flex flex-col gap-2">
                    <button
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                      className="w-8 h-8 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-gray-600 hover:text-primary transition-colors shadow-sm"
                    >
                      <Heart size={16} />
                    </button>
                    <button
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleCompare(plot); }}
                      className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm backdrop-blur transition-colors ${compareList.some(p => String(p.id) === String(linkId)) ? 'bg-primary text-white' : 'bg-white/90 text-gray-600 hover:text-primary'}`}
                      title="Compare Property"
                    >
                      <Scale size={16} />
                    </button>
                  </div>

                  {/* Bottom Badge */}
                  <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-white flex items-center gap-1.5 text-xs font-medium">
                    <Camera size={12} /> {photoCount}
                  </div>
                </div>

                {/* Details */}
                <div>
                  {plot.isDemo && (
                    <p className="mb-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-extrabold uppercase tracking-wide text-amber-700">
                      This is a demo property
                    </p>
                  )}
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-lg text-text truncate pr-2">{plot.title}</h3>
                    <div className="flex items-center gap-1 text-blue-600 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap bg-blue-50 px-1.5 py-0.5 rounded flex-shrink-0">
                      <CheckCircle2 size={12} className="text-blue-500" /> Approved
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-500 mb-3 flex items-center gap-1">
                    <MapPin size={14} className="text-gray-400" /> {locationText}
                  </p>
                  
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-4">
                    <span className="flex items-center gap-1"><Paperclip size={12} className="text-gray-400" /> {sizeText}</span>
                    <span>&bull;</span>
                    <span>{plot.type}</span>
                    <span>&bull;</span>
                    <span>{plot.rate}</span>
                  </div>
                  
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-extrabold text-text">{plot.price}</span>
                    <span className="text-xs text-gray-500 font-medium">onwards</span>
                  </div>
                </div>
              </Link>
            );
          })}
          {filteredFeaturedPlots.length === 0 && (
            <div className="col-span-full rounded-[2rem] border border-dashed border-border bg-white p-12 text-center shadow-sm">
              <p className="text-lg font-extrabold text-text">No featured plots available</p>
              <p className="mt-2 text-sm font-medium text-muted">Check back later for curated plots from Plotyards.</p>
            </div>
          )}
        </div>
      </section>

      {latestBlogs.length > 0 && (
        <section className="py-14 px-6 lg:px-12 max-w-[1400px] mx-auto">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-primary">
                <BookOpen size={14} />
                Latest insights
              </p>
              <h2 className="mt-4 text-3xl font-extrabold text-text">Blogs & articles for smarter property decisions</h2>
              <p className="mt-2 max-w-2xl text-sm font-medium leading-7 text-muted">Read buyer checklists, investment guides, and broker-written location insights.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2 md:hidden">
                <button
                  type="button"
                  onClick={() => scrollBlogCards('prev')}
                  aria-label="Previous articles"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-white text-text shadow-sm transition-colors hover:border-primary hover:text-primary"
                >
                  <ArrowLeft size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => scrollBlogCards('next')}
                  aria-label="Next articles"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-white text-text shadow-sm transition-colors hover:border-primary hover:text-primary"
                >
                  <ArrowRight size={18} />
                </button>
              </div>
              <Link to="/blogs" className="inline-flex w-fit items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-extrabold text-white transition-colors hover:bg-rose-600">
                View all articles <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          <div
            ref={blogScrollerRef}
            className="-mx-6 mt-8 flex snap-x snap-mandatory gap-5 overflow-x-auto px-6 pb-3 no-scrollbar md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0 md:pb-0"
          >
            {latestBlogs.map((blog) => (
              <Link key={blog.slug} to={`/blogs/${blog.slug}`} className="group min-w-[82vw] max-w-[340px] flex-shrink-0 snap-start overflow-hidden rounded-2xl border border-border bg-white shadow-sm transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl md:min-w-0 md:max-w-none">
                <div className="aspect-[16/10] overflow-hidden bg-surface">
                  <img src={blog.coverImage || '/hero-bg.jpg'} alt={blog.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                </div>
                <div className="p-5">
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-primary">{blog.category || 'Real Estate'}</span>
                  <h3 className="mt-4 text-xl font-extrabold leading-tight text-text group-hover:text-primary">{blog.title}</h3>
                  <p className="mt-3 line-clamp-3 text-sm font-medium leading-7 text-muted">{blog.excerpt}</p>
                  <p className="mt-5 text-xs font-bold text-muted">{blog.readingTime || 1} min read</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Explore top cities */}
      {topCities.length > 0 && (
      <section className="py-12 px-6 lg:px-12 max-w-[1400px] mx-auto bg-gray-50/50 rounded-[3rem] my-10">
        <div className="mb-8">
          <h2 className="text-3xl font-extrabold text-text mb-2">Explore plots in top cities</h2>
          <p className="text-gray-500 font-medium">Where investors are putting their money in 2026</p>
        </div>
        
        <div className="flex overflow-x-auto no-scrollbar gap-4 pb-6">
          {topCities.map((city) => (
            <Link key={city.name} to={buildListingsSearchUrl(city.name, { city: city.name })} className="relative rounded-2xl overflow-hidden min-w-[240px] h-[320px] group cursor-pointer flex-shrink-0 shadow-sm hover:shadow-md transition-shadow">
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
      <section className="py-20 px-6 lg:px-12 max-w-[1400px] mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-extrabold text-text mb-2">Trending projects</h2>
          <p className="text-gray-500 font-medium">Most-viewed plot layouts this week</p>
        </div>

        {/* Listings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {displayTrending.map((plot) => {
            const imageUrl = plot.image || plot.img;
            const locationText = plot.location || plot.loc;
            const sizeText = plot.size || plot.sqyd;
            const photoCount = plot.photoCount ?? 12;
            const linkId = plot.id || plot._id;

            return (
              <Link to={`/property/${linkId}`} key={linkId || plot.title} className="group cursor-pointer block">
                {/* Image Container */}
                <div className="relative rounded-2xl overflow-hidden aspect-[4/3] mb-4 shadow-sm group-hover:shadow-md transition-all">
                  <img src={imageUrl} alt={plot.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  
                  {/* Top Badges */}
                  <div className="absolute top-4 left-4 flex gap-2">
                    {plot.isDemo && (
                      <span className="bg-amber-50 text-amber-700 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded shadow-sm">
                        This is a demo property
                      </span>
                    )}
                    <span className="bg-primary text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded">
                      Featured
                    </span>
                    <span className="bg-white text-text text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded shadow-sm">
                      Ready to Register
                    </span>
                  </div>
                  
                  <div className="absolute right-4 top-4 flex flex-col gap-2">
                    <button
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                      className="w-8 h-8 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-gray-600 hover:text-primary transition-colors shadow-sm"
                    >
                      <Heart size={16} />
                    </button>
                    <button
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleCompare(plot); }}
                      className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm backdrop-blur transition-colors ${compareList.some(p => String(p.id) === String(linkId)) ? 'bg-primary text-white' : 'bg-white/90 text-gray-600 hover:text-primary'}`}
                      title="Compare Property"
                    >
                      <Scale size={16} />
                    </button>
                  </div>

                  {/* Bottom Badge */}
                  <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-white flex items-center gap-1.5 text-xs font-medium">
                    <Camera size={12} /> {photoCount}
                  </div>
                </div>

                {/* Details */}
                <div>
                  {plot.isDemo && (
                    <p className="mb-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-extrabold uppercase tracking-wide text-amber-700">
                      This is a demo property
                    </p>
                  )}
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-lg text-text truncate pr-2">{plot.title}</h3>
                    <div className="flex items-center gap-1 text-blue-600 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap bg-blue-50 px-1.5 py-0.5 rounded flex-shrink-0">
                      <CheckCircle2 size={12} className="text-blue-500" /> Approved
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-500 mb-3 flex items-center gap-1">
                    <MapPin size={14} className="text-gray-400" /> {locationText}
                  </p>
                  
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-4">
                    <span className="flex items-center gap-1"><Paperclip size={12} className="text-gray-400" /> {sizeText}</span>
                    <span>&bull;</span>
                    <span>{plot.type}</span>
                    <span>&bull;</span>
                    <span>{plot.rate}</span>
                  </div>
                  
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-extrabold text-text">{plot.price}</span>
                    <span className="text-xs text-gray-500 font-medium">onwards</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Trust Section */}
      <section className="bg-secondary text-white py-20 mt-20">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl lg:text-5xl font-extrabold mb-12 leading-tight">
              Why 38,000+ buyers trust Plotyards every month.
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <ShieldCheck className="text-primary" size={20} />
                  <h3 className="font-bold text-lg">Only verified listings</h3>
                </div>
                <p className="text-white/70 text-sm leading-relaxed">
                  Every plot is checked for approval, ownership and pricing before going live.
                </p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <ShieldCheck className="text-primary" size={20} />
                  <h3 className="font-bold text-lg">Direct broker contact</h3>
                </div>
                <p className="text-white/70 text-sm leading-relaxed">
                  Call or WhatsApp brokers directly - no middlemen, no spam routing.
                </p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <ShieldCheck className="text-primary" size={20} />
                  <h3 className="font-bold text-lg">Investment-grade filters</h3>
                </div>
                <p className="text-white/70 text-sm leading-relaxed">
                  Filter by approval, registry-readiness, zoning and per-sq-yd rate.
                </p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <ShieldCheck className="text-primary" size={20} />
                  <h3 className="font-bold text-lg">Free site visit help</h3>
                </div>
                <p className="text-white/70 text-sm leading-relaxed">
                  We coordinate visits and document checks with the broker on your behalf.
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center lg:justify-end">
            <div className="bg-white rounded-[2rem] p-8 w-full max-w-md text-text shadow-2xl">
              <p className="text-primary text-xs font-bold uppercase tracking-wider mb-2">Get the App</p>
              <h3 className="text-2xl font-extrabold mb-3">India's first plots-only app.</h3>
              <p className="text-gray-500 text-sm mb-8">
                Saved plots, instant alerts, live broker chat. Install in seconds.
              </p>
              
              <div className="flex flex-col gap-3 mb-6">
                <Link to="/app-coming-soon" className="bg-[#0a0a0a] hover:bg-black text-white rounded-xl py-3.5 flex items-center justify-center gap-2 font-semibold transition-colors">
                  <Download size={18} /> Download for iOS
                </Link>
                <Link to="/app-coming-soon" className="bg-white border-2 border-gray-200 hover:border-gray-300 rounded-xl py-3 flex items-center justify-center gap-2 font-semibold transition-colors">
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
