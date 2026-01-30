import { z } from 'zod';

// --- Zod Schemas ---

export const createSkillSchema = z.object({
  name: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/, 'Name must be lowercase alphanumeric with dashes'),
  title: z.string().min(1).max(200),
  description: z.string().max(5000).optional().default(''),
  author: z.string().min(1).max(100),
  category: z.string().min(1).max(50),
  tags: z.array(z.string().max(50)).max(20).optional().default([]),
  version: z.string().max(20).optional().default('1.0.0'),
  verified: z.boolean().optional().default(false),
  featured: z.boolean().optional().default(false),
});

export const updateSkillSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(5000).optional(),
  author: z.string().min(1).max(100).optional(),
  category: z.string().min(1).max(50).optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
  version: z.string().max(20).optional(),
  verified: z.boolean().optional(),
  featured: z.boolean().optional(),
});

export const skillFiltersSchema = z.object({
  category: z.string().optional(),
  tag: z.string().optional(),
  verified: z.coerce.boolean().optional(),
  featured: z.coerce.boolean().optional(),
  sort: z.enum(['name', 'stars', 'downloads', 'created_at', 'updated_at']).optional().default('name'),
  order: z.enum(['asc', 'desc']).optional().default('asc'),
  limit: z.coerce.number().int().min(1).max(100).optional().default(50),
  offset: z.coerce.number().int().min(0).optional().default(0),
});

export const searchQuerySchema = z.object({
  q: z.string().min(1).max(200),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

// --- TypeScript Types ---

export type CreateSkill = z.infer<typeof createSkillSchema>;
export type UpdateSkill = z.infer<typeof updateSkillSchema>;
export type SkillFilters = z.infer<typeof skillFiltersSchema>;
export type SearchQuery = z.infer<typeof searchQuerySchema>;

export interface Skill {
  id: string;
  name: string;
  title: string;
  description: string;
  author: string;
  category: string;
  tags: string[];
  stars: number;
  downloads: number;
  verified: boolean;
  featured: boolean;
  version: string;
  created_at: string;
  updated_at: string;
}

export interface SkillRow {
  id: string;
  name: string;
  title: string;
  description: string;
  author: string;
  category: string;
  tags: string;           // JSON string in SQLite
  stars: number;
  downloads: number;
  verified: number;       // SQLite boolean
  featured: number;       // SQLite boolean
  version: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface SkillFile {
  id: number;
  skill_id: string;
  file_path: string;
  file_type: string;
  content: string | null;
  created_at: string;
}

export interface DownloadLog {
  id: number;
  skill_id: string;
  ip_address: string;
  user_agent: string;
  created_at: string;
}

export interface MarketplaceStats {
  total_skills: number;
  total_downloads: number;
  total_stars: number;
  total_categories: number;
  verified_skills: number;
  featured_skills: number;
}

/** Convert a SQLite row to a clean Skill object */
export function rowToSkill(row: SkillRow): Skill {
  return {
    id: row.id,
    name: row.name,
    title: row.title,
    description: row.description,
    author: row.author,
    category: row.category,
    tags: JSON.parse(row.tags || '[]'),
    stars: row.stars,
    downloads: row.downloads,
    verified: Boolean(row.verified),
    featured: Boolean(row.featured),
    version: row.version,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}
