import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { PrismaClient } from "@prisma/client";
import Redis from "ioredis";
import routes from "./src/backend/routes";
import { initWorkers } from "./src/backend/services/queueService";

// Initialize core services
export const prisma = new PrismaClient();

const sanitizeRedisUrl = (url: string) => {
  if (!url) return "redis://localhost:6379";
  return url.replace(/.*(rediss?:\/\/)/, '$1').trim();
};

export const redis = new Redis(sanitizeRedisUrl(process.env.REDIS_URL!), {
  maxRetriesPerRequest: null,
  tls: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined,
  retryStrategy(times) {
    return Math.min(times * 50, 2000);
  },
  reconnectOnError(err) {
    const targetError = "READONLY";
    if (err.message.includes(targetError)) {
      return true;
    }
    return false;
  },
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Initialize Background Workers
  initWorkers();

  // Security & Logging Middleware
  app.use(helmet({
    contentSecurityPolicy: false,
  }));
  app.use(cors());
  app.use(morgan("dev"));
  app.use(express.json());

  // --- API ROUTES ---
  app.use("/api", routes);

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // --- VITE MIDDLEWARE ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.resolve(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Pepfuels Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
