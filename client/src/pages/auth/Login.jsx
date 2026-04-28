import { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FaEye, FaEyeSlash, FaRightToBracket } from 'react-icons/fa6';
import { AuthContext } from '../../context/AuthContext';

/**
 * Login page for passengers and drivers.
 *
 * @returns {JSX.Element}
 */
const Login = () => {
  const { login } = useContext(AuthContext);
  const [role, setRole] = useState('passenger');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const nextErrors = {};

    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      nextErrors.email = 'Enter a valid email';
    }

    if (!form.password) {
      nextErrors.password = 'Password is required';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      setLoading(true);
      await login(form.email, form.password, role);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen bg-slate-50 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="hidden bg-rydo-navy p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <Link to="/" className="text-2xl font-black tracking-[0.22em]">
          RYDO
        </Link>
        <div>
          <h1 className="max-w-lg text-5xl font-black leading-tight">Ride booking that stays simple.</h1>
          <p className="mt-5 max-w-md text-lg leading-8 text-slate-300">Use demo accounts from the seed file or create a fresh passenger or driver profile.</p>
        </div>
        <p className="text-sm text-slate-400">OpenStreetMap, Socket.io, Razorpay Test Mode</p>
      </div>

      <div className="flex items-center justify-center px-4 py-10">
        <form onSubmit={handleSubmit} className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-soft">
          <Link to="/" className="mb-8 block text-center text-2xl font-black tracking-[0.22em] text-rydo-navy lg:hidden">
            RYDO
          </Link>
          <h2 className="text-2xl font-black text-slate-900">Welcome back</h2>
          <p className="mt-2 text-sm font-medium text-slate-500">Login as passenger or driver.</p>

          <div className="mt-6 grid grid-cols-2 rounded-lg bg-slate-100 p-1">
            {['passenger', 'driver'].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setRole(item)}
                className={`rounded-md px-3 py-2 text-sm font-bold capitalize transition ${role === item ? 'bg-white text-rydo-accent shadow-sm' : 'text-slate-500'}`}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="mt-6">
            <label className="form-label">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              className="form-input"
              placeholder="you@example.com"
            />
            {errors.email ? <p className="form-error">{errors.email}</p> : null}
          </div>

          <div className="mt-4">
            <label className="form-label">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                className="form-input pr-10"
                placeholder="Enter password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.password ? <p className="form-error">{errors.password}</p> : null}
          </div>

          <button type="submit" disabled={loading} className="primary-btn mt-6 w-full py-3">
            <FaRightToBracket />
            {loading ? 'Logging in...' : 'Login'}
          </button>

          <p className="mt-5 text-center text-sm font-medium text-slate-500">
            New to RYDO?{' '}
            <Link to="/register" className="font-bold text-rydo-accent">
              Create account
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
