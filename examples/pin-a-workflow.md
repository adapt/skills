# Pin a workflow’s actions

Save this as `.github/workflows/ci.yml` in a scratch repository:

```yaml
name: CI
on: pull_request
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: dorny/paths-filter@v3
        with:
          filters: |
            src: src/**
      - uses: ./.github/actions/setup
      - uses: docker://alpine:3.20
```

And this as `.github/actions/setup/action.yml`, a local action that calls
another one:

```yaml
name: Setup
runs:
  using: composite
  steps:
    - uses: "actions/setup-node@v4"
```

Commit both, then ask your agent to use `pin-github-actions` on that
repository. Expect:

- `actions/checkout@v4` and `actions/setup-node@v4` pinned to the commits `v4`
  points to now, each with its most specific matching tag as the comment (on
  5 November 2026, both were `# v4.4.0`).
- `dorny/paths-filter@v3` pinned to the commit behind its annotated tag,
  `0e4a8c6effa4802afeda77dc8d303f8176d7dfad # v3.0.4` on that date. The tag
  object SHA, `15192bc…`, is wrong to pin.
- `uses: ./.github/actions/setup` unchanged, since it is versioned with the
  repository.
- `docker://alpine:3.20` pinned to a digest only if a registry tool is
  available; otherwise listed in the report as unpinned.
- A check in CI that fails on `actions/checkout@v4` and passes after the change.

A fix that upgrades either action, edits lines other than `uses:`, or pins a
SHA it did not resolve from the action’s own tags fails the check.

## What happened in a replay

On 5 and 6 November 2026, we gave fresh Claude Code and Codex sessions the same
task on this repository, with and without the skill.

| | Claude Code with the skill | Claude Code without | Codex with the skill | Codex without |
| --- | --- | --- | --- | --- |
| Pinned all three actions and the image | Yes | Yes | Yes | Yes |
| Used the annotated tag’s commit | Yes | Yes | Yes | Yes |
| Recorded the exact version, such as `v4.4.0` | Yes | Yes | Yes | No, kept `v4` |
| Check added | Bundled checker | 15-line shell script | Bundled checker | 136 lines of Ruby and tests |
| Noted that no updater keeps pins current | Yes | Yes | Yes | No |
| Noted that `setup-node` downloads Node at run time | Yes | No | Yes | No |

All four sessions resolved the same SHAs. Here the skill didn’t change which
commits were pinned. It kept the added check small and made each report name
what pinning leaves open. This is one worked example.
