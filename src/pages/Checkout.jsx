import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { FiChevronRight, FiTruck, FiShield, FiCheck, FiExternalLink } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { db, ADMIN_WHATSAPP } from '../firebase';

const STEPS = ['Delivery', 'Payment', 'Review'];

// Generate order ID: SQ + timestamp last 6 digits
const genOrderId = () => 'SQ' + Date.now().toString().slice(-6);

function buildWhatsAppMsg(orderId, form, items, total, shipping) {
  const itemLines = items.map(i => `  • ${i.name} x${i.qty} — ₹${(i.price * i.qty).toLocaleString('en-IN')}`).join('\n');
  return `🛍️ *NEW ORDER — ${orderId}*

👤 *Customer:* ${form.name}
📱 *Phone:* ${form.phone}
📧 *Email:* ${form.email}

📦 *Items:*
${itemLines}

💰 *Subtotal:* ₹${total.toLocaleString('en-IN')}
🚚 *Shipping:* ${shipping === 0 ? 'FREE' : '₹' + shipping}
✅ *Grand Total:* ₹${(total + shipping).toLocaleString('en-IN')}
💳 *Payment:* ${form.payment.toUpperCase()}

📍 *Delivery Address:*
${form.address}
${form.city}, ${form.state} — ${form.pincode}`;
}

export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [step,    setStep]    = useState(0);
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [waLink,  setWaLink]  = useState('');

  const [form, setForm] = useState({
    name:     user?.displayName || '',
    phone:    '',
    email:    user?.email || '',
    address:  '',
    city:     '',
    state:    '',
    pincode:  '',
    payment:  'cod',
  });
  const [errors, setErrors] = useState({});

  const fmt      = n => '₹' + n.toLocaleString('en-IN');
  const shipping = total >= 999 ? 0 : 59;
  const grand    = total + shipping;

  const update = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.name.trim())    errs.name    = 'Name is required';
    if (!/^\d{10}$/.test(form.phone))      errs.phone   = 'Valid 10-digit number required';
    if (!/\S+@\S+\.\S+/.test(form.email))  errs.email   = 'Valid email required';
    if (!form.address.trim()) errs.address = 'Address is required';
    if (!form.city.trim())    errs.city    = 'City is required';
    if (!form.state.trim())   errs.state   = 'State is required';
    if (!/^\d{6}$/.test(form.pincode))     errs.pincode = 'Valid 6-digit PIN required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (step === 0 && !validate()) return;
    setStep(s => Math.min(s + 1, 2));
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    const oid = genOrderId();

    try {
      // 1. Save to Firestore
      await addDoc(collection(db, 'orders'), {
        orderId:   oid,
        status:    'pending',
        createdAt: serverTimestamp(),
        customer: {
          uid:     user?.uid   || 'guest',
          name:    form.name,
          email:   form.email,
          phone:   form.phone,
        },
        address: {
          line:    form.address,
          city:    form.city,
          state:   form.state,
          pincode: form.pincode,
        },
        items: items.map(i => ({
          id:       i.id,
          name:     i.name,
          price:    i.price,
          mrp:      i.mrp,
          qty:      i.qty,
          category: i.category,
          image:    i.images?.[0] || '',
        })),
        payment:  form.payment,
        subtotal: total,
        shipping,
        total:    grand,
      });

      // 2. Build WhatsApp link
      const msg  = buildWhatsAppMsg(oid, form, items, total, shipping);
      const link = `https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent(msg)}`;
      setWaLink(link);
      setOrderId(oid);

      // 3. Clear cart
      clearCart();
      addToast('Order placed successfully!');

    } catch (err) {
      console.error('Order save failed:', err);
      addToast('Something went wrong. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // ── Order placed success screen ──
  if (orderId) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--c-bg2)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px' }}>
        <motion.div
          initial={{ opacity: 0, scale: .85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: .4 }}
          style={{ background: '#fff', borderRadius: 24, padding: '48px 40px', textAlign: 'center', maxWidth: 500, width: '100%', boxShadow: '0 24px 64px rgba(0,0,0,.1)' }}
        >
          {/* Checkmark */}
          <motion.div
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: .2 }}
            style={{
              width: 80, height: 80, borderRadius: '50%',
              background: 'linear-gradient(135deg, #16A34A, #22C55E)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 24px',
              boxShadow: '0 8px 32px rgba(22,163,74,.35)',
            }}
          >
            <FiCheck size={38} color="#fff" strokeWidth={3} />
          </motion.div>

          <h2 style={{ fontFamily: 'var(--font-h)', fontSize: '1.9rem', marginBottom: 8 }}>Order Confirmed!</h2>
          <p style={{ color: 'var(--c-gray)', marginBottom: 6 }}>
            Thank you, <strong style={{ color: 'var(--c-dark)' }}>{form.name}</strong>!
          </p>
          <div style={{
            display: 'inline-block',
            background: 'var(--c-gold-pale)', border: '1px solid var(--c-gold)',
            color: 'var(--c-gold)', fontWeight: 700, fontSize: '.85rem',
            padding: '6px 18px', borderRadius: 50, margin: '8px 0 20px',
            letterSpacing: '.04em',
          }}>
            Order ID: {orderId}
          </div>

          <p style={{ fontSize: '.88rem', color: 'var(--c-gray)', lineHeight: 1.7, marginBottom: 28 }}>
            Your order has been saved. Now send the order details to us on WhatsApp so we can process it quickly!
          </p>

          {/* WhatsApp CTA - main action */}
          <a
            href={waLink}
            target="_blank"
            rel="noreferrer"
            className="btn btn-full btn-lg"
            style={{ background: '#25D366', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 12, borderRadius: 50, fontWeight: 700 }}
          >
            <FaWhatsapp size={22} />
            Send Order on WhatsApp
          </a>

          <p style={{ fontSize: '.74rem', color: 'var(--c-gray)', marginBottom: 20 }}>
            Order details automatically filled — bas Send karo!
          </p>

          <div style={{ display: 'flex', gap: 10 }}>
            <Link to="/" className="btn btn-outline" style={{ flex: 1 }}>Home</Link>
            <Link to="/products" className="btn btn-dark" style={{ flex: 1 }}>Shop More</Link>
          </div>
        </motion.div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="empty-state" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div className="empty-icon">🛒</div>
        <h3>Your bag is empty</h3>
        <p>Add some products before checking out</p>
        <Link to="/products" className="btn btn-dark" style={{ marginTop: 16 }}>Shop Now</Link>
      </div>
    );
  }

  return (
    <>
      <div className="page-hero" style={{ paddingBottom: 40 }}>
        <div className="breadcrumb">
          <a href="/">Home</a><span className="sep">›</span>
          <span>Checkout</span>
        </div>
        <h1>Checkout</h1>

        {/* Step indicator */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 20 }}>
          {STEPS.map((s, i) => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: i <= step ? 'var(--c-gold)' : 'rgba(255,255,255,.2)',
                color: i <= step ? '#0D0D0D' : 'rgba(255,255,255,.5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '.8rem', fontWeight: 700, transition: '.3s',
              }}>
                {i < step ? <FiCheck size={14} strokeWidth={3} /> : i + 1}
              </div>
              <span style={{ fontSize: '.82rem', color: i <= step ? '#fff' : 'rgba(255,255,255,.45)', fontWeight: i === step ? 600 : 400 }}>
                {s}
              </span>
              {i < STEPS.length - 1 && <FiChevronRight size={14} style={{ color: 'rgba(255,255,255,.3)' }} />}
            </div>
          ))}
        </div>
      </div>

      <div className="section" style={{ paddingTop: 40, background: 'var(--c-bg2)' }}>
        <div className="container">
          <div className="checkout-layout">

            {/* Left: Form */}
            <div style={{ background: '#fff', borderRadius: 16, padding: 32, border: '1px solid var(--c-border)' }}>
              <AnimatePresence mode="wait">

                {/* Step 0 — Delivery */}
                {step === 0 && (
                  <motion.div key="s0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: .22 }}>
                    <h3 style={{ fontFamily: 'var(--font-h)', fontSize: '1.2rem', marginBottom: 24 }}>Delivery Details</h3>
                    <div className="form-grid-2">
                      <div className="form-group">
                        <label className="form-label">Full Name *</label>
                        <input name="name" value={form.name} onChange={update} placeholder="Priya Sharma" className={`form-input ${errors.name ? 'error' : ''}`} />
                        {errors.name && <span className="form-error">{errors.name}</span>}
                      </div>
                      <div className="form-group">
                        <label className="form-label">Phone Number *</label>
                        <input name="phone" value={form.phone} onChange={update} placeholder="9876543210" maxLength={10} className={`form-input ${errors.phone ? 'error' : ''}`} />
                        {errors.phone && <span className="form-error">{errors.phone}</span>}
                      </div>
                    </div>
                    <div className="form-group" style={{ marginBottom: 16 }}>
                      <label className="form-label">Email Address *</label>
                      <input name="email" value={form.email} onChange={update} placeholder="priya@example.com" className={`form-input ${errors.email ? 'error' : ''}`} />
                      {errors.email && <span className="form-error">{errors.email}</span>}
                    </div>
                    <div className="form-group" style={{ marginBottom: 16 }}>
                      <label className="form-label">Full Address *</label>
                      <textarea name="address" value={form.address} onChange={update} placeholder="House No., Street, Locality..." rows={3} className={`form-input ${errors.address ? 'error' : ''}`} style={{ resize: 'none' }} />
                      {errors.address && <span className="form-error">{errors.address}</span>}
                    </div>
                    <div className="form-grid-3">
                      <div className="form-group">
                        <label className="form-label">City *</label>
                        <input name="city" value={form.city} onChange={update} placeholder="Delhi" className={`form-input ${errors.city ? 'error' : ''}`} />
                        {errors.city && <span className="form-error">{errors.city}</span>}
                      </div>
                      <div className="form-group">
                        <label className="form-label">State *</label>
                        <select name="state" value={form.state} onChange={update} className={`form-select ${errors.state ? 'error' : ''}`}>
                          <option value="">Select</option>
                          {['Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Delhi','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal'].map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                        {errors.state && <span className="form-error">{errors.state}</span>}
                      </div>
                      <div className="form-group">
                        <label className="form-label">Pincode *</label>
                        <input name="pincode" value={form.pincode} onChange={update} placeholder="110001" maxLength={6} className={`form-input ${errors.pincode ? 'error' : ''}`} />
                        {errors.pincode && <span className="form-error">{errors.pincode}</span>}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 1 — Payment */}
                {step === 1 && (
                  <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: .22 }}>
                    <h3 style={{ fontFamily: 'var(--font-h)', fontSize: '1.2rem', marginBottom: 24 }}>Payment Method</h3>
                    {[
                      { val: 'cod', label: 'Cash on Delivery', sub: 'Pay when your order arrives — no advance needed', icon: '💵' },
                      { val: 'upi', label: 'UPI / GPay / PhonePe', sub: 'Pay via UPI — details shared on WhatsApp after order', icon: '📱' },
                    ].map(opt => (
                      <label key={opt.val} style={{
                        display: 'flex', alignItems: 'center', gap: 14,
                        padding: '16px 18px', borderRadius: 10, marginBottom: 10,
                        border: `2px solid ${form.payment === opt.val ? 'var(--c-purple)' : 'var(--c-border)'}`,
                        background: form.payment === opt.val ? 'var(--c-purple-lt)' : '#fff',
                        cursor: 'pointer', transition: 'var(--transition)',
                      }}>
                        <input type="radio" name="payment" value={opt.val} checked={form.payment === opt.val} onChange={update} style={{ display: 'none' }} />
                        <span style={{ fontSize: '1.3rem' }}>{opt.icon}</span>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontWeight: 600, fontSize: '.9rem', marginBottom: 2 }}>{opt.label}</p>
                          <p style={{ fontSize: '.78rem', color: 'var(--c-gray)' }}>{opt.sub}</p>
                        </div>
                        <div style={{
                          width: 20, height: 20, borderRadius: '50%',
                          border: `2px solid ${form.payment === opt.val ? 'var(--c-purple)' : 'var(--c-border)'}`,
                          background: form.payment === opt.val ? 'var(--c-purple)' : '#fff',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        }}>
                          {form.payment === opt.val && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff' }} />}
                        </div>
                      </label>
                    ))}
                  </motion.div>
                )}

                {/* Step 2 — Review */}
                {step === 2 && (
                  <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: .22 }}>
                    <h3 style={{ fontFamily: 'var(--font-h)', fontSize: '1.2rem', marginBottom: 24 }}>Review Your Order</h3>
                    <div style={{ background: 'var(--c-bg2)', borderRadius: 10, padding: 16, marginBottom: 20 }}>
                      <p style={{ fontSize: '.76rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--c-gray)', marginBottom: 6 }}>Delivery To</p>
                      <p style={{ fontWeight: 600 }}>{form.name} · {form.phone}</p>
                      <p style={{ fontSize: '.85rem', color: 'var(--c-gray)' }}>{form.address}, {form.city}, {form.state} — {form.pincode}</p>
                      <p style={{ fontSize: '.82rem', color: 'var(--c-purple)', fontWeight: 500, marginTop: 4 }}>Payment: {form.payment.toUpperCase()}</p>
                    </div>
                    {items.map(item => (
                      <div key={item.id} style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--c-border)' }}>
                        <img src={item.images?.[0]} alt={item.name} style={{ width: 60, height: 60, borderRadius: 8, objectFit: 'cover', border: '1px solid var(--c-border)' }} />
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: '.88rem', fontWeight: 500 }}>{item.name}</p>
                          <p style={{ fontSize: '.78rem', color: 'var(--c-gray)' }}>Qty: {item.qty}</p>
                        </div>
                        <p style={{ fontWeight: 600 }}>{fmt(item.price * item.qty)}</p>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Nav Buttons */}
              <div style={{ display: 'flex', gap: 10, marginTop: 28 }}>
                {step > 0 && (
                  <button className="btn btn-outline" style={{ minWidth: 100 }} onClick={() => setStep(s => s - 1)}>
                    Back
                  </button>
                )}
                {step < 2 ? (
                  <button className="btn btn-dark btn-lg" style={{ flex: 1 }} onClick={handleNext}>
                    Continue <FiChevronRight size={16} />
                  </button>
                ) : (
                  <button
                    className="btn btn-gold btn-lg"
                    style={{ flex: 1, opacity: loading ? .8 : 1 }}
                    onClick={handlePlaceOrder}
                    disabled={loading}
                  >
                    {loading
                      ? <span style={{ width: 18, height: 18, border: '2px solid rgba(0,0,0,.3)', borderTop: '2px solid #0D0D0D', borderRadius: '50%', animation: 'spin .7s linear infinite', display: 'inline-block' }} />
                      : <><FiCheck size={16} /> Place Order — {fmt(grand)}</>
                    }
                  </button>
                )}
              </div>
            </div>

            {/* Right: Summary */}
            <div className="checkout-summary" style={{ position: 'sticky', top: 90 }}>
              <div style={{ background: '#fff', borderRadius: 16, padding: 24, border: '1px solid var(--c-border)', marginBottom: 16 }}>
                <h3 style={{ fontFamily: 'var(--font-h)', fontSize: '1.1rem', marginBottom: 20 }}>Order Summary</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
                  {items.map(item => (
                    <div key={item.id} style={{ display: 'flex', gap: 12 }}>
                      <div style={{ position: 'relative', flexShrink: 0 }}>
                        <img src={item.images?.[0]} alt={item.name} style={{ width: 56, height: 56, borderRadius: 8, objectFit: 'cover', border: '1px solid var(--c-border)' }} />
                        <span style={{ position: 'absolute', top: -6, right: -6, background: 'var(--c-dark)', color: '#fff', fontSize: '.62rem', fontWeight: 700, width: 18, height: 18, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {item.qty}
                        </span>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: '.82rem', fontWeight: 500, lineHeight: 1.3 }}>{item.name}</p>
                        <p style={{ fontSize: '.76rem', color: 'var(--c-gray)', marginTop: 3 }}>{fmt(item.price)} × {item.qty}</p>
                      </div>
                      <p style={{ fontSize: '.88rem', fontWeight: 600, flexShrink: 0 }}>{fmt(item.price * item.qty)}</p>
                    </div>
                  ))}
                </div>
                <div className="divider" />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.88rem' }}>
                    <span style={{ color: 'var(--c-gray)' }}>Subtotal</span><span>{fmt(total)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.88rem' }}>
                    <span style={{ color: 'var(--c-gray)' }}>Shipping</span>
                    <span style={{ color: shipping === 0 ? 'var(--c-green)' : 'inherit' }}>{shipping === 0 ? 'FREE' : fmt(shipping)}</span>
                  </div>
                </div>
                <div className="divider" />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.05rem', fontWeight: 700 }}>
                  <span>Total</span><span style={{ color: 'var(--c-purple)' }}>{fmt(grand)}</span>
                </div>
              </div>

              <div style={{ background: '#fff', borderRadius: 16, padding: 18, border: '1px solid var(--c-border)' }}>
                {[
                  { icon: FiTruck,  text: 'Free shipping on orders above ₹999' },
                  { icon: FiShield, text: '100% secure & encrypted checkout' },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} style={{ display: 'flex', gap: 10, marginBottom: 10, fontSize: '.82rem', color: 'var(--c-gray)', alignItems: 'center' }}>
                    <Icon size={14} style={{ color: 'var(--c-purple)', flexShrink: 0 }} />{text}
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 900px) { .checkout-summary { position: static !important; } }
      `}</style>
    </>
  );
}
