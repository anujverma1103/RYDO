import { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import Spinner from './Spinner';

/**
 * Protects routes by authentication and optional account role.
 *
 * @param {{children: import('react').ReactNode, role?: 'passenger'|'driver'}} props - Route props.
 * @returns {JSX.Element}
 */
const ProtectedRoute = ({ children, role }) => {
  const { loading, user } = useContext(AuthContext);
  const location = useLocation();

  if (loading) {
    return <Spinner fullscreen label="Checking session" />;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (role && user.role !== role) {
    return <Navigate to={user.role === 'driver' ? '/driver' : '/passenger'} replace />;
  }

  return children;
};

export default ProtectedRoute;
