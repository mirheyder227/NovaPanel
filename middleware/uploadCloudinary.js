
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

if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.warn('Cloudinary etimadnamələri tam qurulmayıb. Şəkil yükləmələri/silinmələri uğursuz ola bilər.');
}

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'novastores_products',
        format: async (req, file) => 'webp',
        public_id: (req, file) => `product-${Date.now()}-${file.originalname.split('.')[0].replace(/[^a-zA-Z0-9-_]/g, '')}`,
        resource_type: 'auto'
    },
});

export const uploadProduct = multer({ storage: storage });

export const deleteImageFromCloudinary = async (imageUrl) => {
    if (!imageUrl) {
        console.warn('Boş imageUrl ilə Cloudinary-dən şəkil silməyə cəhd edildi.');
        return;
    }

    const parts = imageUrl.split('/');
    const publicIdWithExtension = parts[parts.length - 1];
    const publicIdWithoutExtension = publicIdWithExtension.split('.')[0]; 
    const folder = 'novastores_products'; 

    const fullPublicId = `${folder}/${publicIdWithoutExtension}`;

    try {
        const result = await cloudinary.uploader.destroy(fullPublicId);
        if (result.result === 'ok') {
            console.log(`Cloudinary-dən uğurla silindi: ${fullPublicId}`);
        } else {
            console.warn(`Cloudinary-dən şəkil silinərkən xəta (nəticə: ${result.result}): ${fullPublicId}`);
        }
    } catch (error) {
        console.error(`Cloudinary-dən şəkil silinərkən xəta: ${fullPublicId}`, error);
    }
};
