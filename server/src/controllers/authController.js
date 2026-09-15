import jwt from 'jsonwebtoken';
import { z } from 'zod';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const registerSchema = z.object({
  name: z.string().min(2, 'Tell us your name').max(80),
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Use at least 8 characters'),
  phone: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Enter your password'),
});

const signToken = (user) =>
  jwt.sign({ sub: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

const publicUser = (u) => ({
  id: u._id, name: u.name, email: u.email, phone: u.phone, role: u.role, visits: u.visits,
});

export const register = asyncHandler(async (req, res) => {
  if (await User.findOne({ email: req.body.email })) {
    throw ApiError.conflict('An account with that email already exists');
  }
  const user = await User.create(req.body);
  res.status(201).json({ success: true, token: signToken(user), user: publicUser(user) });
});

export const login = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email }).select('+password');
  if (!user || !(await user.comparePassword(req.body.password))) {
    throw ApiError.unauthorized('Email or password is incorrect');
  }
  res.json({ success: true, token: signToken(user), user: publicUser(user) });
});

export const me = asyncHandler(async (req, res) => {
  res.json({ success: true, user: publicUser(req.user) });
});
