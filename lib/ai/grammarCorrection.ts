import OpenAI from 'openai';

let _openai: OpenAI | null = null;
function getOpenAI() {
  if (!_openai) _openai = new OpenAI();
  return _openai;
}

interface GrammarFields {
  highlight?: string | null;
  desired_roles?: string | null;
  other_expertise?: string | null;
  languages?: string[] | null;
}

const SYSTEM_PROMPT = `You correct grammar, spelling, and capitalization in form field values. Nothing else.
Rules:
- Fix errors only. Do NOT rephrase, reword, or add content.
- Preserve delimiters: semicolons (;) separate items in desired_roles and other_expertise.
- Capitalize the first letter of each list item and proper nouns.
- For the "languages" array: fix spelling, capitalize language names properly, and split any entry that contains commas or semicolons into separate entries (e.g., ["english, spanish"] → ["English", "Spanish"]). Deduplicate.
- Return JSON with the exact same field names as the input.
- If a field is already correct, return it unchanged.`;

export async function correctGrammar(fields: GrammarFields): Promise<GrammarFields> {
  // Build payload with only non-empty fields
  const payload: Record<string, string | string[]> = {};
  for (const [key, value] of Object.entries(fields)) {
    if (value === null || value === undefined) continue;
    if (typeof value === 'string' && value.trim() === '') continue;
    if (Array.isArray(value) && value.length === 0) continue;
    payload[key] = value;
  }

  if (Object.keys(payload).length === 0) {
    return fields;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const response = await getOpenAI().chat.completions.create(
      {
        model: 'gpt-4o-mini',
        temperature: 0,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: JSON.stringify(payload) },
        ],
      },
      { signal: controller.signal }
    );

    clearTimeout(timeout);

    const content = response.choices[0]?.message?.content;
    if (!content) {
      console.warn('[Grammar] Empty response from OpenAI');
      return fields;
    }

    const corrected = JSON.parse(content) as Record<string, string | string[]>;

    // Log corrections
    for (const [key, original] of Object.entries(payload)) {
      const fixed = corrected[key];
      if (fixed !== undefined && JSON.stringify(fixed) !== JSON.stringify(original)) {
        console.log(`[Grammar] ${key}: ${JSON.stringify(original)} → ${JSON.stringify(fixed)}`);
      }
    }

    // Only keep keys we sent — ignore any extras OpenAI may have added
    const filtered: Record<string, string | string[]> = {};
    for (const key of Object.keys(payload)) {
      if (key in corrected) filtered[key] = corrected[key];
    }

    return {
      ...fields,
      ...filtered,
    } as GrammarFields;
  } catch (err) {
    console.error('[Grammar] OpenAI call failed:', err);
    return fields;
  }
}
