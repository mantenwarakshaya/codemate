require("dotenv").config();
const nodemailer = require("nodemailer");

// Create transporter ONCE (better performance)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ✅ Verification Email
const sendVerificationEmail = async (email, token) => {
  // If BASE_URL is missing, it falls back to localhost for safety during dev
  const domain = process.env.BASE_URL || "http://localhost:5173";
  const link = `${domain}/verify-email?token=${token}`;

  return await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Verify your email",
    html: `<h3>Welcome!</h3>
           <p>Please click the link below to verify your account:</p>
           <a href="${link}" style="background: blue; color: white; padding: 10px;">Verify Email</a>`,
  });
};

// ✅ General Email (used in cron)
const sendEmail = async (to, subject, text) => {
  return await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
  });
};

module.exports = { sendVerificationEmail, sendEmail };