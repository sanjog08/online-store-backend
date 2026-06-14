import cloudinaryService from '../services/cloudinary.service.js';
import ApiError from '../utils/ApiError.js';

class MediaController {
  /**
   * POST /media/upload
   * Uploads one or more files to Cloudinary.
   * Form-data field: 'files' (supports multiple)
   * Optional body field: folder (string) — Cloudinary folder name, defaults to 'ecommerce'
   */
  async upload(req, res, next) {
    try {
      if (!req.files || req.files.length === 0) {
        throw new ApiError(400, 'No files provided. Send files under the "files" field');
      }

      const folder = req.body.folder || 'ecommerce';

      const uploads = await Promise.all(
        req.files.map((file) => cloudinaryService.uploadMedia(file.buffer, file.mimetype, folder))
      );

      res.status(201).json({
        success: true,
        count: uploads.length,
        data: uploads, // Array of { url, publicId }
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * DELETE /media
   * Deletes a file from Cloudinary by its public_id.
   * Body: { publicId: string, resourceType?: 'image' | 'video' }
   */
  async delete(req, res, next) {
    try {
      const { publicId, resourceType } = req.body;

      if (!publicId) {
        throw new ApiError(400, '"publicId" is required');
      }

      await cloudinaryService.deleteMedia(publicId, resourceType);

      res.status(200).json({ success: true, message: 'Media deleted successfully' });
    } catch (err) {
      next(err);
    }
  }
}

export default new MediaController();
