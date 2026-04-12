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
  const link = `${process.env.BASE_URL}/verify-email?token=${token}`;
  return await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Verify your email",
    html: `<h3>Click below to verify your email:</h3>
           <a href="${link}">Verify Email</a>`,
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