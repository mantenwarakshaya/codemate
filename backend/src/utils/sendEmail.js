// require("dotenv").config();
// const nodemailer = require("nodemailer");

// // Create transporter ONCE
// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// });

// // ✅ Verification Email
// const sendVerificationEmail = async (email, token) => {
//   const domain =
//     process.env.BASE_URL || "http://localhost:5173";

//   const link = `${domain}/verify-email?token=${token}`;

//   try {
//     const info = await transporter.sendMail({
//       from: process.env.EMAIL_USER,
//       to: email,
//       subject: "Verify your email",
//       html: `
//         <h3>Welcome!</h3>
//         <p>Please click below to verify:</p>
//         <a href="${link}" style="padding:10px;background:blue;color:white;">
//           Verify Email
//         </a>
//       `,
//     });

//     console.log("📩 Email sent:", info.response);
//     return info;
//   } catch (err) {
//     console.error("❌ EMAIL SEND FAILED:", err);
//     throw err;
//   }
// };

// // ✅ General Email
// const sendEmail = async (to, subject, text) => {
//   return await transporter.sendMail({
//     from: process.env.EMAIL_USER,
//     to,
//     subject,
//     text,
//   });
// };

// module.exports = { sendVerificationEmail, sendEmail };

require("dotenv").config();
const nodemailer = require("nodemailer");

console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASS exists:", !!process.env.EMAIL_PASS);

// ✅ Create transporter first
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  connectionTimeout: 5000,
  greetingTimeout: 5000,
  socketTimeout: 5000,
});

// ✅ Verify transporter after creation
transporter.verify((error, success) => {
  if (error) {
    console.log("SMTP ERROR:", error);
  } else {
    console.log("SMTP READY");
  }
});

// ✅ Verification Email
const sendVerificationEmail = async (email, token) => {
  const domain = process.env.BASE_URL || "http://localhost:5173";
  const link = `${domain}/verify-email?token=${token}`;

  console.log("📨 Sending email to:", email);
  

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

    console.log("✅ Email sent:", info.response);
    return info;
  } catch (err) {
    console.error("❌ EMAIL FAILED:", err.message);
    return null; // ❗ prevent crash
  }
};

// ✅ General Email
const sendEmail = async (to, subject, html) => {
  try {
    return await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      html,
    });
  } catch (err) {
    console.error("❌ GENERAL EMAIL FAILED:", err);
    return null;
  }
};

module.exports = { sendVerificationEmail, sendEmail };