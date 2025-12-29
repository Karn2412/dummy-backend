const User = require("../models/User");
const bcrypt = require("bcryptjs");
const sendOTP = require("../utils/sendOTP");
const jwt = require("jsonwebtoken");

// Generate OTP
const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// ================= SIGNUP =================
exports.signup = async (req, res) => {
  const { email, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);
  const otp = generateOTP();

  await User.findOneAndUpdate(
    { email },
    {
      email,
      password: hashedPassword,
      otp,
      otpExpires: Date.now() + 5 * 60 * 1000,
      isVerified: false
    },
    { upsert: true, new: true }
  );

  await sendOTP(email, otp);
  res.json({ message: "OTP sent to email" });
};

// ================= VERIFY OTP =================
exports.verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  const user = await User.findOne({ email });

  if (!user || user.otp !== otp || user.otpExpires < Date.now()) {
    return res.status(400).json({ message: "Invalid or expired OTP" });
  }

  // Check if user was already verified before OTP
  const wasAlreadyVerified = user.isVerified;

  user.isVerified = true;
  user.otp = null;
  user.otpExpires = null;
  await user.save();

  const token = jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.json({
    message: "OTP verified",
    token,
    user: {
      id: user._id,
      email: user.email
    },
    nextStep: wasAlreadyVerified ? "reset-password" : "signin"
  });
};

// ================= FORGOT PASSWORD =================
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });

  const otp = generateOTP();

  user.otp = otp;
  user.otpExpires = Date.now() + 5 * 60 * 1000;
  await user.save();

  await sendOTP(email, otp);
  res.json({ message: "OTP sent to email" });
};

// ================= RESET PASSWORD =================
exports.resetPassword = async (req, res) => {
  const { email, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  await User.findOneAndUpdate(
    { email },
    { password: hashedPassword }
  );

  res.json({ message: "Password updated successfully" });
};
// ================= LOGIN =================
exports.login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user)
    return res.status(404).json({ message: "User not found" });

  if (!user.isVerified)
    return res.status(401).json({ message: "Account not verified" });

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch)
    return res.status(401).json({ message: "Invalid credentials" });

  const token = jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.json({
    message: "Login successful",
    token,
    user: { id: user._id, email: user.email }
  });
};
