"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';

import {
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  Camera,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Heart,
  MapPin,
  MessageCircle,
  Phone,
  Route,
  Share2,
  ShieldCheck,
  TrendingUp,
  Scale
} from 'lucide-react';
import { propertyListings } from '../data/properties';
import { apiRequest } from '../lib/api';
import { adaptProperties, adaptProperty } from '../utils/propertyAdapter';
import { useAuth } from '../context/auth';

import EMICalculator from '../components/EMICalculator';
import { useCompare } from '../context/CompareContext';

const galleryImages = [
  'https://images.unsplash.com/photo-1524813686514-a57563d77965?q=80&w=2000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1200&auto=format&fit=crop'
];

const amenities = [
  'Blacktop roads',
  'Underground electricity',
  'Water connection',
  'Avenue plantation',
  'Drainage system',
  '24/7 security',
  'Clubhouse access',
  'Children play area'
];

const documents = [
  'RERA approval copy',
  'Clear title verification',
  'Layout and plot demarcation',
  'Ready registration support'
];

const defaultBroker = {
  name: 'Ramesh Kumar Real Estate',
  phone: '+91 98765 43210',
  whatsapp: '919876543210',
  properties: 42,
  response: 'Usually replies in 12 min'
};

const isMongoId = (val) => /^[0-9a-fA-F]{24}$/.test(String(val));

const PropertyDetails = () => {
  const { id } = useParams();
  const [isFavorite, setIsFavorite] = useState(false);
  const [remoteProperty, setRemoteProperty] = useState(null);
  const [remoteSuggestions, setRemoteSuggestions] = useState([]);
  const [lead, setLead] = useState({ phone: '', message: '' });
  const [leadStatus, setLeadStatus] = useState('');
  const [hasSentInquiry, setHasSentInquiry] = useState(false);
  const [shareStatus, setShareStatus] = useState('');
  const [stats, setStats] = useState({ totalProperties: 0, totalBrokers: 0 });
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const navigate = useRouter();
  const { user } = useAuth();
  const { compareList, toggleCompare } = useCompare();

  const property = useMemo(() => {
    if (remoteProperty) return remoteProperty;
    if (isMongoId(id)) return null;
    return propertyListings.find((listing) => String(listing.id) === String(id)) || propertyListings[0];
  }, [id, remoteProperty]);

  const propertyImages = useMemo(() => {
    const urls = property?.images?.map((item) => item.url).filter(Boolean) || [];
    return urls.length ? urls : galleryImages;
  }, [property]);

  const activeBroker = useMemo(() => {
    const broker = property?.broker || defaultBroker;
    const phone = broker.brokerProfile?.contactPhone || broker.phone || '';
    const numericPhone = String(phone || defaultBroker.phone).replace(/\D/g, '');
    return {
      ...defaultBroker,
      ...broker,
      phone: phone || defaultBroker.phone,
      whatsapp: String(broker.whatsapp || numericPhone || defaultBroker.whatsapp).replace(/\D/g, ''),
      callNumber: numericPhone || String(defaultBroker.phone).replace(/\D/g, ''),
      properties: broker.properties || defaultBroker.properties,
      response: broker.response || defaultBroker.response
    };
  }, [property]);

  const dbHasProperties = stats.totalProperties > 0;
  const favoriteActive = Boolean(user && isFavorite);
  const inquiryAlreadySent = Boolean(user && hasSentInquiry);

  const suggestions = useMemo(() => {
    const useReal = dbHasProperties || remoteSuggestions.length > 0;
    const source = useReal ? remoteSuggestions : propertyListings;
    const sameCity = source.filter(
      (listing) => listing.id !== property?.id && (listing.city === property?.city || listing.type === property?.type)
    );
    const fallback = source.filter((listing) => listing.id !== property?.id);

    return (sameCity.length ? sameCity : fallback).slice(0, 3);
  }, [property, remoteSuggestions, dbHasProperties]);

  useEffect(() => {
    window.scrollTo(0, 0);
    const resetId = window.setTimeout(() => setCurrentImageIndex(0), 0);

    return () => window.clearTimeout(resetId);
  }, [id]);

  const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % propertyImages.length);
  const prevImage = () => setCurrentImageIndex((prev) => (prev === 0 ? propertyImages.length - 1 : prev - 1));

  useEffect(() => {
    if (!property?.id || !property?.title) return;

    const historyItem = {
      property,
      viewedAt: new Date().toISOString()
    };

    try {
      const currentHistory = JSON.parse(localStorage.getItem('viewHistory') || '[]');
      const nextHistory = [
        historyItem,
        ...currentHistory.filter((item) => String(item.property?.id || item.property?._id) !== String(property.id))
      ].slice(0, 50);

      localStorage.setItem('viewHistory', JSON.stringify(nextHistory));
    } catch {
      localStorage.setItem('viewHistory', JSON.stringify([historyItem]));
    }
  }, [property]);

  const toggleFavourite = async () => {
    if (!user) {
      navigate.push('/login?from=' + encodeURIComponent(`/property/${id}`));
      return;
    }

    if (!isMongoId(property.id)) {
      setIsFavorite(!isFavorite);
      return;
    }

    try {
      if (isFavorite) {
        await apiRequest(`/favourites/${property.id}`, { method: 'DELETE' });
        setIsFavorite(false);
      } else {
        await apiRequest(`/favourites/${property.id}`, { method: 'POST' });
        setIsFavorite(true);
      }
    } catch (err) {
      setLeadStatus(err.message || 'Unable to update favourites.');
    }
  };

  const submitLead = async (event) => {
    event?.preventDefault();

    if (!user) {
      navigate.push('/login?from=' + encodeURIComponent(`/property/${id}`));
      return;
    }

    const contactPhone = user.phone || lead.phone;

    if (!contactPhone) {
      setLeadStatus('Please add your mobile number before sending an inquiry.');
      return;
    }

    if (!isMongoId(property.id)) {
      setLeadStatus('Inquiry sent to associate partner (Demo).');
      setHasSentInquiry(true);
      setLead({ phone: '', message: '' });
      return;
    }

    try {
      await apiRequest('/inquiries', {
        method: 'POST',
        body: {
          propertyId: property.id,
          name: user.name,
          phone: contactPhone,
          email: user.email,
          message: lead.message
        }
      });
      setLeadStatus('Inquiry sent to associate partner.');
      setHasSentInquiry(true);
      setLead({ phone: '', message: '' });
    } catch (err) {
      if (err.message?.toLowerCase().includes('already sent')) {
        setHasSentInquiry(true);
      }
      setLeadStatus(err.message);
    }
  };

  const handleShare = async () => {
    const shareUrl = (typeof window !== 'undefined' ? window.location.href : '');
    const shareData = {
      title: property.title,
      text: `Check this property on Plotyards: ${property.title}`,
      url: shareUrl
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        setShareStatus('Property shared.');
        return;
      }

      await navigator.clipboard.writeText(shareUrl);
      setShareStatus('Property link copied.');
    } catch {
      setShareStatus('Unable to share right now.');
    }
  };

  useEffect(() => {
    let isMounted = true;
    
    // Only set loading to true initially, not on every background poll
    setLoading(true);

    const loadProperty = async () => {
      if (isMongoId(id)) {
        try {
          const data = await apiRequest(`/properties/${id}`);
          if (isMounted) setRemoteProperty(adaptProperty(data.property));
        } catch {
          if (isMounted) setRemoteProperty(null);
        }
      } else {
        if (isMounted) setRemoteProperty(null);
      }

      try {
        const data = await apiRequest('/properties?limit=6');
        if (isMounted) setRemoteSuggestions(adaptProperties(data.properties));
      } catch {
        if (isMounted) setRemoteSuggestions([]);
      }

      try {
        const statsData = await apiRequest('/site/stats');
        if (isMounted && statsData && typeof statsData.totalProperties === 'number') {
          setStats({
            totalProperties: statsData.totalProperties,
            totalBrokers: statsData.totalBrokers
          });
        }
      } catch {
        // Ignore
      }
      if (isMounted) setLoading(false);
    };

    loadProperty();
    const interval = setInterval(loadProperty, 3000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [id]);

  useEffect(() => {
    if (!user) return undefined;

    let cancelled = false;

    const loadFavourites = async () => {
      try {
        const data = await apiRequest('/favourites');
        const favouriteIds = new Set(data.favourites.map((item) => String(item.property._id || item.property.id)));
        if (!cancelled) {
          setIsFavorite(favouriteIds.has(String(id)));
        }
      } catch {
        if (!cancelled) {
          setIsFavorite(false);
        }
      }
    };

    loadFavourites();
    return () => {
      cancelled = true;
    };
  }, [id, user]);

  useEffect(() => {
    if (!user || !property?.id) {
      return;
    }

    const loadInquiryStatus = async () => {
      if (!isMongoId(property.id)) {
        setHasSentInquiry(false);
        return;
      }

      try {
        const data = await apiRequest(`/inquiries/property/${property.id}/me`);
        setHasSentInquiry(Boolean(data.inquiry));
      } catch {
        setHasSentInquiry(false);
      }
    };

    loadInquiryStatus();
  }, [property?.id, user]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface pt-28 pb-16">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-sm font-semibold text-muted">Loading property details...</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface px-6 pt-28 pb-16">
        <div className="max-w-md rounded-[2rem] border border-border bg-white p-8 text-center shadow-sm">
          <p className="text-2xl font-extrabold text-text">Property not found</p>
          <p className="mt-2 text-sm font-semibold text-muted">This listing is not available in the live database.</p>
          <Link
            href="/listings"
            className="mt-6 inline-flex items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-extrabold text-white transition-colors hover:bg-rose-600"
          >
            Back to listings
          </Link>
        </div>
      </div>
    );
  }

  const schema = property?.id ? {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    "name": property.title,
    "description": property.description,
    "image": propertyImages,
    "url": (typeof window !== 'undefined' ? window.location.href : ''),
    "offers": {
      "@type": "Offer",
      "priceCurrency": "INR",
      "price": property.priceValue || 0,
      "availability": "https://schema.org/InStock"
    }
  } : null;

  return (
    <div className="min-h-screen bg-surface pb-44 pt-4 font-sans md:pb-16 md:pt-28">
      
      <div className="container mx-auto max-w-[1440px] px-6 lg:px-12">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 md:mb-6">
          <Link
            href="/listings"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-3 py-2 text-xs font-bold text-muted shadow-sm transition-colors hover:border-primary hover:text-primary md:px-4 md:text-sm"
          >
            <ArrowLeft size={17} />
            Back to listings
          </Link>

          <div className="flex items-center gap-2">
            {shareStatus && <span className="text-xs font-bold text-primary">{shareStatus}</span>}
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-white text-muted shadow-sm transition-colors hover:border-primary hover:text-primary"
              aria-label="Share property"
            >
              <Share2 size={18} />
            </button>
            <button
              onClick={() => toggleCompare(property)}
              className={`inline-flex h-11 w-11 items-center justify-center rounded-full border bg-white shadow-sm transition-colors ${
                compareList.some(p => String(p.id) === String(property.id)) ? 'border-primary bg-primary text-white' : 'border-border text-muted hover:border-primary hover:text-primary'
              }`}
              title="Compare Property"
            >
              <Scale size={18} />
            </button>
            <button
              onClick={toggleFavourite}
              className={`inline-flex h-11 w-11 items-center justify-center rounded-full border bg-white shadow-sm transition-colors ${
                favoriteActive ? 'border-primary text-primary' : 'border-border text-muted hover:border-primary hover:text-primary'
              }`}
              title="Favourite"
            >
              <Heart size={18} fill={favoriteActive ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>

        <section className="mb-5 overflow-hidden rounded-[1.5rem] border border-border bg-white p-2 shadow-sm md:mb-8 md:rounded-[2rem] md:p-4">
          <div className="flex h-[300px] flex-col gap-3 md:h-[450px] lg:flex-row lg:gap-4">
            {/* Main Carousel Image */}
            <div className="group relative h-full w-full flex-1 overflow-hidden rounded-[1.25rem] bg-black md:rounded-[1.5rem]">
              {/* Blurred backdrop */}
              <img src={propertyImages[currentImageIndex]} alt="backdrop" className="absolute inset-0 h-full w-full object-cover blur-2xl opacity-40 scale-110 pointer-events-none" />
              
              {/* Main Image */}
              <img src={propertyImages[currentImageIndex]} alt={`${property.title} view ${currentImageIndex + 1}`} className="absolute inset-0 h-full w-full object-contain transition-all duration-300" />
              
              {propertyImages.length > 1 && (
                <>
                  <button onClick={prevImage} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-text p-2 rounded-full shadow-sm backdrop-blur transition-all md:opacity-0 group-hover:opacity-100 z-10" aria-label="Previous image">
                    <ChevronLeft size={24} />
                  </button>
                  <button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-text p-2 rounded-full shadow-sm backdrop-blur transition-all md:opacity-0 group-hover:opacity-100 z-10" aria-label="Next image">
                    <ChevronRight size={24} />
                  </button>
                  <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                    {propertyImages.map((_, i) => (
                      <div key={i} className={`h-1.5 rounded-full transition-all ${i === currentImageIndex ? 'w-4 bg-primary' : 'w-1.5 bg-white/60'}`} />
                    ))}
                  </div>
                </>
              )}

              <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent p-4 md:p-5">
                <div className="flex flex-wrap gap-2 pointer-events-auto">
                  {property.featured && (
                    <span className="rounded-full bg-primary px-3 py-1 text-xs font-extrabold text-white">
                      Featured
                    </span>
                  )}
                  {property.isDemo && (
                    <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-extrabold text-amber-700">
                      This is a demo property
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-extrabold text-text">
                    <ShieldCheck size={13} className="text-primary" />
                    Associate Partner verified
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-extrabold text-text lg:hidden">
                    <Camera size={13} />
                    {propertyImages.length} photos
                  </span>
                </div>
              </div>
            </div>

            {/* Desktop Side Thumbnails */}
            {propertyImages.length > 1 && (
              <div className="hidden lg:flex flex-col gap-4 w-[320px] h-full">
                {propertyImages.slice(1, 4).map((image, index) => (
                  <div 
                    key={`${image}-${index}`} 
                    onClick={() => setCurrentImageIndex(index + 1)}
                    className="relative flex-1 w-full overflow-hidden rounded-2xl cursor-pointer group bg-black"
                  >
                    <img src={image} alt={`Thumbnail ${index + 1}`} className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
                    {index === 2 && propertyImages.length > 4 && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-sm font-extrabold text-white backdrop-blur-sm hover:bg-black/70 transition-colors">
                        +{propertyImages.length - 4} photos
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <div className="grid grid-cols-1 gap-5 md:gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
          <main className="space-y-5 md:space-y-8">
            <section className="rounded-[1.5rem] border border-border bg-white p-4 shadow-sm md:rounded-[2rem] md:p-6 lg:p-8">
              <div className="mb-4 flex flex-wrap items-center gap-2 md:mb-5">
                {property.isDemo && (
                  <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
                    This is a demo property
                  </span>
                )}
                <span className="rounded-full bg-surface px-3 py-1 text-xs font-bold text-text">{property.type}</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700">
                  <CheckCircle2 size={13} />
                  {property.approved ? 'Approved' : 'Docs pending'}
                </span>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">Ready to register</span>
              </div>

              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div>
                  <h1 className="max-w-3xl text-2xl font-extrabold leading-tight text-text md:text-3xl lg:text-5xl">{property.title}</h1>
                  <p className="mt-2 flex items-start gap-2 text-sm font-semibold leading-6 text-muted md:mt-3">
                    <MapPin size={17} className="mt-0.5 flex-shrink-0" />
                    <span>{property.location} - {property.corridor}</span>
                  </p>
                </div>
                <div className="flex flex-col justify-center rounded-2xl bg-surface p-4 xl:min-w-[240px] md:p-5">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-muted">Starting from</p>
                    <p className="mt-1 text-2xl font-extrabold text-text md:text-3xl">{property.price}</p>
                    <p className="mt-1 text-sm font-semibold text-muted">{property.rate}</p>
                  </div>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 overflow-hidden rounded-2xl border border-border bg-surface md:mt-8 md:grid-cols-4">
                {[
                  ['Plot size', property.size],
                  ['Property type', property.type],
                  ['Expected ROI', property.roi],
                  ['Status', 'Available']
                ].map(([label, value]) => (
                  <div key={label} className="border-b border-r border-border p-3 last:border-r-0 md:border-b-0 md:p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-muted">{label}</p>
                    <p className="mt-1 text-base font-extrabold text-text md:text-lg">{value}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-2xl border border-primary/15 bg-primary/10 p-4">
                <p className="text-sm font-extrabold text-text">Best next step</p>
                <p className="mt-1 text-xs font-semibold leading-5 text-muted">Ask the associate partner for the exact plot number, approach road width, and latest document photos before booking a site visit.</p>
              </div>
            </section>

            <section className="rounded-[1.5rem] border border-border bg-white p-4 shadow-sm md:rounded-[2rem] md:p-6 lg:p-8">
              <h2 className="text-xl font-extrabold text-text md:text-2xl">About this property</h2>
              {property.isDemo && (
                <p className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-extrabold text-amber-700">
                  This is a demo property
                </p>
              )}
              <p className="mt-4 max-w-4xl text-sm font-medium leading-7 text-muted">
                {property.description || `Premium gated plot layout in ${property.locality}, positioned around ${property.corridor}. The parcel is suitable for long-term land banking, villa construction, and plotted development investment. Clear access roads, verified associate partner details, and registry support make the purchase flow easier for serious buyers.`}
              </p>
            </section>

            <section className="grid gap-4 md:grid-cols-2 md:gap-6">
              <div className="rounded-[1.5rem] border border-border bg-white p-4 shadow-sm md:rounded-[2rem] md:p-6">
                <h2 className="mb-5 text-xl font-extrabold text-text">Layout amenities</h2>
                <div className="grid gap-3">
                  {(property.amenities && property.amenities.length > 0 ? property.amenities : amenities).map((amenity) => (
                    <div key={amenity} className="flex items-center gap-3 text-sm font-semibold text-text">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-50 text-green-600">
                        <Check size={14} strokeWidth={3} />
                      </span>
                      {amenity}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-border bg-white p-4 shadow-sm md:rounded-[2rem] md:p-6">
                <h2 className="mb-5 text-xl font-extrabold text-text">Documents checked</h2>
                <div className="grid gap-3">
                  {(property.documentsVerified && property.documentsVerified.length > 0 ? property.documentsVerified : documents).map((document) => (
                    <div key={document} className="flex items-center gap-3 text-sm font-semibold text-text">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <ClipboardCheck size={14} />
                      </span>
                      {document}
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="rounded-[1.5rem] border border-border bg-white p-4 shadow-sm md:rounded-[2rem] md:p-6 lg:p-8">
              <h2 className="text-2xl font-extrabold text-text">Location advantages</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                {[
                  [Route, property.corridor, 'Primary growth corridor'],
                  [CalendarDays, 'Immediate', 'Registration support'],
                  [TrendingUp, property.roi, 'Expected annual ROI']
                ].map(([Icon, title, label]) => (
                  <div key={title} className="rounded-2xl bg-surface p-4">
                    <Icon size={22} className="text-primary" />
                    <p className="mt-3 font-extrabold text-text">{title}</p>
                    <p className="mt-1 text-xs font-semibold text-muted">{label}</p>
                  </div>
                ))}
              </div>
            </section>

            <EMICalculator propertyPrice={property.priceValue} propertyPriceStr={property.price} />
          </main>

          <aside>
            <div className="space-y-5 md:sticky md:top-28">
              <div className="rounded-[1.5rem] border border-border bg-white p-4 shadow-card md:rounded-[2rem] md:p-6">
                <p className="text-xs font-bold uppercase tracking-wide text-muted">Associate Partner contact</p>
                <div className="mt-5 flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-xl font-extrabold text-white">
                    {activeBroker.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="flex items-center gap-1 font-extrabold text-text">
                      {activeBroker.name}
                      <BadgeCheck size={16} className="text-primary" />
                    </h3>
                    <p className="text-xs font-semibold text-muted">{activeBroker.properties} active properties</p>
                  </div>
                </div>

                <div className="mt-6 rounded-2xl bg-surface p-4">
                  <p className="text-sm font-bold text-text">{activeBroker.response}</p>
                  <p className="mt-1 text-xs font-medium text-muted">Ask for exact plot number, documents, or site visit slots.</p>
                </div>

                <div className="mt-5 grid gap-3">
                  {user ? (
                    <>
                      <a
                        href={`https://wa.me/${activeBroker.whatsapp}`}
                        className="flex h-12 items-center justify-center gap-2 rounded-xl bg-[#25D366] text-sm font-extrabold text-white transition-colors hover:bg-[#1ebd5a]"
                      >
                        <MessageCircle size={18} />
                        WhatsApp {activeBroker.phone}
                      </a>
                      <a
                        href={`tel:+${activeBroker.callNumber}`}
                        className="flex h-12 items-center justify-center gap-2 rounded-xl border border-border bg-white text-sm font-extrabold text-text transition-colors hover:border-primary hover:text-primary"
                      >
                        <Phone size={18} />
                        Call {activeBroker.phone}
                      </a>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => navigate.push('/login?from=' + encodeURIComponent(`/property/${id}`))}
                        className="flex h-12 items-center justify-center gap-2 rounded-xl bg-[#25D366] text-sm font-extrabold text-white transition-colors hover:bg-[#1ebd5a]"
                      >
                        <MessageCircle size={18} />
                        Login to WhatsApp Associate Partner
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate.push('/login?from=' + encodeURIComponent(`/property/${id}`))}
                        className="flex h-12 items-center justify-center gap-2 rounded-xl border border-border bg-white text-sm font-extrabold text-text transition-colors hover:border-primary hover:text-primary"
                      >
                        <Phone size={18} />
                        Login to Call Associate Partner
                      </button>
                    </>
                  )}
                </div>
                <div className="mt-5 border-t border-border pt-5">
                  {leadStatus && <p className="mb-3 rounded-xl bg-surface p-3 text-xs font-bold text-text">{leadStatus}</p>}
                  {inquiryAlreadySent ? (
                    <div className="rounded-2xl bg-green-50 p-4 text-sm font-bold text-green-700">
                      You have already sent an inquiry for this property.
                    </div>
                  ) : (
                    <div className="grid gap-3">
                      {user ? (
                        <div className="rounded-2xl bg-surface p-4">
                          <p className="text-sm font-extrabold text-text">Send your saved contact details</p>
                          <p className="mt-1 text-xs font-semibold text-muted">
                            {user.name} {user.phone ? `- ${user.phone}` : ''}
                          </p>
                        </div>
                      ) : (
                        <div className="rounded-2xl bg-surface p-4">
                          <p className="text-sm font-extrabold text-text">Login to send an inquiry</p>
                          <p className="mt-1 text-xs font-semibold text-muted">Your saved name, mobile number, and email will be sent to the associate partner.</p>
                        </div>
                      )}
                      {user && !user.phone && (
                        <input value={lead.phone} onChange={(event) => setLead({ ...lead, phone: event.target.value })} className="rounded-xl border border-border bg-surface px-4 py-3 text-sm" placeholder="Mobile number" required />
                      )}
                      <textarea
                        value={lead.message}
                        onChange={(event) => setLead({ ...lead, message: event.target.value })}
                        className="min-h-24 rounded-xl border border-border bg-surface px-4 py-3 text-sm disabled:opacity-60"
                        placeholder={user ? "Optional message for the associate partner..." : "Please login to write an inquiry message..."}
                        disabled={!user}
                      />
                      <button type="button" onClick={submitLead} className="rounded-xl bg-primary px-4 py-3 text-sm font-extrabold text-white">
                        {user ? 'Send Inquiry with My Details' : 'Login to Send Inquiry'}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-[1.5rem] bg-secondary p-5 text-white shadow-sm md:rounded-[2rem] md:p-6">
                <ShieldCheck size={24} />
                <h3 className="mt-4 text-lg font-extrabold">Buyer safety promise</h3>
                <p className="mt-2 text-sm font-medium leading-6 text-white/75">
                  We verify associate partner details and key property signals before showing them to buyers.
                </p>
              </div>
            </div>
          </aside>
        </div>

        <section className="mt-14">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-extrabold text-text">Similar properties</h2>
              <p className="mt-1 text-sm font-medium text-muted">Suggestions based on city, property type, and investment profile.</p>
            </div>
            <Link href="/listings" className="hidden items-center gap-1 text-sm font-bold text-secondary hover:text-primary sm:flex">
              View all
              <ChevronRight size={16} />
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {suggestions.map((suggestion) => (
              <Link
                key={suggestion.id}
                href={`/property/${suggestion.id}`}
                className="group overflow-hidden rounded-2xl border border-border bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-card"
              >
                <div className="relative h-52 overflow-hidden">
                  <img
                    src={suggestion.image}
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
                  {/* Photo Count Badge */}
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
                    {suggestion.location}
                  </p>
                  <div className="mt-5 flex items-end justify-between gap-4">
                    <div>
                      <p className="text-xl font-extrabold text-text">{suggestion.price}</p>
                      <p className="text-xs font-semibold text-muted">{suggestion.size} - {suggestion.rate}</p>
                    </div>
                    <span className="text-sm font-bold text-secondary">Details</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
      <div className="fixed inset-x-0 bottom-[88px] z-40 border-t border-border bg-white/95 px-4 py-3 shadow-[0_-12px_30px_rgba(15,23,42,0.12)] backdrop-blur-xl md:hidden">
        <div className="mx-auto flex max-w-[420px] items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-extrabold text-text">{activeBroker.name}</p>
            <p className="text-xs font-semibold text-muted">{activeBroker.response}</p>
          </div>
          {user ? (
            <>
              <a
                href={`https://wa.me/${activeBroker.whatsapp}`}
                className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-green-500/20"
                aria-label="WhatsApp associate partner"
              >
                <MessageCircle size={20} />
              </a>
              <a
                href={`tel:+${activeBroker.callNumber}`}
                className="flex h-11 min-w-[86px] flex-shrink-0 items-center justify-center gap-2 rounded-full bg-primary px-4 text-sm font-extrabold text-white shadow-lg shadow-primary/20"
              >
                <Phone size={17} />
                Call
              </a>
            </>
          ) : (
            <button
              type="button"
              onClick={() => navigate.push('/login?from=' + encodeURIComponent(`/property/${id}`))}
              className="flex h-11 flex-shrink-0 items-center justify-center rounded-full bg-primary px-5 text-sm font-extrabold text-white shadow-lg shadow-primary/20"
            >
              Login to contact
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;
