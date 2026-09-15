import DiningTable from '../models/DiningTable.js';
import Reservation from '../models/Reservation.js';

/**
 * Opening hours, in local restaurant time. `null` means closed that day.
 * Index matches Date#getDay() — 0 is Sunday.
 */
export const SERVICE_HOURS = [
  { lunch: ['12:00', '14:30'], dinner: null },                     // Sun — lunch only
  null,                                                             // Mon — closed
  { lunch: null, dinner: ['17:30', '21:00'] },                      // Tue
  { lunch: null, dinner: ['17:30', '21:00'] },                      // Wed
  { lunch: ['12:00', '14:00'], dinner: ['17:30', '21:30'] },        // Thu
  { lunch: ['12:00', '14:00'], dinner: ['17:30', '21:30'] },        // Fri
  { lunch: ['12:00', '14:30'], dinner: ['17:00', '21:30'] },        // Sat
];

export const SLOT_MINUTES = 15;

/** Larger parties hold the table longer — this drives the overlap maths. */
export function durationFor(partySize) {
  if (partySize <= 2) return 90;
  if (partySize <= 4) return 105;
  if (partySize <= 6) return 135;
  return 150;
}

// India Standard Time is a fixed UTC+5:30 offset year-round — no daylight
// saving to account for — so it can be written directly rather than relying
// on the server process's own timezone, which a host like Render sets to UTC
// by default. Getting this wrong doesn't error; it just quietly serves every
// booking time 5.5 hours off from what the restaurant and guest both assume.
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

/**
 * The calendar date of an instant, in the restaurant's own timezone (IST).
 *
 * Deliberately not toISOString().slice(0, 10), and deliberately not the local
 * getFullYear()/getDate() either — both depend on a clock the server itself
 * doesn't own. Shifting the instant by the fixed IST offset and then reading
 * it back with the UTC getters gives the same calendar date no matter what
 * timezone the Node process is actually running in.
 */
export function localDayISO(value) {
  const d = new Date(new Date(value).getTime() + IST_OFFSET_MS);
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${d.getUTCFullYear()}-${month}-${day}`;
}

/** Builds the real-world instant for a wall-clock time on a given day, in IST. */
function toDate(dayISO, hhmm) {
  return new Date(`${dayISO}T${hhmm}:00+05:30`);
}

/** Every candidate start time for a given day, across both services. */
export function slotsForDay(dayISO) {
  const day = new Date(`${dayISO}T00:00:00`);
  if (Number.isNaN(day.getTime())) return [];

  const hours = SERVICE_HOURS[day.getDay()];
  if (!hours) return [];

  const out = [];
  for (const service of ['lunch', 'dinner']) {
    const window = hours[service];
    if (!window) continue;

    const [openAt, lastSeating] = window.map((t) => toDate(dayISO, t));
    for (let t = new Date(openAt); t <= lastSeating; t = new Date(t.getTime() + SLOT_MINUTES * 60000)) {
      out.push({ service, startsAt: new Date(t) });
    }
  }
  return out;
}

/**
 * Which tables could seat this party at all.
 * We avoid burning a large table on a small party unless nothing else fits,
 * so tables are returned smallest-first and the caller takes the first free one.
 */
function fits(table, partySize) {
  return table.seats >= partySize && table.seats <= partySize + 3;
}

/**
 * Returns each slot for the day annotated with how many tables are free.
 * One database round trip for tables, one for the day's reservations — the
 * overlap test itself runs in memory, which keeps this fast enough to call
 * on every keystroke of the party-size selector.
 */
export async function getAvailability({ dayISO, partySize }) {
  const slots = slotsForDay(dayISO);
  if (slots.length === 0) return { open: false, slots: [] };

  const dayStart = toDate(dayISO, '00:00');
  const dayEnd = new Date(dayStart.getTime() + 86400000);

  const [tables, reservations] = await Promise.all([
    DiningTable.find({ active: true }).sort({ seats: 1 }).lean(),
    Reservation.find({
      startsAt: { $gte: new Date(dayStart.getTime() - 3 * 3600000), $lt: dayEnd },
      status: { $in: ['confirmed', 'seated'] },
    }).lean(),
  ]);

  const duration = durationFor(partySize);

  // A party bigger than the largest table can never be seated in the dining
  // room. Reporting every slot as "unavailable" would read as "fully booked"
  // and send them away; say plainly that they need the private room instead.
  const largestTable = tables.reduce((most, t) => Math.max(most, t.seats), 0);
  if (partySize > largestTable) {
    return { open: true, oversized: true, largestTable, durationMins: duration, slots: [] };
  }

  const candidates = tables.filter((t) => fits(t, partySize));

  const annotated = slots.map(({ service, startsAt }) => {
    const endsAt = new Date(startsAt.getTime() + duration * 60000);

    const free = candidates.filter((table) => {
      const clashes = reservations.some((r) => {
        if (String(r.table) !== String(table._id)) return false;
        const rStart = new Date(r.startsAt);
        const rEnd = new Date(rStart.getTime() + (r.durationMins ?? 105) * 60000);
        // Half-open intervals: a table freed at 20:00 can be re-seated at 20:00.
        return rStart < endsAt && startsAt < rEnd;
      });
      return !clashes;
    });

    return {
      service,
      startsAt: startsAt.toISOString(),
      available: free.length > 0 && startsAt > new Date(),
      tablesFree: free.length,
      tableId: free[0]?._id ?? null,
    };
  });

  return {
    open: true,
    durationMins: duration,
    slots: annotated,
  };
}

/**
 * Picks a concrete table for a booking request, re-checking availability at
 * write time so a slot that went stale in the browser cannot be double-booked.
 */
export async function claimTable({ startsAt, partySize }) {
  const dayISO = localDayISO(startsAt);
  const { slots } = await getAvailability({ dayISO, partySize });
  const wanted = new Date(startsAt).toISOString();
  const slot = slots.find((s) => s.startsAt === wanted);
  return slot?.available ? slot.tableId : null;
}
