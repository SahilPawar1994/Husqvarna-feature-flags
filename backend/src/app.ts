import express from "express";
import cors from "cors";
import helmet from "helmet";
import { errorHandler } from "./middleware/error.middleware";
import mockWebhookRoutes from "./webhook/mockReceiver";
import auditLogRoutes from "./routes/auditLog.routes";

import featureFlagRoutes from "./routes/featureFlag.routes";

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: "http://localhost:5173",
  }),
);

app.use(express.json({ limit: "10kb" }));

app.use(errorHandler);

app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Feature Flag API is running",
  });
});

app.use("/api/flags", featureFlagRoutes);

app.use("/api/webhook", mockWebhookRoutes);

app.use("/api/audit-logs", auditLogRoutes);

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

export default app;
