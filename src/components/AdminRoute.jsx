import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ADMIN_EMAIL } from '../firebase';

export default function AdminRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 36, height: 36, border: '3px solid var(--c-border)', borderTop: '3px solid var(--c-purple)', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (user.email?.toLowerCase() !== ADMIN_EMAIL) return <Navigate to="/" replace />;

  return children;
}
