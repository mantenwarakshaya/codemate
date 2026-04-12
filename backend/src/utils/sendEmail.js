require("dotenv").config();
const nodemailer = require("nodemailer");

// Create transporter ONCE
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ✅ Verification Email
const sendVerificationEmail = async (email, token) => {
  const domain =
    process.env.BASE_URL || "http://localhost:5173";

  const link = `${domain}/verify-email?token=${token}`;

  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Verify your email",
      html: `
        <h3>Welcome!</h3>
        <p>Please click below to verify:</p>
        <a href="${link}" style="padding:10px;background:blue;color:white;">
          Verify Email
        </a>
      `,
    });

    console.log("📩 Email sent:", info.response);
    return info;
  } catch (err) {
    console.error("❌ EMAIL SEND FAILED:", err);
    throw err;
  }
};

// ✅ General Email
const sendEmail = async (to, subject, text) => {
  return await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
  });
};

module.exports = { sendVerificationEmail, sendEmail };