import { EmailParams, MailerSend, Recipient, Sender } from "mailersend";

type X = { email: string; name?: string };

export async function sendEmail(
  subject: string,
  html: string,
  to: X,
  from: X = { email: "info@trial-zr6ke4nj8kygon12.mlsender.net", name: "Gerald" },
) {
  const mailersend = new MailerSend({
    apiKey: process.env.MAILERSEND_API_KEY!,
  });

  const sentFrom = new Sender(from.email, from.name);
  const sentTo = [new Recipient(to.email, to.name)];

  const emailParams = new EmailParams()
    .setFrom(sentFrom)
    .setTo(sentTo)
    .setSubject(subject)
    .setHtml(html);

  return await mailersend.email.send(emailParams);
}
