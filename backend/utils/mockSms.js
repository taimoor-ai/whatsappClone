function sendSMS({ to, message }) {
  console.log(`📩 Mock SMS to ${to}: ${message}`);
  return { status: "success", id: Date.now() };
}

module.exports = { sendSMS };
