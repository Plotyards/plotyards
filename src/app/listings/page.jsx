import PageComponent from '../../views/Listings';

export const metadata = {
  title: { absolute: 'Investment Plots & Land in India | Plotyards' },
  description: 'Browse the best real estate investment plots and land in India. Compare ROI between real estate and the stock market.',
  keywords: ['investment plots', 'land for sale', 'real estate investment', 'buy land India', 'stock market vs real estate'],
  openGraph: {
    title: 'Investment Plots & Land in India | Plotyards',
    description: 'Browse the best real estate investment plots and land in India. Compare ROI between real estate and the stock market.',
    type: 'website'
  }
};

export default function Page(props) {
  return <PageComponent {...props} />;
}
