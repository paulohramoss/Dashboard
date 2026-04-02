import nodemailer from "nodemailer";

export function createTransporter() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "eazyfinance55@gmail.com",
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
}

export const FROM = '"Eazy" <eazyfinance55@gmail.com>';
