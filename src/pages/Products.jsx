import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiSliders } from 'react-icons/fi';
import { useProducts } from '../hooks/useProducts';
import ProductCard from '../components/ProductCard';

const CAT_OPTIONS = [
  { value: 'all',      label: 'All Categories' },
  { value: 'necklace', label: 'Necklaces' },
  { value: 'earring',  label: 'Earrings' },
  { value: 'ring',     label: 'Finger Rings' },
  { value: 'anklet',   label: 'Anklets' },
  { value: 'watch',    label: 'Vintage Watches' },
  { value: 'bracelet', label: 'Bracelets' },
  { value: 'bag',      label: 'Bags' },
  { value: 'giftbox',  label: 'Gift Boxes' },
];

export default function Products() {
  const { products, loading: productsLoading } = useProducts();
  const [searchParams] = useSearchParams();
  const [category,   setCategory]   = useState(searchParams.get('category') || 'all');
  const [filterOpen, setFilterOpen] = useState(false);

  const query  = searchParams.get('q') || '';
  const badge  = searchParams.get('badge') || '';
  const isSale = searchParams.get('sale') === '1';

  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) setCategory(cat);
  }, [searchParams]);

  const filtered = useMemo(() => {
    if (products.length) console.log('Unique categories in DB:', [...new Set(products.map(p => p.category))]);
    let list = [...products];
    if (query)              list = list.filter(p => p.name.toLowerCase().includes(query.toLowerCase()));
    if (badge)              list = list.filter(p => p.badge === badge);
    if (isSale)             list = list.filter(p => p.mrp - p.price > 0);
    if (category !== 'all') list = list.filter(p => p.category === category);
    return list;
  }, [category, query, badge, isSale, products]);

  const pageTitle = query       ? `Search: "${query}"`
    : badge === 'new'           ? 'New Arrivals'
    : isSale                    ? 'Sale'
    : category !== 'all'        ? (CAT_OPTIONS.find(c => c.value === category)?.label || 'Collections')
    : 'All Jewellery';

  return (
    <>
      {/* Page Hero */}
      <div className="page-hero">
        <div className="breadcrumb">
          <a href="/">Home</a>
          <span className="sep">›</span>
          <span>Collections</span>
        </div>
        <h1>{pageTitle}</h1>
        <p>{filtered.length} products found</p>
      </div>

      <div className="section" style={{ paddingTop: 40 }}>
        <div className="container">

          {/* Mobile Filter Button */}
          <button
            className="mobile-filter-btn btn btn-outline btn-sm"
            onClick={() => setFilterOpen(o => !o)}
            style={{ gap: 8, marginBottom: 16 }}
          >
            <FiSliders size={15} /> Filters
          </button>

          {filterOpen && (
            <div className="overlay" style={{ zIndex: 749 }} onClick={() => setFilterOpen(false)} />
          )}

          <div className="products-layout">

            {/* Filters Sidebar */}
            <aside className={`products-sidebar${filterOpen ? ' open' : ''}`} style={{
              background: '#fff', borderRadius: 16,
              border: '1px solid var(--c-border)',
              padding: '24px',
              position: 'sticky', top: 90,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                <h3 style={{ fontFamily: 'var(--font-h)', fontSize: '1.1rem' }}>Filters</h3>
                <button className="mobile-filter-btn icon-btn" onClick={() => setFilterOpen(false)} style={{ color: 'var(--c-dark)' }}>
                  <FiX size={20} />
                </button>
              </div>

              {/* Category */}
              <div style={{ marginBottom: 28 }}>
                <p style={{ fontSize: '.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--c-gray)', marginBottom: 12 }}>Category</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {CAT_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setCategory(opt.value)}
                      style={{
                        textAlign: 'left', padding: '9px 14px',
                        borderRadius: 8, fontSize: '.88rem',
                        fontWeight: category === opt.value ? 600 : 400,
                        background: category === opt.value ? 'var(--c-purple-lt)' : 'transparent',
                        color: category === opt.value ? 'var(--c-purple)' : 'var(--c-dark)',
                        transition: 'var(--transition)',
                        border: 'none', width: '100%',
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setCategory('all')}
                style={{ fontSize: '.82rem', color: 'var(--c-purple)', fontWeight: 500 }}
              >
                Clear Filter
              </button>
              <button
                className="mobile-filter-btn btn btn-dark btn-full"
                style={{ marginTop: 20 }}
                onClick={() => setFilterOpen(false)}
              >
                Apply
              </button>
            </aside>

            {/* Products Area */}
            <div>
              <p style={{ fontSize: '.88rem', color: 'var(--c-gray)', marginBottom: 24 }}>
                Showing <strong style={{ color: 'var(--c-dark)' }}>{filtered.length}</strong> products
              </p>

              {/* Grid */}
              {productsLoading ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
                  {[...Array(6)].map((_, i) => (
                    <div key={i} style={{ borderRadius: 14, background: 'var(--c-bg2)', aspectRatio: '3/4', animation: 'shimmer 1.2s infinite alternate' }} />
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">🔍</div>
                  <h3>No products found</h3>
                  <p>Try a different category</p>
                  <button className="btn btn-dark" onClick={() => setCategory('all')}>
                    View All Products
                  </button>
                </div>
              ) : (
                <motion.div layout className="prod-grid-3">
                  <AnimatePresence>
                    {filtered.map(p => (
                      <motion.div
                        key={p.id}
                        layout
                        initial={{ opacity: 0, scale: .95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: .95 }}
                        transition={{ duration: .25 }}
                      >
                        <ProductCard product={p} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .products-sidebar.open { border-radius: 0 !important; border: none !important; }
        @keyframes shimmer { from { opacity:.5 } to { opacity:1 } }
      `}</style>
    </>
  );
}
