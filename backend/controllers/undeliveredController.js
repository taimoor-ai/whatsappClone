const UndeliveredMessage =require("../models/undeliveredMessage.js");

const getUndeliveredMessages = async (req, res) => {
  try {
    const userId = req.user.id; // ✅ from auth middleware

    const messages = await UndeliveredMessage.find({
      receiver: userId,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: messages.length,
      messages,
    });

  } catch (error) {
    console.error("Error fetching undelivered messages:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = { getUndeliveredMessages };