// server/index.js
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs"; // fs modulunu import edin

import { initializeDb } from "./database/db.js";
import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/productRout.js"; // Düzgün məhsul rotası
import bookRoutes from "./routes/book.js"; // Kitab rotası
import adminRoutes from "./routes/admin.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(express.json()); // JSON formatında gələn body-ləri parse etmək üçün
app.use(express.urlencoded({ extended: true })); // URL-encoded body-ləri parse etmək üçün

// CORS konfiqurasiyası
const allowedOrigins = [
    "http://localhost:5173",
    "https://novastores.netlify.app", // Netlify deploy URL-niz
    // "https://novastores.onrender.com", // Render deploy URL-niz (əgər React-i Render-də deploy etmisinizsə)
];

app.use(
    cors({
        origin: function (origin, callback) {
            // Origin olmayan sorğulara icazə ver (məsələn, mobil tətbiqlər və ya curl)
            if (!origin) return callback(null, true);
            if (allowedOrigins.indexOf(origin) !== -1) {
                callback(null, true);
            } else {
                callback(new Error(`CORS siyasəti tərəfindən icazə verilməyən domen: ${origin}`));
            }
        },
        credentials: true, // Kuki və ya authorization başlığı göndərməyə icazə ver
    })
);

// Statik faylları təqdim et (əgər yerli yükləmələrdən istifadə edirsinizsə)
const UPLOADS_DIR = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    console.log(`✔️ Yükləmələr qovluğu yaradıldı: ${UPLOADS_DIR}`);
}
app.use('/uploads', express.static(UPLOADS_DIR)); // Yüklənmiş şəkilləri təqdim etmək üçün marşrut

// API Marşrutları
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/books", bookRoutes); 
app.use("/api/admin", adminRoutes);

// İstehsal mühitində frontend build-i təqdim etmək üçün (əgər eyni serverdə serve edilirsə)
/*
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '..', 'client', 'dist'))); // Vite üçün 'dist' qovluğu
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '..', 'client', 'dist', 'index.html'));
    });
}
*/

// DİQQƏT: Ümumi xəta idarəetmə middleware-i
// Bu, bütün tutulmamış xətaları tutacaq və ətraflı loglayacaq.
// Bütün digər app.use() və marşrut təyinatlarından SONRA yerləşdirilməlidir.
app.use((err, req, res, next) => {
    console.error('ÜMUMİ SERVER XƏTASI:', JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
    if (res.headersSent) {
        return next(err); // Əgər cavab artıq göndərilibsə, növbəti xəta idarəetməsinə keç
    }
    // Xətanın status kodunu istifadə edin, yoxdursa 500 (Internal Server Error) istifadə edin
    const statusCode = err.statusCode || err.status || 500; 
    res.status(statusCode).json({
        message: err.message || 'Daxili server xətası baş verdi.',
        // Xətanın detallarını cavabda da göstərin (yalnız inkişaf mühitində faydalıdır)
        error: process.env.NODE_ENV === 'development' ? JSON.stringify(err, Object.getOwnPropertyNames(err)) : {} 
    });
});


const startServer = async () => {
    try {
        await initializeDb(); // Verilənlər bazası bağlantısını və cədvəlləri başlat
        app.listen(PORT, () => {
            console.log(`🚀 Server ${process.env.NODE_ENV === 'production' ? 'işləyir' : `http://localhost:${PORT}`}`);
        });
    } catch (error) {
        console.error("❌ Server başlanarkən kritik xəta:", JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
        process.exit(1); // Verilənlər bazası başlatıla bilmirsə prosesi dayandır
    }
};

startServer();
