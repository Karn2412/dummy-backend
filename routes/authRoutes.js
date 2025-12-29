const express = require("express");
const router = express.Router();

const {
  signup,
  verifyOTP,
  forgotPassword,
  resetPassword
} = require("../controllers/authController");
const { login } = require("../controllers/authController");

router.post("/login", login);

router.post("/signup", signup);
router.post("/verify-otp", verifyOTP);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

module.exports = router;
