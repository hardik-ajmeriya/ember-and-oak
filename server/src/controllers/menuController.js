import MenuItem from '../models/MenuItem.js';
import Event from '../models/Event.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const COURSE_ORDER = ['snacks', 'starters', 'mains', 'sides', 'desserts', 'cheese'];

/**
 * GET /api/menu — returns the menu already grouped by course, so the client
 * renders it without doing any reshaping of its own.
 */
export const getMenu = asyncHandler(async (req, res) => {
  const filter = { available: true };
  if (req.query.season && req.query.season !== 'all') {
    filter.season = { $in: [req.query.season, 'year-round'] };
  }
  if (req.query.dietary && req.query.dietary !== 'all') {
    filter.dietary = req.query.dietary;
  }

  const items = await MenuItem.find(filter).sort({ order: 1, name: 1 });

  const courses = COURSE_ORDER.map((course) => ({
    course,
    items: items.filter((i) => i.course === course),
  })).filter((group) => group.items.length > 0);

  res.json({ success: true, total: items.length, courses });
});

export const getFeatured = asyncHandler(async (_req, res) => {
  const items = await MenuItem.find({ featured: true, available: true }).limit(4);
  res.json({ success: true, items });
});

export const listEvents = asyncHandler(async (_req, res) => {
  const items = await Event.find({ startsAt: { $gte: new Date() } }).sort({ startsAt: 1 });
  res.json({ success: true, items });
});

export const getEvent = asyncHandler(async (req, res) => {
  const event = await Event.findOne({ slug: req.params.slug });
  if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
  res.json({ success: true, event });
});
