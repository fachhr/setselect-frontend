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
  if (!/^https?:\/\//.test(scraperUrl)) {
    return NextResponse.json(
      { error: `SCRAPER_URL must include protocol (got "${scraperUrl}")` },
      { status: 500 },
    );
  }

  let body: string | undefined;
  try {
    body = JSON.stringify(await request.json());
  } catch {
    // No body — scrape all
  }

  let res: Response;
  try {
    res = await fetch(`${scraperUrl}/scrape`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${scraperSecret}`,
      },
      body,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      { error: `Scraper unreachable: ${msg}` },
      { status: 502 },
    );
  }

  let data: unknown;
  try {
    data = await res.json();
  } catch {
    const text = await res.text().catch(() => '');
    return NextResponse.json(
      { error: `Scraper returned non-JSON (status ${res.status})`, body: text.slice(0, 500) },
      { status: 502 },
    );
  }

  return NextResponse.json(data, { status: res.status });
}
