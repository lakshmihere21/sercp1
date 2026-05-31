const { Notification } = require('../models/index');
const { successResponse, errorResponse } = require('../utils/helpers');

// @desc    Get all notifications for current user
exports.getAll = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .populate('relatedAlert', 'type status alertId')
      .sort({ createdAt: -1 })
      .limit(50);
    const unreadCount = await Notification.countDocuments({ recipient: req.user._id, isRead: false });
    successResponse(res, { notifications, unreadCount });
  } catch { errorResponse(res, 'Failed to fetch notifications'); }
};

// @desc    Mark single notification as read
exports.markRead = async (req, res) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { isRead: true }
    );
    successResponse(res, null, 'Marked as read');
  } catch { errorResponse(res, 'Failed to mark notification'); }
};

// @desc    Mark all as read
exports.markAllRead = async (req, res) => {
  try {
    await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true });
    successResponse(res, null, 'All notifications marked as read');
  } catch { errorResponse(res, 'Failed to mark all notifications'); }
};

// @desc    Delete a notification
exports.deleteOne = async (req, res) => {
  try {
    await Notification.findOneAndDelete({ _id: req.params.id, recipient: req.user._id });
    successResponse(res, null, 'Notification deleted');
  } catch { errorResponse(res, 'Delete failed'); }
};

// @desc    Create notification (internal helper)
exports.createNotification = async ({ recipient, title, message, type, relatedAlert, data }) => {
  try {
    return await Notification.create({ recipient, title, message, type, relatedAlert, data });
  } catch (err) {
    console.error('Notification create error:', err.message);
  }
};
