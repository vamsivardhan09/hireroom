import { NextRequest, NextResponse } from 'next/server';
import { notify } from '@/lib/email/notify';
import { EmailEvent } from '@/lib/email/types';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { event, payload } = await request.json();

    if (!event || !payload || !payload.recipient) {
      return NextResponse.json(
        { error: 'Missing required fields: event, payload, payload.recipient' },
        { status: 400 }
      );
    }

    const result = await notify(event as EmailEvent, payload);
    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to dispatch notification' },
      { status: 500 }
    );
  }
}
