import { Worker } from "bullmq";
import mongoose from "mongoose";
import crypto from "crypto";
import config from "../config/index.js";
import JobModel from "../model/Job.model.js";
import ImportLog from "../model/ImportLog.model.js";

await mongoose.connect(config.mongoUri);
console.log("Worker MongoDB connected");

let newCount = 0;
let updatedCount = 0;
let skippedCount = 0;
let failedCount = 0;
let failures = [];

function generateContentHash(jobData) {
  const content = JSON.stringify({
    title: jobData.title,
    description: jobData.description,
    location: jobData.location,
    company: jobData.company,
    url: jobData.url,
    raw: jobData.raw,
  });

  return crypto.createHash('md5').update(content).digest('hex');
}

const redisConnection = {
  host: config.redis.host,
  port: config.redis.port,
  maxRetriesPerRequest: null,
};
const worker = new Worker(
  config.queueName,
  async (job) => {
    try {
      if (!job.data.guid) {
        throw new Error("GUID missing, cannot save job");
      }

      const incomingHash = generateContentHash(job.data);

      const existingJob = await JobModel.findOne({ guid: job.data.guid });

      if (existingJob) {
        const existingHash = existingJob.contentHash || generateContentHash(existingJob);

        if (existingHash !== incomingHash) {
          await JobModel.updateOne(
            { guid: job.data.guid },
            {
              $set: {
                title: job.data.title,
                description: job.data.description,
                location: job.data.location,
                company: job.data.company,
                url: job.data.url,
                raw: job.data.raw,
                source: job.data.source,
                contentHash: incomingHash,
                updatedAt: new Date()
              }
            }
          );
          updatedCount++;
        } else {
          skippedCount++;
        }
      } else {
        await JobModel.create({
          ...job.data,
          contentHash: incomingHash,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        newCount++;
      }

      return { success: true, guid: job.data.guid };
    } catch (err) {
      console.error(`Error processing job ${job.data?.guid}:`, err.message);
      throw err;
    }
  },
  {
    connection: redisConnection,
    concurrency: config.concurrency || 5
  }
);

worker.on("completed", (job) => {
  console.log(`Job ${job.id} completed successfully`);
});

worker.on("failed", (job, err) => {
  failedCount++;
  const guid = job?.data?.guid || job?.id || "unknown";
  console.error(`Job ${guid} failed:`, err.message);

  failures.push({
    guid: guid,
    job: job?.data?.title || "Unknown job",
    reason: err.message,
    timestamp: new Date()
  });
});

worker.on("drained", async () => {
  console.log("Queue drained, updating import log...");

  try {
    const lastLog = await ImportLog.findOne().sort({ createdAt: -1 });

    if (!lastLog) {
      console.warn("No import log found to update");
      return;
    }

    lastLog.newJobs = newCount;
    lastLog.updatedJobs = updatedCount;
    lastLog.skippedJobs = skippedCount;
    lastLog.failedJobs = failedCount;
    lastLog.failures = failures;
    lastLog.finishedAt = new Date();
    lastLog.totalProcessed = newCount + updatedCount + skippedCount + failedCount;

    await lastLog.save();

    newCount = 0;
    updatedCount = 0;
    skippedCount = 0;
    failedCount = 0;
    failures = [];
  } catch (err) {
    console.error("Error updating import log:", err.message);
  }
});

worker.on("error", (err) => {
  console.error("Worker error:", err);
});

process.on("SIGTERM", async () => {
  await worker.close();
  await mongoose.connection.close();
  process.exit(0);
});

process.on("SIGINT", async () => {
  await worker.close();
  await mongoose.connection.close();
  process.exit(0);
});

export default worker;