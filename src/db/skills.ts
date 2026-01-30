import { randomUUID } from 'crypto';
import { getDb } from './connection.js';
import type { UpdateSkill, SkillFilters, Skill, SkillRow } from '../types/skill.js';
import { createSkillSchema } from '../types/skill.js';
import { z } from 'zod';

type CreateSkillInput = z.input<typeof createSkillSchema>;
import { rowToSkill } from '../types/skill.js';

/**
 * Get all skills with optional filtering, sorting, and pagination.
 */
export function getAllSkills(filters?: SkillFilters): Skill[] {
  const db = getDb();
  const conditions: string[] = [];
  const params: Record<string, unknown> = {};

  if (filters?.category) {
    conditions.push('category = @category');
    params.category = filters.category;
  }
  if (filters?.verified !== undefined) {
    conditions.push('verified = @verified');
    params.verified = filters.verified ? 1 : 0;
  }
  if (filters?.featured !== undefined) {
    conditions.push('featured = @featured');
    params.featured = filters.featured ? 1 : 0;
  }
  if (filters?.tag) {
    // JSON contains search for tags array
    conditions.push("tags LIKE @tag");
    params.tag = `%"${filters.tag}"%`;
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const sort = filters?.sort || 'name';
  const order = filters?.order || 'asc';
  const limit = filters?.limit || 50;
  const offset = filters?.offset || 0;

  // Whitelist sort columns to prevent SQL injection
  const validSorts = ['name', 'stars', 'downloads', 'created_at', 'updated_at'];
  const safeSort = validSorts.includes(sort) ? sort : 'name';
  const safeOrder = order === 'desc' ? 'DESC' : 'ASC';

  const sql = `SELECT * FROM skills ${where} ORDER BY ${safeSort} ${safeOrder} LIMIT @limit OFFSET @offset`;
  params.limit = limit;
  params.offset = offset;

  const rows = db.prepare(sql).all(params) as SkillRow[];
  return rows.map(rowToSkill);
}

/**
 * Get a single skill by ID.
 */
export function getSkillById(id: string): Skill | null {
  const db = getDb();
  const row = db.prepare('SELECT * FROM skills WHERE id = ?').get(id) as SkillRow | undefined;
  return row ? rowToSkill(row) : null;
}

/**
 * Get a single skill by name.
 */
export function getSkillByName(name: string): Skill | null {
  const db = getDb();
  const row = db.prepare('SELECT * FROM skills WHERE name = ?').get(name) as SkillRow | undefined;
  return row ? rowToSkill(row) : null;
}

/**
 * Create a new skill. Returns the created skill.
 */
export function createSkill(data: CreateSkillInput): Skill {
  const db = getDb();
  const id = randomUUID();
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO skills (id, name, title, description, author, category, tags, version, verified, featured, created_at, updated_at)
    VALUES (@id, @name, @title, @description, @author, @category, @tags, @version, @verified, @featured, @created_at, @updated_at)
  `).run({
    id,
    name: data.name,
    title: data.title,
    description: data.description || '',
    author: data.author,
    category: data.category,
    tags: JSON.stringify(data.tags || []),
    version: data.version || '1.0.0',
    verified: data.verified ? 1 : 0,
    featured: data.featured ? 1 : 0,
    created_at: now,
    updated_at: now,
  });

  return getSkillById(id)!;
}

/**
 * Update an existing skill. Returns the updated skill or null if not found.
 */
export function updateSkill(id: string, updates: UpdateSkill): Skill | null {
  const db = getDb();
  const existing = getSkillById(id);
  if (!existing) return null;

  const setClauses: string[] = [];
  const params: Record<string, unknown> = { id };

  if (updates.title !== undefined) {
    setClauses.push('title = @title');
    params.title = updates.title;
  }
  if (updates.description !== undefined) {
    setClauses.push('description = @description');
    params.description = updates.description;
  }
  if (updates.author !== undefined) {
    setClauses.push('author = @author');
    params.author = updates.author;
  }
  if (updates.category !== undefined) {
    setClauses.push('category = @category');
    params.category = updates.category;
  }
  if (updates.tags !== undefined) {
    setClauses.push('tags = @tags');
    params.tags = JSON.stringify(updates.tags);
  }
  if (updates.version !== undefined) {
    setClauses.push('version = @version');
    params.version = updates.version;
  }
  if (updates.verified !== undefined) {
    setClauses.push('verified = @verified');
    params.verified = updates.verified ? 1 : 0;
  }
  if (updates.featured !== undefined) {
    setClauses.push('featured = @featured');
    params.featured = updates.featured ? 1 : 0;
  }

  if (setClauses.length === 0) return existing;

  setClauses.push("updated_at = @updated_at");
  params.updated_at = new Date().toISOString();

  const sql = `UPDATE skills SET ${setClauses.join(', ')} WHERE id = @id`;
  db.prepare(sql).run(params);

  return getSkillById(id);
}

/**
 * Delete a skill by ID. Returns true if deleted.
 */
export function deleteSkill(id: string): boolean {
  const db = getDb();
  const result = db.prepare('DELETE FROM skills WHERE id = ?').run(id);
  return result.changes > 0;
}

/**
 * Increment the download count for a skill.
 */
export function incrementDownloads(id: string): void {
  const db = getDb();
  db.prepare('UPDATE skills SET downloads = downloads + 1, updated_at = ? WHERE id = ?')
    .run(new Date().toISOString(), id);
}

/**
 * Increment the star count for a skill.
 */
export function incrementStars(id: string): void {
  const db = getDb();
  db.prepare('UPDATE skills SET stars = stars + 1, updated_at = ? WHERE id = ?')
    .run(new Date().toISOString(), id);
}

/**
 * Search skills by query string (matches name, title, description, author, tags).
 */
export function searchSkills(query: string, limit = 20): Skill[] {
  const db = getDb();
  const pattern = `%${query}%`;
  const rows = db.prepare(`
    SELECT * FROM skills
    WHERE name LIKE @q
       OR title LIKE @q
       OR description LIKE @q
       OR author LIKE @q
       OR tags LIKE @q
    ORDER BY
      CASE WHEN name LIKE @q THEN 0
           WHEN title LIKE @q THEN 1
           ELSE 2
      END,
      stars DESC
    LIMIT @limit
  `).all({ q: pattern, limit }) as SkillRow[];

  return rows.map(rowToSkill);
}

/**
 * Log a download event for analytics.
 */
export function logDownload(skillId: string, ipAddress: string, userAgent: string): void {
  const db = getDb();
  db.prepare(`
    INSERT INTO download_log (skill_id, ip_address, user_agent)
    VALUES (?, ?, ?)
  `).run(skillId, ipAddress, userAgent);
}

/**
 * Get marketplace statistics.
 */
export function getStats(): {
  total_skills: number;
  total_downloads: number;
  total_stars: number;
  total_categories: number;
  verified_skills: number;
  featured_skills: number;
} {
  const db = getDb();

  const skillStats = db.prepare(`
    SELECT
      COUNT(*) as total_skills,
      COALESCE(SUM(downloads), 0) as total_downloads,
      COALESCE(SUM(stars), 0) as total_stars,
      COUNT(CASE WHEN verified = 1 THEN 1 END) as verified_skills,
      COUNT(CASE WHEN featured = 1 THEN 1 END) as featured_skills
    FROM skills
  `).get() as Record<string, number>;

  const catCount = db.prepare('SELECT COUNT(*) as count FROM categories').get() as { count: number };

  return {
    total_skills: skillStats.total_skills,
    total_downloads: skillStats.total_downloads,
    total_stars: skillStats.total_stars,
    total_categories: catCount.count,
    verified_skills: skillStats.verified_skills,
    featured_skills: skillStats.featured_skills,
  };
}
