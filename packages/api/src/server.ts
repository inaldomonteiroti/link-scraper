import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import authRoutes from "./routes/auth";
import pageRoutes from "./routes/pages";
const { PrismaClient } = require("@prisma/client");

dotenv.config();

const prisma = new PrismaClient();

const app: express.Express = express();
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || "localhost";
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:3000";
const NODE_ENV = process.env.NODE_ENV || "development";

app.use(
  cors({
    origin: CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.json());
app.use(morgan(NODE_ENV === "development" ? "dev" : "combined"));

app.use("/api/auth", authRoutes);
app.use("/api/pages", pageRoutes);

app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    environment: NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

interface ErrorWithStatus extends Error {
  status?: number;
}

app.use(
  (err: ErrorWithStatus, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
      message: "An unexpected error occurred",
      error: NODE_ENV === "development" ? err.message : undefined,
    });
  }
);

async function startServer(): Promise<void> {
  try {
    await prisma.$connect();
    console.log("Connected to database");

    app.listen(PORT, () => {
      console.log(`Server running in ${NODE_ENV} mode`);
      console.log(`API available at http://${HOST}:${PORT}`);
      console.log(`CORS configured for origin: ${CORS_ORIGIN}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  console.log("Disconnected from database");
  process.exit(0);
});

export default app;
