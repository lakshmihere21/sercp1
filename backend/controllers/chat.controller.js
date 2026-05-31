const { ChatMessage } = require('../models/index');
const { successResponse, errorResponse } = require('../utils/helpers');

// @desc    Get messages for an alert
exports.getMessages = async (req, res) => {
  try {
    const messages = await ChatMessage.find({ alert: req.params.alertId })
      .populate('sender', 'name avatar role')
      .sort({ createdAt: 1 })
      .limit(200);
    successResponse(res, messages);
  } catch { errorResponse(res, 'Failed to fetch messages'); }
};

// @desc    Send message via REST (fallback when socket not available)
exports.sendMessage = async (req, res) => {
  try {
    const { message, type, imageUrl } = req.body;
    const msg = await ChatMessage.create({
      alert: req.params.alertId,
      sender: req.user._id,
      senderName: req.user.name,
      senderRole: req.user.role,
      message,
      type: type || 'text',
      imageUrl,
    });

    const io = req.app.get('io');
    io.to(`alert_${req.params.alertId}`).emit('NEW_MESSAGE', msg);

    successResponse(res, msg, 'Message sent', 201);
  } catch { errorResponse(res, 'Failed to send message'); }
};

// @desc    Mark message as read
exports.markRead = async (req, res) => {
  try {
    await ChatMessage.findByIdAndUpdate(req.params.messageId, {
      $addToSet: { readBy: req.user._id },
    });
    successResponse(res, null, 'Marked as read');
  } catch { errorResponse(res, 'Failed to mark as read'); }
};

// @desc    Delete message (sender only)
exports.deleteMessage = async (req, res) => {
  try {
    const msg = await ChatMessage.findOne({ _id: req.params.messageId, sender: req.user._id });
    if (!msg) return errorResponse(res, 'Message not found or not authorized', 404);
    await msg.deleteOne();
    successResponse(res, null, 'Message deleted');
  } catch { errorResponse(res, 'Failed to delete message'); }
};
