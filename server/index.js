// server/index.js — Express + Nodemailer email backend
// ESM syntax (root package.json has "type": "module")
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Logo path for CID inline attachment ─────────────────────
const LOGO_PATH = path.join(__dirname, '../public/logo-white.png');

// Shared inline attachment definition (CID works in Gmail, Outlook, Apple Mail)
const LOGO_ATTACHMENT = {
  filename: 'logo.png',
  path: LOGO_PATH,
  cid: 'logo@ravindu', // referenced as cid:logo@ravindu in HTML
};

const app = express();
const PORT = process.env.PORT ?? 3001;

// ── Middleware ───────────────────────────────────────────────
app.use(express.json({ limit: '50kb' }));
app.use(cors({ origin: 'http://localhost:5173' }));

// ── Nodemailer transporter ───────────────────────────────────
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // TLS on port 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// ── HTML escape helper (prevent XSS in email body) ──────────
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const FROM = `"Ravindu Egodawatte Photography" <${process.env.SMTP_USER}>`;

// ── Email builders ───────────────────────────────────────────

function buildAutoReplyEmail(name, toEmail) {
  const safeName = escapeHtml(name);
  return {
    from: FROM,
    to: toEmail,
    subject: "We've Received Your Message! - Ravindu Egodawatte Photography",
    attachments: [LOGO_ATTACHMENT],
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a1a;">
        <div style="background: #1a1a1a; padding: 28px 24px; text-align: center;">
          <img src="cid:logo@ravindu" alt="Ravindu Egodawatte Photography" style="max-width: 200px; height: auto; display: block; margin: 0 auto;" />
        </div>
        <div style="padding: 32px 24px;">
          <p>Hi ${safeName},</p>
          <p>We heard your sound! Thank you for reaching out to us.</p>
          <p>We will review your message and get back to you as soon as possible.</p>
          <br>
          <p>Warm regards,<br>
          <strong>Ravindu Egodawatte</strong><br>
          📧 <a href="mailto:ravinduegodawattephoto@gmail.com" style="color: #f59e0b;">ravinduegodawattephoto@gmail.com</a><br>
          📞 +94 70 644 6615</p>
        </div>
        <div style="background: #f5f5f5; padding: 16px 24px; font-size: 12px; color: #666; text-align: center;">
          No. 232Q, Makwatte, Asgiriya, Gampaha
        </div>
      </div>
    `,
  };
}

function buildReplyEmail(toEmail, toName, replyBody) {
  const safeName  = escapeHtml(toName);
  const safeBody  = escapeHtml(replyBody).replace(/\n/g, '<br>');
  return {
    from: FROM,
    to: toName ? `"${safeName}" <${toEmail}>` : toEmail,
    subject: 'Re: Your Inquiry - Ravindu Egodawatte Photography',
    attachments: [LOGO_ATTACHMENT],
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a1a;">
        <div style="background: #1a1a1a; padding: 28px 24px; text-align: center;">
          <img src="cid:logo@ravindu" alt="Ravindu Egodawatte Photography" style="max-width: 200px; height: auto; display: block; margin: 0 auto;" />
        </div>
        <div style="padding: 32px 24px;">
          <p>${safeBody}</p>
          <br>
          <p>Warm regards,<br>
          <strong>Ravindu Egodawatte</strong><br>
          📧 <a href="mailto:ravinduegodawattephoto@gmail.com" style="color: #f59e0b;">ravinduegodawattephoto@gmail.com</a><br>
          📞 +94 70 644 6615</p>
        </div>
        <div style="background: #f5f5f5; padding: 16px 24px; font-size: 12px; color: #666; text-align: center;">
          No. 232Q, Makwatte, Asgiriya, Gampaha
        </div>
      </div>
    `,
  };
}

// ── POST /api/send-email ─────────────────────────────────────
app.post('/api/send-email', async (req, res) => {
  const { type, to, name, replyBody } = req.body ?? {};

  // Validate required fields
  if (!type || !to) {
    return res.status(400).json({ error: 'Missing required fields: type, to' });
  }

  // Validate email format
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  // Enforce length limits
  if (typeof name === 'string' && name.length > 200) {
    return res.status(400).json({ error: 'Name too long' });
  }
  if (typeof replyBody === 'string' && replyBody.length > 10000) {
    return res.status(400).json({ error: 'Reply body too long' });
  }

  let mailOptions;

  if (type === 'auto-reply') {
    if (!name) return res.status(400).json({ error: 'Missing name for auto-reply' });
    mailOptions = buildAutoReplyEmail(name, to);
  } else if (type === 'reply') {
    if (!replyBody) return res.status(400).json({ error: 'Missing replyBody for reply' });
    mailOptions = buildReplyEmail(to, name ?? '', replyBody);
  } else {
    return res.status(400).json({ error: 'Invalid type. Use "auto-reply" or "reply"' });
  }

  try {
    await transporter.sendMail(mailOptions);
    res.json({ success: true });
  } catch (err) {
    console.error('[Email Error]', err.message);
    res.status(500).json({ error: 'Failed to send email. Check SMTP credentials.' });
  }
});

app.listen(PORT, () => {
  console.log(`✉  Email server running on http://localhost:${PORT}`);
});
