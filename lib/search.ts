import type { RecruiterCandidateView } from '@/types/recruiter';

function extractStrings(obj: Record<string, unknown>): string[] {
  const parts: string[] = [];
  for (const val of Object.values(obj)) {
    if (typeof val === 'string') parts.push(val);
  }
  return parts;
}

function buildSearchableText(c: RecruiterCandidateView): string {
  const parts: string[] = [
    c.contact_first_name,
    c.contact_last_name,
    c.email,
    c.desired_roles || '',
    c.talent_id || '',
    c.phoneNumber || '',
    c.country_code || '',
    c.work_eligibility || '',
    c.highlight || '',
    c.short_summary || '',
    c.profile_bio || '',
    ...(c.desired_locations || []),
    ...(c.functional_expertise || []),
    ...(c.languages || []).flatMap(l => [l.language, l.proficiency || '']),
    ...(c.education_history || []).flatMap(e => extractStrings(e as Record<string, unknown>)),
    ...(c.professional_experience || []).flatMap(e => extractStrings(e as Record<string, unknown>)),
    ...(c.technical_skills || []).flatMap(e => extractStrings(e as Record<string, unknown>)),
  ];
  return parts.filter(Boolean).join(' ');
}

export function deepSearchCandidate(candidate: RecruiterCandidateView, query: string): boolean {
  const q = query.trim();
  if (!q) return true;

  const terms = q.toLowerCase().split(/\s+/);
  const text = buildSearchableText(candidate).toLowerCase();

  return terms.every(term => text.includes(term));
}

export function scoreCandidate(candidate: RecruiterCandidateView, query: string): number {
  const q = query.trim();
  if (!q) return 0;

  const terms = q.toLowerCase().split(/\s+/);
  let score = 0;

  const name = `${candidate.contact_first_name} ${candidate.contact_last_name}`.toLowerCase();
  const roles = (candidate.desired_roles || '').toLowerCase();
  const skills = (candidate.functional_expertise || []).map(s => s.toLowerCase());
  const summary = (candidate.short_summary || '').toLowerCase();

  for (const term of terms) {
    if (name.includes(term)) score += 10;
    if (roles.includes(term)) score += 8;
    if (skills.some(s => s === term)) score += 7;
    if (skills.some(s => s.includes(term))) score += 4;
    if (summary.includes(term)) score += 3;
    if ((candidate.highlight || '').toLowerCase().includes(term)) score += 3;
  }

  return score;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function buildHighlightRegex(query: string): RegExp | null {
  const q = query.trim();
  if (!q) return null;
  const terms = q.split(/\s+/).filter(Boolean).map(escapeRegex);
  if (terms.length === 0) return null;
  return new RegExp(`(${terms.join('|')})`, 'gi');
}
