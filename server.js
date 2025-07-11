import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

import { initializeDb } from "./database/db.js";

import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/productRout.js";
import bookRoutes from "./routes/book.js";
import adminRoutes from "./routes/admin.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());

const allowedOrigins = [
  "http://localhost:5173",
  "https://novastores.netlify.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('CORS siyasəti tərəfindən icazə verilməyən domen!'));
      }
    },
    credentials: true,
  })
);

const UPLOADS_BASE_DIR = path.join(__dirname, "../public/uploads");
const PRODUCT_IMAGES_DIR = path.join(UPLOADS_BASE_DIR, "products");

[PRODUCT_IMAGES_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`✔️ Yükləmə qovluğu yaradıldı: ${dir}`);
  }
});

app.use("/uploads", express.static(path.join(__dirname, "../public/uploads")));

app.use("/api/auth", authRoutes);
app.use("/api", productRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/admin", adminRoutes);

app.get("/api/ping", (req, res) => {
  res.json({ message: "Server işə düşdü!" });
});

/*
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '..', 'client', 'build')));
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '..', 'client', 'build', 'index.html'));
    });
}
*/

const startServer = async () => {
  try {
    await initializeDb();
    app.listen(PORT, () => {
      console.log(`🚀 Server http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Server başlanarkən kritik xəta:", error);
    process.exit(1);
  }
};

startServer();
