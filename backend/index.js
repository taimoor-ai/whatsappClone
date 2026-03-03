const express = require("express");
const app = express();
const http = require("http");
const jwt = require("jsonwebtoken");
const { Server } = require("socket.io");
const { connectDB } = require("./db.js");
const User = require("./models/Users.js");
const server = http.createServer(app);
const { registerSocketHandlers } = require("./sockets/socketHandlers.js");
const dotenv = require("dotenv");
const UndeliveredMessage = require("./models/undeliveredMessage.js");
const authRoutes = require("./routes/authRoutes.js");
const undeliveredRoutes = require("./routes/undeliveredRoutes.js");
// Middleware

dotenv.config();
connectDB();
app.use(express.json());

const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins for now
    methods: ["GET", "POST"],
  },
});

const multer = require("multer");
const multerS3 = require("multer-s3");
const s3 = require("./config/s3.js");

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: "teymur-chat-images",
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (req, file, cb) {
      console.log("i am call");
      cb(null, `chat-images/${Date.now()}-${file.originalname}`);
    },
  }),
});

app.post("/api/upload", upload.single("image"), (req, res) => {
  console.log("i am called bro ther")
  res.json({
    imageUrl: req.file.location, // S3 URL
  });
});

app.use((req, res, next) => {
  console.log("HTTP Request:", req.method, req.url);
  next();
});
// Routes
app.use("/api/auth", authRoutes); // Auth routes
app.use("/api/contacts", require("./routes/Contacts"));
app.use("/api/undelivered", undeliveredRoutes);
// register all events for this socket
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  console.log("🔐 Checking auth for:", socket.id);

  if (!token) {
    console.log("❌ No token provided");
    return next(new Error("Unauthorized"));
  }

  try {

    // ✅ Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user info to the socket
    socket.user = decoded;
    console.log("✅ Token valid for user:", decoded);

    next(); // Allow connection
  } catch (err) {
    console.log("❌ Invalid or expired token:", err.message);
    next(new Error("Unauthorized"));
  }
});
const onlineUsers = {}; // in-memory object

io.on("connection", async (socket) => {
  console.log("New socket connected:", socket.id);
  registerSocketHandlers(io, socket);
  onlineUsers[socket.user.id] = socket.id;
  console.log("Online USERS : ", onlineUsers);
 socket.on("typing", ({ recieverId }) => {
  console.log(
    "Typing event received from",
    socket.user.phone,
    "to",
    recieverId
  );

  const receiverSocketId = onlineUsers[recieverId];

  if (receiverSocketId) {
    io.to(receiverSocketId).emit("user-typing", {
      senderId: socket.user.id,     // 🔥 IMPORTANT
      phoneNumber: socket.user.phone, // optional
    });
  }else{
    console.log("the typing event is delivered to user ");
  }
});

socket.on("stop-typing", ({ recieverId }) => {
  console.log(
    "Stop typing event received from",
    socket.user.phone,
    "to",
    recieverId
  );

  const receiverSocketId = onlineUsers[recieverId];

  if (receiverSocketId) {
    io.to(receiverSocketId).emit("user-stop-typing", {
      senderId: socket.user.id,  // 🔥 IMPORTANT
    });
  }else{
    console.log("the stop typing event is delivered to user ");
  }
});
  socket.emit("bind_number", { token: socket.handshake.auth?.token });
  const undelivered = await UndeliveredMessage.find({
    receiverId: socket.user.id,
  }).sort({ sentAt: 1 });

  // When socket disconnects
  socket.on("disconnect", async () => {
    try {
      delete onlineUsers[socket.user.id];
      console.log("Online USERS : ", onlineUsers);
      console.log(`❌ Socket ${socket.id} disconnected`);

      // Find the user that was bound to this socket
      const user = await User.findOne({ socketId: socket.id });

      if (user) {
        // Clear socketId (unbind phone from socket)
        user.socketId = null;
        await user.save();

        console.log(`🔓 Cleared socket binding for ${user.phoneNumber}`);
      }
    } catch (err) {
      console.error("❌ Error clearing socket binding:", err);
    }
  });
  console.log("Undelivered : ", undelivered);
  // ✅ Send them to client
  socket.emit("undelivered-messages", undelivered);

  // ✅ Delete after sending (WhatsApp behavior)
  await UndeliveredMessage.deleteMany({ receiverId: socket.user.id });
});

server.listen(3000, () => {
  console.log("server is running on port 3000");
});
