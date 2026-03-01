const express=require("express");
const { getUndeliveredMessages } = require("../controllers/undeliveredController.js");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// No userId param needed
router.get("/", authMiddleware, getUndeliveredMessages);

module.exports= router;