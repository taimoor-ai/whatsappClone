const Otp = require("../models/Otps");
const User = require("../models/Users");
const bcrypt = require("bcryptjs");
const UndeliveredMessage = require("../models/undeliveredMessage");
const jwt = require("jsonwebtoken");
require("dotenv").config();
function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
const requestOtp = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ error: "Phone is required" });

    // Generate OTP
    const otpPlain = generateOtp(); // e.g. random 6-digit number
    const otpHash = await bcrypt.hash(otpPlain, 10);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Remove any old OTP for this phone
    const existingOtp = await Otp.findOne({ phoneNumber:phone });
    if (existingOtp) {
      await Otp.deleteOne({ _id: existingOtp._id });
    }

    // Save new OTP
    await Otp.create({
      phoneNumber:phone,          // 👈 keep same field name everywhere
      otp:otpHash,        // hashed OTP
      expiresAt,
    });

    // In real apps: send via SMS provider
    console.log(`OTP for ${phone} is ${otpPlain}`);
    
    res.status(200).json({ message: "OTP generated successfully", otp: otpPlain }); // ⚠️ return OTP only for dev
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};


const verifyOtp = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone?.trim() || !otp?.trim()) {
      return res.status(400).json({ error: "Phone & OTP required" });
    }

    const record = await Otp.findOne({ phoneNumber: phone }).sort({ createdAt: -1 });
    if (!record) {
      return res.status(400).json({ error: "No OTP found" });
    }

    if (record.expiresAt < new Date()) {
      return res.status(400).json({ error: "OTP expired" });
    }

    const valid = await bcrypt.compare(otp, record.otp);
    if (!valid) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    // ✅ Remove OTP after success
    await Otp.deleteOne({ _id: record._id });

    // ✅ Find or Create User
    let user = await User.findOne({ phoneNumber: phone });
    if (!user) {
      user = await User.create({
        phoneNumber: phone,
        name: "New User",
      });
    }

    await user.save();

    // ✅ Generate JWT
    const token = jwt.sign(
      { phone: user.phoneNumber, id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    // ✅ Fetch Undelivered Messages for this user
    const undeliveredMessages = await UndeliveredMessage.find({
      receiverId: user._id
    }).sort({ sentAt: 1 }); // sort oldest → newest

    // ✅ OPTIONAL — delete after sending (WhatsApp style)
    await UndeliveredMessage.deleteMany({ receiverId: user._id });

    // ✅ Final Response
    return res.status(200).json({
      jwtToken: token,
      user: {
        id: user._id,
        phone: user.phoneNumber,
        name: user.name,
      },
      undeliveredMessages,
      message: "OTP verified successfully ✅"
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server error" });
  }
};


module.exports = { requestOtp, verifyOtp };
