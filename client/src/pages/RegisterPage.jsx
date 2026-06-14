import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import useAuth from '../hooks/useAuth';
import { validatePassword } from '../utils/sanitize';

/**
 * Register Page Component
 * Handles new user registration
 * Validates password match and email format
 * Shows loading state during submission
 * Displays error messages if registration fails
 */
export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  /**
   * Handle input changes
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate inputs
      if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
        throw new Error('All fields are required');
      }

      // Email regex validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        throw new Error('Please enter a valid email address');
      }

      const passwordError = validatePassword(formData.password);
      if (passwordError) {
        throw new Error(passwordError);
      }

      // Password match validation
      if (formData.password !== formData.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      // Call register from AuthContext
      await register(formData.name, formData.email, formData.password, formData.confirmPassword);

      // Success toast
      toast.success('Account created successfully! 🎉');

      // Redirect to dashboard
      navigate('/dashboard');
    } catch (err) {
      const message = err.message || 'Registration failed. Please try again.';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 relative overflow-hidden px-4 py-8">
      {/* Decorative Glow */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Card */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent mb-2">
              🚀 Aethera
            </h1>
            <p className="text-slate-400 text-sm">Create your account</p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-red-950/40 border border-red-900/50 rounded-xl">
              <p className="text-red-400 text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Input */}
            <div>
              <label htmlFor="name" className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 text-white rounded-xl focus:outline-none focus:border-indigo-500 transition placeholder:text-slate-600"
                disabled={loading}
              />
            </div>

            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 text-white rounded-xl focus:outline-none focus:border-indigo-500 transition placeholder:text-slate-600"
                disabled={loading}
              />
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 text-white rounded-xl focus:outline-none focus:border-indigo-500 transition placeholder:text-slate-600"
                disabled={loading}
              />
              <p className="text-[10px] text-slate-500 mt-1">Use 8+ chars, a number, and a special character</p>
            </div>

            {/* Confirm Password Input */}
            <div>
              <label htmlFor="confirmPassword" className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 text-white rounded-xl focus:outline-none focus:border-indigo-500 transition placeholder:text-slate-600"
                disabled={loading}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-indigo-950/50 mt-6"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-slate-900 text-slate-400">Already have an account?</span>
            </div>
          </div>

          {/* Login Link */}
          <Link
            to="/login"
            className="w-full py-2.5 px-4 border border-slate-800 hover:border-slate-700 hover:bg-slate-850/50 text-slate-300 font-semibold rounded-xl transition text-center block"
          >
            Sign In
          </Link>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-500 text-xs mt-6">
          Built by{' '}
          <a
            href="https://github.com/hardikkaurani"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-400 hover:text-indigo-300 transition underline decoration-indigo-500/30 hover:decoration-indigo-500/60"
          >
            HKaurani_01
          </a>
        </p>
      </div>
    </div>
  );
}
