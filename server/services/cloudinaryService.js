import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure Cloudinary only if credentials are not placeholder values
const isConfigured = 
  process.env.CLOUDINARY_CLOUD_NAME && 
  process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name' &&
  process.env.CLOUDINARY_API_KEY && 
  process.env.CLOUDINARY_API_KEY !== 'your_api_key' &&
  process.env.CLOUDINARY_API_SECRET && 
  process.env.CLOUDINARY_API_SECRET !== 'your_api_secret';

if (isConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

/**
 * Uploads a file buffer or base64 to Cloudinary with fallback to local storage
 * @param {string} fileStr base64 encoded string or file path
 * @param {string} resourceType 'image', 'video', or 'raw'
 * @returns {Promise<string>} secure url
 */
export const uploadToCloudinary = async (fileStr, resourceType = 'auto') => {
  if (!isConfigured) {
    console.log('Cloudinary not configured. Fallback: Save file to physical local storage folder.');
    
    try {
      // Decode base64 Data URI
      const matches = fileStr.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        const mimeType = matches[1];
        const base64Data = matches[2];
        const buffer = Buffer.from(base64Data, 'base64');
        
        let extension = '.bin';
        if (mimeType.includes('image/png')) extension = '.png';
        else if (mimeType.includes('image/jpeg') || mimeType.includes('image/jpg')) extension = '.jpg';
        else if (mimeType.includes('image/gif')) extension = '.gif';
        else if (mimeType.includes('video/mp4')) extension = '.mp4';
        else if (mimeType.includes('audio/webm')) extension = '.webm';
        else if (mimeType.includes('audio/mpeg') || mimeType.includes('audio/mp3')) extension = '.mp3';
        else if (mimeType.includes('application/pdf')) extension = '.pdf';
        else {
          const subtype = mimeType.split('/')[1];
          if (subtype) extension = `.${subtype}`;
        }
        
        const uploadsDir = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }

        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const safeFileName = `upload-${uniqueSuffix}${extension}`;
        const filePath = path.join(uploadsDir, safeFileName);

        await fs.promises.writeFile(filePath, buffer);

        return `/uploads/${safeFileName}`;
      } else {
        throw new Error('Invalid base64 string format');
      }
    } catch (err) {
      console.error('Local Fallback Write Error:', err);
      throw new Error('Local fallback upload failed: ' + err.message);
    }
  }

  try {
    const uploadResponse = await cloudinary.uploader.upload(fileStr, {
      resource_type: resourceType,
      folder: 'pigeon_chat',
    });
    return uploadResponse.secure_url;
  } catch (error) {
    console.error('Cloudinary Upload Error:', error);
    console.log('Cloudinary failed. Falling back to local storage.');
    try {
      const matches = fileStr.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        const mimeType = matches[1];
        const base64Data = matches[2];
        const buffer = Buffer.from(base64Data, 'base64');
        
        let extension = '.bin';
        if (mimeType.includes('image/png')) extension = '.png';
        else if (mimeType.includes('image/jpeg') || mimeType.includes('image/jpg')) extension = '.jpg';
        else if (mimeType.includes('image/gif')) extension = '.gif';
        else if (mimeType.includes('video/mp4')) extension = '.mp4';
        else if (mimeType.includes('audio/webm')) extension = '.webm';
        else if (mimeType.includes('audio/mpeg') || mimeType.includes('audio/mp3')) extension = '.mp3';
        else if (mimeType.includes('application/pdf')) extension = '.pdf';
        else {
          const subtype = mimeType.split('/')[1];
          if (subtype) extension = `.${subtype}`;
        }
        
        const uploadsDir = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }

        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const safeFileName = `upload-${uniqueSuffix}${extension}`;
        const filePath = path.join(uploadsDir, safeFileName);

        await fs.promises.writeFile(filePath, buffer);

        return `/uploads/${safeFileName}`;
      }
    } catch (fallbackErr) {
      console.error('Local fallback write failed:', fallbackErr);
    }
    throw new Error('Cloudinary upload failed: ' + error.message);
  }
};
