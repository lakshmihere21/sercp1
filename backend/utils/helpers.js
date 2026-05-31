const crypto = require('crypto');

// Generate random token
const generateToken = (length = 32) =>
  crypto.randomBytes(length).toString('hex');

// Calculate distance between coordinates (km)
const getDistanceKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// Calculate ETA in minutes given distance (km) and speed (km/h, default 40)
const getETAMinutes = (distanceKm, speedKmh = 40) =>
  Math.round((distanceKm / speedKmh) * 60);

// Severity score based on alert type
const getSeverityScore = (type) => {
  const scores = {
    fire: 5, crime: 5, natural_disaster: 5,
    medical: 4, accident: 4, women_safety: 4,
    other: 2,
  };
  return scores[type] || 3;
};

// Paginate query helper
const paginate = (query = {}, page = 1, limit = 20) => ({
  ...query,
  skip: (page - 1) * limit,
  limit: Number(limit),
});

// Format alert ID
const formatAlertId = () =>
  'SERCP-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4).toUpperCase();

// Sanitize user object (remove sensitive fields)
const sanitizeUser = (user) => {
  const obj = user.toObject ? user.toObject() : { ...user };
  delete obj.password;
  delete obj.refreshToken;
  delete obj.passwordResetToken;
  delete obj.passwordResetExpires;
  return obj;
};

// API success response
const successResponse = (res, data, message = 'Success', status = 200) =>
  res.status(status).json({ success: true, message, data });

// API error response
const errorResponse = (res, message = 'Error', status = 500) =>
  res.status(status).json({ success: false, message });

module.exports = {
  generateToken,
  getDistanceKm,
  getETAMinutes,
  getSeverityScore,
  paginate,
  formatAlertId,
  sanitizeUser,
  successResponse,
  errorResponse,
};
