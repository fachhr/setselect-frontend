const RECAPTCHA_VERIFY_URL = 'https://www.google.com/recaptcha/api/siteverify';
const MINIMUM_SCORE = 0.5;

interface RecaptchaVerifyResponse {
  success: boolean;
  score?: number;
  action?: string;
  challenge_ts?: string;
  hostname?: string;
  'error-codes'?: string[];
}

interface VerificationResult {
  success: boolean;
  score?: number;
  error?: string;
}

/**
 * Verify a reCAPTCHA v3 token with Google's siteverify API
 *
 * @param token - The reCAPTCHA token from the client
 * @param expectedAction - The action name that should match (e.g., 'join_form')
 * @returns Verification result with success status and score
 *
 * @example
 * const result = await verifyRecaptchaToken(token, 'join_form');
 * if (!result.success) {
 *   return NextResponse.json({ error: 'Security verification failed' }, { status: 403 });
 * }
 */
export async function verifyRecaptchaToken(
  token: string,
  expectedAction: string
): Promise<VerificationResult> {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;

  // Skip verification if secret key not configured (development)
  if (!secretKey) {
    console.warn('[reCAPTCHA] Secret key not configured - skipping verification');
    return { success: true, score: 1.0 };
  }

  // Skip verification if no token provided (development without client keys)
  if (!token) {
    console.warn('[reCAPTCHA] No token provided - skipping verification');
    return { success: true, score: 1.0 };
  }

  try {
    const response = await fetch(RECAPTCHA_VERIFY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        secret: secretKey,
        response: token,
      }).toString(),
    });

    if (!response.ok) {
      console.error('[reCAPTCHA] Google API error:', response.status);
      return { success: false, error: 'Verification service unavailable' };
    }

    const data: RecaptchaVerifyResponse = await response.json();

    // Log for monitoring (score distribution analysis)
    console.log('[reCAPTCHA] Verification result:', {
      success: data.success,
      score: data.score,
      action: data.action,
      expectedAction,
    });

    // Check if verification was successful
    if (!data.success) {
      console.error('[reCAPTCHA] Verification failed:', data['error-codes']);
      return { success: false, error: 'Token verification failed' };
    }

    // Check if action matches
    if (data.action !== expectedAction) {
      console.error('[reCAPTCHA] Action mismatch:', {
        expected: expectedAction,
        received: data.action,
      });
      return { success: false, error: 'Invalid action' };
    }

    // Check score threshold
    const score = data.score ?? 0;
    if (score < MINIMUM_SCORE) {
      console.warn('[reCAPTCHA] Low score blocked:', score);
      return { success: false, score, error: 'Score below threshold' };
    }

    return { success: true, score };
  } catch (error) {
    console.error('[reCAPTCHA] Verification error:', error);
    return { success: false, error: 'Verification request failed' };
  }
}
