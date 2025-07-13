// server/middleware/uploadCloudinary.js
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'novastores_products',
        format: async (req, file) => 'webp',
        public_id: (req, file) => `product-${Date.now()}-${file.originalname.split('.')[0].replace(/[^a-zA-Z0-9-]/g, '')}`,
        resource_type: 'auto'
    },
});

export const uploadProduct = multer({ storage: storage });

export const deleteImageFromCloudinary = async (imageUrl) => {
  if (!imageUrl) return;

  // Extract public ID from Cloudinary URL
  // Example URL: https://res.cloudinary.com/your_cloud_name/image/upload/v1234567890/novastores_products/product-1234567890-imagename.webp
  // publicId will be 'product-1234567890-imagename'
  const parts = imageUrl.split('/');
  const publicIdWithExtension = parts[parts.length - 1]; // e.g., 'product-1234567890-imagename.webp'
  const publicId = publicIdWithExtension.split('.')[0]; // e.g., 'product-1234567890-imagename'

  const folder = 'novastores_products'; 

  try {
     await cloudinary.uploader.destroy(`${folder}/${publicId}`);
    console.log(`Cloudinary-dən uğurla silindi: ${folder}/${publicId}`);
  } catch (error) {
    console.error(`Cloudinary-dən şəkil silinərkən xəta: ${folder}/${publicId}`, error);
  }
};
