const sendOTP = require("../utils/sendOTP");

exports.sendContactMail = async (req, res) => {
  const { name, email, message } = req.body;

  await sendOTP(
    "eldhoraj33@gmail.com",
    `From: ${name} (${email})\n\n${message}`
  );

  res.json({ message: "Message sent successfully" });
};
