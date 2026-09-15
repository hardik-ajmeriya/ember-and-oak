import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Loader from './Loader.jsx';

export default function ProtectedRoute({ children }) {
  const { isAuthed, booting } = useAuth();
  const location = useLocation();

  if (booting) return <Loader label="Checking your session" className="min-h-screen" />;
  if (!isAuthed) return <Navigate to="/login" state={{ from: location.pathname }} replace />;

  return children;
}
