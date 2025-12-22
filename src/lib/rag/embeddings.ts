// Local text vectorization utilities (no external AI dependencies)

export type TfMap = Record<string, number>;

const STOP_WORDS = new Set([
  'the','a','an','and','or','but','if','then','else','when','at','by','from','for','in','into','of','on','to','with','as','is','are','was','were','be','been','being','that','this','these','those','it','its','we','you','they','i','he','she','them','our','your','their'
]);

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOP_WORDS.has(t));
}

export function toTf(tokens: string[]): TfMap {
  const map: TfMap = {};
  for (const t of tokens) map[t] = (map[t] || 0) + 1;
  return map;
}

export function embedTextLocal(text: string): TfMap {
  return toTf(tokenize(text));
}

export function cosineSimilarityTf(a: TfMap, b: TfMap): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (const k in a) {
    const av = a[k];
    normA += av * av;
    const bv = b[k];
    if (bv) dot += av * bv;
  }
  for (const k in b) {
    const bv = b[k];
    normB += bv * bv;
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}
