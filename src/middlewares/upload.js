import multer from 'multer';
import ApiError from '../utils/ApiError.js';

// Use memory storage — files are held as Buffers and streamed directly to Cloudinary
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'video/mp4',
    'video/webm',
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ApiError(415, `Unsupported file type: ${file.mimetype}. Allowed: jpeg, png, webp, gif, mp4, webm`), false);
  }
};

// 10 MB limit per file
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});

export default upload;
