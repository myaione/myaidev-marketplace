import { Hono } from 'hono';
import {
  createSkillSchema,
  updateSkillSchema,
  skillFiltersSchema,
} from '../types/skill.js';
import {
  getAllSkills,
  getSkillById,
  createSkill,
  updateSkill,
  deleteSkill,
  incrementDownloads,
  incrementStars,
  logDownload,
} from '../db/skills.js';

const skills = new Hono();

/**
 * GET /api/v1/skills
 * List skills with optional filtering, sorting, and pagination.
 */
skills.get('/', async (c) => {
  const raw = Object.fromEntries(new URL(c.req.url).searchParams);
  const filters = skillFiltersSchema.parse(raw);
  const data = getAllSkills(filters);
  return c.json({ data, count: data.length });
});

/**
 * GET /api/v1/skills/:id
 * Get a single skill by ID.
 */
skills.get('/:id', async (c) => {
  const id = c.req.param('id');
  const skill = getSkillById(id);
  if (!skill) {
    return c.json({ error: 'Skill not found' }, 404);
  }
  return c.json({ data: skill });
});

/**
 * POST /api/v1/skills
 * Create a new skill.
 */
skills.post('/', async (c) => {
  const body = await c.req.json();
  const data = createSkillSchema.parse(body);
  const skill = createSkill(data);
  return c.json({ data: skill }, 201);
});

/**
 * PATCH /api/v1/skills/:id
 * Update an existing skill.
 */
skills.patch('/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const updates = updateSkillSchema.parse(body);
  const skill = updateSkill(id, updates);
  if (!skill) {
    return c.json({ error: 'Skill not found' }, 404);
  }
  return c.json({ data: skill });
});

/**
 * DELETE /api/v1/skills/:id
 * Delete a skill.
 */
skills.delete('/:id', async (c) => {
  const id = c.req.param('id');
  const deleted = deleteSkill(id);
  if (!deleted) {
    return c.json({ error: 'Skill not found' }, 404);
  }
  return c.json({ message: 'Skill deleted' });
});

/**
 * GET /api/v1/skills/:id/download
 * Download a skill package. Increments download count and logs the event.
 */
skills.get('/:id/download', async (c) => {
  const id = c.req.param('id');
  const skill = getSkillById(id);
  if (!skill) {
    return c.json({ error: 'Skill not found' }, 404);
  }

  // Track the download
  const ip = c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || '';
  const ua = c.req.header('user-agent') || '';
  incrementDownloads(id);
  logDownload(id, ip, ua);

  // For now, return skill data as JSON download (file upload comes in Task 4)
  return c.json({
    data: {
      skill,
      message: 'Download tracked. File package download will be available in a future release.',
    },
  });
});

/**
 * POST /api/v1/skills/:id/star
 * Star a skill. Increments the star count.
 */
skills.post('/:id/star', async (c) => {
  const id = c.req.param('id');
  const skill = getSkillById(id);
  if (!skill) {
    return c.json({ error: 'Skill not found' }, 404);
  }
  incrementStars(id);
  return c.json({ data: { stars: skill.stars + 1 } });
});

export default skills;
