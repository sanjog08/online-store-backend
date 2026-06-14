import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import userService from './user.service.js';
import config from '../config.js';
import ApiError from '../utils/ApiError.js';

/**
 * Generates a signed JWT access token (short-lived).
 */
const generateAccessToken = (payload) => {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: `${config.jwt.accessExpirationMinutes}m`,
  });
};

/**
 * Generates a signed JWT refresh token (long-lived).
 */
const generateRefreshToken = (payload) => {
  return jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: `${config.jwt.refreshExpirationDays}d`,
  });
};

/**
 * Shared helper — issues tokens, persists the refresh token, and returns
 * the standard auth response shape used by both signup and login.
 */
const issueTokens = async (user) => {
  const tokenPayload = { sub: user._id, role: user.role };
  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return {
    accessToken,
    refreshToken,
    user: {
      id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
    },
  };
};

/**
 * Registers a new user and immediately issues tokens.
 * The client is authenticated right after signup — no separate login step required.
 *
 * Body: { name, username, email, password, role? }
 * Throws 409 if email or username is already taken.
 */
const signup = async (userData) => {
  // Delegate creation + uniqueness checks to the user service
  const user = await userService.createUser(userData);
  return issueTokens(user);
};

/**
 * Authenticates a user using their email or username, plus password.
 *
 * On success returns signed access + refresh tokens and the user's role.
 * Throws 401 for any invalid credential combination (intentionally vague
 * to prevent user enumeration attacks).
 */
const login = async (identifier, password) => {
  if (!identifier) {
    throw new ApiError(400, 'Email or username is required');
  }

  const normalized = identifier.toLowerCase();

  // Match against either email or username — whichever the user provided
  const user = await User
    .findOne({ $or: [{ email: normalized }, { username: normalized }] })
    .select('+password +refreshToken');

  if (!user) {
    throw new ApiError(401, 'Invalid credentials');
  }

  const isMatch = await user.isPasswordMatch(password);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid credentials');
  }

  return issueTokens(user);
};

/**
 * Logs out a user by nulling their stored refresh token.
 * The access token will expire naturally on its own (15 min).
 *
 * Throws 401 if the refresh token is invalid or already cleared.
 */
const logout = async (refreshToken) => {
  let decoded;
  try {
    decoded = jwt.verify(refreshToken, config.jwt.refreshSecret);
  } catch {
    throw new ApiError(401, 'Invalid or expired refresh token');
  }

  const user = await User.findById(decoded.sub).select('+refreshToken');
  if (!user || user.refreshToken !== refreshToken) {
    throw new ApiError(401, 'Refresh token not recognised');
  }

  // Invalidate the refresh token — server-side logout
  user.refreshToken = null;
  await user.save({ validateBeforeSave: false });
};

export default { signup, login, logout };
