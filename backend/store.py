"""Read-only artifact repository. Replace this adapter for future PostgreSQL storage."""

import json
from functools import lru_cache
from pathlib import Path


@lru_cache
def snapshot() -> dict:
    return json.loads(
        (Path(__file__).resolve().parents[1] / "public/data/demo.json").read_text(encoding="utf-8")
    )


def enterprise(enterprise_id: str) -> dict | None:
    return next((e for e in snapshot()["enterprises"] if e["enterprise_id"] == enterprise_id), None)
