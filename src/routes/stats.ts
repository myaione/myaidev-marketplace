import { Hono } from 'hono';
import { getStats } from '../db/skills.js';

const stats = new Hono();

/**
 * GET /api/v1/stats
 * Get marketplace-wide statistics.
 */
stats.get('/', async (c) => {
  const data = getStats();
  return c.json({ data });
});

export default stats;
