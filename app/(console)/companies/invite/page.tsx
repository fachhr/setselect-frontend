'use client';

import { useState } from 'react';
import { Send, Copy, Check, AlertCircle, RefreshCw } from 'lucide-react';

export default function InviteCompanyPage() {
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [invitedBy, setInvitedBy] = useState('');
  const [regenerateLink, setRegenerateLink] = useState(false);

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [actionLink, setActionLink] = useState('');
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');
    setActionLink('');

    try {
      const res = await fetch('/api/companies/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, companyName, invitedBy: invitedBy || undefined, regenerateLink }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus('error');
        setMessage(data.error || 'Something went wrong');
        return;
      }

      setStatus('success');
      setMessage(data.message || data.warning || 'Done');
      if (data.actionLink) {
        setActionLink(data.actionLink);
      }
    } catch {
      setStatus('error');
      setMessage('Connection error');
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(actionLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setCompanyName('');
    setEmail('');
    setInvitedBy('');
    setRegenerateLink(false);
    setStatus('idle');
    setMessage('');
    setActionLink('');
    setCopied(false);
  };

  return (
    <div className="max-w-lg mx-auto">
      <div className="bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-xl p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)] block mb-2">
              Company Name
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Acme Corp"
              className="input-base w-full px-4 py-3 rounded-lg text-sm"
              required
              disabled={status === 'loading'}
            />
          </div>

          <div>
            <label className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)] block mb-2">
              Contact Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="contact@acme.com"
              className="input-base w-full px-4 py-3 rounded-lg text-sm"
              required
              disabled={status === 'loading'}
            />
          </div>

          <div>
            <label className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)] block mb-2">
              Invited By <span className="normal-case tracking-normal font-normal text-[var(--text-muted)]">(optional)</span>
            </label>
            <input
              type="text"
              value={invitedBy}
              onChange={(e) => setInvitedBy(e.target.value)}
              placeholder="Recruiter name"
              className="input-base w-full px-4 py-3 rounded-lg text-sm"
              disabled={status === 'loading'}
            />
          </div>

          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={regenerateLink}
              onChange={(e) => setRegenerateLink(e.target.checked)}
              className="w-4 h-4 rounded border-[var(--border-subtle)] accent-[var(--secondary)]"
              disabled={status === 'loading'}
            />
            <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
              <RefreshCw size={14} className="text-[var(--text-tertiary)]" />
              Regenerate link for existing company
            </div>
          </label>

          {/* Error message */}
          {status === 'error' && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-[var(--error)]/10 border border-[var(--error)]/20">
              <AlertCircle size={16} className="text-[var(--error)] mt-0.5 shrink-0" />
              <p className="text-sm text-[var(--error)]">{message}</p>
            </div>
          )}

          {/* Success message + link */}
          {status === 'success' && (
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-[var(--success)]/10 border border-[var(--success)]/20">
                <Check size={16} className="text-[var(--success)] mt-0.5 shrink-0" />
                <p className="text-sm text-[var(--success)]">{message}</p>
              </div>

              {actionLink && (
                <div className="space-y-2">
                  <label className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)] block">
                    Magic Link
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={actionLink}
                      readOnly
                      className="input-base w-full px-4 py-3 rounded-lg text-sm text-[var(--text-tertiary)] font-mono text-xs"
                    />
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="shrink-0 px-4 py-3 rounded-lg bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] hover:border-[var(--secondary)] text-[var(--text-secondary)] hover:text-[var(--secondary)] transition-all cursor-pointer"
                      title="Copy link"
                    >
                      {copied ? <Check size={16} className="text-[var(--success)]" /> : <Copy size={16} />}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3 pt-1">
            {status === 'success' ? (
              <button
                type="button"
                onClick={handleReset}
                className="btn-gold w-full py-3 rounded-lg text-sm shadow-lg cursor-pointer"
              >
                Invite Another Company
              </button>
            ) : (
              <button
                type="submit"
                disabled={!companyName || !email || status === 'loading'}
                className="btn-gold w-full py-3 rounded-lg text-sm shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
              >
                <Send size={14} />
                {status === 'loading' ? 'Generating...' : 'Generate Invite Link'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
