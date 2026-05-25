import PageComponent from '../../views/StaticPage';


export const metadata = {
  title: 'Privacy Policy',
};

export default function Page(props) { return <PageComponent {...props} type="privacy" />; }
