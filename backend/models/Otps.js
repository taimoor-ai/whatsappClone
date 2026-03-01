const  mongoose =require("mongoose");

const otpSchema = new mongoose.Schema(
  {
    phoneNumber: {
      type: String,
      required: true,
    },
    otp: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

// auto delete OTPs after expiry using TTL index
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
module.exports=mongoose.model("Otp",otpSchema)

