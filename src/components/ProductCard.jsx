import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const badgeConfig = {
  bestseller: { label: 'Bestseller', cls: 'badge-gold' },
  new:        { label: 'New',        cls: 'badge-purple' },
  limited:    { label: 'Limited',    cls: 'badge-red' },
};

export default function ProductCard({ product }) {
  const [hovered,  setHovered]  = useState(false);
  const [imgIdx,   setImgIdx]   = useState(0);
  const [imgError, setImgError] = useState(false);

  const discount = Math.round(((product.mrp - product.price) / product.mrp) * 100);
  const badge    = badgeConfig[product.badge];
  const fmt      = n => '₹' + n.toLocaleString('en-IN');

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: .4 }}
    >
      <Link
        to={`/product/${product.id}`}
        onMouseEnter={() => { setHovered(true); setImgIdx(product.images?.length > 1 ? 1 : 0); }}
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
            <span className={`badge ${badge.cls}`} style={{ position: 'absolute', top: 12, left: 12 }}>
              {badge.label}
            </span>
          )}
          {discount > 0 && (
            <span className="badge badge-green" style={{ position: 'absolute', top: 12, right: 12 }}>
              {discount}% off
            </span>
          )}
        </div>

        {/* Info */}
        <div style={{ padding: '14px 14px 16px' }}>
          <p style={{ fontSize: '.72rem', color: 'var(--c-purple)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 5 }}>
            {product.category === 'maangtikka' ? 'Maang Tikka' : product.category?.charAt(0).toUpperCase() + product.category?.slice(1)}
          </p>
          <h3 style={{ fontSize: '.92rem', fontWeight: 500, lineHeight: 1.3, marginBottom: 8, color: 'var(--c-dark)' }}>
            {product.name}
          </h3>
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
