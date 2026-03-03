const  mongoose = require("mongoose");

const undeliveredMessageSchema = new mongoose.Schema(
  {
    // ✅ Sender Information
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    senderNumber: {
      type: String,
      required: true
    },
    // ✅ Receiver Information
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    receiverNumber: {
      type: String,
      required: true
    },
    // ✅ Content of the message
    content: {
      type: String,
      required: true
    },
    // ✅ Message type (optional but useful)
    messageType: {
      type: String,
      enum: ["text", "image", "video", "audio", "file"],
      default: "text"
    },
    // ✅ Date when message was created
    sentAt: {
      type: Date,
      default: Date.now
    },
    // ✅ Delivery status (can help track)
    status: {
      type: String,
      enum: ["pending", "delivered"],
      default: "pending"
    },
    mediaUrl: {
      type: String,
      default: null
    }
  },
  { timestamps: true }
);

// ✅ Index to quickly find messages for an offline user
undeliveredMessageSchema.index({ receiverId: 1 });

module.exports= mongoose.model("UndeliveredMessage", undeliveredMessageSchema);
