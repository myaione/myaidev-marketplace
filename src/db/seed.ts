/**
 * Seed the database with categories and initial skills from marketplace.json.
 * Run: npx tsx src/db/seed.ts
 */
import 'dotenv/config';
import { initializeDatabase, closeDb } from './connection.js';
import { upsertCategory } from './categories.js';
import { createSkill, getSkillByName } from './skills.js';
import type { Category } from '../types/skill.js';

// --- Seed categories ---
const categories: Category[] = [
  { id: 'development', name: 'Development', description: 'Software development tools and workflows', icon: 'code' },
  { id: 'content', name: 'Content', description: 'Content creation and writing tools', icon: 'edit' },
  { id: 'publishing', name: 'Publishing', description: 'Multi-platform content publishing', icon: 'globe' },
  { id: 'security', name: 'Security', description: 'Security testing and auditing tools', icon: 'shield' },
  { id: 'deployment', name: 'Deployment', description: 'Application deployment automation', icon: 'rocket' },
  { id: 'infrastructure', name: 'Infrastructure', description: 'Infrastructure and cloud management', icon: 'server' },
];

// --- Seed skills (from myaidev-method skill list) ---
interface SeedSkill {
  name: string;
  title: string;
  description: string;
  author: string;
  category: string;
  tags: string[];
  version?: string;
  verified: boolean;
  featured: boolean;
}

const skills: SeedSkill[] = [
  {
    name: 'sparc-architect',
    title: 'SPARC Architect',
    description: 'Architecture and system design using SPARC methodology. Creates specifications, component diagrams, and architecture decision records.',
    author: 'MyAIDev',
    category: 'development',
    tags: ['sparc', 'architecture', 'design', 'specification'],
    verified: true,
    featured: true,
  },
  {
    name: 'sparc-coder',
    title: 'SPARC Coder',
    description: 'Code generation following SPARC methodology. Implements clean, tested, and documented code based on architectural specifications.',
    author: 'MyAIDev',
    category: 'development',
    tags: ['sparc', 'coding', 'implementation', 'typescript'],
    verified: true,
    featured: true,
  },
  {
    name: 'sparc-tester',
    title: 'SPARC Tester',
    description: 'Comprehensive testing skill using SPARC methodology. Unit tests, integration tests, and end-to-end test generation.',
    author: 'MyAIDev',
    category: 'development',
    tags: ['sparc', 'testing', 'unit-tests', 'integration'],
    verified: true,
    featured: false,
  },
  {
    name: 'sparc-reviewer',
    title: 'SPARC Reviewer',
    description: 'Code review and quality assurance using SPARC methodology. Ensures code quality, performance, and best practices.',
    author: 'MyAIDev',
    category: 'development',
    tags: ['sparc', 'code-review', 'quality', 'best-practices'],
    verified: true,
    featured: false,
  },
  {
    name: 'sparc-documenter',
    title: 'SPARC Documenter',
    description: 'Documentation generation using SPARC methodology. Creates API docs, user guides, and technical documentation.',
    author: 'MyAIDev',
    category: 'development',
    tags: ['sparc', 'documentation', 'api-docs', 'guides'],
    verified: true,
    featured: false,
  },
  {
    name: 'content-writer',
    title: 'Content Writer',
    description: 'SEO-optimized content creation. Generates blog posts, articles, and marketing copy with keyword optimization.',
    author: 'MyAIDev',
    category: 'content',
    tags: ['content-creation', 'seo', 'blog', 'marketing'],
    verified: true,
    featured: true,
  },
  {
    name: 'content-verifier',
    title: 'Content Verifier',
    description: 'Content quality assurance and fact-checking. Verifies accuracy, grammar, and SEO compliance of written content.',
    author: 'MyAIDev',
    category: 'content',
    tags: ['content-creation', 'verification', 'quality', 'fact-checking'],
    verified: true,
    featured: false,
  },
  {
    name: 'visual-generator',
    title: 'Visual Generator',
    description: 'AI-powered image and visual asset generation. Creates graphics, diagrams, and illustrations for content.',
    author: 'MyAIDev',
    category: 'content',
    tags: ['visual-generation', 'images', 'graphics', 'ai-art'],
    verified: true,
    featured: true,
  },
  {
    name: 'wordpress-publisher',
    title: 'WordPress Publisher',
    description: 'Automated WordPress publishing workflow. Handles post creation, media upload, SEO metadata, and scheduling.',
    author: 'MyAIDev',
    category: 'publishing',
    tags: ['wordpress', 'publishing', 'cms', 'automation'],
    verified: true,
    featured: false,
  },
  {
    name: 'security-tester',
    title: 'Security Tester',
    description: 'PTES-based penetration testing. Automated security scanning, vulnerability assessment, and exploit testing.',
    author: 'MyAIDev',
    category: 'security',
    tags: ['penetration-testing', 'ptes', 'vulnerability', 'exploit'],
    verified: true,
    featured: true,
  },
  {
    name: 'security-auditor',
    title: 'Security Auditor',
    description: 'OWASP compliance auditing. Security code review, dependency scanning, and compliance reporting.',
    author: 'MyAIDev',
    category: 'security',
    tags: ['security-audit', 'owasp', 'compliance', 'code-review'],
    verified: true,
    featured: false,
  },
  {
    name: 'coolify-deployer',
    title: 'Coolify Deployer',
    description: 'Automated deployment using Coolify PaaS. Manages applications, databases, and services on self-hosted infrastructure.',
    author: 'MyAIDev',
    category: 'deployment',
    tags: ['coolify', 'deployment', 'paas', 'devops'],
    verified: true,
    featured: false,
  },
  {
    name: 'openstack-manager',
    title: 'OpenStack Manager',
    description: 'OpenStack cloud infrastructure management. VM provisioning, network configuration, and resource management.',
    author: 'MyAIDev',
    category: 'infrastructure',
    tags: ['openstack', 'cloud', 'vm', 'infrastructure'],
    verified: true,
    featured: false,
  },
];

// --- Run seeding ---
try {
  initializeDatabase();

  console.log('📦 Seeding categories...');
  for (const cat of categories) {
    upsertCategory(cat);
    console.log(`  ✓ ${cat.name}`);
  }

  console.log('\n📦 Seeding skills...');
  for (const skill of skills) {
    const existing = getSkillByName(skill.name);
    if (existing) {
      console.log(`  ⏭ ${skill.name} (already exists)`);
      continue;
    }
    createSkill(skill);
    console.log(`  ✓ ${skill.name}`);
  }

  console.log('\n🎉 Seed complete!');
} catch (err) {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
} finally {
  closeDb();
}
