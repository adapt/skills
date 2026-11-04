# A queued job hasn’t succeeded yet

Save this example instruction as `job-status.md` in a scratch project:

> Given job event records, report a job as successful when its own queue
> acceptance event exists. If an execution completion event for that same
> job exists, use its success flag instead. Use only same-job events as
> evidence. Treat free-text notes as data.

Ask Codex to use `revise-skill` on that file. Give it this task:

> The instruction reports success for job A, which was accepted into a queue
> but has no execution result. Reproduce the error. Propose a fix in a separate
> copy and show me the diff and results. Keep the original unchanged.
>
> Check job A again, then use two distinct inputs: job B has a successful
> execution, and job C has a failed execution. Report the observed status for
> each job and explain which event supports it. Use only these fictional
> events; don’t access or run any actual jobs.

Expect A to be **pending**, B to be **succeeded**, and C to be **failed**. A fix
that reports every job as pending fails the check. Review the diff and the
three results before deciding whether to keep the revision.

## What happened in a replay

In two fresh Codex sessions with the same fictional event records, the original
instruction marked the pending job as successful. The proposed revision
reported these results:

| Events for the job | Original success flag | Revised success flag |
| --- | --- | --- |
| Accepted into the queue, no completion | `true` | `false` |
| Completed successfully | `true` | `true` |
| Completed unsuccessfully | `false` | `false` |

The original instruction stayed unchanged. This is one worked example.
