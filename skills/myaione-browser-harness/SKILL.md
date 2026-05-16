---
name: myaione-browser-harness
description: The remote-real-browser alternative to local headless Playwright. Drive a real, persistent Chrome browser owned by the user via the MyAIOne Browser Harness. For agents that need to navigate sites that block headless automation, interact with authenticated SaaS dashboards, or extract content from JS-heavy SPAs. Not for static scraping.
argument-hint: "<goal-description> [--ttl 600] [--profile default]"
allowed-tools: [Read, Write, Edit, Bash, Glob, Grep, AskUserQuestion]
context: fork
keywords: ["browser", "automation", "chrome", "cdp", "playwright-alternative", "remote-browser", "myaione", "devstation"]
category: development
homepage: https://dev.myai1.ai/plugins/myaione-browser-harness
repository: https://github.com/myaione/myaidev-method
license: MIT
---

# MyAIOne Browser Harness

Drive a real Chrome browser owned by the user. The browser persists logged-in state across sessions; the user can watch what the agent is doing through a live-view tab.

This skill is the agent-side companion to MyAIDev's browser harness service.

## Use when

- A site blocks headless browsers (Cloudflare, anti-bot challenges)
- A task requires the user's authenticated state (Gmail, Drive, internal SaaS)
- The user wants to approve / watch agent actions in real time

## Don't use when

- A `fetch` or `curl` returns the data you need
- You're doing volume scraping — this is a single browser, not a fleet

## How it works

1. Mint a short-lived CDP lease via the MyAIDev API
2. Connect to Chrome DevTools Protocol through the lease URL
3. Navigate, click, extract — exactly as you would locally
4. Revoke the lease when done

Full instructions: see the SKILL.md in the upstream [myaidev-method](https://github.com/myaione/myaidev-method/tree/main/skills/myaione-browser-harness) repo. This marketplace entry is a thin pointer; the canonical skill lives there.

## Prerequisites

- Pro plan or higher
- `myaidev login` token at `~/.myaidev/auth.json`

## Quick example

```bash
# 1. Ensure browser running
curl -fsS -X POST -H "Authorization: Bearer $TOKEN" \
  https://dev.myai1.ai/api/browser/profiles/default/start

# 2. Mint CDP lease
LEASE=$(curl -fsS -X POST -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"scope":"cdp_control","ttlSeconds":600}' \
  https://dev.myai1.ai/api/browser/profiles/default/lease)
BU_CDP_URL=$(echo "$LEASE" | jq -r .env.BU_CDP_URL)

# 3. Connect via chrome-remote-interface and drive
node -e "
import('chrome-remote-interface').then(async ({default: CDP}) => {
  const root = process.env.BU_CDP_URL;
  const targets = await (await fetch(root.replace(/\\?.*/, '') + 'json/list?' + root.split('?')[1])).json();
  const page = targets.find(t => t.type === 'page');
  const client = await CDP({ target: page.webSocketDebuggerUrl });
  await client.Page.enable();
  await client.Page.navigate({ url: 'https://www.engadget.com' });
  await client.Page.loadEventFired();
  const { result } = await client.Runtime.evaluate({
    expression: 'Array.from(document.querySelectorAll(\"a\")).map(a=>a.innerText).filter(t=>t.length>20).slice(0,10)',
    returnByValue: true,
  });
  console.log(result.value);
  await client.close();
});
"
```

## See also

- Canonical skill: https://github.com/myaione/myaidev-method/tree/main/skills/myaione-browser-harness
- Architecture: https://github.com/myaione/myaidev-website/blob/main/docs/browser-harness-service-plan.md
- Dashboard: https://dev.myai1.ai/dashboard (toggle Live Browser to watch)
