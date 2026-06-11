import { NextResponse } from 'next/server';
import { resend, FROM_EMAIL, VENTEX_URL } from '@/lib/resend';

// Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ HTML Template Builder Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬

function buildEmail({
  heading,
  body,
  ctaText,
  ctaUrl,
}: {
  heading: string;
  body: string;
  ctaText?: string;
  ctaUrl?: string;
}) {
  const cta = ctaText && ctaUrl
    ? `<a href="${ctaUrl}" style="display:inline-block;margin-top:24px;padding:14px 28px;background:#111111;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;border-radius:100px;letter-spacing:0.02em">${ctaText}</a>`
    : '';

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${heading}</title>
</head>
<body style="margin:0;padding:0;background:#F2F2F0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F2F2F0;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:20px;border:1px solid #e5e5e5;overflow:hidden;">

        <!-- Logo Bar -->
        <tr>
          <td style="padding:28px 36px 20px;border-bottom:1px solid #f0f0f0;">
            <span style="font-size:20px;font-weight:900;letter-spacing:-0.05em;text-transform:uppercase;color:#111111;font-style:italic;">VENTEX</span>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:32px 36px 16px;">
            <h1 style="margin:0 0 16px;font-size:22px;font-weight:800;color:#111111;line-height:1.3;">${heading}</h1>
            <div style="font-size:15px;color:#444444;line-height:1.7;">${body}</div>
            ${cta ? `<div style="margin-top:8px;">${cta}</div>` : ''}
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:20px 36px 28px;border-top:1px solid #f0f0f0;">
            <p style="margin:0;font-size:12px;color:#999999;">
              You're receiving this because you have an account on 
              <a href="${VENTEX_URL}" style="color:#666666;">ventex.co</a>.
              &nbsp;·&nbsp;
              <a href="${VENTEX_URL}/unsubscribe" style="color:#666666;text-decoration:underline;">Unsubscribe</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Email Templates Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬

type EmailType =
  | 'welcome'
  | 'new_comment'
  | 'investor_interest'
  | 'interest_accepted'
  | 'product_sold'
  | 'order_confirmation'
  | 'ai_summary_ready'
  | 'pitch_rejected'
  | 'contact_submission'
  | 'catalyst_application'
  | 'live_founder_application'
  | 'live_investor_application'
  | 'build_request'
  | 'weekly_digest';

function buildEmailPayload(type: EmailType, data: Record<string, any>) {
  switch (type) {
    case 'welcome':
      return {
        subject: `Welcome to Ventex, ${data.name || 'there'}! 🚀`,
        html: buildEmail({
          heading: `Welcome to Ventex, ${data.name || 'there'}!`,
          body: `<p>You're in. Ventex is where serious startups meet serious investors  -  and you've just become part of it.</p>
                 <p>Start by exploring the pitch hub, browsing the marketplace, or submitting your first pitch.</p>`,
          ctaText: 'Explore Ventex',
          ctaUrl: `${VENTEX_URL}/discover`,
        }),
      };

    case 'new_comment':
      return {
        subject: `💬 New comment on your pitch "${data.pitchName}"`,
        html: buildEmail({
          heading: `Someone commented on "${data.pitchName}"`,
          body: `<p><strong>${data.commenterName || 'A visitor'}</strong> left a comment on your pitch:</p>
                 <blockquote style="border-left:3px solid #e5e5e5;margin:16px 0;padding:12px 16px;color:#555;font-style:italic;">"${data.commentText || ''}"</blockquote>
                 <p>Reply to keep the conversation going and build investor confidence.</p>`,
          ctaText: 'View Comment',
          ctaUrl: `${VENTEX_URL}/pitch/${data.pitchId}#comments`,
        }),
      };

    case 'investor_interest':
      return {
        subject: `🤝 An investor expressed interest in "${data.startupName}"`,
        html: buildEmail({
          heading: `An investor is interested in ${data.startupName}`,
          body: `<p><strong>${data.investorName || 'A premium investor'}</strong> has expressed interest in your startup on Ventex and wants to connect.</p>
                 ${data.message ? `<blockquote style="border-left:3px solid #e5e5e5;margin:16px 0;padding:12px 16px;color:#555;font-style:italic;">"${data.message}"</blockquote>` : ''}
                 <p>Review their profile and accept or decline from your founder dashboard.</p>`,
          ctaText: 'Review in Dashboard',
          ctaUrl: `${VENTEX_URL}/founder/dashboard`,
        }),
      };

    case 'interest_accepted':
      return {
        subject: `✅ ${data.startupName} accepted your interest`,
        html: buildEmail({
          heading: `${data.startupName} accepted your interest!`,
          body: `<p>Great news  -  the founder of <strong>${data.startupName}</strong> has reviewed your expression of interest and accepted it.</p>
                 <p>Your secure Deal Room is now unlocked. You can start a private conversation with the founder directly on Ventex.</p>`,
          ctaText: 'Enter Deal Room',
          ctaUrl: `${VENTEX_URL}/deal-room/${data.interestId}`,
        }),
      };

    case 'product_sold':
      return {
        subject: `🎉 You sold "${data.productName}"! Order details inside.`,
        html: buildEmail({
          heading: `You sold "${data.productName}"!`,
          body: `<p>Congratulations! A buyer just purchased your product on Ventex Marketplace.</p>
                 <table style="width:100%;border:1px solid #e5e5e5;border-radius:12px;padding:16px;margin:16px 0;">
                   <tr><td style="color:#888;font-size:13px;">Product</td><td style="font-weight:700;font-size:13px;">${data.productName}</td></tr>
                   <tr><td style="color:#888;font-size:13px;padding-top:8px;">Amount</td><td style="font-weight:700;font-size:13px;padding-top:8px;">$${((data.amount || 0) / 100).toFixed(2)}</td></tr>
                   <tr><td style="color:#888;font-size:13px;padding-top:8px;">Your Payout</td><td style="font-weight:700;font-size:13px;padding-top:8px;color:#22c55e;">$${((data.payout || 0) / 100).toFixed(2)}</td></tr>
                 </table>
                 <p>Payouts are processed to your connected Stripe account within 2–5 business days.</p>`,
          ctaText: 'View Order',
          ctaUrl: `${VENTEX_URL}/founder/dashboard`,
        }),
      };

    case 'order_confirmation':
      return {
        subject: `📦 Your order for "${data.productName}" is confirmed`,
        html: buildEmail({
          heading: `Your order is confirmed!`,
          body: `<p>Thanks for your purchase on Ventex Marketplace. Here are your order details:</p>
                 <table style="width:100%;border:1px solid #e5e5e5;border-radius:12px;padding:16px;margin:16px 0;">
                   <tr><td style="color:#888;font-size:13px;">Product</td><td style="font-weight:700;font-size:13px;">${data.productName}</td></tr>
                   <tr><td style="color:#888;font-size:13px;padding-top:8px;">Amount Paid</td><td style="font-weight:700;font-size:13px;padding-top:8px;">$${((data.amount || 0) / 100).toFixed(2)}</td></tr>
                   <tr><td style="color:#888;font-size:13px;padding-top:8px;">Order ID</td><td style="font-size:12px;padding-top:8px;color:#888;">${data.orderId || ' - '}</td></tr>
                 </table>
                 <p>You can access your download or track your order in your account.</p>`,
          ctaText: 'View My Order',
          ctaUrl: `${VENTEX_URL}/marketplace/orders`,
        }),
      };

    case 'ai_summary_ready':
      return {
        subject: `🤖 Your pitch "${data.pitchName}" is live with an AI briefing`,
        html: buildEmail({
          heading: `Your pitch is live on Ventex!`,
          body: `<p>Your pitch <strong>"${data.pitchName}"</strong> has been published and an AI-generated briefing is now attached to it.</p>
                 <p>Investors browsing Ventex can see your pitch with the AI summary, increasing your discoverability. Make sure your details are complete to get the best quality briefing.</p>`,
          ctaText: 'View Your Pitch',
          ctaUrl: `${VENTEX_URL}/pitch/${data.pitchId}`,
        }),
      };

    case 'pitch_rejected':
      return {
        subject: `❌ Update on your pitch "${data.pitchName}"`,
        html: buildEmail({
          heading: `Pitch Review Result: Action Required`,
          body: `<p>Your pitch <strong>"${data.pitchName}"</strong> was reviewed by the admin and could not be approved at this time.</p>
                 <p><strong>Reason for rejection:</strong></p>
                 <blockquote style="border-left:3px solid #ef4444;margin:16px 0;padding:12px 16px;color:#555;font-style:italic;background:#fef2f2;border-radius:4px;">"${data.reason || 'No specific reason provided.'}"</blockquote>
                 <p>Please update your pitch details according to the feedback and resubmit for review.</p>`,
          ctaText: 'Edit Pitch',
          ctaUrl: `${VENTEX_URL}/founder/dashboard`,
        }),
      };

    case 'contact_submission':
      return {
        subject: `New Ventex contact submission: ${data.subject || 'General'}`,
        html: buildEmail({
          heading: 'New contact submission',
          body: `<p><strong>Name:</strong> ${data.name || 'Unknown'}</p>
                 <p><strong>Email:</strong> ${data.email || 'Unknown'}</p>
                 <p><strong>Subject:</strong> ${data.subject || 'General'}</p>
                 <p><strong>Message:</strong></p>
                 <blockquote style="border-left:3px solid #e5e5e5;margin:16px 0;padding:12px 16px;color:#555;">${data.message || ''}</blockquote>`,
          ctaText: 'Open Admin',
          ctaUrl: `${VENTEX_URL}/admin`,
        }),
      };

    case 'catalyst_application':
      return {
        subject: `Ventex Catalyst application: ${data.fullName || data.name || 'Applicant'}`,
        html: buildEmail({
          heading: 'Catalyst application received',
          body: `<p><strong>Name:</strong> ${data.fullName || data.name || 'Unknown'}</p>
                 <p><strong>Email:</strong> ${data.email || 'Unknown'}</p>
                 <p><strong>Role:</strong> ${data.role || data.support || 'Unknown'}</p>
                 <p><strong>LinkedIn:</strong> ${data.linkedinUrl || data.linkedin || 'Not provided'}</p>
                 <p><strong>Bio:</strong> ${data.bio || ''}</p>
                 <p><strong>Offer:</strong> ${data.offer || data.expertise || ''}</p>`,
          ctaText: 'Review in Admin',
          ctaUrl: `${VENTEX_URL}/admin`,
        }),
      };

    case 'live_founder_application':
    case 'live_investor_application':
    case 'build_request':
    case 'weekly_digest':
      return {
        subject: data.subject || 'Ventex notification',
        html: buildEmail({
          heading: data.heading || 'Ventex notification',
          body: data.body || '<p>A Ventex workflow was triggered.</p>',
          ctaText: data.ctaText,
          ctaUrl: data.ctaUrl,
        }),
      };

    default:
      return null;
  }
}

// Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ API Handler Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, recipientEmail, data } = body as {
      type: EmailType;
      recipientEmail: string;
      data: Record<string, any>;
    };

    if (!type || !recipientEmail) {
      return NextResponse.json({ error: 'Missing type or recipientEmail' }, { status: 400 });
    }

    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 're_placeholder') {
      // Log in dev when key not set
      console.warn(`[EMAIL LOG] type=${type} to=${recipientEmail} data=${JSON.stringify(data)}`);
      return NextResponse.json({ success: true, dev: true, message: 'Email logged (no API key set)' });
    }

    const payload = buildEmailPayload(type, data);
    if (!payload) {
      return NextResponse.json({ error: `Unknown email type: ${type}` }, { status: 400 });
    }

    const { data: result, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [recipientEmail],
      subject: payload.subject,
      html: payload.html,
    });

    if (error) {
      console.error('[Resend Error]', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.warn(`[EMAIL SENT] type=${type} to=${recipientEmail} id=${result?.id}`);
    return NextResponse.json({ success: true, id: result?.id });

  } catch (err: any) {
    console.error('[Email API Error]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}