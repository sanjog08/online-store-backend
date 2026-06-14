import User from '../models/user.model.js';
import ApiError from '../utils/ApiError.js';

/**
 * Retrieve all users.
 * Optional query filters: role ('customer' | 'admin')
 */
const getAllUsers = async (filters = {}) => {
  const query = {};
  if (filters.role) query.role = filters.role;
  return User.find(query).sort({ createdAt: -1 });
};

/**
 * Retrieve a single user by their MongoDB ObjectId.
 * Throws 404 if no user is found.
 */
const getUserById = async (id) => {
  const user = await User.findById(id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  return user;
};

/**
 * Create a new user.
 * Role is always forced to 'customer' — promotion goes through the AdminRequest flow.
 * Throws 409 if the email or username is already registered.
 */
const createUser = async (userData) => {
  const { name, username, email, password } = userData;

  // Check both email and username uniqueness in a single query
  const existing = await User.findOne({ $or: [{ email }, { username }] });
  if (existing) {
    if (existing.email === email.toLowerCase()) {
      throw new ApiError(409, 'A user with this email already exists');
    }
    throw new ApiError(409, 'This username is already taken');
  }

  // Role is always 'customer' — ignored even if passed in
  const user = await User.create({ name, username, email, password, role: 'customer' });
  return user;
};

/**
 * Update an existing user by id.
 * Throws 404 if no user is found.
 * Throws 409 if the new email is already taken by another user.
 */
const updateUser = async (id, updateData) => {
  if (updateData.email) {
    const existing = await User.findOne({ email: updateData.email, _id: { $ne: id } });
    if (existing) {
      throw new ApiError(409, 'This email is already in use by another account');
    }
  }

  const user = await User.findByIdAndUpdate(id, updateData, {
    new: true,           // Return the updated document
    runValidators: true, // Enforce schema validation on update
  });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  return user;
};

/**
 * Directly promote a user to admin (admin-only action, bypasses the request flow).
 * Throws 404 if no user is found.
 * Throws 409 if the user is already an admin.
 */
const makeAdmin = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  if (user.role === 'admin') {
    throw new ApiError(409, 'User is already an admin');
  }
  user.role = 'admin';
  await user.save();
  return user;
};

/**
 * Delete a user by id.
 * Throws 404 if no user is found.
 */
const deleteUser = async (id) => {
  const user = await User.findByIdAndDelete(id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  return user;
};

export default { getAllUsers, getUserById, createUser, updateUser, makeAdmin, deleteUser };
