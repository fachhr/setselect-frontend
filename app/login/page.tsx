'use client';

import { useState } from 'react';
import { Mail, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;

    setStatus('loading');
    setErrorMessage('');

    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.setselect.io'}/auth/callback`,
        },
      });

      if (error) {
        setStatus('error');
        setErrorMessage(error.message);
        return;
      }

      setStatus('sent');
    } catch {
      setStatus('error');
      setErrorMessage('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Ambient gradient orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-full h-full max-w-4xl pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[var(--secondary)] opacity-[0.08] blur-[100px] rounded-full" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[var(--primary)] opacity-[0.06] blur-[120px] rounded-full" />
        </div>

        <div className="relative z-10">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="font-title text-4xl sm:text-5xl font-bold text-[var(--text-primary)] tracking-tight">
              Welcome to{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--secondary)] to-[var(--highlight)]">
                SetSelect
              </span>
            </h1>
            <p className="mt-3 text-[var(--text-secondary)]">
              Sign in to access the talent pool
            </p>
          </div>

          {status === 'sent' ? (
            /* Success state */
            <div className="glass-panel rounded-2xl p-8 text-center animate-in fade-in duration-500">
              <div className="w-16 h-16 bg-[var(--success-dim)] rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-[var(--success)]" />
              </div>
              <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
                Check your email
              </h2>
              <p className="text-[var(--text-secondary)] mb-6">
                We sent a magic link to <strong className="text-[var(--text-primary)]">{email}</strong>.
                Click the link to sign in.
              </p>
              <button
                onClick={() => { setStatus('idle'); setEmail(''); }}
                className="text-sm text-[var(--secondary)] hover:text-[var(--highlight)] transition-colors"
              >
                Use a different email
              </button>
            </div>
          ) : (
            /* Login form */
            <form onSubmit={handleSubmit} className="glass-panel rounded-2xl p-8 animate-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="email" className="block text-sm font-medium text-[var(--text-secondary)]">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      required
                      autoFocus
                      className="input-base block w-full rounded-lg p-3 pl-10 text-sm placeholder-[var(--text-tertiary)]"
                    />
                  </div>
                </div>

                {status === 'error' && (
                  <div className="flex items-center gap-2 text-sm text-[var(--error)]">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status === 'loading' || !email}
                  className="btn-gold w-full inline-flex items-center justify-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {status === 'loading' ? (
                    <span className="inline-flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Sending link...
                    </span>
                  ) : (
                    <span className="inline-flex items-center">
                      Send magic link
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </span>
                  )}
                </button>
              </div>

              <p className="mt-6 text-center text-xs text-[var(--text-tertiary)]">
                Only invited companies can sign in.
                <br />
                Need access?{' '}
                <a href="/contact" className="text-[var(--secondary)] hover:text-[var(--highlight)] transition-colors">
                  Contact us
                </a>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
