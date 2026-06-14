import adminRequestService from '../services/adminRequest.service.js';

class AdminRequestController {
  /**
   * POST /admin-requests
   * Authenticated customer submits a request to become admin.
   * Body: { reason? }
   */
  async apply(req, res, next) {
    try {
      const { reason } = req.body;
      const request = await adminRequestService.applyForAdmin(req.user.sub, reason);
      res.status(201).json({ success: true, data: request });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /admin-requests
   * Admin lists all admin requests.
   * Query param: ?status=pending|approved|rejected
   */
  async list(req, res, next) {
    try {
      const { status } = req.query;
      const requests = await adminRequestService.getAllRequests(status);
      res.status(200).json({ success: true, count: requests.length, data: requests });
    } catch (err) {
      next(err);
    }
  }

  /**
   * PUT /admin-requests/:id
   * Admin approves or rejects a pending request.
   * Body: { action: 'approve' | 'reject' }
   */
  async review(req, res, next) {
    try {
      const { action } = req.body;
      const request = await adminRequestService.reviewRequest(req.params.id, req.user.sub, action);
      res.status(200).json({ success: true, data: request });
    } catch (err) {
      next(err);
    }
  }

  /**
   * DELETE /admin-requests/:id
   * Customer withdraws their own pending admin request.
   */
  async withdraw(req, res, next) {
    try {
      await adminRequestService.withdrawRequest(req.params.id, req.user.sub);
      res.status(200).json({ success: true, message: 'Your request for the admin role is withdrawn successfully' });
    } catch (err) {
      next(err);
    }
  }
}

export default new AdminRequestController();
