import express from 'express';
import multer from 'multer';
import { uploadToCloudinary } from '../services/cloudinaryService.js';
import { protect } from '../middleware/authMiddleware.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Using memory storage for buffer upload
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB Max
});

router.use(protect);

router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const isCloudinaryConfigured = 
      process.env.CLOUDINARY_CLOUD_NAME && 
      process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name' &&
      process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name_here' &&
      process.env.CLOUDINARY_API_KEY && 
      process.env.CLOUDINARY_API_KEY !== 'your_api_key' &&
      process.env.CLOUDINARY_API_KEY !== 'your_api_key_here' &&
      process.env.CLOUDINARY_API_SECRET && 
      process.env.CLOUDINARY_API_SECRET !== 'your_api_secret' &&
      process.env.CLOUDINARY_API_SECRET !== 'your_api_secret_here';

    let secureUrl = '';
    let publicId = 'local';
    
    let type = 'file';
    if (req.file.mimetype.startsWith('image/')) type = 'image';
    else if (req.file.mimetype.startsWith('video/')) type = 'video';
    else if (req.file.mimetype.startsWith('audio/')) type = 'audio';

    if (isCloudinaryConfigured) {
      // Convert buffer to base64 Data URI
      const fileBase64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
      
      let resourceType = 'auto';
      if (type === 'image') resourceType = 'image';
      else if (type === 'video') resourceType = 'video';
      else resourceType = 'raw';

      secureUrl = await uploadToCloudinary(fileBase64, resourceType);
      publicId = 'cloudinary';
    } else {
      // Local development fallback: Save file to physical local storage folder
      const uploadsDir = path.join(__dirname, '../uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const extension = path.extname(req.file.originalname) || '';
      // Clean up base file name to avoid weird URL characters
      const baseName = path.basename(req.file.originalname, extension).replace(/[^a-zA-Z0-9]/g, '_');
      const safeFileName = `${baseName}-${uniqueSuffix}${extension}`;
      const filePath = path.join(uploadsDir, safeFileName);

      await fs.promises.writeFile(filePath, req.file.buffer);

      secureUrl = `${req.protocol}://${req.get('host')}/uploads/${safeFileName}`;
    }

    res.json({
      url: secureUrl,
      public_id: publicId,
      name: req.file.originalname,
      size: req.file.size,
      mimeType: req.file.mimetype,
      type: type,
    });
  } catch (error) {
    console.error('File Upload Pipeline Error:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
