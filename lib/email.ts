import { Resend } from 'resend';

export async function sendEmail(params: {
  from: string;
  to: string;
  subject: string;
  text: string;
  replyTo?: string;
  html?: string;
}) {
  if (!process.env.RESEND_API_KEY) {
    console.warn(
      `[email skipped] No RESEND_API_KEY — would have sent "${params.subject}" to ${params.to}`
    );
    return;
  }
  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send(params);
}
