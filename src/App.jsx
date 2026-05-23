import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import AnnouncementBar from './components/AnnouncementBar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import TrafficHeartbeat from './components/TrafficHeartbeat';
import ProtectedRoute from './components/ProtectedRoute';
import { CompareProvider } from './context/CompareContext';
import CompareWidget from './components/CompareWidget';
import CompareModal from './components/CompareModal';
import { HelmetProvider } from 'react-helmet-async';

const Home = lazy(() => import('./pages/Home'));
const Listings = lazy(() => import('./pages/Listings'));
const PropertyDetails = lazy(() => import('./pages/PropertyDetails'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const PostProperty = lazy(() => import('./pages/PostProperty'));
const Login = lazy(() => import('./pages/Login'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const Register = lazy(() => import('./pages/Register'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));
const Blogs = lazy(() => import('./pages/Blogs'));
const BlogDetails = lazy(() => import('./pages/BlogDetails'));
const Favourites = lazy(() => import('./pages/Favourites'));
const History = lazy(() => import('./pages/History'));
const StaticPage = lazy(() => import('./pages/StaticPage'));
const AppComingSoon = lazy(() => import('./pages/AppComingSoon'));
const NotFound = lazy(() => import('./pages/NotFound'));
const HelpCenter = lazy(() => import('./pages/HelpCenter'));

const PageLoader = () => (
  <div className="flex min-h-[60vh] items-center justify-center bg-surface px-6 pt-28 text-sm font-bold text-muted">
    Loading Plotyards...
  </div>
);

function App() {
  return (
    <HelmetProvider>
      <CompareProvider>
        <Router>
          <div className="min-h-screen bg-background text-text flex flex-col">
            <ScrollToTop />
            <TrafficHeartbeat />
            <Navbar />
            <AnnouncementBar />
            <main className="flex-grow">
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/listings" element={<Listings />} />
                  <Route path="/property/:id" element={<PropertyDetails />} />
                  <Route path="/dashboard/*" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                  <Route path="/plotadmin" element={<AdminLogin />} />
                  <Route path="/admin/*" element={<ProtectedRoute roles={['admin']} loginPath="/plotadmin" requireAdminEntry><AdminPanel /></ProtectedRoute>} />
                  <Route path="/post-property" element={<ProtectedRoute roles={['broker', 'admin']}><PostProperty /></ProtectedRoute>} />
                  <Route path="/favourites" element={<ProtectedRoute><Favourites /></ProtectedRoute>} />
                  <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/blogs" element={<Blogs />} />
                  <Route path="/articles" element={<Blogs />} />
                  <Route path="/blogs/:slug" element={<BlogDetails />} />
                  <Route path="/articles/:slug" element={<BlogDetails />} />
                  <Route path="/about" element={<StaticPage type="about" />} />
                  <Route path="/contact" element={<StaticPage type="contact" />} />
                  <Route path="/privacy" element={<StaticPage type="privacy" />} />
                  <Route path="/terms" element={<StaticPage type="terms" />} />
                  <Route path="/refund-policy" element={<StaticPage type="refund" />} />
                  <Route path="/refund" element={<StaticPage type="refund" />} />
                  <Route path="/faq" element={<HelpCenter />} />
                  <Route path="/help-center" element={<HelpCenter />} />
                  <Route path="/app-coming-soon" element={<AppComingSoon />} />
                  <Route path="/not-found" element={<NotFound />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </main>
            <Footer />
          </div>
          <CompareWidget />
          <CompareModal />
        </Router>
      </CompareProvider>
    </HelmetProvider>
  );
}

export default App;
