import newProductService from '../services/newProduct.service.js';

class NewProductController {
  /**
   * GET /new-products
   * Returns the curated new products list with full product data.
   * Public — no authentication required.
   */
  async get(req, res, next) {
    try {
      const doc = await newProductService.getNewProducts();
      res.status(200).json({ success: true, count: doc.products?.length ?? 0, data: doc });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /new-products
   * Replaces the entire list with the provided productIds (max 4).
   * Body: { productIds: string[] }
   * Admin only.
   */
  async set(req, res, next) {
    try {
      const { productIds } = req.body;
      const doc = await newProductService.setNewProducts(productIds, req.user.sub);
      res.status(200).json({ success: true, count: doc.products.length, data: doc });
    } catch (err) {
      next(err);
    }
  }

  /**
   * PUT /new-products
   * Adds one or more product IDs to the existing list (total max 4).
   * Body: { productIds: string[] }
   * Admin only.
   */
  async add(req, res, next) {
    try {
      const { productIds } = req.body;
      const doc = await newProductService.addToNewProducts(productIds, req.user.sub);
      res.status(200).json({ success: true, count: doc.products.length, data: doc });
    } catch (err) {
      next(err);
    }
  }

  /**
   * DELETE /new-products
   * Removes specific product IDs from the list.
   * Body: { productIds: string[] }
   * Admin only.
   */
  async remove(req, res, next) {
    try {
      const { productIds } = req.body;
      const doc = await newProductService.removeFromNewProducts(productIds, req.user.sub);
      res.status(200).json({ success: true, count: doc.products?.length ?? 0, data: doc });
    } catch (err) {
      next(err);
    }
  }
}

export default new NewProductController();
