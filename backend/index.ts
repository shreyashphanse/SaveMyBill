import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db";
import billRoutes from "./routes/bills";
import categoryRouter from "./routes/category";
import piechartRoutes from "./routes/piechart";
import path from "path";
import healthRoutes from "./routes/health";

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/bills", billRoutes);
app.use("/api/categories", categoryRouter);
app.use("/api/piechart", piechartRoutes);
app.use("/health", healthRoutes);

// ✅ Health check route
app.get("/", (req: Request, res: Response) => {
  res.json({ success: true, message: "SaveMyBill backend running 🚀" });
});

// ✅ Serve uploaded images statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on https://savemybill-backend.onrender.com`);
});

export default app;
