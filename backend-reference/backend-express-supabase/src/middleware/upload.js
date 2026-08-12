import multer from 'multer';
import { ApiError } from './errorHandler.js';

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024, files: 12 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new ApiError(415, 'Only image uploads are supported'));
    }
    cb(null, true);
  }
});
