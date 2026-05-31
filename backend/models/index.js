const mongoose = require('mongoose');

// ─── Emergency Contact ────────────────────────────────────────────────────────
const emergencyContactSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, trim: true },
  phone: { type: String, required: true },
  email: { type: String },
  relationship: { type: String, enum: ['family', 'friend', 'colleague', 'neighbor', 'other'], default: 'family' },
  isPrimary: { type: Boolean, default: false },
}, { timestamps: true });

const EmergencyContact = mongoose.model('EmergencyContact', emergencyContactSchema);

// ─── Responder Profile ────────────────────────────────────────────────────────
const responderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  department: { type: String, enum: ['police', 'fire', 'medical', 'rescue', 'disaster'], required: true },
  badgeNumber: { type: String, unique: true },
  skills: [{
    type: String,
    enum: ['first_aid', 'fire_rescue', 'search_rescue', 'medical_support', 'disaster_response', 'cpr', 'trauma_care'],
  }],
  availability: { type: String, enum: ['available', 'busy', 'offline'], default: 'available' },
  currentAlert: { type: mongoose.Schema.Types.ObjectId, ref: 'EmergencyAlert', default: null },
  totalResponses: { type: Number, default: 0 },
  rating: { type: Number, default: 4.5, min: 0, max: 5 },
  vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', default: null },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] },
  },
}, { timestamps: true });

responderSchema.index({ location: '2dsphere' });
const Responder = mongoose.model('Responder', responderSchema);

// ─── Volunteer Profile ────────────────────────────────────────────────────────
const volunteerSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  skills: [String],
  availability: { type: String, enum: ['available', 'busy', 'offline'], default: 'available' },
  activeRadius: { type: Number, default: 5 }, // km
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] },
  },
  totalAssists: { type: Number, default: 0 },
  rating: { type: Number, default: 4.0 },
}, { timestamps: true });

volunteerSchema.index({ location: '2dsphere' });
const Volunteer = mongoose.model('Volunteer', volunteerSchema);

// ─── Vehicle ──────────────────────────────────────────────────────────────────
const vehicleSchema = new mongoose.Schema({
  vehicleNumber: { type: String, required: true, unique: true },
  type: { type: String, enum: ['ambulance', 'police_vehicle', 'fire_truck', 'rescue_vehicle'], required: true },
  status: { type: String, enum: ['available', 'dispatched', 'maintenance', 'offline'], default: 'available' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  currentAlert: { type: mongoose.Schema.Types.ObjectId, ref: 'EmergencyAlert', default: null },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] },
  },
  lastMaintenance: Date,
  department: String,
}, { timestamps: true });

vehicleSchema.index({ location: '2dsphere' });
const Vehicle = mongoose.model('Vehicle', vehicleSchema);

// ─── Notification ─────────────────────────────────────────────────────────────
const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['alert_created', 'responder_assigned', 'status_updated', 'emergency_resolved', 'general', 'sos_received'], default: 'general' },
  isRead: { type: Boolean, default: false },
  relatedAlert: { type: mongoose.Schema.Types.ObjectId, ref: 'EmergencyAlert', default: null },
  data: mongoose.Schema.Types.Mixed,
}, { timestamps: true });

const Notification = mongoose.model('Notification', notificationSchema);

// ─── Chat Message ─────────────────────────────────────────────────────────────
const chatMessageSchema = new mongoose.Schema({
  alert: { type: mongoose.Schema.Types.ObjectId, ref: 'EmergencyAlert', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  senderName: String,
  senderRole: String,
  message: String,
  type: { type: String, enum: ['text', 'image', 'system'], default: 'text' },
  imageUrl: String,
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);

// ─── Location History ─────────────────────────────────────────────────────────
const locationHistorySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  alert: { type: mongoose.Schema.Types.ObjectId, ref: 'EmergencyAlert' },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true },
  },
  accuracy: Number,
  speed: Number,
}, { timestamps: true });

locationHistorySchema.index({ location: '2dsphere' });
const LocationHistory = mongoose.model('LocationHistory', locationHistorySchema);

// ─── Activity Log ─────────────────────────────────────────────────────────────
const activityLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  action: { type: String, required: true },
  description: String,
  ipAddress: String,
  userAgent: String,
  metadata: mongoose.Schema.Types.Mixed,
}, { timestamps: true });

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);

module.exports = { EmergencyContact, Responder, Volunteer, Vehicle, Notification, ChatMessage, LocationHistory, ActivityLog };
