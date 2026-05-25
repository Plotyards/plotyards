import PageComponent from '../../../views/PropertyDetails';
import { fetchPropertySeo } from '../../../lib/seoFetcher';
import { propertyListings } from '../../../data/properties';

export async function generateMetadata({ params }) {
  const { id } = await params;
  let property = null;

  try {
    const data = await fetchPropertySeo(id);
    property = data?.property;
  } catch (err) {
    // ignore
  }

  // Fallback to local data if API fails or ID is local (e.g., '1')
  if (!property) {
    property = propertyListings.find((listing) => String(listing.id) === String(id)) || propertyListings[0];
  }

  if (!property) {
    return {
      title: { absolute: 'Property Not Found | Plotyards' },
      description: 'The property you are looking for does not exist or has been removed.'
    };
  }

  const title = `${property.title} | Plotyards Investment`;
  const description = property.description?.substring(0, 160) || `Invest in ${property.title} located in ${property.city}. Explore premium plot and land opportunities in India on Plotyards.`;
  const image = property.images?.[0]?.url || 'https://plotyard.vercel.app/og-image.jpg';

  return {
    title: { absolute: title },
    description,
    keywords: ['investment', 'real estate investment', 'land', 'India', property.city, property.type, 'plotyards'],
    openGraph: {
      title,
      description,
      images: [image],
      type: 'website'
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image]
    }
  };
}

export default function Page(props) {
  return <PageComponent {...props} />;
}
