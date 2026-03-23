const jwt = require('jsonwebtoken');
const { AppError } = require('./errorHandler');

const getTokenFromRequest = (req) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  if (req.headers['x-session-id']) {
    return req.headers['x-session-id'];
  }

  return null;
};

const verifyToken = (token) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new AppError('Server authentication is not configured', 500, 'AUTH_CONFIG_ERROR');
  }
  return jwt.verify(token, secret);
};

const requireDepartmentAuth = (req, res, next) => {
  try {
    const token = getTokenFromRequest(req);
    if (!token) {
      throw new AppError('Authentication required', 401, 'UNAUTHORIZED');
    }

    const payload = verifyToken(token);
    if (payload.role !== 'department') {
      throw new AppError('Insufficient permissions', 403, 'FORBIDDEN');
    }

    req.auth = payload;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
      return next(new AppError('Invalid or expired session', 401, 'UNAUTHORIZED'));
    }
    return next(error);
  }
};

const requireAdminAuth = (req, res, next) => {
  try {
    const token = getTokenFromRequest(req);
    if (!token) {
      throw new AppError('Authentication required', 401, 'UNAUTHORIZED');
    }

    const payload = verifyToken(token);
    if (payload.role !== 'admin') {
      throw new AppError('Insufficient permissions', 403, 'FORBIDDEN');
    }

    req.auth = payload;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
      return next(new AppError('Invalid or expired session', 401, 'UNAUTHORIZED'));
    }
    return next(error);
  }
};

module.exports = {
  requireDepartmentAuth,
  requireAdminAuth
};