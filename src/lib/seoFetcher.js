const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://srv1853103.hstgr.cloud/api';
const API_BASE_URL = rawApiUrl.includes('187.127.') || rawApiUrl.startsWith('http://localhost')
  ? 'https://srv1853103.hstgr.cloud/api'
  : rawApiUrl.replace(/\/+$/, '');

export const fetchPropertySeo = async (id) => {
  if (!id || !/^[0-9a-fA-F]{24}$/.test(String(id))) {
    return null;
  }
  try {
    const res = await fetch(`${API_BASE_URL}/properties/${id}`, {
      cache: 'no-store' // Always fetch real-time metadata
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error('Error fetching property SEO data:', error.message || 'Fetch Failed');
    return null;
  }
};

export const fetchBlogSeo = async (slug) => {
  try {
    const res = await fetch(`${API_BASE_URL}/blogs/${slug}`, {
      cache: 'no-store'
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error('Error fetching blog SEO data:', error.message || 'Fetch Failed');
    return null;
  }
};
