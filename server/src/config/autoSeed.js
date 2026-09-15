import MenuItem from '../models/MenuItem.js';
import Event from '../models/Event.js';
import { seedDatabase } from '../seed.js';

/**
 * What the last auto-seed attempt did. Surfaced on /api/health outside
 * production so a failed seed is visible without reading the server logs.
 */
export const seedStatus = { attempted: false, seeded: false, reason: null, error: null };

/**
 * Demo data is only useful if it is actually there, so the server checks on
 * boot and fills the database itself rather than depending on someone
 * remembering to run a separate command.
 *
 * Returns a human-readable reason to seed, or null to leave the data alone.
 * Conservative by design: it only reports a reason when the demo content is
 * genuinely missing or has aged out, never when real data is present.
 */
async function reasonToSeed() {
  const total = await MenuItem.estimatedDocumentCount();
  if (total === 0) return 'no menu in the database';

  // Events are seeded relative to the day the seed ran; once they are all in
  // the past the events page is empty even though rows exist.
  const upcoming = await Event.countDocuments({ startsAt: { $gte: new Date() } });
  if (upcoming === 0) return 'every seeded event is in the past';

  return null;
}

/**
 * Never throws. Seeding demo content is a convenience, so a failure here must
 * not stop the API from starting — the error is recorded and logged instead.
 * Set AUTO_SEED=false to turn it off; it is skipped outright in production.
 */
export async function autoSeedIfEmpty() {
  if (process.env.NODE_ENV === 'production') return seedStatus;
  if (process.env.AUTO_SEED === 'false') return seedStatus;

  try {
    seedStatus.attempted = true;
    const reason = await reasonToSeed();
    if (!reason) return seedStatus;

    seedStatus.reason = reason;
    console.log(`[seed] ${reason} — seeding demo content…`);
    // Quiet by default: the per-collection tallies are noise on every boot.
    await seedDatabase({ log: () => {} });
    seedStatus.seeded = true;
    console.log('[seed] done. Demo logins: guest@emberandoak.com / ember1234 (guest), staff@emberandoak.com / ember1234 (staff)');
  } catch (err) {
    seedStatus.error = err.message;
    console.error('[seed] auto-seed failed, starting anyway:', err);
  }

  return seedStatus;
}
