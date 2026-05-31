import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const ROLE_COLORS = {
  citizen: 'bg-blue-100 text-blue-700',
  responder: 'bg-orange-100 text-orange-700',
  volunteer: 'bg-green-100 text-green-700',
  admin: 'bg-purple-100 text-purple-700',
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  useEffect(() => {
    adminAPI.getUsers()
      .then(res => setUsers(res.data.data || []))
      .catch(() => toast.error('Failed to load users'))
      .finally(() => setLoading(false));
  }, []);

  const toggleUser = async (id) => {
    try {
      const res = await adminAPI.toggleUser(id);
      setUsers(prev => prev.map(u => u._id === id ? { ...u, isActive: res.data.data.isActive } : u));
      toast.success('User status updated');
    } catch { toast.error('Failed to update user'); }
  };

  const filtered = users.filter(u => {
    const matchSearch = !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = !roleFilter || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const counts = { total: users.length, citizen: users.filter(u => u.role === 'citizen').length, responder: users.filter(u => u.role === 'responder').length, active: users.filter(u => u.isActive).length };

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-slate-900">User Management</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[['👥', 'Total', counts.total, 'bg-slate-50'], ['👤', 'Citizens', counts.citizen, 'bg-blue-50'], ['🛡️', 'Responders', counts.responder, 'bg-orange-50'], ['✅', 'Active', counts.active, 'bg-green-50']].map(([icon, label, val, bg]) => (
          <div key={label} className={`${bg} rounded-2xl p-4 text-center shadow-sm border border-slate-100`}>
            <div className="text-2xl mb-1">{icon}</div>
            <p className="text-xl font-bold text-slate-800">{val}</p>
            <p className="text-xs text-slate-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input value={search} onChange={e => setSearch(e.target.value)}
          className="input-field w-64 text-sm py-2" placeholder="🔍 Search name or email..." />
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
          className="input-field w-40 text-sm py-2">
          <option value="">All Roles</option>
          {['citizen', 'responder', 'volunteer', 'admin'].map(r => (
            <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
          ))}
        </select>
      </div>

      {/* User Table */}
      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" /></div>
      ) : (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide">User</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide">Role</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide hidden sm:table-cell">Phone</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide hidden md:table-cell">Joined</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(u => (
                  <motion.tr key={u._id} layout className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                          u.role === 'admin' ? 'bg-purple-600' : u.role === 'responder' ? 'bg-orange-500' : u.role === 'volunteer' ? 'bg-green-500' : 'bg-blue-600'
                        }`}>
                          {u.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{u.name}</p>
                          <p className="text-slate-400 text-xs">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold capitalize ${ROLE_COLORS[u.role]}`}>{u.role}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 hidden sm:table-cell">{u.phone}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs hidden md:table-cell">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {u.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {u.role !== 'admin' && (
                        <button onClick={() => toggleUser(u._id)}
                          className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                            u.isActive ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'
                          }`}>
                          {u.isActive ? 'Disable' : 'Enable'}
                        </button>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-12 text-slate-400">
                <p className="text-3xl mb-2">👥</p>
                <p>No users found</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
