// Contact form endpoint — delivers enquiries to ayuskid15@gmail.com via Resend.
// Deploys as a Vercel serverless function (the /api folder is auto-detected).
// Requires the RESEND_API_KEY environment variable in Vercel:
//   Project → Settings → Environment Variables → add RESEND_API_KEY → Redeploy.
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { name, email, company, message, _honey } = req.body || {};

  // Honeypot: bots fill this hidden field — silently drop them.
  if (_honey) {
    return res.status(200).json({ success: true });
  }

  if (!name || !email || !message) {
    return res.status(400).json({ success: false, message: 'Name, email and message are required.' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      success: false,
      message: 'Server email is not configured yet (missing RESEND_API_KEY).',
    });
  }

  const html =
    '<div style="font-family:Arial,sans-serif;line-height:1.5;color:#222;">' +
      '<h2 style="margin:0 0 16px;">New enquiry — theosxtech.dev website</h2>' +
      '<table style="border-collapse:collapse;width:100%;max-width:480px;">' +
        row('Name', name) +
        row('Email', email) +
        row('Company', company || '—') +
      '</table>' +
      '<h3 style="margin:18px 0 6px;">Message</h3>' +
      '<p style="margin:0;padding:12px;background:#f5f5f5;border-radius:6px;white-space:pre-wrap;">' + esc(message) + '</p>' +
    '</div>';

  try {
    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'THEOS X DIGITAL TECH <onboarding@resend.dev>',
        to: ['ayuskid15@gmail.com'],
        subject: 'New enquiry — theosxtech.dev website',
        html,
        reply_to: email,
      }),
    });

    const data = await resendRes.json().catch(() => ({}));
    if (!resendRes.ok) {
      console.error('Resend error:', resendRes.status, data);
      return res.status(502).json({ success: false, message: 'Email service returned an error.' });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Contact form error:', err);
    return res.status(500).json({ success: false, message: 'Could not send the message.' });
  }
}

function row(label, value) {
  return (
    '<tr>' +
      '<td style="padding:8px 12px;border:1px solid #ddd;font-weight:bold;white-space:nowrap;">' + label + '</td>' +
      '<td style="padding:8px 12px;border:1px solid #ddd;">' + esc(value) + '</td>' +
    '</tr>'
  );
}

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
