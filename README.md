# MyAIDev Marketplace

Community-contributed skills for the [MyAIDev Method](https://github.com/myaione/myaidev-method) framework.

## What is this?

This repository is the **review layer** for skill contributions to the MyAIDev marketplace. Skills submitted here go through CI validation and admin review before being published to [dev.myai1.ai](https://dev.myai1.ai).

## Contributing a Skill

### Quick Path (Recommended)

Use the CLI tool -- it handles everything:

```bash
# Install the CLI
npm install -g myaidev-method

# Log in
myaidev-method login

# Submit a skill (will scaffold, validate, and create PR)
myaidev-method addon submit
```

### Manual Path

1. Fork this repository
2. Create a new directory under `skills/` with your skill slug
3. Add your `SKILL.md` file (see [CONTRIBUTING.md](CONTRIBUTING.md) for format)
4. Open a pull request

## Repository Structure

```
skills/                          # Approved skills (one directory per skill)
  my-skill/
    SKILL.md                     # Skill definition (YAML frontmatter + markdown)
.github/
  workflows/
    validate-skill-pr.yml        # CI validation on pull requests
    ingest-on-merge.yml          # Auto-publish to marketplace on merge
scripts/
  validate.js                   # Validation script used by CI
```

## Review Process

1. **Submit** -- Create a PR with your skill in `skills/{slug}/SKILL.md`
2. **CI Validation** -- Automated checks run on your PR
3. **Admin Review** -- A maintainer reviews your skill
4. **Merge** -- Once approved, your skill is merged and auto-published
5. **Available** -- Your skill appears in `myaidev-method addon list`

## License

Apache-2.0
