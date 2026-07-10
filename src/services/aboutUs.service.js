import AboutUs from '../models/aboutUs.model.js';
import ApiError from '../utils/ApiError.js';

/**
 * GET /about-us
 * Returns the single about us document.
 * Public — no authentication required.
 */
const getAboutUs = async (lang) => {
  const doc = await AboutUs.findOne({language: lang});
  if (!doc) throw new ApiError(404, 'About Us information has not been set up yet.');
  return doc;
};

/**
 * POST /about-us
 * Creates the about us document (only one document is allowed).
 * Admin only.
 */
const createAboutUs = async (data) => {
  const existing = await AboutUs.findOne();
  if (existing) {
    throw new ApiError(409, 'About Us already exists. Use PUT to update it.');
  }
  const doc = await AboutUs.create(data);
  return doc;
};

/**
 * PUT /about-us
 * Partially or fully updates the about us document (upsert).
 * Admin only.
 */
const updateAboutUs = async (data) => {
  const doc = await AboutUs.findOneAndUpdate(
    {},
    { $set: data },
    { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true }
  );
  return doc;
};

/**
 * DELETE /about-us
 * Removes the entire about us document.
 * Admin only.
 */
const deleteAboutUs = async () => {
  const doc = await AboutUs.findOneAndDelete();
  if (!doc) throw new ApiError(404, 'About Us document not found.');
  return doc;
};

export default { getAboutUs, createAboutUs, updateAboutUs, deleteAboutUs };
