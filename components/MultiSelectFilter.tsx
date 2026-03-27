'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Check, ChevronDown, X } from 'lucide-react';

interface MultiSelectFilterProps {
  options: { value: string; label: string }[];
  selected: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
}

export function MultiSelectFilter({ options, selected, onChange, placeholder = 'All' }: MultiSelectFilterProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});

  const updatePosition = useCallback(() => {
    if (open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setDropdownStyle({
        position: 'fixed',
        top: rect.bottom + 4,
        left: rect.left,
        minWidth: Math.max(rect.width, 180),
        zIndex: 50,
      });
    }
  }, [open]);

  useEffect(() => {
    updatePosition();
  }, [updatePosition]);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (
        triggerRef.current && !triggerRef.current.contains(e.target as Node) &&
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const toggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  const hasSelection = selected.length > 0;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen(!open);
        }}
        className={`flex items-center justify-between gap-1 w-full px-2 py-1 rounded text-xs h-7 border font-normal transition-colors cursor-pointer ${
          hasSelection
            ? 'border-[var(--secondary)] bg-[var(--secondary-dim)] text-[var(--text-primary)]'
            : 'border-transparent bg-[var(--bg-surface-1)] text-[var(--text-tertiary)] hover:border-transparent'
        }`}
      >
        <span className="truncate">
          {hasSelection ? `${selected.length} selected` : placeholder}
        </span>
        {hasSelection ? (
          <X
            size={12}
            className="flex-shrink-0 hover:text-[var(--error)]"
            onClick={(e) => {
              e.stopPropagation();
              onChange([]);
            }}
          />
        ) : (
          <ChevronDown size={12} className="flex-shrink-0" />
        )}
      </button>

      {open && (
        <div
          ref={dropdownRef}
          style={dropdownStyle}
          className="bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-lg max-h-60 overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {options.map((opt) => {
            const isSelected = selected.includes(opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => toggle(opt.value)}
                className={`flex items-center gap-2 w-full px-3 py-2 text-xs text-left hover:bg-[var(--bg-surface-2)] transition-colors cursor-pointer ${
                  isSelected ? 'text-[var(--secondary)]' : 'text-[var(--text-secondary)]'
                }`}
              >
                <span className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                  isSelected
                    ? 'border-[var(--secondary)] bg-[var(--secondary)]'
                    : 'border-[var(--border-strong)]'
                }`}>
                  {isSelected && <Check size={10} className="text-[var(--bg-root)]" />}
                </span>
                {opt.label}
              </button>
            );
          })}
        </div>
      )}
    </>
  );
}
