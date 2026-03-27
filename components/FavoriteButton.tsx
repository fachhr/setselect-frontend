'use client';

import { Heart } from 'lucide-react';

interface FavoriteButtonProps {
  isFavorite: boolean;
  onToggle: () => void;
  size?: number;
}

export function FavoriteButton({ isFavorite, onToggle, size = 15 }: FavoriteButtonProps) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      className={`p-1.5 sm:p-2 rounded-lg transition-all duration-150 cursor-pointer border ${
        isFavorite
          ? 'text-[var(--error)] bg-[var(--error-dim)] border-[var(--error)]/30 hover:bg-[var(--error)]/20'
          : 'text-[var(--text-tertiary)] hover:text-[var(--error)] border-[var(--border-subtle)] hover:bg-[var(--bg-surface-2)]'
      }`}
      aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
      title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
    >
      <Heart
        size={size}
        fill={isFavorite ? 'currentColor' : 'none'}
      />
    </button>
  );
}
