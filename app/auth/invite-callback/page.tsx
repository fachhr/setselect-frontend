'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';

type ErrorInfo = {
  title: string;
  message: string;
};

function parseHashError(hash: string): ErrorInfo | null {
  const params = new URLSearchParams(hash);
  const error = params.get('error');
  const errorDescription = params.get('error_description');

  if (errorDescription && /expired/i.test(errorDescription)) {
    return {
      title: 'Link Expired',
      message:
        'This invite link has expired. You can request a new sign-in link from the homepage.',
    };
  }

  if (error) {
    return {
      title: 'Something Went Wrong',
      message:
        'We couldn\u2019t verify your invite link. Please try requesting a new sign-in link from the homepage.',
    };
  }

  return null;
}

export default function InviteCallbackPage() {
  const router = useRouter();
  const [errorInfo, setErrorInfo] = useState<ErrorInfo | null>(null);

  useEffect(() => {
    async function handleInviteCallback() {
      try {
        const hash = window.location.hash.substring(1);

        // Check for Supabase error params in hash first
        const hashError = parseHashError(hash);
        if (hashError) {
          setErrorInfo(hashError);
          return;
        }

        const params = new URLSearchParams(hash);
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');

        if (!accessToken || !refreshToken) {
          setErrorInfo({
            title: 'Invalid Link',
            message:
              'This invite link appears to be incomplete. Please check your email and try clicking the link again, or request a new one.',
          });
          return;
        }

        const supabase = createSupabaseBrowserClient();

        const { error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (sessionError) {
          setErrorInfo({
            title: 'Connection Issue',
            message:
              'We had trouble setting up your session. Please try again or request a new sign-in link.',
          });
          return;
        }

        // Set first_login_at via API route (needs admin client)
        await fetch('/api/auth/first-login', { method: 'POST' });

        router.replace('/');
      } catch {
        setErrorInfo({
          title: 'Something Went Wrong',
          message:
            'We couldn\u2019t complete the sign-in. Please try requesting a new sign-in link from the homepage.',
        });
      }
    }

    handleInviteCallback();
  }, [router]);

  if (errorInfo) {
    return (
      <div
        className="flex min-h-screen items-center justify-center px-4"
        style={{ backgroundColor: 'var(--bg-root)' }}
      >
        <div
          className="glass-panel w-full max-w-md rounded-xl px-8 py-10 text-center"
        >
          <h1
            className="text-xl font-semibold"
            style={{ color: 'var(--text-primary)' }}
          >
            {errorInfo.title}
          </h1>
          <p
            className="mt-3 text-base leading-relaxed"
            style={{ color: 'var(--text-secondary)' }}
          >
            {errorInfo.message}
          </p>
          <Link
            href="/"
            className="btn-gold mt-6 inline-block rounded-lg px-6 py-2.5 text-sm"
          >
            Go to Homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center"
      style={{ backgroundColor: 'var(--bg-root)' }}
    >
      <p style={{ color: 'var(--text-secondary)' }}>
        Setting up your account...
      </p>
    </div>
  );
}
