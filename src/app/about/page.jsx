import PageComponent from '../../views/StaticPage';

export const metadata = {
  title: { absolute: 'About Plotyards | Premium Real Estate & Investment Startup' },
  description: 'Learn about Plotyards, a leading startup revolutionizing real estate and land investment in India by offering better ROI than the stock market.',
  keywords: ['about plotyards', 'real estate startup', 'land investment startup', 'India', 'plotyards company'],
  openGraph: {
    title: 'About Plotyards',
    description: 'Learn about Plotyards, a leading startup revolutionizing real estate and land investment in India.',
    type: 'website'
  }
};

export default function Page(props) {
  return <PageComponent {...props} type="about" />;
}
