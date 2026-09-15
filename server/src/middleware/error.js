import ApiError from '../utils/ApiError.js';

export function notFound(req, _res, next) {
  next(ApiError.notFound(`Route ${req.method} ${req.originalUrl} not found`));
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  let error = err;

  if (err.name === 'CastError') error = ApiError.badRequest(`Invalid ${err.path}: ${err.value}`);
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] ?? 'field';
    error = ApiError.conflict(`That ${field} is already in use`);
  }
  if (err.name === 'ValidationError') {
    error = ApiError.badRequest(
      'Please check the highlighted fields',
      Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }))
    );
  }

  const statusCode = error.statusCode || 500;
  const payload = {
    success: false,
    message: statusCode === 500 ? 'Something went wrong on our end' : error.message,
  };
  if (error.details) payload.details = error.details;
  if (process.env.NODE_ENV !== 'production' && statusCode === 500) payload.stack = err.stack;

  if (statusCode === 500) console.error('[error]', err);
  res.status(statusCode).json(payload);
}
