import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { uploadBill, getBill, deleteBill } from "../controllers/billController";

const router = express.Router();

const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer disk storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// Upload bill
router.post("/upload", upload.single("file"), uploadBill);

// Fetch bills for a user
router.get("/", getBill);

// Delete a bill
router.delete("/:billId", deleteBill);

export default router;
