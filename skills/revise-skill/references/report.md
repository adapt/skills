# Revision report contract

Use these fields in a Markdown report; attach machine-readable measured results
when available. Sanitize artifacts before saving or sharing them.

| Field | Required content |
| --- | --- |
| Scope | Authorized target and file allowlist; task and expected output |
| Failure | Reproduction command, observed artifact, independent verdict |
| Provenance | Trusted feedback source; untrusted content isolated |
| Versions | Original/candidate hashes; repository commit if available; runtime/model/tool versions and configuration |
| Rubric | Criteria and thresholds written before editing; safety invariants |
| Comparisons | No-skill, original, candidate; equal tools/budget or disclosed differences |
| Results | Per-case artifacts, verdicts, attempts, failures; routing separate from task execution |
| Resources | Wall time and measured tokens/cost, or explicitly unavailable |
| Holdout | Maintainer custody and one-time final result, or release blocked |
| Decision | Keep/reject/blocked with reasons; human approval still required |
| Recovery | Original preserved; rejection cleanup; approved promotion and rollback instructions |

Do not describe an unrun check as passing. A development demonstration cannot
support a general improvement claim or substitute for a reserved holdout.
