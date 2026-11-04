#!/usr/bin/env python3
"""Cheap repository checks. No network, credentials, or target-skill execution."""
import json
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]


def validate_skill(path):
    errors = []
    text = path.read_text()
    parts = text.split("---", 2)
    if len(parts) != 3 or parts[0].strip():
        return [f"{path}: missing frontmatter"]
    # Required scalars use plain one-line or JSON-quoted YAML strings here.
    # Other metadata is retained; this is not a general YAML parser.
    values = {}
    for key in ("name", "description"):
        matches = re.findall(rf"^{key}:\s*(\S[^\n]*)$", parts[1], re.M)
        if len(matches) != 1:
            errors.append(f"{path}: require one single-line {key}")
            continue
        raw = matches[0].strip()
        try:
            value = json.loads(raw) if raw.startswith('"') else raw
        except json.JSONDecodeError:
            errors.append(f"{path}: invalid quoted {key}")
            continue
        if not isinstance(value, str) or raw.startswith(("'", "|", ">", "[", "{")):
            errors.append(f"{path}: unsupported {key} scalar; use plain or JSON-quoted text")
            continue
        values[key] = value
    name = values.get("name", "")
    if not 1 <= len(name) <= 64 or not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", name):
        errors.append(f"{path}: invalid name")
    if name != path.parent.name:
        errors.append(f"{path}: name must match directory")
    if not 1 <= len(values.get("description", "")) <= 1024:
        errors.append(f"{path}: description length")
    for target in re.findall(r"\]\(([^)]+)\)", parts[2]):
        if "://" in target or target.startswith(("#", "mailto:")):
            continue
        resolved = (path.parent / target.split("#")[0]).resolve()
        if not resolved.is_relative_to(path.parent.resolve()) or not resolved.is_file():
            errors.append(f"{path}: missing or nonportable reference {target}")
    return errors


def main():
    errors = []
    skills = sorted((ROOT / "skills").glob("*/SKILL.md"))
    if not skills:
        errors.append("expected at least one skills/<name>/SKILL.md")
    discovered = list(ROOT.rglob("SKILL.md"))
    discovered = [p for p in discovered if not any(x.startswith(".") for x in p.relative_to(ROOT).parts)]
    if set(discovered) != set(skills):
        errors.append("unintended discoverable SKILL.md outside catalog")
    for path in skills:
        errors.extend(validate_skill(path))
    for path in ROOT.rglob("*.md"):
        if any(x.startswith(".") for x in path.relative_to(ROOT).parts):
            continue
        for target in re.findall(r"\]\(([^)]+)\)", path.read_text()):
            if "://" in target or target.startswith(("#", "mailto:")):
                continue
            if not (path.parent / target.split("#")[0]).exists():
                errors.append(f"{path}: broken local link {target}")
    for path in ROOT.rglob("*"):
        if path.is_symlink() and not any(x.startswith(".") for x in path.relative_to(ROOT).parts):
            errors.append(f"symlinks are not allowed in the release tree: {path}")
    if errors:
        print("\n".join(errors), file=sys.stderr)
        return 1
    print(f"Structural checks passed: {len(skills)} skill(s). Behavior not evaluated.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
