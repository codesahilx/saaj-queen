import { useEffect, useState } from 'react';
import {
  collection, onSnapshot, doc, updateDoc, query, orderBy,
  addDoc, deleteDoc, serverTimestamp, setDoc,
} from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiPackage, FiTruck, FiCheck, FiX, FiClock, FiSearch, FiRefreshCw,
  FiChevronDown, FiChevronUp, FiPhone, FiMail, FiMapPin,
  FiPlus, FiEdit2, FiTrash2, FiShoppingBag, FiUploadCloud, FiImage,
} from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { db } from '../firebase';
const CLOUDINARY_CLOUD = 'dvemlgrqc';
const CLOUDINARY_PRESET = 'saaj_queen_products';
import { useToast } from '../context/ToastContext';

const STATUS_CONFIG = {
  pending:   { label: 'Pending',   color: '#F59E0B', bg: '#FEF3C7', icon: FiClock },
  confirmed: { label: 'Confirmed', color: '#3B82F6', bg: '#EFF6FF', icon: FiPackage },
  shipped:   { label: 'Shipped',   color: '#8B5CF6', bg: '#EDE9FE', icon: FiTruck },
  delivered: { label: 'Delivered', color: '#16A34A', bg: '#DCFCE7', icon: FiCheck },
  cancelled: { label: 'Cancelled', color: '#EF4444', bg: '#FEE2E2', icon: FiX },
};
const ALL_STATUSES = Object.keys(STATUS_CONFIG);

const CATEGORIES = ['necklace', 'earring', 'ring', 'anklet', 'watch', 'bracelet', 'bag', 'giftbox'];
const CAT_LABELS = { necklace:'Necklace', earring:'Earring', ring:'Ring', anklet:'Anklet', watch:'Watch', bracelet:'Bracelet', bag:'Bag', giftbox:'Gift Box' };
const BADGES = ['', 'new', 'bestseller', 'limited'];

const EMPTY_FORM = {
  name: '', category: 'necklace', price: '', mrp: '', badge: '',
  desc: '', material: '', weight: '', care: '', stock: '', images: [],
};

export default function Admin() {
  const { addToast } = useToast();
  const fmt = n => '₹' + (n || 0).toLocaleString('en-IN');

  // ─── Tab ─────────────────────────────────────────────────────────────
  const [adminTab, setAdminTab] = useState('orders');

  // ─── Orders state ────────────────────────────────────────────────────
  const [orders,       setOrders]       = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [search,       setSearch]       = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [expanded,     setExpanded]     = useState(null);
  const [updating,     setUpdating]     = useState(null);

  // ─── Products state ──────────────────────────────────────────────────
  const [adminProducts,  setAdminProducts]  = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [showModal,      setShowModal]      = useState(false);
  const [editingProd,    setEditingProd]    = useState(null);
  const [form,           setForm]           = useState(EMPTY_FORM);
  const [saving,         setSaving]         = useState(false);
  const [deleteId,       setDeleteId]       = useState(null);
  const [prodSearch,     setProdSearch]     = useState('');
  const [prodCatFilter,  setProdCatFilter]  = useState('all');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading,      setUploading]      = useState(false);

  // ─── Category images state ────────────────────────────────────────────
  const [catImages,    setCatImages]    = useState({});
  const [catUploading, setCatUploading] = useState({});

  // ─── Firestore listeners ─────────────────────────────────────────────
  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, snap => {
      setOrders(snap.docs.map(d => ({ _docId: d.id, ...d.data() })));
      setOrdersLoading(false);
    }, () => setOrdersLoading(false));
  }, []);

  useEffect(() => {
    return onSnapshot(collection(db, 'products'), snap => {
      const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      all.sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
      setAdminProducts(all);
      setProductsLoading(false);
    }, () => setProductsLoading(false));
  }, []);

  useEffect(() => {
    return onSnapshot(doc(db, 'settings', 'categoryImages'),
      snap => { if (snap.exists()) setCatImages(snap.data()); },
      () => {}
    );
  }, []);

  // ─── Orders helpers ──────────────────────────────────────────────────
  const updateStatus = async (docId, status) => {
    setUpdating(docId);
    try { await updateDoc(doc(db, 'orders', docId), { status }); }
    catch (e) { console.error(e); }
    finally { setUpdating(null); }
  };

  const filteredOrders = orders.filter(o => {
    const ms = !search || [o.orderId, o.customer?.name, o.customer?.phone, o.customer?.email]
      .join(' ').toLowerCase().includes(search.toLowerCase());
    return ms && (filterStatus === 'all' || o.status === filterStatus);
  });

  const orderStats = {
    total:     orders.length,
    pending:   orders.filter(o => o.status === 'pending').length,
    shipped:   orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    revenue:   orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + (o.total || 0), 0),
  };

  const waText = (o) =>
    `Hi ${o.customer?.name}! 👋\nYour Saaj Queen order *${o.orderId}* has been *${o.status}*.\nThank you for shopping with us! 🛍️`;

  // ─── Products helpers ─────────────────────────────────────────────────
  const filteredProds = adminProducts.filter(p => {
    const ms = !prodSearch || p.name.toLowerCase().includes(prodSearch.toLowerCase());
    const mc = prodCatFilter === 'all' || p.category === prodCatFilter;
    return ms && mc;
  });

  const prodStats = {
    total:    adminProducts.length,
    inStock:  adminProducts.filter(p => (p.stock || 0) > 5).length,
    lowStock: adminProducts.filter(p => (p.stock || 0) > 0 && (p.stock || 0) <= 5).length,
    outStock: adminProducts.filter(p => (p.stock || 0) === 0).length,
  };


  const openAdd = () => {
    setEditingProd(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = p => {
    setEditingProd(p);
    setForm({
      name: p.name || '', category: p.category || 'necklace',
      price: p.price || '', mrp: p.mrp || '', badge: p.badge || '',
      desc: p.desc || '', material: p.material || '',
      weight: p.weight || '', care: p.care || '',
      stock: p.stock || '', images: p.images || [],
    });
    setShowModal(true);
  };

  const compressImage = (file) => new Promise(resolve => {
    const img = new Image();
    const blobUrl = URL.createObjectURL(file);
    img.onload = () => {
      const MAX = 1200;
      let { width, height } = img;
      if (width > MAX) { height = Math.round(height * MAX / width); width = MAX; }
      else if (height > MAX) { width = Math.round(width * MAX / height); height = MAX; }
      const canvas = document.createElement('canvas');
      canvas.width = width; canvas.height = height;
      canvas.getContext('2d').drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(blobUrl);
      canvas.toBlob(resolve, 'image/jpeg', 0.82);
    };
    img.src = blobUrl;
  });

  const handleImageUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    setUploadProgress(10);
    try {
      const compressed = await compressImage(file);
      setUploadProgress(40);
      const fd = new FormData();
      fd.append('file', compressed, 'product.jpg');
      fd.append('upload_preset', CLOUDINARY_PRESET);
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`,
        { method: 'POST', body: fd }
      );
      setUploadProgress(90);
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      setForm(f => ({ ...f, images: [...f.images, data.secure_url] }));
      setUploadProgress(100);
      setTimeout(() => { setUploading(false); setUploadProgress(0); }, 400);
      addToast('Image uploaded!', 'success');
    } catch {
      addToast('Upload failed', 'error');
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleCatImageUpload = async (catId, file) => {
    if (!file) return;
    setCatUploading(u => ({ ...u, [catId]: true }));
    try {
      const compressed = await compressImage(file);
      const fd = new FormData();
      fd.append('file', compressed, 'category.jpg');
      fd.append('upload_preset', CLOUDINARY_PRESET);
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`,
        { method: 'POST', body: fd }
      );
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      await setDoc(doc(db, 'settings', 'categoryImages'), { [catId]: data.secure_url }, { merge: true });
      addToast(`${CAT_LABELS[catId]} image updated!`, 'success');
    } catch {
      addToast('Upload failed', 'error');
    } finally {
      setCatUploading(u => ({ ...u, [catId]: false }));
    }
  };

  const handleSave = async () => {
    if (!form.name || !form.price || !form.mrp) {
      addToast('Name, Price and MRP are required', 'error'); return;
    }
    setSaving(true);
    try {
      const data = {
        name:     form.name.trim(),
        category: form.category,
        price:    Number(form.price),
        mrp:      Number(form.mrp),
        badge:    form.badge || null,
        desc:     form.desc.trim(),
        material: form.material.trim(),
        weight:   form.weight.trim(),
        care:     form.care.trim(),
        stock:    Number(form.stock) || 0,
        images:   form.images,
      };
      if (editingProd) {
        await updateDoc(doc(db, 'products', editingProd.id), data);
        addToast('Product updated!', 'success');
      } else {
        await addDoc(collection(db, 'products'), { ...data, createdAt: serverTimestamp() });
        addToast('Product added!', 'success');
      }
      setShowModal(false);
    } catch (e) {
      console.error(e);
      addToast('Save failed. Try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteDoc(doc(db, 'products', deleteId));
      addToast('Product deleted', 'success');
    } catch (e) {
      addToast('Delete failed', 'error');
    } finally {
      setDeleteId(null);
    }
  };

  const inp = (field, placeholder, type = 'text') => (
    <input
      type={type}
      placeholder={placeholder}
      value={form[field]}
      onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
      style={{ width: '100%', padding: '10px 14px', border: '1.5px solid var(--c-border)', borderRadius: 8, fontSize: '.88rem', outline: 'none', boxSizing: 'border-box' }}
    />
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--c-bg2)' }}>

      {/* Admin Header */}
      <div style={{ background: 'linear-gradient(135deg, var(--c-purple), var(--c-dark2))', padding: '28px 0' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <img src="/logo.jpeg" alt="Saaj Queen" style={{ height: 44, width: 44, borderRadius: '50%', border: '2px solid var(--c-gold)' }} />
            <div>
              <h1 style={{ fontFamily: 'var(--font-h)', color: '#fff', fontSize: '1.5rem' }}>Admin Dashboard</h1>
              <p style={{ color: 'rgba(255,255,255,.6)', fontSize: '.78rem' }}>Saaj Queen · Store Management</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,.7)', fontSize: '.82rem' }}>
            <FiRefreshCw size={13} /> Live updates enabled
          </div>
        </div>
      </div>

      <div className="container admin-container" style={{ padding: '32px 24px' }}>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', gap: 4, background: '#fff', borderRadius: 14, padding: 5, marginBottom: 28, border: '1px solid var(--c-border)', width: 'fit-content' }}>
          {[
            { id: 'orders',     label: 'Orders',     Icon: FiPackage },
            { id: 'products',   label: 'Products',   Icon: FiShoppingBag },
            { id: 'categories', label: 'Categories', Icon: FiImage },
          ].map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setAdminTab(id)}
              style={{
                padding: '9px 22px', borderRadius: 10, fontSize: '.88rem', fontWeight: 600,
                background: adminTab === id ? 'var(--c-purple)' : 'transparent',
                color: adminTab === id ? '#fff' : 'var(--c-gray)',
                display: 'flex', alignItems: 'center', gap: 7,
                transition: '.2s', border: 'none', cursor: 'pointer',
              }}
            >
              <Icon size={15} /> {label}
            </button>
          ))}
        </div>

        {/* ═══════════════ ORDERS TAB ═══════════════ */}
        {adminTab === 'orders' && (
          <>
            {/* Order Stats */}
            <div className="stats-grid-admin">
              {[
                { label: 'Total Orders',  value: orderStats.total,     color: 'var(--c-purple)', icon: FiPackage },
                { label: 'Pending',       value: orderStats.pending,   color: '#F59E0B',         icon: FiClock },
                { label: 'Shipped',       value: orderStats.shipped,   color: '#8B5CF6',         icon: FiTruck },
                { label: 'Delivered',     value: orderStats.delivered, color: '#16A34A',         icon: FiCheck },
                { label: 'Total Revenue', value: fmt(orderStats.revenue), color: 'var(--c-gold)', icon: null, big: true },
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

            {/* Order Toolbar */}
            <div style={{ background: '#fff', borderRadius: 14, padding: '16px 20px', border: '1px solid var(--c-border)', marginBottom: 20, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
                <FiSearch size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--c-gray)' }} />
                <input
                  value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search by order ID, name, phone…"
                  style={{ width: '100%', paddingLeft: 36, paddingRight: 12, paddingTop: 9, paddingBottom: 9, border: '1.5px solid var(--c-border)', borderRadius: 8, fontSize: '.85rem', outline: 'none' }}
                />
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {['all', ...ALL_STATUSES].map(s => {
                  const cfg = s === 'all' ? null : STATUS_CONFIG[s];
                  const isActive = filterStatus === s;
                  return (
                    <button key={s} onClick={() => setFilterStatus(s)} style={{
                      padding: '7px 14px', borderRadius: 50, fontSize: '.78rem', fontWeight: 600,
                      border: `1.5px solid ${isActive ? (cfg?.color || 'var(--c-purple)') : 'var(--c-border)'}`,
                      background: isActive ? (cfg?.bg || 'var(--c-purple-lt)') : '#fff',
                      color: isActive ? (cfg?.color || 'var(--c-purple)') : 'var(--c-gray)',
                      cursor: 'pointer', transition: '.2s', textTransform: 'capitalize',
                    }}>
                      {s === 'all' ? `All (${orders.length})` : `${cfg.label} (${orders.filter(o => o.status === s).length})`}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Orders List */}
            {ordersLoading ? (
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <div style={{ width: 40, height: 40, border: '3px solid var(--c-border)', borderTop: '3px solid var(--c-purple)', borderRadius: '50%', animation: 'spin .7s linear infinite', margin: '0 auto 16px' }} />
                <p style={{ color: 'var(--c-gray)' }}>Loading orders…</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="empty-state" style={{ background: '#fff', borderRadius: 14, border: '1px solid var(--c-border)' }}>
                <div className="empty-icon">📦</div>
                <h3>No orders found</h3>
                <p>{search ? 'Try a different search term' : 'No orders yet — share your store link!'}</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <AnimatePresence>
                  {filteredOrders.map(order => {
                    const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
                    const StatusIcon = cfg.icon;
                    const isExpanded = expanded === order._docId;
                    const ts = order.createdAt?.toDate?.();
                    const dateStr = ts ? ts.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

                    return (
                      <motion.div key={order._docId} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        style={{ background: '#fff', borderRadius: 14, border: '1px solid var(--c-border)', overflow: 'hidden' }}>
                        <div style={{ padding: '18px 22px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                          <div style={{ minWidth: 120 }}>
                            <p style={{ fontWeight: 700, fontSize: '.9rem', color: 'var(--c-dark)', fontFamily: 'var(--font-h)' }}>#{order.orderId}</p>
                            <p style={{ fontSize: '.72rem', color: 'var(--c-gray)', marginTop: 2 }}>{dateStr}</p>
                          </div>
                          <div style={{ flex: 1, minWidth: 150 }}>
                            <p style={{ fontWeight: 600, fontSize: '.88rem' }}>{order.customer?.name}</p>
                            <p style={{ fontSize: '.75rem', color: 'var(--c-gray)' }}>{order.customer?.phone}</p>
                          </div>
                          <div style={{ minWidth: 80, textAlign: 'center' }}>
                            <p style={{ fontWeight: 600, fontSize: '.9rem' }}>{(order.items || []).reduce((s, i) => s + i.qty, 0)} items</p>
                            <p style={{ fontSize: '.72rem', color: 'var(--c-gray)' }}>{order.payment?.toUpperCase()}</p>
                          </div>
                          <div style={{ minWidth: 90, textAlign: 'right' }}>
                            <p style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--c-purple)' }}>{fmt(order.total)}</p>
                            {order.shipping === 0 && <p style={{ fontSize: '.68rem', color: 'var(--c-green)' }}>Free shipping</p>}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: cfg.bg, color: cfg.color, padding: '5px 12px', borderRadius: 50, fontSize: '.76rem', fontWeight: 700, minWidth: 100 }}>
                            <StatusIcon size={13} /> {cfg.label}
                          </div>
                          <select
                            value={order.status}
                            onChange={e => updateStatus(order._docId, e.target.value)}
                            disabled={updating === order._docId}
                            style={{ padding: '7px 10px', borderRadius: 8, fontSize: '.8rem', border: '1.5px solid var(--c-border)', background: '#fff', cursor: 'pointer', outline: 'none', minWidth: 130, opacity: updating === order._docId ? .6 : 1 }}
                          >
                            {ALL_STATUSES.map(s => <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>)}
                          </select>
                          <a href={`https://wa.me/91${order.customer?.phone}?text=${encodeURIComponent(waText(order))}`}
                            target="_blank" rel="noreferrer"
                            style={{ width: 36, height: 36, borderRadius: '50%', background: '#25D366', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <FaWhatsapp size={17} />
                          </a>
                          <button onClick={() => setExpanded(isExpanded ? null : order._docId)} style={{ color: 'var(--c-gray)', padding: 6 }}>
                            {isExpanded ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
                          </button>
                        </div>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: .25 }}
                              style={{ overflow: 'hidden', borderTop: '1px solid var(--c-border)' }}>
                              <div className="order-details-grid" style={{ padding: '20px 22px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
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
          </>
        )}

        {/* ═══════════════ PRODUCTS TAB ═══════════════ */}
        {/* ═══════════════ CATEGORIES TAB ═══════════════ */}
        {adminTab === 'categories' && (
          <div>
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontFamily: 'var(--font-h)', fontSize: '1.2rem', marginBottom: 6 }}>Category Images</h3>
              <p style={{ color: 'var(--c-gray)', fontSize: '.85rem' }}>
                Ye images Home page pe "Shop By Category" section mein dikhti hain. Har category ke liye ek acchi image upload karo.
              </p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
              {CATEGORIES.map(catId => (
                <div key={catId} style={{ background: '#fff', borderRadius: 14, border: '1px solid var(--c-border)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ aspectRatio: '1', background: '#EDE9FE', position: 'relative', overflow: 'hidden' }}>
                    {catImages[catId] ? (
                      <img src={catImages[catId]} alt={CAT_LABELS[catId]}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8 }}>
                        <FiImage size={32} style={{ color: 'var(--c-purple)', opacity: .4 }} />
                        <span style={{ fontSize: '.75rem', color: 'var(--c-gray)' }}>No image</span>
                      </div>
                    )}
                    {catUploading[catId] && (
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ width: 32, height: 32, border: '3px solid rgba(255,255,255,.3)', borderTop: '3px solid #fff', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
                      </div>
                    )}
                  </div>
                  <div style={{ padding: '12px 14px' }}>
                    <p style={{ fontWeight: 600, fontSize: '.88rem', marginBottom: 10 }}>{CAT_LABELS[catId]}</p>
                    <label style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      padding: '8px', border: '1.5px dashed var(--c-purple)',
                      borderRadius: 8, cursor: catUploading[catId] ? 'not-allowed' : 'pointer',
                      background: 'var(--c-purple-lt)', color: 'var(--c-purple)',
                      fontSize: '.78rem', fontWeight: 600,
                      opacity: catUploading[catId] ? .6 : 1,
                    }}>
                      <FiUploadCloud size={14} />
                      {catImages[catId] ? 'Change Image' : 'Upload Image'}
                      <input type="file" accept="image/*" style={{ display: 'none' }}
                        disabled={catUploading[catId]}
                        onChange={e => { handleCatImageUpload(catId, e.target.files[0]); e.target.value = ''; }} />
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {adminTab === 'products' && (
          <>
            {/* Product Stats */}
            <div className="prod-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 28 }}>
              {[
                { label: 'Total Products', value: prodStats.total,    color: 'var(--c-purple)' },
                { label: 'In Stock',       value: prodStats.inStock,  color: '#16A34A' },
                { label: 'Low Stock (≤5)', value: prodStats.lowStock, color: '#F59E0B' },
                { label: 'Out of Stock',   value: prodStats.outStock, color: '#EF4444' },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ background: '#fff', borderRadius: 14, padding: '20px 18px', border: '1px solid var(--c-border)' }}>
                  <p style={{ fontSize: '.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--c-gray)', marginBottom: 10 }}>{label}</p>
                  <p style={{ fontSize: '2rem', fontWeight: 700, color }}>{value}</p>
                </div>
              ))}
            </div>

            {/* Product Toolbar */}
            <div style={{ background: '#fff', borderRadius: 14, padding: '14px 18px', border: '1px solid var(--c-border)', marginBottom: 16, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flex: 1, minWidth: 180 }}>
                <FiSearch size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--c-gray)' }} />
                <input value={prodSearch} onChange={e => setProdSearch(e.target.value)} placeholder="Search products…"
                  style={{ width: '100%', paddingLeft: 36, paddingRight: 12, paddingTop: 9, paddingBottom: 9, border: '1.5px solid var(--c-border)', borderRadius: 8, fontSize: '.85rem', outline: 'none' }} />
              </div>
              <select value={prodCatFilter} onChange={e => setProdCatFilter(e.target.value)}
                style={{ padding: '9px 12px', border: '1.5px solid var(--c-border)', borderRadius: 8, fontSize: '.85rem', outline: 'none' }}>
                <option value="all">All Categories</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{CAT_LABELS[c]}</option>)}
              </select>
              <button
                onClick={openAdd}
                style={{ padding: '9px 18px', background: 'var(--c-purple)', color: '#fff', borderRadius: 8, fontWeight: 600, fontSize: '.85rem', display: 'flex', alignItems: 'center', gap: 7, flexShrink: 0 }}
              >
                <FiPlus size={16} /> Add Product
              </button>
            </div>

            {/* Product List */}
            {productsLoading ? (
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <div style={{ width: 40, height: 40, border: '3px solid var(--c-border)', borderTop: '3px solid var(--c-purple)', borderRadius: '50%', animation: 'spin .7s linear infinite', margin: '0 auto 16px' }} />
                <p style={{ color: 'var(--c-gray)' }}>Loading products…</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {filteredProds.map(p => (
                  <motion.div key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    style={{ background: '#fff', borderRadius: 12, border: `1px solid ${(p.stock || 0) <= 5 && (p.stock || 0) > 0 ? '#FEF3C7' : (p.stock || 0) === 0 ? '#FEE2E2' : 'var(--c-border)'}`, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>

                    {/* Image */}
                    <div style={{ width: 58, height: 58, borderRadius: 8, overflow: 'hidden', flexShrink: 0, border: '1px solid var(--c-border)', background: '#F7F3EE' }}>
                      {p.images?.[0] ? (
                        <img src={p.images[0]} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--c-gray2)', fontSize: '1.3rem' }}>🖼️</div>
                      )}
                    </div>

                    {/* Name + Category */}
                    <div style={{ flex: 1, minWidth: 140 }}>
                      <p style={{ fontWeight: 600, fontSize: '.9rem' }}>{p.name}</p>
                      <p style={{ fontSize: '.76rem', color: 'var(--c-gray)', marginTop: 2 }}>{CAT_LABELS[p.category] || p.category}</p>
                    </div>

                    {/* Price */}
                    <div style={{ textAlign: 'right', minWidth: 100 }}>
                      <p style={{ fontWeight: 700, color: 'var(--c-purple)' }}>{fmt(p.price)}</p>
                      <p style={{ fontSize: '.75rem', color: 'var(--c-gray)', textDecoration: 'line-through' }}>{fmt(p.mrp)}</p>
                    </div>

                    {/* Stock */}
                    <div style={{ textAlign: 'center', minWidth: 80 }}>
                      <p style={{ fontWeight: 600, fontSize: '.88rem', color: (p.stock || 0) === 0 ? '#EF4444' : (p.stock || 0) <= 5 ? '#F59E0B' : '#16A34A' }}>
                        {p.stock || 0}
                      </p>
                      <p style={{ fontSize: '.7rem', color: 'var(--c-gray)' }}>in stock</p>
                    </div>

                    {/* Badge */}
                    {p.badge && (
                      <span className={`badge badge-${p.badge === 'bestseller' ? 'gold' : p.badge === 'new' ? 'purple' : 'red'}`} style={{ flexShrink: 0 }}>
                        {p.badge}
                      </span>
                    )}

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                      <button
                        onClick={() => openEdit(p)}
                        style={{ padding: '7px 14px', borderRadius: 7, border: '1.5px solid var(--c-purple)', color: 'var(--c-purple)', fontSize: '.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5, background: 'transparent' }}
                      >
                        <FiEdit2 size={13} /> Edit
                      </button>
                      <button
                        onClick={() => setDeleteId(p.id)}
                        style={{ padding: '7px 14px', borderRadius: 7, border: '1.5px solid #EF4444', color: '#EF4444', fontSize: '.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5, background: 'transparent' }}
                      >
                        <FiTrash2 size={13} /> Delete
                      </button>
                    </div>
                  </motion.div>
                ))}

                {filteredProds.length === 0 && (
                  <div className="empty-state" style={{ background: '#fff', borderRadius: 14, border: '1px solid var(--c-border)' }}>
                    <div className="empty-icon">🔍</div>
                    <h3>No products found</h3>
                    <p>Try a different search or category filter</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* ═══════════════ ADD / EDIT MODAL ═══════════════ */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.55)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
            onClick={e => e.target === e.currentTarget && setShowModal(false)}>
            <motion.div initial={{ scale: .95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: .95 }}
              style={{ background: '#fff', borderRadius: 20, padding: '28px 32px', width: '100%', maxWidth: 640, maxHeight: '90vh', overflowY: 'auto' }}>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h3 style={{ fontFamily: 'var(--font-h)', fontSize: '1.4rem' }}>
                  {editingProd ? 'Edit Product' : 'Add New Product'}
                </h3>
                <button onClick={() => setShowModal(false)} style={{ color: 'var(--c-gray)', padding: 4 }}><FiX size={22} /></button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Name */}
                <div>
                  <label style={lbl}>Product Name *</label>
                  {inp('name', 'e.g. Royal Kundan Necklace')}
                </div>

                {/* Category + Badge */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={lbl}>Category *</label>
                    <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                      style={{ width: '100%', padding: '10px 14px', border: '1.5px solid var(--c-border)', borderRadius: 8, fontSize: '.88rem', outline: 'none' }}>
                      {CATEGORIES.map(c => <option key={c} value={c}>{CAT_LABELS[c]}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={lbl}>Badge</label>
                    <select value={form.badge} onChange={e => setForm(f => ({ ...f, badge: e.target.value }))}
                      style={{ width: '100%', padding: '10px 14px', border: '1.5px solid var(--c-border)', borderRadius: 8, fontSize: '.88rem', outline: 'none' }}>
                      <option value="">No Badge</option>
                      <option value="new">New Arrival</option>
                      <option value="bestseller">Bestseller</option>
                      <option value="limited">Limited Edition</option>
                    </select>
                  </div>
                </div>

                {/* Price + MRP */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={lbl}>Selling Price (₹) *</label>
                    {inp('price', 'e.g. 1299', 'number')}
                  </div>
                  <div>
                    <label style={lbl}>Original Price / MRP (₹) *</label>
                    {inp('mrp', 'e.g. 2199', 'number')}
                  </div>
                </div>

                {/* Stock */}
                <div>
                  <label style={lbl}>Stock Quantity</label>
                  {inp('stock', 'e.g. 20', 'number')}
                </div>

                {/* Multi-Image Upload */}
                <div>
                  <label style={lbl}>
                    Product Photos
                    <span style={{ fontSize: '.7rem', fontWeight: 400, color: 'var(--c-gray)', marginLeft: 6 }}>
                      (1st photo = cover · max 5MB each)
                    </span>
                  </label>

                  {/* Uploaded images grid */}
                  {form.images.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 10 }}>
                      {form.images.map((url, idx) => (
                        <div key={url} style={{ position: 'relative', flexShrink: 0 }}>
                          <img src={url} alt={`photo ${idx + 1}`}
                            style={{ width: 80, height: 80, borderRadius: 8, objectFit: 'cover', border: `2px solid ${idx === 0 ? 'var(--c-purple)' : 'var(--c-border)'}` }} />
                          {idx === 0 && (
                            <span style={{ position: 'absolute', top: 3, left: 3, background: 'var(--c-purple)', color: '#fff', fontSize: '.55rem', fontWeight: 700, padding: '1px 5px', borderRadius: 4 }}>
                              COVER
                            </span>
                          )}
                          <button
                            onClick={() => setForm(f => ({ ...f, images: f.images.filter((_, i) => i !== idx) }))}
                            style={{ position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: '50%', background: 'var(--c-red)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.7rem', fontWeight: 700, border: '2px solid #fff' }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Upload button */}
                  <label style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 16px', border: '1.5px dashed var(--c-purple)',
                    borderRadius: 8, cursor: uploading ? 'not-allowed' : 'pointer',
                    background: 'var(--c-purple-lt)', color: 'var(--c-purple)',
                    fontSize: '.88rem', fontWeight: 600,
                    opacity: uploading ? .6 : 1,
                  }}>
                    <FiUploadCloud size={18} />
                    {uploading ? `Uploading… ${uploadProgress}%` : `Add Photo ${form.images.length > 0 ? `(${form.images.length} added)` : ''}`}
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      disabled={uploading}
                      onChange={e => { handleImageUpload(e.target.files[0]); e.target.value = ''; }}
                    />
                  </label>

                  {/* Progress bar */}
                  {uploading && (
                    <div style={{ height: 4, background: 'var(--c-border)', borderRadius: 4, marginTop: 8, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${uploadProgress}%`, background: 'var(--c-purple)', borderRadius: 4, transition: 'width .3s' }} />
                    </div>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label style={lbl}>Description</label>
                  <textarea value={form.desc} onChange={e => setForm(f => ({ ...f, desc: e.target.value }))}
                    placeholder="Describe the product…" rows={3}
                    style={{ width: '100%', padding: '10px 14px', border: '1.5px solid var(--c-border)', borderRadius: 8, fontSize: '.88rem', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
                </div>

                {/* Material + Weight */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={lbl}>Material</label>
                    {inp('material', 'e.g. Gold Plated Brass')}
                  </div>
                  <div>
                    <label style={lbl}>Weight</label>
                    {inp('weight', 'e.g. 85g')}
                  </div>
                </div>

                {/* Care */}
                <div>
                  <label style={lbl}>Care Instructions</label>
                  {inp('care', 'e.g. Avoid water and perfume contact')}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
                <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: '12px', borderRadius: 10, border: '1.5px solid var(--c-border)', fontWeight: 600, background: '#fff' }}>
                  Cancel
                </button>
                <button onClick={handleSave} disabled={saving}
                  style={{ flex: 2, padding: '12px', borderRadius: 10, background: 'var(--c-purple)', color: '#fff', fontWeight: 700, opacity: saving ? .7 : 1 }}>
                  {saving ? 'Saving…' : editingProd ? 'Save Changes' : 'Add Product'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════ DELETE CONFIRM ═══════════════ */}
      <AnimatePresence>
        {deleteId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.55)', zIndex: 1001, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
            <motion.div initial={{ scale: .9 }} animate={{ scale: 1 }} exit={{ scale: .9 }}
              style={{ background: '#fff', borderRadius: 16, padding: '28px 32px', maxWidth: 380, width: '100%', textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🗑️</div>
              <h3 style={{ fontFamily: 'var(--font-h)', marginBottom: 8 }}>Delete Product?</h3>
              <p style={{ color: 'var(--c-gray)', fontSize: '.88rem', marginBottom: 24 }}>This will permanently remove the product from your store.</p>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setDeleteId(null)} style={{ flex: 1, padding: '11px', borderRadius: 9, border: '1.5px solid var(--c-border)', fontWeight: 600 }}>Cancel</button>
                <button onClick={handleDelete} style={{ flex: 1, padding: '11px', borderRadius: 9, background: '#EF4444', color: '#fff', fontWeight: 700 }}>Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }

        @media (max-width: 860px) {
          /* Order stats: 2 col, Revenue full width */
          .stats-grid-admin { grid-template-columns: repeat(2,1fr) !important; }
          .stats-grid-admin > div:last-child { grid-column: span 2; }
          /* Product stats: 2 col */
          .prod-stats-grid { grid-template-columns: repeat(2,1fr) !important; }
          /* Expanded order details: stack vertically */
          .order-details-grid { grid-template-columns: 1fr !important; }
          /* Admin container padding */
          .admin-container { padding: 20px 14px !important; }
        }

        @media (max-width: 600px) {
          /* Order card: status select full width */
          .stats-grid-admin > div { padding: 14px 12px !important; }
          .prod-stats-grid > div { padding: 14px 12px !important; }
        }
      `}</style>
    </div>
  );
}

const lbl = { display: 'block', fontSize: '.76rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--c-gray)', marginBottom: 6 };
