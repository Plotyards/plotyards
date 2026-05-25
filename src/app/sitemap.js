const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default async function sitemap() {
  // Using a default generic production domain, can be updated later if needed
  const baseUrl = 'https://plotyards.in';

  let properties = [];
  let blogs = [];

  try {
    const [propRes, blogRes] = await Promise.all([
      fetch(`${API_BASE_URL}/properties?limit=500`),
      fetch(`${API_BASE_URL}/blogs?limit=100`)
    ]);

    if (propRes.ok) {
      const propData = await propRes.json();
      properties = propData.properties || [];
    }

    if (blogRes.ok) {
      const blogData = await blogRes.json();
      blogs = blogData.blogs || [];
    }
  } catch (error) {
    console.error('Error fetching data for sitemap:', error.message || 'Network Error');
  }

  const propertyUrls = properties.map((property) => ({
    url: `${baseUrl}/property/${property._id || property.id}`,
    lastModified: new Date(property.updatedAt || new Date()),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const blogUrls = blogs.map((blog) => ({
    url: `${baseUrl}/blogs/${blog.slug}`,
    lastModified: new Date(blog.updatedAt || new Date()),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  const staticRoutes = [
    '',
    '/about',
    '/listings',
    '/blogs',
    '/contact',
    '/faq',
    '/terms',
    '/privacy',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: route === '' ? 1.0 : 0.8,
  }));

  return [...staticRoutes, ...propertyUrls, ...blogUrls];
}
