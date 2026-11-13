// Fails CI when a GitHub Actions `uses:` isn't pinned to a full commit SHA or image digest.
// Tags are mutable, so whoever controls an action's repo can change the code a tag runs.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
  isMap,
  isScalar,
  isSeq,
  LineCounter,
  parseDocument,
  visit,
} from "yaml";

const COMMIT = /@[0-9a-f]{40}$/;
const DIGEST = /@sha256:[0-9a-f]{64}$/;

function isPinned(ref) {
  if (ref.startsWith("./")) return true; // versioned with this repository
  return ref.startsWith("docker://") ? DIGEST.test(ref) : COMMIT.test(ref);
}

const mapsIn = (node) => (isSeq(node) ? node.items.filter(isMap) : []);

/**
 * Every unpinned `uses:` in one workflow or action file, read from the places
 * GitHub reads it: jobs.<id>.uses, jobs.<id>.steps[].uses and runs.steps[].uses.
 * Aliases, merge keys and non-string `uses` fail closed, so a tag can't hide behind them.
 */
export function findUnpinned(source) {
  const lineCounter = new LineCounter();
  const doc = parseDocument(source, { lineCounter });
  if (doc.errors.length > 0) throw doc.errors[0];
  const at = (node, ref) => ({
    line: lineCounter.linePos(node.range[0]).line,
    ref,
  });

  const jobs = doc.get("jobs", true);
  const runs = doc.get("runs", true);
  const problems = [];
  for (const root of [jobs, runs]) {
    if (!root) continue;
    visit(root, {
      Alias: (_, node) => {
        problems.push(at(node, `*${node.source} (YAML alias)`));
      },
      Pair: (_, pair) => {
        if (isScalar(pair.key) && pair.key.value === "<<") {
          problems.push(at(pair.key, "<< (YAML merge key)"));
        }
      },
    });
  }

  const owners = isMap(runs) ? mapsIn(runs.get("steps")) : [];
  if (isMap(jobs)) {
    for (const { value: job } of jobs.items) {
      if (isMap(job)) owners.push(job, ...mapsIn(job.get("steps")));
    }
  }
  for (const owner of owners) {
    const node = owner.get("uses", true);
    if (node === undefined) continue;
    if (!isScalar(node)) problems.push(at(node, "uses is not a string"));
    else if (!isPinned(String(node.value)))
      problems.push(at(node, String(node.value)));
  }
  return problems.sort((a, b) => a.line - b.line);
}

function main() {
  const files = execFileSync(
    "git",
    [
      "ls-files",
      ".github/workflows/*.yml",
      ".github/workflows/*.yaml",
      "**/action.yml",
      "**/action.yaml",
      "action.yml",
      "action.yaml",
    ],
    { encoding: "utf8" },
  )
    .split("\n")
    .filter(Boolean);

  const failures = files.flatMap((file) =>
    findUnpinned(readFileSync(file, "utf8")).map(
      ({ line, ref }) => `${file}:${line}: ${ref}`,
    ),
  );
  if (failures.length > 0) {
    console.error(
      "Unpinned action references (use a full commit SHA or image digest):",
    );
    console.error(failures.join("\n"));
    process.exit(1);
  }
  console.log(`All action references in ${files.length} files are pinned.`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
