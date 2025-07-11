// server/middleware/upload.js
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// Helper to get __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define the directory where product images will be stored
// BU SƏTRİ YUXARI KÖÇÜRDÜK!
const PRODUCT_IMAGES_DIR = path.join(__dirname, '../../public/uploads/products');

// Ensure the directory exists
// This check is also done in server/index.js, but it's good to have it here too
if (!fs.existsSync(PRODUCT_IMAGES_DIR)) {
  fs.mkdirSync(PRODUCT_IMAGES_DIR, { recursive: true });
  console.log(`✔️ Multer upload directory created: ${PRODUCT_IMAGES_DIR}`);
}

// Set up storage for Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, PRODUCT_IMAGES_DIR); // Store files in the products subdirectory
  },
  filename: (req, file, cb) => {
    // Generate a unique filename using the current timestamp and original extension
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

// Filter to allow only image files
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

// Initialize Multer upload middleware
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB file size limit
  },
});

export default upload;
