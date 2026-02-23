import express from "express";
import { createServer as createViteServer } from "vite";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { PrismaClient } from "@prisma/client";
import Redis from "ioredis";
import routes from "./src/backend/routes";
import { initWorkers } from "./src/backend/services/queueService";

// ✅ Fix for __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize core services
export const prisma = new PrismaClient();

export const redis = new Redis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: null,
  tls: {}, // Required for Upstash (rediss://)
});

async function startServer() {
  const app = express();

  // ✅ Dynamic port for Render
  const PORT = process.env.PORT || 10000;

  // Initialize Background Workers
  try {
    initWorkers();
  } catch (err) {
    console.log("Workers disabled:", err);
  }

  // Security & Logging Middleware
  app.use(
    helmet({
      contentSecurityPolicy: false,
    })
  );

  app.use(cors());
  app.use(morgan("dev"));
  app.use(express.json());

  // --- API ROUTES ---
  app.use("/api", routes);

  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
    });
  });

  // --- VITE / STATIC HANDLING ---
// --- STATIC SERVE FOR PRODUCTION ---
if (process.env.NODE_ENV === "production") {
  const distPath = path.join(process.cwd(), "dist");

  console.log("Serving static from:", distPath);

  app.use(express.static(distPath));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}

  app.listen(Number(PORT), "0.0.0.0", () => {
    console.log(`🚀 Pepfuels running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("❌ Failed to start server:", err);
  process.exit(1);
});
