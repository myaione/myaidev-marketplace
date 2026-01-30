import type { Context, Next } from 'hono';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import { ZodError } from 'zod';

/**
 * Global error handling middleware.
 */
export async function errorHandler(c: Context, next: Next) {
  try {
    await next();
  } catch (err: unknown) {
    console.error('Unhandled error:', err);

    if (err instanceof ZodError) {
      return c.json({
        error: 'Validation Error',
        details: err.errors.map(e => ({
          path: e.path.join('.'),
          message: e.message,
        })),
      }, 400 as ContentfulStatusCode);
    }

    if (err instanceof Error && 'status' in err) {
      const status = (err as any).status as ContentfulStatusCode;
      return c.json({ error: err.message }, status);
    }

    if (err instanceof Error) {
      // SQLite unique constraint
      if (err.message.includes('UNIQUE constraint failed')) {
        return c.json({ error: 'A record with that unique value already exists' }, 409 as ContentfulStatusCode);
      }
      return c.json({ error: err.message }, 500 as ContentfulStatusCode);
    }

    return c.json({ error: 'Internal Server Error' }, 500 as ContentfulStatusCode);
  }
}
