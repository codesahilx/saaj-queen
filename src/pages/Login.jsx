import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Login() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const from      = location.state?.from?.pathname || '/';

  const { login, loginWithGoogle } = useAuth();
  const { addToast } = useToast();

  const [form,       setForm]       = useState({ email: '', password: '' });
  const [showPass,   setShowPass]   = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [googleLoad, setGoogleLoad] = useState(false);
  const [errors,     setErrors]     = useState({});
  const [resetMode,  setResetMode]  = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent,  setResetSent]  = useState(false);

  const { resetPassword } = useAuth();

  const update = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Valid email required';
    if (!form.password || form.password.length < 6) errs.password = 'Password must be at least 6 characters';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleLogin = async e => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await login(form.email, form.password);
      addToast('Welcome back!');
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err.code === 'auth/invalid-credential'
        ? 'Incorrect email or password'
        : err.code === 'auth/too-many-requests'
        ? 'Too many attempts. Try again later.'
        : 'Login failed. Please try again.';
      setErrors({ general: msg });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoad(true);
    try {
      await loginWithGoogle();
      addToast('Welcome to Saaj Queen!');
      navigate(from, { replace: true });
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        addToast('Google sign-in failed. Try again.', 'error');
      }
    } finally {
      setGoogleLoad(false);
    }
  };

  const handleReset = async e => {
    e.preventDefault();
    if (!resetEmail.trim() || !/\S+@\S+\.\S+/.test(resetEmail)) {
      addToast('Enter a valid email address', 'error');
      return;
    }
    try {
      await resetPassword(resetEmail);
      setResetSent(true);
    } catch {
      addToast('Failed to send reset email. Check the address.', 'error');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1A0042 0%, #3B0764 50%, #1A0042 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '40px 16px',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Background decoration */}
      {[
        { size: 400, top: '-15%', left: '-10%', opacity: .12 },
        { size: 300, bottom: '-10%', right: '-8%', opacity: .1 },
        { size: 200, top: '40%',  right: '15%',  opacity: .08 },
      ].map((s, i) => (
        <div key={i} style={{
          position: 'absolute',
          width: s.size, height: s.size,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(201,162,39,.6) 0%, transparent 70%)',
          top: s.top, left: s.left, right: s.right, bottom: s.bottom,
          opacity: s.opacity,
          pointerEvents: 'none',
        }} />
      ))}

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: .4 }}
        style={{
          background: '#fff', borderRadius: 24,
          padding: '40px 40px',
          width: '100%', maxWidth: 440,
          boxShadow: '0 32px 80px rgba(0,0,0,.35)',
          position: 'relative', zIndex: 1,
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <Link to="/">
            <img src="/logo.jpeg" alt="Saaj Queen" style={{ height: 64, width: 64, borderRadius: '50%', border: '2px solid var(--c-gold)', margin: '0 auto 14px' }} />
          </Link>
          {resetMode ? (
            <>
              <h2 style={{ fontFamily: 'var(--font-h)', fontSize: '1.5rem', marginBottom: 6 }}>Reset Password</h2>
              <p style={{ fontSize: '.85rem', color: 'var(--c-gray)' }}>We'll send a reset link to your email</p>
            </>
          ) : (
            <>
              <h2 style={{ fontFamily: 'var(--font-h)', fontSize: '1.5rem', marginBottom: 6 }}>Welcome Back, Queen!</h2>
              <p style={{ fontSize: '.85rem', color: 'var(--c-gray)' }}>Sign in to continue shopping</p>
            </>
          )}
        </div>

        {/* ── Reset Password Mode ── */}
        {resetMode ? (
          resetSent ? (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{ fontSize: '3rem', marginBottom: 12 }}>📧</div>
              <h3 style={{ fontFamily: 'var(--font-h)', marginBottom: 8 }}>Check Your Inbox</h3>
              <p style={{ fontSize: '.85rem', color: 'var(--c-gray)', marginBottom: 24 }}>
                We've sent a password reset link to <strong>{resetEmail}</strong>
              </p>
              <button onClick={() => { setResetMode(false); setResetSent(false); setResetEmail(''); }} className="btn btn-dark btn-full">
                Back to Login
              </button>
            </div>
          ) : (
            <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div style={{ position: 'relative' }}>
                  <FiMail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--c-gray)' }} />
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={e => setResetEmail(e.target.value)}
                    placeholder="priya@example.com"
                    className="form-input"
                    style={{ paddingLeft: 40 }}
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-dark btn-full btn-lg">Send Reset Link</button>
              <button type="button" onClick={() => setResetMode(false)} style={{ fontSize: '.85rem', color: 'var(--c-purple)', fontWeight: 500 }}>
                ← Back to Login
              </button>
            </form>
          )
        ) : (
          <>
            {/* ── Google Button ── */}
            <button
              onClick={handleGoogle}
              disabled={googleLoad}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                padding: '13px', borderRadius: 50,
                border: '1.5px solid var(--c-border)',
                background: '#fff', fontSize: '.88rem', fontWeight: 600,
                color: 'var(--c-dark)', cursor: 'pointer',
                transition: 'var(--transition)', marginBottom: 20,
                opacity: googleLoad ? .7 : 1,
              }}
              className="google-btn"
            >
              {googleLoad
                ? <span style={{ width: 20, height: 20, border: '2px solid #ddd', borderTop: '2px solid var(--c-purple)', borderRadius: '50%', animation: 'spin .7s linear infinite', display: 'inline-block' }} />
                : <FcGoogle size={20} />
              }
              Continue with Google
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ flex: 1, height: 1, background: 'var(--c-border)' }} />
              <span style={{ fontSize: '.78rem', color: 'var(--c-gray)', whiteSpace: 'nowrap' }}>or sign in with email</span>
              <div style={{ flex: 1, height: 1, background: 'var(--c-border)' }} />
            </div>

            {/* ── Email Form ── */}
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {errors.general && (
                <div style={{
                  background: '#FFF0F0', border: '1px solid #FCA5A5',
                  borderRadius: 8, padding: '10px 14px',
                  fontSize: '.82rem', color: '#DC2626',
                }}>
                  {errors.general}
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div style={{ position: 'relative' }}>
                  <FiMail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--c-gray)' }} />
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={update}
                    placeholder="priya@example.com"
                    className={`form-input ${errors.email ? 'error' : ''}`}
                    style={{ paddingLeft: 40 }}
                    autoComplete="email"
                  />
                </div>
                {errors.email && <span className="form-error">{errors.email}</span>}
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="form-label">Password</label>
                  <button
                    type="button"
                    onClick={() => setResetMode(true)}
                    style={{ fontSize: '.78rem', color: 'var(--c-purple)', fontWeight: 500 }}
                  >
                    Forgot password?
                  </button>
                </div>
                <div style={{ position: 'relative' }}>
                  <FiLock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--c-gray)' }} />
                  <input
                    name="password"
                    type={showPass ? 'text' : 'password'}
                    value={form.password}
                    onChange={update}
                    placeholder="Enter your password"
                    className={`form-input ${errors.password ? 'error' : ''}`}
                    style={{ paddingLeft: 40, paddingRight: 44 }}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(p => !p)}
                    style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--c-gray)' }}
                  >
                    {showPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                </div>
                {errors.password && <span className="form-error">{errors.password}</span>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-gold btn-full btn-lg"
                style={{ marginTop: 4, gap: 8, opacity: loading ? .8 : 1 }}
              >
                {loading
                  ? <span style={{ width: 18, height: 18, border: '2px solid rgba(0,0,0,.3)', borderTop: '2px solid #0D0D0D', borderRadius: '50%', animation: 'spin .7s linear infinite', display: 'inline-block' }} />
                  : <><FiArrowRight size={17} /> Sign In</>
                }
              </button>
            </form>

            <p style={{ textAlign: 'center', fontSize: '.85rem', color: 'var(--c-gray)', marginTop: 24 }}>
              Don't have an account?{' '}
              <Link to="/signup" style={{ color: 'var(--c-purple)', fontWeight: 600 }}>Create Account</Link>
            </p>
          </>
        )}
      </motion.div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .google-btn:hover { border-color: var(--c-purple) !important; background: var(--c-purple-lt) !important; }
      `}</style>
    </div>
  );
}
