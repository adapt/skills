# Contributing

New skills and improvements to existing skills are welcome. Start with a
focused, recurring task and explain what the skill adds. Improve or compose
an existing skill when that is a better fit.

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
