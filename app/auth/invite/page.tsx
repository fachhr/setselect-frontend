'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Layers } from 'lucide-react';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const REDIRECT_TO = 'https://www.setselect.io/auth/invite-callback';

function InviteContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const handleSignIn = () => {
    if (!token) return;
    const verifyUrl = `${SUPABASE_URL}/auth/v1/verify?token=${encodeURIComponent(token)}&type=magiclink&redirect_to=${encodeURIComponent(REDIRECT_TO)}`;
    window.location.href = verifyUrl;
  };

  if (!token) {
    return (
      <div
        className="flex min-h-screen items-center justify-center px-4"
        style={{ backgroundColor: 'var(--bg-root)' }}
      >
        <div className="glass-panel w-full max-w-md rounded-xl px-8 py-10 text-center">
          <h1
            className="text-xl font-semibold"
            style={{ color: 'var(--text-primary)' }}
          >
            Invalid Link
          </h1>
          <p
            className="mt-3 text-base leading-relaxed"
            style={{ color: 'var(--text-secondary)' }}
          >
            This invite link appears to be incomplete. Please contact the person
            who sent it to request a new one.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center px-4"
      style={{ backgroundColor: 'var(--bg-root)' }}
    >
      <div className="glass-panel w-full max-w-md rounded-xl px-8 py-10 text-center">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-xl shadow-lg" style={{ backgroundColor: 'var(--gold)' }}>
          <Layers className="h-8 w-8" style={{ color: 'var(--bg-root)' }} strokeWidth={2.5} />
        </div>
        <h1
          className="font-title text-2xl font-bold tracking-tight"
          style={{ color: 'var(--text-primary)' }}
        >
          Set<span className="font-light" style={{ color: 'var(--text-secondary)' }}>Select</span>
        </h1>
        <p
          className="mt-3 text-base leading-relaxed"
          style={{ color: 'var(--text-secondary)' }}
        >
          You&apos;ve been invited to access the talent pool. Click below to
          sign in securely.
        </p>
        <button
          onClick={handleSignIn}
          className="btn-gold mt-6 inline-block rounded-lg px-8 py-3 text-sm font-semibold"
        >
          Access Talent Pool
        </button>
      </div>
    </div>
  );
}

export default function InvitePage() {
  return (
    <Suspense
      fallback={
        <div
          className="flex min-h-screen items-center justify-center"
          style={{ backgroundColor: 'var(--bg-root)' }}
        >
          <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>
        </div>
      }
    >
      <InviteContent />
    </Suspense>
  );
}
