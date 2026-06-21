import AdminRequest from '../models/adminRequest.model.js';
import User from '../models/user.model.js';
import ApiError from '../utils/ApiError.js';

/**
 * Submit a request to become admin.
 * A user can only have one pending request at a time.
 * Users who are already admin cannot apply.
 */
const applyForAdmin = async (userId, reason) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  if (user.role === 'admin') {
    throw new ApiError(409, 'You are already an admin');
  }

  const existingPending = await AdminRequest.findOne({ user: userId, status: 'pending' });
  if (existingPending) {
    throw new ApiError(409, 'Already applied for admin.');
  }

  const request = await AdminRequest.create({ user: userId, reason });
  return request.populate('user', 'name username email role');
};

/**
 * List all admin requests (admin-only).
 * Optionally filter by status: 'pending' | 'approved' | 'rejected'
 */
const getAllRequests = async (statusFilter) => {
  const filter = statusFilter ? { status: statusFilter } : {};
  return AdminRequest.find(filter)
    .populate('user', 'name username email role')
    .populate('reviewedBy', 'name username email')
    .sort({ createdAt: -1 });
};

/**
 * Review (approve or reject) an admin request.
 * action: 'approve' | 'reject'
 * Promoting the requesting user's role to 'admin' when approved.
 */
const reviewRequest = async (requestId, adminId, action) => {
  if (!['approve', 'reject'].includes(action)) {
    throw new ApiError(400, "action must be 'approve' or 'reject'");
  }

  const request = await AdminRequest.findById(requestId);
  if (!request) {
    throw new ApiError(404, 'Admin request not found');
  }
  if (request.status !== 'pending') {
    throw new ApiError(409, `Request has already been ${request.status}`);
  }

  if (action === 'approve') {
    // Promote the user to admin
    await User.findByIdAndUpdate(request.user, { role: 'admin' });
  }

  request.status = action === 'approve' ? 'approved' : 'rejected';
  request.reviewedBy = adminId;
  request.reviewedAt = new Date();
  await request.save();

  return request.populate([
    { path: 'user', select: 'name username email role' },
    { path: 'reviewedBy', select: 'name username email' },
  ]);
};

/**
 * Withdraw (delete) a pending admin request.
 * Only the customer who created the request can withdraw it.
 * Already reviewed requests (approved/rejected) cannot be withdrawn.
 */
const withdrawRequest = async (requestId, userId) => {
  const request = await AdminRequest.findById(requestId);
  if (!request) {
    throw new ApiError(404, 'Admin request not found');
  }
  if (request.user.toString() !== userId) {
    throw new ApiError(403, 'You are not allowed to withdraw this request');
  }
  if (request.status !== 'pending') {
    throw new ApiError(409, `Cannot withdraw a request that has already been ${request.status}`);
  }

  await request.deleteOne();
};

export default { applyForAdmin, getAllRequests, reviewRequest, withdrawRequest };
