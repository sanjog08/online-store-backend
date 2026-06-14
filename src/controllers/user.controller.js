import userService from '../services/user.service.js';

class UserController {
  /**
   * GET /users
   * Returns a list of all users (admin only).
   * Optional query param: ?role=customer|admin
   */
  async getAll(req, res, next) {
    try {
      const { role } = req.query;
      const users = await userService.getAllUsers({ role });
      res.status(200).json({ success: true, count: users.length, data: users });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /users/:id
   * Returns a single user by id.
   */
  async getOne(req, res, next) {
    try {
      const user = await userService.getUserById(req.params.id);
      res.status(200).json({ success: true, data: user });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /users
   * Creates a new user (admin only — for direct account creation).
   * Body: { name, username, email, password }
   * Note: role is always set to 'customer' — use PUT /users/:id/make-admin to promote.
   */
  async create(req, res, next) {
    try {
      const { name, username, email, password } = req.body;
      const user = await userService.createUser({ name, username, email, password });
      res.status(201).json({ success: true, data: user });
    } catch (err) {
      next(err);
    }
  }

  /**
   * PUT /users/:id
   * Updates an existing user's profile fields.
   * Body: any combination of { name, email }
   * Note: role changes go through dedicated endpoints.
   */
  async update(req, res, next) {
    try {
      const { name, email } = req.body;
      const user = await userService.updateUser(req.params.id, { name, email });
      res.status(200).json({ success: true, data: user });
    } catch (err) {
      next(err);
    }
  }

  /**
   * PUT /users/:id/make-admin
   * Admin directly promotes a user to admin (bypasses the request flow).
   */
  async makeAdmin(req, res, next) {
    try {
      const user = await userService.makeAdmin(req.params.id);
      res.status(200).json({ success: true, message: 'User promoted to admin', data: user });
    } catch (err) {
      next(err);
    }
  }

  /**
   * DELETE /users/:id
   * Deletes a user by id.
   */
  async delete(req, res, next) {
    try {
      await userService.deleteUser(req.params.id);
      res.status(200).json({ success: true, message: 'User deleted successfully' });
    } catch (err) {
      next(err);
    }
  }
}

export default new UserController();
