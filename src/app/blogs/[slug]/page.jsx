import PageComponent from '../../../views/BlogDetails';
import { fetchBlogSeo } from '../../../lib/seoFetcher';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const data = await fetchBlogSeo(slug);
  const blog = data?.blog;

  if (!blog) {
    return {
      title: { absolute: 'Blog Not Found | Plotyards' },
      description: 'The blog article you are looking for does not exist.'
    };
  }

  const title = `${blog.title} | Plotyards Blog`;
  const description = blog.excerpt || blog.content?.substring(0, 160) || 'Read the latest insights on real estate investment and the stock market in India on Plotyards.';
  const image = blog.coverImage || 'https://plotyard.vercel.app/og-image.jpg';

  return {
    title: { absolute: title },
    description,
    keywords: ['investment', 'real estate investment', 'land', 'India', 'stock market', ...(blog.tags || []), 'plotyards blog'],
    openGraph: {
      title,
      description,
      images: [image],
      type: 'article'
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
