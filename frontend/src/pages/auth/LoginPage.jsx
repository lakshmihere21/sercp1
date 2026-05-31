// ── LoginPage.jsx ─────────────────────────────────────────────────────────────
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login(form.email, form.password);
      toast.success(`Welcome back, ${data.user.name}!`);
      navigate(`/${data.user.role}`, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role) => {
    const demos = {
      citizen: { email: 'citizen@demo.com', password: 'Demo@123' },
      admin: { email: 'admin@demo.com', password: 'Admin@123' },
      responder: { email: 'responder@demo.com', password: 'Demo@123' },
    };
    setForm(demos[role]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-blue-700 to-blue-900 items-center justify-center p-12">
        <div className="max-w-sm text-white">
          <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center text-3xl font-black mb-8 shadow-xl">S</div>
          <h1 className="text-2xl font-bold mb-4">Back to the frontline.</h1>
          <p className="text-blue-200 text-lg mb-8">Log in to access real-time emergency management, live tracking, and dispatch tools.</p>
          <div className="space-y-3">
            {[['🚨', 'Real-time SOS alerts'], ['📍', 'Live GPS tracking'], ['🚑', 'Smart dispatch'], ['📊', 'Analytics dashboard']].map(([icon, text]) => (
              <div key={text} className="flex items-center gap-3 text-blue-100">
                <span>{icon}</span><span className="text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-9 h-9 bg-red-600 rounded-xl flex items-center justify-center text-white font-black">S</div>
            <span className="font-semibold text-slate-800 text-sm">SERCP</span>
          </div>

          <h2 className="text-3xl font-bold text-slate-900 mb-2">Sign In</h2>
          <p className="text-slate-500 mb-8">Enter your credentials to access SERCP</p>

          {/* Demo buttons */}
          <div className="flex gap-2 mb-6">
            {['citizen', 'responder', 'admin'].map(role => (
              <button key={role} onClick={() => fillDemo(role)}
                className="flex-1 text-xs py-2 px-3 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 font-medium transition-colors capitalize">
                {role === 'admin' ? '⚙️' : role === 'responder' ? '🛡️' : '👤'} {role}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
              <input type="email" required value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                className="input-field" placeholder="you@example.com" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
              <input type="password" required value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                className="input-field" placeholder="••••••••" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full btn-primary py-3 text-base flex items-center justify-center gap-2 disabled:opacity-60">
              {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : '→'}
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center mt-6 text-slate-600 text-sm">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-600 font-semibold hover:underline">Create one free</Link>
          </p>
          <p className="text-center mt-2">
            <Link to="/" className="text-slate-400 text-sm hover:text-slate-600">← Back to Home</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default LoginPage;
