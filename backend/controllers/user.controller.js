const User = require('../models/User.model');
const { successResponse, errorResponse } = require('../utils/helpers');

// @desc    Get user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    successResponse(res, user.toPublicJSON());
  } catch { errorResponse(res, 'Failed to get profile'); }
};

// @desc    Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const allowed = ['name', 'phone', 'address', 'bloodGroup', 'medicalConditions', 'customEmergencyMessage'];
    const updates = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    successResponse(res, user.toPublicJSON(), 'Profile updated');
  } catch (err) { errorResponse(res, err.message); }
};

// @desc    Update user location
exports.updateLocation = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    await User.findByIdAndUpdate(req.user._id, {
      location: { type: 'Point', coordinates: [longitude, latitude] },
    });
    successResponse(res, null, 'Location updated');
  } catch { errorResponse(res, 'Location update failed'); }
};

// @desc    Change password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    if (!(await user.comparePassword(currentPassword))) {
      return errorResponse(res, 'Current password is incorrect', 401);
    }
    user.password = newPassword;
    await user.save();
    successResponse(res, null, 'Password changed successfully');
  } catch { errorResponse(res, 'Password change failed'); }
};

// @desc    Upload avatar
exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) return errorResponse(res, 'No file uploaded', 400);
    const avatarUrl = `/uploads/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(req.user._id, { avatar: avatarUrl }, { new: true });
    successResponse(res, { avatar: avatarUrl }, 'Avatar uploaded');
  } catch { errorResponse(res, 'Avatar upload failed'); }
};
