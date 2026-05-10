import { Settings } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';

export default function SettingsPage() {
  return (
    <div className="space-y-5 animate-in fade-in">
      <PageHeader title="Settings" />
      <div className="flex flex-col items-center justify-center h-64">
        <div className="p-4 rounded-lg bg-[var(--bg-surface-2)] mb-4">
          <Settings size={28} className="text-[var(--text-muted)]" />
        </div>
        <h3 className="text-lg font-medium text-[var(--text-primary)]">Settings</h3>
        <p className="text-sm text-[var(--text-muted)] mt-1">Coming soon</p>
      </div>
    </div>
  );
}
