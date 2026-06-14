import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiHeart, FiShoppingBag, FiTruck, FiRefreshCw, FiShield, FiShare2, FiMessageCircle, FiChevronDown } from 'react-icons/fi';
import { FaHeart, FaWhatsapp } from 'react-icons/fa';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import ProductCard from '../components/ProductCard';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product,  setProduct]  = useState(null);
  const [related,  setRelated]  = useState([]);
  const [fetching, setFetching] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [qty,       setQty]       = useState(1);
  const [openFaq,   setOpenFaq]   = useState(null);

  useEffect(() => {
    setFetching(true);
    setActiveImg(0);
    getDoc(doc(db, 'products', id))
      .then(async snap => {
        if (snap.exists()) {
          const p = { id: snap.id, ...snap.data() };
          setProduct(p);
          getDocs(collection(db, 'products'))
            .then(all => setRelated(
              all.docs.map(d => ({ id: d.id, ...d.data() }))
                .filter(x => x.category === p.category && x.id !== p.id)
                .slice(0, 4)
            ))
            .catch(() => {});
        } else {
          setProduct(null);
        }
      })
      .catch(() => setProduct(null))
      .finally(() => setFetching(false));
  }, [id]);

  useEffect(() => {
    if (product) document.title = `${product.name} | Saaj Queen`;
    return () => { document.title = 'Saaj Queen – Royal Jewellery'; };
  }, [product]);

  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const { addToast } = useToast();

  if (fetching) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 44, height: 44, border: '3px solid var(--c-border)', borderTop: '3px solid var(--c-purple)', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="empty-state" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div className="empty-icon">🔍</div>
        <h3>Product not found</h3>
        <Link to="/products" className="btn btn-dark" style={{ marginTop: 16 }}>Browse Collection</Link>
      </div>
    );
  }

  const wished   = isWishlisted(product.id);
  const discount = Math.round(((product.mrp - product.price) / product.mrp) * 100);
  const fmt      = n => '₹' + n.toLocaleString('en-IN');

  const handleAddToCart = () => {
    for (let i = 0; i < qty; i++) addToCart(product);
    addToast(`"${product.name}" added to bag!`);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/checkout');
  };

  const waLink = `https://wa.me/919082541454?text=Hi!%20I'm%20interested%20in%20"${encodeURIComponent(product.name)}"%20(ID:${product.id})`;

  const faqs = [
    { q: 'What is this made of?',            a: product.material },
    { q: 'How should I care for this piece?', a: product.care },
    { q: 'Is COD available?',                 a: 'Yes! Cash on Delivery is available across India.' },
    { q: 'Can I return this?',                a: 'Yes, we accept returns within 7 days of delivery. The item must be unused and in original packaging.' },
  ];

  return (
    <>
      {/* Breadcrumb */}
      <div style={{ background: 'var(--c-bg2)', borderBottom: '1px solid var(--c-border)', padding: '14px 0' }}>
        <div className="container">
          <div className="breadcrumb" style={{ justifyContent: 'flex-start' }}>
            <Link to="/">Home</Link>
            <span className="sep">›</span>
            <Link to="/products">Collections</Link>
            <span className="sep">›</span>
            <span style={{ color: 'var(--c-dark)', opacity: .8 }}>{product.name}</span>
          </div>
        </div>
      </div>

      <div className="section" style={{ paddingTop: 40 }}>
        <div className="container">
          <div className="product-detail-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'start' }}>

            {/* Images */}
            <div className="product-detail-images" style={{ position: 'sticky', top: 90 }}>
              <div style={{ borderRadius: 16, overflow: 'hidden', marginBottom: 12, border: '1px solid var(--c-border)', aspectRatio: '4/5', background: '#F7F3EE' }}>
                <AnimatePresence mode="wait">
                  <motion.img
                    key={activeImg}
                    src={product.images[activeImg]}
                    alt={product.name}
                    initial={{ opacity: 0, scale: 1.04 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: .3 }}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </AnimatePresence>
              </div>
              {product.images.length > 1 && (
                <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }}>
                  {product.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImg(i)}
                      style={{
                        width: 72, height: 72, borderRadius: 8,
                        overflow: 'hidden', flexShrink: 0,
                        border: `2px solid ${activeImg === i ? 'var(--c-purple)' : 'var(--c-border)'}`,
                        transition: 'var(--transition)',
                      }}
                    >
                      <img src={img} alt="" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div>
              {/* Category + Badges */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <span style={{ fontSize: '.75rem', color: 'var(--c-purple)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em' }}>
                  {product.category === 'maangtikka' ? 'Maang Tikka' : product.category.charAt(0).toUpperCase() + product.category.slice(1)}
                </span>
                {product.badge && (
                  <span className={`badge badge-${product.badge === 'bestseller' ? 'gold' : product.badge === 'new' ? 'purple' : 'red'}`}>
                    {product.badge === 'bestseller' ? 'Bestseller' : product.badge === 'new' ? 'New Arrival' : 'Limited Edition'}
                  </span>
                )}
              </div>

              {/* Name */}
              <h1 style={{ fontFamily: 'var(--font-h)', fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 700, lineHeight: 1.2, marginBottom: 16 }}>
                {product.name}
              </h1>


              {/* Price */}
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
                <span style={{ fontFamily: 'var(--font-h)', fontSize: '1.9rem', fontWeight: 700, color: 'var(--c-dark)' }}>
                  {fmt(product.price)}
                </span>
                <span style={{ fontSize: '1.1rem', color: 'var(--c-gray)', textDecoration: 'line-through' }}>
                  {fmt(product.mrp)}
                </span>
                <span className="badge badge-green">{discount}% off</span>
              </div>

              <div className="divider" />

              {/* Description */}
              <p style={{ fontSize: '.93rem', lineHeight: 1.8, color: 'var(--c-gray)', marginBottom: 24 }}>
                {product.desc}
              </p>

              {/* Details */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
                {[
                  { label: 'Material', value: product.material },
                  { label: 'Weight',   value: product.weight },
                  { label: 'Stock',    value: `${product.stock} available` },
                  { label: 'Care',     value: product.care },
                ].map(({ label, value }) => (
                  <div key={label} style={{ background: 'var(--c-bg2)', borderRadius: 8, padding: '12px 14px' }}>
                    <p style={{ fontSize: '.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--c-gray)', marginBottom: 3 }}>
                      {label}
                    </p>
                    <p style={{ fontSize: '.85rem', fontWeight: 500, color: 'var(--c-dark)' }}>{value}</p>
                  </div>
                ))}
              </div>

              {/* Qty */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                <span style={{ fontSize: '.85rem', fontWeight: 500 }}>Quantity:</span>
                <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid var(--c-border)', borderRadius: 50, overflow: 'hidden' }}>
                  <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{ padding: '10px 16px', fontSize: '.9rem', fontWeight: 700, color: 'var(--c-gray)' }}>−</button>
                  <span style={{ minWidth: 32, textAlign: 'center', fontWeight: 600 }}>{qty}</span>
                  <button onClick={() => setQty(q => Math.min(product.stock, q + 1))} style={{ padding: '10px 16px', fontSize: '.9rem', fontWeight: 700, color: 'var(--c-gray)' }}>+</button>
                </div>
                <span style={{ fontSize: '.8rem', color: 'var(--c-green)', fontWeight: 500 }}>
                  {product.stock > 5 ? `${product.stock} in stock` : `Only ${product.stock} left!`}
                </span>
              </div>

              {/* CTAs */}
              <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                <button className="btn btn-gold btn-lg" style={{ flex: 1, gap: 8 }} onClick={handleAddToCart}>
                  <FiShoppingBag size={17} /> Add to Bag
                </button>
                <button
                  onClick={() => { toggleWishlist(product); addToast(wished ? 'Removed from wishlist' : 'Added to wishlist!', wished ? 'info' : 'success'); }}
                  style={{
                    width: 52, height: 52, borderRadius: '50%',
                    border: `1.5px solid ${wished ? 'var(--c-red)' : 'var(--c-border)'}`,
                    background: wished ? '#FFF0F0' : '#fff',
                    color: wished ? 'var(--c-red)' : 'var(--c-gray)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'var(--transition)', flexShrink: 0,
                  }}
                >
                  {wished ? <FaHeart size={18} /> : <FiHeart size={18} />}
                </button>
              </div>
              <button className="btn btn-dark btn-full btn-lg" onClick={handleBuyNow}>
                Buy Now
              </button>

              {/* WhatsApp */}
              <a
                href={waLink}
                target="_blank" rel="noreferrer"
                className="btn btn-full"
                style={{ marginTop: 10, background: '#25D366', color: '#fff', justifyContent: 'center', gap: 8 }}
              >
                <FaWhatsapp size={18} /> Order on WhatsApp
              </a>

              {/* Trust */}
              <div style={{ display: 'flex', gap: 20, marginTop: 24, flexWrap: 'wrap' }}>
                {[
                  { icon: FiTruck,     text: 'Free Shipping above ₹999' },
                  { icon: FiRefreshCw, text: '7-Day Easy Returns' },
                  { icon: FiShield,    text: '100% Authentic' },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: '.78rem', color: 'var(--c-gray)' }}>
                    <Icon size={14} style={{ color: 'var(--c-purple)', flexShrink: 0 }} />
                    {text}
                  </div>
                ))}
              </div>

              {/* FAQs */}
              <div style={{ marginTop: 32 }}>
                <h4 style={{ fontSize: '.88rem', fontWeight: 600, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--c-gray)' }}>
                  Product FAQs
                </h4>
                {faqs.map((faq, i) => (
                  <div key={i} style={{ borderBottom: '1px solid var(--c-border)' }}>
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      style={{
                        width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '14px 0', fontSize: '.88rem', fontWeight: 500, color: 'var(--c-dark)',
                        textAlign: 'left',
                      }}
                    >
                      {faq.q}
                      <FiChevronDown size={16} style={{ flexShrink: 0, transition: '.2s', transform: openFaq === i ? 'rotate(180deg)' : '' }} />
                    </button>
                    <AnimatePresence>
                      {openFaq === i && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: .2 }}
                          style={{ overflow: 'hidden' }}
                        >
                          <p style={{ fontSize: '.85rem', color: 'var(--c-gray)', paddingBottom: 14, lineHeight: 1.7 }}>
                            {faq.a}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <section className="section" style={{ background: 'var(--c-bg2)' }}>
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
              <span className="section-eyebrow">You May Also Like</span>
              <h2 className="section-title">Related Products</h2>
              <div className="title-bar center" />
            </div>
            <div className="prod-grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20 }}>
              {related.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 860px) {
          .product-detail-grid {
            grid-template-columns: 1fr !important;
            gap: 28px !important;
          }
          .product-detail-images {
            position: static !important;
          }
          .product-detail-grid .related-grid {
            grid-template-columns: repeat(2,1fr) !important;
          }
        }
        @media (max-width: 640px) {
          .product-detail-grid { gap: 20px !important; }
        }
      `}</style>
    </>
  );
}
