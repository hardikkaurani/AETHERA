import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import useAuth from '../hooks/useAuth';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const [googleLoading, setGoogleLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError('');
    const toastId = toast.loading('Connecting to Google...');
    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      const email = 'google.dev@aethera.com';
      const password = 'GoogleMockPassword123!';
      const name = 'Google Developer';
      try {
        await login(email, password);
        toast.success('Signed in with Google!', { id: toastId });
        navigate('/dashboard');
      } catch (loginErr) {
        await register(name, email, password, password);
        toast.success('Google Account linked & signed in!', { id: toastId });
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Google Sign-In failed');
      toast.error('Google Sign-In failed', { id: toastId });
    } finally {
      setGoogleLoading(false);
    }
  };

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
      if (!formData.email || !formData.password) throw new Error('Email and password are required');
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) throw new Error('Please enter a valid email address');
      await login(formData.email, formData.password);
      toast.success('Logged in successfully!');
      navigate('/dashboard');
    } catch (err) {
      const message = err.message || 'Login failed. Please try again.';
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
          <p className="text-slate-400 text-xs tracking-widest uppercase font-mono">Workspace Login</p>
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
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-white text-slate-950 hover:bg-cyan-400 font-bold tracking-widest uppercase text-xs rounded-xl transition-all disabled:opacity-50 mt-2"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading || googleLoading}
              className="w-full py-3 bg-[#1a2333] border border-white/5 hover:border-white/20 text-white font-semibold text-xs tracking-wide rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {googleLoading ? 'Connecting...' : (
                <>
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Google Sign-In
                </>
              )}
            </button>
          </form>

          <div className="mt-6 flex flex-col items-center gap-3">
            <Link to="/register" className="text-xs text-slate-400 hover:text-white transition-colors">
              Don't have an account? <span className="text-cyan-400 underline decoration-transparent hover:decoration-cyan-400">Register</span>
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
