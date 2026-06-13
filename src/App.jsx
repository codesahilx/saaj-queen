import { useEffect, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { FaWhatsapp } from 'react-icons/fa';
import { FiArrowUp } from 'react-icons/fi';
import Header        from './components/Header';
import Footer        from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute    from './components/AdminRoute';
import Home          from './pages/Home';
import Products      from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Wishlist      from './pages/Wishlist';
import Checkout      from './pages/Checkout';
import Login         from './pages/Login';
import Signup        from './pages/Signup';
import Admin         from './pages/Admin';
import MyOrders     from './pages/MyOrders';
import Settings     from './pages/Settings';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
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
        <Routes>
          <Route path="/"            element={<Home />} />
          <Route path="/products"    element={<Products />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/login"       element={<Login />} />
          <Route path="/signup"      element={<Signup />} />
          <Route path="/wishlist"    element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
          <Route path="/checkout"    element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="/admin"       element={<AdminRoute><Admin /></AdminRoute>} />
          <Route path="/my-orders"  element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
          <Route path="/settings"   element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="*" element={
            <div className="empty-state" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div className="empty-icon" style={{ fontSize: '3rem', fontWeight: 700, color: 'var(--c-gray2)' }}>404</div>
              <h3>Page not found</h3>
              <a href="/" className="btn btn-dark" style={{ marginTop: 16 }}>Go Home</a>
            </div>
          } />
        </Routes>
      </main>

      <Footer />

      {/* WhatsApp */}
      <a
        href="https://wa.me/919082541454?text=Hi%20Saaj%20Queen!%20I%20need%20help."
        className="wa-btn"
        target="_blank"
        rel="noreferrer"
        aria-label="Chat on WhatsApp"
      >
        <FaWhatsapp />
      </a>

      {/* Scroll to top */}
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
