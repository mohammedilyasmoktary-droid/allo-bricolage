import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

// Ensure upload directory exists
const uploadDir = process.env.UPLOAD_DIR || './uploads';
const uploadPath = path.join(__dirname, '..', '..', uploadDir);

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// Configure multer storage
// TODO: Replace with S3 storage adapter when ready
// Example: const storage = new S3Storage({ bucket: 'allo-bricolage' })
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Create subdirectories for different file types
    let subDir = 'photos';
    if (file.fieldname === 'documents') {
      subDir = 'documents';
    } else if (file.fieldname === 'profilePicture') {
      subDir = 'profile-pictures';
    } else if (file.fieldname === 'nationalIdCard') {
      subDir = 'documents';
    }
    const dir = path.join(uploadPath, subDir);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `${uuidv4()}${ext}`;
    cb(null, filename);
  },
});

// File filter
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images and PDFs are allowed.'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880'), // 5MB default
  },
});

// Helper to get file URL
// TODO: Replace with S3 URL when using S3
export const getFileUrl = (filename: string, type: 'photos' | 'documents' | 'profile-pictures' = 'photos'): string => {
  // In production with S3, this would return: `https://bucket.s3.region.amazonaws.com/${filename}`
  const port = process.env.PORT || 5001;
  const baseUrl = process.env.BACKEND_URL || `http://localhost:${port}`;
  return `${baseUrl}/uploads/${type}/${filename}`;
};

// Helper to delete file
// TODO: Replace with S3 delete when using S3
export const deleteFile = (fileUrl: string): void => {
  try {
    const url = new URL(fileUrl);
    const filePath = url.pathname.replace('/uploads/', '');
    const fullPath = path.join(uploadPath, filePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  } catch (error) {
    console.error('Error deleting file:', error);
  }
};

