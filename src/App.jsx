import { lazy, Suspense, useEffect, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { FaWhatsapp } from 'react-icons/fa';
import { FiArrowUp } from 'react-icons/fi';
import Header        from './components/Header';
import Footer        from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute    from './components/AdminRoute';

const Home          = lazy(() => import('./pages/Home'));
const Products      = lazy(() => import('./pages/Products'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Wishlist      = lazy(() => import('./pages/Wishlist'));
const Checkout      = lazy(() => import('./pages/Checkout'));
const Login         = lazy(() => import('./pages/Login'));
const Signup        = lazy(() => import('./pages/Signup'));
const Admin         = lazy(() => import('./pages/Admin'));
const MyOrders      = lazy(() => import('./pages/MyOrders'));
const Settings      = lazy(() => import('./pages/Settings'));

const PAGE_TITLES = {
  '/':          'Saaj Queen – Royal Jewellery',
  '/products':  'Collections | Saaj Queen',
  '/login':     'Sign In | Saaj Queen',
  '/signup':    'Create Account | Saaj Queen',
  '/wishlist':  'Wishlist | Saaj Queen',
  '/checkout':  'Checkout | Saaj Queen',
  '/admin':     'Admin Dashboard | Saaj Queen',
  '/my-orders': 'My Orders | Saaj Queen',
  '/settings':  'Settings | Saaj Queen',
};

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
    const key = Object.keys(PAGE_TITLES).find(k => pathname === k || (k !== '/' && pathname.startsWith(k)));
    document.title = PAGE_TITLES[key] ?? 'Saaj Queen – Royal Jewellery';
  }, [pathname]);
  return null;
}

function PageLoader() {
  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 40, height: 40, border: '3px solid #EBEBEB', borderTop: '3px solid #3B0764', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function App() {
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 500);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <ScrollToTop />
      <Header />

      <main>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/"            element={<Home />} />
            <Route path="/products"    element={<Products />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/login"       element={<Login />} />
            <Route path="/signup"      element={<Signup />} />
            <Route path="/wishlist"    element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
            <Route path="/checkout"    element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
            <Route path="/admin"       element={<AdminRoute><Admin /></AdminRoute>} />
            <Route path="/my-orders"   element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
            <Route path="/settings"    element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="*" element={
              <div className="empty-state" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div className="empty-icon" style={{ fontSize: '3rem', fontWeight: 700, color: '#E5E5E5' }}>404</div>
                <h3>Page not found</h3>
                <a href="/" className="btn btn-dark" style={{ marginTop: 16 }}>Go Home</a>
              </div>
            } />
          </Routes>
        </Suspense>
      </main>

      <Footer />

      <a
        href="https://wa.me/919082541454?text=Hi%20Saaj%20Queen!%20I%20need%20help."
        className="wa-btn"
        target="_blank"
        rel="noreferrer"
        aria-label="Chat on WhatsApp"
      >
        <FaWhatsapp />
      </a>

      <AnimatePresence>
        {showTop && (
          <motion.button
            className="scroll-top"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: .22 }}
            aria-label="Scroll to top"
          >
            <FiArrowUp size={18} />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
