import { useState, useEffect } from 'react';
import { analyticsAPI } from '../../services/api';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement, Filler } from 'chart.js';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement, Filler);

const chartOptions = {
  responsive: true,
  plugins: { legend: { position: 'bottom', labels: { font: { family: 'DM Sans', size: 12 }, padding: 16, usePointStyle: true } } },
  scales: { x: { grid: { display: false } }, y: { grid: { color: '#f1f5f9' } } },
};

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState(null);
  const [monthly, setMonthly] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([analyticsAPI.getDashboard(), analyticsAPI.getMonthly()])
      .then(([s, m]) => {
        setStats(s.data.data);
        setMonthly(m.data.data || []);
      })
      .catch(() => toast.error('Failed to load analytics'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-16"><div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full" /></div>;
  if (!stats) return <div className="text-center py-16 text-slate-500">No data available</div>;

  const ov = stats.overview;
  const byType = stats.byType || {};
  const bySeverity = stats.bySeverity || {};
  const byStatus = stats.byStatus || {};
  const dailyTrend = stats.dailyTrend || [];

  const typeColors = ['#ef4444', '#f97316', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#f59e0b'];
  const severityColors = { CRITICAL: '#dc2626', HIGH: '#ea580c', MEDIUM: '#d97706', LOW: '#16a34a' };

  const dailyChart = {
    labels: dailyTrend.map(d => new Date(d._id).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' })),
    datasets: [{
      label: 'Alerts',
      data: dailyTrend.map(d => d.count),
      backgroundColor: '#3b82f620',
      borderColor: '#3b82f6',
      borderWidth: 2,
      tension: 0.4,
      fill: true,
      pointBackgroundColor: '#3b82f6',
    }],
  };

  const typeChart = {
    labels: Object.keys(byType).map(t => t.replace('_', ' ').toUpperCase()),
    datasets: [{
      data: Object.values(byType),
      backgroundColor: typeColors,
      borderWidth: 0,
      hoverOffset: 8,
    }],
  };

  const severityChart = {
    labels: Object.keys(bySeverity),
    datasets: [{
      label: 'Count',
      data: Object.values(bySeverity),
      backgroundColor: Object.keys(bySeverity).map(k => severityColors[k] || '#6b7280'),
      borderRadius: 8,
      borderSkipped: false,
    }],
  };

  const monthlyChart = {
    labels: monthly.map(m => m._id),
    datasets: [{
      label: 'Monthly Alerts',
      data: monthly.map(m => m.count),
      backgroundColor: '#8b5cf620',
      borderColor: '#8b5cf6',
      borderWidth: 2,
      tension: 0.4,
      fill: true,
    }],
  };

  const KPI_CARDS = [
    { label: 'Total Alerts', value: ov.totalAlerts || 0, icon: '📋', color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Active Now', value: ov.activeAlerts || 0, icon: '🚨', color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Resolved', value: ov.resolvedAlerts || 0, icon: '✅', color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Avg Response', value: `${stats.avgResponseTimeMinutes || 0}m`, icon: '⚡', color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { label: 'Total Citizens', value: ov.totalUsers || 0, icon: '👥', color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Responders', value: ov.totalResponders || 0, icon: '🛡️', color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Analytics & Reports</h1>
        <p className="text-slate-500 text-sm mt-1">Emergency response performance overview</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {KPI_CARDS.map((k, i) => (
          <motion.div key={k.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className={`${k.bg} rounded-2xl p-4 text-center border border-white`}>
            <div className="text-2xl mb-1">{k.icon}</div>
            <p className={`text-xl font-bold ${k.color}`}>{k.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{k.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Daily Trend */}
        <div className="card">
          <h3 className="font-semibold text-slate-800 mb-4">Daily Alerts (Last 7 Days)</h3>
          {dailyTrend.length > 0 ? (
            <Line data={dailyChart} options={{ ...chartOptions, plugins: { ...chartOptions.plugins, legend: { display: false } } }} />
          ) : <p className="text-center py-12 text-slate-400">No data for this period</p>}
        </div>

        {/* Emergency Types */}
        <div className="card">
          <h3 className="font-semibold text-slate-800 mb-4">Emergencies by Type</h3>
          {Object.keys(byType).length > 0 ? (
            <div className="max-w-xs mx-auto">
              <Doughnut data={typeChart} options={{ ...chartOptions, cutout: '65%' }} />
            </div>
          ) : <p className="text-center py-12 text-slate-400">No data</p>}
        </div>

        {/* Severity Distribution */}
        <div className="card">
          <h3 className="font-semibold text-slate-800 mb-4">Severity Distribution</h3>
          {Object.keys(bySeverity).length > 0 ? (
            <Bar data={severityChart} options={chartOptions} />
          ) : <p className="text-center py-12 text-slate-400">No data</p>}
        </div>

        {/* Monthly Trend */}
        <div className="card">
          <h3 className="font-semibold text-slate-800 mb-4">Monthly Trend</h3>
          {monthly.length > 0 ? (
            <Line data={monthlyChart} options={{ ...chartOptions, plugins: { ...chartOptions.plugins, legend: { display: false } } }} />
          ) : <p className="text-center py-12 text-slate-400">No data</p>}
        </div>
      </div>

      {/* Status Breakdown */}
      <div className="card">
        <h3 className="font-semibold text-slate-800 mb-4">Status Breakdown</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {Object.entries(byStatus).map(([status, count]) => (
            <div key={status} className="bg-slate-50 rounded-xl p-3 text-center">
              <p className="text-xl font-bold text-slate-800">{count}</p>
              <p className="text-xs text-slate-500 mt-0.5">{status.replace(/_/g, ' ')}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
