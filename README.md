# Adapt Skills

Skills built by the Adapt team. We add to this collection as we develop new
workflows. Install the ones you need in your coding agent.

## Install

```sh
npx skills add adapt/skills
```

Choose the skills and your agent when prompted, then start a new session in
that project. Ask your agent to use the installed skill for your task.

## Skills

| Skill | When to use it |
| --- | --- |
| [revise-skill](skills/revise-skill/SKILL.md) | Fix an existing skill after a reproduced failure. Get a separate candidate, diff, and test report to review. [Example](examples/queued-is-not-completed.md). Experimental. |
| [pin-github-actions](skills/pin-github-actions/SKILL.md) | Pin your workflows' actions to the commits they run today and add a check that keeps them pinned, so a retagged or hijacked action can't change your CI. [Example](examples/pin-a-workflow.md). Experimental. |

Each skill documents its own workflow and requirements.

[Contributing](CONTRIBUTING.md) · [Security](SECURITY.md) · [MIT license](LICENSE)
