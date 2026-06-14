import productService from '../services/product.service.js';

class ProductController {
  /**
   * GET /products
   * Returns a list of all products.
   * Optional query params: ?category=&brand=
   */
  async getAll(req, res, next) {
    try {
      const { category, brand } = req.query;
      const products = await productService.getAllProducts({ category, brand });
      res.status(200).json({ success: true, count: products.length, data: products });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /products/:id
   * Returns a single product by id.
   */
  async getOne(req, res, next) {
    try {
      const product = await productService.getProductById(req.params.id);
      res.status(200).json({ success: true, data: product });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /products
   * Creates a new product (admin only).
   * Body: { name, description, images, quantity, category, brand, price, discount?, warranty? }
   */
  async create(req, res, next) {
    try {
      const { name, description, images, quantity, category, brand, price, discount, warranty } = req.body;
      const product = await productService.createProduct({
        name,
        description,
        images,
        quantity,
        category,
        brand,
        price,
        discount,
        warranty,
      });
      res.status(201).json({ success: true, data: product });
    } catch (err) {
      next(err);
    }
  }

  /**
   * PUT /products/:id
   * Updates an existing product (admin only).
   * Body: any subset of product fields — only provided fields are updated.
   */
  async update(req, res, next) {
    try {
      const allowedFields = ['name', 'description', 'images', 'quantity', 'category', 'brand', 'price', 'discount', 'warranty'];
      const updateData = {};
      for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
          updateData[field] = req.body[field];
        }
      }
      const product = await productService.updateProduct(req.params.id, updateData);
      res.status(200).json({ success: true, data: product });
    } catch (err) {
      next(err);
    }
  }

  /**
   * DELETE /products/:id
   * Deletes a product by id (admin only).
   */
  async delete(req, res, next) {
    try {
      await productService.deleteProduct(req.params.id);
      res.status(200).json({ success: true, message: 'Product deleted successfully' });
    } catch (err) {
      next(err);
    }
  }
}

export default new ProductController();
