import { cookies } from 'next/headers';

const COOKIE_NAME = 'recruiter_session';
const SESSION_DURATION = 86400000; // 24 hours

interface SessionPayload {
  exp: number;
}

async function hmacSign(data: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
  return Buffer.from(signature).toString('hex');
}

async function hmacVerify(data: string, signature: string, secret: string): Promise<boolean> {
  const expected = await hmacSign(data, secret);
  // Constant-time comparison to prevent timing attacks
  if (expected.length !== signature.length) return false;
  let mismatch = 0;
  for (let i = 0; i < expected.length; i++) {
    mismatch |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  }
  return mismatch === 0;
}

export async function createSessionToken(): Promise<string> {
  const secret = process.env.RECRUITER_SESSION_SECRET;
  if (!secret) throw new Error('Missing RECRUITER_SESSION_SECRET');

  const payload: SessionPayload = { exp: Date.now() + SESSION_DURATION };
  const payloadStr = JSON.stringify(payload);
  const encoded = Buffer.from(payloadStr).toString('base64url');
  const signature = await hmacSign(encoded, secret);

  return `${encoded}.${signature}`;
}

export async function validateSessionToken(token: string): Promise<boolean> {
  const secret = process.env.RECRUITER_SESSION_SECRET;
  if (!secret) return false;

  const parts = token.split('.');
  if (parts.length !== 2) return false;

  const [encoded, signature] = parts;

  const valid = await hmacVerify(encoded, signature, secret);
  if (!valid) return false;

  try {
    const payload: SessionPayload = JSON.parse(
      Buffer.from(encoded, 'base64url').toString()
    );
    return payload.exp > Date.now();
  } catch {
    return false;
  }
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION / 1000,
    path: '/',
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getSessionToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value;
}

export { COOKIE_NAME };
