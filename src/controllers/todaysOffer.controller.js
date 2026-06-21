import todaysOfferService from '../services/todaysOffer.service.js';

class TodaysOfferController {
  /**
   * GET /todays-offer
   * Returns the curated today's offer list with full product data.
   * Public — no authentication required.
   */
  async get(req, res, next) {
    try {
      const doc = await todaysOfferService.getTodaysOffer();
      res.status(200).json({ success: true, count: doc.products?.length ?? 0, data: doc });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /todays-offer
   * Replaces the entire list with the provided productIds (max 4).
   * Body: { productIds: string[] }
   * Admin only.
   */
  async set(req, res, next) {
    try {
      const { productIds } = req.body;
      const doc = await todaysOfferService.setTodaysOffer(productIds, req.user.sub);
      res.status(200).json({ success: true, count: doc.products.length, data: doc });
    } catch (err) {
      next(err);
    }
  }

  /**
   * PUT /todays-offer
   * Adds one or more product IDs to the existing list (total max 4).
   * Body: { productIds: string[] }
   * Admin only.
   */
  async add(req, res, next) {
    try {
      const { productIds } = req.body;
      const doc = await todaysOfferService.addToTodaysOffer(productIds, req.user.sub);
      res.status(200).json({ success: true, count: doc.products.length, data: doc });
    } catch (err) {
      next(err);
    }
  }

  /**
   * DELETE /todays-offer
   * Removes specific product IDs from the list.
   * Body: { productIds: string[] }
   * Admin only.
   */
  async remove(req, res, next) {
    try {
      const { productIds } = req.body;
      const doc = await todaysOfferService.removeFromTodaysOffer(productIds, req.user.sub);
      res.status(200).json({ success: true, count: doc.products?.length ?? 0, data: doc });
    } catch (err) {
      next(err);
    }
  }
}

export default new TodaysOfferController();
