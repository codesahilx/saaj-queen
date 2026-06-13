import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import { FiArrowRight, FiTruck, FiRefreshCw, FiShield, FiHeadphones, FiStar, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { categories, heroSlides, testimonials } from '../data/products';
import { useProducts } from '../hooks/useProducts';
import ProductCard from '../components/ProductCard';

const CAT_EMOJI = {
  necklace: '📿', earring: '✨', ring: '💍', anklet: '🌟',
  watch: '⌚', bracelet: '💛', bag: '👜', giftbox: '🎁',
};

export default function Home() {
  const { products } = useProducts();
  const navigate = useNavigate();
  const [imgErrors, setImgErrors] = useState({});
  const [slideIdx, setSlideIdx] = useState(0);
  const [direction, setDirection] = useState(1);
  const [countdown, setCountdown] = useState({ days: '03', hours: '12', mins: '45', secs: '00' });

  const goTo = useCallback((idx) => {
    setDirection(idx > slideIdx ? 1 : -1);
    setSlideIdx(idx);
  }, [slideIdx]);

  const prev = () => {
    setDirection(-1);
    setSlideIdx(i => (i - 1 + heroSlides.length) % heroSlides.length);
  };
  const next = useCallback(() => {
    setDirection(1);
    setSlideIdx(i => (i + 1) % heroSlides.length);
  }, []);

  // Auto-play
  useEffect(() => {
    const id = setInterval(next, 5500);
    return () => clearInterval(id);
  }, [next]);

  // Countdown timer
  useEffect(() => {
    const end = new Date();
    end.setDate(end.getDate() + 3);
    end.setHours(23, 59, 59, 0);

    const tick = () => {
      const diff = end - Date.now();
      if (diff <= 0) return;
      const pad = n => String(Math.floor(n)).padStart(2, '0');
      setCountdown({
        days:  pad(diff / 86400000),
        hours: pad((diff % 86400000) / 3600000),
        mins:  pad((diff % 3600000) / 60000),
        secs:  pad((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const featuredProducts = products.slice(0, 8);
  const newArrivals = products.filter(p => p.badge === 'new');

  return (
    <>
      {/* ── Hero Slider ── */}
      <section style={{
        position: 'relative',
        height: 'calc(100vh - 109px)',
        minHeight: 520,
        overflow: 'hidden',
        background: '#0D0020',
      }}>
        {/* Slides */}
        <AnimatePresence initial={false} custom={direction} mode="sync">
          <motion.div
            key={slideIdx}
            custom={direction}
            variants={{
              enter: d => ({ opacity: 0, x: d > 0 ? 80 : -80 }),
              center: { opacity: 1, x: 0 },
              exit:  d => ({ opacity: 0, x: d > 0 ? -80 : 80 }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: .7, ease: [.4, 0, .2, 1] }}
            style={{ position: 'absolute', inset: 0 }}
          >
            {/* Background image */}
            <img
              src={heroSlides[slideIdx].img}
              alt={heroSlides[slideIdx].title}
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
            />
            {/* Overlay gradient */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(105deg, rgba(10,0,30,.82) 0%, rgba(10,0,30,.5) 55%, rgba(10,0,30,.15) 100%)',
            }} />

            {/* Content */}
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center',
            }}>
              <div className="container">
                <motion.div
                  initial={{ opacity: 0, y: 36 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: .65, delay: .2, ease: 'easeOut' }}
                  style={{ maxWidth: 580, color: '#fff' }}
                >
                  <motion.span
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: .5, delay: .3 }}
                    style={{
                      display: 'inline-block',
                      background: 'rgba(201,162,39,.18)',
                      border: '1px solid rgba(201,162,39,.55)',
                      color: 'var(--c-gold2)',
                      fontSize: '.72rem', fontWeight: 700,
                      letterSpacing: '.15em', textTransform: 'uppercase',
                      padding: '6px 18px', borderRadius: 50,
                      marginBottom: 22,
                    }}
                  >
                    Saaj Queen Collection
                  </motion.span>

                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: .55, delay: .35 }}
                    style={{
                      fontFamily: 'var(--font-h)',
                      fontSize: 'clamp(2.6rem, 5.5vw, 4.2rem)',
                      fontWeight: 700, lineHeight: 1.1,
                      marginBottom: 18,
                    }}
                  >
                    {heroSlides[slideIdx].title}<br />
                    <span style={{ color: 'var(--c-gold2)' }}>
                      {heroSlides[slideIdx].titleAccent}
                    </span>
                  </motion.h1>

                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: .85 }}
                    transition={{ duration: .5, delay: .45 }}
                    style={{ fontSize: '1rem', lineHeight: 1.75, marginBottom: 36, maxWidth: 440 }}
                  >
                    {heroSlides[slideIdx].subtitle}
                  </motion.p>

                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: .5, delay: .5 }}
                    style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}
                  >
                    <Link to={heroSlides[slideIdx].ctaLink} className="btn btn-gold btn-lg">
                      {heroSlides[slideIdx].cta} <FiArrowRight size={17} />
                    </Link>
                    <Link to="/products" className="btn btn-outline-white btn-lg">
                      All Collections
                    </Link>
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Prev Button */}
        <button
          onClick={prev}
          style={{
            position: 'absolute', left: 24, top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 10,
            width: 52, height: 52, borderRadius: '50%',
            background: 'rgba(255,255,255,.1)',
            border: '1.5px solid rgba(255,255,255,.35)',
            backdropFilter: 'blur(8px)',
            color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'all .25s',
          }}
          className="hero-nav-btn"
          aria-label="Previous"
        >
          <FiChevronLeft size={22} strokeWidth={2.5} />
        </button>

        {/* Next Button */}
        <button
          onClick={next}
          style={{
            position: 'absolute', right: 24, top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 10,
            width: 52, height: 52, borderRadius: '50%',
            background: 'rgba(255,255,255,.1)',
            border: '1.5px solid rgba(255,255,255,.35)',
            backdropFilter: 'blur(8px)',
            color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'all .25s',
          }}
          className="hero-nav-btn"
          aria-label="Next"
        >
          <FiChevronRight size={22} strokeWidth={2.5} />
        </button>

        {/* Dot Indicators */}
        <div style={{
          position: 'absolute', bottom: 28, left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10,
          display: 'flex', gap: 10, alignItems: 'center',
        }}>
          {heroSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              style={{
                height: 4, borderRadius: 4,
                width: i === slideIdx ? 32 : 10,
                background: i === slideIdx ? 'var(--c-gold2)' : 'rgba(255,255,255,.4)',
                border: 'none', cursor: 'pointer',
                transition: 'all .35s cubic-bezier(.4,0,.2,1)',
                padding: 0,
              }}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>

        {/* Slide counter */}
        <div style={{
          position: 'absolute', bottom: 22, right: 28,
          zIndex: 10, color: 'rgba(255,255,255,.5)',
          fontSize: '.78rem', fontWeight: 500,
          fontFamily: 'var(--font-h)',
        }}>
          <span style={{ color: '#fff', fontWeight: 700 }}>{String(slideIdx + 1).padStart(2,'0')}</span>
          {' / '}
          {String(heroSlides.length).padStart(2,'0')}
        </div>
      </section>

      {/* ── Trust Bar ── */}
      <section style={{ background: 'var(--c-dark)', padding: '0' }}>
        <div className="container">
          <div className="trust-grid" style={{ borderTop: '1px solid rgba(255,255,255,.06)' }}>
            {[
              { icon: FiTruck,       title: 'Free Shipping',   sub: 'On orders above ₹999' },
              { icon: FiRefreshCw,   title: 'Easy Returns',    sub: '7-day hassle-free returns' },
              { icon: FiShield,      title: '100% Authentic',  sub: 'Certified quality jewellery' },
              { icon: FiHeadphones,  title: '24/7 Support',    sub: 'Dedicated customer care' },
            ].map(({ icon: Icon, title, sub }) => (
              <div key={title} style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '22px 24px',
                borderRight: '1px solid rgba(255,255,255,.06)',
                color: '#fff',
              }}>
                <Icon size={22} style={{ color: 'var(--c-gold)', flexShrink: 0 }} />
                <div>
                  <p style={{ fontWeight: 600, fontSize: '.88rem' }}>{title}</p>
                  <p style={{ fontSize: '.76rem', opacity: .55, marginTop: 2 }}>{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ── */}
      <section className="section" style={{ background: 'var(--c-bg2)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <span className="section-eyebrow">Explore</span>
            <h2 className="section-title">Shop By Category</h2>
            <div className="title-bar center" />
          </div>
          <div className="cat-grid">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * .07, duration: .35 }}
              >
                <Link
                  to={`/products?category=${cat.id}`}
                  style={{ display: 'block', textAlign: 'center' }}
                  className="cat-item"
                >
                  <div style={{
                    borderRadius: '50%', overflow: 'hidden',
                    border: '3px solid var(--c-border)',
                    marginBottom: 12, transition: 'var(--transition)',
                    aspectRatio: '1', background: '#EDE9FE',
                  }}
                    className="cat-ring"
                  >
                    {imgErrors[cat.id] ? (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.4rem', background: 'var(--c-purple-lt)' }}>
                        {CAT_EMOJI[cat.id]}
                      </div>
                    ) : (
                      <img
                        src={cat.img}
                        alt={cat.label}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .4s' }}
                        className="cat-img"
                        onError={() => setImgErrors(prev => ({ ...prev, [cat.id]: true }))}
                      />
                    )}
                  </div>
                  <p style={{ fontSize: '.85rem', fontWeight: 600, color: 'var(--c-dark)' }}>{cat.label}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Products ── */}
      <section className="section">
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 48, flexWrap: 'wrap', gap: 16 }}>
            <div>
              <span className="section-eyebrow">Handpicked</span>
              <h2 className="section-title">Featured Collection</h2>
              <div className="title-bar" />
            </div>
            <Link to="/products" className="btn btn-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              View All <FiArrowRight size={14} />
            </Link>
          </div>
          <div className="prod-grid-4">
            {featuredProducts.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>

      {/* ── Full-Width Banner ── */}
      <section style={{ position: 'relative', overflow: 'hidden' }}>
        <img
          src="https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=1920&q=80"
          alt="Bridal Collection"
          className="bridal-banner-img"
        />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to left, rgba(59,7,100,.8) 0%, rgba(59,7,100,.4) 60%, transparent 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
        }}>
          <div className="container">
            <div className="bridal-text" style={{ maxWidth: 460, marginLeft: 'auto', color: '#fff', textAlign: 'right' }}>
              <span className="badge badge-gold" style={{ marginBottom: 16 }}>Bridal Season 2025</span>
              <h2 style={{ fontFamily: 'var(--font-h)', fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', lineHeight: 1.2, marginBottom: 14 }}>
                Make Your Wedding<br />Unforgettable
              </h2>
              <p style={{ opacity: .8, fontSize: '.95rem', marginBottom: 28 }}>
                Exclusive bridal sets curated by our master craftsmen. Reserve yours before it sells out.
              </p>
              <Link to="/products?category=giftbox" className="btn btn-gold btn-lg">
                Shop Gift Sets <FiArrowRight size={17} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Sale / Countdown ── */}
      <section style={{
        background: 'linear-gradient(135deg, #1A0042 0%, #3B0764 50%, #1A0042 100%)',
        padding: '72px 0',
      }}>
        <div className="container">
          <div className="sale-grid">
            <div style={{ color: '#fff' }}>
              <span style={{
                display: 'inline-block',
                background: 'rgba(201,162,39,.15)',
                border: '1px solid rgba(201,162,39,.4)',
                color: 'var(--c-gold2)',
                fontSize: '.72rem', fontWeight: 700,
                letterSpacing: '.15em', textTransform: 'uppercase',
                padding: '5px 16px', borderRadius: 50, marginBottom: 16,
              }}>
                Limited Time Sale
              </span>
              <h2 style={{ fontFamily: 'var(--font-h)', fontSize: 'clamp(2rem, 4vw, 3.2rem)', lineHeight: 1.15, marginBottom: 14 }}>
                Upto <span style={{ color: 'var(--c-gold2)' }}>50% Off</span><br />on All Orders
              </h2>
              <p style={{ opacity: .75, fontSize: '.95rem', marginBottom: 36 }}>
                Our biggest sale is live. Grab your favourite pieces before they're gone.
              </p>

              {/* Countdown */}
              <div style={{ display: 'flex', gap: 12, marginBottom: 36 }}>
                {[
                  { val: countdown.days,  label: 'Days' },
                  { val: countdown.hours, label: 'Hours' },
                  { val: countdown.mins,  label: 'Mins' },
                  { val: countdown.secs,  label: 'Secs' },
                ].map(({ val, label }, i) => (
                  <div key={label}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div className="countdown-box" style={{
                        background: 'rgba(255,255,255,.1)',
                        border: '1px solid rgba(201,162,39,.3)',
                        borderRadius: 10,
                        padding: '14px 18px', textAlign: 'center', minWidth: 68,
                      }}>
                        <span className="countdown-val" style={{ display: 'block', fontSize: '1.9rem', fontWeight: 700, color: 'var(--c-gold2)', lineHeight: 1 }}>
                          {val}
                        </span>
                        <span style={{ fontSize: '.65rem', opacity: .6, letterSpacing: '.08em', textTransform: 'uppercase', marginTop: 5, display: 'block' }}>
                          {label}
                        </span>
                      </div>
                      {i < 3 && <span style={{ color: 'var(--c-gold2)', fontSize: '1.4rem', fontWeight: 700, opacity: .7 }}>:</span>}
                    </div>
                  </div>
                ))}
              </div>
              <Link to="/products?sale=1" className="btn btn-gold btn-lg">
                Shop Sale Now <FiArrowRight size={17} />
              </Link>
            </div>
            <div style={{ position: 'relative' }}>
              <img
                src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=700&q=80"
                alt="Sale"
                style={{ width: '100%', borderRadius: 20, boxShadow: '0 24px 64px rgba(0,0,0,.4)' }}
              />
              <div className="sale-badge-circle" style={{
                position: 'absolute', top: -16, right: -16,
                background: 'var(--c-gold)',
                color: '#0D0D0D', borderRadius: '50%',
                width: 88, height: 88,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, boxShadow: '0 8px 24px rgba(201,162,39,.5)',
              }}>
                <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>50%</span>
                <span style={{ fontSize: '.65rem', letterSpacing: '.05em' }}>OFF</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── New Arrivals ── */}
      <section className="section" style={{ background: 'var(--c-bg2)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <span className="section-eyebrow">Just Landed</span>
            <h2 className="section-title">New Arrivals</h2>
            <div className="title-bar center" />
          </div>
          <div className="prod-grid-4">
            {products.filter(p => p.badge === 'new' || p.badge === 'bestseller').slice(0, 4).map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Saaj Queen ── */}
      <section className="section">
        <div className="container">
          <div className="about-grid">
            <div style={{ position: 'relative' }}>
              <img
                src="https://images.unsplash.com/photo-1573408301185-9519f94f3e76?auto=format&fit=crop&w=700&q=80"
                alt="About Saaj Queen"
                className="about-img"
              />
              <div className="about-stats-box" style={{
                position: 'absolute', bottom: -20, right: -20,
                background: 'var(--c-purple)',
                borderRadius: 16, padding: '20px 24px', color: '#fff',
                boxShadow: '0 16px 48px rgba(59,7,100,.4)',
              }}>
                <div style={{ display: 'flex', gap: 24 }}>
                  {[{ n: '50K+', l: 'Happy Queens' }, { n: '600+', l: 'Designs' }, { n: '5★', l: 'Rating' }].map(({ n, l }) => (
                    <div key={l} style={{ textAlign: 'center' }}>
                      <p style={{ fontFamily: 'var(--font-h)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--c-gold2)' }}>{n}</p>
                      <p style={{ fontSize: '.72rem', opacity: .75, marginTop: 2 }}>{l}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <span className="section-eyebrow">Our Story</span>
              <h2 className="section-title">Crafted With Love,<br />Worn With Pride</h2>
              <div className="title-bar" />
              <p className="section-sub" style={{ marginTop: 20 }}>
                Saaj Queen was born from a passion for making every woman feel like royalty. We bring you handcrafted jewellery that blends traditional Indian artistry with modern elegance.
              </p>
              <p className="section-sub" style={{ marginTop: 12 }}>
                Each piece is carefully crafted by skilled artisans using premium materials — ensuring jewellery that's not just beautiful, but built to last generations.
              </p>
              <div style={{ display: 'flex', gap: 16, marginTop: 32, flexWrap: 'wrap' }}>
                <Link to="/products" className="btn btn-dark btn-lg">
                  Explore Collection <FiArrowRight size={17} />
                </Link>
                <a href="#contact" className="btn btn-outline btn-lg">Our Story</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="section" style={{ background: 'var(--c-bg2)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <span className="section-eyebrow">Reviews</span>
            <h2 className="section-title">What Our Queens Say</h2>
            <div className="title-bar center" />
          </div>
          <Swiper
            modules={[Autoplay, Pagination]}
            slidesPerView={1}
            spaceBetween={24}
            autoplay={{ delay: 4000, disableOnInteraction: false }}
            pagination={{ clickable: true }}
            breakpoints={{
              640:  { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
            style={{ paddingBottom: 48 }}
          >
            {testimonials.map(t => (
              <SwiperSlide key={t.id}>
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  style={{
                    background: '#fff', borderRadius: 16,
                    padding: '28px 24px',
                    border: '1px solid var(--c-border)',
                    height: '100%',
                  }}
                >
                  {/* Stars */}
                  <div style={{ display: 'flex', gap: 3, marginBottom: 16 }}>
                    {[...Array(t.rating)].map((_, i) => (
                      <FiStar key={i} size={14} style={{ color: 'var(--c-gold)', fill: 'var(--c-gold)' }} />
                    ))}
                  </div>
                  <p style={{ fontSize: '.92rem', lineHeight: 1.75, color: 'var(--c-gray)', fontStyle: 'italic', marginBottom: 20 }}>
                    "{t.text}"
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: '50%',
                      background: 'linear-gradient(135deg, var(--c-purple), var(--c-purple2))',
                      color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 700, fontSize: '1rem', flexShrink: 0,
                    }}>
                      {t.avatar}
                    </div>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: '.9rem' }}>{t.name}</p>
                      <p style={{ fontSize: '.76rem', color: 'var(--c-gray)' }}>{t.city}</p>
                    </div>
                  </div>
                </motion.div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>

      {/* ── Instagram Grid ── */}
      <section className="section">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <span className="section-eyebrow">Follow Us</span>
            <h2 className="section-title">@saajqueen</h2>
            <p className="section-sub">Follow us on Instagram for daily jewellery inspiration</p>
            <div className="title-bar center" />
          </div>
          <div className="insta-grid">
            {[
              '1611652022419-a9419f74343d',
              '1599643478518-a784e5dc4c8f',
              '1535632066927-ab7c9ab60908',
              '1605100804763-247f67b3557e',
              '1573408301185-9519f94f3e76',
              '1515562141207-7a88fb7ce338',
            ].map((id, i) => (
              <a
                key={id}
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                style={{ display: 'block', aspectRatio: '1', overflow: 'hidden', borderRadius: 8 }}
                className="insta-item"
              >
                <img
                  src={`https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=300&q=80`}
                  alt={`Instagram ${i + 1}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .4s' }}
                  className="insta-img"
                />
              </a>
            ))}
          </div>
        </div>
      </section>

      <style>{`
        .hero-nav-btn:hover {
          background: var(--c-gold) !important;
          border-color: var(--c-gold) !important;
          color: #0D0D0D !important;
          transform: translateY(-50%) scale(1.08) !important;
        }
        .cat-item:hover .cat-ring { border-color: var(--c-gold) !important; }
        .cat-item:hover .cat-img  { transform: scale(1.08); }
        .insta-item:hover .insta-img { transform: scale(1.1); }
        @media (max-width: 768px) {
          .hero-nav-btn { width: 40px !important; height: 40px !important; left: 12px !important; }
          .hero-nav-btn:last-of-type { right: 12px !important; }
          .sale-badge-circle { top: -8px !important; right: -8px !important; width: 68px !important; height: 68px !important; }
          .countdown-box { padding: 10px 12px !important; min-width: 58px !important; }
          .countdown-val { font-size: 1.4rem !important; }
          .bridal-text   { text-align: center !important; margin-left: 0 !important; }
          .about-stats-box { bottom: 0 !important; right: 0 !important; }
        }
        @media (max-width: 480px) {
          .hero-nav-btn { display: none !important; }
        }
      `}</style>
    </>
  );
}
