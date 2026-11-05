import { NextRequest, NextResponse } from 'next/server';
import { addEmailSuppression } from '@/lib/email/outbox';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const eventType = body?.type;
    const data = body?.data;

    if (!eventType || !data) {
      return NextResponse.json({ error: 'Invalid webhook payload' }, { status: 400 });
    }

    const recipient = data?.to?.[0] || data?.email || data?.recipient;

    if (eventType === 'email.bounced') {
      if (recipient) {
        console.warn(`[webhook:resend] Bounced email received for: ${recipient}`);
        await addEmailSuppression(recipient, 'bounce');
      }
      return NextResponse.json({ received: true, action: 'suppressed_bounce' });
    }

    if (eventType === 'email.complained') {
      if (recipient) {
        console.warn(`[webhook:resend] Spam complaint received for: ${recipient}`);
        await addEmailSuppression(recipient, 'complaint');
      }
      return NextResponse.json({ received: true, action: 'suppressed_complaint' });
    }

    return NextResponse.json({ received: true, action: 'ignored' });
  } catch (error: any) {
    console.error('[webhook:resend] Error processing webhook:', error);
    return NextResponse.json(
      { error: error?.message || 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
