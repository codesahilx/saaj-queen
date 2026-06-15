import { Link } from 'react-router-dom';
import { FiInstagram, FiFacebook, FiYoutube, FiMail, FiPhone, FiClock } from 'react-icons/fi';
import { useState } from 'react';

const collections = [
  { label: 'Necklaces',      to: '/products?category=necklace' },
  { label: 'Earrings',       to: '/products?category=earring' },
  { label: 'Bangles & Kadas', to: '/products?category=bangle' },
  { label: 'Rings',          to: '/products?category=ring' },
  { label: 'Maang Tikka',    to: '/products?category=maangtikka' },
  { label: 'Anklets',        to: '/products?category=anklet' },
];

const helpLinks = [
  'Track Order', 'Return Policy', 'Size Guide',
  'Jewellery Care', 'FAQ', 'Contact Us',
];

export default function Footer() {
  const [email, setEmail] = useState('');

  return (
    <footer style={{ background: '#0D0D0D', color: 'rgba(255,255,255,.75)' }}>
      {/* Top strip */}
      <div style={{
        background: 'linear-gradient(90deg, #3B0764, #6B21A8, #3B0764)',
        padding: '28px 0',
      }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
          <div>
            <p style={{ fontFamily: 'var(--font-h)', fontSize: '1.2rem', color: '#fff', fontStyle: 'italic' }}>
              "Jewellery that tells your story"
            </p>
            <p style={{ fontSize: '.82rem', opacity: .7, marginTop: 4 }}>Join 50,000+ happy queens who trust Saaj Queen</p>
          </div>
          <form
            onSubmit={e => { e.preventDefault(); setEmail(''); }}
            className="newsletter-form"
            style={{ display: 'flex', gap: 8 }}
          >
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter your email for exclusive offers"
              className="newsletter-input"
              style={{
                padding: '11px 18px', borderRadius: 50,
                border: '1.5px solid rgba(255,255,255,.25)',
                background: 'rgba(255,255,255,.1)',
                color: '#fff', fontSize: '.85rem',
                outline: 'none', width: 280,
              }}
            />
            <button type="submit" className="btn btn-gold">Subscribe</button>
          </form>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container" style={{ padding: '56px 24px 40px' }}>
        <div className="footer-grid">
          {/* Brand */}
          <div>
            <Link to="/">
              <img src="/logo.jpeg" alt="Saaj Queen" style={{
                height: 70, width: 70, borderRadius: '50%',
                border: '2px solid var(--c-gold)', marginBottom: 16,
              }} />
            </Link>
            <p style={{ fontSize: '.85rem', lineHeight: 1.8, opacity: .7, marginBottom: 20, maxWidth: 220 }}>
              Handcrafted jewellery that blends traditional Indian artistry with modern elegance. Making every woman feel like a queen since 2020.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              {[
                { icon: FiInstagram, href: '#' },
                { icon: FiFacebook,  href: '#' },
                { icon: FiYoutube,   href: '#' },
              ].map(({ icon: Icon, href }) => (
                <a
                  key={href + Icon.name}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    width: 38, height: 38, borderRadius: '50%',
                    background: 'rgba(255,255,255,.08)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1rem', transition: 'var(--transition)',
                    color: 'rgba(255,255,255,.7)',
                  }}
                  className="footer-social"
                >
                  <Icon size={17} />
                </a>
              ))}
            </div>
          </div>

          {/* Collections */}
          <div>
            <h4 style={headStyle}>Collections</h4>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {collections.map(c => (
                <li key={c.label}>
                  <Link to={c.to} style={{ fontSize: '.85rem', opacity: .7, transition: 'var(--transition)' }} className="footer-link">
                    {c.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 style={headStyle}>Help</h4>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {helpLinks.map(l => (
                <li key={l}>
                  <a href="#" style={{ fontSize: '.85rem', opacity: .7, transition: 'var(--transition)' }} className="footer-link">
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 style={headStyle}>Contact Us</h4>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { icon: FiPhone, text: '+91 90825 41454' },
                { icon: FiMail,  text: 'saajqueen454@gmail.com' },
                { icon: FiClock, text: 'Mon–Sun, 10am – 7pm IST' },
              ].map(({ icon: Icon, text }) => (
                <li key={text} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Icon size={15} style={{ color: 'var(--c-gold)', flexShrink: 0 }} />
                  <span style={{ fontSize: '.84rem', opacity: .75 }}>{text}</span>
                </li>
              ))}
            </ul>

            {/* Payment */}
            <div style={{ marginTop: 28 }}>
              <p style={{ fontSize: '.72rem', opacity: .5, marginBottom: 10, letterSpacing: '.08em', textTransform: 'uppercase' }}>
                We Accept
              </p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {['UPI', 'Visa', 'Mastercard', 'RuPay', 'COD'].map(p => (
                  <span key={p} style={{
                    fontSize: '.68rem', fontWeight: 700,
                    background: 'rgba(255,255,255,.1)',
                    color: 'rgba(255,255,255,.7)',
                    padding: '4px 10px', borderRadius: 4,
                    letterSpacing: '.04em',
                  }}>
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,.08)', padding: '18px 0' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <p style={{ fontSize: '.78rem', opacity: .4 }}>
            © 2025 Saaj Queen. All rights reserved.
          </p>
          <div style={{ display: 'flex', gap: 20 }}>
            {['Privacy Policy', 'Terms of Service', 'Refund Policy'].map(l => (
              <a key={l} href="#" style={{ fontSize: '.76rem', opacity: .4, transition: 'opacity .2s' }} className="footer-link">
                {l}
              </a>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .footer-social:hover { background: var(--c-purple2) !important; color: #fff !important; opacity: 1 !important; }
        .footer-link:hover   { opacity: 1 !important; color: var(--c-gold) !important; }
      `}</style>
    </footer>
  );
}

const headStyle = {
  color: '#fff',
  fontSize: '.9rem',
  fontWeight: 600,
  marginBottom: 18,
  paddingBottom: 10,
  borderBottom: '1px solid rgba(255,255,255,.08)',
};
