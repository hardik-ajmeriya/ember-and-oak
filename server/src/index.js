import 'dotenv/config';
import dns from 'node:dns';
import { createApp } from './app.js';
import { connectDB, disconnectDB } from './config/db.js';
import { autoSeedIfEmpty } from './config/autoSeed.js';

// Node's built-in DNS resolver (c-ares) can end up misconfigured on Windows —
// e.g. defaulting to 127.0.0.1 — which breaks the SRV/TXT lookups that
// `mongodb+srv://` URIs depend on, even though normal OS DNS resolution works
// fine. Point it at public resolvers explicitly so Atlas connections aren't
// at the mercy of that.
dns.setServers(['8.8.8.8', '1.1.1.1']);

const PORT = process.env.PORT || 5001;

async function bootstrap() {
  if (!process.env.MONGO_URI) {
    console.error('[boot] MONGO_URI is missing. Copy .env.example to .env first.');
    process.exit(1);
  }

  if (!process.env.JWT_SECRET) {
    console.error('[boot] JWT_SECRET is missing. Copy .env.example to .env first.');
    process.exit(1);
  }

  await connectDB(process.env.MONGO_URI);
  await autoSeedIfEmpty();

  const server = createApp().listen(PORT, () =>
    console.log(`[boot] Ember & Oak API listening on http://localhost:${PORT}`)
  );

  const shutdown = (signal) => {
    console.log(`\n[boot] ${signal} received, closing gracefully…`);
    server.close(async () => {
      await disconnectDB();
      process.exit(0);
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

bootstrap().catch((err) => {
  console.error('[boot] Failed to start:', err);
  process.exit(1);
});
