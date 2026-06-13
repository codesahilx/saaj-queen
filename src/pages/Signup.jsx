import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiCheck, FiArrowRight } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Signup() {
  const navigate = useNavigate();
  const { signup, loginWithGoogle } = useAuth();
  const { addToast } = useToast();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPass,    setShowPass]    = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [googleLoad,  setGoogleLoad]  = useState(false);
  const [errors,      setErrors]      = useState({});

  const update = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const passStrength = pw => {
    if (!pw) return 0;
    let score = 0;
    if (pw.length >= 8)           score++;
    if (/[A-Z]/.test(pw))         score++;
    if (/[0-9]/.test(pw))         score++;
    if (/[^A-Za-z0-9]/.test(pw))  score++;
    return score;
  };
  const strength = passStrength(form.password);
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strength];
  const strengthColor = ['', '#EF4444', '#F59E0B', '#3B82F6', '#16A34A'][strength];

  const validate = () => {
    const errs = {};
    if (!form.name.trim() || form.name.trim().length < 2) errs.name = 'Enter your full name';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Valid email required';
    if (!form.password || form.password.length < 6)  errs.password = 'Minimum 6 characters';
    if (form.password !== form.confirm) errs.confirm = 'Passwords do not match';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSignup = async e => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await signup(form.name.trim(), form.email.trim(), form.password);
      addToast('Account created! Welcome to Saaj Queen 👑');
      navigate('/', { replace: true });
    } catch (err) {
      const msg = err.code === 'auth/email-already-in-use'
        ? 'This email is already registered. Try logging in.'
        : err.code === 'auth/weak-password'
        ? 'Password is too weak. Use at least 6 characters.'
        : 'Signup failed. Please try again.';
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
      navigate('/', { replace: true });
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        addToast('Google sign-in failed. Try again.', 'error');
      }
    } finally {
      setGoogleLoad(false);
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
      {/* Background glows */}
      {[
        { size: 350, top: '-10%', right: '-8%',  opacity: .12 },
        { size: 280, bottom: '-8%', left: '-6%', opacity: .1  },
      ].map((s, i) => (
        <div key={i} style={{
          position: 'absolute',
          width: s.size, height: s.size, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(201,162,39,.6) 0%, transparent 70%)',
          top: s.top, left: s.left, right: s.right, bottom: s.bottom,
          opacity: s.opacity, pointerEvents: 'none',
        }} />
      ))}

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: .4 }}
        style={{
          background: '#fff', borderRadius: 24,
          padding: '40px',
          width: '100%', maxWidth: 460,
          boxShadow: '0 32px 80px rgba(0,0,0,.35)',
          position: 'relative', zIndex: 1,
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <Link to="/">
            <img src="/logo.jpeg" alt="Saaj Queen" style={{ height: 64, width: 64, borderRadius: '50%', border: '2px solid var(--c-gold)', margin: '0 auto 14px' }} />
          </Link>
          <h2 style={{ fontFamily: 'var(--font-h)', fontSize: '1.5rem', marginBottom: 6 }}>Join Saaj Queen</h2>
          <p style={{ fontSize: '.85rem', color: 'var(--c-gray)' }}>Create your account to start shopping</p>
        </div>

        {/* Google */}
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
          Sign up with Google
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{ flex: 1, height: 1, background: 'var(--c-border)' }} />
          <span style={{ fontSize: '.78rem', color: 'var(--c-gray)', whiteSpace: 'nowrap' }}>or create with email</span>
          <div style={{ flex: 1, height: 1, background: 'var(--c-border)' }} />
        </div>

        {/* Form */}
        <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {errors.general && (
            <div style={{ background: '#FFF0F0', border: '1px solid #FCA5A5', borderRadius: 8, padding: '10px 14px', fontSize: '.82rem', color: '#DC2626' }}>
              {errors.general}
            </div>
          )}

          {/* Name */}
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div style={{ position: 'relative' }}>
              <FiUser size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--c-gray)' }} />
              <input
                name="name" value={form.name} onChange={update}
                placeholder="Priya Sharma"
                className={`form-input ${errors.name ? 'error' : ''}`}
                style={{ paddingLeft: 40 }}
                autoComplete="name"
              />
            </div>
            {errors.name && <span className="form-error">{errors.name}</span>}
          </div>

          {/* Email */}
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <FiMail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--c-gray)' }} />
              <input
                name="email" value={form.email} onChange={update}
                type="email" placeholder="priya@example.com"
                className={`form-input ${errors.email ? 'error' : ''}`}
                style={{ paddingLeft: 40 }}
                autoComplete="email"
              />
            </div>
            {errors.email && <span className="form-error">{errors.email}</span>}
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <FiLock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--c-gray)' }} />
              <input
                name="password" value={form.password} onChange={update}
                type={showPass ? 'text' : 'password'}
                placeholder="Min. 6 characters"
                className={`form-input ${errors.password ? 'error' : ''}`}
                style={{ paddingLeft: 40, paddingRight: 44 }}
                autoComplete="new-password"
              />
              <button type="button" onClick={() => setShowPass(p => !p)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--c-gray)' }}>
                {showPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>
            {/* Strength bar */}
            {form.password && (
              <div style={{ marginTop: 6 }}>
                <div style={{ height: 4, background: 'var(--c-border)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${(strength / 4) * 100}%`, background: strengthColor, borderRadius: 2, transition: 'width .3s, background .3s' }} />
                </div>
                <span style={{ fontSize: '.72rem', color: strengthColor, fontWeight: 600 }}>{strengthLabel}</span>
              </div>
            )}
            {errors.password && <span className="form-error">{errors.password}</span>}
          </div>

          {/* Confirm */}
          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <div style={{ position: 'relative' }}>
              <FiLock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--c-gray)' }} />
              <input
                name="confirm" value={form.confirm} onChange={update}
                type={showConfirm ? 'text' : 'password'}
                placeholder="Re-enter password"
                className={`form-input ${errors.confirm ? 'error' : ''}`}
                style={{ paddingLeft: 40, paddingRight: 44 }}
                autoComplete="new-password"
              />
              <button type="button" onClick={() => setShowConfirm(p => !p)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--c-gray)' }}>
                {showConfirm ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
              {form.confirm && form.password === form.confirm && (
                <FiCheck size={16} style={{ position: 'absolute', right: 40, top: '50%', transform: 'translateY(-50%)', color: 'var(--c-green)' }} />
              )}
            </div>
            {errors.confirm && <span className="form-error">{errors.confirm}</span>}
          </div>

          <p style={{ fontSize: '.75rem', color: 'var(--c-gray)', lineHeight: 1.6 }}>
            By creating an account, you agree to our{' '}
            <a href="#" style={{ color: 'var(--c-purple)' }}>Terms of Service</a> and{' '}
            <a href="#" style={{ color: 'var(--c-purple)' }}>Privacy Policy</a>.
          </p>

          <button
            type="submit" disabled={loading}
            className="btn btn-gold btn-full btn-lg"
            style={{ marginTop: 4, gap: 8, opacity: loading ? .8 : 1 }}
          >
            {loading
              ? <span style={{ width: 18, height: 18, border: '2px solid rgba(0,0,0,.3)', borderTop: '2px solid #0D0D0D', borderRadius: '50%', animation: 'spin .7s linear infinite', display: 'inline-block' }} />
              : <><FiArrowRight size={17} /> Create Account</>
            }
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '.85rem', color: 'var(--c-gray)', marginTop: 24 }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--c-purple)', fontWeight: 600 }}>Sign In</Link>
        </p>
      </motion.div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .google-btn:hover { border-color: var(--c-purple) !important; background: var(--c-purple-lt) !important; }
      `}</style>
    </div>
  );
}
