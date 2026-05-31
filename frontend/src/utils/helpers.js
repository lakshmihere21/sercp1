import { ALERT_STATUSES, SEVERITY_LEVELS, EMERGENCY_TYPES } from './constants';

// Format date to readable string
export const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

// Relative time (e.g. "2 mins ago")
export const timeAgo = (date) => {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

// Get status color classes
export const getStatusColor = (status) => {
  const found = ALERT_STATUSES.find(s => s.value === status);
  return found?.color || 'bg-slate-100 text-slate-500';
};

// Get severity color
export const getSeverityColor = (severity) => {
  const found = SEVERITY_LEVELS.find(s => s.value === severity);
  return found?.color || 'bg-slate-100 text-slate-500';
};

// Get severity dot color
export const getSeverityDot = (severity) => {
  const found = SEVERITY_LEVELS.find(s => s.value === severity);
  return found?.dot || 'bg-slate-400';
};

// Get emergency type icon
export const getTypeIcon = (type) => {
  const found = EMERGENCY_TYPES.find(t => t.value === type);
  return found?.icon || '⚠️';
};

// Get emergency type label
export const getTypeLabel = (type) => {
  const found = EMERGENCY_TYPES.find(t => t.value === type);
  return found?.label || type?.replace('_', ' ') || 'Unknown';
};

// Format phone for display
export const formatPhone = (phone) => {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) return `+91 ${cleaned.slice(0,5)} ${cleaned.slice(5)}`;
  return phone;
};

// Truncate text
export const truncate = (text, maxLength = 60) => {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

// Calculate distance between two GPS coordinates (km)
export const getDistanceKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2;
  return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1);
};

// Get user initials
export const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

// Role badge color
export const getRoleColor = (role) => {
  const colors = {
    citizen: 'bg-blue-600',
    responder: 'bg-orange-500',
    volunteer: 'bg-green-600',
    admin: 'bg-purple-600',
  };
  return colors[role] || 'bg-slate-500';
};

// Validate Indian phone number
export const isValidPhone = (phone) =>
  /^(\+91|91|0)?[6-9]\d{9}$/.test(phone.replace(/\s/g, ''));

// Format coordinates display
export const formatCoords = (lat, lng) =>
  `${parseFloat(lat).toFixed(4)}°N, ${parseFloat(lng).toFixed(4)}°E`;
