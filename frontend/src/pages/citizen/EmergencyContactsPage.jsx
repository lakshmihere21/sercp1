import { useState, useEffect } from 'react';
import { contactAPI } from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const RELATIONSHIPS = ['family', 'friend', 'colleague', 'neighbor', 'other'];

const DEFAULT_FORM = { name: '', phone: '', email: '', relationship: 'family', isPrimary: false };

export default function EmergencyContactsPage() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const res = await contactAPI.getAll();
      setContacts(res.data.data || []);
    } catch { toast.error('Failed to load contacts'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editId) {
        await contactAPI.update(editId, form);
        toast.success('Contact updated');
      } else {
        await contactAPI.create(form);
        toast.success('Contact added');
      }
      setShowForm(false);
      setForm(DEFAULT_FORM);
      setEditId(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (c) => {
    setForm({ name: c.name, phone: c.phone, email: c.email || '', relationship: c.relationship, isPrimary: c.isPrimary });
    setEditId(c._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this contact?')) return;
    try {
      await contactAPI.delete(id);
      toast.success('Contact deleted');
      load();
    } catch { toast.error('Delete failed'); }
  };

  const relIcons = { family: '👨‍👩‍👧', friend: '👫', colleague: '💼', neighbor: '🏠', other: '👤' };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Emergency Contacts</h1>
          <p className="text-slate-500 text-sm mt-1">Add up to 5 contacts to notify during emergencies</p>
        </div>
        {contacts.length < 5 && (
          <button onClick={() => { setShowForm(true); setForm(DEFAULT_FORM); setEditId(null); }}
            className="btn-primary text-sm flex items-center gap-2">
            <span className="text-lg">+</span> Add Contact
          </button>
        )}
      </div>

      {/* Capacity bar */}
      <div className="card">
        <div className="flex justify-between mb-2">
          <p className="text-sm font-semibold text-slate-700">Contact Slots</p>
          <p className="text-sm text-slate-500">{contacts.length}/5</p>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-blue-600 rounded-full transition-all" style={{ width: `${(contacts.length / 5) * 100}%` }} />
        </div>
      </div>

      {/* Add/Edit Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="card border-blue-100 bg-blue-50">
            <h3 className="font-semibold text-slate-800 mb-4">{editId ? 'Edit Contact' : 'Add Emergency Contact'}</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Full Name *</label>
                  <input required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    className="input-field text-sm" placeholder="John Doe" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Phone *</label>
                  <input required value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                    className="input-field text-sm" placeholder="+91 98765 43210" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Email</label>
                  <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                    className="input-field text-sm" placeholder="john@example.com" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Relationship</label>
                  <select value={form.relationship} onChange={e => setForm(p => ({ ...p, relationship: e.target.value }))}
                    className="input-field text-sm capitalize">
                    {RELATIONSHIPS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isPrimary} onChange={e => setForm(p => ({ ...p, isPrimary: e.target.checked }))}
                  className="w-4 h-4 rounded text-blue-600" />
                <span className="text-sm text-slate-700">Set as primary contact</span>
              </label>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="btn-primary text-sm flex items-center gap-2 disabled:opacity-60">
                  {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
                  {editId ? 'Save Changes' : 'Add Contact'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-outline text-sm">Cancel</button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contacts List */}
      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" /></div>
      ) : contacts.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-2xl mb-4">📞</p>
          <p className="font-semibold text-slate-800">No emergency contacts yet</p>
          <p className="text-slate-500 text-sm mt-1">Add contacts to notify them during SOS alerts</p>
        </div>
      ) : (
        <div className="space-y-3">
          {contacts.map(c => (
            <motion.div key={c._id} layout className="card flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-2xl">
                {relIcons[c.relationship] || '👤'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-slate-800">{c.name}</p>
                  {c.isPrimary && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">Primary</span>}
                </div>
                <p className="text-blue-600 text-sm font-medium">{c.phone}</p>
                {c.email && <p className="text-slate-400 text-xs">{c.email}</p>}
                <p className="text-slate-400 text-xs capitalize mt-0.5">{c.relationship}</p>
              </div>
              <div className="flex gap-2">
                <a href={`tel:${c.phone}`}
                  className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors text-sm">📞</a>
                <button onClick={() => handleEdit(c)}
                  className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm">✏️</button>
                <button onClick={() => handleDelete(c._id)}
                  className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm">🗑️</button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Info Box */}
      <div className="card bg-yellow-50 border-yellow-100">
        <h3 className="font-semibold text-yellow-800 mb-2">⚡ How it works</h3>
        <div className="text-sm text-yellow-700 space-y-1">
          <p>• When you trigger SOS, all contacts are notified immediately</p>
          <p>• They receive your live location tracking link</p>
          <p>• Your custom emergency message is included</p>
          <p>• Primary contact is called first if SMS integration is enabled</p>
        </div>
      </div>
    </div>
  );
}
