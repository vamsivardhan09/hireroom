import { NextRequest, NextResponse } from 'next/server';
import {
  isEmailSuppressed,
  isUserUnsubscribed,
  __getMemoryOutbox,
  __clearMemoryStores,
} from '@/lib/email/outbox';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const action = searchParams.get('action');
  const email = searchParams.get('email');
  const event = searchParams.get('event');

  if (action === 'is_suppressed' && email) {
    const suppressed = await isEmailSuppressed(email);
    return NextResponse.json({ email, suppressed });
  }

  if (action === 'is_unsubscribed' && email && event) {
    const unsubscribed = await isUserUnsubscribed(email, event as any);
    return NextResponse.json({ email, event, unsubscribed });
  }

  if (action === 'outbox') {
    const outbox = __getMemoryOutbox();
    return NextResponse.json({ count: outbox.length, outbox });
  }

  return NextResponse.json({ status: 'ok' });
}

export async function POST(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const action = searchParams.get('action');

  if (action === 'clear') {
    __clearMemoryStores();
    return NextResponse.json({ cleared: true });
  }

  return NextResponse.json({ status: 'ok' });
}
