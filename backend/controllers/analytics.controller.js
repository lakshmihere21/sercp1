const EmergencyAlert = require('../models/EmergencyAlert.model');
const User = require('../models/User.model');
const { Responder, Volunteer } = require('../models/index');

// @desc    Get dashboard analytics
// @route   GET /api/analytics/dashboard
exports.getDashboardStats = async (req, res) => {
  try {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalAlerts, activeAlerts, resolvedAlerts, todayAlerts,
      totalUsers, totalResponders, availableResponders,
      byType, bySeverity, byStatus, dailyTrend,
      avgResponseTime,
    ] = await Promise.all([
      EmergencyAlert.countDocuments(),
      EmergencyAlert.countDocuments({ status: { $in: ['ACTIVE', 'RESPONDER_ASSIGNED', 'IN_PROGRESS'] } }),
      EmergencyAlert.countDocuments({ status: 'RESOLVED' }),
      EmergencyAlert.countDocuments({ createdAt: { $gte: today } }),
      User.countDocuments({ role: 'citizen' }),
      Responder.countDocuments(),
      Responder.countDocuments({ availability: 'available' }),
      EmergencyAlert.aggregate([{ $group: { _id: '$type', count: { $sum: 1 } } }]),
      EmergencyAlert.aggregate([{ $group: { _id: '$severity', count: { $sum: 1 } } }]),
      EmergencyAlert.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      EmergencyAlert.aggregate([
        { $match: { createdAt: { $gte: weekAgo } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      EmergencyAlert.aggregate([
        { $match: { status: 'RESOLVED', resolvedAt: { $exists: true } } },
        { $project: { responseTime: { $subtract: ['$resolvedAt', '$createdAt'] } } },
        { $group: { _id: null, avgTime: { $avg: '$responseTime' } } },
      ]),
    ]);

    const avgTimeMinutes = avgResponseTime[0]
      ? Math.round(avgResponseTime[0].avgTime / 60000)
      : 0;

    res.json({
      success: true,
      data: {
        overview: { totalAlerts, activeAlerts, resolvedAlerts, todayAlerts, totalUsers, totalResponders, availableResponders },
        byType: byType.reduce((acc, cur) => { acc[cur._id] = cur.count; return acc; }, {}),
        bySeverity: bySeverity.reduce((acc, cur) => { acc[cur._id] = cur.count; return acc; }, {}),
        byStatus: byStatus.reduce((acc, cur) => { acc[cur._id] = cur.count; return acc; }, {}),
        dailyTrend,
        avgResponseTimeMinutes: avgTimeMinutes,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Analytics fetch failed.' });
  }
};

// @desc    Get monthly alert trend
// @route   GET /api/analytics/monthly
exports.getMonthlyTrend = async (req, res) => {
  try {
    const sixMonthsAgo = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000);
    const trend = await EmergencyAlert.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);
    res.json({ success: true, data: trend });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Monthly trend fetch failed.' });
  }
};

// @desc    Get heatmap data
// @route   GET /api/analytics/heatmap
exports.getHeatmap = async (req, res) => {
  try {
    const alerts = await EmergencyAlert.find({}, 'location type severity createdAt').lean();
    const heatmap = alerts.map(a => ({
      lat: a.location?.coordinates?.[1],
      lng: a.location?.coordinates?.[0],
      type: a.type,
      severity: a.severity,
      weight: a.severity === 'CRITICAL' ? 4 : a.severity === 'HIGH' ? 3 : a.severity === 'MEDIUM' ? 2 : 1,
    })).filter(a => a.lat && a.lng);
    res.json({ success: true, data: heatmap });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Heatmap fetch failed.' });
  }
};
