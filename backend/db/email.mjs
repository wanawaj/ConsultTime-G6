import nodemailer from "nodemailer";
import { isWmsuEmail } from "./email-policy.mjs";

let transporter;

function getTransporter() {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_APP_PASSWORD;

  if (!user || !pass) {
    throw new Error("Gmail SMTP credentials are missing.");
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user,
        pass,
      },
    });
  }

  return transporter;
}

export async function sendOtpEmail(email, code) {
  if (!isWmsuEmail(email)) {
    throw new Error("Only WMSU emails can receive OTP codes.");
  }

  if (typeof code !== "string" || !/^\d{6}$/.test(code)) {
    throw new Error("Invalid OTP code.");
  }

  const recipient = email.trim().toLowerCase();

  await getTransporter().sendMail({
    from: {
      name: "ConsultTime Verification",
      address: process.env.SMTP_USER,
    },
    to: recipient,
    subject: "ConsultTime - Email Verification Code",
    text: `Your ConsultTime verification code is ${code}.

This code expires in 5 minutes.

If you did not request this verification, ignore this email.

ConsultTime Team`,
  });
}
