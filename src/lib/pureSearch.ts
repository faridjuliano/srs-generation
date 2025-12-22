import 'server-only';

import fs from 'node:fs';
import path from 'node:path';
import MiniSearch, { Options, SearchResult } from 'minisearch';

export interface PureDoc {
  id: string;
  text: string;
  source: string;
  meta?: Record<string, unknown>;
}

let cachedIndex: MiniSearch<PureDoc> | null = null;
let cachedDocs: PureDoc[] | null = null;

const DOCS_PATH = path.join(process.cwd(), 'data', 'pure', 'pure_docs.jsonl');

function loadDocs(): PureDoc[] {
  if (!fs.existsSync(DOCS_PATH)) {
    throw new Error(`PURE docs not found at ${DOCS_PATH}. Run python scripts/download_and_prepare_pure.py first.`);
  }
  const raw = fs.readFileSync(DOCS_PATH, 'utf8');
  const docs: PureDoc[] = raw
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => JSON.parse(line));
  return docs;
}

function buildIndex(): MiniSearch<PureDoc> {
  if (cachedIndex && cachedDocs) return cachedIndex;

  const docs = loadDocs();
  const options: Options<PureDoc> = {
    fields: ['text', 'source'],
    storeFields: ['id', 'text', 'source', 'meta'],
    searchOptions: {
      prefix: true,
      combineWith: 'AND',
      fuzzy: 0.2,
      boost: { text: 2 },
    },
  };
  const mini = new MiniSearch<PureDoc>(options);
  mini.addAll(docs);
  cachedIndex = mini;
  cachedDocs = docs;
  return mini;
}

export async function searchPure(query: string, topK = 8) {
  const index = buildIndex();
  const results: SearchResult[] = index.search(query, { prefix: true, combineWith: 'AND', fuzzy: 0.2, boost: { text: 2 } });
  return results.slice(0, topK).map((r) => ({
    id: r.id as string,
    score: r.score,
    text: r.text as string,
    source: r.source as string,
    meta: r.meta as Record<string, unknown> | undefined,
  }));
}

