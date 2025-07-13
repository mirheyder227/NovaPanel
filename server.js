// server/index.js
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

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

app.use(express.json());

const allowedOrigins = [
  "http://localhost:5173",
  "https://novastores.netlify.app", // Netlify deploy URL-niz
  "https://novastores.onrender.com", // Render deploy URL-niz (əgər React-i Render-də deploy etmisinizsə)
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('CORS siyasəti tərəfindən icazə verilməyən domen! ' + origin));
      }
    },
    credentials: true,
  })
);

// Əgər frontend build-i eyni serverdə serve edilirsə, bu hissəni aktiv edin
/*
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '..', 'client', 'build')));
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '..', 'client', 'build', 'index.html'));
    });
}
*/

// API Marşrutları
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/books", bookRoutes); // Kitab rotasını əlavə edin
app.use("/api/admin", adminRoutes);

const startServer = async () => {
  try {
    await initializeDb();
    app.listen(PORT, () => {
      console.log(`🚀 Server ${process.env.NODE_ENV === 'production' ? 'işləyir' : `http://localhost:${PORT}`}`);
    });
  } catch (error) {
    console.error("❌ Server başlanarkən kritik xəta:", error);
    process.exit(1);
  }
};

startServer();
 