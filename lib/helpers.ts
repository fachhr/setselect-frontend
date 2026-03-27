export function formatTalentId(id: string | null | undefined): string {
  if (!id) return 'N/A';
  const numMatch = id.match(/\d+/);
  if (numMatch) return `REF-${numMatch[0].padStart(3, '0')}`;
  return id;
}

export function formatEntryDate(dateString: string | null | undefined, relative: boolean = false): string {
  if (!dateString) return 'Unknown';

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Invalid date';

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

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatCantons(cantons: string[] | null | undefined, maxDisplay: number = 3): string {
  if (!cantons || cantons.length === 0) return 'Flexible';
  if (cantons.length <= maxDisplay) return cantons.join(', ');
  const displayed = cantons.slice(0, maxDisplay).join(', ');
  const remaining = cantons.length - maxDisplay;
  return `${displayed} +${remaining} more`;
}
