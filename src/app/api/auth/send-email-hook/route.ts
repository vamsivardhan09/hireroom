import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { renderEmail } from '@/lib/email/templates';
import { addToOutbox, markOutboxSent } from '@/lib/email/outbox';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const configuredSecret = process.env.SEND_EMAIL_HOOK_SECRET || 'hireroom_send_email_secret';
  const headerSecret =
    request.headers.get('x-webhook-secret') ||
    request.headers.get('authorization')?.replace('Bearer ', '');

  if (!headerSecret || headerSecret !== configuredSecret) {
    return NextResponse.json(
      { error: 'Unauthorized: invalid or missing SEND_EMAIL_HOOK_SECRET' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const user = body?.user;
    const emailData = body?.email_data;

    const recipient = user?.email || body?.recipient;
    if (!recipient) {
      return NextResponse.json({ error: 'Missing recipient email' }, { status: 400 });
    }

    const otpCode = emailData?.token || body?.otpCode || '123456';
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const magicLink =
      emailData?.token_hash
        ? `${siteUrl}/auth/callback?token_hash=${emailData.token_hash}&type=${emailData.email_action_type || 'magiclink'}&next=${encodeURIComponent(emailData.redirect_to || '/dashboard')}`
        : body?.magicLink || `${siteUrl}/auth/callback?code=${otpCode}`;

    // Render signin_link template
    const { subject, html, text } = await renderEmail('signin_link', {
      recipient,
      magicLink,
      otpCode,
      expiresInMinutes: 10,
    });

    const resendApiKey = process.env.RESEND_API_KEY;
    const emailFrom = process.env.EMAIL_FROM || 'HireRoom <hello@hireroom.com>';

    let resendId = `mock_hook_${Date.now()}`;

    if (resendApiKey) {
      const resend = new Resend(resendApiKey);
      const resendRes = await resend.emails.send({
        from: emailFrom,
        to: recipient,
        subject,
        html,
        text,
      });

      if (resendRes.error) {
        console.error('[send-email-hook] Resend error:', resendRes.error);
        return NextResponse.json({ error: resendRes.error.message }, { status: 500 });
      }

      resendId = resendRes.data?.id || resendId;
    } else {
      console.warn('[send-email-hook] RESEND_API_KEY not configured. Dispatched in mock mode for development/tests.');
    }

    // Record in outbox for audit tracking
    const { record } = await addToOutbox({
      event: 'signin_link',
      recipient,
      subject,
      payload: {
        recipient,
        magicLink,
        otpCode,
        expiresInMinutes: 10,
      },
      deduplicationKey: `signin_link:${recipient}:${Date.now()}`,
    });

    if (record) {
      await markOutboxSent(record.id, resendId);
    }

    return NextResponse.json({
      success: true,
      message: 'Sign-in email delivered',
      resendId,
    });
  } catch (error: any) {
    console.error('[send-email-hook] Error handling hook:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to send sign-in email' },
      { status: 500 }
    );
  }
}
