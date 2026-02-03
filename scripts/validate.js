#!/usr/bin/env node

/**
 * Skill Validator for CI
 *
 * Self-contained validation script mirroring the rules from
 * myaidev-method/src/lib/skill-validator.js.
 *
 * Usage: node validate.js <path-to-skill-directory>
 * Exit 0 on pass, exit 1 on errors.
 */

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const MAX_SKILL_FILE_SIZE = 50 * 1024;     // 50KB
const MAX_DIR_SIZE = 200 * 1024;            // 200KB
const MIN_CONTENT_LENGTH = 100;
const MAX_NAME_LENGTH = 64;
const MAX_DESCRIPTION_LENGTH = 1024;

const ALLOWED_EXTENSIONS = new Set([
  '.md', '.json', '.yaml', '.yml', '.sh', '.js', '.ts', '.py', '.txt',
]);

const DANGEROUS_PATTERNS = [
  { pattern: /rm\s+-rf\s+\/(?!\w)/g, label: 'rm -rf /' },
  { pattern: /chmod\s+777/g, label: 'chmod 777' },
  { pattern: /mkfs\./g, label: 'mkfs (format disk)' },
  { pattern: /dd\s+if=.*of=\/dev\//g, label: 'dd to device' },
  { pattern: />\s*\/dev\/sd[a-z]/g, label: 'write to disk device' },
];

const CREDENTIAL_PATHS = [
  '~/.ssh', '~/.aws', '~/.gnupg', '/etc/shadow', '/etc/passwd',
  '~/.config/gcloud', '~/.kube/config', '~/.npmrc',
];

const SECURITY_WARNING_PATTERNS = [
  { pattern: /eval\s*\(/g, label: 'eval() usage' },
  { pattern: /exec\s*\(/g, label: 'exec() usage' },
  { pattern: /curl\s+[^|]*\|\s*(?:ba)?sh/g, label: 'curl | sh pattern' },
  { pattern: /wget\s+[^|]*\|\s*(?:ba)?sh/g, label: 'wget | sh pattern' },
];

function validate(skillPath) {
  const errors = [];
  const warnings = [];

  // Resolve SKILL.md path
  let dirPath = skillPath;
  let filePath;

  const stat = fs.statSync(skillPath, { throwIfNoEntry: false });
  if (stat && stat.isDirectory()) {
    filePath = path.join(skillPath, 'SKILL.md');
  } else {
    filePath = skillPath;
    dirPath = path.dirname(skillPath);
  }

  // File exists check
  if (!fs.existsSync(filePath)) {
    console.error(`Error: SKILL.md not found at ${filePath}`);
    process.exit(1);
  }

  // File size check
  const fileSize = fs.statSync(filePath).size;
  if (fileSize > MAX_SKILL_FILE_SIZE) {
    errors.push(`SKILL.md exceeds ${Math.round(MAX_SKILL_FILE_SIZE / 1024)}KB limit (${Math.round(fileSize / 1024)}KB)`);
  }

  // Parse frontmatter
  const rawContent = fs.readFileSync(filePath, 'utf8');
  let frontmatter, body;
  try {
    const parsed = matter(rawContent);
    frontmatter = parsed.data;
    body = parsed.content;
  } catch (err) {
    console.error(`Error: Failed to parse YAML frontmatter: ${err.message}`);
    process.exit(1);
  }

  // Frontmatter validation
  if (!frontmatter.name) {
    errors.push('Missing required field: "name" in frontmatter');
  } else {
    if (typeof frontmatter.name !== 'string') {
      errors.push('"name" must be a string');
    } else if (frontmatter.name.length > MAX_NAME_LENGTH) {
      errors.push(`"name" exceeds ${MAX_NAME_LENGTH} characters`);
    }
  }

  if (!frontmatter.description) {
    errors.push('Missing required field: "description" in frontmatter');
  } else {
    if (typeof frontmatter.description !== 'string') {
      errors.push('"description" must be a string');
    } else {
      if (frontmatter.description.length > MAX_DESCRIPTION_LENGTH) {
        errors.push(`"description" exceeds ${MAX_DESCRIPTION_LENGTH} characters`);
      }
      if (!/\bwhen\b/i.test(frontmatter.description)) {
        warnings.push('Description should include a "when" clause');
      }
    }
  }

  // Content validation
  if (!body || body.trim().length < MIN_CONTENT_LENGTH) {
    errors.push(`Content body must be at least ${MIN_CONTENT_LENGTH} characters`);
  } else {
    const h1Matches = body.match(/^# .+/gm);
    if (!h1Matches || h1Matches.length === 0) {
      errors.push('Must have at least one H1 heading');
    }

    const h2Matches = body.match(/^## .+/gm);
    if (!h2Matches || h2Matches.length < 2) {
      warnings.push('Should have at least 2 H2 sections');
    }

    const hasUsage = /^##\s+(Quick\s*Start|Usage|Getting\s*Started|How\s*to\s*Use)/im.test(body);
    if (!hasUsage) {
      warnings.push('Consider adding a "Quick Start" or "Usage" section');
    }
  }

  // Security validation
  for (const { pattern, label } of DANGEROUS_PATTERNS) {
    if (pattern.test(rawContent)) {
      errors.push(`Security: destructive command detected -- ${label}`);
    }
    pattern.lastIndex = 0;
  }

  for (const credPath of CREDENTIAL_PATHS) {
    if (rawContent.includes(credPath)) {
      errors.push(`Security: references credential path -- ${credPath}`);
    }
  }

  for (const { pattern, label } of SECURITY_WARNING_PATTERNS) {
    if (pattern.test(rawContent)) {
      warnings.push(`Security: ${label} detected`);
    }
    pattern.lastIndex = 0;
  }

  // Directory validation (binary files, total size)
  if (fs.statSync(dirPath).isDirectory()) {
    let totalSize = 0;
    const entries = fs.readdirSync(dirPath, { withFileTypes: true, recursive: true });
    for (const entry of entries) {
      if (!entry.isFile()) continue;
      const ext = path.extname(entry.name).toLowerCase();
      if (!ALLOWED_EXTENSIONS.has(ext) && entry.name !== '.gitkeep') {
        errors.push(`Disallowed file type: ${entry.name}`);
      }
      const fullPath = path.join(entry.parentPath || dirPath, entry.name);
      try {
        totalSize += fs.statSync(fullPath).size;
      } catch { /* skip */ }
    }
    if (totalSize > MAX_DIR_SIZE) {
      warnings.push(`Directory exceeds ${Math.round(MAX_DIR_SIZE / 1024)}KB recommended limit`);
    }
  }

  // Output results
  const name = frontmatter?.name || path.basename(dirPath);
  console.log(`\nValidating: ${name}`);
  console.log('─'.repeat(40));

  if (errors.length > 0) {
    console.log(`\n${errors.length} error(s):`);
    for (const err of errors) {
      console.log(`  x ${err}`);
    }
  }

  if (warnings.length > 0) {
    console.log(`\n${warnings.length} warning(s):`);
    for (const warn of warnings) {
      console.log(`  ! ${warn}`);
    }
  }

  if (errors.length === 0) {
    console.log('\nValidation passed.');
  } else {
    console.log('\nValidation FAILED.');
  }

  process.exit(errors.length > 0 ? 1 : 0);
}

// Main
const skillPath = process.argv[2];
if (!skillPath) {
  console.error('Usage: node validate.js <path-to-skill-directory>');
  process.exit(1);
}

validate(skillPath);
