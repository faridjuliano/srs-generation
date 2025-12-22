# PURE Dataset Integration

## Prerequisites
- Python 3.9+
- Kaggle credentials set up for `kagglehub`
- Node.js 18+

## Install Python deps
```bash
pip install kagglehub pandas
```

## Download and prepare PURE
```bash
python scripts/download_and_prepare_pure.py
```
Outputs:
- `data/pure/pure_docs.jsonl`
- `data/pure/pure_meta.json`

## Install Node deps
```bash
npm install minisearch zod
```

## Retrieval debug endpoint
```bash
curl -X POST http://localhost:3000/api/pure/search \
  -H "Content-Type: application/json" \
  -d '{"query":"login authentication", "topK":5}'
```

## Chat route behavior
- POST to `app/api/chat/route.ts` now includes `retrieved` with PURE matches.
- If message contains "generate SRS" it returns a Markdown SRS skeleton using retrieved snippets.
- Otherwise responds with helpful guidance and any retrieved snippets for context.

## Notes
- If `pure_docs.jsonl` is missing, server will throw an explicit error instructing you to run the Python script.
- Retrieval uses MiniSearch with prefix + fuzzy search; adjust in `src/lib/pureSearch.ts` if needed.

