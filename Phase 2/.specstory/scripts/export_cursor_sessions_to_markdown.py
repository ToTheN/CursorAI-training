#!/usr/bin/env python3
"""Export Cursor agent transcript JSONL files to Markdown under .specstory/history/."""

from __future__ import annotations

import json
import re
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

WORKSPACE_ROOT: Path = Path(__file__).resolve().parents[2]
SPECSTORY: Path = WORKSPACE_ROOT / ".specstory"
HEADERS_PATH: Path = SPECSTORY / "_composer_headers_raw.json"
TRANSCRIPTS_ROOT: Path = (
    Path.home()
    / ".cursor"
    / "projects"
    / "Users-tusharsaini-CursorAI-training-Phase-2"
    / "agent-transcripts"
)
OUT_DIR: Path = SPECSTORY / "history"


def slugify_query(query: str, max_len: int = 90) -> str:
    s: str = query.strip().lower()
    s = re.sub(r"[@#]+", "", s)
    s = re.sub(r"[^a-z0-9]+", "-", s)
    s = re.sub(r"-+", "-", s).strip("-")
    if len(s) == 0:
        return "untitled"
    return s[:max_len].rstrip("-")


def extract_first_user_text_from_jsonl(lines: list[str]) -> str:
    for line in lines:
        line = line.strip()
        if len(line) == 0:
            continue
        try:
            obj: dict[str, Any] = json.loads(line)
        except json.JSONDecodeError:
            continue
        if obj.get("role") != "user":
            continue
        msg: dict[str, Any] = obj.get("message") or {}
        content: Any = msg.get("content")
        chunks: list[str] = []
        if isinstance(content, list):
            for part in content:
                if isinstance(part, dict) and part.get("type") == "text":
                    chunks.append(str(part.get("text", "")))
        elif isinstance(content, str):
            chunks.append(content)
        body: str = " ".join(chunks)
        body = re.sub(r"<image_files>.*?</image_files>", "", body, flags=re.DOTALL | re.IGNORECASE)
        body = re.sub(r"<user_query>\s*", "", body)
        body = re.sub(r"\s*</user_query>", "", body)
        body = re.sub(r"\[Image\][^\n]*\n?", "", body)
        body = " ".join(body.split())
        if len(body) > 0:
            return body
    return "untitled"


def unique_path(base: Path, used: set[str]) -> Path:
    if str(base) not in used and not base.exists():
        used.add(str(base))
        return base
    stem: str = base.stem
    suffix: str = base.suffix
    parent: Path = base.parent
    n: int = 2
    while True:
        candidate: Path = parent / f"{stem}-{n}{suffix}"
        if str(candidate) not in used and not candidate.exists():
            used.add(str(candidate))
            return candidate
        n += 1


def ms_to_iso(ms: int | None) -> str | None:
    if ms is None:
        return None
    return datetime.fromtimestamp(ms / 1000.0, tz=timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def date_yyyy_mm_dd(ms: int | None) -> str:
    if ms is None:
        return "1970-01-01"
    return datetime.fromtimestamp(ms / 1000.0, tz=timezone.utc).strftime("%Y-%m-%d")


def load_composer_meta() -> dict[str, dict[str, Any]]:
    if not HEADERS_PATH.is_file():
        return {}
    raw: dict[str, Any] = json.loads(HEADERS_PATH.read_text(encoding="utf-8"))
    out: dict[str, dict[str, Any]] = {}
    for item in raw.get("allComposers", []):
        cid: str | None = item.get("composerId")
        if cid is None or not isinstance(cid, str):
            continue
        out[cid] = item
    return out


def format_content_part(part: dict[str, Any], max_tool_json: int) -> str:
    ptype: str = str(part.get("type", ""))
    if ptype == "text":
        return str(part.get("text", ""))
    if ptype == "tool_use":
        name: str = str(part.get("name", "tool"))
        inp: Any = part.get("input")
        try:
            body: str = json.dumps(inp, ensure_ascii=False, indent=2)
        except (TypeError, ValueError):
            body = str(inp)
        if len(body) > max_tool_json:
            body = body[:max_tool_json] + "\n… (truncated)"
        return f"\n**Tool:** `{name}`\n\n```json\n{body}\n```\n"
    if ptype == "tool_result":
        return "\n*(tool result omitted in export)*\n"
    return f"\n*(content part type `{ptype}` omitted)*\n"


def jsonl_to_markdown(lines: list[str], max_tool_json: int = 12000) -> str:
    blocks: list[str] = []
    for line in lines:
        line = line.strip()
        if len(line) == 0:
            continue
        try:
            obj: dict[str, Any] = json.loads(line)
        except json.JSONDecodeError:
            blocks.append(f"```\n{line[:500]}\n```\n")
            continue
        role: str = str(obj.get("role", "unknown"))
        msg: dict[str, Any] = obj.get("message") or {}
        content: Any = msg.get("content")
        heading: str = "### User" if role == "user" else "### Assistant"
        if role not in ("user", "assistant"):
            heading = f"### {role.capitalize()}"
        parts_text: list[str] = []
        if isinstance(content, list):
            for part in content:
                if isinstance(part, dict):
                    parts_text.append(format_content_part(part, max_tool_json))
                else:
                    parts_text.append(str(part))
        elif isinstance(content, str):
            parts_text.append(content)
        else:
            parts_text.append(json.dumps(content, ensure_ascii=False) if content is not None else "")
        body: str = "".join(parts_text).strip()
        blocks.append(f"{heading}\n\n{body}\n")
    return "\n---\n\n".join(blocks) + "\n"


def main() -> None:
    meta: dict[str, dict[str, Any]] = load_composer_meta()
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    jsonl_files: list[Path] = sorted(TRANSCRIPTS_ROOT.glob("*/*.jsonl"))
    if len(jsonl_files) == 0:
        raise SystemExit(f"No JSONL transcripts under {TRANSCRIPTS_ROOT}")
    index_lines: list[str] = [
        "# Cursor agent sessions export",
        "",
        "Output directory: `.specstory/history/`",
        "",
        "Files are named `yyyy-mm-dd-{slug-from-first-user-message}.md` (date from `createdAt` in `composer.composerHeaders`).",
        "",
        "Source transcripts: `~/.cursor/projects/Users-tusharsaini-CursorAI-training-Phase-2/agent-transcripts/`",
        "",
        "Refresh headers snapshot: `sqlite3 ~/Library/Application\\\\ Support/Cursor/User/globalStorage/state.vscdb \"SELECT value FROM ItemTable WHERE key='composer.composerHeaders';\" > .specstory/_composer_headers_raw.json`",
        "",
        "| # | Session | Composer ID | Exported file |",
        "|---|---------|---------------|---------------|",
    ]
    used_names: set[str] = set()
    for i, jpath in enumerate(jsonl_files, start=1):
        session_id: str = jpath.parent.name
        m: dict[str, Any] = meta.get(session_id, {})
        title: str = str(m.get("name") or m.get("subtitle") or session_id)
        raw_lines: list[str] = jpath.read_text(encoding="utf-8").splitlines()
        first_q: str = extract_first_user_text_from_jsonl(raw_lines)
        slug: str = slugify_query(first_q)
        date_part: str = date_yyyy_mm_dd(m.get("createdAt"))
        fname: str = f"{date_part}-{slug}.md"
        out_path: Path = unique_path(OUT_DIR / fname, used_names)
        fname = out_path.name
        conversation_md: str = jsonl_to_markdown(raw_lines)
        created: str | None = ms_to_iso(m.get("createdAt"))
        updated: str | None = ms_to_iso(m.get("lastUpdatedAt"))
        mode: str | None = m.get("unifiedMode")
        subtitle: str | None = m.get("subtitle")
        front: list[str] = [
            "---",
            f"title: {json.dumps(title)}",
            f"composer_id: {session_id}",
            f"source_jsonl: {jpath}",
        ]
        if created:
            front.append(f"created_at: {created}")
        if updated:
            front.append(f"last_updated_at: {updated}")
        if mode:
            front.append(f"unified_mode: {mode}")
        if subtitle:
            front.append(f"subtitle: {json.dumps(subtitle)}")
        front.append("---")
        front.append("")
        full: str = "\n".join(front) + f"# {title}\n\n" + conversation_md
        out_path.write_text(full, encoding="utf-8")
        index_lines.append(
            f"| {i} | {title} | `{session_id}` | [`{fname}`](history/{fname}) |"
        )
    index_path: Path = SPECSTORY / "cursor-sessions-INDEX.md"
    index_path.write_text("\n".join(index_lines) + "\n", encoding="utf-8")
    print(f"Wrote {len(jsonl_files)} sessions to {OUT_DIR}")
    print(f"Index: {index_path}")


if __name__ == "__main__":
    main()
