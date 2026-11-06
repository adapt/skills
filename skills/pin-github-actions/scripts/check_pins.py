#!/usr/bin/env python3
"""Fail when a GitHub Actions `uses:` reference is not pinned to an immutable ID."""
from pathlib import Path
import re
import sys

USES = re.compile(r"""^\s*(?:-\s*)?uses:\s*(["']?)([^\s"'#]+)\1""")
COMMIT = re.compile(r"@[0-9a-f]{40}$")
DIGEST = re.compile(r"@sha256:[0-9a-f]{64}$")


def files(root):
    workflows = root / ".github" / "workflows"
    yield from sorted(workflows.glob("*.yml"))
    yield from sorted(workflows.glob("*.yaml"))
    for path in sorted(root.rglob("action.y*ml")):
        if path.suffix in (".yml", ".yaml") and ".git" not in path.relative_to(root).parts:
            yield path


def unpinned(ref):
    if ref.startswith("./"):
        return False  # versioned with this repository
    if ref.startswith("docker://"):
        return not DIGEST.search(ref)
    return not COMMIT.search(ref)


def main():
    root = Path(sys.argv[1] if len(sys.argv) > 1 else ".").resolve()
    failures = []
    for path in files(root):
        for number, line in enumerate(path.read_text().splitlines(), 1):
            match = USES.match(line)
            if match and unpinned(match.group(2)):
                failures.append(f"{path.relative_to(root)}:{number}: {match.group(2)}")
    if failures:
        print("Unpinned action references (use a full commit SHA or image digest):", file=sys.stderr)
        print("\n".join(failures), file=sys.stderr)
        return 1
    print("All action references are pinned.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
