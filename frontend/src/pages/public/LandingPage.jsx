import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const STATS = [
  { label: 'Response Time', value: '< 5 min', icon: '⚡', color: 'text-blue-600' },
  { label: 'Cities Covered', value: '50+', icon: '🏙️', color: 'text-green-600' },
  { label: 'Lives Saved', value: '10,000+', icon: '❤️', color: 'text-red-600' },
  { label: 'Active Responders', value: '2,500+', icon: '🛡️', color: 'text-purple-600' },
];

const FEATURES = [
  { icon: '🚨', title: 'One-Tap SOS', desc: 'Trigger emergency alerts instantly with GPS location sharing and real-time responder notification.', color: 'bg-red-50 text-red-600' },
  { icon: '📍', title: 'Live Tracking', desc: 'Real-time location tracking for citizens, responders, and vehicles on an interactive map.', color: 'bg-blue-50 text-blue-600' },
  { icon: '⚡', title: 'Smart Dispatch', desc: 'AI-powered responder matching based on proximity, availability, and skill set.', color: 'bg-yellow-50 text-yellow-600' },
  { icon: '💬', title: 'Emergency Chat', desc: 'Secure real-time communication between citizen, responder, and command center.', color: 'bg-green-50 text-green-600' },
  { icon: '🚑', title: 'Vehicle Management', desc: 'Track ambulances, police, and fire trucks in real time with ETA calculation.', color: 'bg-purple-50 text-purple-600' },
  { icon: '📊', title: 'Command Analytics', desc: 'Full analytics dashboard with heatmaps, incident trends, and response performance.', color: 'bg-orange-50 text-orange-600' },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'Citizen Triggers SOS', desc: 'Press the SOS button. GPS location is captured and alert created instantly.' },
  { step: '02', title: 'System Notifies Responders', desc: 'Nearby responders, volunteers, and admin are notified in real time via Socket.io.' },
  { step: '03', title: 'Responder Accepts & Navigates', desc: 'Nearest available responder accepts and navigates to the location with live tracking.' },
  { step: '04', title: 'Emergency Resolved', desc: 'Status updates tracked on timeline. Citizen and admin notified of resolution.' },
];

const TESTIMONIALS = [
  { name: 'Priya Sharma', role: 'Citizen, Mumbai', text: 'SERCP saved my life during a road accident. Responders arrived in under 4 minutes!', avatar: 'P' },
  { name: 'Rahul Verma', role: 'Paramedic', text: 'The smart dispatch system helps me reach emergencies faster. The live map is incredibly accurate.', avatar: 'R' },
  { name: 'Anita Patel', role: 'Admin, Delhi', text: 'Managing 50+ emergencies simultaneously is now possible with the command center dashboard.', avatar: 'A' },
];

const FAQs = [
  { q: 'How quickly do responders arrive?', a: 'Our average response time is under 5 minutes in covered cities, depending on traffic and responder availability.' },
  { q: 'Is my location data secure?', a: 'Yes. All location data is encrypted, only shared with assigned responders during active emergencies, and deleted after resolution.' },
  { q: 'What emergency types are supported?', a: 'Medical, accident, fire, crime, women safety, natural disaster, and more with dedicated responder routing.' },
  { q: 'Can I add emergency contacts?', a: 'Yes! Add up to 5 emergency contacts who are automatically notified with a live tracking link when you trigger SOS.' },
  { q: 'Is the service available 24/7?', a: 'Yes. The platform operates round the clock with a dedicated command center monitoring all incidents.' },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">S</div>
          <span className="font-semibold text-slate-800 text-base">SERCP</span>
        </div>
        <div className="hidden md:flex items-center gap-6">
          {[['/', 'Home'], ['/about', 'About'], ['/features', 'Features'], ['/helplines', 'Helplines'], ['/contact', 'Contact']].map(([to, label]) => (
            <Link key={to} to={to} className="text-slate-600 hover:text-blue-600 font-medium text-sm transition-colors">{label}</Link>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-slate-600 hover:text-blue-600 font-medium text-sm transition-colors hidden sm:block">Login</Link>
          <Link to="/register" className="bg-blue-600 text-white text-sm py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors">Get Started</Link>
        </div>
      </div>
    </nav>
  );
};

export default function LandingPage() {
  const [faqOpen, setFaqOpen] = useState(null);

  return (
    <div className="bg-white min-h-screen" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative pt-20 pb-16 lg:pt-28 lg:pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-red-50" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
              <div className="inline-flex items-center gap-2 bg-red-50 text-red-700 px-3 py-1.5 rounded-full text-xs font-semibold mb-5 border border-red-100">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                SERCP — Live Emergency Response Platform
              </div>
              <h1 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '2.5rem', fontWeight: 700, lineHeight: 1.2, color: '#0f172a', marginBottom: '1rem' }}>
                Emergency Help,<br />
                <span style={{ color: '#dc2626' }}>One Tap</span> Away
              </h1>
              <p style={{ fontSize: '1rem', color: '#475569', lineHeight: 1.7, marginBottom: '1.5rem', maxWidth: '480px' }}>
                SERCP connects citizens with emergency responders in real time. Instant SOS alerts, live tracking, and smart dispatch — making every second count.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link to="/register" className="bg-red-600 text-white text-sm px-6 py-2.5 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center gap-2">
                  🚨 Get Emergency Access
                </Link>
                <Link to="/features" className="border border-blue-600 text-blue-600 text-sm px-6 py-2.5 rounded-lg font-medium hover:bg-blue-50 transition-colors">
                  Learn More →
                </Link>
              </div>
              <div className="flex items-center gap-6 mt-6 pt-6 border-t border-slate-100">
                {STATS.slice(0, 2).map(s => (
                  <div key={s.label}>
                    <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.15 }}
              className="relative hidden lg:block">
              <div className="bg-slate-900 rounded-2xl p-5 shadow-xl">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-white font-semibold text-sm">Command Center</span>
                  <div className="flex gap-1.5">
                    {['bg-red-400', 'bg-yellow-400', 'bg-green-400'].map(c => <div key={c} className={`w-2.5 h-2.5 rounded-full ${c}`} />)}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {[['🚨', '12', 'Active', 'bg-red-900/50 text-red-300'], ['✅', '47', 'Resolved', 'bg-green-900/50 text-green-300'], ['🚑', '8', 'Vehicles', 'bg-blue-900/50 text-blue-300']].map(([icon, val, label, cls]) => (
                    <div key={label} className={`${cls} rounded-xl p-3 text-center`}>
                      <div className="text-lg mb-1">{icon}</div>
                      <div className="text-base font-bold">{val}</div>
                      <div className="text-xs opacity-80">{label}</div>
                    </div>
                  ))}
                </div>
                <div className="bg-slate-800 rounded-xl p-3 mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white text-xs font-medium">Live Emergencies</span>
                    <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse" />
                  </div>
                  {[['Medical', 'Andheri', 'HIGH', 'bg-orange-500'], ['Fire', 'Bandra', 'CRITICAL', 'bg-red-500'], ['Accident', 'Kurla', 'MEDIUM', 'bg-yellow-500']].map(([type, loc, sev, dot]) => (
                    <div key={type} className="flex items-center gap-2 py-1.5 border-b border-slate-700 last:border-0">
                      <div className={`w-2 h-2 rounded-full ${dot}`} />
                      <span className="text-slate-300 text-xs flex-1">{type} - {loc}</span>
                      <span className="text-xs text-slate-400">{sev}</span>
                    </div>
                  ))}
                </div>
                <div className="bg-red-900/30 border border-red-700/40 rounded-xl p-3 flex items-center gap-3">
                  <span className="text-xl animate-pulse">🚨</span>
                  <div>
                    <p className="text-red-300 text-xs font-semibold">NEW SOS ALERT</p>
                    <p className="text-slate-400 text-xs">Medical · Powai · 2s ago</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="py-12 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {STATS.map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} viewport={{ once: true }} className="text-center">
                <div className="text-2xl mb-2">{s.icon}</div>
                <div className={`text-2xl font-bold ${s.color} mb-1`}>{s.value}</div>
                <div className="text-slate-400 text-xs">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>Everything You Need in a Crisis</h2>
            <p className="text-slate-500 max-w-xl mx-auto text-sm">Built for speed, reliability, and scale — SERCP handles the most critical moments.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} viewport={{ once: true }}
                className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-all duration-300 group">
                <div className={`w-10 h-10 rounded-xl ${f.color.split(' ')[0]} flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition-transform`}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#1e293b', marginBottom: '0.4rem' }}>{f.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-16 bg-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>How SERCP Works</h2>
            <p className="text-slate-500 text-sm">Four simple steps from emergency to resolution.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {HOW_IT_WORKS.map((h, i) => (
              <motion.div key={h.step} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }}>
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-blue-100">
                  <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm mb-3">{h.step}</div>
                  <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1e293b', marginBottom: '0.4rem' }}>{h.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{h.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a' }}>Trusted by Thousands</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t, i) => (
              <motion.div key={t.name} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} viewport={{ once: true }}
                className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">{t.avatar}</div>
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">{t.name}</p>
                    <p className="text-xs text-slate-500">{t.role}</p>
                  </div>
                </div>
                <div className="text-yellow-400 text-xs mb-2">★★★★★</div>
                <p className="text-slate-600 text-sm leading-relaxed">&ldquo;{t.text}&rdquo;</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a' }}>Frequently Asked Questions</h2>
          </div>
          <div className="space-y-2">
            {FAQs.map((faq, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-100 overflow-hidden">
                <button onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-3.5 text-left hover:bg-slate-50 transition-colors">
                  <span className="font-medium text-slate-800 text-sm">{faq.q}</span>
                  <span className="text-slate-400 ml-4 text-lg leading-none">{faqOpen === i ? '−' : '+'}</span>
                </button>
                {faqOpen === i && (
                  <div className="px-5 pb-4">
                    <p className="text-slate-500 text-sm leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-16 bg-red-600">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#fff', marginBottom: '0.75rem' }}>Ready When Emergencies Strike?</h2>
          <p className="text-red-100 mb-6 text-sm">Join thousands already protected by SERCP. Free to register.</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link to="/register" className="bg-white text-red-600 px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-red-50 transition-colors shadow-md">
              🚨 Register Now — Free
            </Link>
            <Link to="/helplines" className="border border-white/40 text-white px-6 py-2.5 rounded-lg font-medium text-sm hover:bg-white/10 transition-colors">
              View Helplines
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-slate-900 text-slate-400 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-4 gap-7 mb-7">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 bg-red-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">S</div>
                <span className="text-white font-semibold text-sm">SERCP</span>
              </div>
              <p className="text-xs leading-relaxed">Smart Emergency Response Coordination Platform — because every second counts.</p>
            </div>
            {[
              { title: 'Platform', links: [['/', 'Home'], ['/features', 'Features'], ['/about', 'About']] },
              { title: 'Emergency', links: [['/helplines', 'Helplines'], ['/register', 'Register'], ['/login', 'Login']] },
              { title: 'Contact', links: [['/contact', 'Contact Us'], ['/', 'Support'], ['/', 'Privacy Policy']] },
            ].map(sec => (
              <div key={sec.title}>
                <p className="text-white font-medium mb-3 text-sm">{sec.title}</p>
                <div className="space-y-1.5">
                  {sec.links.map(([to, label]) => (
                    <Link key={label} to={to} className="block text-xs hover:text-white transition-colors">{label}</Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-slate-800 pt-5 flex flex-col sm:flex-row justify-between items-center gap-3">
            <p className="text-xs">© 2024 SERCP. Smart Emergency Response Coordination Platform.</p>
            <div className="flex items-center gap-2 text-xs">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              <span>All systems operational</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
