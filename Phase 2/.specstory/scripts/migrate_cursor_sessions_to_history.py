#!/usr/bin/env python3
"""Move .specstory/cursor-sessions/*.md to .specstory/history/ with yyyy-mm-dd-{slug}.md names."""

from __future__ import annotations

import re
import shutil
from pathlib import Path

WORKSPACE: Path = Path(__file__).resolve().parents[2]
SRC: Path = WORKSPACE / ".specstory" / "cursor-sessions"
DST: Path = WORKSPACE / ".specstory" / "history"


def parse_frontmatter_created_at(text: str) -> str | None:
    if not text.startswith("---"):
        return None
    end: int = text.find("\n---\n", 3)
    if end == -1:
        return None
    block: str = text[3:end]
    for line in block.splitlines():
        if line.startswith("created_at:"):
            rest: str = line.split(":", 1)[1].strip()
            # 2026-04-19T14:40:44Z
            m = re.match(r"^(\d{4}-\d{2}-\d{2})", rest)
            if m:
                return m.group(1)
    return None


def extract_first_user_query(text: str) -> str:
    m = re.search(r"### User\s*\n+(.*?)(?=\n---\n|\n### )", text, re.DOTALL)
    if not m:
        return "untitled"
    body: str = m.group(1).strip()
    body = re.sub(r"<image_files>.*?</image_files>", "", body, flags=re.DOTALL | re.IGNORECASE)
    body = re.sub(r"<user_query>\s*", "", body)
    body = re.sub(r"\s*</user_query>", "", body)
    body = re.sub(r"\[Image\][^\n]*\n?", "", body)
    body = " ".join(body.split())
    if len(body) == 0:
        return "untitled"
    return body


def slugify_query(query: str, max_len: int = 90) -> str:
    s: str = query.strip().lower()
    s = re.sub(r"[@#]+", "", s)
    s = re.sub(r"[^a-z0-9]+", "-", s)
    s = re.sub(r"-+", "-", s).strip("-")
    if len(s) == 0:
        return "untitled"
    return s[:max_len].rstrip("-")


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


def main() -> None:
    if not SRC.is_dir():
        raise SystemExit(f"Missing source dir: {SRC}")
    DST.mkdir(parents=True, exist_ok=True)
    files: list[Path] = sorted(SRC.glob("*.md"))
    if len(files) == 0:
        raise SystemExit("No .md files in cursor-sessions")
    used_names: set[str] = set()
    moves: list[tuple[Path, Path, str]] = []
    for src in files:
        text: str = src.read_text(encoding="utf-8")
        date_part: str | None = parse_frontmatter_created_at(text)
        if date_part is None:
            date_part = "1970-01-01"
        first_q: str = extract_first_user_query(text)
        slug: str = slugify_query(first_q)
        new_name: str = f"{date_part}-{slug}.md"
        dest: Path = unique_path(DST / new_name, used_names)
        shutil.move(str(src), str(dest))
        moves.append((src, dest, first_q[:120]))
    # Remove empty cursor-sessions
    try:
        SRC.rmdir()
    except OSError:
        pass
    index_path: Path = WORKSPACE / ".specstory" / "cursor-sessions-INDEX.md"
    lines: list[str] = [
        "# Cursor agent sessions (moved to history)",
        "",
        "Files were moved from `.specstory/cursor-sessions/` to `.specstory/history/` and renamed as `yyyy-mm-dd-{first-user-query-slug}.md`.",
        "",
        "| New path | First user message (truncated) |",
        "|----------|-------------------------------|",
    ]
    for _old, new, preview in moves:
        rel: str = f"history/{new.name}"
        safe_preview: str = preview.replace("|", "\\|").replace("\n", " ")
        lines.append(f"| [`{new.name}`]({rel}) | {safe_preview} |")
    lines.append("")
    lines.append("To re-export raw JSONL → Markdown, run: `python3 .specstory/scripts/export_cursor_sessions_to_markdown.py` (then migrate again if needed).")
    lines.append("")
    index_path.write_text("\n".join(lines), encoding="utf-8")
    for _old, new, _ in moves:
        print(f"{new.name}")


if __name__ == "__main__":
    main()
