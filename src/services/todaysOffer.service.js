import TodaysOffer from '../models/todaysOffer.model.js';
import Product from '../models/product.model.js';
import ApiError from '../utils/ApiError.js';

/**
 * GET /todays-offer
 * Returns the single document with fully populated product data.
 */
const getTodaysOffer = async () => {
  const doc = await TodaysOffer.findOne()
    .populate('products')
    .populate('updatedBy', 'name email');
  return doc || { products: [] };
};

/**
 * POST /todays-offer
 * Replaces the entire list with the given productIds (max 4).
 */
const setTodaysOffer = async (productIds, adminId) => {
  if (!Array.isArray(productIds)) {
    throw new ApiError(400, 'productIds must be an array');
  }
  if (productIds.length > 4) {
    throw new ApiError(400, 'Maximum 4 products allowed.');
  }

  const found = await Product.find({ _id: { $in: productIds } }).select('_id');
  if (found.length !== productIds.length) {
    throw new ApiError(404, 'One or more product IDs are invalid or do not exist');
  }

  const doc = await TodaysOffer.findOneAndUpdate(
    {},
    { products: productIds, updatedBy: adminId },
    { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true }
  ).populate('products').populate('updatedBy', 'name email');

  return doc;
};

/**
 * PUT /todays-offer
 * Adds one or more product IDs to the list (total max 4, deduped).
 */
const addToTodaysOffer = async (productIds, adminId) => {
  if (!Array.isArray(productIds) || productIds.length === 0) {
    throw new ApiError(400, 'productIds must be a non-empty array');
  }

  const existing = await TodaysOffer.findOne();
  const currentIds = existing ? existing.products.map((id) => id.toString()) : [];
  const incoming = productIds.map(String);
  const newIds = incoming.filter((id) => !currentIds.includes(id));
  const merged = [...currentIds, ...newIds];

  if (merged.length > 4) {
    throw new ApiError(400, `Adding these products would exceed the limit of 4. Currently ${currentIds.length} product(s) in the list.`);
  }

  if (newIds.length > 0) {
    const found = await Product.find({ _id: { $in: newIds } }).select('_id');
    if (found.length !== newIds.length) {
      throw new ApiError(404, 'One or more product IDs are invalid or do not exist');
    }
  }

  const doc = await TodaysOffer.findOneAndUpdate(
    {},
    { products: merged, updatedBy: adminId },
    { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true }
  ).populate('products').populate('updatedBy', 'name email');

  return doc;
};

/**
 * DELETE /todays-offer
 * Removes specific product IDs from the list.
 * Body: { productIds: string[] }
 */
const removeFromTodaysOffer = async (productIds, adminId) => {
  if (!Array.isArray(productIds) || productIds.length === 0) {
    throw new ApiError(400, 'productIds must be a non-empty array');
  }

  const existing = await TodaysOffer.findOne();
  if (!existing) return { products: [] };

  const toRemove = productIds.map(String);
  const remaining = existing.products
    .map((id) => id.toString())
    .filter((id) => !toRemove.includes(id));

  const doc = await TodaysOffer.findOneAndUpdate(
    {},
    { products: remaining, updatedBy: adminId },
    { new: true, runValidators: true }
  ).populate('products').populate('updatedBy', 'name email');

  return doc;
};

export default { getTodaysOffer, setTodaysOffer, addToTodaysOffer, removeFromTodaysOffer };
