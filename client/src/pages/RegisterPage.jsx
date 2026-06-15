import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import useAuth from '../hooks/useAuth';
import { validatePassword } from '../utils/sanitize';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
        throw new Error('All fields are required');
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) throw new Error('Please enter a valid email address');
      if (formData.password !== formData.confirmPassword) throw new Error('Passwords do not match');
      
      const passwordError = validatePassword(formData.password);
      if (passwordError) throw new Error(passwordError);

      await register(formData.name, formData.email, formData.password);
      toast.success('Registration successful! Please sign in.');
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
    <div className="min-h-screen flex items-center justify-center bg-[#030712] relative overflow-hidden px-4 font-sans text-slate-100">
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-900/10 rounded-full blur-[120px] pointer-events-none"></div>
      
      <div className="w-full max-w-[360px] relative z-10">
        <div className="flex flex-col items-center mb-8">
          <Link to="/" className="flex items-center gap-2 group mb-4">
            <img src="/aethera-logo.svg" alt="Aethera Logo" className="w-10 h-10 group-hover:drop-shadow-[0_0_8px_rgba(6,182,212,0.8)] transition-all" />
            <span className="text-white text-xl font-bold tracking-[0.25em] uppercase font-mono mt-1">Aethera</span>
          </Link>
          <p className="text-slate-400 text-xs tracking-widest uppercase font-mono">Create Workspace</p>
        </div>

        <div className="bg-[#0b101e]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
          {error && (
            <div className="mb-5 p-3 bg-red-950/30 border border-red-900/50 rounded-xl">
              <p className="text-red-400 text-xs font-semibold text-center">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Full Name"
                className="w-full px-4 py-3 bg-[#111827]/50 border border-white/5 text-sm text-white rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-all placeholder:text-slate-500"
                disabled={loading}
              />
            </div>
            <div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email Address"
                className="w-full px-4 py-3 bg-[#111827]/50 border border-white/5 text-sm text-white rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-all placeholder:text-slate-500"
                disabled={loading}
              />
            </div>
            <div>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                className="w-full px-4 py-3 bg-[#111827]/50 border border-white/5 text-sm text-white rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-all placeholder:text-slate-500"
                disabled={loading}
              />
            </div>
            <div>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm Password"
                className="w-full px-4 py-3 bg-[#111827]/50 border border-white/5 text-sm text-white rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-all placeholder:text-slate-500"
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-white text-slate-950 hover:bg-cyan-400 font-bold tracking-widest uppercase text-xs rounded-xl transition-all disabled:opacity-50 mt-2"
            >
              {loading ? 'Creating...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 flex flex-col items-center gap-3">
            <Link to="/login" className="text-xs text-slate-400 hover:text-white transition-colors">
              Already have an account? <span className="text-cyan-400 underline decoration-transparent hover:decoration-cyan-400">Sign In</span>
            </Link>
          </div>
        </div>

        <p className="text-center text-slate-600 text-[10px] uppercase tracking-widest mt-8 font-mono">
          &copy; 2026 Aethera Proprietary
        </p>
      </div>
    </div>
  );
}
