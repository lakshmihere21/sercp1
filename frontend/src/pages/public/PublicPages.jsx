// ── AboutPage.jsx ─────────────────────────────────────────────────────────────
import { Link } from 'react-router-dom';

export function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 bg-red-600 rounded-xl flex items-center justify-center text-white font-bold">S</div>
          <span className="font-bold text-slate-800">SERCP</span>
        </Link>
        <div className="flex gap-4">
          <Link to="/login" className="text-slate-600 hover:text-blue-600 font-medium text-sm">Login</Link>
          <Link to="/register" className="btn-primary text-sm py-2 px-4">Get Started</Link>
        </div>
      </nav>
      <div className="max-w-4xl mx-auto px-6 py-20">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">About SERCP</h1>
        <p className="text-xl text-slate-600 leading-relaxed mb-8">
          The Smart Emergency Response Coordination Platform (SERCP) is a cutting-edge emergency management platform designed to save lives through real-time technology.
        </p>
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {[
            { icon: '🎯', title: 'Our Mission', desc: 'To bridge the gap between citizens and emergency responders using technology, reducing response times and saving lives.' },
            { icon: '👁️', title: 'Our Vision', desc: 'A world where no one has to wait too long for emergency help. Smart systems working in harmony with brave responders.' },
            { icon: '⚡', title: 'Why SERCP?', desc: 'Built for Indian emergency infrastructure with support for all national helplines, multilingual support, and offline capability.' },
            { icon: '🛡️', title: 'Our Values', desc: 'Speed, reliability, transparency, and compassion guide every decision we make in building this platform.' },
          ].map(item => (
            <div key={item.title} className="bg-slate-50 rounded-2xl p-6">
              <div className="text-2xl mb-3">{item.icon}</div>
              <h3 className="font-semibold text-slate-800 text-base mb-2">{item.title}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
        <div className="text-center">
          <Link to="/register" className="btn-emergency text-lg px-10 py-4">Join SERCP Today</Link>
        </div>
      </div>
    </div>
  );
}

// ── FeaturesPage.jsx ──────────────────────────────────────────────────────────
export function FeaturesPage() {
  const FEATURES = [
    { icon: '🚨', title: 'One-Tap SOS', desc: 'Instantly trigger emergency alerts with automatic GPS capture and responder notification.', tag: 'Core' },
    { icon: '📍', title: 'Live Tracking', desc: 'Real-time GPS tracking for citizens, responders, and vehicles during emergencies.', tag: 'Maps' },
    { icon: '⚡', title: 'Smart Dispatch', desc: 'Automatic matching of nearest available responders based on location and skills.', tag: 'AI' },
    { icon: '💬', title: 'Emergency Chat', desc: 'Secure real-time communication between all parties during an active emergency.', tag: 'Real-time' },
    { icon: '🚑', title: 'Fleet Tracking', desc: 'Monitor ambulances, police vehicles, and fire trucks in real time.', tag: 'Dispatch' },
    { icon: '📊', title: 'Analytics', desc: 'Comprehensive dashboards with trend analysis, heatmaps, and performance metrics.', tag: 'Admin' },
    { icon: '🔔', title: 'Notifications', desc: 'Multi-channel alerts via browser, email, and SMS for all critical events.', tag: 'Alerts' },
    { icon: '👥', title: 'Volunteer Network', desc: 'Coordinate nearby volunteers for faster first-response assistance.', tag: 'Community' },
    { icon: '🗺️', title: 'Incident Heatmap', desc: 'Visual analysis of emergency hotspots to improve resource placement.', tag: 'GIS' },
  ];

  return (
    <div className="min-h-screen bg-white">
      <nav className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 bg-red-600 rounded-xl flex items-center justify-center text-white font-bold">S</div>
          <span className="font-bold text-slate-800">SERCP</span>
        </Link>
        <div className="flex gap-4">
          <Link to="/login" className="text-slate-600 hover:text-blue-600 font-medium text-sm">Login</Link>
          <Link to="/register" className="btn-primary text-sm py-2 px-4">Get Started</Link>
        </div>
      </nav>
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Platform Features</h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">Everything you need for comprehensive emergency management</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map(f => (
            <div key={f.title} className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all">
              <div className="flex items-start justify-between mb-3">
                <span className="text-2xl">{f.icon}</span>
                <span className="text-xs bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full font-semibold">{f.tag}</span>
              </div>
              <h3 className="font-semibold text-slate-800 text-base mb-2">{f.title}</h3>
              <p className="text-slate-600 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
        <div className="text-center mt-16">
          <Link to="/register" className="btn-emergency text-lg px-10 py-4">Start for Free</Link>
        </div>
      </div>
    </div>
  );
}

// ── ContactPage.jsx ───────────────────────────────────────────────────────────
import { useState } from 'react';
import toast from 'react-hot-toast';

export function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    toast.success('Message sent! We will reply within 24 hours.');
  };

  return (
    <div className="min-h-screen bg-white">
      <nav className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 bg-red-600 rounded-xl flex items-center justify-center text-white font-bold">S</div>
          <span className="font-bold text-slate-800">SERCP</span>
        </Link>
        <Link to="/register" className="btn-primary text-sm py-2 px-4">Get Started</Link>
      </nav>
      <div className="max-w-4xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Contact Us</h1>
          <p className="text-slate-600 text-lg">Have questions? We're here to help 24/7.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-12">
          <div className="space-y-6">
            {[['📧', 'Email', 'support@sers.com'], ['📞', 'Support Line', '+91 1800-SERCP-24'], ['🏢', 'Office', 'Mumbai, Maharashtra'], ['⏰', 'Hours', '24/7 Emergency Support']].map(([icon, label, val]) => (
              <div key={label} className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-2xl">{icon}</div>
                <div>
                  <p className="font-semibold text-slate-700 text-sm">{label}</p>
                  <p className="text-slate-600">{val}</p>
                </div>
              </div>
            ))}
          </div>
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Name</label>
                  <input required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    className="input-field" placeholder="Your name" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email</label>
                  <input type="email" required value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                    className="input-field" placeholder="you@example.com" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Subject</label>
                <input value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
                  className="input-field" placeholder="How can we help?" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Message</label>
                <textarea required value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                  className="input-field resize-none h-32" placeholder="Your message..." />
              </div>
              <button type="submit" className="w-full btn-primary py-3">Send Message →</button>
            </form>
          ) : (
            <div className="text-center py-12">
              <p className="text-2xl mb-4">✅</p>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Message Sent!</h3>
              <p className="text-slate-600">We'll get back to you within 24 hours.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── HelplinePage.jsx ──────────────────────────────────────────────────────────
const HELPLINES = [
  { number: '112', name: 'National Emergency', icon: '🆘', desc: 'All emergencies in one number', category: 'general', color: 'bg-red-600' },
  { number: '100', name: 'Police', icon: '👮', desc: 'Crime, assault, theft', category: 'police', color: 'bg-blue-700' },
  { number: '108', name: 'Ambulance', icon: '🚑', desc: 'Medical emergency', category: 'medical', color: 'bg-green-600' },
  { number: '101', name: 'Fire Service', icon: '🚒', desc: 'Fire emergencies', category: 'fire', color: 'bg-orange-600' },
  { number: '1091', name: 'Women Helpline', icon: '👩', desc: 'Women safety & harassment', category: 'women', color: 'bg-pink-600' },
  { number: '1098', name: 'Child Helpline', icon: '👶', desc: 'Child abuse & protection', category: 'child', color: 'bg-purple-600' },
  { number: '1070', name: 'Disaster Helpline', icon: '🌪️', desc: 'Natural disasters', category: 'disaster', color: 'bg-yellow-600' },
  { number: '1073', name: 'Road Accident', icon: '🚗', desc: 'Road accident emergency', category: 'accident', color: 'bg-slate-600' },
  { number: '14567', name: 'Senior Citizen', icon: '👴', desc: 'Elderly assistance', category: 'senior', color: 'bg-teal-600' },
  { number: '1800-180-5522', name: 'Anti Poison', icon: '☠️', desc: 'Poison control center', category: 'medical', color: 'bg-green-700' },
];

export function HelplinePage() {
  const [search, setSearch] = useState('');
  const filtered = HELPLINES.filter(h =>
    !search || h.name.toLowerCase().includes(search.toLowerCase()) || h.number.includes(search)
  );

  return (
    <div className="min-h-screen bg-white">
      <nav className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 bg-red-600 rounded-xl flex items-center justify-center text-white font-bold">S</div>
          <span className="font-bold text-slate-800">SERCP</span>
        </Link>
        <Link to="/register" className="btn-primary text-sm py-2 px-4">Get Started</Link>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-2xl font-bold text-slate-900 mb-3">Emergency Helplines</h1>
          <p className="text-slate-600">All India emergency numbers — one tap to call</p>
        </div>

        <div className="max-w-md mx-auto mb-10">
          <input value={search} onChange={e => setSearch(e.target.value)}
            className="input-field" placeholder="🔍 Search helplines..." />
        </div>

        {/* Featured - 112 */}
        <a href="tel:112" className="block bg-red-600 text-white rounded-2xl p-6 text-center mb-8 hover:bg-red-700 transition-colors shadow-xl shadow-red-200">
          <p className="font-mono text-2xl font-bold mb-2">112</p>
          <p className="text-lg font-bold">National Emergency Number</p>
          <p className="text-red-100 mt-1">Police · Ambulance · Fire — All in One</p>
          <p className="text-red-200 text-sm mt-2">📞 TAP TO CALL · Available 24/7</p>
        </a>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.filter(h => h.number !== '112').map(h => (
            <a key={h.number} href={`tel:${h.number}`}
              className="bg-white border border-slate-100 rounded-2xl p-5 hover:shadow-lg transition-all group flex items-center gap-4 shadow-sm">
              <div className={`w-14 h-14 ${h.color} rounded-xl flex items-center justify-center text-2xl text-white shrink-0`}>
                {h.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-800">{h.name}</p>
                <p className="font-mono text-lg font-bold text-red-600">{h.number}</p>
                <p className="text-slate-500 text-xs truncate">{h.desc}</p>
              </div>
              <span className="text-slate-400 group-hover:text-red-600 transition-colors text-lg">📞</span>
            </a>
          ))}
        </div>

        <div className="mt-10 bg-blue-50 rounded-2xl p-6 text-center">
          <p className="font-semibold text-blue-800 mb-2">💡 Using SERCP for faster help?</p>
          <p className="text-blue-700 text-sm mb-4">SERCP automatically notifies the right emergency services with your GPS location.</p>
          <Link to="/register" className="btn-primary text-sm">Register Free →</Link>
        </div>
      </div>
    </div>
  );
}

export default HelplinePage;
