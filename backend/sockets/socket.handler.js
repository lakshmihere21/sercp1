const jwt = require('jsonwebtoken');
const User = require('../models/User.model');
const EmergencyAlert = require('../models/EmergencyAlert.model');
const { LocationHistory, Responder, ChatMessage } = require('../models/index');

// Store active socket connections: userId -> socketId
const activeUsers = new Map();

module.exports = (io) => {
  // ─── Auth Middleware ────────────────────────────────────────────────────────
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
      if (!token) return next(new Error('Authentication required'));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      if (!user) return next(new Error('User not found'));

      socket.user = user;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', async (socket) => {
    const user = socket.user;
    console.log(`🔌 Connected: ${user.name} (${user.role}) - ${socket.id}`);

    // Store connection
    activeUsers.set(user._id.toString(), socket.id);

    // Join personal room
    socket.join(`user_${user._id}`);

    // Join role-based room
    socket.join(`role_${user.role}`);

    // Admins join admin room
    if (user.role === 'admin') socket.join('admin_room');

    // Broadcast online count
    io.emit('ONLINE_COUNT', { count: activeUsers.size });

    // ─── Join Alert Room ──────────────────────────────────────────────────────
    socket.on('JOIN_ALERT_ROOM', ({ alertId }) => {
      socket.join(`alert_${alertId}`);
      console.log(`${user.name} joined alert room: ${alertId}`);
    });

    socket.on('LEAVE_ALERT_ROOM', ({ alertId }) => {
      socket.leave(`alert_${alertId}`);
    });

    // ─── Live Location Update ─────────────────────────────────────────────────
    socket.on('LOCATION_UPDATE', async ({ latitude, longitude, alertId, accuracy, speed }) => {
      try {
        // Update user location in DB
        await User.findByIdAndUpdate(user._id, {
          location: { type: 'Point', coordinates: [longitude, latitude] },
        });

        // Update responder location if applicable
        if (user.role === 'responder') {
          await Responder.findOneAndUpdate({ user: user._id }, {
            location: { type: 'Point', coordinates: [longitude, latitude] },
          });
        }

        // Store in history if emergency active
        if (alertId) {
          await LocationHistory.create({
            user: user._id,
            alert: alertId,
            location: { type: 'Point', coordinates: [longitude, latitude] },
            accuracy,
            speed,
          });
        }

        // Broadcast to alert room
        if (alertId) {
          io.to(`alert_${alertId}`).emit('LOCATION_UPDATE', {
            userId: user._id,
            name: user.name,
            role: user.role,
            latitude,
            longitude,
            timestamp: new Date(),
          });
        }

        // Broadcast to admin
        io.to('admin_room').emit('TRACK_USER', {
          userId: user._id,
          name: user.name,
          role: user.role,
          latitude,
          longitude,
        });
      } catch (err) {
        console.error('Location update error:', err.message);
      }
    });

    // ─── Track Responder ──────────────────────────────────────────────────────
    socket.on('TRACK_RESPONDER', ({ responderId }) => {
      socket.join(`track_responder_${responderId}`);
    });

    socket.on('STOP_TRACKING', ({ responderId }) => {
      socket.leave(`track_responder_${responderId}`);
    });

    // ─── Responder Accept/Decline ─────────────────────────────────────────────
    socket.on('RESPONDER_ACCEPT', async ({ alertId }) => {
      try {
        const alert = await EmergencyAlert.findById(alertId);
        if (!alert) return;

        io.to(`user_${alert.citizen}`).emit('RESPONDER_ACCEPTED', {
          responderId: user._id,
          responderName: user.name,
          alertId,
        });

        io.to('admin_room').emit('RESPONDER_ACCEPTED', { alertId, responder: user });
      } catch (err) {
        console.error(err);
      }
    });

    // ─── Chat System ──────────────────────────────────────────────────────────
    socket.on('SEND_MESSAGE', async ({ alertId, message, type, imageUrl }) => {
      try {
        const chatMsg = await ChatMessage.create({
          alert: alertId,
          sender: user._id,
          senderName: user.name,
          senderRole: user.role,
          message,
          type: type || 'text',
          imageUrl,
        });

        io.to(`alert_${alertId}`).emit('NEW_MESSAGE', {
          ...chatMsg.toObject(),
          timestamp: chatMsg.createdAt,
        });
      } catch (err) {
        console.error('Chat error:', err.message);
      }
    });

    socket.on('TYPING', ({ alertId, isTyping }) => {
      socket.to(`alert_${alertId}`).emit('USER_TYPING', {
        userId: user._id,
        name: user.name,
        isTyping,
      });
    });

    socket.on('MESSAGE_READ', async ({ messageId }) => {
      try {
        await ChatMessage.findByIdAndUpdate(messageId, {
          $addToSet: { readBy: user._id },
        });
        socket.broadcast.emit('MESSAGE_READ_CONFIRM', { messageId, readBy: user._id });
      } catch (err) {
        console.error(err);
      }
    });

    // ─── Emergency Status Update ──────────────────────────────────────────────
    socket.on('STATUS_UPDATE', async ({ alertId, status, description }) => {
      try {
        const alert = await EmergencyAlert.findById(alertId);
        if (!alert) return;

        alert.status = status;
        alert.timeline.push({
          event: `STATUS_CHANGED_TO_${status}`,
          description: description || `Status: ${status}`,
          actor: user._id,
          actorName: user.name,
        });
        if (status === 'RESOLVED') alert.resolvedAt = new Date();
        await alert.save();

        io.emit('ALERT_STATUS_UPDATED', { alertId, status, updatedBy: user.name });
        io.to(`alert_${alertId}`).emit('STATUS_UPDATE', { status, description, updatedBy: user.name });
      } catch (err) {
        console.error(err);
      }
    });

    // ─── Admin Broadcast ──────────────────────────────────────────────────────
    socket.on('ADMIN_BROADCAST', ({ message, type }) => {
      if (user.role !== 'admin') return;
      io.emit('SYSTEM_BROADCAST', { message, type, from: 'Admin' });
    });

    // ─── Responder Status Update ──────────────────────────────────────────────
    socket.on('RESPONDER_STATUS', async ({ availability }) => {
      try {
        await Responder.findOneAndUpdate({ user: user._id }, { availability });
        io.to('admin_room').emit('RESPONDER_STATUS_UPDATED', {
          responderId: user._id,
          name: user.name,
          availability,
        });
      } catch (err) {
        console.error(err);
      }
    });

    // ─── Disconnect ───────────────────────────────────────────────────────────
    socket.on('disconnect', () => {
      activeUsers.delete(user._id.toString());
      io.emit('ONLINE_COUNT', { count: activeUsers.size });
      io.to('admin_room').emit('USER_OFFLINE', { userId: user._id, name: user.name });
      console.log(`⚡ Disconnected: ${user.name}`);
    });
  });
};
