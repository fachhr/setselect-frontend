'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock } from 'lucide-react';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        setError('Invalid password');
        return;
      }

      router.push('/candidates');
    } catch {
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass-panel rounded-2xl p-8 w-full max-w-sm animate-in fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[var(--primary-dim)] mb-4">
            <Lock size={22} className="text-[var(--secondary)]" />
          </div>
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">SetSelect</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Recruiter Console</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="input-base w-full px-4 py-3 rounded-lg text-sm"
              autoFocus
            />
          </div>

          {error && (
            <p className="text-sm text-[var(--error)] text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={!password || loading}
            className="btn-gold w-full py-3 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? 'Authenticating...' : 'Access Console'}
          </button>
        </form>
      </div>
    </div>
  );
}
