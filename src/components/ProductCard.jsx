import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHeart, FiShoppingBag, FiStar } from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';

const badgeConfig = {
  bestseller: { label: 'Bestseller', cls: 'badge-gold' },
  new:        { label: 'New',        cls: 'badge-purple' },
  limited:    { label: 'Limited',    cls: 'badge-red' },
};

export default function ProductCard({ product }) {
  const [hovered,  setHovered]  = useState(false);
  const [imgIdx,   setImgIdx]   = useState(0);
  const [imgError, setImgError] = useState(false);
  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const { addToast } = useToast();

  const wished   = isWishlisted(product.id);
  const discount = Math.round(((product.mrp - product.price) / product.mrp) * 100);
  const badge    = badgeConfig[product.badge];
  const fmt      = n => '₹' + n.toLocaleString('en-IN');

  const handleAdd = e => {
    e.preventDefault();
    addToCart(product);
    addToast(`"${product.name}" added to bag!`);
  };

  const handleWishlist = e => {
    e.preventDefault();
    toggleWishlist(product);
    addToast(wished ? 'Removed from wishlist' : 'Added to wishlist!', wished ? 'info' : 'success');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: .4 }}
    >
      <Link
        to={`/product/${product.id}`}
        onMouseEnter={() => { setHovered(true); setImgIdx(product.images.length > 1 ? 1 : 0); }}
        onMouseLeave={() => { setHovered(false); setImgIdx(0); }}
        style={{ display: 'block', borderRadius: 14, overflow: 'hidden', border: '1px solid var(--c-border)', background: '#fff', transition: 'box-shadow .28s, transform .28s' }}
        className="product-card-link"
      >
        {/* Image */}
        <div style={{ position: 'relative', overflow: 'hidden', aspectRatio: '3/4', background: '#F7F3EE' }}>
          {imgError || !product.images?.[imgIdx] ? (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--c-purple-lt)', color: 'var(--c-purple)', fontSize: '3rem' }}>
              🛍️
            </div>
          ) : (
            <img
              src={product.images[imgIdx]}
              alt={product.name}
              style={{
                width: '100%', height: '100%', objectFit: 'cover',
                transition: 'transform .5s cubic-bezier(.4,0,.2,1)',
                transform: hovered ? 'scale(1.06)' : 'scale(1)',
              }}
              loading="lazy"
              onError={() => setImgError(true)}
            />
          )}

          {/* Badges */}
          {badge && (
            <span
              className={`badge ${badge.cls}`}
              style={{ position: 'absolute', top: 12, left: 12 }}
            >
              {badge.label}
            </span>
          )}
          <span
            className="badge badge-green"
            style={{ position: 'absolute', top: 12, right: 12 }}
          >
            {discount}% off
          </span>

          {/* Hover Actions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: hovered ? 1 : 0 }}
            transition={{ duration: .2 }}
            style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              background: 'linear-gradient(to top, rgba(0,0,0,.65) 0%, transparent 100%)',
              padding: '24px 14px 14px',
              display: 'flex', gap: 8,
            }}
          >
            <button
              onClick={handleAdd}
              className="btn btn-gold"
              style={{ flex: 1, padding: '10px 0', fontSize: '.8rem', gap: 6 }}
            >
              <FiShoppingBag size={14} /> Add to Bag
            </button>
            <button
              onClick={handleWishlist}
              style={{
                width: 40, height: 40, borderRadius: '50%',
                background: wished ? '#FFF0F0' : 'rgba(255,255,255,.15)',
                border: '1.5px solid',
                borderColor: wished ? 'var(--c-red)' : 'rgba(255,255,255,.4)',
                color: wished ? 'var(--c-red)' : '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, transition: 'var(--transition)',
              }}
            >
              {wished ? <FaHeart size={15} /> : <FiHeart size={15} />}
            </button>
          </motion.div>
        </div>

        {/* Info */}
        <div style={{ padding: '14px 14px 16px' }}>
          <p style={{ fontSize: '.72rem', color: 'var(--c-purple)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 5 }}>
            {product.category === 'maangtikka' ? 'Maang Tikka' : product.category.charAt(0).toUpperCase() + product.category.slice(1)}
          </p>
          <h3 style={{ fontSize: '.92rem', fontWeight: 500, lineHeight: 1.3, marginBottom: 8, color: 'var(--c-dark)' }}>
            {product.name}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 10 }}>
            <div style={{ display: 'flex', gap: 2 }}>
              {[...Array(5)].map((_, i) => (
                <FiStar
                  key={i}
                  size={11}
                  style={{
                    color: i < Math.floor(product.rating) ? 'var(--c-gold)' : 'var(--c-gray2)',
                    fill: i < Math.floor(product.rating) ? 'var(--c-gold)' : 'none',
                  }}
                />
              ))}
            </div>
            <span style={{ fontSize: '.72rem', color: 'var(--c-gray)' }}>({product.reviews})</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--c-dark)' }}>
              {fmt(product.price)}
            </span>
            <span style={{ fontSize: '.8rem', color: 'var(--c-gray)', textDecoration: 'line-through' }}>
              {fmt(product.mrp)}
            </span>
          </div>
        </div>
      </Link>
      <style>{`
        .product-card-link:hover {
          box-shadow: 0 12px 40px rgba(0,0,0,.12) !important;
          transform: translateY(-4px) !important;
        }
      `}</style>
    </motion.div>
  );
}
