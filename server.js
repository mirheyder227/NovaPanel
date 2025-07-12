import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

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
