import { v2 as cloudinary } from 'cloudinary';
import config from '../config.js';
import ApiError from '../utils/ApiError.js';

// Configure Cloudinary once at import time using validated config values
cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
});

/**
 * Upload a file buffer to Cloudinary.
 * @param {Buffer} buffer   - The file buffer from multer memory storage
 * @param {string} mimetype - The MIME type of the file (e.g. 'image/jpeg')
 * @param {string} folder   - The Cloudinary folder to upload into (default: 'ecommerce')
 * @returns {Promise<{ url: string, publicId: string }>}
 */
const uploadMedia = (buffer, mimetype, folder = 'ecommerce') => {
  return new Promise((resolve, reject) => {
    const resourceType = mimetype.startsWith('video/') ? 'video' : 'image';

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
      },
      (error, result) => {
        if (error) {
          return reject(new ApiError(500, `Cloudinary upload failed: ${error.message}`));
        }
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );

    uploadStream.end(buffer);
  });
};

/**
 * Delete a file from Cloudinary by its public_id.
 * @param {string} publicId     - The Cloudinary public_id of the asset
 * @param {string} resourceType - 'image' | 'video' (default: 'image')
 * @returns {Promise<void>}
 */
const deleteMedia = async (publicId, resourceType = 'image') => {
  const result = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  if (result.result !== 'ok') {
    throw new ApiError(404, `Media not found or already deleted (public_id: ${publicId})`);
  }
};

export default { uploadMedia, deleteMedia };
