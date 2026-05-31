const EmergencyAlert = require('../models/EmergencyAlert.model');
const { Responder, Volunteer, Notification, LocationHistory, ActivityLog } = require('../models/index');
const User = require('../models/User.model');
const emailService = require('../services/email.service');

// Calculate distance between two coordinates (Haversine formula)
const getDistanceKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// Severity logic based on type
const calculateSeverity = (type, reportCount = 1) => {
  const severityMap = {
    fire: 'CRITICAL', crime: 'CRITICAL', natural_disaster: 'CRITICAL',
    medical: 'HIGH', accident: 'HIGH', women_safety: 'HIGH',
    other: 'MEDIUM',
  };
  let severity = severityMap[type] || 'HIGH';
  if (reportCount > 5 && severity !== 'CRITICAL') severity = 'CRITICAL';
  return severity;
};

// @desc    Trigger SOS / Create Emergency Alert
// @route   POST /api/alerts/sos
exports.triggerSOS = async (req, res) => {
  try {
    const io = req.app.get('io');
    const { type, coordinates, address, description, customMessage } = req.body;

    if (!coordinates || coordinates.length !== 2) {
      return res.status(400).json({ success: false, message: 'Valid coordinates required.' });
    }

    const user = await User.findById(req.user._id);
    const severity = calculateSeverity(type);

    const alert = await EmergencyAlert.create({
      citizen: user._id,
      citizenName: user.name,
      citizenPhone: user.phone,
      type: type || 'other',
      severity,
      location: { type: 'Point', coordinates: [coordinates[1], coordinates[0]] }, // [lng, lat]
      address: address || 'Location not available',
      description,
      customMessage: customMessage || user.customEmergencyMessage,
      timeline: [{
        event: 'SOS_ACTIVATED',
        description: `Emergency SOS triggered by ${user.name}`,
        actorName: user.name,
      }],
    });

    // Find nearby responders (within 20km)
    const nearbyResponders = await Responder.find({
      availability: 'available',
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [coordinates[1], coordinates[0]] },
          $maxDistance: 20000,
        },
      },
    }).populate('user', 'name email phone').limit(10);

    // Find nearby volunteers (within 5km)
    const nearbyVolunteers = await Volunteer.find({
      availability: 'available',
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [coordinates[1], coordinates[0]] },
          $maxDistance: 5000,
        },
      },
    }).populate('user', 'name email phone').limit(10);

    // Create notifications for responders
    const notifPromises = nearbyResponders.map(r =>
      Notification.create({
        recipient: r.user._id,
        title: '🚨 NEW EMERGENCY ALERT',
        message: `${alert.type.toUpperCase()} emergency near you. ${alert.customMessage}`,
        type: 'alert_created',
        relatedAlert: alert._id,
      })
    );
    await Promise.all(notifPromises);

    // Broadcast via Socket.io
    io.emit('NEW_EMERGENCY_ALERT', {
      alert: await EmergencyAlert.findById(alert._id),
      nearbyResponders: nearbyResponders.length,
      nearbyVolunteers: nearbyVolunteers.length,
    });

    // Emit to admin room
    io.to('admin_room').emit('ADMIN_NEW_ALERT', { alert });

    // Notify each responder in their socket room
    nearbyResponders.forEach(r => {
      io.to(`user_${r.user._id}`).emit('SOS_RECEIVED', { alert });
    });

    // Log activity
    await ActivityLog.create({
      user: user._id,
      action: 'SOS_TRIGGERED',
      description: `SOS triggered: ${type} at ${address}`,
      metadata: { alertId: alert._id, coordinates },
    });

    // Send email notifications (async, don't await)
    emailService.sendSOSConfirmation(user, alert).catch(console.error);

    res.status(201).json({
      success: true,
      message: 'SOS alert created successfully.',
      alert,
      nearbyResponders: nearbyResponders.length,
      nearbyVolunteers: nearbyVolunteers.length,
    });
  } catch (err) {
    console.error('SOS Error:', err);
    res.status(500).json({ success: false, message: 'Failed to trigger SOS.' });
  }
};

// @desc    Get all alerts (admin)
// @route   GET /api/alerts
exports.getAllAlerts = async (req, res) => {
  try {
    const { status, type, severity, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (severity) filter.severity = severity;

    const skip = (page - 1) * limit;
    const [alerts, total] = await Promise.all([
      EmergencyAlert.find(filter)
        .populate('citizen', 'name phone email')
        .populate('assignedResponder', 'name phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      EmergencyAlert.countDocuments(filter),
    ]);

    res.json({ success: true, data: alerts, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch alerts.' });
  }
};

// @desc    Get single alert
// @route   GET /api/alerts/:id
exports.getAlert = async (req, res) => {
  try {
    const alert = await EmergencyAlert.findById(req.params.id)
      .populate('citizen', 'name phone email avatar bloodGroup')
      .populate('assignedResponder', 'name phone email avatar')
      .populate('assignedVehicle');

    if (!alert) return res.status(404).json({ success: false, message: 'Alert not found.' });
    res.json({ success: true, data: alert });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch alert.' });
  }
};

// @desc    Get citizen's own alerts
// @route   GET /api/alerts/my
exports.getMyAlerts = async (req, res) => {
  try {
    const alerts = await EmergencyAlert.find({ citizen: req.user._id })
      .populate('assignedResponder', 'name phone')
      .sort({ createdAt: -1 })
      .limit(20);
    res.json({ success: true, data: alerts });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch alerts.' });
  }
};

// @desc    Update alert status
// @route   PATCH /api/alerts/:id/status
exports.updateStatus = async (req, res) => {
  try {
    const io = req.app.get('io');
    const { status, description } = req.body;

    const alert = await EmergencyAlert.findById(req.params.id);
    if (!alert) return res.status(404).json({ success: false, message: 'Alert not found.' });

    const prevStatus = alert.status;
    alert.status = status;

    if (status === 'RESOLVED') alert.resolvedAt = new Date();
    if (status === 'CANCELLED') { alert.cancelledAt = new Date(); alert.isActive = false; }

    alert.timeline.push({
      event: `STATUS_CHANGED_TO_${status}`,
      description: description || `Status updated from ${prevStatus} to ${status}`,
      actor: req.user._id,
      actorName: req.user.name,
    });

    await alert.save();

    io.emit('ALERT_STATUS_UPDATED', { alertId: alert._id, status, alert });
    io.to(`alert_${alert._id}`).emit('STATUS_UPDATE', { status, description });

    // Notify citizen
    await Notification.create({
      recipient: alert.citizen,
      title: 'Emergency Status Updated',
      message: `Your emergency alert status changed to: ${status}`,
      type: 'status_updated',
      relatedAlert: alert._id,
    });

    res.json({ success: true, message: 'Status updated.', data: alert });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update status.' });
  }
};

// @desc    Assign responder to alert
// @route   POST /api/alerts/:id/assign
exports.assignResponder = async (req, res) => {
  try {
    const io = req.app.get('io');
    const { responderId, vehicleId } = req.body;

    const [alert, responder] = await Promise.all([
      EmergencyAlert.findById(req.params.id),
      Responder.findOne({ user: responderId }).populate('user', 'name phone'),
    ]);

    if (!alert) return res.status(404).json({ success: false, message: 'Alert not found.' });
    if (!responder) return res.status(404).json({ success: false, message: 'Responder not found.' });

    alert.assignedResponder = responderId;
    if (vehicleId) alert.assignedVehicle = vehicleId;
    alert.status = 'RESPONDER_ASSIGNED';
    alert.timeline.push({
      event: 'RESPONDER_ASSIGNED',
      description: `Responder ${responder.user.name} assigned`,
      actor: req.user._id,
      actorName: req.user.name,
    });
    await alert.save();

    responder.availability = 'busy';
    responder.currentAlert = alert._id;
    await responder.save();

    io.emit('RESPONDER_ASSIGNED', { alertId: alert._id, responder: responder.user, alert });
    io.to(`user_${responderId}`).emit('ASSIGNMENT_RECEIVED', { alert });
    io.to(`user_${alert.citizen}`).emit('RESPONDER_ASSIGNED_NOTIFY', { responder: responder.user });

    await Notification.create({
      recipient: alert.citizen,
      title: '✅ Responder Assigned!',
      message: `${responder.user.name} is on the way to help you.`,
      type: 'responder_assigned',
      relatedAlert: alert._id,
    });

    res.json({ success: true, message: 'Responder assigned.', data: alert });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Assignment failed.' });
  }
};

// @desc    Upload images for alert
// @route   POST /api/alerts/:id/images
exports.uploadImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No images uploaded.' });
    }

    const alert = await EmergencyAlert.findById(req.params.id);
    if (!alert) return res.status(404).json({ success: false, message: 'Alert not found.' });

    const imageUrls = req.files.map(f => `/uploads/${f.filename}`);
    alert.images.push(...imageUrls);
    await alert.save();

    res.json({ success: true, images: imageUrls });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Upload failed.' });
  }
};

// @desc    Get active alerts for responder's area
// @route   GET /api/alerts/nearby
exports.getNearbyAlerts = async (req, res) => {
  try {
    const { lat, lng, radius = 20 } = req.query;
    if (!lat || !lng) return res.status(400).json({ success: false, message: 'Coordinates required.' });

    const alerts = await EmergencyAlert.find({
      status: { $in: ['ACTIVE', 'RESPONDER_ASSIGNED', 'IN_PROGRESS'] },
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: radius * 1000,
        },
      },
    }).populate('citizen', 'name phone').limit(50);

    res.json({ success: true, data: alerts });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch nearby alerts.' });
  }
};
