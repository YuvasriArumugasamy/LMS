import nodemailer from 'nodemailer';

const createTransporter = async () => {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT || 587);
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (smtpHost && smtpUser && smtpPass) {
    console.log('📧 Using configured SMTP server:', smtpHost);
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

  console.log('⚠️ No SMTP configured. Using Ethereal test email service...');
  try {
    const testAccount = await nodemailer.createTestAccount();
    console.log('✅ Ethereal account created:', testAccount.user);
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
  } catch (error) {
    console.error('❌ Failed to create Ethereal test account:', error.message);
    throw new Error('Email service unavailable. Please configure SMTP settings in .env file.');
  }
};

export const sendResetEmail = async ({ to, subject, text, html }) => {
  try {
    const transporter = await createTransporter();
    console.log('📤 Sending email to:', to);
    
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'no-reply@enterprise.com',
      to,
      subject,
      text,
      html
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    
    if (previewUrl) {
      console.log('✅ Test email sent! Preview URL:', previewUrl);
    } else {
      console.log('✅ Email sent successfully! Message ID:', info.messageId);
    }

    return {
      messageId: info.messageId,
      previewUrl
    };
  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
    throw new Error('Failed to send email. Please check SMTP configuration or try again later.');
  }
};
