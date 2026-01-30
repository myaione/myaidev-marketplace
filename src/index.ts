import 'dotenv/config';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { serve } from '@hono/node-server';
import { initializeDatabase } from './db/connection.js';
import { errorHandler } from './middleware/error-handler.js';

// Routes
import skillRoutes from './routes/skills.js';
import categoryRoutes from './routes/categories.js';
import searchRoutes from './routes/search.js';
import statsRoutes from './routes/stats.js';

// --- Initialize database ---
initializeDatabase();

// --- Create app ---
const app = new Hono();

// --- Global middleware ---
app.use('*', logger());
app.use('*', cors({
  origin: process.env.CORS_ORIGIN || '*',
  allowMethods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));
app.use('*', errorHandler);

// --- Health check ---
app.get('/', (c) => {
  return c.json({
    name: 'MyAIDev Marketplace API',
    version: '1.0.0',
    status: 'ok',
    docs: '/api/v1',
  });
});

app.get('/health', (c) => c.json({ status: 'ok' }));

// --- API v1 routes ---
const api = new Hono();
api.route('/skills', skillRoutes);
api.route('/categories', categoryRoutes);
api.route('/search', searchRoutes);
api.route('/stats', statsRoutes);

// API index
api.get('/', (c) => {
  return c.json({
    endpoints: [
      'GET    /api/v1/skills              - List skills (with filters)',
      'GET    /api/v1/skills/:id          - Get skill details',
      'POST   /api/v1/skills              - Create new skill',
      'PATCH  /api/v1/skills/:id          - Update skill',
      'DELETE /api/v1/skills/:id          - Delete skill',
      'GET    /api/v1/skills/:id/download - Download skill package',
      'POST   /api/v1/skills/:id/star     - Star a skill',
      'GET    /api/v1/categories          - List categories',
      'GET    /api/v1/categories/:id      - Get category with skills',
      'GET    /api/v1/search?q=           - Search skills',
      'GET    /api/v1/stats               - Marketplace statistics',
    ],
  });
});

app.route('/api/v1', api);

// --- Start server ---
const port = Number(process.env.PORT) || 3000;
const host = process.env.HOST || '0.0.0.0';

console.log(`\n🚀 MyAIDev Marketplace API`);
console.log(`   Server:  http://${host}:${port}`);
console.log(`   API:     http://${host}:${port}/api/v1`);
console.log(`   Health:  http://${host}:${port}/health\n`);

serve({ fetch: app.fetch, port, hostname: host });
