import { useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import Spinner from '../../components/shared/Spinner';

/**
 * Passenger profile editor.
 *
 * @returns {JSX.Element}
 */
const Profile = () => {
  const { updateStoredUser } = useContext(AuthContext);
  const [form, setForm] = useState({ name: '', phone: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data } = await api.get('/passenger/profile');
        setForm({ name: data.user.name, phone: data.user.phone });
        updateStoredUser(data.user);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [updateStoredUser]);

  const initials = form.name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const saveProfile = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      const { data } = await api.put('/passenger/profile', form);
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

  return (
    <div className="min-h-screen bg-slate-50 p-4 lg:p-6">
      <form onSubmit={saveProfile} className="mx-auto max-w-xl rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-rydo-accent text-xl font-black text-white">{initials}</div>
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-rydo-accent">Passenger</p>
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
    </div>
  );
};

export default Profile;
