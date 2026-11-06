# Contributing

This collection is maintained by the Adapt team. We add skills as we build
and use them.

Bug reports and feedback are welcome. We are not accepting unsolicited new
skills from outside Adapt. To propose another change, open an issue before
submitting a pull request.

## For Adapt maintainers

For each skill:

- Add `skills/<name>/SKILL.md` with a matching name and a clear description.
- Include the license notice and any references or scripts needed after installation.
- State required tools, accounts and permissions; keep paths portable.
- Provide a small example, actual test results, tested agents and known limits.
- Add a link and a short use case to the README catalog.

For a fix, include the expected and actual behavior plus a separate test input.
Check discovery with `npx skills add . --list`. CI verifies installation for
Claude Code and Codex; reviewers assess the skill's behavior.

Include only material you have permission to share and license. Keep
credentials and private task data out of issues and pull requests.
