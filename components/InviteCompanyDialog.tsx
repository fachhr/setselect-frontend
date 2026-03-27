'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, Copy, Check, AlertCircle, X } from 'lucide-react';

interface InviteCompanyDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function InviteCompanyDialog({ open, onClose, onSuccess }: InviteCompanyDialogProps) {
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [invitedBy, setInvitedBy] = useState('');

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [actionLink, setActionLink] = useState('');
  const [copied, setCopied] = useState(false);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Reset form and lock body scroll when dialog opens
  useEffect(() => {
    if (!open) {
      document.body.style.overflow = '';
      return;
    }
    // Reset all form fields — intentional sync setState on mount
    const reset = () => { setCompanyName(''); setEmail(''); setInvitedBy(''); setStatus('idle'); setMessage(''); setActionLink(''); setCopied(false); };
    reset();
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  // Escape key handler
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && status !== 'loading') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, status, onClose]);

  // Cleanup copy timer
  useEffect(() => {
    return () => clearTimeout(copyTimerRef.current);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');
    setActionLink('');

    try {
      const res = await fetch('/api/companies/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, companyName, invitedBy: invitedBy || undefined }),
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
      onSuccess();
    } catch {
      setStatus('error');
      setMessage('Connection error');
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(actionLink);
      setCopied(true);
      clearTimeout(copyTimerRef.current);
      copyTimerRef.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: input is already selected/readable
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[var(--bg-root)]/70"
        onClick={status === 'loading' ? undefined : onClose}
      />

      {/* Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="invite-company-title"
        className="relative w-full max-w-lg mx-4 bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-lg p-6 animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 id="invite-company-title" className="text-lg font-bold text-[var(--text-primary)]">Invite Company</h2>
          <button
            onClick={onClose}
            disabled={status === 'loading'}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

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
              disabled={status === 'loading' || status === 'success'}
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
              disabled={status === 'loading' || status === 'success'}
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
              disabled={status === 'loading' || status === 'success'}
            />
          </div>

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
                onClick={onClose}
                className="btn-gold w-full py-3 rounded-lg text-sm cursor-pointer"
              >
                Done
              </button>
            ) : (
              <button
                type="submit"
                disabled={!companyName || !email || status === 'loading'}
                className="btn-gold w-full py-3 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
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
