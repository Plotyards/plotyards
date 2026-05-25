import PageComponent from '../../views/StaticPage';


export const metadata = {
  title: 'Terms & Conditions',
};

export default function Page(props) { return <PageComponent {...props} type="terms" />; }
