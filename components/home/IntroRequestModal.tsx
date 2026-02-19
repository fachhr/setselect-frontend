'use client';

import React, { useState } from 'react';
import { X, Send } from 'lucide-react';
import { Button } from '@/components/ui';

interface IntroRequestModalProps {
  candidateId: string;
  candidateRole?: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (talentId: string, message?: string) => Promise<boolean>;
}

export const IntroRequestModal: React.FC<IntroRequestModalProps> = ({
  candidateId,
  candidateRole,
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const success = await onSubmit(candidateId, message || undefined);

    setIsSubmitting(false);
    if (success) {
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setMessage('');
        onClose();
      }, 1500);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="glass-panel rounded-2xl w-full max-w-md animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)]">
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">
            Request Introduction
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-[var(--bg-surface-2)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center animate-in fade-in duration-300">
            <div className="w-12 h-12 bg-[var(--success-dim)] rounded-full flex items-center justify-center mx-auto mb-4">
              <Send className="w-6 h-6 text-[var(--success)]" />
            </div>
            <p className="text-[var(--text-primary)] font-medium">Request Sent</p>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              We&apos;ll be in touch shortly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Body */}
            <div className="px-6 py-5 space-y-4">
              <div className="text-sm text-[var(--text-secondary)]">
                Request an introduction to candidate{' '}
                <span className="font-medium text-[var(--text-primary)]">{candidateId}</span>
                {candidateRole && (
                  <>
                    {' '}({candidateRole})
                  </>
                )}
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="intro-message"
                  className="block text-sm font-medium text-[var(--text-secondary)]"
                >
                  Message <span className="text-[var(--text-tertiary)]">(optional)</span>
                </label>
                <textarea
                  id="intro-message"
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us about the role or why this candidate interests you..."
                  className="input-base block w-full rounded-lg p-3 text-sm placeholder-[var(--text-tertiary)] resize-none"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-[var(--border-subtle)]">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                icon={Send}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Sending...' : 'Send Request'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default IntroRequestModal;
