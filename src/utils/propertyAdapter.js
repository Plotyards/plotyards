const PROPERTY_TYPE_LABELS = {
  plot: 'Residential',
  residential: 'Residential',
  land: 'Residential',
  villa: 'Residential',
  apartment: 'Residential',
  commercial: 'Commercial',
  farmland: 'Farm Land',
  farmhouse: 'Farm Land',
  'farm land': 'Farm Land',
  'farm house': 'Farm Land',
  'industrial': 'Industrial Land',
  'industrial land': 'Industrial Land',
  'new projects': 'New Projects',
  'new project': 'New Projects'
};

export const normalizePropertyType = (type = '') => {
  const normalized = String(type).trim().toLowerCase().replace(/[\s_-]+/g, ' ');

  if (['commercial'].includes(normalized)) return 'commercial';
  if (['farm land', 'farmland', 'farm', 'farmhouse', 'farm house', 'farmhouses'].includes(normalized)) return 'farmland';
  if (['residential', 'plot', 'plots', 'land', 'villa', 'apartment'].includes(normalized)) return 'plot';
  if (['industrial', 'industrial land'].includes(normalized)) return 'industrial land';
  if (['new projects', 'new project'].includes(normalized)) return 'new projects';

  return normalized || 'plot';
};

export const getPropertyTypeLabel = (type = '') => PROPERTY_TYPE_LABELS[normalizePropertyType(type)] || String(type || 'Plot');

export const propertyTypeToApiValue = normalizePropertyType;

export const adaptProperty = (property) => {
  if (!property) return null;
  const image = property.image || property.images?.[0]?.url || 'https://images.unsplash.com/photo-1524813686514-a57563d77965?q=80&w=1032&auto=format&fit=crop';
  const city = property.city || property.location?.city || '';
  const locality = property.locality || property.location?.locality || '';
  const sizeValue = property.sizeValue ?? property.size?.value ?? 0;
  const priceValue = property.priceValue ?? property.price?.amount ?? 0;
  const rawType = property.propertyType || property.type || 'plot';
  const broker = property.broker
    ? {
        ...property.broker,
        companyType: property.broker.brokerProfile?.companyType || 'broker',
        phone: property.broker.brokerProfile?.contactPhone || property.broker.phone,
        whatsapp: property.broker.brokerProfile?.contactPhone || property.broker.phone
      }
    : property.broker;

  const photoCount = Array.isArray(property.images) && property.images.length > 0 
    ? property.images.length 
    : (property.image ? 1 : 0);

  const rawVideos = Array.isArray(property.videos) 
    ? property.videos 
    : (property.videoUrl ? [{ url: property.videoUrl, title: 'Video Tour' }] : (property.video ? [{ url: property.video, title: 'Video Tour' }] : []));
  const videos = rawVideos.map(v => typeof v === 'string' ? { url: v, title: 'Video Tour' } : v).filter(v => Boolean(v?.url));
  const videoUrl = property.videoUrl || videos[0]?.url || property.video || '';
  const videoCount = videos.length;

  // Adapt availableSizes & plotSizes
  let availableSizes = [];
  if (Array.isArray(property.availableSizes) && property.availableSizes.length > 0) {
    availableSizes = property.availableSizes.map((item) => {
      if (typeof item === 'number') {
        const itemPrice = (sizeValue > 0 && priceValue > 0) ? Math.round((priceValue / sizeValue) * item) : 0;
        return {
          size: item,
          unit: 'Sq. Yrd',
          price: itemPrice,
          priceLabel: itemPrice > 9999999 ? `₹${(itemPrice / 10000000).toFixed(2)} Cr` : (itemPrice > 0 ? `₹${(itemPrice / 100000).toFixed(2)} L` : '')
        };
      }
      const s = Number(item.size || item.value) || 0;
      const p = Number(item.price || item.amount) || ((sizeValue > 0 && priceValue > 0 && s > 0) ? Math.round((priceValue / sizeValue) * s) : 0);
      const label = item.priceLabel || (p > 9999999 ? `₹${(p / 10000000).toFixed(2)} Cr` : (p > 0 ? `₹${(p / 100000).toFixed(2)} L` : ''));
      return {
        size: s,
        unit: item.unit || 'Sq. Yrd',
        price: p,
        priceLabel: label,
        dimensions: item.dimensions || ''
      };
    }).filter(s => s.size > 0);
  } else if (Array.isArray(property.plotSizes) && property.plotSizes.length > 0) {
    availableSizes = property.plotSizes.map((s) => {
      const numMatch = String(s).match(/(\d+(?:\.\d+)?)/);
      const sizeNum = numMatch ? Number(numMatch[1]) : 0;
      const itemPrice = (sizeValue > 0 && priceValue > 0 && sizeNum > 0) ? Math.round((priceValue / sizeValue) * sizeNum) : 0;
      return {
        size: sizeNum,
        unit: 'Sq. Yrd',
        label: String(s),
        price: itemPrice,
        priceLabel: itemPrice > 9999999 ? `₹${(itemPrice / 10000000).toFixed(2)} Cr` : (itemPrice > 0 ? `₹${(itemPrice / 100000).toFixed(2)} L` : '')
      };
    }).filter(s => s.size > 0);
  }

  // Description-based size extraction or default variation for multi-plot projects
  if (availableSizes.length === 0 && sizeValue > 0) {
    const descMatch = String(property.description || '').match(/(?:plot\s*sizes?|sizes?|available\s*sizes?)\s*[:\-–]\s*([^\n\r]+)/i);
    if (descMatch) {
      const extractedNums = descMatch[1].match(/\d+(?:\.\d+)?/g);
      if (extractedNums && extractedNums.length > 1) {
        availableSizes = extractedNums.map((n) => {
          const s = Number(n);
          const p = (sizeValue > 0 && priceValue > 0) ? Math.round((priceValue / sizeValue) * s) : 0;
          return {
            size: s,
            unit: 'Sq. Yrd',
            price: p,
            priceLabel: p > 9999999 ? `₹${(p / 10000000).toFixed(2)} Cr` : (p > 0 ? `₹${(p / 100000).toFixed(2)} L` : '')
          };
        }).filter(s => s.size >= 30 && s.size <= 5000);
      }
    }
  }

  // Ensure current property size is in availableSizes if not already
  if (sizeValue > 0 && !availableSizes.some(s => s.size === sizeValue)) {
    availableSizes = [
      {
        size: sizeValue,
        unit: 'Sq. Yrd',
        price: priceValue,
        priceLabel: priceValue > 9999999 ? `₹${(priceValue / 10000000).toFixed(2)} Cr` : (priceValue > 0 ? `₹${(priceValue / 100000).toFixed(2)} L` : '')
      },
      ...availableSizes
    ].sort((a, b) => a.size - b.size);
  }

  return {
    ...property,
    broker,
    id: property.id || property._id,
    title: property.title,
    image,
    city,
    locality,
    location: typeof property.location === 'string'
      ? property.location
      : [locality, city].filter(Boolean).join(', '),
    corridor: property.corridor || property.location?.address || property.location?.state || 'Growth corridor',
    price: priceValue > 0
      ? (priceValue > 9999999 ? `Rs. ${(priceValue / 10000000).toFixed(2)} Cr` : `Rs. ${(priceValue / 100000).toFixed(2)} L`)
      : (typeof property.price === 'string' ? property.price : property.price?.label || 'Price on request'),
    priceValue,
    rate: property.rate || (sizeValue > 0 && priceValue > 0 ? `Rs. ${Math.round(priceValue / sizeValue).toLocaleString('en-IN')} / Sq. Yrd` : 'Price on request'),
    size: sizeValue > 0
      ? `${sizeValue} Sq. Yrd`
      : (typeof property.size === 'string' ? property.size.replace(/sq\.?yd/gi, 'Sq. Yrd') : `${sizeValue || 0} Sq. Yrd`),
    sizeValue,
    propertyType: normalizePropertyType(rawType),
    type: getPropertyTypeLabel(rawType),
    status: property.status,
    approved: property.approved ?? (property.status ? property.status === 'approved' : Boolean(property.reraApproved)),
    featured: Boolean(property.featured),
    roi: property.roi || '12%',
    tags: property.tags || property.amenities || [],
    photoCount,
    videos,
    videoUrl,
    videoCount,
    availableSizes,
    plotSizes: availableSizes.map(s => `${s.size} ${s.unit || 'Sq. Yrd'}`),
    isDeveloperAccount: Boolean(
      property.isDeveloperListing ||
      broker?.companyType === 'developer' ||
      broker?.brokerProfile?.companyType === 'developer' ||
      broker?.role === 'developer'
    ),
    isDeveloperListing: Boolean(
      property.isDeveloperListing ||
      broker?.companyType === 'developer' ||
      broker?.brokerProfile?.companyType === 'developer' ||
      broker?.role === 'developer'
    ),
    builderName: (
      property.isDeveloperListing ||
      broker?.companyType === 'developer' ||
      broker?.brokerProfile?.companyType === 'developer' ||
      broker?.role === 'developer'
    ) ? (property.builderName || broker?.brokerProfile?.companyName || broker?.name || '') : '',
    aboutBuilder: property.aboutBuilder || '',
    brochureUrl: property.brochureUrl || '',
    sitePlanUrl: property.sitePlanUrl || property.sitePlan || '',
    keyLandmarks: Array.isArray(property.keyLandmarks) ? property.keyLandmarks : [],
    builderContact: property.builderContact || {
      phone: property.broker?.phone || '',
      whatsapp: property.broker?.whatsapp || '',
      email: property.broker?.email || '',
      address: property.broker?.brokerProfile?.businessAddress || ''
    },
    reraNumber: property.reraNumber || ''
  };
};

export const adaptProperties = (properties = []) => properties.map(adaptProperty).filter(Boolean);
