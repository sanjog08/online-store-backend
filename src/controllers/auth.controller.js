import authService from '../services/auth.service.js';

class AuthController {
  /**
   * POST /auth/signup
   * Body: { name, username, email, password }
   *
   * Creates a new account (always as 'customer') and immediately returns tokens.
   * Response: { success, data: { accessToken, refreshToken, user: { id, name, username, email, role, is_admin } } }
   */
  async signup(req, res, next) {
    try {
      const { name, username, email, password } = req.body;
      const result = await authService.signup({ name, username, email, password });

      res.status(201).json({
        success: true,
        data: {
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
          user: {
            id: result.user.id,
            name: result.user.name,
            username: result.user.username,
            email: result.user.email,
            role: result.user.role,
            is_admin: result.user.role === 'admin',
          },
        },
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /auth/login
   * Body: { email, password }  OR  { username, password }
   *
   * Response: { success, data: { accessToken, refreshToken, user: { id, name, username, email, role, is_admin } } }
   */
  async login(req, res, next) {
    try {
      const { email, username, password } = req.body;
      // Accept either email or username — whichever the client sends
      const identifier = email || username;
      const result = await authService.login(identifier, password);

      res.status(200).json({
        success: true,
        data: {
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
          user: {
            id: result.user.id,
            name: result.user.name,
            username: result.user.username,
            email: result.user.email,
            role: result.user.role,
            is_admin: result.user.role === 'admin',
          },
        },
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /auth/logout
   * Body: { refreshToken }
   *
   * Invalidates the refresh token server-side.
   * The client should also discard the access token locally.
   */
  async logout(req, res, next) {
    try {
      const { refreshToken } = req.body;
      await authService.logout(refreshToken);
      res.status(200).json({ success: true, message: 'Logged out successfully' });
    } catch (err) {
      next(err);
    }
  }
}

export default new AuthController();
