import { Hono } from 'hono';
import { searchQuerySchema } from '../types/skill.js';
import { searchSkills } from '../db/skills.js';

const search = new Hono();

/**
 * GET /api/v1/search?q=<query>&limit=<n>
 * Full-text search across skills (name, title, description, author, tags).
 */
search.get('/', async (c) => {
  const raw = Object.fromEntries(new URL(c.req.url).searchParams);
  const { q, limit } = searchQuerySchema.parse(raw);
  const data = searchSkills(q, limit);
  return c.json({ data, query: q, count: data.length });
});

export default search;
