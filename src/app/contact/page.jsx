import PageComponent from '../../views/StaticPage';


export const metadata = {
  title: 'Contact Us',
};

export default function Page(props) { return <PageComponent {...props} type="contact" />; }
