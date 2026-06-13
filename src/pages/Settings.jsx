import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { updateProfile, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { FiUser, FiLock, FiCheck, FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { auth } from '../firebase';

export default function Settings() {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [name,        setName]        = useState(user?.displayName || '');
  const [nameLoading, setNameLoading] = useState(false);

  const [curPass,     setCurPass]     = useState('');
  const [newPass,     setNewPass]     = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passLoading, setPassLoading] = useState(false);
  const [showCur,     setShowCur]     = useState(false);
  const [showNew,     setShowNew]     = useState(false);

  const isGoogle = user?.providerData?.[0]?.providerId === 'google.com';

  const handleNameSave = async e => {
    e.preventDefault();
    if (!name.trim()) return addToast('Name cannot be empty', 'error');
    setNameLoading(true);
    try {
      await updateProfile(auth.currentUser, { displayName: name.trim() });
      addToast('Name updated successfully!', 'success');
    } catch {
      addToast('Failed to update name', 'error');
    } finally {
      setNameLoading(false);
    }
  };

  const handlePasswordChange = async e => {
    e.preventDefault();
    if (newPass.length < 6) return addToast('Password must be at least 6 characters', 'error');
    if (newPass !== confirmPass) return addToast('Passwords do not match', 'error');
    setPassLoading(true);
    try {
      const credential = EmailAuthProvider.credential(user.email, curPass);
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, newPass);
      addToast('Password changed successfully!', 'success');
      setCurPass(''); setNewPass(''); setConfirmPass('');
    } catch (err) {
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        addToast('Current password is incorrect', 'error');
      } else {
        addToast('Failed to change password', 'error');
      }
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <>
      <div className="page-hero">
        <div className="breadcrumb">
          <Link to="/">Home</Link><span className="sep">›</span>
          <span>Settings</span>
        </div>
        <h1>Account Settings</h1>
        <p>Manage your profile and security</p>
      </div>

      <div className="section" style={{ background: 'var(--c-bg2)', paddingTop: 40 }}>
        <div className="container" style={{ maxWidth: 600 }}>

          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--c-border)', padding: '28px 28px', marginBottom: 20 }}
          >
            {/* Avatar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28, paddingBottom: 24, borderBottom: '1px solid var(--c-border)' }}>
              <div style={{ position: 'relative' }}>
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="" referrerPolicy="no-referrer"
                    style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--c-gold)' }} />
                ) : (
                  <div style={{
                    width: 64, height: 64, borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--c-purple), var(--c-purple2))',
                    color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.4rem', fontWeight: 700,
                  }}>
                    {(user?.displayName?.[0] || user?.email?.[0] || 'U').toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <p style={{ fontWeight: 700, fontSize: '1rem' }}>{user?.displayName || 'My Account'}</p>
                <p style={{ fontSize: '.82rem', color: 'var(--c-gray)', marginTop: 2 }}>{user?.email}</p>
                {isGoogle && (
                  <span style={{ fontSize: '.7rem', background: 'var(--c-purple-lt)', color: 'var(--c-purple)', fontWeight: 600, padding: '2px 8px', borderRadius: 50, marginTop: 4, display: 'inline-block' }}>
                    Google Account
                  </span>
                )}
              </div>
            </div>

            {/* Update Name */}
            <form onSubmit={handleNameSave}>
              <p style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--c-gray)', marginBottom: 16 }}>
                <FiUser size={13} /> Display Name
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Your full name"
                  className="form-input"
                  style={{ flex: 1 }}
                />
                <button
                  type="submit"
                  className="btn btn-dark"
                  disabled={nameLoading || name.trim() === user?.displayName}
                  style={{ opacity: nameLoading || name.trim() === user?.displayName ? .6 : 1, flexShrink: 0 }}
                >
                  {nameLoading ? '…' : <><FiCheck size={14} /> Save</>}
                </button>
              </div>
            </form>
          </motion.div>

          {/* Password Card */}
          {!isGoogle ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: .1 }}
              style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--c-border)', padding: '28px 28px' }}
            >
              <p style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--c-gray)', marginBottom: 20 }}>
                <FiLock size={13} /> Change Password
              </p>

              <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="form-group">
                  <label className="form-label">Current Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showCur ? 'text' : 'password'}
                      value={curPass}
                      onChange={e => setCurPass(e.target.value)}
                      placeholder="Enter current password"
                      className="form-input"
                      style={{ paddingRight: 44 }}
                    />
                    <button type="button" onClick={() => setShowCur(o => !o)}
                      style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--c-gray)' }}>
                      {showCur ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showNew ? 'text' : 'password'}
                      value={newPass}
                      onChange={e => setNewPass(e.target.value)}
                      placeholder="Min. 6 characters"
                      className="form-input"
                      style={{ paddingRight: 44 }}
                    />
                    <button type="button" onClick={() => setShowNew(o => !o)}
                      style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--c-gray)' }}>
                      {showNew ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPass}
                    onChange={e => setConfirmPass(e.target.value)}
                    placeholder="Repeat new password"
                    className="form-input"
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-dark btn-full"
                  disabled={passLoading || !curPass || !newPass || !confirmPass}
                  style={{ opacity: passLoading || !curPass || !newPass || !confirmPass ? .6 : 1, marginTop: 4 }}
                >
                  {passLoading ? 'Updating…' : 'Change Password'}
                </button>
              </form>
            </motion.div>
          ) : (
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--c-border)', padding: '24px 28px', textAlign: 'center', color: 'var(--c-gray)', fontSize: '.88rem' }}>
              <FiLock size={24} style={{ opacity: .3, marginBottom: 10 }} />
              <p>Password is managed by Google. To change it, visit your Google account settings.</p>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
