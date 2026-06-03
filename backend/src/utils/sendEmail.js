const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async (to, subject, html) => {
  const { data, error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || "CodeMate <onboarding@resend.dev>",
    to,
    subject,
    html,
  });

  if (error) {
    console.error("RESEND EMAIL ERROR:", error);
    throw new Error(error.message || "Email sending failed");
  }

  return data;
};

module.exports = sendEmail;