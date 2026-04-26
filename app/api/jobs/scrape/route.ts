import { NextRequest, NextResponse } from 'next/server';
import { getSessionToken, validateSessionToken } from '@/lib/auth';

export const maxDuration = 300;

export async function POST(request: NextRequest) {
  const token = await getSessionToken();
  if (!token || !(await validateSessionToken(token))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const scraperUrl = process.env.SCRAPER_URL;
  const scraperSecret = process.env.SCRAPER_SECRET;
  if (!scraperUrl || !scraperSecret) {
    return NextResponse.json({ error: 'Scraper not configured' }, { status: 500 });
  }

  let body: string | undefined;
  try {
    body = JSON.stringify(await request.json());
  } catch {
    // No body — scrape all
  }

  const res = await fetch(`${scraperUrl}/scrape`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${scraperSecret}`,
    },
    body,
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
