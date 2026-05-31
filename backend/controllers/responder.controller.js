const { Responder } = require('../models/index');
const User = require('../models/User.model');
const { successResponse, errorResponse } = require('../utils/helpers');

// @desc    Get all responders
exports.getAll = async (req, res) => {
  try {
    const responders = await Responder.find()
      .populate('user', 'name phone email avatar')
      .populate('vehicle')
      .sort({ createdAt: -1 });
    successResponse(res, responders);
  } catch { errorResponse(res, 'Failed to fetch responders'); }
};

// @desc    Get available responders
exports.getAvailable = async (req, res) => {
  try {
    const responders = await Responder.find({ availability: 'available' })
      .populate('user', 'name phone email');
    successResponse(res, responders);
  } catch { errorResponse(res, 'Failed to fetch available responders'); }
};

// @desc    Register as responder
exports.register = async (req, res) => {
  try {
    const exists = await Responder.findOne({ user: req.user._id });
    if (exists) return errorResponse(res, 'Already registered as responder', 400);

    const responder = await Responder.create({ user: req.user._id, ...req.body });
    await User.findByIdAndUpdate(req.user._id, { role: 'responder' });
    successResponse(res, responder, 'Registered as responder', 201);
  } catch (err) { errorResponse(res, err.message); }
};

// @desc    Get responder profile
exports.getMyProfile = async (req, res) => {
  try {
    const responder = await Responder.findOne({ user: req.user._id })
      .populate('user', 'name phone email avatar')
      .populate('vehicle');
    if (!responder) return errorResponse(res, 'Responder profile not found', 404);
    successResponse(res, responder);
  } catch { errorResponse(res, 'Failed to fetch responder profile'); }
};

// @desc    Update availability status
exports.updateStatus = async (req, res) => {
  try {
    const { availability } = req.body;
    const responder = await Responder.findOneAndUpdate(
      { user: req.user._id },
      { availability },
      { new: true }
    );
    successResponse(res, responder, 'Status updated');
  } catch { errorResponse(res, 'Status update failed'); }
};

// @desc    Get nearby responders for an alert
exports.getNearby = async (req, res) => {
  try {
    const { lat, lng, radius = 20 } = req.query;
    if (!lat || !lng) return errorResponse(res, 'Coordinates required', 400);

    const responders = await Responder.find({
      availability: 'available',
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: radius * 1000,
        },
      },
    }).populate('user', 'name phone email').limit(10);

    successResponse(res, responders);
  } catch { errorResponse(res, 'Failed to fetch nearby responders'); }
};
