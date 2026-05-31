// ─── user.routes.js ───────────────────────────────────────────────────────────
const express = require('express');
const User = require('../models/User.model');
const { protect, authorize } = require('../middleware/auth.middleware');
const router = express.Router();

router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success: true, data: user.toPublicJSON() });
  } catch { res.status(500).json({ success: false }); }
});

router.patch('/profile', protect, async (req, res) => {
  try {
    const allowed = ['name', 'phone', 'address', 'bloodGroup', 'medicalConditions', 'customEmergencyMessage'];
    const updates = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    res.json({ success: true, data: user.toPublicJSON() });
  } catch { res.status(500).json({ success: false }); }
});

router.patch('/location', protect, async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    await User.findByIdAndUpdate(req.user._id, {
      location: { type: 'Point', coordinates: [longitude, latitude] },
    });
    res.json({ success: true });
  } catch { res.status(500).json({ success: false }); }
});

module.exports = router;

// ─── contact.routes.js ────────────────────────────────────────────────────────
const contactRouter = express.Router();
const { EmergencyContact } = require('../models/index');

contactRouter.get('/', protect, async (req, res) => {
  const contacts = await EmergencyContact.find({ user: req.user._id });
  res.json({ success: true, data: contacts });
});

contactRouter.post('/', protect, async (req, res) => {
  try {
    const count = await EmergencyContact.countDocuments({ user: req.user._id });
    if (count >= 5) return res.status(400).json({ success: false, message: 'Maximum 5 emergency contacts allowed.' });
    const contact = await EmergencyContact.create({ ...req.body, user: req.user._id });
    res.status(201).json({ success: true, data: contact });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

contactRouter.put('/:id', protect, async (req, res) => {
  try {
    const contact = await EmergencyContact.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id }, req.body, { new: true }
    );
    if (!contact) return res.status(404).json({ success: false });
    res.json({ success: true, data: contact });
  } catch { res.status(500).json({ success: false }); }
});

contactRouter.delete('/:id', protect, async (req, res) => {
  try {
    await EmergencyContact.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ success: true, message: 'Contact deleted.' });
  } catch { res.status(500).json({ success: false }); }
});

// ─── responder.routes.js ──────────────────────────────────────────────────────
const responderRouter = express.Router();
const { Responder } = require('../models/index');

responderRouter.get('/', protect, authorize('admin'), async (req, res) => {
  const resp = await Responder.find().populate('user', 'name phone email').populate('vehicle');
  res.json({ success: true, data: resp });
});

responderRouter.get('/available', protect, async (req, res) => {
  const resp = await Responder.find({ availability: 'available' }).populate('user', 'name phone');
  res.json({ success: true, data: resp });
});

responderRouter.post('/register', protect, async (req, res) => {
  try {
    const exists = await Responder.findOne({ user: req.user._id });
    if (exists) return res.status(400).json({ success: false, message: 'Already registered as responder.' });
    const resp = await Responder.create({ user: req.user._id, ...req.body });
    await User.findByIdAndUpdate(req.user._id, { role: 'responder' });
    res.status(201).json({ success: true, data: resp });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

responderRouter.patch('/status', protect, async (req, res) => {
  try {
    const { availability } = req.body;
    const resp = await Responder.findOneAndUpdate({ user: req.user._id }, { availability }, { new: true });
    res.json({ success: true, data: resp });
  } catch { res.status(500).json({ success: false }); }
});

// ─── volunteer.routes.js ──────────────────────────────────────────────────────
const volunteerRouter = express.Router();
const { Volunteer } = require('../models/index');

volunteerRouter.post('/register', protect, async (req, res) => {
  try {
    const v = await Volunteer.create({ user: req.user._id, ...req.body });
    await User.findByIdAndUpdate(req.user._id, { role: 'volunteer' });
    res.status(201).json({ success: true, data: v });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ─── vehicle.routes.js ────────────────────────────────────────────────────────
const vehicleRouter = express.Router();
const { Vehicle } = require('../models/index');

vehicleRouter.get('/', protect, authorize('admin', 'responder'), async (req, res) => {
  const vehicles = await Vehicle.find().populate('assignedTo', 'name');
  res.json({ success: true, data: vehicles });
});

vehicleRouter.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const v = await Vehicle.create(req.body);
    res.status(201).json({ success: true, data: v });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

vehicleRouter.patch('/:id', protect, authorize('admin'), async (req, res) => {
  const v = await Vehicle.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ success: true, data: v });
});

// ─── location.routes.js ───────────────────────────────────────────────────────
const locationRouter = express.Router();
const { LocationHistory } = require('../models/index');

locationRouter.get('/:alertId', protect, async (req, res) => {
  const history = await LocationHistory.find({ alert: req.params.alertId })
    .populate('user', 'name role').sort({ createdAt: -1 }).limit(100);
  res.json({ success: true, data: history });
});

// ─── chat.routes.js ───────────────────────────────────────────────────────────
const chatRouter = express.Router();
const { ChatMessage } = require('../models/index');

chatRouter.get('/:alertId', protect, async (req, res) => {
  const messages = await ChatMessage.find({ alert: req.params.alertId })
    .populate('sender', 'name avatar role').sort({ createdAt: 1 });
  res.json({ success: true, data: messages });
});

// ─── notification.routes.js ───────────────────────────────────────────────────
const notifRouter = express.Router();
const { Notification } = require('../models/index');

notifRouter.get('/', protect, async (req, res) => {
  const notifs = await Notification.find({ recipient: req.user._id }).sort({ createdAt: -1 }).limit(50);
  res.json({ success: true, data: notifs });
});

notifRouter.patch('/read-all', protect, async (req, res) => {
  await Notification.updateMany({ recipient: req.user._id }, { isRead: true });
  res.json({ success: true });
});

notifRouter.patch('/:id/read', protect, async (req, res) => {
  await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
  res.json({ success: true });
});

// ─── analytics.routes.js ─────────────────────────────────────────────────────
const analyticsRouter = express.Router();
const { getDashboardStats, getMonthlyTrend, getHeatmap } = require('../controllers/analytics.controller');

analyticsRouter.get('/dashboard', protect, authorize('admin'), getDashboardStats);
analyticsRouter.get('/monthly', protect, authorize('admin'), getMonthlyTrend);
analyticsRouter.get('/heatmap', protect, authorize('admin'), getHeatmap);

// ─── admin.routes.js ──────────────────────────────────────────────────────────
const adminRouter = express.Router();
const EmergencyAlert = require('../models/EmergencyAlert.model');

adminRouter.get('/users', protect, authorize('admin'), async (req, res) => {
  const users = await User.find().select('-password -refreshToken').sort({ createdAt: -1 });
  res.json({ success: true, data: users });
});

adminRouter.patch('/users/:id/toggle', protect, authorize('admin'), async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false });
  user.isActive = !user.isActive;
  await user.save();
  res.json({ success: true, data: user.toPublicJSON() });
});

adminRouter.get('/summary', protect, authorize('admin'), async (req, res) => {
  const [users, alerts, active] = await Promise.all([
    User.countDocuments(),
    EmergencyAlert.countDocuments(),
    EmergencyAlert.countDocuments({ status: { $in: ['ACTIVE', 'RESPONDER_ASSIGNED', 'IN_PROGRESS'] } }),
  ]);
  res.json({ success: true, data: { users, alerts, activeAlerts: active } });
});

// ─── helpline.routes.js ───────────────────────────────────────────────────────
const helplineRouter = express.Router();

const HELPLINES = [
  { id: 1, name: 'Police', number: '100', category: 'police', icon: '👮', description: 'Law enforcement emergency', available: '24/7' },
  { id: 2, name: 'Ambulance', number: '108', category: 'medical', icon: '🚑', description: 'Medical emergency', available: '24/7' },
  { id: 3, name: 'Fire Service', number: '101', category: 'fire', icon: '🚒', description: 'Fire emergency', available: '24/7' },
  { id: 4, name: 'National Emergency', number: '112', category: 'general', icon: '🆘', description: 'Single emergency number', available: '24/7' },
  { id: 5, name: 'Women Helpline', number: '1091', category: 'women_safety', icon: '👩', description: 'Women safety', available: '24/7' },
  { id: 6, name: 'Child Helpline', number: '1098', category: 'child', icon: '👶', description: 'Child protection', available: '24/7' },
  { id: 7, name: 'Disaster Management', number: '1070', category: 'disaster', icon: '🌪️', description: 'Natural disasters', available: '24/7' },
  { id: 8, name: 'Road Accident', number: '1073', category: 'accident', icon: '🚗', description: 'Road accident emergency', available: '24/7' },
];

helplineRouter.get('/', (req, res) => {
  const { category, search } = req.query;
  let data = HELPLINES;
  if (category) data = data.filter(h => h.category === category);
  if (search) data = data.filter(h => h.name.toLowerCase().includes(search.toLowerCase()));
  res.json({ success: true, data });
});

module.exports = {
  userRouter: router,
  contactRouter,
  responderRouter,
  volunteerRouter,
  vehicleRouter,
  locationRouter,
  chatRouter,
  notifRouter,
  analyticsRouter,
  adminRouter,
  helplineRouter,
};
