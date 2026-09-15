import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Attaches req.user when a valid token is present, but never rejects.
 * Reservations can be made by guests as well as account holders.
 */
export async function optionalAuth(req, _res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : req.cookies?.token;
  if (!token) return next();

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(payload.sub);
  } catch {
    // An expired token simply means "treat this as a guest booking".
  }
  next();
}
