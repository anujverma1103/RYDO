import { useContext } from 'react';
import { Link, Navigate, Route, Routes } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa6';
import ProtectedRoute from './components/shared/ProtectedRoute';
import Sidebar from './components/shared/Sidebar';
import { AuthContext } from './context/AuthContext';
import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import DriverActiveRide from './pages/driver/ActiveRide';
import DriverDashboard from './pages/driver/Dashboard';
import DriverEarnings from './pages/driver/Earnings';
import DriverProfile from './pages/driver/Profile';
import PassengerBookRide from './pages/passenger/BookRide';
import PassengerDashboard from './pages/passenger/Dashboard';
import PassengerHistory from './pages/passenger/History';
import PassengerProfile from './pages/passenger/Profile';
import PassengerRideTracking from './pages/passenger/RideTracking';
import Spinner from './components/shared/Spinner';

/**
 * Redirects logged-in users away from auth pages.
 *
 * @param {{children: import('react').ReactNode}} props - Route props.
 * @returns {JSX.Element}
 */
const PublicAuthRoute = ({ children }) => {
  const { loading, user } = useContext(AuthContext);

  if (loading) {
    return <Spinner fullscreen label="Checking session" />;
  }

  if (user) {
    return <Navigate to={user.role === 'driver' ? '/driver' : '/passenger'} replace />;
  }

  return children;
};

/**
 * Application 404 page.
 *
 * @returns {JSX.Element}
 */
const NotFound = () => (
  <div className="grid min-h-screen place-items-center bg-slate-50 px-4 text-center">
    <div>
      <p className="text-sm font-black uppercase tracking-[0.3em] text-rydo-accent">404</p>
      <h1 className="mt-3 text-4xl font-black text-slate-900">Page not found</h1>
      <p className="mt-3 text-sm font-semibold text-slate-500">The route you opened does not exist in RYDO.</p>
      <Link to="/" className="primary-btn mt-6">
        <FaArrowLeft />
        Back Home
      </Link>
    </div>
  </div>
);

/**
 * Root React Router configuration for public, auth, passenger, and driver pages.
 *
 * @returns {JSX.Element}
 */
const App = () => (
  <Routes>
    <Route path="/" element={<Landing />} />
    <Route
      path="/login"
      element={
        <PublicAuthRoute>
          <Login />
        </PublicAuthRoute>
      }
    />
    <Route
      path="/register"
      element={
        <PublicAuthRoute>
          <Register />
        </PublicAuthRoute>
      }
    />

    <Route
      path="/passenger"
      element={
        <ProtectedRoute role="passenger">
          <Sidebar role="passenger" />
        </ProtectedRoute>
      }
    >
      <Route index element={<PassengerDashboard />} />
      <Route path="book" element={<PassengerBookRide />} />
      <Route path="ride/:id" element={<PassengerRideTracking />} />
      <Route path="history" element={<PassengerHistory />} />
      <Route path="profile" element={<PassengerProfile />} />
    </Route>

    <Route
      path="/driver"
      element={
        <ProtectedRoute role="driver">
          <Sidebar role="driver" />
        </ProtectedRoute>
      }
    >
      <Route index element={<DriverDashboard />} />
      <Route path="ride/:id" element={<DriverActiveRide />} />
      <Route path="earnings" element={<DriverEarnings />} />
      <Route path="profile" element={<DriverProfile />} />
    </Route>

    <Route path="*" element={<NotFound />} />
  </Routes>
);

export default App;
