const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    message_id: {
      type: String,
      required: true,
      unique: true,
    },

    // 🔹 Who sent the message
    sender_id: {
      type: String,
      required: true,
    },
    sender_phone: {
      type: String,
      required: true,
    },

    // 🔹 Who receives the message
    receiver_id: {
      type: String,
      required: false, // optional for groups or broadcast
    },
    receiver_phone: {
      type: String,
      required: false,
    },

    content: {
      type: String,
      default: "",
    },

    message_type: {
      type: String,
      enum: ["text", "image", "video", "audio", "file", "system"],
      default: "text",
    },

    sent_at: {
      type: Number, // timestamp (ms)
      required: true,
    },

    status: {
      type: String,
      enum: ["sent", "delivered", "read", "failed"],
      default: "sent",
    },

    reply_to: {
      type: String, // message_id of parent
      default: null,
    },

    media_url: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports= mongoose.model("Message", messageSchema);
