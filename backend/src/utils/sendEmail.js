const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, html) => {

  const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com", // 👈 Explicitly add the host
    port: 465,              // 👈 Use the secure port matching your error log
    secure: true,
    localAddress: "0.0.0.0", // 👈 FORCE IPv4 ONLY (This bypasses Render's IPv6 bug)
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"CodeMate" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
};

module.exports = sendEmail;