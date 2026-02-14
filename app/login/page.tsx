'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Layers } from 'lucide-react';

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
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-4xl pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[var(--secondary)] opacity-[0.08] blur-[100px] rounded-full"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[var(--primary)] opacity-[0.06] blur-[120px] rounded-full"></div>
      </div>
      <div className="glass-panel rounded-2xl p-8 w-full max-w-sm animate-in fade-in shadow-xl relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-[var(--primary)] rounded-lg shadow-lg mb-4">
            <Layers className="w-7 h-7 text-[var(--bg-root)]" strokeWidth={2.5} />
          </div>
          <h1 className="font-[family-name:var(--font-title)] text-2xl font-bold text-[var(--text-primary)]">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--secondary)] to-[var(--highlight)]">Set</span><span className="font-light text-[var(--text-secondary)]">Select</span>
          </h1>
          <p className="text-sm text-[var(--text-muted)] mb-8">Recruiter Console</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)] block mb-2">
              Password
            </label>
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
            className="btn-gold w-full py-3 rounded-lg text-sm shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? 'Authenticating...' : 'Access Console'}
          </button>
        </form>
      </div>
    </div>
  );
}
