// Helper for Server-Side SEO Fetching
// Using direct IP and port to bypass Hostinger Nginx firewall block against Vercel IPs during SSR.
const API_BASE_URL = 'http://187.127.175.192:5000/api';

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
