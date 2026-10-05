"use client";

import { useEffect, useState } from 'react';
import { Building2, FileText, Layers, Mail, MapPin, MessageCircle, Phone, ShieldCheck, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

import DropdownSelect from '../components/DropdownSelect';
import { apiRequest } from '../lib/api';
import { useAuth } from '../context/auth';

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

const DEFAULT_DOCUMENTS = [
  'RERA approval copy',
  'Clear title verification',
  'Layout and plot demarcation',
  'Ready registration support'
];

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
    reraNumber: ''
  });
  const [checkedAmenities, setCheckedAmenities] = useState([]);
  const [hasOtherAmenity, setHasOtherAmenity] = useState(false);
  const [otherAmenities, setOtherAmenities] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [uploadConfig, setUploadConfig] = useState({ provider: 'manual', uploadPreset: '', cloudName: '', message: '' });

  const updateField = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const toggleAmenity = (amenity) => {
    setCheckedAmenities((prev) =>
      prev.includes(amenity)
        ? prev.filter((item) => item !== amenity)
        : [...prev, amenity]
    );
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
            documentsVerified: prop.documentsVerified || [],
            isDeveloperListing: Boolean(prop.isDeveloperListing),
            builderName: prop.builderName || '',
            aboutBuilder: prop.aboutBuilder || '',
            builderPhone: prop.builderContact?.phone || '',
            builderWhatsapp: prop.builderContact?.whatsapp || '',
            builderEmail: prop.builderContact?.email || '',
            builderAddress: prop.builderContact?.address || '',
            reraNumber: prop.reraNumber || ''
          });

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
    const newFiles = Array.from(event.target.files);
    const currentTotal = imagePreviews.length;
    const availableSlots = 4 - currentTotal;
    
    if (availableSlots <= 0) {
      alert("You have already reached the limit of 4 images.");
      return;
    }
    
    if (newFiles.length > availableSlots) {
      alert(`You can only have up to 4 images. You currently have ${currentTotal} images, so you can only upload up to ${availableSlots} more.`);
    }
    
    const slicedFiles = newFiles.slice(0, availableSlots);
    
    setImageFiles((prev) => [...prev, ...slicedFiles]);
    
    const newPreviews = slicedFiles.map((file) => ({
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
          roi: form.roi || '12%',
          images,
          amenities: allAmenities,
          documentsVerified: form.documentsVerified || [],
          reraApproved: form.propertyType === 'farmland' ? false : form.reraApproved,
          isDeveloperListing: form.isDeveloperListing,
          builderName: form.isDeveloperListing ? form.builderName : '',
          aboutBuilder: form.isDeveloperListing ? form.aboutBuilder : '',
          builderContact: form.isDeveloperListing ? {
            phone: form.builderPhone,
            whatsapp: form.builderWhatsapp,
            email: form.builderEmail,
            address: form.builderAddress
          } : undefined,
          reraNumber: form.reraNumber || ''
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
            <input value={form.title} onChange={(event) => updateField('title', event.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-text" placeholder="e.g. 300 sqyd plot near Shadnagar ORR" required />
          </div>
          <div>
            <label className="block text-sm font-bold text-text mb-1">Short description</label>
            <textarea value={form.description} onChange={(event) => updateField('description', event.target.value)} className="min-h-28 w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-text" placeholder="Mention approvals, road access, nearby landmarks, payment terms, and anything a buyer should know before calling." />
          </div>

          {/* Builder / Developer Project Feature Box */}
          <div className="rounded-2xl border-2 border-primary/20 bg-primary/[0.03] p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                  <Sparkles size={13} />
                  Homepage Spotlight
                </span>
                <h3 className="mt-1 text-base font-extrabold text-text">Builder / Developer Project</h3>
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
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="flex items-center gap-1.5 text-sm font-bold text-text mb-1">
                      <Building2 size={16} className="text-primary" />
                      Builder / Company Name <span className="text-primary">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.builderName}
                      onChange={(e) => updateField('builderName', e.target.value)}
                      placeholder="e.g. DLF, Godrej Properties, BPTP, M3M, Omaxe"
                      className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-text font-semibold focus:border-primary focus:outline-none"
                      required={form.isDeveloperListing}
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-1.5 text-sm font-bold text-text mb-1">
                      <FileText size={16} className="text-primary" />
                      RERA Registration Number
                    </label>
                    <input
                      type="text"
                      value={form.reraNumber}
                      onChange={(e) => updateField('reraNumber', e.target.value)}
                      placeholder="e.g. UPRERAPRJ12345 / HRERA-PKL-123-2024"
                      className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-text font-semibold focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

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
              <input value={form.locality} onChange={(event) => updateField('locality', event.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-text" placeholder="Shadnagar" required />
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
                  { value: 'farmland', label: 'Farmhouse' },
                  { value: 'industrial land', label: 'Industrial Land' },
                  { value: 'commercial', label: 'Commercial Plots' },
                  { value: 'new projects', label: 'New Projects' }
                ]}
                icon={Layers}
              />
            </div>
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
            <p className="mt-2 text-sm text-muted">Add up to 4 clear photos. Front road, layout, entrance, and plot view work best.</p>
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

          {/* Verified Documents Checkboxes */}
          <div className="border-t border-gray-100 pt-5">
            <label className="block text-sm font-bold text-text mb-3">Documents available for buyers</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-gray-50 p-5 rounded-2xl border border-gray-100">
              {DEFAULT_DOCUMENTS.filter(doc => form.propertyType === 'farmland' ? doc !== 'RERA approval copy' : true).map((doc) => {
                const isChecked = (form.documentsVerified || []).includes(doc);
                return (
                  <label
                    key={doc}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-sm font-semibold cursor-pointer transition-all duration-200 ${
                      isChecked
                        ? 'border-primary bg-primary/5 text-primary shadow-sm'
                        : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleDocument(doc)}
                      className="h-4.5 w-4.5 rounded text-primary focus:ring-primary accent-primary"
                    />
                    {doc}
                  </label>
                );
              })}
            </div>
          </div>
          {form.propertyType !== 'farmland' && (
            <label className="flex items-center gap-2 text-sm font-bold text-text">
              <input type="checkbox" checked={form.reraApproved} onChange={(event) => updateField('reraApproved', event.target.checked)} className="accent-primary" />
              Verified / registration available
            </label>
          )}
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
