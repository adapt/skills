# Adapts

Adapts is a collection of agent skills. The first,
[`revise-skill`](skills/revise-skill/SKILL.md), helps you fix a skill after a
reproduced failure. It proposes a small change in a separate copy and gives you
a diff and test results to review before you update the original.

## Install

From a scratch project with Node.js 22.20 or newer:

```sh
npx skills@1.7.4 add adapt/adapts --skill revise-skill --copy
```

Choose your agent when prompted, then start a new session in that project.
Ask it to use `revise-skill` and provide the target skill, the failed task, and
what you expected. Or try the [worked example](examples/queued-is-not-completed.md).

The skill is experimental. It needs no Adapt account.

[Contributing](CONTRIBUTING.md) · [Security](SECURITY.md) · [MIT license](LICENSE)
