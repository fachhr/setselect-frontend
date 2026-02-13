import { Settings } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="flex flex-col items-center justify-center h-64 animate-in fade-in">
      <div className="p-4 rounded-xl bg-[var(--bg-surface-2)] mb-4">
        <Settings size={28} className="text-[var(--text-muted)]" />
      </div>
      <h3 className="text-lg font-medium text-[var(--text-primary)]">Settings</h3>
      <p className="text-sm text-[var(--text-muted)] mt-1">Coming soon</p>
    </div>
  );
}
