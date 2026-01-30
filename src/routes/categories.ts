import { Hono } from 'hono';
import { getAllCategories, getSkillsByCategory, getCategoryById } from '../db/categories.js';

const categories = new Hono();

/**
 * GET /api/v1/categories
 * List all categories with skill counts.
 */
categories.get('/', async (c) => {
  const data = getAllCategories();
  return c.json({ data });
});

/**
 * GET /api/v1/categories/:id
 * Get a category and its skills.
 */
categories.get('/:id', async (c) => {
  const id = c.req.param('id');
  const category = getCategoryById(id);
  if (!category) {
    return c.json({ error: 'Category not found' }, 404);
  }
  const skills = getSkillsByCategory(id);
  return c.json({ data: { ...category, skills } });
});

export default categories;
