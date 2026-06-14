import jwt from 'jsonwebtoken';
import config from '../config.js';
import ApiError from '../utils/ApiError.js';

/**
 * Verifies the JWT access token on each incoming request.
 *
 * Expects: Authorization: Bearer <access_token>
 *
 * On success: attaches the decoded token payload to `req.user` and calls next().
 * On failure: forwards a structured ApiError to the error handling pipeline.
 */
export const authenticate = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  // Ensure the Authorization header is present and correctly formed
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new ApiError(401, 'Authentication required. No token provided.'));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.jwt.secret);

    // Attach decoded payload (e.g. userId, role) to request for downstream use
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(new ApiError(401, 'Access token has expired.'));
    }
    if (err.name === 'JsonWebTokenError') {
      return next(new ApiError(401, 'Invalid access token.'));
    }
    // Unexpected jwt error
    return next(new ApiError(401, 'Token verification failed.'));
  }
};
