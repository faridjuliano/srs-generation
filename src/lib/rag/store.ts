import { promises as fs } from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { embedTextLocal, cosineSimilarityTf, TfMap } from './embeddings';

export interface StoredChunk {
  id: string;
  text: string;
  source?: string;
  embedding: TfMap;
}

const DATA_DIR = path.join(process.cwd(), '.data');
const STORE_PATH = path.join(DATA_DIR, 'vector-store.json');

async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

export async function loadStore(): Promise<StoredChunk[]> {
  try {
    const raw = await fs.readFile(STORE_PATH, 'utf8');
    return JSON.parse(raw) as StoredChunk[];
  } catch {
    return [];
  }
}

export async function saveStore(items: StoredChunk[]) {
  await ensureDataDir();
  await fs.writeFile(STORE_PATH, JSON.stringify(items, null, 2), 'utf8');
}

function splitIntoChunks(text: string, maxLen = 800): string[] {
  const sentences = text
    .replace(/\r\n/g, '\n')
    .split(/(?<=[.!?])\s+/);
  const chunks: string[] = [];
  let current = '';
  for (const s of sentences) {
    if ((current + ' ' + s).trim().length > maxLen) {
      if (current) chunks.push(current.trim());
      current = s;
    } else {
      current = (current + ' ' + s).trim();
    }
  }
  if (current) chunks.push(current.trim());
  return chunks;
}

export async function ingestText(text: string, source?: string): Promise<number> {
  const store = await loadStore();
  const chunks = splitIntoChunks(text);
  const toAdd: StoredChunk[] = [];
  for (const chunk of chunks) {
    const embedding = embedTextLocal(chunk);
    toAdd.push({ id: randomUUID(), text: chunk, source, embedding });
  }
  const all = [...store, ...toAdd];
  await saveStore(all);
  return toAdd.length;
}

export async function searchSimilar(query: string, topK = 4): Promise<StoredChunk[]> {
  const store = await loadStore();
  if (store.length === 0) return [];
  const qEmb = embedTextLocal(query);
  const scored = store.map((item) => ({ item, score: cosineSimilarityTf(qEmb, item.embedding) }));
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK).map((s) => s.item);
}

export async function clearStore() {
  await saveStore([]);
}
