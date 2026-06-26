import express, { Request, Response } from "express";
import mongoose from "mongoose";

const router = express.Router();

router.get("/", async (req: Request, res: Response) => {
  try {
    await mongoose.connection.db?.admin().ping();

    res.status(200).json({
      success: true,
      backend: "awake",
      mongodb: "reachable",
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Health Check Failed:", err);

    res.status(500).json({
      success: false,
      backend: "awake",
      mongodb: "not reachable",
    });
  }
});

export default router;
