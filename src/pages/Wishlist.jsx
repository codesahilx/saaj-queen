import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiTrash2, FiShoppingBag } from 'react-icons/fi';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import ProductCard from '../components/ProductCard';

export default function Wishlist() {
  const { items, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { addToast } = useToast();

  const fmt = n => '₹' + n.toLocaleString('en-IN');

  const handleMoveToCart = item => {
    addToCart(item);
    removeFromWishlist(item.id);
    addToast(`"${item.name}" moved to bag!`);
  };

  return (
    <>
      <div className="page-hero">
        <div className="breadcrumb">
          <a href="/">Home</a>
          <span className="sep">›</span>
          <span>Wishlist</span>
        </div>
        <h1>My Wishlist</h1>
        <p>{items.length} saved items</p>
      </div>

      <div className="section" style={{ paddingTop: 40 }}>
        <div className="container">
          {items.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🤍</div>
              <h3>Your wishlist is empty</h3>
              <p>Save your favourite jewellery pieces here to buy them later</p>
              <Link to="/products" className="btn btn-dark">Browse Collection</Link>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                <p style={{ color: 'var(--c-gray)', fontSize: '.9rem' }}>
                  {items.length} item{items.length !== 1 ? 's' : ''} saved
                </p>
                <button
                  onClick={() => items.forEach(i => handleMoveToCart(i))}
                  className="btn btn-dark btn-sm"
                >
                  <FiShoppingBag size={15} /> Move All to Bag
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20 }}>
                <AnimatePresence>
                  {items.map(item => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, scale: .95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: .9 }}
                      transition={{ duration: .25 }}
                      style={{ position: 'relative' }}
                    >
                      <ProductCard product={item} />
                      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                        <button
                          onClick={() => handleMoveToCart(item)}
                          className="btn btn-gold btn-sm btn-full"
                          style={{ gap: 6 }}
                        >
                          <FiShoppingBag size={13} /> Move to Bag
                        </button>
                        <button
                          onClick={() => { removeFromWishlist(item.id); addToast('Removed from wishlist', 'info'); }}
                          style={{
                            width: 36, height: 36, borderRadius: '50%',
                            border: '1.5px solid var(--c-border)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'var(--c-gray)', flexShrink: 0,
                          }}
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          [style*="repeat(4,1fr)"] { grid-template-columns: repeat(2,1fr) !important; }
        }
        @media (max-width: 480px) {
          [style*="repeat(2,1fr)"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
}
