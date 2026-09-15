import { Router } from 'express';
import { seedStatus } from '../config/autoSeed.js';
import rateLimit from 'express-rate-limit';
import { validate } from '../middleware/validate.js';
import { protect } from '../middleware/auth.js';
import { optionalAuth } from '../middleware/optionalAuth.js';
import { register, login, me, registerSchema, loginSchema } from '../controllers/authController.js';
import { getMenu, getFeatured, listEvents, getEvent } from '../controllers/menuController.js';
import {
  availability, openingHours, createReservation, createReservationSchema,
  myReservations, cancelReservation, createEnquiry, enquirySchema,
} from '../controllers/reservationController.js';

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, message: 'Too many attempts — try again shortly.' },
});

const bookingLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, message: 'Slow down a moment and try again.' },
});

router.get('/health', (_req, res) =>
  res.json({
    success: true,
    status: 'ok',
    uptime: process.uptime(),
    // Dev-only: makes a failed auto-seed visible without reading server logs.
    ...(process.env.NODE_ENV === 'production' ? {} : { seed: seedStatus }),
  })
);

router.post('/auth/register', authLimiter, validate(registerSchema), register);
router.post('/auth/login', authLimiter, validate(loginSchema), login);
router.get('/auth/me', protect, me);

router.get('/menu', getMenu);
router.get('/menu/featured', getFeatured);

router.get('/events', listEvents);
router.get('/events/:slug', getEvent);

router.get('/reservations/availability', availability);
router.get('/reservations/hours', openingHours);
router.post('/reservations', bookingLimiter, optionalAuth, validate(createReservationSchema), createReservation);
router.get('/reservations/me', protect, myReservations);
router.patch('/reservations/:id/cancel', protect, cancelReservation);

router.post('/enquiries', validate(enquirySchema), createEnquiry);

export default router;
