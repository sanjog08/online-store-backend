import Product from '../models/product.model.js';
import ApiError from '../utils/ApiError.js';

/**
 * Retrieve all products.
 * Optional query filters: category, brand
 */
const getAllProducts = async (filters = {}) => {
  const query = {};
  if (filters.category) query.category = filters.category;
  if (filters.brand) query.brand = filters.brand;
  return Product.find(query).sort({ createdAt: -1 });
};

/**
 * Retrieve a single product by its MongoDB ObjectId.
 * Throws 404 if no product is found.
 */
const getProductById = async (id) => {
  const product = await Product.findById(id);
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }
  return product;
};

/**
 * Create a new product.
 * Throws 409 if a product with the same name already exists.
 */
const createProduct = async (productData) => {
  const { name, description, images, quantity, category, brand, price, discount, warranty } = productData;

  const existing = await Product.findOne({ name });
  if (existing) {
    throw new ApiError(409, 'A product with this name already exists');
  }

  const product = await Product.create({
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

  return product;
};

/**
 * Update an existing product by id.
 * Throws 404 if no product is found.
 * Throws 409 if the new name is already taken by another product.
 */
const updateProduct = async (id, updateData) => {
  if (updateData.name) {
    const existing = await Product.findOne({ name: updateData.name, _id: { $ne: id } });
    if (existing) {
      throw new ApiError(409, 'A product with this name already exists');
    }
  }

  const product = await Product.findByIdAndUpdate(id, updateData, {
    new: true,           // Return the updated document
    runValidators: true, // Enforce schema validation on update
  });

  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  return product;
};

/**
 * Delete a product by id.
 * Throws 404 if no product is found.
 */
const deleteProduct = async (id) => {
  const product = await Product.findByIdAndDelete(id);
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }
  return product;
};

export default { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct };
