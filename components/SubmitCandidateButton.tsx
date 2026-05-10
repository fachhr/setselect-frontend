'use client';

import { useRouter } from 'next/navigation';
import { UserPlus } from 'lucide-react';

export function SubmitCandidateButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push('/candidates/new')}
      className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md cursor-pointer transition-colors bg-[var(--primary-dim)] text-[var(--primary-hover)] hover:bg-[var(--primary)] hover:text-white"
    >
      <UserPlus size={14} />
      <span className="hidden lg:inline">Add Candidate</span>
    </button>
  );
}
