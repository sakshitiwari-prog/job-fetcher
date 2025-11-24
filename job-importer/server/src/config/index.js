import dotenv from "dotenv";
dotenv.config();

export default {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/job_importer',
  redis: {
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: Number(process.env.REDIS_PORT || 6379),
    password: process.env.REDIS_PASSWORD || undefined
  },
  queueName: process.env.JOB_QUEUE_NAME || "job-import-queue",
  concurrency: Number(process.env.CONCURRENCY || 5),
  batchSize: Number(process.env.BATCH_SIZE || 50),
  cronSchedule: process.env.CRON_SCHEDULE || "0 * * * *"
};
