import { config } from "../config/app.config";
import resend from "../config/resend.config";

interface mailType {
  to: string;
  subject: string;
  text: string;
  html: string;
}

const getFromEmail = () =>
  config.NODE_ENV === "development"
    ? "onboarding@resend.dev"
    : config.EMAIL_SENDER;

const getToEmail = (to: string) =>
  config.NODE_ENV === "development" ? "delivered@resend.dev" : to;

export const sendMail = async ({ to, subject, text, html }: mailType) =>
  await resend.emails.send({
    from: getFromEmail(),
    to: getToEmail(to),
    subject,
    text,
    html,
  });
