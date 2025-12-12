const nodemailer = require('nodemailer');

let transporter;

function getTransporter() {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const secure = String(process.env.SMTP_SECURE || 'false') === 'true';
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });

  return transporter;
}

async function sendEmail({ to, subject, html }) {
  const tx = getTransporter();
  if (!tx) {
    // SMTP not configured; skip sending.
    return { skipped: true };
  }

  const from = process.env.SMTP_FROM || 'Hustlaa <no-reply@hustlaa.com>';
  const info = await tx.sendMail({ from, to, subject, html });
  return info;
}

function bookingEmailTemplate({ title, intro, booking, recipientName }) {
  const when = `${booking.booking_date} ${booking.booking_time}`;
  const amount = booking.total_amount != null ? `₦${booking.total_amount}` : '';

  return `
    <div style="font-family:Arial,Helvetica,sans-serif;line-height:1.5;color:#111">
      <h2>${title}</h2>
      <p>Hello ${recipientName || 'there'},</p>
      <p>${intro}</p>
      <div style="border:1px solid #e5e7eb;border-radius:10px;padding:16px;background:#fafafa">
        <p style="margin:0 0 8px 0;"><strong>Booking ID:</strong> ${booking.id}</p>
        <p style="margin:0 0 8px 0;"><strong>Service:</strong> ${booking.service_name || ''}</p>
        <p style="margin:0 0 8px 0;"><strong>Date/Time:</strong> ${when}</p>
        <p style="margin:0 0 8px 0;"><strong>Location:</strong> ${booking.location_address || ''}</p>
        ${amount ? `<p style="margin:0;"><strong>Amount:</strong> ${amount}</p>` : ''}
      </div>
      <p style="margin-top:16px">Thanks,<br/>Hustlaa</p>
    </div>
  `;
}

module.exports = { sendEmail, bookingEmailTemplate };
