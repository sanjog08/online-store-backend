import aboutUsService from '../services/aboutUs.service.js';

class AboutUsController {
  /**
   * GET /about-us
   * Returns the about us document.
   * Public — no authentication required.
   */
  async get(req, res, next) {
    try {
      const lang = req.query.lang || 'en';
      const doc = await aboutUsService.getAboutUs(lang);
      res.status(200).json({ success: true, data: doc });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /about-us
   * Creates the about us document for the first time.
   * Body: full about us object (see model for schema).
   * Admin only.
   */
  async create(req, res, next) {
    try {
      const doc = await aboutUsService.createAboutUs(req.body);
      res.status(201).json({ success: true, data: doc });
    } catch (err) {
      next(err);
    }
  }

  /**
   * PUT /about-us
   * Updates the about us document (partial update supported).
   * Body: any subset of about us fields.
   * Admin only.
   */
  async update(req, res, next) {
    try {
      const doc = await aboutUsService.updateAboutUs(req.body);
      res.status(200).json({ success: true, data: doc });
    } catch (err) {
      next(err);
    }
  }

  /**
   * DELETE /about-us
   * Removes the about us document entirely.
   * Admin only.
   */
  async remove(req, res, next) {
    try {
      await aboutUsService.deleteAboutUs();
      res.status(200).json({ success: true, message: 'About Us document deleted successfully.' });
    } catch (err) {
      next(err);
    }
  }
}

export default new AboutUsController();
