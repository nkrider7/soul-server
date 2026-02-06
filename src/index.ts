import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import logger from "./utils/logger";
import { PrismaClient } from "@prisma/client";
import authRoutes from "./routes/auth.route";
import profileRoutes from "./routes/profile.route";
import challengeRoutes from "./routes/challenge.route";
import questRoutes from "./routes/quest.route";
import characterRoutes from "./routes/character.route";

dotenv.config();

const app: Application = express();
const prisma = new PrismaClient();

const PORT = process.env.PORT || 4000;

// ---------- Middleware ----------
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  logger.info(`${req.method} ${req.path}`);
  next();
});

// ---------- Routes ----------
app.use("/auth", authRoutes);
app.use("/profile", profileRoutes);
app.use("/challenge", challengeRoutes);
app.use("/quest", questRoutes);
app.use("/character", characterRoutes);

// ---------- Health Check ----------
app.get("/health", async (req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`; // simple DB ping
    res.status(200).send({ status: "ok", database: "connected" });
  } catch (err) {
    res.status(500).send({ status: "error", database: "disconnected" });
  }
});

// ---------- Error Handler ----------
app.use((err: any, req: Request, res: Response, next: NextFunction): void => {
  logger.error(err.message || "Internal server error");
  
  // Handle ErrorHandler instances
  if (err.statusCode) {
    res.status(err.statusCode).json({
      success: false,
      error: err.message || "An error occurred",
    });
    return;
  }

  // Handle Zod validation errors
  if (err.name === "ZodError") {
    res.status(400).json({
      success: false,
      error: "Validation error",
      details: err.errors,
    });
    return;
  }

  // Default error response
  res.status(500).json({
    success: false,
    error: "Internal server error",
  });
});

// ---------- Start Server ----------
const start = async () => {
  try {
    await prisma.$connect();
    logger.info("🟢 Database connected");

    app.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
    });
  } catch (err: any) {
    console.error("❌ Failed to start server:", err);
    logger.error("❌ Failed to start server:", err);
    process.exit(1);
  }
};

start();

// ---------- Graceful Shutdown ----------
process.on("SIGINT", async () => {
  logger.info("🔻 Gracefully shutting down...");
  await prisma.$disconnect();
  process.exit(0);
});

export { prisma };
