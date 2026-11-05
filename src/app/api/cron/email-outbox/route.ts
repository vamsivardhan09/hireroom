import { NextRequest, NextResponse } from 'next/server';
import { processEmailOutbox } from '@/lib/email/worker';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  return handleRequest(request);
}

export async function POST(request: NextRequest) {
  return handleRequest(request);
}

async function handleRequest(request: NextRequest) {
  const configuredSecret = process.env.CRON_SECRET || 'hireroom_cron_secret';
  const authHeader = request.headers.get('authorization');
  const querySecret = request.nextUrl.searchParams.get('secret');

  const providedSecret = authHeader?.startsWith('Bearer ')
    ? authHeader.substring(7).trim()
    : querySecret?.trim();

  // Guarded by CRON_SECRET: reject any request without the valid secret
  if (!providedSecret || providedSecret !== configuredSecret) {
    return NextResponse.json(
      { error: 'Unauthorized: invalid or missing CRON_SECRET' },
      { status: 401 }
    );
  }

  try {
    const limitParam = request.nextUrl.searchParams.get('limit');
    const dryRunParam = request.nextUrl.searchParams.get('dryRun') === 'true';
    const limit = limitParam ? parseInt(limitParam, 10) : 50;

    const result = await processEmailOutbox({ limit, dryRun: dryRunParam });

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      ...result,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Outbox processing failed',
      },
      { status: 500 }
    );
  }
}
