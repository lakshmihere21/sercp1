import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '', role: 'citizen' });
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) return toast.error('Passwords do not match');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      const data = await register({ name: form.name, email: form.email, phone: form.phone, password: form.password, role: form.role });
      toast.success(`Welcome to SERCP, ${data.user.name}!`);
      navigate(`/${data.user.role}`, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { value: 'citizen', label: 'Citizen', icon: '👤', desc: 'Get emergency help fast' },
    { value: 'volunteer', label: 'Volunteer', icon: '🤝', desc: 'Help others nearby' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg bg-white rounded-3xl shadow-xl border border-slate-100 p-8">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center text-white font-bold">S</div>
          <div>
            <p className="font-semibold text-slate-800">SERCP</p>
            <p className="text-xs text-slate-400">Emergency Response System</p>
          </div>
        </div>

        <h2 className="text-xl font-bold text-slate-900 mb-1">Create Account</h2>
        <p className="text-slate-500 text-sm mb-6">Join SERCP — free forever</p>

        {/* Role Selection */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {roles.map(r => (
            <button key={r.value} type="button" onClick={() => set('role', r.value)}
              className={`p-3 rounded-xl border-2 text-left transition-all ${form.role === r.value ? 'border-blue-600 bg-blue-50' : 'border-slate-200 hover:border-slate-300'}`}>
              <div className="text-xl mb-1">{r.icon}</div>
              <p className="font-semibold text-sm text-slate-800">{r.label}</p>
              <p className="text-xs text-slate-500">{r.desc}</p>
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name</label>
              <input type="text" required value={form.name} onChange={e => set('name', e.target.value)}
                className="input-field" placeholder="John Doe" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Phone Number</label>
              <input type="tel" required value={form.phone} onChange={e => set('phone', e.target.value)}
                className="input-field" placeholder="+91 98765 43210" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
            <input type="email" required value={form.email} onChange={e => set('email', e.target.value)}
              className="input-field" placeholder="you@example.com" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
              <input type="password" required value={form.password} onChange={e => set('password', e.target.value)}
                className="input-field" placeholder="••••••••" minLength={6} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Confirm Password</label>
              <input type="password" required value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)}
                className="input-field" placeholder="••••••••" />
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="w-full btn-primary py-3 text-base flex items-center justify-center gap-2 disabled:opacity-60">
            {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
            {loading ? 'Creating account...' : `🚀 Create ${form.role === 'citizen' ? 'Citizen' : 'Volunteer'} Account`}
          </button>
        </form>

        <p className="text-center mt-4 text-slate-600 text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 font-semibold hover:underline">Sign in</Link>
        </p>
        <p className="text-center mt-1">
          <Link to="/" className="text-slate-400 text-xs hover:text-slate-600">← Back to Home</Link>
        </p>
      </motion.div>
    </div>
  );
}
