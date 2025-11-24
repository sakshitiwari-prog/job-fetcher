import express from "express";
import JobModel from "../model/Job.model.js";
import ImportLog from "../model/ImportLog.model.js";
import { importFromUrl,  } from "../controllers/import.controller.js";
const router = express.Router();

router.get("/logs", async (req, res) => {
    const logs = await ImportLog.find().sort({ createdAt: -1 });
    res.json(logs);
  });
  
  router.get("/logs/:id", async (req, res) => {
    const log = await ImportLog.findById(req.params.id);
    res.json(log);
  });
  
  router.get("/jobs", async (req, res) => {
    const jobs = await JobModel.find().sort({ createdAt: -1 });
    res.json(jobs);
  });
  
  router.post("/import/manual", async (req, res) => {
    importFromUrl();
    res.json({ message: "Manual import started" });
  });
export default router;
