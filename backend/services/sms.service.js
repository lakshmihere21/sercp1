// Twilio SMS Service — set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE in .env

let twilioClient = null;

const getClient = () => {
  if (!twilioClient && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    const twilio = require('twilio');
    twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  }
  return twilioClient;
};

const sendSMS = async (to, body) => {
  const client = getClient();
  if (!client) {
    console.log('[SMS DISABLED] Would send to:', to, '| Message:', body);
    return null;
  }
  try {
    const msg = await client.messages.create({
      body,
      from: process.env.TWILIO_PHONE,
      to,
    });
    console.log('SMS sent:', msg.sid);
    return msg;
  } catch (err) {
    console.error('SMS error:', err.message);
    return null;
  }
};

exports.sendSOSAlertSMS = async (phone, citizenName, alertType, trackingUrl) => {
  const body = `🚨 SERCP EMERGENCY ALERT\n${citizenName} needs help!\nType: ${alertType.toUpperCase()}\nTrack: ${trackingUrl}\nCall 112 if urgent.`;
  return sendSMS(phone, body);
};

exports.sendResponderAlertSMS = async (phone, responderName, alertType, address) => {
  const body = `⚡ SERCP DISPATCH\nHello ${responderName},\nNew ${alertType.toUpperCase()} emergency at ${address}.\nPlease respond immediately.`;
  return sendSMS(phone, body);
};

exports.sendStatusUpdateSMS = async (phone, status, alertId) => {
  const messages = {
    RESPONDER_ASSIGNED: `✅ A responder has been assigned to your emergency (${alertId}). Help is on the way!`,
    ARRIVED: `🛡️ Responder has arrived at your location (${alertId}).`,
    RESOLVED: `✅ Your emergency (${alertId}) has been resolved. Stay safe!`,
  };
  const body = messages[status] || `Emergency ${alertId} status: ${status}`;
  return sendSMS(phone, body);
};
