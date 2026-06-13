import { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPackage, FiTruck, FiCheck, FiX, FiClock, FiSearch, FiRefreshCw, FiChevronDown, FiChevronUp, FiPhone, FiMail, FiMapPin } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { db, ADMIN_WHATSAPP } from '../firebase';

const STATUS_CONFIG = {
  pending:   { label: 'Pending',   color: '#F59E0B', bg: '#FEF3C7', icon: FiClock },
  confirmed: { label: 'Confirmed', color: '#3B82F6', bg: '#EFF6FF', icon: FiPackage },
  shipped:   { label: 'Shipped',   color: '#8B5CF6', bg: '#EDE9FE', icon: FiTruck },
  delivered: { label: 'Delivered', color: '#16A34A', bg: '#DCFCE7', icon: FiCheck },
  cancelled: { label: 'Cancelled', color: '#EF4444', bg: '#FEE2E2', icon: FiX },
};

const ALL_STATUSES = Object.keys(STATUS_CONFIG);

export default function Admin() {
  const [orders,      setOrders]      = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [expanded,    setExpanded]    = useState(null);
  const [updating,    setUpdating]    = useState(null);

  const fmt = n => '₹' + (n || 0).toLocaleString('en-IN');

  // Real-time listener
  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, snap => {
      setOrders(snap.docs.map(d => ({ _docId: d.id, ...d.data() })));
      setLoading(false);
    }, err => {
      console.error('Firestore error:', err);
      setLoading(false);
    });
    return unsub;
  }, []);

  const updateStatus = async (docId, status) => {
    setUpdating(docId);
    try {
      await updateDoc(doc(db, 'orders', docId), { status });
    } catch (e) {
      console.error(e);
    } finally {
      setUpdating(null);
    }
  };

  const filtered = orders.filter(o => {
    const matchSearch = !search || [o.orderId, o.customer?.name, o.customer?.phone, o.customer?.email]
      .join(' ').toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || o.status === filterStatus;
    return matchSearch && matchStatus;
  });

  // Stats
  const stats = {
    total:     orders.length,
    pending:   orders.filter(o => o.status === 'pending').length,
    shipped:   orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    revenue:   orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + (o.total || 0), 0),
  };

  const waText = (o) =>
    `Hi ${o.customer?.name}! 👋\nYour Saaj Queen order *${o.orderId}* has been *${o.status}*.\nThank you for shopping with us! 🛍️`;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--c-bg2)' }}>

      {/* Admin Header */}
      <div style={{ background: 'linear-gradient(135deg, var(--c-purple), var(--c-dark2))', padding: '28px 0' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <img src="/logo.jpeg" alt="Saaj Queen" style={{ height: 44, width: 44, borderRadius: '50%', border: '2px solid var(--c-gold)' }} />
            <div>
              <h1 style={{ fontFamily: 'var(--font-h)', color: '#fff', fontSize: '1.5rem' }}>Admin Dashboard</h1>
              <p style={{ color: 'rgba(255,255,255,.6)', fontSize: '.78rem' }}>Saaj Queen · Order Management</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,.7)', fontSize: '.82rem' }}>
            <FiRefreshCw size={13} />
            Live updates enabled
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '32px 24px' }}>

        {/* Stats Cards */}
        <div className="stats-grid-admin">
          {[
            { label: 'Total Orders',  value: stats.total,     color: 'var(--c-purple)', icon: FiPackage },
            { label: 'Pending',       value: stats.pending,   color: '#F59E0B',         icon: FiClock },
            { label: 'Shipped',       value: stats.shipped,   color: '#8B5CF6',         icon: FiTruck },
            { label: 'Delivered',     value: stats.delivered, color: '#16A34A',         icon: FiCheck },
            { label: 'Total Revenue', value: fmt(stats.revenue), color: 'var(--c-gold)', icon: null, big: true },
          ].map(({ label, value, color, icon: Icon, big }) => (
            <div key={label} style={{ background: '#fff', borderRadius: 14, padding: '20px 18px', border: '1px solid var(--c-border)', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <p style={{ fontSize: '.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--c-gray)' }}>{label}</p>
                {Icon && <Icon size={16} style={{ color }} />}
              </div>
              <p style={{ fontFamily: big ? 'var(--font-h)' : 'var(--font-b)', fontSize: big ? '1.3rem' : '1.8rem', fontWeight: 700, color }}>{value}</p>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div style={{ background: '#fff', borderRadius: 14, padding: '16px 20px', border: '1px solid var(--c-border)', marginBottom: 20, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <FiSearch size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--c-gray)' }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by order ID, name, phone…"
              style={{ width: '100%', paddingLeft: 36, paddingRight: 12, paddingTop: 9, paddingBottom: 9, border: '1.5px solid var(--c-border)', borderRadius: 8, fontSize: '.85rem', outline: 'none' }}
            />
          </div>

          {/* Status Filter */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {['all', ...ALL_STATUSES].map(s => {
              const cfg = s === 'all' ? null : STATUS_CONFIG[s];
              const isActive = filterStatus === s;
              return (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  style={{
                    padding: '7px 14px', borderRadius: 50, fontSize: '.78rem', fontWeight: 600,
                    border: `1.5px solid ${isActive ? (cfg?.color || 'var(--c-purple)') : 'var(--c-border)'}`,
                    background: isActive ? (cfg?.bg || 'var(--c-purple-lt)') : '#fff',
                    color: isActive ? (cfg?.color || 'var(--c-purple)') : 'var(--c-gray)',
                    cursor: 'pointer', transition: '.2s',
                    textTransform: 'capitalize',
                  }}
                >
                  {s === 'all' ? `All (${orders.length})` : `${cfg.label} (${orders.filter(o => o.status === s).length})`}
                </button>
              );
            })}
          </div>
        </div>

        {/* Orders List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ width: 40, height: 40, border: '3px solid var(--c-border)', borderTop: '3px solid var(--c-purple)', borderRadius: '50%', animation: 'spin .7s linear infinite', margin: '0 auto 16px' }} />
            <p style={{ color: 'var(--c-gray)' }}>Loading orders…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state" style={{ background: '#fff', borderRadius: 14, border: '1px solid var(--c-border)' }}>
            <div className="empty-icon">📦</div>
            <h3>No orders found</h3>
            <p>{search ? 'Try a different search term' : 'No orders yet — share your store link!'}</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <AnimatePresence>
              {filtered.map(order => {
                const cfg      = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
                const StatusIcon = cfg.icon;
                const isExpanded = expanded === order._docId;
                const ts = order.createdAt?.toDate?.();
                const dateStr = ts ? ts.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

                return (
                  <motion.div
                    key={order._docId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    style={{ background: '#fff', borderRadius: 14, border: '1px solid var(--c-border)', overflow: 'hidden' }}
                  >
                    {/* Order Row */}
                    <div style={{ padding: '18px 22px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>

                      {/* Order ID + Date */}
                      <div style={{ minWidth: 120 }}>
                        <p style={{ fontWeight: 700, fontSize: '.9rem', color: 'var(--c-dark)', fontFamily: 'var(--font-h)' }}>#{order.orderId}</p>
                        <p style={{ fontSize: '.72rem', color: 'var(--c-gray)', marginTop: 2 }}>{dateStr}</p>
                      </div>

                      {/* Customer */}
                      <div style={{ flex: 1, minWidth: 150 }}>
                        <p style={{ fontWeight: 600, fontSize: '.88rem' }}>{order.customer?.name}</p>
                        <p style={{ fontSize: '.75rem', color: 'var(--c-gray)' }}>{order.customer?.phone}</p>
                      </div>

                      {/* Items count */}
                      <div style={{ minWidth: 80, textAlign: 'center' }}>
                        <p style={{ fontWeight: 600, fontSize: '.9rem' }}>{(order.items || []).reduce((s, i) => s + i.qty, 0)} items</p>
                        <p style={{ fontSize: '.72rem', color: 'var(--c-gray)' }}>{order.payment?.toUpperCase()}</p>
                      </div>

                      {/* Total */}
                      <div style={{ minWidth: 90, textAlign: 'right' }}>
                        <p style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--c-purple)' }}>{fmt(order.total)}</p>
                        {order.shipping === 0 && <p style={{ fontSize: '.68rem', color: 'var(--c-green)' }}>Free shipping</p>}
                      </div>

                      {/* Status Badge */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: cfg.bg, color: cfg.color, padding: '5px 12px', borderRadius: 50, fontSize: '.76rem', fontWeight: 700, minWidth: 100 }}>
                        <StatusIcon size={13} />
                        {cfg.label}
                      </div>

                      {/* Status Update */}
                      <select
                        value={order.status}
                        onChange={e => updateStatus(order._docId, e.target.value)}
                        disabled={updating === order._docId}
                        style={{
                          padding: '7px 10px', borderRadius: 8, fontSize: '.8rem',
                          border: '1.5px solid var(--c-border)', background: '#fff',
                          cursor: 'pointer', outline: 'none', minWidth: 130,
                          opacity: updating === order._docId ? .6 : 1,
                        }}
                      >
                        {ALL_STATUSES.map(s => (
                          <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
                        ))}
                      </select>

                      {/* WhatsApp customer */}
                      <a
                        href={`https://wa.me/91${order.customer?.phone}?text=${encodeURIComponent(waText(order))}`}
                        target="_blank" rel="noreferrer"
                        style={{ width: 36, height: 36, borderRadius: '50%', background: '#25D366', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                        title="Message customer on WhatsApp"
                      >
                        <FaWhatsapp size={17} />
                      </a>

                      {/* Expand */}
                      <button onClick={() => setExpanded(isExpanded ? null : order._docId)} style={{ color: 'var(--c-gray)', padding: 6 }}>
                        {isExpanded ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
                      </button>
                    </div>

                    {/* Expanded Details */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: .25 }}
                          style={{ overflow: 'hidden', borderTop: '1px solid var(--c-border)' }}
                        >
                          <div style={{ padding: '20px 22px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>

                            {/* Items */}
                            <div>
                              <p style={{ fontSize: '.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--c-gray)', marginBottom: 12 }}>Order Items</p>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {(order.items || []).map((item, i) => (
                                  <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                                    {item.image && <img src={item.image} alt={item.name} style={{ width: 44, height: 44, borderRadius: 6, objectFit: 'cover', border: '1px solid var(--c-border)', flexShrink: 0 }} />}
                                    <div style={{ flex: 1 }}>
                                      <p style={{ fontSize: '.85rem', fontWeight: 500 }}>{item.name}</p>
                                      <p style={{ fontSize: '.75rem', color: 'var(--c-gray)' }}>{item.qty} × {fmt(item.price)}</p>
                                    </div>
                                    <p style={{ fontWeight: 600, fontSize: '.88rem' }}>{fmt(item.price * item.qty)}</p>
                                  </div>
                                ))}
                              </div>
                              <div style={{ borderTop: '1px solid var(--c-border)', marginTop: 12, paddingTop: 12, display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                                <span>Total</span>
                                <span style={{ color: 'var(--c-purple)' }}>{fmt(order.total)}</span>
                              </div>
                            </div>

                            {/* Customer Info */}
                            <div>
                              <p style={{ fontSize: '.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--c-gray)', marginBottom: 12 }}>Customer & Delivery</p>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                                  <FiPhone size={14} style={{ color: 'var(--c-purple)', marginTop: 2, flexShrink: 0 }} />
                                  <div>
                                    <p style={{ fontSize: '.85rem', fontWeight: 600 }}>{order.customer?.name}</p>
                                    <p style={{ fontSize: '.82rem', color: 'var(--c-gray)' }}>{order.customer?.phone}</p>
                                  </div>
                                </div>
                                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                                  <FiMail size={14} style={{ color: 'var(--c-purple)', marginTop: 2, flexShrink: 0 }} />
                                  <p style={{ fontSize: '.82rem', color: 'var(--c-gray)' }}>{order.customer?.email}</p>
                                </div>
                                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                                  <FiMapPin size={14} style={{ color: 'var(--c-purple)', marginTop: 2, flexShrink: 0 }} />
                                  <p style={{ fontSize: '.82rem', color: 'var(--c-gray)', lineHeight: 1.6 }}>
                                    {order.address?.line}<br />
                                    {order.address?.city}, {order.address?.state} — {order.address?.pincode}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          .admin-order-row select { width: 100% !important; }
          .admin-toolbar { flex-direction: column !important; align-items: stretch !important; }
          .admin-toolbar > div { justify-content: flex-start !important; }
        }
        @media (max-width: 480px) {
          .stats-grid-admin > div { padding: 14px 12px !important; }
        }
      `}</style>
    </div>
  );
}
