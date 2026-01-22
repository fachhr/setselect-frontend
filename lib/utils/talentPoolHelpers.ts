import { SeniorityLevel } from '@/types/talentPool';

/**
 * Calculate seniority level based on years of experience
 * This is computed dynamically (not stored in database) for maximum flexibility
 */
export function getSeniorityLevel(years: number | string | null | undefined): SeniorityLevel {
  if (years === null || years === undefined) {
    return 'not_specified';
  }

  const yearsNum = typeof years === 'string' ? parseFloat(years) : years;

  if (isNaN(yearsNum)) {
    return 'not_specified';
  }

  if (yearsNum <= 2) {
    return 'junior';
  } else if (yearsNum <= 6) {
    return 'mid';
  } else {
    return 'senior';
  }
}

/**
 * Get human-readable seniority label
 */
export function getSeniorityLabel(level: SeniorityLevel): string {
  const labels: Record<SeniorityLevel, string> = {
    junior: 'Junior',
    mid: 'Mid-level',
    senior: 'Senior',
    not_specified: 'Not specified'
  };
  return labels[level];
}

/**
 * Get years range for a seniority level (for filtering)
 */
export function getSeniorityYearsRange(level: SeniorityLevel): { min: number; max: number | null } | null {
  switch (level) {
    case 'junior':
      return { min: 0, max: 2 };
    case 'mid':
      return { min: 3, max: 6 };
    case 'senior':
      return { min: 7, max: null };
    default:
      return null;
  }
}

/**
 * Format salary for display
 * Examples: "CHF 120K - 150K", "CHF 100K+", "Negotiable"
 */
export function formatSalary(min: number | null | undefined, max: number | null | undefined): string {
  if (!min && !max) {
    return 'Negotiable';
  }

  const formatAmount = (amount: number): string => {
    if (amount >= 1000) {
      return `${Math.round(amount / 1000)}K`;
    }
    return amount.toString();
  };

  if (min && max) {
    return `CHF ${formatAmount(min)} - ${formatAmount(max)}`;
  } else if (min) {
    return `CHF ${formatAmount(min)}+`;
  } else if (max) {
    return `Up to CHF ${formatAmount(max)}`;
  }

  return 'Negotiable';
}

/**
 * Format talent ID for display
 * Ensures consistent REF-XXX format
 */
export function formatTalentId(id: string | null | undefined): string {
  if (!id) {
    return 'N/A';
  }

  // If already in correct format, return as-is
  if (id.match(/^REF-\d+$/)) {
    return id;
  }

  // Otherwise, try to extract number and format
  const numMatch = id.match(/\d+/);
  if (numMatch) {
    return `REF-${numMatch[0].padStart(3, '0')}`;
  }

  return id;
}

/**
 * Format date for display
 * Examples: "Jan 15, 2025", "2 days ago"
 */
export function formatEntryDate(dateString: string | null | undefined, relative: boolean = false): string {
  if (!dateString) {
    return 'Unknown';
  }

  const date = new Date(dateString);

  if (isNaN(date.getTime())) {
    return 'Invalid date';
  }

  if (relative) {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  }

  // Format as "Jan 15, 2025"
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

/**
 * Format years of experience for display
 */
export function formatYearsExperience(years: number | string | null | undefined): string {
  if (years === null || years === undefined) {
    return 'Not specified';
  }

  const yearsNum = typeof years === 'string' ? parseFloat(years) : years;

  if (isNaN(yearsNum)) {
    return 'Not specified';
  }

  if (yearsNum === 1) {
    return '1 year';
  }

  // Handle decimals (e.g., 2.5 years)
  if (yearsNum % 1 !== 0) {
    return `${yearsNum.toFixed(1)} years`;
  }

  return `${yearsNum} years`;
}

/**
 * Format cantons list for display
 * Shows first few cantons + count of remaining
 */
export function formatCantons(cantons: string[] | null | undefined, maxDisplay: number = 3): string {
  if (!cantons || cantons.length === 0) {
    return 'Flexible';
  }

  if (cantons.length <= maxDisplay) {
    return cantons.join(', ');
  }

  const displayed = cantons.slice(0, maxDisplay).join(', ');
  const remaining = cantons.length - maxDisplay;
  return `${displayed} +${remaining} more`;
}
