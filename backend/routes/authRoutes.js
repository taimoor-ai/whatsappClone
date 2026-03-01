const {verifyOtp, requestOtp} = require('../controllers/authControllers');
const express = require('express');
const router = express.Router();    


router.post('/send-otp', requestOtp);
router.post('/verify-otp', verifyOtp);
module.exports = router;