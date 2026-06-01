export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/plotadmin', '/dashboard', '/favourites', '/history', '/api/'],
    },
    sitemap: 'https://plotyards.com/sitemap.xml',
  }
}
