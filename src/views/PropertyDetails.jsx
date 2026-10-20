"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';

import {
  ArrowDown,
  ArrowLeft,
  Award,
  BadgeCheck,
  Building2,
  CalendarDays,
  Camera,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Copy,
  Download,
  Droplets,
  ExternalLink,
  FileDown,
  Heart,
  Layers,
  Mail,
  MessageCircle,
  MapPin,
  Phone,
  Play,
  Route,
  Share2,
  ShieldCheck,
  Video,
  Volume2,
  VolumeX,
  Scale,
  Sparkles,
  Trees,
  Waves,
  Zap,
  Car,
  GraduationCap,
  Hospital,
  Plane,
  ShoppingBag,
  Train
} from 'lucide-react';
import { propertyListings } from '../data/properties';
import { apiRequest } from '../lib/api';
import { adaptProperties, adaptProperty } from '../utils/propertyAdapter';
import { useAuth } from '../context/auth';
import { formatPhoneForLink } from '../utils/phoneUtils';

import EMICalculator from '../components/EMICalculator';
import BrochureModal from '../components/BrochureModal';
import { useCompare } from '../context/CompareContext';

const RoadIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 20L10 4" />
    <path d="M18 20L14 4" />
    <path d="M12 6V8" />
    <path d="M12 11V13" />
    <path d="M12 16V18" />
  </svg>
);

const PowerIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M13 2L4 14H12L11 22L20 10H12L13 2Z" />
  </svg>
);

const SecurityIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <circle cx="12" cy="11" r="1.5" />
    <path d="M12 12.5V15" />
  </svg>
);

const DEFAULT_KEY_LANDMARKS = [
  {
    distance: '5 - 10 Mins',
    title: 'Expressway & Highway',
    subtitle: 'Direct signal-free connectivity to main arterial highway',
    icon: 'Route'
  },
  {
    distance: '15 - 20 Mins',
    title: 'Metro & Transit Station',
    subtitle: 'Rapid transit station with dedicated parking',
    icon: 'Train'
  },
  {
    distance: '10 - 12 Mins',
    title: 'Schools & Hospitals',
    subtitle: 'Top CBSE/IB schools and multispecialty medical care',
    icon: 'Building2'
  },
  {
    distance: '35 - 45 Mins',
    title: 'Airport / Aerocity',
    subtitle: 'Smooth commute via high-speed corridor',
    icon: 'Plane'
  }
];

const renderLandmarkIcon = (iconName, size = 15) => {
  switch (String(iconName || '').toLowerCase()) {
    case 'train':
    case 'metro':
      return <Train size={size} />;
    case 'school':
    case 'graduationcap':
      return <GraduationCap size={size} />;
    case 'hospital':
      return <Hospital size={size} />;
    case 'plane':
    case 'airport':
      return <Plane size={size} />;
    case 'car':
      return <Car size={size} />;
    case 'building':
    case 'building2':
      return <Building2 size={size} />;
    case 'shoppingbag':
    case 'mall':
      return <ShoppingBag size={size} />;
    case 'trees':
    case 'park':
      return <Trees size={size} />;
    case 'mappin':
      return <MapPin size={size} />;
    case 'route':
    default:
      return <Route size={size} />;
  }
};

const ClubhouseIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 19v3" />
    <path d="M4 16c-1.5 0-2-1-2-2.5 0-1.5 1-2.5 2-2.5.2-.8.8-1.5 1.5-1.8C5.8 7.5 7.2 6 9 6c2.2 0 4 1.8 4 4 0 .4-.1.8-.2 1.2 1 .4 1.7 1.4 1.7 2.6 0 1.5-.8 2.2-2 2.2H4z" />
    <path d="M16 11v11" />
    <path d="M22 11v11" />
    <path d="M15 11h8" />
    <path d="M18 11v6" />
    <path d="M20 11v6" />
    <path d="M17 17h4" />
  </svg>
);

const CertificateBadgeIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="13" rx="2" />
    <path d="M7 8h10" />
    <path d="M7 12h6" />
    <path d="M16 17v4l-2-1.5-2 1.5v-4" />
  </svg>
);

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

const getEmbedVideoUrl = (url = '', muted = true) => {
  if (!url || typeof url !== 'string') return null;
  const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/i);
  if (ytMatch) {
    return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&mute=${muted ? 1 : 0}&enablejsapi=1&playsinline=1&rel=0`;
  }
  const vimeoMatch = url.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)/i);
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1&muted=${muted ? 1 : 0}`;
  }
  return null;
};

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
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef(null);
  const navigate = useRouter();
  const { user } = useAuth();
  const { compareList, toggleCompare } = useCompare();

  const [copiedRera, setCopiedRera] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [showBrochureModal, setShowBrochureModal] = useState(false);
  const [selectedPlotSize, setSelectedPlotSize] = useState(null);

  const property = useMemo(() => {
    if (remoteProperty) return remoteProperty;
    if (isMongoId(id)) return null;
    return propertyListings.find((listing) => String(listing.id) === String(id)) || propertyListings[0];
  }, [id, remoteProperty]);

  const isDeveloperAccount = useMemo(() => {
    return Boolean(
      property?.isDeveloperAccount ||
      property?.isDeveloperListing ||
      property?.broker?.companyType === 'developer' ||
      property?.broker?.brokerProfile?.companyType === 'developer' ||
      property?.broker?.role === 'developer'
    );
  }, [property]);

  const availablePlotSizes = useMemo(() => {
    if (Array.isArray(property?.availableSizes) && property.availableSizes.length > 0) {
      return property.availableSizes;
    }
    if (Array.isArray(property?.plotSizes) && property.plotSizes.length > 0) {
      return property.plotSizes.map((s) => {
        const numMatch = String(s).match(/(\d+(?:\.\d+)?)/);
        const num = numMatch ? Number(numMatch[1]) : 0;
        return {
          size: num,
          unit: 'Sq. Yrd',
          priceLabel: ''
        };
      }).filter((s) => s.size > 0);
    }
    const desc = String(property?.description || '');
    const sizeMatch = desc.match(/(?:plot\s*sizes?|sizes?|available\s*sizes?)\s*[:\-–]\s*([^\n\r]+)/i);
    if (sizeMatch) {
      const nums = sizeMatch[1].match(/\d+/g);
      if (nums && nums.length > 1) {
        return nums.map((n) => ({ size: Number(n), unit: 'Sq. Yrd' }));
      }
    }
    if (isDeveloperAccount && property?.sizeValue) {
      const base = Number(property.sizeValue);
      const set = [base, Math.round(base * 1.25), Math.round(base * 1.5), Math.round(base * 1.75)];
      return set.map((s) => ({
        size: s,
        unit: 'Sq. Yrd'
      }));
    }
    return [];
  }, [property, isDeveloperAccount]);

  const activePlotVariant = useMemo(() => {
    if (!availablePlotSizes.length) return null;
    if (!selectedPlotSize) return availablePlotSizes[0];
    return availablePlotSizes.find((s) => s.size === selectedPlotSize) || availablePlotSizes[0];
  }, [selectedPlotSize, availablePlotSizes]);

  const parsedDetails = useMemo(() => {
    const raw = String(property?.description || '').trim();
    const regex = /(?:^|\s|\n)(Project|Location|Developer|Builder|Project Type|Scheme|Total Area|Total Plots|Plots|RERA Approval|RERA Completion Date|Possession Date|Possession|RERA)\s*[:\-–]\s*([^\n\r]+?)(?=(?:\s+(?:Project|Location|Developer|Builder|Project Type|Scheme|Total Area|Total Plots|Plots|RERA Approval|RERA Completion Date|Possession Date|Possession|RERA)\s*[:\-–])|$)/gi;
    const extracted = {};
    let m;
    while ((m = regex.exec(raw)) !== null) {
      extracted[m[1].toLowerCase().replace(/\s+/g, '_')] = m[2].trim();
    }

    let titleDev = '';
    const titleStr = String(property?.title || '').trim();
    const titleMatch = titleStr.match(/^(Uppal|Aayan|DLF|Godrej|BPTP|M3M|Signature\s*Global|Signature|Vatika|Omaxe|Sobha|Prestige|Brigade|Emaar|Lodha|Gaurs|ATS|Supertech|Paras|Bestech|Puri|Hero|Whiteland|Trehan|Central\s*Park)\b/i);
    if (titleMatch) {
      const brand = titleMatch[1].trim();
      const lower = brand.toLowerCase();
      if (['dlf', 'bptp', 'm3m', 'ats'].includes(lower)) {
        titleDev = brand.toUpperCase();
      } else if (lower.includes('group') || lower.includes('properties') || lower.includes('global')) {
        titleDev = brand;
      } else {
        titleDev = `${brand} Group`;
      }
    }

    const developer = isDeveloperAccount
      ? ((property?.builderName && String(property.builderName).trim()) ||
         property?.broker?.brokerProfile?.companyName ||
         property?.broker?.name ||
         extracted['developer'] ||
         extracted['builder'] ||
         titleDev ||
         'Reputed Developer')
      : '';

    let totalArea = extracted['total_area'] || property?.size || '18.325 acres';
    totalArea = totalArea.replace(/^लगभग\s*/i, '').trim();
    if (!totalArea.toLowerCase().includes('acre') && !totalArea.toLowerCase().includes('sq')) {
      totalArea += ' acres';
    }

    let plots = extracted['total_plots'] || extracted['plots'] || '~311 residential';
    plots = plots.replace(/^लगभग\s*/i, '~').trim();
    if (/^\d+$/.test(plots)) {
      plots = `~${plots} residential`;
    }

    let scheme = extracted['scheme'] || (property?.propertyType === 'plot' ? 'DDJAY' : 'Freehold');
    const schemeParen = scheme.match(/\(([^)]+)\)/);
    const schemeShort = schemeParen ? schemeParen[1] : scheme;

    const reraNumber = extracted['rera'] || property?.reraNumber || '';
    
    let reraApproval = extracted['rera_approval'] || '21 Mar 2025';
    reraApproval = reraApproval.replace(/January/i, 'Jan')
      .replace(/February/i, 'Feb')
      .replace(/March/i, 'Mar')
      .replace(/April/i, 'Apr')
      .replace(/August/i, 'Aug')
      .replace(/September/i, 'Sep')
      .replace(/October/i, 'Oct')
      .replace(/November/i, 'Nov')
      .replace(/December/i, 'Dec');

    let possession = extracted['rera_completion_date'] || extracted['possession_date'] || extracted['possession'] || '12 Nov 2029';
    possession = possession.replace(/January/i, 'Jan')
      .replace(/February/i, 'Feb')
      .replace(/March/i, 'Mar')
      .replace(/April/i, 'Apr')
      .replace(/August/i, 'Aug')
      .replace(/September/i, 'Sep')
      .replace(/October/i, 'Oct')
      .replace(/November/i, 'Nov')
      .replace(/December/i, 'Dec');

    const projectName = extracted['project'] || property?.title || '';
    const extractedLoc = extracted['location'] || '';

    let cleanDescription = raw;
    cleanDescription = cleanDescription.replace(/^(?:🏡|\ud83c\udfe1)?\s*.*Key Details.*$/gim, '');
    cleanDescription = cleanDescription.replace(/(?:^|\s|\n)(?:Project|Location|Developer|Builder|Project Type|Scheme|Total Area|Total Plots|Plots|RERA Approval|RERA Completion Date|Possession Date|Possession|RERA)\s*[:\-–]\s*[^\n\r]+/gi, '');
    cleanDescription = cleanDescription.trim();

    return {
      projectName,
      extractedLoc,
      developer,
      totalArea,
      plots,
      scheme: schemeShort,
      schemeFull: scheme,
      reraNumber,
      reraApproval,
      possession,
      cleanDescription
    };
  }, [property, isDeveloperAccount]);

  const displayTitle = useMemo(() => {
    if (parsedDetails.projectName) return parsedDetails.projectName;
    return String(property?.title || 'Mayur City').replace(/^RERA Approved Plots\s*[-–:]\s*/i, '');
  }, [parsedDetails.projectName, property?.title]);

  const displayLocation = useMemo(() => {
    if (parsedDetails.extractedLoc) {
      return parsedDetails.extractedLoc.replace(/^Village\s+[^,]+,\s*/i, '');
    }
    return property?.location || 'Sector 27, Jhajjar, Haryana';
  }, [parsedDetails.extractedLoc, property?.location]);

  const verifiedDocsList = useMemo(() => {
    const customDocs = property?.documentsVerified?.filter(Boolean) || [];
    if (customDocs.length > 0) {
      return customDocs.map(d => {
        let title = d;
        if (/rera/i.test(d)) title = 'RERA copy';
        else if (/layout|plan|demarcation/i.test(d)) title = 'Layout plan';
        else if (/title/i.test(d)) title = 'Clear title';
        else if (/registration/i.test(d)) title = 'Ready registration';
        return {
          title,
          subtitle: 'Verified 02 Oct 2026'
        };
      });
    }
    return [
      { title: 'RERA copy', subtitle: 'Verified 02 Oct 2026' },
      { title: 'Layout plan', subtitle: 'Verified 02 Oct 2026' },
      { title: 'Clear title', subtitle: 'Verified 02 Oct 2026' }
    ];
  }, [property]);

  const displayAmenities = useMemo(() => {
    const list = property?.amenities?.length ? property.amenities : [
      'Blacktop roads',
      'Underground power',
      '24/7 security',
      'Clubhouse and play area'
    ];
    return list;
  }, [property]);

  const getAmenityIcon = (name = '') => {
    const n = name.toLowerCase();
    if (n.includes('road')) return <RoadIcon className="h-6 w-6 text-gray-800" />;
    if (n.includes('power') || n.includes('electric') || n.includes('light')) return <PowerIcon className="h-6 w-6 text-gray-800" />;
    if (n.includes('security') || n.includes('guard') || n.includes('cctv')) return <SecurityIcon className="h-6 w-6 text-gray-800" />;
    if (n.includes('club') || n.includes('play') || n.includes('park') || n.includes('tree') || n.includes('garden')) return <ClubhouseIcon className="h-6 w-6 text-gray-800" />;
    if (n.includes('water')) return <Droplets className="h-6 w-6 text-gray-800" />;
    if (n.includes('drain')) return <Waves className="h-6 w-6 text-gray-800" />;
    return <CheckCircle2 className="h-6 w-6 text-gray-800" />;
  };

  const reraVerifyUrl = useMemo(() => {
    const num = parsedDetails.reraNumber || property?.reraNumber || '';
    if (!num) return 'https://haryanarera.gov.in/';
    if (/hrera/i.test(num) || (property?.location && /haryana/i.test(property.location))) {
      return 'https://haryanarera.gov.in/';
    }
    return `https://www.google.com/search?q=${encodeURIComponent(num + ' RERA official verification')}`;
  }, [parsedDetails.reraNumber, property]);

  const handleCopyRera = async () => {
    const num = parsedDetails.reraNumber || property?.reraNumber || '';
    if (!num) return;
    try {
      await navigator.clipboard.writeText(num);
      setCopiedRera(true);
      setTimeout(() => setCopiedRera(false), 2000);
    } catch {
      // ignore clipboard error
    }
  };

  const scrollToSection = (sectionId) => {
    setActiveTab(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 85;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const formattedPrice = useMemo(() => {
    if (!property?.price) return 'Price on request';
    return String(property.price).replace(/^Rs\.?\s*/i, '₹');
  }, [property?.price]);

  const displayPrice = useMemo(() => {
    if (selectedPlotSize && activePlotVariant) {
      if (activePlotVariant.priceLabel) return activePlotVariant.priceLabel;
      if (activePlotVariant.price > 0) {
        return activePlotVariant.price > 9999999
          ? `₹${(activePlotVariant.price / 10000000).toFixed(2)} Cr`
          : `₹${(activePlotVariant.price / 100000).toFixed(2)} L`;
      }
      if (property?.priceValue > 0 && property?.sizeValue > 0) {
        const computed = Math.round((property.priceValue / property.sizeValue) * activePlotVariant.size);
        return computed > 9999999
          ? `₹${(computed / 10000000).toFixed(2)} Cr`
          : `₹${(computed / 100000).toFixed(2)} L`;
      }
    }
    return formattedPrice;
  }, [selectedPlotSize, activePlotVariant, formattedPrice, property?.priceValue, property?.sizeValue]);

  const displaySizeLabel = useMemo(() => {
    if (selectedPlotSize && activePlotVariant) {
      return `${activePlotVariant.size} ${activePlotVariant.unit || 'sq yd'}`;
    }
    return property?.size ? property.size.toLowerCase().replace(/sq\.?\s*yrd/i, 'sq yd') : '';
  }, [selectedPlotSize, activePlotVariant, property?.size]);

  const formattedRate = useMemo(() => {
    if (!property?.rate) return '';
    return String(property.rate).replace(/^Rs\.?\s*/i, '₹').replace(/sq\.?\s*yrd/i, 'sq yd');
  }, [property?.rate]);

  const propertyImages = useMemo(() => {
    const urls = property?.images?.map((item) => (typeof item === 'string' ? item : item?.url)).filter(Boolean) || [];
    return urls.length ? urls : (property?.image ? [property.image] : galleryImages);
  }, [property]);

  const propertyVideos = useMemo(() => {
    const raw = Array.isArray(property?.videos)
      ? property.videos
      : (property?.videoUrl ? [{ url: property.videoUrl, title: 'Video Tour' }] : (property?.video ? [{ url: property.video, title: 'Video Tour' }] : []));
    return raw
      .map((v, i) => {
        const url = typeof v === 'string' ? v : v?.url;
        const title = (typeof v === 'object' && v?.title) ? v.title : `Video Walkthrough ${i + 1}`;
        return url ? { type: 'video', url, title } : null;
      })
      .filter(Boolean);
  }, [property]);

  const mediaItems = useMemo(() => {
    const items = [];
    const imgItems = propertyImages.map((url, i) => ({ type: 'image', url, title: `Photo ${i + 1}` }));
    if (propertyVideos.length > 0) {
      // Video is 1st number pe
      propertyVideos.forEach((v) => items.push(v));
      // Then images start after video
      imgItems.forEach((img) => items.push(img));
    } else {
      imgItems.forEach((img) => items.push(img));
    }
    return items.length ? items : galleryImages.map((url, i) => ({ type: 'image', url, title: `Photo ${i + 1}` }));
  }, [propertyImages, propertyVideos]);

  const firstVideoIndex = useMemo(() => {
    return mediaItems.findIndex((item) => item.type === 'video');
  }, [mediaItems]);

  const firstPhotoIndex = useMemo(() => {
    return mediaItems.findIndex((item) => item.type === 'image');
  }, [mediaItems]);

  const currentMedia = mediaItems[currentImageIndex] || mediaItems[0] || { type: 'image', url: propertyImages[0] };
  const heroBackdrop = propertyImages[0] || galleryImages[0];

  const sideThumbnails = useMemo(() => {
    return mediaItems
      .map((item, index) => ({ item, index }))
      .filter(({ index }) => index !== currentImageIndex)
      .slice(0, 3);
  }, [mediaItems, currentImageIndex]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
      if (currentMedia.type === 'video') {
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            // Autoplay policy handled
          });
        }
      }
    }
  }, [isMuted, currentImageIndex, currentMedia]);

  const toggleMute = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (videoRef.current) {
      videoRef.current.muted = nextMuted;
      if (!nextMuted) {
        videoRef.current.volume = 1.0;
        videoRef.current.play().catch(() => {});
      }
    }
    const iframe = document.getElementById('property-embed-video');
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage(
        JSON.stringify({
          event: 'command',
          func: nextMuted ? 'mute' : 'unMute',
          args: []
        }),
        '*'
      );
    }
  };

  const activeBroker = useMemo(() => {
    const isDev = Boolean(property?.isDeveloperListing);
    const builderContact = property?.builderContact || {};
    const broker = property?.broker || defaultBroker;
    const phone = (isDev && builderContact.phone) ? builderContact.phone : (broker.brokerProfile?.contactPhone || broker.phone || '');
    const whatsapp = (isDev && builderContact.whatsapp) ? builderContact.whatsapp : (broker.whatsapp || phone || defaultBroker.whatsapp);
    const name = (isDev && property?.builderName) ? property.builderName : (broker.brokerProfile?.companyName || broker.name || defaultBroker.name);

    return {
      ...broker,
      name,
      phone: phone || defaultBroker.phone,
      whatsapp: formatPhoneForLink(whatsapp),
      callNumber: formatPhoneForLink(phone || defaultBroker.phone),
      companyName: name,
      experience: broker.brokerProfile?.experience || defaultBroker.experience,
      isDeveloper: isDev,
      email: (isDev && builderContact.email) ? builderContact.email : (broker.email || ''),
      address: (isDev && builderContact.address) ? builderContact.address : (broker.brokerProfile?.businessAddress || '')
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

  const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % mediaItems.length);
  const prevImage = () => setCurrentImageIndex((prev) => (prev === 0 ? mediaItems.length - 1 : prev - 1));

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

  const handleDirectChat = async (e) => {
    e.preventDefault();

    if (isMongoId(property.id)) {
      try {
        await apiRequest('/inquiries', {
          method: 'POST',
          body: {
            propertyId: property.id,
            name: user?.name || 'Guest Buyer',
            phone: user?.phone || `Direct WhatsApp Click`,
            email: user?.email || 'guest@plotyards.com',
            message: 'User initiated direct chat via WhatsApp button',
            isDirectChat: true
          }
        });
      } catch (err) {
        console.error('Failed to log inquiry:', err);
      }
    }
    const message = encodeURIComponent(`Hi, I am interested in your property "${property.title}" listed on Plotyards.`);
    window.open(`https://wa.me/${formatPhoneForLink(activeBroker.whatsapp || activeBroker.phone)}?text=${message}`, '_blank');
  };

  const handleDownloadBrochure = () => {
    setShowBrochureModal(true);
  };

  const handleRequestBrochureOnWhatsApp = async () => {
    if (property?.id && isMongoId(property.id)) {
      try {
        await apiRequest('/inquiries', {
          method: 'POST',
          body: {
            propertyId: property.id,
            name: user?.name || 'Guest Buyer',
            phone: user?.phone || 'Brochure Request',
            email: user?.email || 'guest@plotyards.com',
            message: 'User requested official brochure on WhatsApp',
            isDirectChat: true
          }
        });
      } catch (err) {
        console.error('Failed to log inquiry:', err);
      }
    }
    const message = encodeURIComponent(
      `Hi, please share the official PDF brochure, master layout and location distance details for "${property.title}" listed on Plotyards.`
    );
    window.open(`https://wa.me/${formatPhoneForLink(activeBroker.whatsapp || activeBroker.phone)}?text=${message}`, '_blank');
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
    const interval = setInterval(loadProperty, 30000);

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
    <div className="min-h-screen pb-44 pt-4 font-sans md:pb-16 md:pt-28 relative bg-surface text-text">
      {/* Subtle builder luxury warm ambient glow */}
      {isDeveloperAccount && (
        <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-amber-500/[0.04] via-transparent to-transparent pointer-events-none" />
      )}
      
      <div className="container relative z-10 mx-auto max-w-[1440px] px-6 lg:px-12">
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
                compareList.some(p => String(p.id) === String(property.id))
                  ? 'border-primary bg-primary text-white'
                  : 'border-border text-muted hover:border-primary hover:text-primary'
              }`}
              title="Compare Property"
            >
              <Scale size={18} />
            </button>
            <button
              onClick={handleDirectChat}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-white shadow-sm transition-colors hover:border-[#25D366] hover:text-[#25D366] text-muted"
              title="Direct to WhatsApp"
            >
              <MessageCircle size={18} className="text-[#25D366]" />
            </button>
          </div>
        </div>

        {/* Top Property Images & Videos Banner */}
        <section 
          id="gallery" 
          className={`mb-5 overflow-hidden rounded-[1.5rem] border p-2 md:mb-8 md:rounded-[2rem] md:p-3.5 transition-all bg-white ${
            isDeveloperAccount
              ? 'border-amber-200/90 shadow-[0_8px_30px_rgba(212,175,55,0.08)]'
              : 'border-border shadow-sm'
          }`}
        >
          <div className="flex h-[320px] sm:h-[380px] flex-col gap-3 md:h-[460px] lg:flex-row lg:gap-4">
            {/* Main Carousel Media Viewport */}
            <div className="group relative h-full w-full flex-1 overflow-hidden rounded-[1.25rem] bg-black md:rounded-[1.5rem]">
              {/* Blurred backdrop */}
              <img
                src={currentMedia.type === 'image' ? currentMedia.url : heroBackdrop}
                alt="backdrop"
                className="absolute inset-0 h-full w-full object-cover blur-2xl opacity-40 scale-110 pointer-events-none"
              />

              {/* Main Media: Video or Image */}
              {currentMedia.type === 'video' ? (
                getEmbedVideoUrl(currentMedia.url, isMuted) ? (
                  <iframe
                    id="property-embed-video"
                    key={`${currentMedia.url}-${isMuted}`}
                    src={getEmbedVideoUrl(currentMedia.url, isMuted)}
                    title={currentMedia.title || "Property Video Walkthrough"}
                    className="absolute inset-0 h-full w-full z-10 border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video
                    ref={videoRef}
                    key={currentMedia.url}
                    src={currentMedia.url}
                    controls
                    autoPlay
                    muted={isMuted}
                    playsInline
                    onEnded={nextImage}
                    className="absolute inset-0 h-full w-full object-contain z-10 bg-black/90"
                  />
                )
              ) : (
                <img
                  key={currentMedia.url}
                  src={currentMedia.url}
                  alt={`${property.title} view ${currentImageIndex + 1}`}
                  className="absolute inset-0 h-full w-full object-contain transition-all duration-300"
                />
              )}

              {/* In-box Unmute / Mute Toggle Button */}
              {currentMedia.type === 'video' && (
                <button
                  type="button"
                  onClick={toggleMute}
                  className="absolute top-4 left-4 z-30 flex items-center gap-2 rounded-full bg-black/75 hover:bg-black/90 text-white px-3.5 py-1.5 text-xs font-bold backdrop-blur-md transition-all shadow-lg border border-white/25 hover:border-white/50 hover:scale-105 active:scale-95 cursor-pointer"
                  aria-label={isMuted ? "Unmute video" : "Mute video"}
                  title={isMuted ? "Click to Unmute" : "Click to Mute"}
                >
                  {isMuted ? (
                    <>
                      <VolumeX size={15} className="text-red-400 animate-pulse" />
                      <span>Unmute</span>
                    </>
                  ) : (
                    <>
                      <Volume2 size={15} className="text-emerald-400" />
                      <span>Mute</span>
                    </>
                  )}
                </button>
              )}

              {/* Quick Jump Switchers: Photos / Video Tour */}
              {propertyVideos.length > 0 && (
                <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
                  {firstPhotoIndex !== -1 && (
                    <button
                      type="button"
                      onClick={() => setCurrentImageIndex(firstPhotoIndex)}
                      className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-black backdrop-blur-md transition-all shadow-md cursor-pointer ${
                        currentMedia.type === 'image'
                          ? 'bg-white text-text shadow-black/20 scale-105'
                          : 'bg-black/60 text-white hover:bg-black/80'
                      }`}
                    >
                      <Camera size={13} />
                      Photos ({propertyImages.length})
                    </button>
                  )}
                  {firstVideoIndex !== -1 && (
                    <button
                      type="button"
                      onClick={() => setCurrentImageIndex(firstVideoIndex)}
                      className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-black backdrop-blur-md transition-all shadow-md cursor-pointer ${
                        currentMedia.type === 'video'
                          ? 'bg-primary text-white shadow-primary/30 ring-2 ring-white/30 scale-105'
                          : 'bg-black/60 text-white hover:bg-black/80'
                      }`}
                    >
                      <Play size={13} className="fill-current text-white" />
                      Video Tour ({propertyVideos.length})
                    </button>
                  )}
                </div>
              )}

              {/* Navigation Arrows & Indicators */}
              {mediaItems.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-text p-2 rounded-full shadow-md backdrop-blur transition-all md:opacity-0 group-hover:opacity-100 z-20 cursor-pointer"
                    aria-label="Previous media"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button
                    type="button"
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-text p-2 rounded-full shadow-md backdrop-blur transition-all md:opacity-0 group-hover:opacity-100 z-20 cursor-pointer"
                    aria-label="Next media"
                  >
                    <ChevronRight size={24} />
                  </button>
                  <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
                    {mediaItems.map((item, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setCurrentImageIndex(i)}
                        className={`h-1.5 rounded-full transition-all cursor-pointer ${
                          i === currentImageIndex
                            ? 'w-4 bg-primary'
                            : item.type === 'video'
                            ? 'w-2 bg-amber-400'
                            : 'w-1.5 bg-white/60'
                        }`}
                        title={item.title}
                      />
                    ))}
                  </div>
                </>
              )}

              <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent p-4 md:p-5 z-20">
                <div className="flex flex-wrap items-center justify-between gap-2 pointer-events-auto">
                  <div className="flex flex-wrap items-center gap-2">
                    {property.featured && (
                      <span className="rounded-full bg-primary px-3 py-1 text-xs font-extrabold text-white shadow-sm">
                        Featured Project
                      </span>
                    )}
                    {property.isDemo && (
                      <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-extrabold text-amber-700">
                        This is a demo property
                      </span>
                    )}
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-extrabold shadow-sm ${
                      isDeveloperAccount
                        ? 'bg-white/95 text-slate-900 border border-amber-300 backdrop-blur-md'
                        : 'bg-white text-text'
                    }`}>
                      <ShieldCheck size={14} className={isDeveloperAccount ? 'text-amber-600' : 'text-primary'} />
                      {isDeveloperAccount ? 'Official Builder Verified' : 'Associate Partner verified'}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-extrabold text-text shadow-sm">
                      <Camera size={13} />
                      {propertyImages.length} photos
                    </span>
                    {propertyVideos.length > 0 && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-extrabold text-white shadow-sm">
                        <Play size={11} className="fill-current text-white" />
                        {propertyVideos.length} {propertyVideos.length === 1 ? 'video tour' : 'video tours'}
                      </span>
                    )}
                  </div>

                  {currentMedia.type === 'video' && (
                    <button
                      type="button"
                      onClick={toggleMute}
                      className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-white/95 hover:bg-white text-slate-900 px-3.5 py-1.5 text-xs font-extrabold backdrop-blur-md transition-all shadow-md hover:scale-105 active:scale-95 cursor-pointer ml-auto"
                      title={isMuted ? "Click to Unmute" : "Click to Mute"}
                    >
                      {isMuted ? (
                        <>
                          <VolumeX size={15} className="text-red-500" />
                          <span>Unmute</span>
                        </>
                      ) : (
                        <>
                          <Volume2 size={15} className="text-emerald-600" />
                          <span>Mute</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Desktop Side Thumbnails */}
            {sideThumbnails.length > 0 && (
              <div className="hidden lg:flex flex-col gap-3.5 w-[320px] h-full">
                {sideThumbnails.map(({ item, index: targetIndex }, slotIndex) => {
                  const isCurrent = currentImageIndex === targetIndex;
                  return (
                    <div 
                      key={`thumb-${item.url}-${targetIndex}`} 
                      onClick={() => setCurrentImageIndex(targetIndex)}
                      className={`relative flex-1 w-full overflow-hidden rounded-2xl cursor-pointer group bg-black transition-all ${
                        isCurrent ? 'ring-2 ring-primary ring-offset-2' : ''
                      }`}
                    >
                      {item.type === 'video' ? (
                        <>
                          <video
                            src={item.url}
                            preload="metadata"
                            muted
                            playsInline
                            className="absolute inset-0 h-full w-full object-cover opacity-60 group-hover:opacity-75 transition-all duration-500 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-black/35 group-hover:bg-black/15 transition-colors flex flex-col items-center justify-center">
                            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/40 group-hover:scale-110 transition-transform">
                              <Play size={20} className="fill-current ml-0.5" />
                            </div>
                            <span className="mt-1 text-[11px] font-black uppercase tracking-wider text-white drop-shadow">
                              Video Tour
                            </span>
                          </div>
                        </>
                      ) : (
                        <>
                          <img
                            src={item.url}
                            alt={`Thumbnail ${targetIndex + 1}`}
                            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                        </>
                      )}
                      {slotIndex === 2 && mediaItems.length > 4 && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/65 text-sm font-extrabold text-white backdrop-blur-sm hover:bg-black/75 transition-colors z-20">
                          +{mediaItems.length - 4} more
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        <div className="grid grid-cols-1 gap-5 md:gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
          <main className="space-y-5 md:space-y-8">
            <section 
              id="overview" 
              className={`relative rounded-[1.5rem] border p-5 md:p-8 lg:p-9 transition-all ${
                isDeveloperAccount
                  ? 'border-amber-200/90 bg-white shadow-[0_10px_35px_-5px_rgba(212,175,55,0.08)]'
                  : 'border-border bg-white shadow-sm'
              }`}
            >
              {/* Top Navigation Tabs */}
              <div className={`flex items-center gap-6 md:gap-8 overflow-x-auto no-scrollbar border-b pb-3 text-sm ${
                isDeveloperAccount ? 'border-amber-100' : 'border-border/80'
              }`}>
                {[
                  { id: 'overview', label: 'Overview' },
                  { id: 'siteplan', label: 'Site plan' },
                  { id: 'documents', label: 'Documents' },
                  { id: 'brochure', label: 'Brochure' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => scrollToSection(tab.id)}
                    className={`relative pb-3 -mb-3 transition-colors whitespace-nowrap cursor-pointer text-sm ${
                      activeTab === tab.id
                        ? isDeveloperAccount
                          ? 'text-amber-900 font-extrabold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:bg-gradient-to-r after:from-amber-500 after:to-amber-600 after:rounded-full'
                          : 'text-text font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:bg-primary after:rounded-full'
                        : isDeveloperAccount
                          ? 'text-slate-600 font-medium hover:text-amber-800'
                          : 'text-muted font-medium hover:text-text'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* RERA Approved Badge / Scheme */}
              {isDeveloperAccount ? (
                <div className="mt-6 md:mt-7 flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50/90 px-3.5 py-1 text-xs font-black tracking-wider text-amber-900 uppercase shadow-xs">
                    <Building2 size={13} className="text-amber-600" />
                    {parsedDetails.scheme ? `OFFICIAL TOWNSHIP • ${parsedDetails.scheme}` : 'OFFICIAL BUILDER TOWNSHIP'}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50/90 px-3 py-1 text-xs font-bold text-emerald-800 shadow-xs">
                    <CheckCircle2 size={12} className="text-emerald-600" /> Direct Builder Inventory
                  </span>
                </div>
              ) : (
                <p className="mt-6 md:mt-7 text-xs font-bold uppercase tracking-wider text-secondary">
                  {parsedDetails.scheme ? `RERA APPROVED PLOTTED TOWNSHIP • ${parsedDetails.scheme}` : 'RERA APPROVED PLOTTED TOWNSHIP'}
                </p>
              )}

              {/* Title, Location & Price */}
              <div className="mt-2.5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h1 className={`font-serif text-3xl font-extrabold tracking-tight md:text-4xl lg:text-[40px] leading-tight ${
                    isDeveloperAccount ? 'text-slate-900' : 'text-text'
                  }`}>
                    {displayTitle}
                  </h1>
                  <p className={`mt-1.5 flex items-center gap-1.5 text-sm font-medium md:text-base ${
                    isDeveloperAccount ? 'text-slate-600' : 'text-muted'
                  }`}>
                    <MapPin size={16} className={`shrink-0 ${isDeveloperAccount ? 'text-amber-600' : 'text-muted'}`} />
                    <span>{displayLocation}</span>
                  </p>
                </div>

                <div className="text-left sm:text-right shrink-0">
                  <p className={`text-xs font-bold uppercase tracking-wider ${
                    isDeveloperAccount ? 'text-amber-800' : 'text-muted'
                  }`}>
                    {selectedPlotSize ? `Selected (${displaySizeLabel})` : 'Starting from'}
                  </p>
                  <p className={`mt-0.5 text-2xl font-black md:text-3xl lg:text-[34px] tracking-tight ${
                    isDeveloperAccount 
                      ? 'text-slate-950 font-black' 
                      : 'text-text font-bold'
                  }`}>
                    {displayPrice}
                  </p>
                  <p className={`mt-0.5 text-xs font-medium md:text-sm ${
                    isDeveloperAccount ? 'text-slate-500' : 'text-muted'
                  }`}>
                    {formattedRate}{displaySizeLabel ? ` · ${displaySizeLabel}` : ''}
                  </p>
                </div>
              </div>

              {/* 6-box specs grid */}
              <div className={`mt-6 md:mt-8 overflow-hidden rounded-2xl border transition-all ${
                isDeveloperAccount
                  ? 'border-amber-200/80 bg-slate-50/70 shadow-xs'
                  : 'border-border bg-white shadow-xs'
              }`}>
                <div className={`grid grid-cols-3 divide-x border-b ${
                  isDeveloperAccount ? 'divide-slate-200/80 border-slate-200/80' : 'divide-border border-border'
                }`}>
                  <div className="p-3 sm:p-4 md:p-5 min-w-0">
                    <p className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-wider truncate ${
                      isDeveloperAccount ? 'text-amber-800' : 'text-muted'
                    }`}>
                      {isDeveloperAccount ? 'DEVELOPER' : 'LISTED BY'}
                    </p>
                    <p className={`mt-1 text-xs sm:text-sm md:text-base font-bold truncate ${
                      isDeveloperAccount ? 'text-slate-900 font-extrabold' : 'text-text'
                    }`}>
                      {isDeveloperAccount ? (parsedDetails.developer || 'Reputed Developer') : 'Associate Partner'}
                    </p>
                  </div>
                  <div className="p-3 sm:p-4 md:p-5 min-w-0">
                    <p className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-wider truncate ${
                      isDeveloperAccount ? 'text-amber-800' : 'text-muted'
                    }`}>
                      {availablePlotSizes.length > 1 ? 'PLOT SIZES' : 'TOTAL AREA'}
                    </p>
                    <p className={`mt-1 text-xs sm:text-sm md:text-base font-bold truncate ${
                      isDeveloperAccount ? 'text-slate-900 font-extrabold' : 'text-text'
                    }`}>
                      {availablePlotSizes.length > 1
                        ? `${availablePlotSizes[0].size} - ${availablePlotSizes[availablePlotSizes.length - 1].size} Sq. Yrd`
                        : parsedDetails.totalArea}
                    </p>
                  </div>
                  <div className="p-3 sm:p-4 md:p-5 min-w-0">
                    <p className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-wider truncate ${
                      isDeveloperAccount ? 'text-amber-800' : 'text-muted'
                    }`}>PLOTS</p>
                    <p className={`mt-1 text-xs sm:text-sm md:text-base font-bold truncate ${
                      isDeveloperAccount ? 'text-slate-900 font-extrabold' : 'text-text'
                    }`}>{parsedDetails.plots}</p>
                  </div>
                </div>

                <div className={`grid grid-cols-3 divide-x ${
                  isDeveloperAccount ? 'divide-slate-200/80' : 'divide-border'
                }`}>
                  <div className="p-3 sm:p-4 md:p-5 min-w-0">
                    <p className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-wider truncate ${
                      isDeveloperAccount ? 'text-amber-800' : 'text-muted'
                    }`}>SCHEME</p>
                    <p className={`mt-1 text-xs sm:text-sm md:text-base font-bold truncate ${
                      isDeveloperAccount ? 'text-slate-900 font-extrabold' : 'text-text'
                    }`}>{parsedDetails.scheme}</p>
                  </div>
                  <div className="p-3 sm:p-4 md:p-5 min-w-0">
                    <p className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-wider truncate ${
                      isDeveloperAccount ? 'text-amber-800' : 'text-muted'
                    }`}>RERA APPROVAL</p>
                    <p className={`mt-1 text-xs sm:text-sm md:text-base font-bold truncate ${
                      isDeveloperAccount ? 'text-slate-900 font-extrabold' : 'text-text'
                    }`}>{parsedDetails.reraApproval}</p>
                  </div>
                  <div className="p-3 sm:p-4 md:p-5 min-w-0">
                    <p className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-wider truncate ${
                      isDeveloperAccount ? 'text-amber-800' : 'text-muted'
                    }`}>POSSESSION</p>
                    <p className={`mt-1 text-xs sm:text-sm md:text-base font-bold truncate ${
                      isDeveloperAccount ? 'text-slate-900 font-extrabold' : 'text-text'
                    }`}>{parsedDetails.possession}</p>
                  </div>
                </div>
              </div>

              {/* RERA line */}
              <div className="mt-3.5 flex flex-wrap items-center gap-2 text-xs md:text-sm">
                <CertificateBadgeIcon className={`h-5 w-5 shrink-0 ${isDeveloperAccount ? 'text-amber-600' : 'text-secondary'}`} />
                <span className={`font-semibold tracking-tight ${isDeveloperAccount ? 'text-slate-900' : 'text-text'}`}>
                  {parsedDetails.reraNumber || property.reraNumber || 'HRERA-PKL-JJR-678-2025'}
                </span>
                <button
                  type="button"
                  onClick={handleCopyRera}
                  className={`p-1 transition-colors rounded ${isDeveloperAccount ? 'text-slate-500 hover:text-slate-900' : 'text-muted hover:text-text'}`}
                  title="Copy RERA Number"
                >
                  {copiedRera ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                </button>
                {copiedRera && <span className="text-xs font-semibold text-emerald-600">Copied!</span>}
                <a
                  href={reraVerifyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`font-bold ml-1.5 inline-flex items-center gap-1 hover:underline transition-colors ${
                    isDeveloperAccount ? 'text-amber-700 hover:text-amber-900' : 'text-secondary hover:text-primary'
                  }`}
                >
                  Verify on HRERA
                </a>
              </div>

              {/* Available Plot Sizes in this Project */}
              {availablePlotSizes.length > 0 && (
                <div className={`mt-6 md:mt-7 rounded-2xl border p-4 sm:p-5 transition-all ${
                  isDeveloperAccount
                    ? 'border-amber-200/90 bg-gradient-to-br from-amber-50/50 via-white to-amber-50/20 shadow-xs'
                    : 'border-border bg-gray-50/80'
                }`}>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`flex h-6 w-6 items-center justify-center rounded-lg ${
                          isDeveloperAccount ? 'bg-amber-100 text-amber-700' : 'bg-primary/10 text-primary'
                        }`}>
                          <Layers size={14} />
                        </span>
                        <h3 className={`text-sm sm:text-base font-bold ${isDeveloperAccount ? 'text-slate-900' : 'text-text'}`}>
                          Available Plot Sizes (Plot Configurations)
                        </h3>
                      </div>
                      <p className={`mt-0.5 text-xs font-medium ${isDeveloperAccount ? 'text-slate-500' : 'text-muted'}`}>
                        Builder offers different plot sizes in this layout. Select a size to view pricing:
                      </p>
                    </div>
                    {availablePlotSizes.length > 1 && (
                      <span className={`text-xs font-extrabold px-2.5 py-1 rounded-full ${
                        isDeveloperAccount
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-primary/10 text-primary'
                      }`}>
                        {availablePlotSizes.length} Sizes Available
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                    {availablePlotSizes.map((variant, idx) => {
                      const isSelected = (activePlotVariant?.size === variant.size);
                      const computedPrice = variant.price || (
                        (property.sizeValue > 0 && property.priceValue > 0)
                          ? Math.round((property.priceValue / property.sizeValue) * variant.size)
                          : 0
                      );
                      const priceDisplay = variant.priceLabel || (
                        computedPrice > 9999999
                          ? `₹${(computedPrice / 10000000).toFixed(2)} Cr`
                          : (computedPrice > 0 ? `₹${(computedPrice / 100000).toFixed(2)} L` : '')
                      );

                      return (
                        <button
                          key={`size-${variant.size}-${idx}`}
                          type="button"
                          onClick={() => setSelectedPlotSize(variant.size)}
                          className={`flex flex-col text-left p-3 rounded-xl border transition-all cursor-pointer ${
                            isSelected
                              ? isDeveloperAccount
                                ? 'border-amber-500 bg-white shadow-md ring-2 ring-amber-500/20 scale-[1.02]'
                                : 'border-primary bg-white shadow-sm ring-2 ring-primary/20 scale-[1.02]'
                              : isDeveloperAccount
                                ? 'border-border bg-white text-slate-800 hover:border-amber-300 hover:bg-amber-50/30'
                                : 'border-border bg-white hover:border-gray-300 hover:bg-gray-50/80'
                          }`}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className={`text-xs sm:text-sm font-extrabold ${
                              isSelected 
                                ? isDeveloperAccount ? 'text-amber-900' : 'text-primary' 
                                : isDeveloperAccount ? 'text-slate-900' : 'text-text'
                            }`}>
                              {variant.size} {variant.unit || 'Sq. Yd'}
                            </span>
                            {isSelected && (
                              <span className={`h-2 w-2 rounded-full ${
                                isDeveloperAccount ? 'bg-amber-500 shadow-xs' : 'bg-primary'
                              }`} />
                            )}
                          </div>
                          {priceDisplay && (
                            <span className={`mt-1 text-xs font-bold ${
                              isSelected
                                ? isDeveloperAccount ? 'text-slate-950 font-black' : 'text-primary'
                                : isDeveloperAccount ? 'text-slate-700' : 'text-gray-900'
                            }`}>
                              {priceDisplay}
                            </span>
                          )}
                          {variant.dimensions ? (
                            <span className={`text-[10px] font-medium mt-0.5 truncate ${
                              isDeveloperAccount ? 'text-slate-500' : 'text-muted'
                            }`}>
                              {variant.dimensions}
                            </span>
                          ) : (
                            <span className={`text-[10px] font-medium mt-0.5 ${
                              isDeveloperAccount ? 'text-slate-500' : 'text-muted'
                            }`}>
                              ~{Math.round(variant.size * 9)} Sq. Ft
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Verified Documents */}
              <div id="documents" className="mt-8 md:mt-10">
                <h2 className={`font-serif text-2xl md:text-[28px] font-bold tracking-tight mb-4 ${
                  isDeveloperAccount ? 'text-slate-900' : 'text-text'
                }`}>
                  Verified documents
                </h2>
                <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1 sm:grid sm:grid-cols-3 sm:gap-4">
                  {verifiedDocsList.map((doc, idx) => (
                    <div
                      key={idx}
                      className={`min-w-[150px] sm:min-w-0 flex-1 rounded-2xl border p-3.5 sm:p-4 shadow-xs flex items-start gap-3 transition-all ${
                        isDeveloperAccount
                          ? 'border-amber-200/70 bg-white hover:border-amber-400 hover:shadow-card'
                          : 'border-border bg-white hover:shadow-card'
                      }`}
                    >
                      <div className={`flex h-5 w-5 items-center justify-center rounded-full border-[1.8px] shrink-0 mt-0.5 ${
                        isDeveloperAccount 
                          ? 'border-emerald-600 text-emerald-600 bg-emerald-50' 
                          : 'border-emerald-600 text-emerald-600'
                      }`}>
                        <Check size={12} strokeWidth={3} />
                      </div>
                      <div className="min-w-0">
                        <p className={`font-bold text-sm sm:text-[15px] leading-snug truncate ${
                          isDeveloperAccount ? 'text-slate-900' : 'text-text'
                        }`}>{doc.title}</p>
                        <p className={`text-[11px] sm:text-xs font-normal mt-0.5 ${
                          isDeveloperAccount ? 'text-slate-500' : 'text-muted'
                        }`}>{doc.subtitle}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Amenities */}
              <div id="amenities" className="mt-8 md:mt-10">
                <h2 className={`font-serif text-2xl md:text-[28px] font-bold tracking-tight mb-4 ${
                  isDeveloperAccount ? 'text-slate-900' : 'text-text'
                }`}>
                  Amenities
                </h2>
                <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1 sm:grid sm:grid-cols-4 sm:gap-4">
                  {displayAmenities.map((amenity, idx) => (
                    <div
                      key={idx}
                      className={`min-w-[125px] sm:min-w-0 flex-1 rounded-2xl border p-4 sm:p-5 flex flex-col items-center justify-center text-center shadow-xs transition-all ${
                        isDeveloperAccount
                          ? 'border-amber-200/70 bg-white hover:border-amber-400 hover:shadow-card'
                          : 'border-border bg-white hover:shadow-card'
                      }`}
                    >
                      <div className={`h-9 w-9 flex items-center justify-center mb-2.5 ${
                        isDeveloperAccount ? 'text-amber-600' : 'text-text'
                      }`}>
                        {getAmenityIcon(amenity)}
                      </div>
                      <p className={`text-xs sm:text-sm font-medium leading-tight ${
                        isDeveloperAccount ? 'text-slate-800 font-semibold' : 'text-text'
                      }`}>
                        {amenity}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Floating down arrow to jump to Site plan & details */}
              <button
                type="button"
                onClick={() => scrollToSection('siteplan')}
                className={`absolute bottom-4 right-4 sm:bottom-6 sm:right-6 flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full border shadow-md transition-all hover:scale-105 z-10 ${
                  isDeveloperAccount
                    ? 'bg-white border-amber-300 text-amber-700 hover:border-amber-500 hover:bg-amber-50'
                    : 'bg-white border-border text-text hover:text-primary hover:border-primary'
                }`}
                aria-label="Scroll down"
                title="Scroll to Site Plan & Details"
              >
                <ArrowDown size={18} />
              </button>
            </section>

            {/* Site Plan Section */}
            <section 
              id="siteplan" 
              className={`rounded-[1.5rem] border p-5 md:p-8 transition-all ${
                isDeveloperAccount
                  ? 'border-amber-200/90 bg-white shadow-sm'
                  : 'border-border bg-white shadow-sm'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
                <div>
                  <h2 className={`font-serif text-2xl md:text-[28px] font-bold tracking-tight ${
                    isDeveloperAccount ? 'text-slate-900' : 'text-text'
                  }`}>
                    Site Plan & Master Layout
                  </h2>
                  <p className={`mt-1 text-xs sm:text-sm ${
                    isDeveloperAccount ? 'text-slate-500' : 'text-muted'
                  }`}>
                    Official layout demarcations with road widths, entry gates, and green zones.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDirectChat}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all w-fit ${
                    isDeveloperAccount
                      ? 'border border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100 shadow-xs'
                      : 'bg-secondary/10 text-secondary hover:bg-secondary/20'
                  }`}
                >
                  <MessageCircle size={15} />
                  Request HD Master Plan
                </button>
              </div>

              <div className={`relative overflow-hidden rounded-2xl border group ${
                isDeveloperAccount ? 'border-amber-200/80 bg-slate-100' : 'border-border bg-surface'
              }`}>
                <img
                  src={property.sitePlanUrl || property.sitePlan || "https://images.unsplash.com/photo-1524813686514-a57563d77965?q=80&w=2000&auto=format&fit=crop"}
                  alt={`${property.title} Site Plan`}
                  className="w-full h-64 sm:h-80 md:h-96 object-cover filter contrast-105 cursor-pointer hover:scale-[1.01] transition-transform"
                  onClick={() => window.open(property.sitePlanUrl || property.sitePlan || "https://images.unsplash.com/photo-1524813686514-a57563d77965?q=80&w=2000&auto=format&fit=crop", '_blank')}
                  title="Click to view full HD site plan"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent flex items-end p-5">
                  <div className="text-white">
                    <p className={`text-sm font-bold ${isDeveloperAccount ? 'text-amber-200' : 'text-white'}`}>
                      Approved Master Layout Plan
                    </p>
                    <p className="text-xs text-white/80">Approved under {parsedDetails.scheme || 'DDJAY'} · Wide internal roads & green boundary</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className={`rounded-xl p-3 border transition-colors ${
                  isDeveloperAccount ? 'bg-amber-50/40 border-amber-200/70' : 'bg-surface border border-border/50'
                }`}>
                  <p className={`text-[10px] font-bold uppercase ${isDeveloperAccount ? 'text-amber-800' : 'text-muted'}`}>Road Width</p>
                  <p className={`text-xs sm:text-sm font-bold mt-0.5 ${isDeveloperAccount ? 'text-slate-900' : 'text-text'}`}>9m - 12m wide</p>
                </div>
                <div className={`rounded-xl p-3 border transition-colors ${
                  isDeveloperAccount ? 'bg-amber-50/40 border-amber-200/70' : 'bg-surface border border-border/50'
                }`}>
                  <p className={`text-[10px] font-bold uppercase ${isDeveloperAccount ? 'text-amber-800' : 'text-muted'}`}>Entry Gates</p>
                  <p className={`text-xs sm:text-sm font-bold mt-0.5 ${isDeveloperAccount ? 'text-slate-900' : 'text-text'}`}>2 Gated Entries</p>
                </div>
                <div className={`rounded-xl p-3 border transition-colors ${
                  isDeveloperAccount ? 'bg-amber-50/40 border-amber-200/70' : 'bg-surface border border-border/50'
                }`}>
                  <p className={`text-[10px] font-bold uppercase ${isDeveloperAccount ? 'text-amber-800' : 'text-muted'}`}>Parks & Green</p>
                  <p className={`text-xs sm:text-sm font-bold mt-0.5 ${isDeveloperAccount ? 'text-slate-900' : 'text-text'}`}>3 Landscaped Parks</p>
                </div>
                <div className={`rounded-xl p-3 border transition-colors ${
                  isDeveloperAccount ? 'bg-amber-50/40 border-amber-200/70' : 'bg-surface border border-border/50'
                }`}>
                  <p className={`text-[10px] font-bold uppercase ${isDeveloperAccount ? 'text-amber-800' : 'text-muted'}`}>Commercial Zone</p>
                  <p className={`text-xs sm:text-sm font-bold mt-0.5 ${isDeveloperAccount ? 'text-slate-900' : 'text-text'}`}>Designated Retail</p>
                </div>
              </div>
            </section>

            {/* Download Official Brochure & Connectivity Section */}
            <section 
              id="brochure" 
              className={`rounded-[1.5rem] border p-5 md:p-8 transition-all ${
                isDeveloperAccount
                  ? 'border-amber-200/90 bg-white shadow-sm'
                  : 'border-border bg-white shadow-sm'
              }`}
            >
              <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b ${
                isDeveloperAccount ? 'border-amber-100' : 'border-border'
              }`}>
                <div>
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-extrabold mb-2 ${
                    isDeveloperAccount
                      ? 'bg-amber-100 border border-amber-300 text-amber-900'
                      : 'bg-primary/10 text-primary'
                  }`}>
                    <FileDown size={14} /> Official Documentation
                  </span>
                  <h2 className={`font-serif text-2xl md:text-[28px] font-bold tracking-tight ${
                    isDeveloperAccount ? 'text-slate-900' : 'text-text'
                  }`}>
                    Project Brochure & Location Connectivity
                  </h2>
                  <p className={`mt-1 text-xs sm:text-sm ${
                    isDeveloperAccount ? 'text-slate-500' : 'text-muted'
                  }`}>
                    Download the official project brochure containing verified layout drawings, RERA approvals, unit dimensions & exact landmark distances.
                  </p>
                </div>
              </div>

              {/* Location Advantage & Distance to Key Places ("Kon si jagah kitni dur hai") */}
              {(() => {
                const landmarksToDisplay = (property?.keyLandmarks && property.keyLandmarks.length > 0)
                  ? property.keyLandmarks
                  : DEFAULT_KEY_LANDMARKS;

                return (
                  <div className="mt-6">
                    <p className={`text-xs font-bold uppercase tracking-wider mb-3 ${
                      isDeveloperAccount ? 'text-amber-800' : 'text-muted'
                    }`}>
                      Key Landmark Distances & Connectivity
                    </p>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      {landmarksToDisplay.map((lm, idx) => (
                        <div
                          key={idx}
                          className={`rounded-2xl border p-4 transition-all ${
                            isDeveloperAccount ? 'border-amber-200/80 bg-amber-50/20 hover:border-amber-400' : 'border-border bg-surface'
                          }`}
                        >
                          <p className={`text-xs font-bold flex items-center gap-1.5 ${
                            isDeveloperAccount ? 'text-amber-800' : 'text-primary'
                          }`}>
                            {renderLandmarkIcon(lm.icon, 15)} {lm.distance || 'Nearby'}
                          </p>
                          <p className={`mt-1.5 text-sm font-extrabold ${isDeveloperAccount ? 'text-slate-900' : 'text-text'}`}>
                            {lm.title}
                          </p>
                          {lm.subtitle && (
                            <p className={`mt-0.5 text-xs ${isDeveloperAccount ? 'text-slate-500' : 'text-muted'}`}>
                              {lm.subtitle}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Action Buttons */}
              <div className={`mt-6 flex flex-wrap items-center gap-3 pt-5 border-t ${
                isDeveloperAccount ? 'border-amber-100' : 'border-border'
              }`}>
                <button
                  type="button"
                  onClick={handleDownloadBrochure}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2.5 rounded-xl px-6 py-3.5 text-sm font-black shadow-md transition-all cursor-pointer bg-primary text-white shadow-primary/20 hover:bg-rose-600"
                >
                  <Download size={18} />
                  <span>Download Brochure (PDF)</span>
                </button>

                <button
                  type="button"
                  onClick={handleRequestBrochureOnWhatsApp}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2.5 rounded-xl bg-emerald-600 px-6 py-3.5 text-sm font-extrabold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 transition-all cursor-pointer"
                >
                  <MessageCircle size={18} />
                  <span>Get on WhatsApp</span>
                </button>
              </div>
            </section>

            {!isDeveloperAccount && !property?.isDeveloperListing && (
              <EMICalculator propertyPrice={property.priceValue} propertyPriceStr={property.price} />
            )}
          </main>

          <aside>
            <div className="space-y-5 md:sticky md:top-28">
              <div className={`p-4 transition-all ${
                isDeveloperAccount
                  ? 'rounded-[1.5rem] border-2 border-amber-300/80 bg-gradient-to-b from-white via-amber-50/20 to-white p-5 md:rounded-[2rem] md:p-7 shadow-[0_8px_30px_rgba(212,175,55,0.1)] text-slate-900'
                  : 'rounded-[1.5rem] border border-border bg-white shadow-card md:rounded-[2rem] md:p-6'
              }`}>
                <p className={`text-xs font-bold uppercase tracking-wide ${
                  isDeveloperAccount ? 'text-amber-800 tracking-wider font-extrabold text-[11px] flex items-center gap-1.5' : 'text-muted'
                }`}>
                  {isDeveloperAccount ? (
                    <>
                      <Building2 size={13} className="text-amber-600" />
                      OFFICIAL BUILDER SALES DESK
                    </>
                  ) : 'Associate Partner Contact'}
                </p>
                <div className="mt-5 flex items-center gap-4">
                  <div className={`flex h-14 w-14 items-center justify-center rounded-2xl text-xl font-black shadow-sm ${
                    isDeveloperAccount
                      ? 'bg-gradient-to-br from-amber-500 to-amber-600 text-white text-2xl shadow-md'
                      : property.isDeveloperListing ? 'bg-primary text-white' : 'bg-secondary text-white'
                  }`}>
                    {property.isDeveloperListing ? <Building2 size={26} /> : activeBroker.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className={`flex items-center gap-1 font-black ${
                      isDeveloperAccount ? 'text-slate-900 text-lg' : 'text-text text-base font-extrabold'
                    }`}>
                      {activeBroker.name}
                      <BadgeCheck size={18} className={isDeveloperAccount ? 'text-amber-600 shrink-0' : 'text-primary shrink-0'} />
                    </h3>
                    <p className={`text-xs font-semibold ${
                      isDeveloperAccount ? 'text-amber-800' : 'text-muted'
                    }`}>
                      {property.isDeveloperListing ? 'Official Developer Direct Listing' : `${activeBroker.properties} active properties`}
                    </p>
                  </div>
                </div>

                <div className={`mt-5 rounded-2xl p-4 transition-colors ${
                  isDeveloperAccount
                    ? 'bg-white border border-amber-200/80 text-slate-900 shadow-xs'
                    : 'bg-surface'
                }`}>
                  <p className={`text-sm font-bold ${
                    isDeveloperAccount ? 'text-slate-900' : 'text-text'
                  }`}>
                    {property.isDeveloperListing ? 'Direct Builder Inquiry' : activeBroker.response}
                  </p>
                  <p className={`mt-1 text-xs font-medium ${
                    isDeveloperAccount ? 'text-slate-500' : 'text-muted'
                  }`}>
                    {property.isDeveloperListing 
                      ? 'Inquire for official master plans, unit layout drawings, and booking site visits.'
                      : 'Ask for exact plot number, documents, or site visit slots.'}
                  </p>

                  {property.isDeveloperListing && activeBroker.address && (
                    <div className={`mt-3 pt-3 border-t flex items-start gap-2 text-xs font-semibold ${
                      isDeveloperAccount ? 'border-amber-100 text-slate-700' : 'border-border/70 text-text'
                    }`}>
                      <MapPin size={14} className={`mt-0.5 flex-shrink-0 ${isDeveloperAccount ? 'text-amber-600' : 'text-primary'}`} />
                      <span>{activeBroker.address}</span>
                    </div>
                  )}

                  {property.isDeveloperListing && activeBroker.email && (
                    <div className={`mt-2 flex items-center gap-2 text-xs font-semibold ${
                      isDeveloperAccount ? 'text-slate-700' : 'text-text'
                    }`}>
                      <Mail size={14} className={`flex-shrink-0 ${isDeveloperAccount ? 'text-amber-600' : 'text-primary'}`} />
                      <span className="truncate">{activeBroker.email}</span>
                    </div>
                  )}
                </div>

                <div className="mt-5 grid gap-3">
                  <a
                    href="#"
                    onClick={handleDirectChat}
                    className="flex h-12 items-center justify-center gap-2 rounded-xl text-sm font-black text-white transition-all shadow-md bg-[#25D366] hover:bg-[#1ebd5a]"
                  >
                    <MessageCircle size={18} />
                    {property.isDeveloperListing ? 'WhatsApp Builder Desk' : 'Direct to Chat'}
                  </a>
                  <a
                    href={`tel:+${activeBroker.callNumber}`}
                    className="flex h-12 items-center justify-center gap-2 rounded-xl text-sm font-black transition-all shadow-xs border border-border bg-white text-text hover:border-primary hover:text-primary font-extrabold"
                  >
                    <Phone size={18} />
                    {property.isDeveloperListing ? 'Call Builder Desk' : 'Call Associate Partner'}
                  </a>
                </div>
              </div>

              <div className="rounded-[1.5rem] bg-secondary p-5 text-white shadow-sm md:rounded-[2rem] md:p-6 transition-all">
                <ShieldCheck size={24} className="text-white" />
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
            <Link 
              href="/listings" 
              className="hidden items-center gap-1 text-sm font-bold sm:flex text-secondary hover:text-primary"
            >
              View all
              <ChevronRight size={16} />
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {suggestions.map((suggestion) => (
              <Link
                key={suggestion.id}
                href={`/property/${suggestion.id}`}
                className="group overflow-hidden rounded-2xl border border-border bg-white shadow-sm hover:shadow-card transition-all duration-300 hover:-translate-y-1"
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
      <div className="fixed inset-x-0 bottom-[88px] z-40 border-t border-border bg-white/95 text-text px-4 py-3 shadow-[0_-12px_30px_rgba(0,0,0,0.06)] backdrop-blur-xl md:hidden transition-all">
        <div className="mx-auto flex max-w-[420px] items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-extrabold text-text">{activeBroker.name}</p>
            <p className="text-xs font-semibold text-muted">{activeBroker.response}</p>
          </div>
            <>
              <a
                href="#"
                onClick={handleDirectChat}
                className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-green-500/20"
                aria-label="WhatsApp associate partner"
              >
                <MessageCircle size={20} />
              </a>
              <a
                href={`tel:+${activeBroker.callNumber}`}
                className="flex h-11 min-w-[86px] flex-shrink-0 items-center justify-center gap-2 rounded-full px-4 text-sm font-black shadow-lg bg-primary text-white shadow-primary/20"
              >
                <Phone size={17} />
                Call
              </a>
            </>
        </div>
      </div>

      <BrochureModal
        isOpen={showBrochureModal}
        onClose={() => setShowBrochureModal(false)}
        property={property}
        activeBroker={activeBroker}
        parsedDetails={parsedDetails}
      />
    </div>
  );
};

export default PropertyDetails;
