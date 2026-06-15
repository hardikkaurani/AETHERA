import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import useAuth from '../hooks/useAuth';
import { validatePassword } from '../utils/sanitize';
import ThreeCanvasBg from '../components/layout/ThreeCanvasBg';


// JSDoc: RegisterPage manages user registration flow and sanitizes password inputs
export default function RegisterPage() {
  const navigate = useNavigate();
  
// Destructures register handler from authentication context
const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) {
      setError('');
    }
  };

  
// Dispatches registration API calls and verifies password strength
const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
        throw new Error('All fields are required');
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        throw new Error('Please enter a valid email address');
      }

      if (formData.password !== formData.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      const passwordError = validatePassword(formData.password);
      if (passwordError) {
        throw new Error(passwordError);
      }

      await register(formData.name, formData.email, formData.password);
      toast.success('Registration successful! Please sign in. ÃƒÂ°Ã…Â¸Ã…Â½Ã¢â‚¬Â°');
      navigate('/login');
    } catch (err) {
      const message = err.message || 'Registration failed. Please try again.';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4 py-8">
      {/* ThreeJS Interactive Wave */}
      <ThreeCanvasBg />

      {/* Decorative Cyan/Emerald Ambient Glow */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-emerald-500/5 rounded-full blur-[140px] pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Glassmorphism Card */}
        <div className="bg-slate-950/45 backdrop-blur-2xl border border-slate-800/60 rounded-3xl shadow-2xl p-8 hover:border-cyan-500/35 transition-all duration-500">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent mb-2">
              Aethera
            </h1>
            <p className="text-slate-400 text-sm font-medium">Create your developer workspace</p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-red-950/20 border border-red-900/30 rounded-2xl">
              <p className="text-red-400 text-sm font-semibold">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Input */}
            <div>
              <label htmlFor="name" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-800 text-white rounded-2xl focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 transition-all placeholder:text-slate-600 font-medium text-sm"
                disabled={loading}
              />
            </div>

            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-800 text-white rounded-2xl focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 transition-all placeholder:text-slate-600 font-medium text-sm"
                disabled={loading}
              />
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="********"
                className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-800 text-white rounded-2xl focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 transition-all placeholder:text-slate-600 font-medium text-sm"
                disabled={loading}
              />
            </div>

            {/* Confirm Password Input */}
            <div>
              <label htmlFor="confirmPassword" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="********"
                className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-800 text-white rounded-2xl focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 transition-all placeholder:text-slate-600 font-medium text-sm"
                disabled={loading}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-cyan-600 to-teal-650 hover:from-cyan-500 hover:to-teal-550 text-white font-bold rounded-2xl transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-cyan-950/30 text-sm tracking-wide mt-4"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Registering...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-5 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800/70"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-slate-950 text-slate-400">Already have an account?</span>
            </div>
          </div>

          {/* Login Link */}
          <Link
            to="/login"
            className="w-full py-3 px-4 border border-slate-800 hover:border-cyan-500/30 hover:bg-slate-900/20 text-slate-300 hover:text-white font-semibold rounded-2xl transition duration-300 text-center block text-sm"
          >
            Sign In
          </Link>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-500 text-xs mt-6 font-medium">
          Built by{' '}
          <a
            href="https://github.com/hardikkaurani"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400 hover:text-cyan-300 transition underline decoration-cyan-500/30 hover:decoration-cyan-500/60"
          >
            HKaurani_01
          </a>
        </p>
      </div>
    </div>
  );
}
