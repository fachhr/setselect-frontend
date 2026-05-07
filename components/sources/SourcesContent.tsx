'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ExternalLink, AlertTriangle, CheckCircle2, Circle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui';

interface Source {
  id: string;
  company_name: string;
  career_url: string;
  coverage_status: 'tracked' | 'limited_support';
  coverage_note: string | null;
  last_scraped_at: string | null;
  fetch_mode: string;
  platform_hint: string | null;
  active_count: number;
  lifetime_count: number;
}

function timeAgo(iso: string | null): string {
  if (!iso) return 'never';
  const ms = Date.now() - new Date(iso).getTime();
  const m = Math.floor(ms / 60_000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

function deriveBadge(s: Source) {
  if (s.coverage_status === 'limited_support') {
    return { label: 'Limited support', style: 'gold' as const, Icon: AlertTriangle };
  }
  if (s.active_count > 0) {
    return { label: `${s.active_count} active`, style: 'success' as const, Icon: CheckCircle2 };
  }
  if (s.lifetime_count > 0) {
    return { label: 'No active roles', style: 'outline' as const, Icon: Circle };
  }
  return { label: 'No Swiss roles found yet', style: 'default' as const, Icon: Circle };
}

export default function SourcesContent() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const [sources, setSources] = useState<Source[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.replace('/login');
      return;
    }
    if (!user) return;
    fetch('/api/sources')
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setSources(d.sources);
      })
      .catch((e) => setError(String(e)));
  }, [user, isAuthLoading, router]);

  if (isAuthLoading || (!sources && !error)) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-[var(--text-secondary)]">Loading…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-[var(--danger)]">Failed to load sources: {error}</div>
      </div>
    );
  }

  const tracked = sources!.filter((s) => s.coverage_status === 'tracked');
  const limited = sources!.filter((s) => s.coverage_status === 'limited_support');
  const totalActive = tracked.reduce((sum, s) => sum + s.active_count, 0);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="font-title text-3xl font-bold tracking-tight text-[var(--text-primary)]">
          Tracked Sources
        </h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          {sources!.length} companies tracked · {totalActive} active Swiss roles · {limited.length} with limited support
        </p>
      </div>

      {limited.length > 0 && (
        <section className="mb-10">
          <h2 className="font-title text-sm font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-3">
            Limited support — alerts may miss roles
          </h2>
          <div className="rounded-lg border border-[var(--border-subtle)] divide-y divide-[var(--border-subtle)] bg-[var(--bg-surface-1)]">
            {limited.sort((a, b) => a.company_name.localeCompare(b.company_name)).map((s) => (
              <SourceRow key={s.id} source={s} />
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="font-title text-sm font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-3">
          Tracked
        </h2>
        <div className="rounded-lg border border-[var(--border-subtle)] divide-y divide-[var(--border-subtle)] bg-[var(--bg-surface-1)]">
          {tracked
            .sort((a, b) => b.active_count - a.active_count || a.company_name.localeCompare(b.company_name))
            .map((s) => (
              <SourceRow key={s.id} source={s} />
            ))}
        </div>
      </section>
    </div>
  );
}

function SourceRow({ source: s }: { source: Source }) {
  const { label, style, Icon } = deriveBadge(s);
  return (
    <div className="flex items-start gap-4 px-4 py-3.5">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3">
          <span className="font-medium text-[var(--text-primary)] truncate">{s.company_name}</span>
          <Badge style={style} icon={Icon}>{label}</Badge>
        </div>
        <div className="mt-1 text-xs text-[var(--text-secondary)] flex items-center gap-2">
          <span>Last scrape: {timeAgo(s.last_scraped_at)}</span>
          <span>·</span>
          <a
            href={s.career_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 hover:text-[var(--text-primary)] transition-colors"
          >
            Career page <ExternalLink className="w-3 h-3" />
          </a>
        </div>
        {s.coverage_status === 'limited_support' && s.coverage_note && (
          <p className="mt-2 text-xs text-[var(--text-secondary)] leading-relaxed">{s.coverage_note}</p>
        )}
      </div>
    </div>
  );
}
