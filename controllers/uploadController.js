import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { getDb } from '../database/db.js';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOADS_BASE_DIR = path.join(__dirname, '../../public/uploads');
const PRODUCT_IMAGES_DIR = path.join(UPLOADS_BASE_DIR, 'products');

const createStorage = (destinationDir) => multer.diskStorage({
    destination: (req, file, cb) => {
        if (!fs.existsSync(destinationDir)) {
            fs.mkdirSync(destinationDir, { recursive: true });
        }
        cb(null, destinationDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    },
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Yalnız şəkil faylları (JPEG, PNG, GIF və s.) yükləyə bilərsiniz!'), false);
    }
};

export const uploadProduct = multer({
    storage: createStorage(PRODUCT_IMAGES_DIR),
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }
});