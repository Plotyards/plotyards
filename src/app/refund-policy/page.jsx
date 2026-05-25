import PageComponent from '../../views/StaticPage';


export const metadata = {
  title: 'Refund Policy',
};

export default function Page(props) { return <PageComponent {...props} type="refund" />; }
