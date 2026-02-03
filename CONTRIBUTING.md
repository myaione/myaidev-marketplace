# Contributing to MyAIDev Marketplace

Thank you for contributing a skill to the MyAIDev community!

## Prerequisites

- Node.js 18+
- [GitHub CLI](https://cli.github.com) (`gh`)
- [myaidev-method](https://github.com/myaione/myaidev-method) CLI installed

## Quick Start

The fastest way to contribute is through the CLI:

```bash
myaidev-method addon submit
```

This command will:
1. Scaffold a SKILL.md if you don't have one
2. Validate it against marketplace requirements
3. Check for duplicate names
4. Fork this repo, create a branch, and open a PR

## Manual Contribution

### 1. Fork and Clone

```bash
gh repo fork myaione/myaidev-marketplace --clone
cd myaidev-marketplace
```

### 2. Create Your Skill

```bash
mkdir skills/my-skill-name
```

Create `skills/my-skill-name/SKILL.md` with this structure:

```yaml
---
name: my-skill-name
description: "Does X when Y. Use when you need to Z."
argument-hint: "[action] [args]"
allowed-tools: [Read, Write, Edit, Bash, Glob, Grep, AskUserQuestion]
context: fork
---

# My Skill Name

You are a **My Skill Name** agent.

## Quick Start

Describe primary usage here.

## Arguments

Parse arguments from: `$ARGUMENTS`

## Workflow

1. Step one
2. Step two
```

### 3. Validate Locally

```bash
myaidev-method addon validate --dir skills/my-skill-name
```

### 4. Submit PR

```bash
git checkout -b skill/my-skill-name
git add skills/my-skill-name
git commit -m "feat: add skill my-skill-name"
git push -u origin skill/my-skill-name
gh pr create --repo myaione/myaidev-marketplace
```

## Quality Requirements

### Required

| Rule | Description |
|------|-------------|
| `name` in frontmatter | Lowercase, hyphens, max 64 chars |
| `description` in frontmatter | Max 1024 chars |
| At least one H1 heading | Content must be structured |
| Min 100 chars content | Non-trivial skill body |
| No destructive commands | No `rm -rf /`, `chmod 777`, etc. |
| No credential paths | No `~/.ssh`, `~/.aws`, `/etc/shadow` |
| SKILL.md under 50KB | File size limit |
| Only allowed file types | .md, .json, .yaml, .yml, .sh, .js, .ts, .py, .txt |

### Recommended

| Rule | Description |
|------|-------------|
| "when" clause in description | Helps users know when to use the skill |
| At least 2 H2 sections | Progressive disclosure |
| Quick Start / Usage section | Easy onboarding |
| Directory under 200KB | Total size recommendation |

## Review Process

1. CI runs automated validation on your PR
2. A maintainer reviews the skill for quality and safety
3. You may receive feedback requesting changes
4. Once approved, the skill is merged and auto-published to the marketplace

## File Types

Skills can include supporting files alongside SKILL.md:

- `.md` -- Additional documentation or agent definitions
- `.json` -- Configuration or schema files
- `.yaml` / `.yml` -- Configuration files
- `.sh` -- Shell scripts
- `.js` / `.ts` -- JavaScript/TypeScript utilities
- `.py` -- Python scripts
- `.txt` -- Text files

Binary files (images, executables, archives) are not allowed.
