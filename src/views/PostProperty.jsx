"use client";

import { useEffect, useRef, useState } from 'react';
import {
  Building2, CheckCircle2, ExternalLink, FileDown, FileText, Layers, Loader2,
  Mail, MapPin, MessageCircle, Phone, Play, ShieldCheck, Sparkles, Trash2,
  Upload, Video, Plus, Route, Train, Plane, Hospital, GraduationCap,
  ShoppingBag, Car, Trees, Eye, RefreshCw, X,
  FileCheck2, GitFork, ScrollText, BadgeCheck, Check
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

import DropdownSelect from '../components/DropdownSelect';
import { apiRequest } from '../lib/api';
import { useAuth } from '../context/auth';

const DEFAULT_KEY_LANDMARKS_PRESET = [
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

const AVAILABLE_LANDMARK_ICONS = [
  { value: 'Route', label: 'Route / Highway' },
  { value: 'Train', label: 'Metro / Transit Station' },
  { value: 'Building2', label: 'Schools / Civic / Hubs' },
  { value: 'Plane', label: 'Airport / Aerocity' },
  { value: 'Hospital', label: 'Hospital / Healthcare' },
  { value: 'GraduationCap', label: 'School / University' },
  { value: 'ShoppingBag', label: 'Shopping / Mall' },
  { value: 'Car', label: 'Highway / Road Link' },
  { value: 'Trees', label: 'Park / Green Corridor' },
  { value: 'MapPin', label: 'General Landmark' }
];

const renderPostLandmarkIcon = (iconName, size = 15) => {
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

const DEFAULT_AMENITIES = [
  'Blacktop roads',
  'Underground electricity',
  'Water connection',
  'Avenue plantation',
  'Drainage system',
  '24/7 security',
  'Clubhouse access',
  'Children play area'
];

const VERIFICATION_OPTIONS = [
  {
    id: 'Verified Land Documents',
    title: 'Verified Land Documents',
    pill: 'Documents verified',
    pillType: 'green',
    desc: 'Ownership/title documents check karne ke baad use karein.',
    icon: FileCheck2
  },
  {
    id: 'CLU Approved',
    title: 'CLU Approved',
    pill: 'Permission-specific',
    pillType: 'gray',
    desc: 'Sirf tab jab relevant land-use conversion permission available ho.',
    tags: ['Haryana', '+1'],
    icon: GitFork
  },
  {
    id: 'DTCP Licensed / Approved',
    title: 'DTCP Licensed / Approved',
    desc: 'Sirf applicable DTCP licence ya approval wale project ke liye.',
    icon: ShieldCheck
  },
  {
    id: 'RERA Registered',
    title: 'RERA Registered',
    desc: 'Agar project ko RERA registration required hai aur valid registration hai, tabhi badge lagayein.',
    tags: ['Haryana', '+1'],
    icon: CheckCircle2
  },
  {
    id: 'Registry Available',
    title: 'Registry Available',
    desc: 'Sale deed/registry document available hone par hi use karein. Iska matlab automatically clear title ya all approvals hona nahi hai.',
    icon: ScrollText
  }
];

const getFreeReraVerifyUrl = (reraNumber, location = '') => {
  if (!reraNumber) return 'https://haryanarera.gov.in/';
  const clean = String(reraNumber).trim().toUpperCase();
  if (clean.includes('HRERA') || /haryana|gurgaon|gurugram|faridabad|panchkula|jjr|jhajjar|sonipat/i.test(location)) {
    return 'https://haryanarera.gov.in/';
  }
  if (clean.includes('UPRERA') || clean.startsWith('UP') || /uttar pradesh|noida|greater noida|ghaziabad/i.test(location)) {
    return 'https://www.up-rera.in/projects';
  }
  if (clean.includes('DLRERA') || /delhi/i.test(location)) {
    return 'https://rera.delhi.gov.in/';
  }
  if (clean.startsWith('P5') || /maharashtra|mumbai|pune/i.test(location)) {
    return 'https://maharerait.mahaonline.gov.in/';
  }
  return 'https://www.google.com/search?q=' + encodeURIComponent(clean + ' official rera verification gov in');
};


const PostProperty = () => {
  const navigate = useRouter();
  const searchParams = useSearchParams();
  const { user, isAdmin } = useAuth();
  const editId = searchParams.get('edit');
  const brokerApproved = isAdmin || user?.brokerStatus === 'approved';
  const [form, setForm] = useState({
    title: '',
    description: '',
    state: '',
    city: '',
    locality: '',
    address: '',
    price: '',
    size: '',
    propertyType: 'plot',
    listingType: 'buy',
    roi: '',
    reraApproved: true,
    documentsVerified: [],
    isDeveloperListing: searchParams.get('type') === 'builder',
    builderName: '',
    aboutBuilder: '',
    builderPhone: '',
    builderWhatsapp: '',
    builderEmail: '',
    builderAddress: '',
    reraNumber: '',
    brochureUrl: '',
    sitePlanUrl: ''
  });
  const [keyLandmarks, setKeyLandmarks] = useState([]);
  const [sitePlanUploading, setSitePlanUploading] = useState(false);
  const sitePlanInputRef = useRef(null);
  const [checkedAmenities, setCheckedAmenities] = useState([]);
  const [hasOtherAmenity, setHasOtherAmenity] = useState(false);
  const [otherAmenities, setOtherAmenities] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [videoFiles, setVideoFiles] = useState([]);
  const [videoPreviews, setVideoPreviews] = useState([]);
  const [videoUrlInput, setVideoUrlInput] = useState('');
  const [videoUploading, setVideoUploading] = useState(false);
  const videoInputRef = useRef(null);
  const [customPlotSizes, setCustomPlotSizes] = useState([]);
  const [customSizeInput, setCustomSizeInput] = useState('');
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [uploadConfig, setUploadConfig] = useState({ provider: 'manual', uploadPreset: '', cloudName: '', message: '' });
  const [brochureUploading, setBrochureUploading] = useState(false);
  const [brochureFileName, setBrochureFileName] = useState('');
  const brochureInputRef = useRef(null);

  const updateField = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const handleBrochureUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      alert('Please select a valid PDF file.');
      return;
    }

    if (file.size > 30 * 1024 * 1024) {
      alert('PDF file size should not exceed 30MB.');
      return;
    }

    setBrochureUploading(true);
    setBrochureFileName(file.name);

    try {
      const activeCloud = uploadConfig.cloudName || 'dw0srvbyz';
      const activePreset = uploadConfig.uploadPreset || 'plotyard_uploads';

      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', activePreset);

      const response = await fetch(`https://api.cloudinary.com/v1_1/${activeCloud}/auto/upload`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      if (!response.ok || !data.secure_url) {
        throw new Error(data.error?.message || 'Failed to upload PDF brochure.');
      }

      updateField('brochureUrl', data.secure_url);
    } catch (err) {
      console.error('PDF upload error:', err);
      alert(err.message || 'Error uploading PDF. You can paste the link manually below.');
    } finally {
      setBrochureUploading(false);
      if (event.target) event.target.value = '';
    }
  };

  const getBrochureDisplayName = () => {
    if (brochureFileName) return brochureFileName;
    if (!form.brochureUrl) return '';
    try {
      const parts = form.brochureUrl.split('/');
      const lastPart = parts[parts.length - 1];
      return decodeURIComponent(lastPart.split('?')[0]) || 'Project-Brochure.pdf';
    } catch {
      return 'Project-Brochure.pdf';
    }
  };

  const handleSitePlanUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (PNG, JPG, WebP) for the site plan.');
      return;
    }

    setSitePlanUploading(true);
    try {
      const activeCloud = uploadConfig.cloudName || 'dw0srvbyz';
      const activePreset = uploadConfig.uploadPreset || 'plotyard_uploads';

      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', activePreset);

      const response = await fetch(`https://api.cloudinary.com/v1_1/${activeCloud}/image/upload`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      if (!response.ok || !data.secure_url) {
        throw new Error(data.error?.message || 'Failed to upload site plan image.');
      }

      updateField('sitePlanUrl', data.secure_url);
    } catch (err) {
      console.error('Site plan upload error:', err);
      const reader = new FileReader();
      reader.onload = () => {
        updateField('sitePlanUrl', reader.result);
      };
      reader.readAsDataURL(file);
    } finally {
      setSitePlanUploading(false);
      if (event.target) event.target.value = '';
    }
  };

  const handleAddLandmark = () => {
    setKeyLandmarks((prev) => [
      ...prev,
      { distance: '5 - 10 Mins', title: '', subtitle: '', icon: 'Route' }
    ]);
  };

  const handleLoadDefaultLandmarks = () => {
    setKeyLandmarks(JSON.parse(JSON.stringify(DEFAULT_KEY_LANDMARKS_PRESET)));
  };

  const handleClearAllLandmarks = () => {
    setKeyLandmarks([]);
  };

  const handleRemoveLandmark = (index) => {
    setKeyLandmarks((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleUpdateLandmarkField = (index, field, value) => {
    setKeyLandmarks((prev) =>
      prev.map((lm, idx) => (idx === index ? { ...lm, [field]: value } : lm))
    );
  };

  const toggleAmenity = (amenity) => {
    setCheckedAmenities((prev) =>
      prev.includes(amenity)
        ? prev.filter((item) => item !== amenity)
        : [...prev, amenity]
    );
  };

  const toggleVerificationOption = (optionId) => {
    setForm((current) => {
      const docs = current.documentsVerified || [];
      const isAlreadyChecked = docs.includes(optionId) || (optionId === 'RERA Registered' && (current.reraApproved || Boolean(current.reraNumber)));
      
      let updatedDocs;
      if (isAlreadyChecked) {
        updatedDocs = docs.filter((item) => item !== optionId);
      } else {
        updatedDocs = [...docs, optionId];
      }

      const isRera = optionId === 'RERA Registered';
      return {
        ...current,
        documentsVerified: updatedDocs,
        ...(isRera ? { reraApproved: !isAlreadyChecked } : {})
      };
    });
  };

  const toggleDocument = (doc) => {
    setForm((current) => {
      const docs = current.documentsVerified || [];
      const updatedDocs = docs.includes(doc)
        ? docs.filter((item) => item !== doc)
        : [...docs, doc];
      return { ...current, documentsVerified: updatedDocs };
    });
  };

  useEffect(() => {
    const loadUploadConfig = async () => {
      try {
        const data = await apiRequest('/service/uploads/signature');
        setUploadConfig(data);
      } catch {
        setUploadConfig((current) => ({ ...current, provider: 'manual', message: 'Upload preview not available' }));
      }
    };

    const loadStates = async () => {
      try {
        const response = await fetch('https://countriesnow.space/api/v0.1/countries/states', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ country: 'India' })
        });
        const data = await response.json();
        if (data?.data?.states) {
          const normalizedStates = data.data.states.map((item) => item.name.normalize('NFD').replace(/[\u0300-\u036f]/g, ''));
          setStates([...new Set(normalizedStates)].sort());
        }
      } catch {
        setStates(['Telangana', 'Karnataka', 'Maharashtra', 'Uttar Pradesh', 'Delhi']);
      }
    };

    loadUploadConfig();
    loadStates();
  }, []);

  useEffect(() => {
    if (!editId) return;

    const loadPropertyDetails = async () => {
      try {
        setLoading(true);
        const data = await apiRequest(`/properties/${editId}`);
        const prop = data.property;
        if (prop) {
          setForm({
            title: prop.title || '',
            description: prop.description || '',
            state: prop.location?.state || '',
            city: prop.location?.city || '',
            locality: prop.location?.locality || '',
            address: prop.location?.address || '',
            price: prop.price?.amount || '',
            size: prop.size?.value || '',
            propertyType: prop.propertyType || 'plot',
            listingType: prop.listingType || 'buy',
            roi: prop.roi || '',
            reraApproved: prop.reraApproved !== false,
            documentsVerified: (() => {
              const d = [...(prop.documentsVerified || [])];
              if ((prop.reraNumber || prop.reraApproved) && !d.includes('RERA Registered')) {
                d.push('RERA Registered');
              }
              return d;
            })(),
            isDeveloperListing: Boolean(prop.isDeveloperListing),
            builderName: prop.builderName || '',
            aboutBuilder: prop.aboutBuilder || '',
            builderPhone: prop.builderContact?.phone || '',
            builderWhatsapp: prop.builderContact?.whatsapp || '',
            builderEmail: prop.builderContact?.email || '',
            builderAddress: prop.builderContact?.address || '',
            reraNumber: prop.reraNumber || '',
            brochureUrl: prop.brochureUrl || '',
            sitePlanUrl: prop.sitePlanUrl || prop.sitePlan || ''
          });

          if (Array.isArray(prop.keyLandmarks) && prop.keyLandmarks.length > 0) {
            setKeyLandmarks(prop.keyLandmarks);
          } else {
            setKeyLandmarks([]);
          }

          // Process amenities
          const amenities = prop.amenities || [];
          const defaultChecked = [];
          const customAmenities = [];

          amenities.forEach((amenity) => {
            if (DEFAULT_AMENITIES.includes(amenity)) {
              defaultChecked.push(amenity);
            } else {
              customAmenities.push(amenity);
            }
          });

          setCheckedAmenities(defaultChecked);
          if (customAmenities.length > 0) {
            setHasOtherAmenity(true);
            setOtherAmenities(customAmenities.join(', '));
          } else {
            setHasOtherAmenity(false);
            setOtherAmenities('');
          }

          // Images
          if (prop.images && prop.images.length > 0) {
            setImagePreviews(prop.images.map((img) => ({ url: img.url, name: img.alt || 'Existing Image', isExisting: true })));
          } else if (prop.image) {
            setImagePreviews([{ url: prop.image, name: 'Existing Image', isExisting: true }]);
          }

          // Videos
          if (prop.videos && prop.videos.length > 0) {
            setVideoPreviews(prop.videos.map((vid) => ({
              url: typeof vid === 'string' ? vid : vid.url,
              name: (typeof vid === 'object' && vid.title) || 'Property Walkthrough Video',
              isExisting: true
            })));
          } else if (prop.videoUrl) {
            setVideoPreviews([{ url: prop.videoUrl, name: 'Property Walkthrough Video', isExisting: true }]);
            setVideoUrlInput(prop.videoUrl);
          } else if (prop.video) {
            setVideoPreviews([{ url: prop.video, name: 'Property Walkthrough Video', isExisting: true }]);
          }

          // Plot sizes
          if (Array.isArray(prop.availableSizes) && prop.availableSizes.length > 0) {
            setCustomPlotSizes(prop.availableSizes.map((s) => Number(s.size || s)).filter(Boolean));
          } else if (Array.isArray(prop.plotSizes) && prop.plotSizes.length > 0) {
            setCustomPlotSizes(prop.plotSizes.map((s) => {
              const match = String(s).match(/\d+/);
              return match ? Number(match[0]) : 0;
            }).filter(Boolean));
          } else if (prop.size?.value) {
            setCustomPlotSizes([Number(prop.size.value)]);
          }
        }
      } catch {
        setError('Failed to load property details for editing.');
      } finally {
        setLoading(false);
      }
    };

    loadPropertyDetails();
  }, [editId]);

  useEffect(() => {
    const loadCities = async () => {
      if (!form.state) {
        setCities([]);
        return;
      }

      try {
        const response = await fetch('https://countriesnow.space/api/v0.1/countries/state/cities', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ country: 'India', state: form.state })
        });
        const data = await response.json();
        if (data?.data) {
          const normalizedCities = data.data.map((city) => city.normalize('NFD').replace(/[\u0300-\u036f]/g, ''));
          setCities([...new Set(normalizedCities)].sort());
        } else {
          setCities([]);
        }
      } catch {
        setCities([]);
      }
    };

    loadCities();
  }, [form.state]);

  const handleImageFiles = (event) => {
    const newFiles = Array.from(event.target.files || []);
    if (!newFiles.length) return;

    setImageFiles((prev) => [...prev, ...newFiles]);

    const newPreviews = newFiles.map((file) => ({
      url: URL.createObjectURL(file),
      name: file.name,
      isExisting: false
    }));

    setImagePreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeImage = (indexToRemove) => {
    const previewToRemove = imagePreviews[indexToRemove];
    
    setImagePreviews((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    
    if (!previewToRemove.isExisting) {
      setImageFiles((prev) => prev.filter((file) => file.name !== previewToRemove.name));
    }
  };

  const handleVideoFiles = (event) => {
    const newFiles = Array.from(event.target.files);
    if (!newFiles.length) return;

    const file = newFiles[0];
    if (file.size > 100 * 1024 * 1024) {
      alert("Video file size should not exceed 100MB.");
      return;
    }

    setVideoFiles([file]);
    setVideoPreviews([
      {
        url: URL.createObjectURL(file),
        name: file.name,
        size: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
        isExisting: false
      }
    ]);
  };

  const removeVideo = (indexToRemove) => {
    setVideoPreviews((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    setVideoFiles([]);
    setVideoUrlInput('');
    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  const handleAddVideoUrl = () => {
    const url = videoUrlInput.trim();
    if (!url) return;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      alert('Please enter a valid video link starting with https://');
      return;
    }
    setVideoPreviews([
      {
        url,
        name: 'Video Link / YouTube Walkthrough',
        isExisting: true,
        isExternal: true
      }
    ]);
  };

  const addPlotSize = (sz) => {
    const num = Number(sz);
    if (!num || num <= 0) return;
    setCustomPlotSizes((prev) => [...new Set([...prev, num])].sort((a, b) => a - b));
  };

  const removePlotSize = (sz) => {
    setCustomPlotSizes((prev) => prev.filter((s) => s !== sz));
  };

  const uploadVideos = async () => {
    if (!videoFiles.length) return [];
    const activeCloud = uploadConfig.cloudName || 'dw0srvbyz';
    const activePreset = uploadConfig.uploadPreset || 'plotyard_uploads';

    const uploaded = [];
    setVideoUploading(true);
    try {
      for (const file of videoFiles) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', activePreset);

        const response = await fetch(`https://api.cloudinary.com/v1_1/${activeCloud}/video/upload`, {
          method: 'POST',
          body: formData
        });

        const data = await response.json();
        if (!response.ok || !data.secure_url) {
          throw new Error(data.error?.message || 'Video upload failed. Check format or size.');
        }
        uploaded.push({ url: data.secure_url, title: form.title || file.name });
      }
    } finally {
      setVideoUploading(false);
    }

    return uploaded;
  };

  const uploadImages = async () => {
    if (!imageFiles.length) return [];
    if (uploadConfig.provider !== 'cloudinary' || !uploadConfig.uploadPreset || !uploadConfig.cloudName) {
      throw new Error('Image upload is not configured correctly. Use image URL or configure Cloudinary in backend .env.');
    }

    const uploaded = [];
    for (const file of imageFiles) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadConfig.uploadPreset);

      const response = await fetch(`https://api.cloudinary.com/v1_1/${uploadConfig.cloudName}/image/upload`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      if (!response.ok || !data.secure_url) {
        throw new Error(data.error?.message || 'Image upload failed');
      }
      uploaded.push({ url: data.secure_url, alt: form.title || file.name });
    }

    return uploaded;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!brokerApproved) {
      setError('Your associate partner account needs approval before you can post a property.');
      return;
    }

    setLoading(true);
    setError('');
    setStatus('');

    try {
      if (!form.state || !form.city) {
        throw new Error('Please choose the state and city for this property.');
      }

      const newUploadedImages = await uploadImages();
      const retainedExistingImages = imagePreviews
        .filter((img) => img.isExisting)
        .map((img) => ({ url: img.url, alt: img.name || form.title }));
      const images = [...retainedExistingImages, ...newUploadedImages];

      const newUploadedVideos = await uploadVideos();
      const retainedExistingVideos = videoPreviews
        .filter((vid) => vid.isExisting)
        .map((vid) => ({ url: vid.url, title: vid.name || form.title }));
      const videos = [...retainedExistingVideos, ...newUploadedVideos];
      const videoUrl = videos[0]?.url || (videoUrlInput.trim() ? videoUrlInput.trim() : '');

      const allSizesList = (customPlotSizes.length > 0)
        ? customPlotSizes
        : (form.size ? [Number(form.size)] : []);

      const availableSizes = allSizesList.map((sz) => {
        const calculatedPrice = (Number(form.price) > 0 && Number(form.size) > 0)
          ? Math.round((Number(form.price) / Number(form.size)) * sz)
          : (Number(form.price) || 0);
        return {
          size: sz,
          unit: 'sqyd',
          price: calculatedPrice,
          priceLabel: calculatedPrice > 9999999
            ? `₹${(calculatedPrice / 10000000).toFixed(2)} Cr`
            : (calculatedPrice > 0 ? `₹${(calculatedPrice / 100000).toFixed(2)} L` : '')
        };
      });
      const plotSizes = allSizesList.map((sz) => `${sz} Sq. Yrd`);

      const otherList = hasOtherAmenity && otherAmenities
        ? otherAmenities.split(',').map((item) => item.trim()).filter(Boolean)
        : [];
      const allAmenities = [...checkedAmenities, ...otherList];

      const method = editId ? 'PATCH' : 'POST';
      const endpoint = editId ? `/properties/${editId}` : '/properties';

      await apiRequest(endpoint, {
        method,
        body: {
          title: form.title,
          description: form.description,
          listingType: form.listingType,
          propertyType: form.propertyType,
          location: {
            state: form.state,
            city: form.city,
            locality: form.locality,
            address: form.address
          },
          price: {
            amount: Number(form.price),
            label: Number(form.price) > 9999999 
              ? `Rs. ${(Number(form.price) / 10000000).toFixed(2)} Cr` 
              : `Rs. ${(Number(form.price) / 100000).toFixed(2)} L`
          },
          size: {
            value: Number(form.size),
            unit: 'sqyd'
          },
          availableSizes,
          plotSizes,
          roi: form.roi || '12%',
          images,
          videos,
          videoUrl,
          amenities: allAmenities,
          documentsVerified: form.documentsVerified || [],
          reraApproved: form.propertyType === 'farmland' ? false : form.reraApproved,
          isDeveloperListing: form.isDeveloperListing,
          builderName: form.builderName?.trim() || '',
          aboutBuilder: form.isDeveloperListing ? form.aboutBuilder : '',
          builderContact: form.isDeveloperListing ? {
            phone: form.builderPhone,
            whatsapp: form.builderWhatsapp,
            email: form.builderEmail,
            address: form.builderAddress
          } : undefined,
          reraNumber: form.reraNumber || '',
          brochureUrl: form.brochureUrl?.trim() || '',
          sitePlanUrl: form.sitePlanUrl?.trim() || '',
          keyLandmarks: keyLandmarks
            .map((lm) => ({
              distance: String(lm.distance || '').trim(),
              title: String(lm.title || '').trim(),
              subtitle: String(lm.subtitle || '').trim(),
              icon: String(lm.icon || 'Route').trim()
            }))
            .filter((lm) => lm.title || lm.distance)
        }
      });
      setStatus(editId ? 'Your listing has been updated.' : 'Your property is now posted.');
      setTimeout(() => navigate.push('/dashboard'), 900);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-12 bg-surface">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-text">{editId ? 'Edit your listing' : 'Add a property listing'}</h1>
          <p className="mt-2 text-sm font-medium text-muted">
            {editId ? 'Make the details clearer for buyers, then save your changes.' : 'Share clear plot details, pricing, location, and photos so buyers know exactly what they are looking at.'}
          </p>
        </div>

        {!brokerApproved ? (
          <div className="rounded-3xl border border-primary/15 bg-white p-8 shadow-sm">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <ShieldCheck size={26} />
            </div>
            <h2 className="mt-5 text-2xl font-extrabold text-text">Finish associate partner approval first</h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-muted">
              To keep listings trustworthy, only approved associate partners can post properties. Choose a Premium plan for instant approval, or come back here once your associate partner profile is approved.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/dashboard"
                state={{ tab: 'subscription' }}
                className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-rose-600"
              >
                View Premium Plan
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center rounded-xl border border-border bg-white px-5 py-3 text-sm font-bold text-text transition-colors hover:border-primary hover:text-primary"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        ) : (

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 grid gap-5">
          {error && <p className="rounded-xl bg-rose-50 p-3 text-sm font-bold text-primary">{error}</p>}
          {status && <p className="rounded-xl bg-green-50 p-3 text-sm font-bold text-green-700">{status}</p>}

          <div>
            <label className="block text-sm font-bold text-text mb-1">Listing title</label>
            <input value={form.title} onChange={(event) => updateField('title', event.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-text" placeholder="e.g. 300 sqyd plot in Sector 82, Gurgaon" required />
          </div>
          <div>
            <label className="block text-sm font-bold text-text mb-1">Short description</label>
            <textarea value={form.description} onChange={(event) => updateField('description', event.target.value)} className="min-h-28 w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-text" placeholder="Mention approvals, road access, nearby landmarks, payment terms, and anything a buyer should know before calling." />
          </div>

          {/* Developer / Builder Name */}
          <div>
            <label className="flex items-center gap-1.5 text-sm font-bold text-text mb-1">
              <Building2 size={16} className="text-primary" />
              Developer / Builder Name
            </label>
            <input
              type="text"
              value={form.builderName}
              onChange={(e) => updateField('builderName', e.target.value)}
              placeholder="e.g. DLF, Uppal Group, Godrej Properties, BPTP"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-text font-semibold focus:border-primary focus:outline-none"
            />
            <p className="mt-1 text-xs text-muted">Original developer or builder of the plotted township.</p>
          </div>

          {/* Government Approvals & Legal Verification Badges (As requested from verification options) */}
          <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5 shadow-xs">
            <div className="mb-4">
              <div className="flex items-center justify-between gap-2">
                <label className="flex items-center gap-2 text-base font-bold text-text">
                  <ShieldCheck size={18} className="text-primary" />
                  Legal Approvals & Verification Badges
                </label>
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                  Build Buyer Trust
                </span>
              </div>
              <p className="mt-1 text-xs text-muted">
                Applicable badges select karein taaki buyer ko verified approvals dikhein.
              </p>
            </div>

            <div className="space-y-3">
              {VERIFICATION_OPTIONS.map((opt) => {
                const isSelected = (form.documentsVerified || []).includes(opt.id) || (opt.id === 'RERA Registered' && (form.reraApproved || Boolean(form.reraNumber)));
                const IconComponent = opt.icon;

                return (
                  <div
                    key={opt.id}
                    className={`rounded-2xl border transition-all duration-200 p-3.5 sm:p-4 ${
                      isSelected
                        ? 'border-primary/50 bg-rose-50/20 shadow-xs'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/50'
                    }`}
                  >
                    <div
                      onClick={() => toggleVerificationOption(opt.id)}
                      className="flex items-start gap-3.5 sm:gap-4 cursor-pointer select-none"
                    >
                      {/* Left Icon in Rounded Square */}
                      <div className={`flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-2xl transition-colors ${
                        isSelected ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-700'
                      }`}>
                        <IconComponent size={24} strokeWidth={2} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-sm sm:text-base font-bold text-gray-900 leading-tight">
                            {opt.title}
                          </h4>
                          {opt.pill && (
                            <span className={`inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                              opt.pillType === 'green'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-gray-100 text-gray-600 border border-gray-200'
                            }`}>
                              {opt.pill}
                            </span>
                          )}
                        </div>

                        <p className="mt-1 text-xs sm:text-sm text-gray-600 leading-relaxed">
                          {opt.desc}
                        </p>

                        {/* State Tag pill */}
                        {opt.tags && (
                          <div className="mt-2 flex items-center gap-1.5">
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-600 bg-gray-100 border border-gray-200/80 px-2 py-0.5 rounded-md">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                              {opt.tags[0]}
                              {opt.tags[1] && <span className="text-gray-400 font-normal">{opt.tags[1]}</span>}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Right Checkbox / Toggle Indicator */}
                      <div className="pt-0.5 shrink-0">
                        <div className={`flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-lg border transition-all ${
                          isSelected
                            ? 'bg-primary border-primary text-white shadow-xs'
                            : 'border-gray-300 bg-white hover:border-gray-400'
                        }`}>
                          {isSelected && <Check size={14} strokeWidth={3} />}
                        </div>
                      </div>
                    </div>

                    {/* Expandable options for RERA Registered */}
                    {opt.id === 'RERA Registered' && isSelected && (
                      <div className="mt-3.5 pt-3.5 border-t border-gray-100 space-y-2">
                        <label className="flex items-center gap-1.5 text-xs font-bold text-gray-800">
                          <FileText size={14} className="text-primary" />
                          RERA Registration Number
                        </label>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <input
                            type="text"
                            value={form.reraNumber}
                            onChange={(e) => updateField('reraNumber', e.target.value.toUpperCase())}
                            placeholder="e.g. HRERA-PKL-JJR-678-2025"
                            className="flex-1 bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold font-mono text-text focus:border-primary focus:outline-none"
                          />
                          <a
                            href={getFreeReraVerifyUrl(form.reraNumber, form.state || form.city)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl transition-colors whitespace-nowrap shadow-xs"
                            title="Verify on official Government RERA portal for free without registration"
                          >
                            <ExternalLink size={13} />
                            Verify on Portal (Free)
                          </a>
                        </div>
                        <div className="flex flex-wrap items-center justify-between gap-1 text-[11px] text-muted">
                          <span>Official State RERA ID required for promotion and buyer transparency.</span>
                          {form.reraNumber && (
                            <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              Format: {form.reraNumber.includes('HRERA') ? 'Haryana HRERA' : form.reraNumber.includes('UPRERA') ? 'UP RERA' : 'Standard RERA'}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Expandable Free Verification Helper for Land Documents / Jamabandi */}
                    {opt.id === 'Verified Land Documents' && isSelected && (
                      <div className="mt-2.5 pt-2.5 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                        <span className="text-gray-500 text-[11px]">Check official Jamabandi / Nakal ownership record for free:</span>
                        <a
                          href="https://jamabandi.nic.in/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-emerald-700 font-bold hover:underline text-[11px]"
                        >
                          <ExternalLink size={11} /> Check on Jamabandi.nic.in (Free & No Login)
                        </a>
                      </div>
                    )}

                    {/* Expandable Free Verification Helper for DTCP */}
                    {opt.id === 'DTCP Licensed / Approved' && isSelected && (
                      <div className="mt-2.5 pt-2.5 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                        <span className="text-gray-500 text-[11px]">Check public DTCP colony licence register:</span>
                        <a
                          href="https://tcpharyana.gov.in/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-emerald-700 font-bold hover:underline text-[11px]"
                        >
                          <ExternalLink size={11} /> Check on TCP Haryana (Free Public Records)
                        </a>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Project Brochure Link / PDF Upload Option */}
          <div className="rounded-2xl border border-gray-200 bg-gray-50/60 p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <label className="flex items-center gap-1.5 text-sm font-bold text-text">
                <FileDown size={16} className="text-primary" />
                Project Brochure Link / PDF (Optional)
              </label>
              <span className="text-xs font-semibold text-muted bg-white border border-gray-200 px-2.5 py-0.5 rounded-full">
                Upload PDF or Paste Link
              </span>
            </div>

            {/* Hidden file input for PDF */}
            <input
              type="file"
              ref={brochureInputRef}
              onChange={handleBrochureUpload}
              accept="application/pdf,.pdf"
              className="hidden"
            />

            {/* Attached PDF Preview Card */}
            {form.brochureUrl ? (
              <div className="mb-3 rounded-xl border border-emerald-200 bg-emerald-50/80 p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white font-black text-xs shadow-xs">
                    PDF
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                      <CheckCircle2 size={14} className="text-emerald-600" />
                      Brochure PDF Attached
                    </div>
                    <p className="text-xs text-emerald-700/80 truncate max-w-xs sm:max-w-md font-mono" title={form.brochureUrl}>
                      {getBrochureDisplayName()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0">
                  <a
                    href={form.brochureUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors shadow-2xs"
                  >
                    <ExternalLink size={13} />
                    View PDF
                  </a>
                  <button
                    type="button"
                    onClick={() => brochureInputRef.current?.click()}
                    disabled={brochureUploading}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-white text-gray-700 border border-gray-200 hover:bg-gray-100 transition-colors"
                  >
                    Replace
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      updateField('brochureUrl', '');
                      setBrochureFileName('');
                    }}
                    className="inline-flex items-center p-1.5 rounded-lg text-xs font-bold text-rose-600 hover:bg-rose-100 transition-colors"
                    title="Remove brochure"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ) : (
              /* Upload Action Box */
              <div className="mb-3">
                <button
                  type="button"
                  disabled={brochureUploading}
                  onClick={() => brochureInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-primary/30 hover:border-primary bg-white hover:bg-primary/[0.02] transition-colors rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer group text-center"
                >
                  {brochureUploading ? (
                    <div className="flex items-center gap-2 text-primary font-bold text-sm py-2">
                      <Loader2 size={20} className="animate-spin text-primary" />
                      Uploading Brochure PDF... Please wait
                    </div>
                  ) : (
                    <>
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                        <Upload size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-text group-hover:text-primary transition-colors">
                          Click here to Upload PDF from device
                        </p>
                        <p className="text-xs text-muted mt-0.5">Supports official brochure or layout map (up to 30 MB)</p>
                      </div>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Manual link input toggle / fallback */}
            <div className="mt-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted">Or enter / paste direct download link:</span>
              </div>
              <input
                type="url"
                value={form.brochureUrl}
                onChange={(e) => updateField('brochureUrl', e.target.value)}
                placeholder="https://example.com/project-brochure.pdf"
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-text font-semibold focus:border-primary focus:outline-none"
              />
              <p className="mt-1 text-[11px] text-muted">
                Direct download link for official project brochure or master layout.
              </p>
            </div>
          </div>

          {/* Builder / Developer Project Feature Box */}
          <div className="rounded-2xl border-2 border-primary/20 bg-primary/[0.03] p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                  <Sparkles size={13} />
                  Homepage Spotlight
                </span>
                <h3 className="mt-1 text-base font-extrabold text-text">Direct Builder / Developer Project Spotlight</h3>
                <p className="text-xs font-medium text-muted">Showcase this listing in the dedicated "Builder Projects Spotlight" on the Homepage</p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={form.isDeveloperListing}
                  onChange={(e) => updateField('isDeveloperListing', e.target.checked)}
                  className="peer sr-only"
                />
                <div className="h-6 w-11 rounded-full bg-gray-200 peer-checked:bg-primary peer-focus:outline-none after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
              </label>
            </div>

            {form.isDeveloperListing && (
              <div className="mt-4 pt-4 border-t border-primary/15 space-y-4">
                <div>
                  <label className="block text-sm font-bold text-text mb-1">
                    About Builder / Developer Profile
                  </label>
                  <textarea
                    rows={3}
                    value={form.aboutBuilder}
                    onChange={(e) => updateField('aboutBuilder', e.target.value)}
                    placeholder="Briefly describe the builder's legacy, years of experience, notable completed projects, and quality commitment..."
                    className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-text font-semibold focus:border-primary focus:outline-none text-sm"
                  />
                  <p className="mt-1 text-xs text-muted">This will appear in the dedicated 'About Builder' section on the project details page.</p>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-gray-50/60 p-4">
                  <p className="text-xs font-black uppercase tracking-wider text-muted mb-3">Builder Direct Contact & Sales Office</p>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <label className="flex items-center gap-1 text-xs font-bold text-text mb-1">
                        <Phone size={13} className="text-primary" />
                        Sales Contact Phone
                      </label>
                      <input
                        type="tel"
                        value={form.builderPhone}
                        onChange={(e) => updateField('builderPhone', e.target.value)}
                        placeholder="e.g. +91 98765 43210"
                        className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2.5 text-sm text-text font-semibold focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="flex items-center gap-1 text-xs font-bold text-text mb-1">
                        <MessageCircle size={13} className="text-emerald-600" />
                        WhatsApp Number
                      </label>
                      <input
                        type="tel"
                        value={form.builderWhatsapp}
                        onChange={(e) => updateField('builderWhatsapp', e.target.value)}
                        placeholder="e.g. 919876543210"
                        className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2.5 text-sm text-text font-semibold focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="flex items-center gap-1 text-xs font-bold text-text mb-1">
                        <Mail size={13} className="text-primary" />
                        Official Email
                      </label>
                      <input
                        type="email"
                        value={form.builderEmail}
                        onChange={(e) => updateField('builderEmail', e.target.value)}
                        placeholder="sales@buildergroup.com"
                        className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2.5 text-sm text-text font-semibold focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="mt-3">
                    <label className="flex items-center gap-1 text-xs font-bold text-text mb-1">
                      <MapPin size={13} className="text-primary" />
                      Sales / Site Office Address
                    </label>
                    <input
                      type="text"
                      value={form.builderAddress}
                      onChange={(e) => updateField('builderAddress', e.target.value)}
                      placeholder="e.g. Site Office, Sector 83, Near Expressway"
                      className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2.5 text-sm text-text font-semibold focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="block text-sm font-bold text-text mb-1">State</label>
              <DropdownSelect
                value={form.state}
                onChange={(value) => setForm((current) => ({ ...current, state: value, city: '' }))}
                options={states}
                placeholder="Select state"
                icon={MapPin}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-text mb-1">City</label>
              <DropdownSelect
                value={form.city}
                onChange={(value) => updateField('city', value)}
                options={cities}
                placeholder={form.state ? 'Select city' : 'Select state first'}
                disabled={!form.state}
                icon={MapPin}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-text mb-1">Locality / area</label>
              <input value={form.locality} onChange={(event) => updateField('locality', event.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-text" placeholder="e.g. Sector 82, Bilaspur" required />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <label className="block text-sm font-bold text-text mb-1">Total price (Rs.)</label>
              <input value={form.price} onChange={(event) => updateField('price', event.target.value)} type="number" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-text" placeholder="4200000" required />
            </div>
            <div>
              <label className="block text-sm font-bold text-text mb-1">Plot size (Sq. Yrd)</label>
              <input value={form.size} onChange={(event) => updateField('size', event.target.value)} type="number" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-text" placeholder="300" required />
            </div>
            <div>
              <label className="block text-sm font-bold text-text mb-1">Type</label>
              <DropdownSelect
                value={form.propertyType}
                onChange={(value) => updateField('propertyType', value)}
                options={[
                  { value: 'plot', label: 'Plots / Residential' },
                  { value: 'farmland', label: 'Farm Land' },
                  { value: 'industrial land', label: 'Industrial Land' },
                  { value: 'commercial', label: 'Commercial Plots' },
                  { value: 'new projects', label: 'New Projects' }
                ]}
                icon={Layers}
              />
            </div>
          </div>

          {/* Multiple Available Plot Sizes for Builders & Townships */}
          <div className="rounded-2xl border border-gray-200 bg-gray-50/70 p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <label className="flex items-center gap-2 text-sm font-bold text-text">
                <Layers size={17} className="text-primary" />
                Available Plot Sizes in this Project (Alag-alag Plot Sizes)
              </label>
              <span className="text-xs font-semibold text-muted bg-white px-2.5 py-0.5 rounded-full border border-gray-200">
                Builder / Multiple Sizes
              </span>
            </div>
            <p className="text-xs text-muted mb-3">
              Yaha builder ke project ke alag-alag plot sizes add karein (jaise 100, 120, 150, 180 Sq. Yrd). Buyers listing par har size ka option aur pricing dekh payenge.
            </p>

            {/* Quick Add Buttons */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="text-xs font-bold text-muted mr-1">Quick Add:</span>
              {[100, 120, 135, 150, 180, 200, 250, 300].map((sz) => {
                const isAdded = customPlotSizes.includes(sz);
                return (
                  <button
                    key={sz}
                    type="button"
                    disabled={isAdded}
                    onClick={() => addPlotSize(sz)}
                    className={`text-xs px-2.5 py-1 rounded-lg border font-bold transition-all ${
                      isAdded
                        ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-primary hover:text-primary cursor-pointer'
                    }`}
                  >
                    + {sz} Sq Yd
                  </button>
                );
              })}
            </div>

            {/* Custom Size Input */}
            <div className="flex gap-2 max-w-sm">
              <input
                type="number"
                value={customSizeInput}
                onChange={(e) => setCustomSizeInput(e.target.value)}
                placeholder="Enter size in Sq. Yrd (e.g. 108)"
                className="flex-1 bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs text-text font-semibold focus:border-primary focus:outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  if (customSizeInput && Number(customSizeInput) > 0) {
                    addPlotSize(Number(customSizeInput));
                    setCustomSizeInput('');
                  }
                }}
                className="px-3.5 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-rose-600 transition-colors cursor-pointer"
              >
                Add Size
              </button>
            </div>

            {/* Added Sizes Badges */}
            {customPlotSizes.length > 0 && (
              <div className="mt-3.5 flex flex-wrap gap-2 pt-3 border-t border-gray-200">
                {customPlotSizes.map((sz) => {
                  const estimatedAmount = (Number(form.price) > 0 && Number(form.size) > 0)
                    ? Math.round((Number(form.price) / Number(form.size)) * sz)
                    : 0;
                  const estimatedLabel = estimatedAmount > 9999999
                    ? `₹${(estimatedAmount / 10000000).toFixed(2)} Cr`
                    : (estimatedAmount > 0 ? `₹${(estimatedAmount / 100000).toFixed(2)} L` : '');

                  return (
                    <span
                      key={sz}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-primary/30 rounded-xl text-xs font-bold text-text shadow-xs"
                    >
                      <span className="text-primary">{sz} Sq. Yrd</span>
                      {estimatedLabel && <span className="text-muted font-normal">({estimatedLabel})</span>}
                      <button
                        type="button"
                        onClick={() => removePlotSize(sz)}
                        className="ml-1 text-gray-400 hover:text-rose-600 font-bold cursor-pointer"
                        title="Remove size"
                      >
                        ×
                      </button>
                    </span>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-text mb-1">Property photos</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageFiles}
              className="w-full text-sm text-text file:border-0 file:bg-primary/10 file:px-4 file:py-2 file:text-primary file:font-semibold"
            />
            {uploadConfig.provider === 'cloudinary' && uploadConfig.uploadPreset && uploadConfig.cloudName ? (
              <p className="mt-2 text-sm text-muted">Photos will be uploaded securely and shown on your listing.</p>
            ) : (
              <p className="mt-2 text-sm text-rose-600">{uploadConfig.message || 'Photo upload is not ready yet. Please check upload settings.'}</p>
            )}
            {imagePreviews.length ? (
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {imagePreviews.map((preview, index) => (
                  <div key={preview.url} className="relative overflow-hidden rounded-2xl border border-border bg-surface group">
                    <img src={preview.url} alt={preview.name} className="h-32 w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 rounded-full bg-black/60 p-1.5 text-white hover:bg-black/85 transition-colors animate-fade-in"
                      title="Remove image"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            ) : null}
            <p className="mt-2 text-sm text-muted">Upload clear photos. Front road, layout, entrance, and plot view work best.</p>
          </div>

          {/* Property Video Upload */}
          <div className="rounded-2xl border border-gray-200 bg-gray-50/70 p-4 sm:p-5">
            <div className="flex items-center justify-between gap-2 mb-2">
              <label className="flex items-center gap-2 text-sm font-bold text-text">
                <Video size={18} className="text-primary" />
                Property Video / Walkthrough (Photos ke saath video)
              </label>
              <span className="text-xs font-semibold text-muted bg-white px-2.5 py-0.5 rounded-full border border-gray-200">
                Optional
              </span>
            </div>
            <p className="text-xs text-muted mb-3">
              Upload a layout walkthrough video (MP4, WebM, MOV up to 100MB) OR paste a YouTube link.
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              {/* File upload button */}
              <div>
                <label className="block text-xs font-bold text-text mb-1">Upload video file</label>
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime,video/x-msvideo,video/*"
                  onChange={handleVideoFiles}
                  className="w-full text-xs text-text file:mr-2 file:border-0 file:bg-primary/10 file:px-3 file:py-2 file:text-primary file:font-bold file:rounded-lg file:cursor-pointer"
                />
              </div>

              {/* Or paste link */}
              <div>
                <label className="block text-xs font-bold text-text mb-1">Or paste YouTube / video link</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={videoUrlInput}
                    onChange={(e) => setVideoUrlInput(e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                    className="flex-1 bg-white border border-gray-300 rounded-xl px-3 py-1.5 text-xs text-text font-semibold focus:border-primary focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddVideoUrl}
                    className="px-3 py-1.5 bg-gray-900 text-white text-xs font-bold rounded-xl hover:bg-black transition-colors cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            {/* Video Previews */}
            {videoPreviews.length > 0 && (
              <div className="mt-4 space-y-3">
                {videoPreviews.map((preview, index) => (
                  <div key={preview.url} className="relative overflow-hidden rounded-2xl border border-gray-300 bg-black/90 p-3 text-white">
                    <div className="flex flex-col sm:flex-row items-center gap-3">
                      <div className="relative w-full sm:w-48 h-28 bg-black rounded-xl overflow-hidden flex items-center justify-center border border-white/10">
                        {preview.isExternal ? (
                          <div className="flex flex-col items-center justify-center p-2 text-center text-xs">
                            <Play size={24} className="text-primary mb-1 fill-current" />
                            <span className="font-bold truncate max-w-full">External Walkthrough</span>
                          </div>
                        ) : (
                          <video
                            src={preview.url}
                            controls
                            className="w-full h-full object-contain"
                          />
                        )}
                      </div>
                      <div className="flex-1 w-full flex flex-col justify-between py-1">
                        <div>
                          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                            <CheckCircle2 size={14} />
                            {preview.isExisting ? 'Ready on listing' : 'Selected for upload'}
                          </div>
                          <p className="text-sm font-bold text-white mt-1 truncate">{preview.name}</p>
                          {preview.size && <p className="text-xs text-gray-400 mt-0.5">Size: {preview.size}</p>}
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => removeVideo(index)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 text-xs font-bold transition-colors cursor-pointer"
                          >
                            <Trash2 size={12} />
                            Remove Video
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {videoUploading && (
              <div className="mt-3 flex items-center gap-2 text-xs font-bold text-primary animate-pulse">
                <Loader2 size={14} className="animate-spin" />
                Uploading property walkthrough video to cloud...
              </div>
            )}
          </div>

          {/* Site Plan & Master Layout */}
          <div className="rounded-2xl border border-gray-200 bg-gray-50/70 p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <label className="flex items-center gap-2 text-sm font-bold text-text">
                <Layers size={18} className="text-primary" />
                Site Plan & Master Layout (साइट प्लान / मास्टर लेआउट नक्शा)
              </label>
              <span className="text-xs font-semibold text-muted bg-white px-2.5 py-0.5 rounded-full border border-gray-200">
                Optional
              </span>
            </div>
            <p className="text-xs text-muted mb-3">
              Upload project layout, plot demarcation, or sector master plan image (PNG, JPG, WebP) or paste an image link. This appears in the 'Site Plan & Master Layout' section.
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-text mb-1">Upload site plan image</label>
                <input
                  ref={sitePlanInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/*"
                  onChange={handleSitePlanUpload}
                  className="w-full text-xs text-text file:mr-2 file:border-0 file:bg-primary/10 file:px-3 file:py-2 file:text-primary file:font-bold file:rounded-lg file:cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text mb-1">Or paste image URL / link</label>
                <input
                  type="url"
                  value={form.sitePlanUrl}
                  onChange={(e) => updateField('sitePlanUrl', e.target.value)}
                  placeholder="https://example.com/siteplan.jpg"
                  className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs text-text font-semibold focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            {sitePlanUploading && (
              <div className="mt-3 flex items-center gap-2 text-xs font-bold text-primary animate-pulse">
                <Loader2 size={14} className="animate-spin" />
                Uploading site plan to cloud...
              </div>
            )}

            {form.sitePlanUrl && (
              <div className="mt-4 relative overflow-hidden rounded-2xl border border-gray-300 bg-slate-900 p-3 text-white">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="relative w-full sm:w-48 h-32 bg-slate-950 rounded-xl overflow-hidden flex items-center justify-center border border-white/10 shrink-0">
                    <img
                      src={form.sitePlanUrl}
                      alt="Site Plan Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => { e.currentTarget.src = '/hero-bg.jpg'; }}
                    />
                  </div>
                  <div className="flex-1 w-full flex flex-col justify-between py-1">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                        <CheckCircle2 size={14} />
                        Site plan ready on listing
                      </div>
                      <p className="text-sm font-bold text-white mt-1">Official Master Layout Plan</p>
                      <p className="text-xs text-gray-300 mt-0.5 truncate max-w-md">{form.sitePlanUrl}</p>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <a
                        href={form.sitePlanUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-white/20 text-white hover:bg-white/30 text-xs font-bold transition-colors"
                      >
                        <ExternalLink size={12} /> View Full
                      </a>
                      <button
                        type="button"
                        onClick={() => updateField('sitePlanUrl', '')}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 text-xs font-bold transition-colors cursor-pointer"
                      >
                        <Trash2 size={12} /> Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Key Landmark Distances & Connectivity */}
          <div className="rounded-2xl border border-gray-200 bg-gray-50/70 p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-text">
                  <Route size={18} className="text-primary" />
                  Key Landmark Distances & Connectivity (आस-पास की जरूरी जगहें और दूरी)
                </label>
                <p className="text-xs text-muted mt-0.5">
                  Specify travel times / distances to expressway, metro, schools, hospitals, airport, etc.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleAddLandmark}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-xs font-bold text-white hover:bg-rose-600 transition-colors shadow-xs cursor-pointer"
                >
                  <Plus size={13} /> Add Landmark
                </button>
                <button
                  type="button"
                  onClick={handleLoadDefaultLandmarks}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-gray-300 bg-white px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors shadow-xs cursor-pointer"
                >
                  <RefreshCw size={12} /> Load 4 Standard Defaults
                </button>
                {keyLandmarks.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearAllLandmarks}
                    className="inline-flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer"
                  >
                    <Trash2 size={12} /> Clear
                  </button>
                )}
              </div>
            </div>

            {/* List of Editable Landmarks */}
            {keyLandmarks.length > 0 ? (
              <div className="mt-3 space-y-3">
                {keyLandmarks.map((lm, idx) => (
                  <div key={idx} className="rounded-xl border border-gray-200 bg-white p-3.5 shadow-xs space-y-2.5">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-md bg-primary/10 text-[11px] font-black text-primary">
                          #{idx + 1}
                        </span>
                        <span className="text-xs font-bold text-text">
                          {lm.title || `Landmark ${idx + 1}`}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveLandmark(idx)}
                        className="text-gray-400 hover:text-rose-600 transition-colors p-1 cursor-pointer"
                        title="Remove Landmark"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    <div className="grid gap-2.5 sm:grid-cols-12">
                      {/* Icon */}
                      <div className="sm:col-span-3">
                        <label className="block text-[11px] font-bold text-muted mb-1">Icon</label>
                        <select
                          value={lm.icon || 'Route'}
                          onChange={(e) => handleUpdateLandmarkField(idx, 'icon', e.target.value)}
                          className="w-full rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-xs font-bold text-text outline-none focus:border-primary"
                        >
                          {AVAILABLE_LANDMARK_ICONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Distance */}
                      <div className="sm:col-span-3">
                        <label className="block text-[11px] font-bold text-muted mb-1">Distance / Time</label>
                        <input
                          type="text"
                          value={lm.distance || ''}
                          onChange={(e) => handleUpdateLandmarkField(idx, 'distance', e.target.value)}
                          placeholder="e.g. 5 - 10 Mins"
                          className="w-full rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-xs font-bold text-text outline-none focus:border-primary"
                        />
                      </div>

                      {/* Title */}
                      <div className="sm:col-span-6">
                        <label className="block text-[11px] font-bold text-muted mb-1">Landmark Title</label>
                        <input
                          type="text"
                          value={lm.title || ''}
                          onChange={(e) => handleUpdateLandmarkField(idx, 'title', e.target.value)}
                          placeholder="e.g. Expressway & Highway"
                          className="w-full rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-xs font-bold text-text outline-none focus:border-primary"
                        />
                      </div>

                      {/* Subtitle */}
                      <div className="sm:col-span-12">
                        <label className="block text-[11px] font-bold text-muted mb-1">Subtitle / Connectivity Details</label>
                        <input
                          type="text"
                          value={lm.subtitle || ''}
                          onChange={(e) => handleUpdateLandmarkField(idx, 'subtitle', e.target.value)}
                          placeholder="e.g. Direct signal-free connectivity to main arterial highway"
                          className="w-full rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-xs font-medium text-text outline-none focus:border-primary"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {/* Live Preview Card Grid */}
                <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-3.5 space-y-2">
                  <p className="text-[11px] font-extrabold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                    <Eye size={13} /> Live Preview on Listing Page:
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                    {keyLandmarks.map((lm, idx) => (
                      <div key={idx} className="rounded-lg border border-amber-200/80 bg-white p-2.5 shadow-xs">
                        <p className="text-[11px] font-bold flex items-center gap-1 text-primary">
                          {renderPostLandmarkIcon(lm.icon, 13)} {lm.distance || 'Nearby'}
                        </p>
                        <p className="mt-1 text-xs font-bold text-text truncate">
                          {lm.title || 'Landmark'}
                        </p>
                        {lm.subtitle && (
                          <p className="text-[10px] text-muted truncate mt-0.5">{lm.subtitle}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-3 rounded-xl border border-dashed border-gray-300 p-5 text-center bg-white/60">
                <p className="text-xs font-bold text-muted">No custom landmarks added.</p>
                <p className="text-[11px] text-muted mt-0.5">Click "Load 4 Standard Defaults" or "+ Add Landmark" to set key distances.</p>
              </div>
            )}
          </div>

          {/* Layout Amenities Checkboxes */}
          <div className="border-t border-gray-100 pt-5">
            <label className="block text-sm font-bold text-text mb-3">What buyers get in this layout</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 bg-gray-50 p-5 rounded-2xl border border-gray-100">
              {DEFAULT_AMENITIES.map((amenity) => {
                const isChecked = checkedAmenities.includes(amenity);
                return (
                  <label
                    key={amenity}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-sm font-semibold cursor-pointer transition-all duration-200 ${
                      isChecked
                        ? 'border-primary bg-primary/5 text-primary shadow-sm'
                        : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleAmenity(amenity)}
                      className="h-4.5 w-4.5 rounded text-primary focus:ring-primary accent-primary"
                    />
                    {amenity}
                  </label>
                );
              })}
              {/* Other Option checkbox */}
              <label
                className={`flex items-center gap-3 p-3 rounded-xl border text-sm font-semibold cursor-pointer transition-all duration-200 ${
                  hasOtherAmenity
                    ? 'border-primary bg-primary/5 text-primary shadow-sm'
                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={hasOtherAmenity}
                  onChange={() => setHasOtherAmenity(!hasOtherAmenity)}
                  className="h-4.5 w-4.5 rounded text-primary focus:ring-primary accent-primary"
                />
                Other amenities
              </label>
            </div>

            {hasOtherAmenity && (
              <div className="mt-3">
                <label className="block text-xs font-bold text-muted mb-1">Add other amenities, separated by commas</label>
                <input
                  value={otherAmenities}
                  onChange={(event) => setOtherAmenities(event.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-text focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  placeholder="e.g. Street lights, kids park, open gym"
                />
              </div>
            )}
          </div>

          
          <button disabled={loading} className="w-full bg-primary hover:bg-rose-600 disabled:opacity-60 text-white font-bold py-4 rounded-xl mt-4">
            {loading ? 'Saving...' : editId ? 'Save Changes' : 'Post Property'}
          </button>
        </form>
        )}
      </div>
    </div>
  );
};

export default PostProperty;
