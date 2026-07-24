const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://187.127.153.144/api';

export const fetchPropertySeo = async (id) => {
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
