import { NextRequest, NextResponse } from 'next/server';
import { notify } from '@/lib/email/notify';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { email, role, name } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
    }

    const recipient = email.toLowerCase().trim();

    if (role === 'company') {
      const res = await notify('welcome_company', {
        recipient,
        companyName: name || 'Company',
      });
      return NextResponse.json({ success: true, event: 'welcome_company', ...res });
    } else {
      const res = await notify('welcome_candidate', {
        recipient,
        candidateName: name || 'Candidate',
      });
      return NextResponse.json({ success: true, event: 'welcome_candidate', ...res });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to dispatch welcome email' }, { status: 500 });
  }
}
