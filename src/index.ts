import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import logger from "./utils/logger";
import { PrismaClient } from "@prisma/client";
import authRoutes from "./routes/auth.route";
import profileRoutes from "./routes/profile.route";
import challengeRoutes from "./routes/challenge.route";
import questRoutes from "./routes/quest.route";

dotenv.config();

const app: Application = express();
const prisma = new PrismaClient();

const PORT = process.env.PORT || 4000;

// ---------- Middleware ----------
app.use(cors());
app.use(express.json());

// ---------- Routes ----------
app.use("/auth", authRoutes);
app.use("/profile", profileRoutes);
app.use("/challenge", challengeRoutes);
app.use("/quest", questRoutes);

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
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error(err.message);
  res.status(500).json({ error: "Internal server error" });
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
    logger.error("❌ Failed to start server:", err.message);
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
