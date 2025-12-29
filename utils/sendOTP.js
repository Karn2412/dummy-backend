const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendOTP = async (email, otp) => {
  await resend.emails.send({
    from: process.env.FROM_EMAIL,
    to: email,
    subject: "Your OTP Code",
    html: `
      <div style="font-family: Arial">
        <h2>Your OTP Code</h2>
        <p>Your OTP is:</p>
        <h1>${otp}</h1>
        <p>This OTP expires in 5 minutes.</p>
      </div>
    `,
  });

  console.log("OTP sent to real email:", email);

  //
};//


module.exports = sendOTP;
