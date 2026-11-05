import { NextRequest, NextResponse } from 'next/server';
import { updateEmailPreferences, addEmailSuppression } from '@/lib/email/outbox';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = body?.email;
    const category = body?.category; // 'all' | 'digests' | 'announcements' | 'reminders'

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }

    if (category === 'all') {
      await addEmailSuppression(email, 'unsubscribe');
      return NextResponse.json({ success: true, message: 'Successfully unsubscribed from all non-essential communications' });
    }

    await updateEmailPreferences(email, {
      digests: category === 'digests' ? false : undefined,
      announcements: category === 'announcements' ? false : undefined,
      reminders: category === 'reminders' ? false : undefined,
    });

    return NextResponse.json({ success: true, message: `Successfully updated email preferences for ${email}` });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to update preferences' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get('email');
  if (!email) {
    return NextResponse.json({ error: 'Email parameter required' }, { status: 400 });
  }

  await addEmailSuppression(email, 'unsubscribe');
  return NextResponse.json({ success: true, message: `Unsubscribed ${email} from non-essential emails` });
}
