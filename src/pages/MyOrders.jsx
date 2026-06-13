import { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPackage, FiChevronDown, FiChevronUp, FiMapPin, FiPhone, FiShoppingBag } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { db, ADMIN_WHATSAPP } from '../firebase';
import { useAuth } from '../context/AuthContext';

const STATUS_COLORS = {
  pending:   { color: '#F59E0B', bg: '#FEF3C7', label: 'Pending' },
  confirmed: { color: '#3B82F6', bg: '#EFF6FF', label: 'Confirmed' },
  shipped:   { color: '#8B5CF6', bg: '#EDE9FE', label: 'Shipped' },
  delivered: { color: '#16A34A', bg: '#DCFCE7', label: 'Delivered' },
  cancelled: { color: '#EF4444', bg: '#FEE2E2', label: 'Cancelled' },
};

export default function MyOrders() {
  const { user } = useAuth();
  const [orders,   setOrders]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [expanded, setExpanded] = useState(null);

  const fmt = n => '₹' + (n || 0).toLocaleString('en-IN');

  useEffect(() => {
    if (!user) return;
    const fetchOrders = async () => {
      try {
        const q = query(
          collection(db, 'orders'),
          where('customer.uid', '==', user.uid)
        );
        const snap = await getDocs(q);
        const sorted = snap.docs
          .map(d => ({ _docId: d.id, ...d.data() }))
          .sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
        setOrders(sorted);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  const waMsg = o =>
    `Hi Saaj Queen! 👋\nMujhe apne order *${o.orderId}* ke baare mein poochna tha.\nStatus: ${STATUS_COLORS[o.status]?.label || o.status}`;

  return (
    <>
      <div className="page-hero">
        <div className="breadcrumb">
          <Link to="/">Home</Link><span className="sep">›</span>
          <span>My Orders</span>
        </div>
        <h1>My Orders</h1>
        <p>Track and manage your jewellery orders</p>
      </div>

      <div className="section" style={{ background: 'var(--c-bg2)', paddingTop: 40 }}>
        <div className="container" style={{ maxWidth: 800 }}>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <div style={{ width: 36, height: 36, border: '3px solid var(--c-border)', borderTop: '3px solid var(--c-purple)', borderRadius: '50%', animation: 'spin .7s linear infinite', margin: '0 auto 16px' }} />
              <p style={{ color: 'var(--c-gray)' }}>Loading your orders…</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="empty-state" style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--c-border)' }}>
              <div style={{ fontSize: '3.5rem', marginBottom: 16, opacity: .25 }}>
                <FiShoppingBag />
              </div>
              <h3>No orders yet</h3>
              <p>You haven't placed any orders. Start shopping!</p>
              <Link to="/products" className="btn btn-dark" style={{ marginTop: 20 }}>
                Browse Collection
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <p style={{ fontSize: '.85rem', color: 'var(--c-gray)', marginBottom: 4 }}>
                {orders.length} order{orders.length > 1 ? 's' : ''} found
              </p>
              <AnimatePresence>
                {orders.map(order => {
                  const cfg     = STATUS_COLORS[order.status] || STATUS_COLORS.pending;
                  const isOpen  = expanded === order._docId;
                  const ts      = order.createdAt?.toDate?.();
                  const dateStr = ts ? ts.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

                  return (
                    <motion.div
                      key={order._docId}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{ background: '#fff', borderRadius: 14, border: '1px solid var(--c-border)', overflow: 'hidden' }}
                    >
                      {/* Order header */}
                      <div style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>

                        {/* First item image */}
                        {order.items?.[0]?.image && (
                          <img
                            src={order.items[0].image}
                            alt=""
                            style={{ width: 54, height: 54, borderRadius: 8, objectFit: 'cover', border: '1px solid var(--c-border)', flexShrink: 0 }}
                          />
                        )}

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                            <p style={{ fontWeight: 700, fontSize: '.92rem', color: 'var(--c-dark)', fontFamily: 'var(--font-h)' }}>
                              #{order.orderId}
                            </p>
                            <span style={{ background: cfg.bg, color: cfg.color, fontSize: '.7rem', fontWeight: 700, padding: '3px 10px', borderRadius: 50 }}>
                              {cfg.label}
                            </span>
                          </div>
                          <p style={{ fontSize: '.78rem', color: 'var(--c-gray)', marginTop: 3 }}>
                            {dateStr} · {(order.items || []).reduce((s, i) => s + i.qty, 0)} items · {order.payment?.toUpperCase()}
                          </p>
                        </div>

                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <p style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--c-purple)' }}>{fmt(order.total)}</p>
                          {order.shipping === 0 && <p style={{ fontSize: '.7rem', color: 'var(--c-green)' }}>Free shipping</p>}
                        </div>

                        <button
                          onClick={() => setExpanded(isOpen ? null : order._docId)}
                          style={{ color: 'var(--c-gray)', padding: 6, flexShrink: 0 }}
                        >
                          {isOpen ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
                        </button>
                      </div>

                      {/* Status timeline */}
                      <div style={{ padding: '0 20px 16px', display: 'flex', gap: 0, alignItems: 'center' }}>
                        {['pending', 'confirmed', 'shipped', 'delivered'].map((s, i, arr) => {
                          const steps  = ['pending','confirmed','shipped','delivered'];
                          const curIdx = steps.indexOf(order.status);
                          const done   = steps.indexOf(s) <= curIdx && order.status !== 'cancelled';
                          return (
                            <div key={s} style={{ display: 'flex', alignItems: 'center', flex: i < arr.length - 1 ? 1 : 0 }}>
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                                <div style={{
                                  width: 20, height: 20, borderRadius: '50%',
                                  background: done ? 'var(--c-purple)' : (order.status === 'cancelled' ? '#EF4444' : 'var(--c-border)'),
                                  border: `2px solid ${done ? 'var(--c-purple)' : 'var(--c-border)'}`,
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                  {done && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff' }} />}
                                </div>
                                <span style={{ fontSize: '.62rem', color: done ? 'var(--c-purple)' : 'var(--c-gray)', fontWeight: done ? 600 : 400, textTransform: 'capitalize', whiteSpace: 'nowrap' }}>
                                  {s}
                                </span>
                              </div>
                              {i < arr.length - 1 && (
                                <div style={{ flex: 1, height: 2, background: done && steps.indexOf(arr[i+1]) <= curIdx ? 'var(--c-purple)' : 'var(--c-border)', margin: '0 4px', marginBottom: 20 }} />
                              )}
                            </div>
                          );
                        })}
                        {order.status === 'cancelled' && (
                          <span style={{ marginLeft: 12, fontSize: '.72rem', color: '#EF4444', fontWeight: 600 }}>Order Cancelled</span>
                        )}
                      </div>

                      {/* Expanded details */}
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: .22 }}
                            style={{ overflow: 'hidden', borderTop: '1px solid var(--c-border)' }}
                          >
                            <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>

                              {/* Items */}
                              <div>
                                <p style={{ fontSize: '.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--c-gray)', marginBottom: 10 }}>Items Ordered</p>
                                {(order.items || []).map((item, i) => (
                                  <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--c-border)' }}>
                                    {item.image && <img src={item.image} alt={item.name} style={{ width: 44, height: 44, borderRadius: 6, objectFit: 'cover', border: '1px solid var(--c-border)', flexShrink: 0 }} />}
                                    <div style={{ flex: 1 }}>
                                      <p style={{ fontSize: '.85rem', fontWeight: 500 }}>{item.name}</p>
                                      <p style={{ fontSize: '.74rem', color: 'var(--c-gray)' }}>Qty: {item.qty} × {fmt(item.price)}</p>
                                    </div>
                                    <p style={{ fontWeight: 600, fontSize: '.88rem' }}>{fmt(item.price * item.qty)}</p>
                                  </div>
                                ))}
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0 0', fontWeight: 700 }}>
                                  <span>Total Paid</span>
                                  <span style={{ color: 'var(--c-purple)' }}>{fmt(order.total)}</span>
                                </div>
                              </div>

                              {/* Delivery address */}
                              <div style={{ background: 'var(--c-bg2)', borderRadius: 10, padding: '12px 14px' }}>
                                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 6 }}>
                                  <FiMapPin size={13} style={{ color: 'var(--c-purple)', marginTop: 2, flexShrink: 0 }} />
                                  <div>
                                    <p style={{ fontSize: '.78rem', fontWeight: 600, marginBottom: 2 }}>Delivery Address</p>
                                    <p style={{ fontSize: '.78rem', color: 'var(--c-gray)', lineHeight: 1.6 }}>
                                      {order.address?.line}, {order.address?.city}, {order.address?.state} — {order.address?.pincode}
                                    </p>
                                  </div>
                                </div>
                                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                  <FiPhone size={13} style={{ color: 'var(--c-purple)', flexShrink: 0 }} />
                                  <p style={{ fontSize: '.78rem', color: 'var(--c-gray)' }}>{order.customer?.phone}</p>
                                </div>
                              </div>

                              {/* WhatsApp query */}
                              <a
                                href={`https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent(waMsg(order))}`}
                                target="_blank"
                                rel="noreferrer"
                                className="btn btn-full"
                                style={{ background: '#25D366', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 50, fontWeight: 600, fontSize: '.88rem' }}
                              >
                                <FaWhatsapp size={18} />
                                Need help with this order? Chat on WhatsApp
                              </a>
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
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}
