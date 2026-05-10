const EMBEDDING_MODEL = 'text-embedding-3-small';
const EMBEDDING_DIMENSIONS = 1536;

interface EmbeddableCandidate {
  desired_roles?: string | null;
  short_summary?: string | null;
  highlight?: string | null;
  profile_bio?: string | null;
  functional_expertise?: string[] | null;
  technical_skills?: Record<string, unknown>[] | null;
  professional_experience?: Record<string, unknown>[] | null;
  education_history?: Record<string, unknown>[] | null;
  languages?: { language: string; proficiency?: string }[] | null;
  work_eligibility?: string | null;
  desired_locations?: string[] | null;
}

function serializeJsonField(items: Record<string, unknown>[] | null | undefined): string {
  if (!items?.length) return '';
  return items
    .map(item =>
      Object.values(item)
        .filter(v => typeof v === 'string' && v.length > 0)
        .join(' ')
    )
    .join('. ');
}

export function buildEmbeddingText(c: EmbeddableCandidate): string {
  const sections: string[] = [];

  if (c.desired_roles) sections.push(`Roles: ${c.desired_roles}`);
  if (c.short_summary) sections.push(c.short_summary);
  if (c.highlight) sections.push(c.highlight);
  if (c.profile_bio) sections.push(c.profile_bio);

  if (c.functional_expertise?.length) {
    sections.push(`Skills: ${c.functional_expertise.join(', ')}`);
  }

  const techSkills = serializeJsonField(c.technical_skills);
  if (techSkills) sections.push(`Technical: ${techSkills}`);

  const experience = serializeJsonField(c.professional_experience);
  if (experience) sections.push(`Experience: ${experience}`);

  const education = serializeJsonField(c.education_history);
  if (education) sections.push(`Education: ${education}`);

  if (c.languages?.length) {
    sections.push(`Languages: ${c.languages.map(l => l.language).join(', ')}`);
  }

  if (c.desired_locations?.length) {
    sections.push(`Locations: ${c.desired_locations.join(', ')}`);
  }

  if (c.work_eligibility) sections.push(`Eligibility: ${c.work_eligibility}`);

  return sections.filter(Boolean).join('\n');
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('Missing OPENAI_API_KEY environment variable');

  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: EMBEDDING_MODEL,
      input: text,
      dimensions: EMBEDDING_DIMENSIONS,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenAI embedding failed (${response.status}): ${err}`);
  }

  const data = await response.json();
  return data.data[0].embedding;
}

export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('Missing OPENAI_API_KEY environment variable');

  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: EMBEDDING_MODEL,
      input: texts,
      dimensions: EMBEDDING_DIMENSIONS,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenAI embedding failed (${response.status}): ${err}`);
  }

  const data = await response.json();
  return data.data
    .sort((a: { index: number }, b: { index: number }) => a.index - b.index)
    .map((d: { embedding: number[] }) => d.embedding);
}
