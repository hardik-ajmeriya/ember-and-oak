import express from 'express';
import path from 'node:path';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import routes from './routes/index.js';
import { notFound, errorHandler } from './middleware/error.js';

export function createApp() {
  const app = express();

  app.set('trust proxy', 1);
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(
    cors({
      origin: (process.env.CLIENT_ORIGIN || 'http://localhost:5174').split(','),
      credentials: true,
    })
  );
  app.use(express.json({ limit: '1mb' }));
  app.use(cookieParser());
  app.use(compression());
  if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

  app.use('/api', routes);

  /**
   * In production the API also serves the built front end, so the whole
   * project deploys as one service instead of two.
   *
   * That is not only cheaper on a free tier — it puts the site and the API on
   * the same origin, which removes CORS from the picture entirely and means
   * the browser never needs to know the API's address.
   *
   * The catch-all deliberately sits after the API routes: anything under /api
   * has already been handled above, so a bad endpoint still returns JSON
   * rather than quietly serving the HTML shell, which is a genuinely horrible
   * thing to debug from the client side.
   */
  const here = path.dirname(fileURLToPath(import.meta.url));
  const clientDist = process.env.CLIENT_DIST || path.resolve(here, '../../client/dist');

  // True only when this API is deployed together with a built client (the
  // single-service option). When the client is deployed separately instead —
  // e.g. to Vercel — this directory never exists here, and that is expected:
  // the API has no front end to serve, so the block below is simply skipped.
  if (process.env.NODE_ENV === 'production' && existsSync(clientDist)) {
    app.use(express.static(clientDist, { maxAge: '1y', index: false }));

    // index.html itself must never be cached, or a returning visitor keeps
    // loading the old build's script tags after a deploy.
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api') || req.path.startsWith('/v1')) return next();
      return res.sendFile(path.join(clientDist, 'index.html'), {
        headers: { 'Cache-Control': 'no-store' },
      });
    });
  }

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
