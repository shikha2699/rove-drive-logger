import express from "express";
import cors from "cors";
import { config } from "./config";
import { tripRoutes } from "./routes/trip.routes";
import { waitForDatabase } from "./utils/database";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/trips", tripRoutes);

async function start() {
  await waitForDatabase();

  app.listen(config.port, "0.0.0.0", () => {
    console.log(`API listening on port ${config.port}`);
  });
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
