import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import useAuth from '../hooks/useAuth';
import { validatePassword } from '../utils/sanitize';
import { changePassword } from '../api/auth.api';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, token, logout } = useAuth();
  const [loading, setLoading] = useState(false);

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
        throw new Error('All fields are required');
      }

      const passErr = validatePassword(passwordData.newPassword);
      if (passErr) {
        throw new Error(passErr);
      }

      if (passwordData.newPassword !== passwordData.confirmPassword) {
        throw new Error('New passwords do not match');
      }

      await changePassword(token, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      toast.success('Password updated successfully');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-12">
      {/* Navigation */}
      <nav className="border-b border-slate-900 bg-slate-900/40 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/dashboard"
              className="text-slate-400 hover:text-white transition flex items-center gap-1.5 text-sm font-medium"
            >
              ← Back to Projects
            </Link>
            <span className="text-slate-800">/</span>
            <span className="text-slate-300 text-sm font-semibold">User Profile</span>
          </div>
          <button
            onClick={logout}
            className="text-red-400 hover:text-red-300 text-sm font-medium transition"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Profile Header */}
      <header className="bg-slate-900/60 border-b border-slate-900 py-12">
        <div className="max-w-4xl mx-auto px-4 flex items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-3xl shadow-lg">
            👤
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              {user?.name || 'Account details'}
            </h1>
            <p className="text-slate-400 text-sm mt-1">{user?.email}</p>
          </div>
        </div>
      </header>

      {/* Main Form Fields */}
      <main className="max-w-4xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Settings Info Card */}
          <div className="md:col-span-1 space-y-4">
            <div className="bg-slate-900 border border-slate-900/80 rounded-2xl p-6 shadow-xl">
              <h2 className="text-base font-bold text-white mb-3">Profile Info</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Your email address and full name are linked to your identity. Roles inside individual projects are assigned by project managers or administrators.
              </p>
              <div className="mt-4 pt-4 border-t border-slate-800 space-y-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500">Member since</span>
                  <p className="text-xs text-slate-300">{user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Change Password Card */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-slate-900 border border-slate-900/80 rounded-2xl p-6 shadow-xl">
              <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                <span>🔒</span> Update Password
              </h2>

              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <label htmlFor="currentPassword" className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
                    Current Password
                  </label>
                  <input
                    id="currentPassword"
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    placeholder="••••••••"
                    className="w-full px-4 py-2 bg-slate-950 border border-slate-800 text-white rounded-xl focus:outline-none focus:border-cyan-500 transition"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="newPassword" className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
                    New Password
                  </label>
                  <input
                    id="newPassword"
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    placeholder="••••••••"
                    className="w-full px-4 py-2 bg-slate-950 border border-slate-800 text-white rounded-xl focus:outline-none focus:border-cyan-500 transition"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
                    Confirm New Password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    placeholder="••••••••"
                    className="w-full px-4 py-2 bg-slate-950 border border-slate-800 text-white rounded-xl focus:outline-none focus:border-cyan-500 transition"
                    required
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-cyan-600 to-teal-650 hover:from-cyan-500 hover:to-teal-555 text-white px-4 py-2.5 rounded-xl font-semibold transition disabled:opacity-50 shadow-lg shadow-cyan-950/20"
                  >
                    {loading ? 'Updating Password...' : 'Save New Password'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
