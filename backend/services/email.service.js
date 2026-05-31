const nodemailer = require('nodemailer');

const createTransporter = () => nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

const sendEmail = async ({ to, subject, html }) => {
  const transporter = createTransporter();
  return transporter.sendMail({
    from: process.env.EMAIL_FROM || 'SERCP <noreply@sercp.com>',
    to,
    subject,
    html,
  });
};

exports.sendSOSConfirmation = async (user, alert) => {
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,0.1)">
      <div style="background:#dc2626;padding:24px;text-align:center">
        <h1 style="color:#fff;margin:0;font-size:24px">🚨 SOS Alert Activated</h1>
      </div>
      <div style="padding:24px">
        <p style="font-size:16px">Dear <strong>${user.name}</strong>,</p>
        <p>Your SOS alert has been successfully activated. Help is on the way.</p>
        <div style="background:#fef2f2;border-left:4px solid #dc2626;padding:16px;margin:16px 0">
          <p style="margin:0 0 8px"><strong>Alert ID:</strong> ${alert.alertId}</p>
          <p style="margin:0 0 8px"><strong>Type:</strong> ${alert.type.replace('_', ' ').toUpperCase()}</p>
          <p style="margin:0 0 8px"><strong>Severity:</strong> ${alert.severity}</p>
          <p style="margin:0"><strong>Location:</strong> ${alert.address}</p>
        </div>
        <p>Emergency responders have been notified and will reach you shortly.</p>
        <p style="color:#666;font-size:12px;margin-top:24px">This is an automated message from SERCP Emergency Response System.</p>
      </div>
    </div>`;
  try {
    await sendEmail({ to: user.email, subject: '🚨 SERCP - Your SOS Alert is Active', html });
  } catch (err) {
    console.error('Email send error:', err.message);
  }
};

exports.sendResponderNotification = async (responder, alert) => {
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
      <div style="background:#1d4ed8;padding:24px;text-align:center">
        <h1 style="color:#fff;margin:0">New Emergency Assignment</h1>
      </div>
      <div style="padding:24px">
        <p>Dear <strong>${responder.name}</strong>,</p>
        <p>You have been assigned to an emergency alert.</p>
        <div style="background:#eff6ff;border-left:4px solid #1d4ed8;padding:16px">
          <p><strong>Alert ID:</strong> ${alert.alertId}</p>
          <p><strong>Type:</strong> ${alert.type}</p>
          <p><strong>Severity:</strong> ${alert.severity}</p>
          <p><strong>Location:</strong> ${alert.address}</p>
        </div>
      </div>
    </div>`;
  try {
    await sendEmail({ to: responder.email, subject: '⚡ SERCP - New Emergency Assignment', html });
  } catch (err) {
    console.error('Email send error:', err.message);
  }
};

exports.sendWelcomeEmail = async (user) => {
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
      <div style="background:#1d4ed8;padding:24px;text-align:center">
        <h1 style="color:#fff">Welcome to SERCP! 🚨</h1>
      </div>
      <div style="padding:24px">
        <p>Dear <strong>${user.name}</strong>, welcome to the Smart Emergency Response Coordination Platform.</p>
        <p>You now have access to instant emergency assistance, 24/7 support, and a network of trained responders.</p>
      </div>
    </div>`;
  try {
    await sendEmail({ to: user.email, subject: 'Welcome to SERCP - Smart Emergency Response Coordination Platform', html });
  } catch (err) {
    console.error('Welcome email error:', err.message);
  }
};
