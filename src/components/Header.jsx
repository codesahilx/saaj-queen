import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiSearch, FiHeart, FiShoppingBag, FiX, FiMenu,
  FiChevronDown, FiUser, FiLogOut, FiPackage, FiSettings, FiShield,
} from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ADMIN_EMAIL } from '../firebase';
import CartSidebar from './CartSidebar';

const navLinks = [
  { label: 'Home', to: '/' },
  {
    label: 'Collections',
    dropdown: [
      { label: 'Necklaces',       to: '/products?category=necklace' },
      { label: 'Earrings',        to: '/products?category=earring' },
      { label: 'Finger Rings',    to: '/products?category=ring' },
      { label: 'Anklets',         to: '/products?category=anklet' },
      { label: 'Vintage Watches', to: '/products?category=watch' },
      { label: 'Bracelets',       to: '/products?category=bracelet' },
      { label: 'Bags',            to: '/products?category=bag' },
      { label: 'Gift Boxes',      to: '/products?category=giftbox' },
    ],
  },
  { label: 'New Arrivals', to: '/products?badge=new' },
  { label: 'Sale',         to: '/products?sale=1' },
  { label: 'About',        to: '/#about' },
];

export default function Header() {
  const [scrolled,    setScrolled]    = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [cartOpen,    setCartOpen]    = useState(false);
  const [searchOpen,  setSearchOpen]  = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dropOpen,    setDropOpen]    = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const searchRef = useRef(null);
  const navigate  = useNavigate();
  const { itemCount } = useCart();
  const { items: wItems } = useWishlist();
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const isAdmin = user?.email?.toLowerCase() === ADMIN_EMAIL;

  const handleLogout = async () => {
    try {
      await logout();
      setUserMenuOpen(false);
      addToast('Logged out successfully', 'info');
      navigate('/');
    } catch {
      addToast('Logout failed', 'error');
    }
  };

  const userInitial = user?.displayName
    ? user.displayName[0].toUpperCase()
    : user?.email?.[0].toUpperCase() ?? 'U';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const handleSearch = e => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <>
      {/* Announcement Bar */}
      <div style={{
        background: 'linear-gradient(90deg,#3B0764,#6B21A8,#3B0764)',
        color: '#E8C547',
        textAlign: 'center',
        padding: '9px 20px',
        fontSize: '.78rem',
        fontWeight: 500,
        letterSpacing: '.03em',
      }}>
        ✦ Free Shipping on orders above ₹999 &nbsp;|&nbsp; Easy 7-Day Returns &nbsp;|&nbsp; COD Available ✦
      </div>

      {/* Main Header */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 700,
        background: '#fff',
        borderBottom: scrolled ? 'none' : '1px solid #EBEBEB',
        boxShadow: scrolled ? '0 4px 24px rgba(0,0,0,.09)' : 'none',
        transition: 'box-shadow .3s',
      }}>
        <div className="container" style={{
          display: 'flex',
          alignItems: 'center',
          height: 72,
          gap: 16,
        }}>

          {/* Hamburger */}
          <button
            className="mobile-toggle"
            onClick={() => setMobileOpen(o => !o)}
            style={{ display: 'none', padding: 8, color: 'var(--c-dark)' }}
            aria-label="Menu"
          >
            {mobileOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>

          {/* Logo */}
          <Link to="/" style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <img
              src="/logo.jpeg"
              alt="Saaj Queen"
              style={{ height: 72, width: 72, borderRadius: '50%', objectFit: 'cover', border: '2.5px solid var(--c-gold)' }}
            />
            <div className="logo-text" style={{ lineHeight: 1.15 }}>
              <p style={{ fontFamily: 'var(--font-h)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--c-dark)', letterSpacing: '.02em' }}>Saaj Queen</p>
              <p style={{ fontSize: '.62rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.14em', color: 'var(--c-gold)', marginTop: 1 }}>Royal Jewellery</p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="desk-nav" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ul style={{ display: 'flex', gap: 2 }}>
              {navLinks.map(link => (
                <li key={link.label} style={{ position: 'relative' }}
                  onMouseEnter={() => link.dropdown && setDropOpen(link.label)}
                  onMouseLeave={() => link.dropdown && setDropOpen(false)}
                >
                  {link.dropdown ? (
                    <>
                      <button style={{
                        display: 'flex', alignItems: 'center', gap: 4,
                        padding: '8px 14px', borderRadius: 8,
                        fontSize: '.86rem', fontWeight: 500,
                        color: 'var(--c-dark)',
                        background: 'none',
                        transition: 'var(--transition)',
                      }}
                      className="nav-link-btn"
                      >
                        {link.label}
                        <FiChevronDown size={13} style={{ transition: '.2s', transform: dropOpen === link.label ? 'rotate(180deg)' : '' }} />
                      </button>
                      <AnimatePresence>
                        {dropOpen === link.label && (
                          <motion.ul
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: .18 }}
                            style={{
                              position: 'absolute', top: '100%', left: 0,
                              background: '#fff', borderRadius: 12,
                              boxShadow: '0 12px 40px rgba(0,0,0,.12)',
                              border: '1px solid var(--c-border)',
                              minWidth: 190, padding: '8px',
                              zIndex: 100, marginTop: 8,
                            }}
                          >
                            {link.dropdown.map(d => (
                              <li key={d.label}>
                                <Link
                                  to={d.to}
                                  onClick={() => setDropOpen(false)}
                                  style={{
                                    display: 'block',
                                    padding: '9px 14px',
                                    fontSize: '.85rem',
                                    borderRadius: 8,
                                    color: 'var(--c-dark)',
                                    transition: 'var(--transition)',
                                  }}
                                  className="dropdown-link"
                                >
                                  {d.label}
                                </Link>
                              </li>
                            ))}
                          </motion.ul>
                        )}
                      </AnimatePresence>
                    </>
                  ) : (
                    <NavLink
                      to={link.to}
                      style={({ isActive }) => ({
                        display: 'block', padding: '8px 14px',
                        borderRadius: 8,
                        fontSize: '.86rem', fontWeight: 500,
                        color: isActive ? 'var(--c-purple)' : 'var(--c-dark)',
                        background: isActive ? 'var(--c-purple-lt)' : 'none',
                        transition: 'var(--transition)',
                      })}
                      className="nav-link"
                    >
                      {link.label}
                    </NavLink>
                  )}
                </li>
              ))}
              {isAdmin && (
                <li>
                  <NavLink
                    to="/admin"
                    style={({ isActive }) => ({
                      display: 'flex', alignItems: 'center', gap: 5,
                      padding: '7px 14px', borderRadius: 8,
                      fontSize: '.86rem', fontWeight: 600,
                      color: isActive ? '#fff' : 'var(--c-purple)',
                      background: isActive ? 'var(--c-purple)' : 'var(--c-purple-lt)',
                      transition: 'var(--transition)',
                      border: '1.5px solid var(--c-purple)',
                    })}
                  >
                    <FiShield size={14} /> Admin
                  </NavLink>
                </li>
              )}
            </ul>
          </nav>

          {/* Header Icons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {/* Search */}
            <button
              onClick={() => setSearchOpen(o => !o)}
              style={{ padding: 10, borderRadius: '50%', color: 'var(--c-dark)', transition: 'var(--transition)' }}
              className="icon-btn"
              aria-label="Search"
            >
              <FiSearch size={19} />
            </button>

            {/* Wishlist */}
            <Link
              to="/wishlist"
              style={{ position: 'relative', padding: 10, borderRadius: '50%', color: 'var(--c-dark)', display: 'flex', transition: 'var(--transition)' }}
              className="icon-btn"
              aria-label="Wishlist"
            >
              <FiHeart size={19} />
              {wItems.length > 0 && (
                <span className="cart-bubble">{wItems.length}</span>
              )}
            </Link>

            {/* Cart */}
            <button
              onClick={() => setCartOpen(true)}
              style={{ position: 'relative', padding: 10, borderRadius: '50%', color: 'var(--c-dark)', transition: 'var(--transition)' }}
              className="icon-btn"
              aria-label="Cart"
            >
              <FiShoppingBag size={19} />
              {itemCount > 0 && (
                <span className="cart-bubble">{itemCount}</span>
              )}
            </button>

            {/* User / Auth */}
            {user ? (
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setUserMenuOpen(o => !o)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 7,
                    padding: '5px 10px 5px 5px',
                    borderRadius: 50,
                    border: '1.5px solid var(--c-border)',
                    background: 'none',
                    transition: 'var(--transition)',
                  }}
                  className="user-toggle"
                >
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="" referrerPolicy="no-referrer" style={{ width: 30, height: 30, borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{
                      width: 30, height: 30, borderRadius: '50%',
                      background: 'linear-gradient(135deg, var(--c-purple), var(--c-purple2))',
                      color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '.8rem', fontWeight: 700, flexShrink: 0,
                    }}>
                      {userInitial}
                    </div>
                  )}
                  <span style={{ fontSize: '.82rem', fontWeight: 500, color: 'var(--c-dark)', maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user.displayName?.split(' ')[0] || 'Account'}
                  </span>
                  <FiChevronDown size={13} style={{ color: 'var(--c-gray)', transition: '.2s', transform: userMenuOpen ? 'rotate(180deg)' : '' }} />
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: .18 }}
                      style={{
                        position: 'absolute', top: 'calc(100% + 10px)', right: 0,
                        minWidth: 220, background: '#fff',
                        borderRadius: 14, border: '1px solid var(--c-border)',
                        boxShadow: '0 12px 40px rgba(0,0,0,.12)',
                        padding: 8, zIndex: 200,
                      }}
                    >
                      {/* User info */}
                      <div style={{ padding: '10px 14px 14px', borderBottom: '1px solid var(--c-border)', marginBottom: 6 }}>
                        <p style={{ fontWeight: 600, fontSize: '.9rem', color: 'var(--c-dark)' }}>
                          {user.displayName || 'My Account'}
                        </p>
                        <p style={{ fontSize: '.76rem', color: 'var(--c-gray)', marginTop: 2 }}>{user.email}</p>
                      </div>

                      {[
                        ...(isAdmin ? [{ icon: FiShield, label: 'Admin Dashboard', to: '/admin', admin: true }] : []),
                        { icon: FiPackage,  label: 'My Orders',   to: '/my-orders' },
                        { icon: FiHeart,    label: 'Wishlist',    to: '/wishlist' },
                        { icon: FiSettings, label: 'Settings',    to: '/settings' },
                      ].map(({ icon: Icon, label, to, admin }) => (
                        <Link
                          key={label}
                          to={to}
                          onClick={() => setUserMenuOpen(false)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            padding: '10px 14px', borderRadius: 8,
                            fontSize: '.86rem', color: admin ? 'var(--c-purple)' : 'var(--c-dark)',
                            fontWeight: admin ? 600 : 400,
                            background: admin ? 'var(--c-purple-lt)' : 'none',
                            transition: 'var(--transition)',
                          }}
                          className="dropdown-link"
                        >
                          <Icon size={15} style={{ color: admin ? 'var(--c-purple)' : 'var(--c-gray)' }} />
                          {label}
                        </Link>
                      ))}

                      <div style={{ borderTop: '1px solid var(--c-border)', marginTop: 6, paddingTop: 6 }}>
                        <button
                          onClick={handleLogout}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            padding: '10px 14px', borderRadius: 8,
                            fontSize: '.86rem', color: 'var(--c-red)',
                            width: '100%', transition: 'var(--transition)',
                          }}
                          className="logout-btn"
                        >
                          <FiLogOut size={15} />
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 6, marginLeft: 4 }}>
                <Link to="/login" className="btn btn-outline btn-sm">Sign In</Link>
                <Link to="/signup" className="btn btn-gold btn-sm">Join</Link>
              </div>
            )}
          </div>
        </div>

        {/* Search Panel */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: .22 }}
              style={{ overflow: 'hidden', background: '#FAF8F5', borderTop: '1px solid var(--c-border)' }}
            >
              <div className="container" style={{ padding: '14px 24px' }}>
                <form onSubmit={handleSearch} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <FiSearch size={18} style={{ color: 'var(--c-gray)', flexShrink: 0 }} />
                  <input
                    ref={searchRef}
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search for necklaces, earrings, rings…"
                    style={{
                      flex: 1, border: 'none', background: 'none',
                      fontSize: '1rem', outline: 'none', color: 'var(--c-dark)',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
                    style={{ color: 'var(--c-gray)', padding: 4 }}
                  >
                    <FiX size={18} />
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Mobile Nav */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="overlay"
              style={{ zIndex: 699 }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: .28 }}
              style={{
                position: 'fixed', top: 0, left: 0,
                width: 300, height: '100vh',
                background: '#fff', zIndex: 710,
                overflowY: 'auto', padding: '80px 0 40px',
                boxShadow: '4px 0 32px rgba(0,0,0,.15)',
              }}
            >
              <button
                onClick={() => setMobileOpen(false)}
                style={{
                  position: 'absolute', top: 18, right: 18,
                  padding: 8, borderRadius: '50%',
                  color: 'var(--c-dark)',
                }}
              >
                <FiX size={22} />
              </button>
              <Link to="/" style={{ display: 'block', textAlign: 'center', marginBottom: 24 }} onClick={() => setMobileOpen(false)}>
                <img src="/logo.jpeg" alt="Saaj Queen" style={{ height: 64, width: 64, borderRadius: '50%', margin: '0 auto', border: '2px solid var(--c-gold)' }} />
              </Link>
              <nav>
                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileOpen(false)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '14px 24px', fontSize: '.93rem', fontWeight: 700,
                      color: 'var(--c-purple)', background: 'var(--c-purple-lt)',
                      borderBottom: '1px solid var(--c-border)',
                    }}
                  >
                    <FiShield size={16} /> Admin Dashboard
                  </Link>
                )}
                {user && (
                  <>
                    <Link to="/my-orders" onClick={() => setMobileOpen(false)}
                      style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 24px', fontSize: '.88rem', fontWeight: 500, color: 'var(--c-dark)', borderBottom: '1px solid var(--c-border)' }}>
                      <FiPackage size={15} style={{ color: 'var(--c-gray)' }} /> My Orders
                    </Link>
                    <Link to="/wishlist" onClick={() => setMobileOpen(false)}
                      style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 24px', fontSize: '.88rem', fontWeight: 500, color: 'var(--c-dark)', borderBottom: '1px solid var(--c-border)' }}>
                      <FiHeart size={15} style={{ color: 'var(--c-gray)' }} /> Wishlist
                    </Link>
                    <Link to="/settings" onClick={() => setMobileOpen(false)}
                      style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 24px', fontSize: '.88rem', fontWeight: 500, color: 'var(--c-dark)', borderBottom: '1px solid var(--c-border)' }}>
                      <FiSettings size={15} style={{ color: 'var(--c-gray)' }} /> Settings
                    </Link>
                    <button onClick={() => { handleLogout(); setMobileOpen(false); }}
                      style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 24px', fontSize: '.88rem', fontWeight: 500, color: 'var(--c-red)', borderBottom: '1px solid var(--c-border)', width: '100%' }}>
                      <FiLogOut size={15} /> Sign Out
                    </button>
                  </>
                )}
                {navLinks.map(link => (
                  <div key={link.label}>
                    {link.dropdown ? (
                      <>
                        <div style={{ padding: '12px 24px', fontWeight: 600, fontSize: '.88rem', color: 'var(--c-purple)', textTransform: 'uppercase', letterSpacing: '.08em' }}>
                          {link.label}
                        </div>
                        {link.dropdown.map(d => (
                          <Link
                            key={d.label}
                            to={d.to}
                            onClick={() => setMobileOpen(false)}
                            style={{ display: 'block', padding: '10px 36px', fontSize: '.87rem', color: 'var(--c-dark)', borderBottom: '1px solid var(--c-border)' }}
                          >
                            {d.label}
                          </Link>
                        ))}
                      </>
                    ) : (
                      <Link
                        to={link.to}
                        onClick={() => setMobileOpen(false)}
                        style={{ display: 'block', padding: '14px 24px', fontSize: '.93rem', fontWeight: 500, color: 'var(--c-dark)', borderBottom: '1px solid var(--c-border)' }}
                      >
                        {link.label}
                      </Link>
                    )}
                  </div>
                ))}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Cart Sidebar */}
      <CartSidebar open={cartOpen} onClose={() => setCartOpen(false)} />

      <style>{`
        .icon-btn:hover { background: var(--c-bg2) !important; color: var(--c-purple) !important; }
        .nav-link:hover { color: var(--c-purple) !important; background: var(--c-purple-lt) !important; }
        .nav-link-btn:hover { color: var(--c-purple) !important; background: var(--c-purple-lt) !important; }
        .dropdown-link:hover { background: var(--c-bg2) !important; color: var(--c-purple) !important; padding-left: 20px !important; }
        .user-toggle:hover { border-color: var(--c-purple) !important; background: var(--c-purple-lt) !important; }
        .logout-btn:hover { background: #FFF0F0 !important; }
        @media (max-width: 860px) {
          .desk-nav { display: none !important; }
          .mobile-toggle { display: flex !important; }
        }
        @media (max-width: 480px) {
          .user-toggle span { display: none !important; }
          .user-toggle { padding: 4px !important; gap: 4px !important; }
        }
      `}</style>
    </>
  );
}
