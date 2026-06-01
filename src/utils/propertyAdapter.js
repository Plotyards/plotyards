const PROPERTY_TYPE_LABELS = {
  plot: 'Residential',
  residential: 'Residential',
  land: 'Residential',
  villa: 'Residential',
  apartment: 'Residential',
  commercial: 'Commercial',
  farmland: 'Farm Land',
  'farm land': 'Farm Land',
  'industrial': 'Industrial Land',
  'industrial land': 'Industrial Land',
  'new projects': 'New Projects',
  'new project': 'New Projects'
};

export const normalizePropertyType = (type = '') => {
  const normalized = String(type).trim().toLowerCase().replace(/[\s_-]+/g, ' ');

  if (['commercial'].includes(normalized)) return 'commercial';
  if (['farm land', 'farmland', 'farm'].includes(normalized)) return 'farmland';
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
        phone: property.broker.brokerProfile?.contactPhone || property.broker.phone,
        whatsapp: property.broker.brokerProfile?.contactPhone || property.broker.phone
      }
    : property.broker;

  const photoCount = Array.isArray(property.images) && property.images.length > 0 
    ? property.images.length 
    : (property.image ? 1 : 0);

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
    price: typeof property.price === 'string'
      ? property.price
      : property.price?.label || `Rs. ${(priceValue / 100000).toFixed(2)} L`,
    priceValue,
    rate: property.rate || (sizeValue ? `Rs. ${Math.round(priceValue / sizeValue).toLocaleString('en-IN')} / sq.yd` : 'Price on request'),
    size: typeof property.size === 'string'
      ? property.size
      : `${sizeValue || 0} ${property.size?.unit || 'sqyd'}`,
    sizeValue,
    propertyType: normalizePropertyType(rawType),
    type: getPropertyTypeLabel(rawType),
    status: property.status,
    approved: property.approved ?? (property.status ? property.status === 'approved' : Boolean(property.reraApproved)),
    featured: Boolean(property.featured),
    roi: property.roi || '12%',
    tags: property.tags || property.amenities || [],
    photoCount
  };
};

export const adaptProperties = (properties = []) => properties.map(adaptProperty).filter(Boolean);
