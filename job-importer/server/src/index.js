import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import config from "./config/index.js";
import importRoutes from "./routes/import.routes.js";
import logger from "./utils/logger.js";
import cron from 'node-cron'
import { importFromUrl } from './controllers/import.controller.js'
const app = express();
app.use(cors());
app.use(express.json());

app.use("/api", importRoutes);

async function main() {
  await mongoose.connect(config.mongoUri);

  cron.schedule('0 * * * *', async () => {
    importFromUrl()
    console.log('Running a task every minute:', new Date().toLocaleString());
  });


  app.listen(config.port,);
}

main().catch(err => {
  logger.error(err);
  process.exit(1);
});
