import { z } from 'zod';
import Reservation from '../models/Reservation.js';
import Enquiry from '../models/Enquiry.js';
import ApiError from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  getAvailability, claimTable, durationFor, slotsForDay, localDayISO, SERVICE_HOURS,
} from '../services/availability.js';

/** GET /api/reservations/availability?date=YYYY-MM-DD&partySize=2 */
export const availability = asyncHandler(async (req, res) => {
  const dayISO = String(req.query.date || '').slice(0, 10);
  const partySize = Math.min(Math.max(parseInt(req.query.partySize, 10) || 2, 1), 12);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(dayISO)) throw ApiError.badRequest('Provide a date as YYYY-MM-DD');

  const result = await getAvailability({ dayISO, partySize });
  res.json({ success: true, date: dayISO, partySize, ...result });
});

/** The client uses this to grey out closed days in its date picker. */
export const openingHours = asyncHandler(async (_req, res) => {
  res.json({
    success: true,
    hours: SERVICE_HOURS.map((day, index) => ({
      day: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][index],
      closed: day === null,
      lunch: day?.lunch ?? null,
      dinner: day?.dinner ?? null,
    })),
  });
});

export const createReservationSchema = z.object({
  name: z.string().min(2, 'Tell us the name for the booking'),
  email: z.string().email('Enter a valid email address'),
  phone: z.string().min(6, 'We need a phone number in case the kitchen has a question'),
  partySize: z.coerce.number().int().min(1).max(12),
  startsAt: z.string().min(1, 'Pick a time'),
  occasion: z.enum(['none', 'birthday', 'anniversary', 'business', 'celebration']).optional(),
  notes: z.string().max(500).optional(),
  dietary: z.string().max(300).optional(),
});

export const createReservation = asyncHandler(async (req, res) => {
  const { startsAt, partySize } = req.body;
  const when = new Date(startsAt);

  if (Number.isNaN(when.getTime())) throw ApiError.badRequest('That time is not valid');
  if (when < new Date()) throw ApiError.badRequest('That time has already passed');

  // Check the door is open before looking for a table, so a closed day gets an
  // honest answer instead of "that table has just gone", which would send the
  // guest hunting for another time on a day we are never open.
  if (slotsForDay(localDayISO(when)).length === 0) {
    throw ApiError.badRequest('We are closed that day — the kitchen rests on Mondays.');
  }

  // Re-check at write time — the browser's view of the slot may be minutes old.
  const tableId = await claimTable({ startsAt: when, partySize });
  if (!tableId) {
    throw ApiError.conflict('That table has just gone. Please choose another time.');
  }

  const reservation = await Reservation.create({
    ...req.body,
    startsAt: when,
    durationMins: durationFor(partySize),
    table: tableId,
    guest: req.user?._id ?? null,
  });

  res.status(201).json({
    success: true,
    message: `Table held for ${partySize}. We have emailed the details to ${req.body.email}.`,
    reservation: await reservation.populate('table', 'label zone seats'),
  });
});

export const myReservations = asyncHandler(async (req, res) => {
  const all = await Reservation.find({
    $or: [{ guest: req.user._id }, { email: req.user.email }],
  })
    .populate('table', 'label zone seats')
    .sort({ startsAt: -1 });

  const now = new Date();
  res.json({
    success: true,
    upcoming: all.filter((r) => r.startsAt >= now && r.status !== 'cancelled'),
    past: all.filter((r) => r.startsAt < now || r.status === 'cancelled'),
  });
});

export const cancelReservation = asyncHandler(async (req, res) => {
  const reservation = await Reservation.findOne({
    _id: req.params.id,
    $or: [{ guest: req.user._id }, { email: req.user.email }],
  });
  if (!reservation) throw ApiError.notFound('Reservation not found');
  if (reservation.status === 'cancelled') throw ApiError.badRequest('That booking is already cancelled');

  reservation.status = 'cancelled';
  await reservation.save();
  res.json({ success: true, message: 'Reservation cancelled. We hope to see you another time.', reservation });
});

export const enquirySchema = z.object({
  name: z.string().min(2, 'Tell us your name'),
  email: z.string().email('Enter a valid email address'),
  phone: z.string().optional(),
  kind: z.enum(['general', 'private-dining', 'press', 'careers', 'large-party']).optional(),
  message: z.string().min(10, 'A sentence or two helps us reply properly').max(2000),
});

export const createEnquiry = asyncHandler(async (req, res) => {
  await Enquiry.create(req.body);
  res.status(201).json({ success: true, message: 'Thank you — we reply to every enquiry within a day.' });
});
