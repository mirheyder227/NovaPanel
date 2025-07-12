import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';

// .env faylındakı dəyişənləri yükləyin
dotenv.config();

// Cloudinary-i API credentials ilə konfiqurasiya edin
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

 const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'novastores_products', // Cloudinary-də şəkillərin saxlanacağı qovluq adı
        format: async (req, file) => 'webp', // Şəkil formatı (jpeg, png, webp kimi)
        public_id: (req, file) => `product-${Date.now()}-${file.originalname.split('.')[0]}`, // Unikal fayl adı yaradın
        resource_type: 'auto' // Fayl tipini avtomatik təyin etsin (image, video, raw)
    },
});

// Multer instance-ı yaradın
const upload = multer({ storage: storage });

export default upload;
