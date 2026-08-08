import nodemailer from 'nodemailer';

const createTransporter = async () => {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT || 587);
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (smtpHost && smtpUser && smtpPass) {
    return nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    });
  }

  const testAccount = await nodemailer.createTestAccount();
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass
    }
  });
};

export const sendResetEmail = async ({ to, subject, text, html }) => {
  const transporter = await createTransporter();
  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'no-reply@enterprise.com',
    to,
    subject,
    text,
    html
  });

  return {
    messageId: info.messageId,
    previewUrl: nodemailer.getTestMessageUrl(info)
  };
};
