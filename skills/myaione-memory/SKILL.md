---
name: myaione-memory
description: One persistent memory shared across every AI surface the user works on. Use when a session starts, before repeating an approach that may have been tried before, when the user references past work ("what did we fix yesterday", "like last time"), and at milestones (task done, bug root-caused, decision made, before compaction) — search and update it with the memory_* MCP tools.
keywords: ["memory", "mem0", "cross-surface", "persistence", "mcp", "myaione", "devstation", "context"]
category: development
homepage: https://dev.myai1.ai/plugins/myaione-memory
repository: https://github.com/myaione/DevStation
license: MIT
metadata:
  tags: [memory, mem0, cross-surface, mcp, myaione]
---

<!-- source: myaione/DevStation platform/shared-container/myaione-memory/SKILL.md @ 60f34733 -- do not edit here; edit upstream and re-run scripts/publish-skill.sh -->

# Cross-surface memory

The user has ONE persistent memory shared across every AI surface they work
with: DevStation workspaces, coding CLIs on their own machines (Claude Code,
Codex, Gemini), and conversational agents on other infrastructure. What you
store here, every other surface can recall; what they stored, you can recall.
It survives this session, this machine, and this platform.

The tools are `memory_search`, `memory_list`, `memory_get`, `memory_add`,
`memory_update`, `memory_forget`, `memory_export`, `memory_status` — exposed
by the `devstation` MCP server inside a DevStation workspace, or the
`devstation-memory` remote MCP server anywhere else
(`https://<gateway>/api/v1/mcp` with a `dsm_` bearer token; users mint one at
`https://<gateway>/__mcp/tokens`).

Memory is **user-global**. `projectId` is an optional narrowing filter, not a
namespace — omit it unless the user is clearly asking within one project.

## Quick start

```
# Is memory reachable, and does this user have any?
memory_status {}

# Read before you work
memory_search {"query": "how does the staging deploy pipeline work"}

# Write at a milestone
memory_add {"text": "<the durable fact, self-contained>",
            "kind": "task_outcome", "source": "claude-code"}
```

Inside a DevStation workspace these arrive on the `devstation` MCP server
automatically. Elsewhere, connect the remote server once:

```bash
claude mcp add --transport http devstation-memory \
  https://<your-gateway>/api/v1/mcp \
  --header "Authorization: Bearer dsm_..."   # mint at https://<your-gateway>/__mcp/tokens
```

## When to READ (search first, it is cheap)

- **Session start**, once, before substantive work: search for the topic at
  hand (e.g. `memory_search {query: "<the system/feature being worked on>"}`).
- **Before repeating an approach** that could plausibly have been tried:
  a failed approach may already be recorded with why it failed.
- **When the user references past work**: "what did we fix yesterday",
  "the bug from last week", "like we did on the other project" — these live
  in memory even when they happened on a different surface.
- **When a decision looks arbitrary**: it may already be explained.

Phrase queries as questions or statements ("why does the staging deploy skip
the image build"), not keyword soup — retrieval is hybrid semantic + keyword.

## When to WRITE (milestones, not transcripts)

Write at natural milestones — think "what would a colleague need to know in a
month, on a different machine, with none of this context":

- **A task or piece of work completes** → `kind: task_outcome`: what was done,
  where it landed (PR/commit/URL), what remains.
- **A bug is root-caused** → `kind: gotcha`: symptom, cause, fix, and the
  trap that made it hard.
- **A decision is made** → `kind: session_insight` (or `pattern` if it is a
  reusable approach): the decision AND the why — the why is what survives.
- **You discover how something actually works** (vs how it appears) →
  `kind: codebase_discovery`.
- **Before context compaction or session end**, if any of the above happened
  and was not yet stored.

The nine kinds: `session_insight, gotcha, pattern, codebase_discovery,
task_outcome, qa_result, pr_review, pr_pattern, pr_gotcha`.

### What a good memory looks like

Self-contained, durable, specific:

> "MyAI staging deploys: merging to develop auto-deploys the platform
> (gateway) but the workspace IMAGE only rebuilds when apps/** or
> platform/shared-container/** changed — a platform-only merge changes no
> container. Bit us 2026-09-05 (PR #541 shipped routes with no caller)."

Not: session narration ("then I ran the tests and they passed"), not raw
transcripts, not anything you'd be unwilling to show every other agent the
user runs.

### Never store

Secrets, credentials, tokens, keys, personal data about third parties, raw
chain-of-thought, or verbatim conversation transcripts. Memory is shared
across every surface — treat every write as visible everywhere, forever,
until explicitly forgotten.

### Write mechanics

- Writes are stored **verbatim and NOT deduplicated**. Search before storing
  something that may already exist; if a near-duplicate exists, prefer
  `memory_update` on the existing record over a new `memory_add`. Never
  retry a write that returned success.
- Set `source` to your surface name (`claude-code`, `codex`, `hermes`, …) so
  recall can later be filtered by origin.
- If a stored fact turns out WRONG, fix it: `memory_update` with the
  correction, or `memory_forget` if it is unsalvageable. A wrong memory is
  worse than none — every surface inherits it.

## Keeping memory healthy

- Prefer one consolidated memory over five fragments about the same thing.
- When you correct a prior memory, fold the old context into the correction
  ("previously believed X because Y; actually Z") rather than leaving both.
- `memory_status` distinguishes "you have no memories" from "the service is
  unreachable" — reads failing open (empty results) is not proof of absence.
- `memory_export` returns a bounded snapshot (it says when truncated), not a
  full dump.

## Optional: automatic milestone hooks (Claude Code)

Claude Code users can wire the write-at-milestones habit into lifecycle hooks
in `~/.claude/settings.json`, e.g. a `Stop`/`PreCompact` hook that reminds the
agent to persist unsaved milestones. Keep any such hook fire-and-forget and
fail-open — memory must never block the work it is recording:

```json
{
  "hooks": {
    "PreCompact": [{ "hooks": [{ "type": "prompt", "prompt":
      "Before compaction: if any task completed, bug was root-caused, or decision was made this session and is not yet in memory, store it now with memory_add (see the myaione-memory skill). If nothing qualifies, do nothing." }] }]
  }
}
```
