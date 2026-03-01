const  mongoose =require("mongoose");

const userSchema = new mongoose.Schema(
  {
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      default: "",
    },
    profilePic: {
      type: String,
      default: "",
    },
     socketId: { type: String, default: null },
    about: {
      type: String,
      default: "Hey there! I am using WhatsApp.",
    },
    lastSeen: {
      type: Date,
      default: Date.now,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);


module.exports=mongoose.model("User", userSchema);
