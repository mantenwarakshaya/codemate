// require("dotenv").config();
// const nodemailer = require("nodemailer");
// const { Resend } = require("resend");

// // ✅ Create transporter with timeout protection
// // const transporter = nodemailer.createTransport({
// //   service: "gmail",
// //   auth: {
// //     user: process.env.EMAIL_USER,
// //     pass: process.env.EMAIL_PASS,
// //   },
// //   connectionTimeout: 5000,
// //   greetingTimeout: 5000,
// //   socketTimeout: 5000,
// // });

// // ✅ Verification Email
// // const sendVerificationEmail = async (email, token) => {
// //   const domain = process.env.BASE_URL || "http://localhost:5173";
// //   const link = `${domain}/verify-email?token=${token}`;

// //   console.log("📨 Sending email to:", email);

// //   try {
// //     const info = await transporter.sendMail({
// //       from: process.env.EMAIL_USER,
// //       to: email,
// //       subject: "Verify your email",
// //       html: `
// //         <h3>Welcome!</h3>
// //         <p>Please click below to verify:</p>
// //         <a href="${link}" style="padding:10px;background:blue;color:white;">
// //           Verify Email
// //         </a>
// //       `,
// //     });

// //     console.log("✅ Email sent:", info.response);
// //     return info;
// //   } catch (err) {
// //     console.error("❌ EMAIL FAILED:", err.message);
// //     return null; // ❗ prevent crash
// //   }
// // };

// const { Resend } = require("resend");

// const resend = new Resend(process.env.RESEND_API_KEY);

// const sendVerificationEmail = async (email, token) => {
//   const domain = process.env.BASE_URL;
//   const link = `${domain}/verify-email?token=${token}`;

//   try {
//     const data = await resend.emails.send({
//       from: "onboarding@resend.dev",
//       to: email,
//       subject: "Verify your email",
//       html: `
//         <h3>Welcome!</h3>
//         <p>Click below to verify:</p>
//         <a href="${link}">Verify Email</a>
//       `,
//     });

//     console.log("✅ Email sent:", data);
//   } catch (err) {
//     console.error("❌ Email failed:", err);
//   }
// };

// // ✅ General Email
// const sendEmail = async (to, subject, text) => {
//   try {
//     return await transporter.sendMail({
//       from: process.env.EMAIL_USER,
//       to,
//       subject,
//       text,
//     });
//   } catch (err) {
//     console.error("❌ GENERAL EMAIL FAILED:", err.message);
//     return null;
//   }
// };

// module.exports = { sendVerificationEmail, sendEmail };


// require("dotenv").config();
// const { Resend } = require("resend");

// const resend = new Resend(process.env.RESEND_API_KEY);

// // ✅ Verification Email
// const sendVerificationEmail = async (email, token) => {
//   const domain = process.env.BASE_URL;
//   const link = `${domain}/verify-email?token=${token}`;

//   console.log("📨 Sending email to:", email);

//   try {
//     const data = await resend.emails.send({
//       from: "onboarding@resend.dev", // default test sender
//       to: email,
//       subject: "Verify your email",
//       html: `
//         <h3>Welcome!</h3>
//         <p>Click below to verify:</p>
//         <a href="${link}">Verify Email</a>
//       `,
//     });

//     console.log("✅ Email sent:", data);
//     return data;
//   } catch (err) {
//     console.error("❌ Email failed:", err);
//     return null;
//   }
// };

// // ✅ General Email (also via Resend)
// const sendEmail = async (to, subject, text) => {
//   try {
//     const data = await resend.emails.send({
//       from: "onboarding@resend.dev",
//       to,
//       subject,
//       text,
//     });

//     return data;
//   } catch (err) {
//     console.error("❌ GENERAL EMAIL FAILED:", err);
//     return null;
//   }
// };

// module.exports = { sendVerificationEmail, sendEmail };

const nodemailer = require("nodemailer");

const sendEmail = async (to, link) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: "your_email@gmail.com",
    to,
    subject: "Verify your email",
    html: `
      <h2>Verify Email</h2>
      <a href="${link}">Click to verify</a>
    `,
  });
};

module.exports = sendEmail;