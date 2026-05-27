import PageComponent from '../../views/Dashboard';
import ProtectedRoute from '../../components/ProtectedRoute';


export const metadata = {
  title: 'My Dashboard',
};

export default function Page(props) {
  return (
    <ProtectedRoute loginPath="/login">
      <PageComponent {...props} />
    </ProtectedRoute>
  );
}
