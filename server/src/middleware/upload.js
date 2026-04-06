import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder:          'insutech/logos',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'svg'],
    transformation:  [{ width: 300, height: 300, crop: 'limit' }],
  },
});

export const logoUpload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (/^image\/(jpeg|png|webp|svg\+xml)$/.test(file.mimetype)) cb(null, true);
    else cb(new Error('Only JPEG, PNG, WebP, or SVG images are allowed'));
  },
});
