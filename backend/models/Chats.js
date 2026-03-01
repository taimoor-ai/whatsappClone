import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["private", "group"],
      required: true
    },

    // ✅ Group name & group avatar (private chat doesn't need this)
    name: { type: String, default: null },
    avatarUrl: { type: String, default: null },

    // ✅ Members list
    members: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true
        },
        role: {
          type: String,
          enum: ["member", "admin"],
          default: "member"
        }
      }
    ],

    // ✅ Who created the chat (group only)
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },

    // ✅ Last message (for fast chat list loading)
    lastMessage: {
      messageId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message",
        default: null
      },
      text: { type: String, default: "" },
      senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      },
      createdAt: { type: Date, default: null }
    }
  },
  { timestamps: true }
);

// ✅ Index for fast chat loading
chatSchema.index({ "members.userId": 1 });

export default mongoose.model("Chat", chatSchema);
