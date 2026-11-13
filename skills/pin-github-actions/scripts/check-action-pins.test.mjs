// Run with `node --test`. Needs only Node and the `yaml` package the checker imports.
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { findUnpinned } from "./check-action-pins.mjs";

const SHA = "3d3c42e5aac5ba805825da76410c181273ba90b1";
const refs = (source) => findUnpinned(source).map(({ ref }) => ref);
const steps = (...lines) =>
  ["jobs:", "  t:", "    steps:", ...lines.map((l) => `      ${l}`)].join("\n");

describe("findUnpinned", () => {
  it("flags a tag and reports its line", () => {
    assert.deepEqual(findUnpinned(steps("- uses: actions/checkout@v7")), [
      { line: 4, ref: "actions/checkout@v7" },
    ]);
  });

  it("passes a full commit SHA with a version comment", () => {
    assert.deepEqual(refs(steps(`- uses: actions/checkout@${SHA} # v7.0.1`)), []);
  });

  it("flags flow-style steps", () => {
    assert.deepEqual(refs(steps("- { uses: actions/checkout@v7 }")), [
      "actions/checkout@v7",
    ]);
  });

  it("flags quoted keys", () => {
    assert.deepEqual(refs(steps('- "uses": actions/checkout@v7')), [
      "actions/checkout@v7",
    ]);
  });

  it("flags a ref split across lines", () => {
    assert.deepEqual(refs(steps("- uses: >-", "    actions/checkout@v7")), [
      "actions/checkout@v7",
    ]);
  });

  it("ignores `uses:` written inside a shell script", () => {
    assert.deepEqual(
      refs(steps("- run: |", "    echo 'uses: actions/checkout@v7'")),
      [],
    );
  });

  it("flags a reusable workflow called by tag", () => {
    assert.deepEqual(
      refs("jobs:\n  deploy:\n    uses: org/ci/.github/workflows/deploy.yml@main"),
      ["org/ci/.github/workflows/deploy.yml@main"],
    );
  });

  it("leaves local actions and workflows alone", () => {
    assert.deepEqual(
      refs("jobs:\n  deploy:\n    uses: ./.github/workflows/deploy.yml"),
      [],
    );
  });

  it("requires an image digest for docker refs", () => {
    const digest = `sha256:${"a".repeat(64)}`;
    assert.deepEqual(
      refs(steps("- uses: docker://alpine:3.20", `- uses: docker://alpine@${digest}`)),
      ["docker://alpine:3.20"],
    );
  });

  it("checks the steps of a composite action", () => {
    assert.deepEqual(
      refs("runs:\n  using: composite\n  steps:\n    - uses: actions/cache@v4"),
      ["actions/cache@v4"],
    );
  });

  it("fails closed on a step pulled in by alias", () => {
    const source = [
      "jobs:",
      "  a:",
      "    steps:",
      "      - &checkout { uses: actions/checkout@v7 }",
      "  b:",
      "    steps:",
      "      - *checkout",
    ].join("\n");
    assert.deepEqual(refs(source), [
      "actions/checkout@v7",
      "*checkout (YAML alias)",
    ]);
  });

  it("fails closed on a merge key", () => {
    assert.deepEqual(
      refs(steps("- <<: { uses: actions/checkout@v7 }", "  with: {}")),
      ["<< (YAML merge key)"],
    );
  });

  it("fails closed when uses isn't a string", () => {
    assert.deepEqual(refs(steps("- uses: [actions/checkout@v7]")), [
      "uses is not a string",
    ]);
  });
});
