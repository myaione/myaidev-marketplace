import { getDb } from './connection.js';
import type { Category, Skill, SkillRow } from '../types/skill.js';
import { rowToSkill } from '../types/skill.js';

/**
 * Get all categories, enriched with skill counts.
 */
export function getAllCategories(): (Category & { skill_count: number })[] {
  const db = getDb();
  const rows = db.prepare(`
    SELECT c.*, COALESCE(sc.cnt, 0) as skill_count
    FROM categories c
    LEFT JOIN (
      SELECT category, COUNT(*) as cnt FROM skills GROUP BY category
    ) sc ON c.id = sc.category
    ORDER BY c.name ASC
  `).all() as (Category & { skill_count: number })[];
  return rows;
}

/**
 * Get a single category by ID.
 */
export function getCategoryById(id: string): Category | null {
  const db = getDb();
  return db.prepare('SELECT * FROM categories WHERE id = ?').get(id) as Category | null;
}

/**
 * Get all skills belonging to a category.
 */
export function getSkillsByCategory(categoryId: string): Skill[] {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM skills WHERE category = ? ORDER BY name ASC')
    .all(categoryId) as SkillRow[];
  return rows.map(rowToSkill);
}

/**
 * Create or replace a category (upsert).
 */
export function upsertCategory(cat: Category): void {
  const db = getDb();
  db.prepare(`
    INSERT INTO categories (id, name, description, icon)
    VALUES (@id, @name, @description, @icon)
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      description = excluded.description,
      icon = excluded.icon
  `).run({
    id: cat.id,
    name: cat.name,
    description: cat.description || '',
    icon: cat.icon || '',
  });
}
