import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiX, FiShoppingBag, FiMinus, FiPlus, FiTrash2 } from 'react-icons/fi';
import { useCart } from '../context/CartContext';

export default function CartSidebar({ open, onClose }) {
  const { items, removeFromCart, updateQty, total } = useCart();

  const fmt = n => '₹' + n.toLocaleString('en-IN');

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            className="overlay"
            style={{ zIndex: 850 }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={{ x: '100%' }}
        animate={{ x: open ? 0 : '100%' }}
        transition={{ type: 'tween', duration: .32, ease: [.4, 0, .2, 1] }}
        style={{
          position: 'fixed', top: 0, right: 0,
          width: 420, maxWidth: '100vw', height: '100vh',
          background: '#fff', zIndex: 900,
          display: 'flex', flexDirection: 'column',
          boxShadow: '-8px 0 48px rgba(0,0,0,.14)',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 24px', borderBottom: '1px solid var(--c-border)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <FiShoppingBag size={20} color="var(--c-purple)" />
            <h3 style={{ fontFamily: 'var(--font-h)', fontSize: '1.2rem' }}>Your Bag</h3>
            {items.length > 0 && (
              <span style={{
                background: 'var(--c-gold-pale)', color: 'var(--c-gold)',
                fontSize: '.72rem', fontWeight: 600,
                padding: '2px 10px', borderRadius: 50,
              }}>
                {items.reduce((s, i) => s + i.qty, 0)} items
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            style={{ padding: 8, borderRadius: '50%', color: 'var(--c-gray)', transition: 'var(--transition)' }}
            className="icon-btn"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
          {items.length === 0 ? (
            <div className="empty-state" style={{ paddingTop: 80 }}>
              <div className="empty-icon">🛍️</div>
              <h3>Your bag is empty</h3>
              <p>Add some beautiful jewellery to your bag</p>
              <button className="btn btn-dark" onClick={onClose}>Continue Shopping</button>
            </div>
          ) : (
            <AnimatePresence>
              {items.map(item => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0, padding: 0 }}
                  transition={{ duration: .22 }}
                  style={{
                    display: 'flex', gap: 14,
                    padding: '16px 0',
                    borderBottom: '1px solid var(--c-border)',
                  }}
                >
                  {/* Image */}
                  <div style={{
                    width: 80, height: 80, borderRadius: 10, overflow: 'hidden',
                    flexShrink: 0, border: '1px solid var(--c-border)',
                  }}>
                    <img src={item.images?.[0]} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '.78rem', color: 'var(--c-purple)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 3 }}>
                      {item.category}
                    </p>
                    <p style={{ fontSize: '.9rem', fontWeight: 500, lineHeight: 1.3, marginBottom: 10, color: 'var(--c-dark)' }}>
                      {item.name}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      {/* Qty */}
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        border: '1.5px solid var(--c-border)', borderRadius: 50,
                        padding: '4px 12px',
                      }}>
                        <button
                          onClick={() => updateQty(item.id, item.qty - 1)}
                          style={{ color: 'var(--c-gray)', display: 'flex', padding: 2 }}
                        >
                          <FiMinus size={13} />
                        </button>
                        <span style={{ fontSize: '.9rem', fontWeight: 600, minWidth: 16, textAlign: 'center' }}>
                          {item.qty}
                        </span>
                        <button
                          onClick={() => updateQty(item.id, item.qty + 1)}
                          style={{ color: 'var(--c-gray)', display: 'flex', padding: 2 }}
                        >
                          <FiPlus size={13} />
                        </button>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontWeight: 700, color: 'var(--c-dark)', fontSize: '.95rem' }}>
                          {fmt(item.price * item.qty)}
                        </p>
                        <p style={{ fontSize: '.74rem', color: 'var(--c-gray)', textDecoration: 'line-through' }}>
                          {fmt(item.mrp * item.qty)}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.id)}
                      style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 8, fontSize: '.75rem', color: 'var(--c-gray)' }}
                    >
                      <FiTrash2 size={12} /> Remove
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div style={{ padding: '20px 24px', borderTop: '1px solid var(--c-border)' }}>
            {/* Free shipping progress */}
            {total < 999 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: '.78rem', color: 'var(--c-gray)' }}>
                    Add ₹{(999 - total).toLocaleString('en-IN')} more for free shipping
                  </span>
                  <span style={{ fontSize: '.78rem', fontWeight: 600, color: 'var(--c-gold)' }}>
                    {Math.round((total / 999) * 100)}%
                  </span>
                </div>
                <div style={{ height: 5, background: 'var(--c-border)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${Math.min((total / 999) * 100, 100)}%`,
                    background: 'linear-gradient(90deg, var(--c-gold), var(--c-gold2))',
                    borderRadius: 3,
                    transition: 'width .5s',
                  }} />
                </div>
              </div>
            )}
            {total >= 999 && (
              <div style={{
                background: '#F0FDF4', border: '1px solid #BBF7D0',
                borderRadius: 8, padding: '10px 14px', marginBottom: 16,
                fontSize: '.8rem', color: 'var(--c-green)', fontWeight: 500,
              }}>
                ✓ You qualify for FREE shipping!
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <span style={{ fontSize: '1rem', fontWeight: 600 }}>Subtotal</span>
              <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--c-purple)' }}>{fmt(total)}</span>
            </div>

            <Link to="/checkout" onClick={onClose}>
              <button className="btn btn-gold btn-full btn-lg" style={{ marginBottom: 10 }}>
                Proceed to Checkout
              </button>
            </Link>
            <button
              className="btn btn-outline btn-full"
              style={{ fontSize: '.82rem' }}
              onClick={onClose}
            >
              Continue Shopping
            </button>
            <p style={{ textAlign: 'center', fontSize: '.72rem', color: 'var(--c-gray)', marginTop: 12 }}>
              Secure checkout · Free returns · COD available
            </p>
          </div>
        )}
      </motion.aside>

      <style>{`
        .icon-btn:hover { background: var(--c-bg2) !important; }
      `}</style>
    </>
  );
}
