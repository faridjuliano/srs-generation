#!/usr/bin/env python3
"""Download and normalize the Kaggle PURE dataset to JSONL for local search."""
from __future__ import annotations

import json
import re
from datetime import datetime
from pathlib import Path
from typing import List, Optional, Tuple

import kagglehub
import pandas as pd


def collapse_whitespace(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()


def choose_text_and_label_columns(df: pd.DataFrame) -> Tuple[str, Optional[str]]:
    # Prefer object/string columns for text.
    object_cols = [col for col, dtype in df.dtypes.items() if dtype == "object"]
    if not object_cols:
        raise ValueError("No object/string columns found to choose as text column.")

    avg_lengths = {}
    for col in object_cols:
        series = df[col].dropna().astype(str)
        if series.empty:
            continue
        avg_len = series.str.len().mean()
        avg_lengths[col] = avg_len
    if not avg_lengths:
        raise ValueError("No non-empty object columns to choose as text column.")

    text_col = max(avg_lengths, key=avg_lengths.get)

    # Label column heuristic: look for common label-like names other than the text column.
    label_candidates = [
        c for c in object_cols if c != text_col and re.search(r"label|category|class|type|priority", c, re.IGNORECASE)
    ]
    label_col = label_candidates[0] if label_candidates else None

    return text_col, label_col


def load_and_concatenate_csvs(csv_files: List[Path]) -> pd.DataFrame:
    frames = []
    for i, csv_path in enumerate(csv_files):
        try:
            df = pd.read_csv(csv_path, encoding="utf-8", encoding_errors="replace")
        except UnicodeDecodeError:
            df = pd.read_csv(csv_path, encoding="latin-1", encoding_errors="replace")
        df['_csv_index'] = i
        frames.append(df)
    if not frames:
        raise RuntimeError("No CSV files loaded.")
    return pd.concat(frames, ignore_index=True)


def clean_and_filter(df: pd.DataFrame, text_col: str) -> pd.DataFrame:
    df = df.copy()
    df[text_col] = df[text_col].astype(str).map(collapse_whitespace)
    # Drop rows with fewer than 8 words in the text column.
    df = df[df[text_col].apply(lambda t: len(t.split()) >= 8)]
    df = df[df[text_col].str.len() > 0]
    df.reset_index(drop=True, inplace=True)
    return df


def build_records(df: pd.DataFrame, text_col: str, label_col: Optional[str], csv_files: List[Path]) -> List[dict]:
    # Track original source file if present; fallback to unknown
    source_col = None
    for candidate in ['source_file', 'file', 'csv_file']:
        if candidate in df.columns:
            source_col = candidate
            break
    records = []
    for idx, row in df.iterrows():
        text = collapse_whitespace(str(row[text_col]))
        label_val = str(row[label_col]) if label_col and pd.notna(row.get(label_col)) else None
        csv_name = None
        if source_col and pd.notna(row.get(source_col)):
            csv_name = str(row[source_col])
        elif '_csv_index' in df.columns and pd.notna(row.get('_csv_index')):
            try:
                csv_idx = int(row['_csv_index'])
                if 0 <= csv_idx < len(csv_files):
                    csv_name = csv_files[csv_idx].name
            except Exception:
                csv_name = None
        records.append(
            {
                "id": f"PURE-{idx + 1:06d}",
                "text": text,
                "source": "PURE",
                "meta": {
                    "csv_file": csv_name or 'unknown',
                    "text_col": text_col,
                    "label": label_val,
                },
            }
        )
    return records


def main():
    dataset_path = kagglehub.dataset_download("computerscience3/public-requirementspure-dataset")
    print("Path to dataset files:", dataset_path)

    dataset_root = Path(dataset_path)
    csv_files = sorted(dataset_root.rglob("*.csv"))
    if not csv_files:
        raise RuntimeError(f"No CSV files found under {dataset_root}")

    df = load_and_concatenate_csvs(csv_files)
    text_col, label_col = choose_text_and_label_columns(df)
    df_clean = clean_and_filter(df, text_col)

    output_dir = Path("data/pure")
    output_dir.mkdir(parents=True, exist_ok=True)

    docs_path = output_dir / "pure_docs.jsonl"
    meta_path = output_dir / "pure_meta.json"

    records = build_records(df_clean, text_col, label_col, csv_files)

    with docs_path.open("w", encoding="utf-8") as f:
        for rec in records:
            f.write(json.dumps(rec, ensure_ascii=False) + "\n")

    meta = {
        "count": len(records),
        "created_at": datetime.utcnow().isoformat() + "Z",
        "kaggle_path": str(dataset_root),
        "csv_files": [str(p.relative_to(dataset_root)) for p in csv_files],
        "chosen_text_col": text_col,
        "chosen_label_col": label_col,
    }
    meta_path.write_text(json.dumps(meta, indent=2), encoding="utf-8")

    print(f"Wrote {len(records)} docs to {docs_path}")
    print(f"Metadata saved to {meta_path}")


if __name__ == "__main__":
    main()

