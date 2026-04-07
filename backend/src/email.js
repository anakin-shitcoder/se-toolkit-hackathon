const nodemailer = require('nodemailer');

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'localhost',
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
}

async function sendNotificationEmail(feedback) {
  if (!process.env.NOTIFICATION_EMAIL) {
    console.warn('NOTIFICATION_EMAIL not set, skipping email notification');
    return;
  }
  
  const transporter = createTransporter();
  
  const mailOptions = {
    from: process.env.SMTP_FROM || '"Feedback Collector" <noreply@feedback-collector.local>',
    to: process.env.NOTIFICATION_EMAIL,
    subject: `New Feedback Received (${feedback.rating}/5 stars)`,
    html: `
      <h2>New Customer Feedback</h2>
      <table style="border-collapse: collapse; width: 100%; max-width: 500px;">
        <tr>
          <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #ddd;">Customer:</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${feedback.name}</td>
        </tr>
        <tr>
          <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #ddd;">Email:</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${feedback.email || 'Not provided'}</td>
        </tr>
        <tr>
          <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #ddd;">Rating:</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${'⭐'.repeat(feedback.rating)}</td>
        </tr>
        <tr>
          <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #ddd;">Message:</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${feedback.message}</td>
        </tr>
        <tr>
          <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #ddd;">Received:</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${new Date(feedback.created_at).toLocaleString()}</td>
        </tr>
      </table>
      <p style="margin-top: 20px; color: #666; font-size: 12px;">
        This is an automated notification from Feedback Collector.
      </p>
    `
  };
  
  await transporter.sendMail(mailOptions);
  console.log(`Notification email sent to ${process.env.NOTIFICATION_EMAIL}`);
}

module.exports = { sendNotificationEmail };
