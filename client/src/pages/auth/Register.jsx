import { useContext, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FaEye, FaEyeSlash, FaUserPlus } from 'react-icons/fa6';
import { AuthContext } from '../../context/AuthContext';

const initialForm = {
  name: '',
  email: '',
  password: '',
  phone: '',
  vehicleType: 'Auto',
  vehicleNumber: '',
  licenseNumber: ''
};

/**
 * Registration page with passenger and driver role tabs.
 *
 * @returns {JSX.Element}
 */
const Register = () => {
  const { register } = useContext(AuthContext);
  const [role, setRole] = useState('passenger');
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const requiredFields = useMemo(
    () => (role === 'driver' ? ['name', 'email', 'password', 'phone', 'vehicleNumber', 'licenseNumber'] : ['name', 'email', 'password', 'phone']),
    [role]
  );

  const update = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value
    }));
  };

  const validate = () => {
    const nextErrors = {};

    requiredFields.forEach((field) => {
      if (!form[field].trim()) {
        nextErrors[field] = 'This field is required';
      }
    });

    if (form.name && form.name.trim().length < 2) {
      nextErrors.name = 'Name must be at least 2 characters';
    }

    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      nextErrors.email = 'Enter a valid email';
    }

    if (form.password.length < 6) {
      nextErrors.password = 'Password must be at least 6 characters';
    }

    if (!/^[0-9+\-\s]{10,15}$/.test(form.phone)) {
      nextErrors.phone = 'Enter a valid phone number';
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
      await register({
        ...form,
        role
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto w-full max-w-2xl">
        <Link to="/" className="mb-6 block text-center text-2xl font-black tracking-[0.22em] text-rydo-navy">
          RYDO
        </Link>
        <form onSubmit={handleSubmit} className="rounded-lg border border-slate-200 bg-white p-6 shadow-soft">
          <h1 className="text-2xl font-black text-slate-900">Create your account</h1>
          <p className="mt-2 text-sm font-medium text-slate-500">Choose your role and fill in the details.</p>

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

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="form-label">Name</label>
              <input value={form.name} onChange={(event) => update('name', event.target.value)} className="form-input" placeholder="Full name" />
              {errors.name ? <p className="form-error">{errors.name}</p> : null}
            </div>
            <div>
              <label className="form-label">Phone</label>
              <input value={form.phone} onChange={(event) => update('phone', event.target.value)} className="form-input" placeholder="9876543210" />
              {errors.phone ? <p className="form-error">{errors.phone}</p> : null}
            </div>
            <div>
              <label className="form-label">Email</label>
              <input type="email" value={form.email} onChange={(event) => update('email', event.target.value)} className="form-input" placeholder="you@example.com" />
              {errors.email ? <p className="form-error">{errors.email}</p> : null}
            </div>
            <div>
              <label className="form-label">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(event) => update('password', event.target.value)}
                  className="form-input pr-10"
                  placeholder="Min 6 characters"
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
          </div>

          {role === 'driver' ? (
            <div className="mt-6 grid gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4 sm:grid-cols-3">
              <div>
                <label className="form-label">Vehicle Type</label>
                <select value={form.vehicleType} onChange={(event) => update('vehicleType', event.target.value)} className="form-input">
                  <option>Auto</option>
                  <option>Sedan</option>
                  <option>SUV</option>
                </select>
              </div>
              <div>
                <label className="form-label">Vehicle Number</label>
                <input value={form.vehicleNumber} onChange={(event) => update('vehicleNumber', event.target.value)} className="form-input" placeholder="DL 01 AB 1234" />
                {errors.vehicleNumber ? <p className="form-error">{errors.vehicleNumber}</p> : null}
              </div>
              <div>
                <label className="form-label">License Number</label>
                <input value={form.licenseNumber} onChange={(event) => update('licenseNumber', event.target.value)} className="form-input" placeholder="DL-1001" />
                {errors.licenseNumber ? <p className="form-error">{errors.licenseNumber}</p> : null}
              </div>
            </div>
          ) : null}

          <button type="submit" disabled={loading} className="primary-btn mt-6 w-full py-3">
            <FaUserPlus />
            {loading ? 'Creating account...' : 'Register'}
          </button>

          <p className="mt-5 text-center text-sm font-medium text-slate-500">
            Already registered?{' '}
            <Link to="/login" className="font-bold text-rydo-accent">
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;
