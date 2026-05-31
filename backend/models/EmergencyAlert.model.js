const mongoose = require('mongoose');

const timelineEventSchema = new mongoose.Schema({
  event: { type: String, required: true },
  description: String,
  actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  actorName: String,
  timestamp: { type: Date, default: Date.now },
}, { _id: false });

const emergencyAlertSchema = new mongoose.Schema({
  alertId: { type: String, unique: true },

  citizen: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  citizenName: String,
  citizenPhone: String,

  type: {
    type: String,
    enum: ['medical', 'accident', 'fire', 'crime', 'women_safety', 'natural_disaster', 'other'],
    required: true,
  },

  severity: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], default: 'HIGH' },
  priorityLevel: { type: Number, default: 3, min: 1, max: 5 },

  status: {
    type: String,
    enum: ['ACTIVE', 'RESPONDER_ASSIGNED', 'IN_PROGRESS', 'ARRIVED', 'RESOLVED', 'CANCELLED'],
    default: 'ACTIVE',
  },

  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true }, // [lng, lat]
  },

  address: String,
  description: String,
  customMessage: String,

  images: [String],

  assignedResponder: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  assignedVehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', default: null },
  assignedVolunteers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  responderETA: Number,
  responderDistance: Number,

  resolvedAt: Date,
  cancelledAt: Date,
  cancelReason: String,

  riskScore: { type: Number, default: 50 },
  reportCount: { type: Number, default: 1 },

  timeline: [timelineEventSchema],

  isActive: { type: Boolean, default: true },
}, { timestamps: true });

emergencyAlertSchema.index({ location: '2dsphere' });
emergencyAlertSchema.index({ status: 1, createdAt: -1 });
emergencyAlertSchema.index({ citizen: 1 });

emergencyAlertSchema.pre('save', function (next) {
  if (!this.alertId) {
    this.alertId = 'ALERT-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();
  }
  next();
});

module.exports = mongoose.model('EmergencyAlert', emergencyAlertSchema);
