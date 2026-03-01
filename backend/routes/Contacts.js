const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {Async} =require("../controllers/contactsControllers")

// @desc    Sync contacts
// @route   POST /api/contacts/sync
// @access  Private
router.post("/sync", authMiddleware,
  Async);

module.exports = router;
