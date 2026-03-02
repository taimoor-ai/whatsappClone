// socketHandlers.js
const jwt = require("jsonwebtoken");
const User = require("../models/Users");
const OTP = require("../models/Otps");
const { sendSMS } = require("../utils/mockSms");
const { sanitizeFilter } = require("mongoose");

 const UndeliveredMessage = require("../models/undeliveredMessage");
console.log(OTP);
const registerSocketHandlers = (io, socket) => {
  // 📌 Login Event
    console.log('i am call')
  // socket.on("request_otp", async ({ phone }) => {
  //   try {
  //     // Generate OTP
  //     const otp = Math.floor(100000 + Math.random() * 900000).toString();

  //     // Save to DB (replace old OTP for the same phone)
  //     await OTP.findOneAndUpdate(
  //       { phoneNumber: phone },
  //       { otp, createdAt: new Date() },
  //       { upsert: true, new: true }
  //     );
  //     console.log(phone);
  //     console.log(otp);
  //     sendSMS({ to: phone, message: otp });

  //     // console.log(`📲 OTP for ${phone}: ${otp}`);

  //     // Emit back
  //     socket.emit("otp_sent", {
  //       phone,
  //       message: "OTP sent successfully!",
  //     });

  //     // In real app: call SMS API here to send OTP
  //   } catch (err) {
  //     console.error("❌ Error saving OTP:", err);
  //     socket.emit("error", { message: "Failed to generate OTP" });
  //   }
  // });

  // socket.on("verify_otp", async ({ phone, otp, name }) => {
  //   try {
  //     // Check OTP in DB
  //     const otpDoc = await OTP.findOne({ phoneNumber: phone, otp });
  //     if (!otpDoc) {
  //       return socket.emit("login_error", { error: "Invalid or expired OTP" });
  //     }

  //     // OTP verified → delete from DB
  //     await OTP.deleteMany({ phoneNumber: phone });

  //     // Create user if not exists
  //     let user = await User.findOne({ phoneNumber: phone });
  //     if (!user) {
  //       user = await User.create({
  //         phoneNumber: phone,
  //         name: name || "New User",
  //       });
  //     }

  //     // Bind phone with socket.id
  //     user.socketId = socket.id;
  //     await user.save();

  //     // Generate JWT
  //     const token = jwt.sign(
  //       { phone: user.phoneNumber, id: user._id },
  //       process.env.JWT_SECRET,
  //       {
  //         expiresIn: "7d",
  //       }
  //     );

  //     socket.emit("login_success", {
  //       token,
  //       user: { id: user._id, phone: user.phone, name: user.name },
  //     });

  //     console.log(`✅ ${phone} logged in successfully`);
  //   } catch (error) {
  //     console.error("❌ OTP Verification Error:", error);
  //     socket.emit("login_error", { error: "Something went wrong" });
  //   }
  // });




  // ✅ Bind Number from Token (next time user connects)
  socket.on("bind_number", async ({ token }) => {
    try {
      console.log(process.env.JWT_SECRET);
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);

      if (!user) {
        return socket.emit("auth_error", { error: "User not found" });
      }

      // Bind phone with this socket
      user.socketId = socket.id;
      socket.phone = user.phoneNumber;
      await user.save();

      socket.emit("bind_success", {
        message: "Phone number bound successfully",
        phone: user.phoneNumber,
        name: user.name,
      });

      console.log(`🔗 ${user.phoneNumber} bound to socket ${socket.id}`);
    } catch (err) {
      console.error("❌ Bind error:", err);
      socket.emit("auth_error", { error: "Invalid or expired token" });
    }
  });
  


socket.on("send-message", async (data) => {
  const {
    token,
    recieverId,
    content,
    messageType = "text",
  } = data;
  console.log("data", data);
 const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const senderId = decoded.id;
  const senderNumber = decoded.phone;
  console.log("reciverID",recieverId)
  const recieverUser = await User.findById(recieverId);
  const  receiverNumber =recieverUser.phoneNumber;
  const receiverSocketId = recieverUser ? recieverUser.socketId : null;

  if (receiverSocketId) {
    // Receiver ONLINE → send instantly
    io.to(receiverSocketId).emit("receive-message", {
      senderId,
      senderNumber,
      content,
      messageType,
      receiverId: recieverId,
      receiverNumber,
      sentAt: new Date(),
    });

    console.log(`Message delivered to ${receiverNumber}`);

  } else {
    // Receiver OFFLINE → save to DB
    const message = await UndeliveredMessage.create({
      senderId,
      senderNumber,
      receiverId:recieverUser._id,
      receiverNumber,
      content,
      messageType,
    });

    console.log(`Saved Undelivered Message for ${receiverNumber}:`, message);
  }
});

};

module.exports = { registerSocketHandlers }; 
