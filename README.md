# MyAIDev Marketplace API

Backend API for the MyAIDev skill marketplace — browse, search, download, and manage AI development skills.

## Tech Stack

- **Runtime**: Node.js + TypeScript
- **Framework**: [Hono](https://hono.dev) (lightweight, fast)
- **Database**: SQLite via [better-sqlite3](https://github.com/WiseLibs/better-sqlite3)
- **Validation**: [Zod](https://zod.dev)

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment config
cp .env.example .env

# Initialize database + seed data
npm run db:init
npm run db:seed

# Start development server (hot reload)
npm run dev
```

The server runs at **http://localhost:3000**.

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/v1/skills` | List skills (filtering, sorting, pagination) |
| `GET` | `/api/v1/skills/:id` | Get skill details |
| `POST` | `/api/v1/skills` | Create a new skill |
| `PATCH` | `/api/v1/skills/:id` | Update a skill |
| `DELETE` | `/api/v1/skills/:id` | Delete a skill |
| `GET` | `/api/v1/skills/:id/download` | Download skill package |
| `POST` | `/api/v1/skills/:id/star` | Star a skill |
| `GET` | `/api/v1/categories` | List categories |
| `GET` | `/api/v1/categories/:id` | Category details with skills |
| `GET` | `/api/v1/search?q=` | Search skills |
| `GET` | `/api/v1/stats` | Marketplace statistics |

### Query Parameters (GET /api/v1/skills)

| Param | Type | Description |
|-------|------|-------------|
| `category` | string | Filter by category ID |
| `tag` | string | Filter by tag |
| `verified` | boolean | Filter verified skills |
| `featured` | boolean | Filter featured skills |
| `sort` | string | Sort by: `name`, `stars`, `downloads`, `created_at`, `updated_at` |
| `order` | string | `asc` or `desc` |
| `limit` | number | Results per page (1-100, default 50) |
| `offset` | number | Pagination offset |

## Project Structure

```
├── src/
│   ├── index.ts           # Server entry point
│   ├── routes/            # API route handlers
│   │   ├── skills.ts
│   │   ├── categories.ts
│   │   ├── search.ts
│   │   └── stats.ts
│   ├── db/                # Database layer
│   │   ├── connection.ts
│   │   ├── skills.ts
│   │   ├── categories.ts
│   │   ├── init.ts
│   │   └── seed.ts
│   ├── middleware/         # Middleware
│   │   └── error-handler.ts
│   └── types/             # TypeScript types & Zod schemas
│       └── skill.ts
├── db/
│   ├── schema.sql         # Database schema
│   └── migrations/        # Future migrations
├── uploads/               # Skill package storage
├── public/                # Static files
└── .env.example
```

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Compile TypeScript |
| `npm start` | Run compiled JS |
| `npm run db:init` | Initialize database schema |
| `npm run db:seed` | Seed with default data |
| `npm run typecheck` | Type-check without emitting |

## License

MIT
