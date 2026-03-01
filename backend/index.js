const express = require("express");
const app = express();
const http = require("http");
const jwt = require("jsonwebtoken");
const { Server } = require("socket.io");
const { connectDB } = require("./db.js");
const server = http.createServer(app);
const { registerSocketHandlers } = require("./sockets/socketHandlers.js");
const dotenv = require("dotenv");
const UndeliveredMessage = require("./models/undeliveredMessage.js");
const authRoutes = require("./routes/authRoutes.js");
const undeliveredRoutes = require("./routes/undeliveredRoutes.js")
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

io.on("connection",async  (socket) => {
  console.log("New socket connected:", socket.id);
  registerSocketHandlers(io, socket);

 
  socket.emit("bind_number", { token: socket.handshake.auth?.token });
   const undelivered = await UndeliveredMessage.find({
    receiverId: socket.user.id
  }).sort({ sentAt: 1 });
   console.log("Undelivered : ",undelivered);
  // ✅ Send them to client
  socket.emit("undelivered-messages", undelivered);

  // ✅ Delete after sending (WhatsApp behavior)
  await UndeliveredMessage.deleteMany({ receiverId: socket.user.id });
});

server.listen(3000, () => {
  console.log("server is running on port 3000");
});
