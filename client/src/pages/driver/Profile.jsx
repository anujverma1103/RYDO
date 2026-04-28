import { useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FaStar } from 'react-icons/fa';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import Spinner from '../../components/shared/Spinner';

/**
 * Driver profile editor with read-only vehicle details.
 *
 * @returns {JSX.Element}
 */
const Profile = () => {
  const { updateStoredUser } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data } = await api.get('/driver/profile');
        setProfile(data.user);
        setForm({ name: data.user.name, phone: data.user.phone });
        updateStoredUser(data.user);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [updateStoredUser]);

  const saveProfile = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      const { data } = await api.put('/driver/profile', form);
      setProfile(data.user);
      updateStoredUser(data.user);
      toast.success('Profile updated');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Spinner fullscreen label="Loading profile" />;
  }

  const initials = form.name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-slate-50 p-4 lg:p-6">
      <div className="mx-auto grid max-w-5xl gap-5 lg:grid-cols-[1fr_360px]">
        <form onSubmit={saveProfile} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-rydo-accent text-xl font-black text-white">{initials}</div>
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-rydo-accent">Driver</p>
              <h1 className="text-2xl font-black text-slate-900">Profile</h1>
            </div>
          </div>

          <div className="mt-6 grid gap-4">
            <div>
              <label className="form-label">Name</label>
              <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} className="form-input" />
            </div>
            <div>
              <label className="form-label">Phone</label>
              <input value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} className="form-input" />
            </div>
          </div>

          <button type="submit" disabled={saving} className="primary-btn mt-6 w-full py-3">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>

        <aside className="grid gap-4">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-bold uppercase tracking-wide text-slate-500">Vehicle</p>
            <div className="mt-4 grid gap-3 text-sm font-semibold text-slate-700">
              <p className="flex justify-between gap-4"><span>Type</span><span className="font-black text-slate-900">{profile.vehicleType}</span></p>
              <p className="flex justify-between gap-4"><span>Number</span><span className="font-black text-slate-900">{profile.vehicleNumber}</span></p>
              <p className="flex justify-between gap-4"><span>License</span><span className="font-black text-slate-900">{profile.licenseNumber}</span></p>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-bold uppercase tracking-wide text-slate-500">Rating</p>
            <p className="mt-3 flex items-center gap-2 text-3xl font-black text-slate-900">
              <FaStar className="text-amber-400" />
              {profile.rating?.average || 0}
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-500">{profile.rating?.count || 0} total ratings</p>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Profile;
