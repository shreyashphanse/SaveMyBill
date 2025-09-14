import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db";
import billRoutes from "./routes/bills";
import categoryRouter from "./routes/category";
import path from "path";

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

// ✅ Health check route
app.get("/", (req: Request, res: Response) => {
  res.json({ success: true, message: "SaveMyBill backend running 🚀" });
});

// ✅ Serve uploaded images statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

export default app;
