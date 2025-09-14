import { Bill, IBill } from "../models/billModel";
import { Request, Response } from "express";

// Get all bills for a user
export const getBill = async (req: Request, res: Response) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ message: "Missing userId" });

    const bills = await Bill.find({ userId }).sort({ createdAt: -1 });
    return res.json({ success: true, bills });
  } catch (error) {
    console.error("Error fetching bills:", error);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

// Delete a bill
export const deleteBill = async (req: Request, res: Response) => {
  try {
    const { billId } = req.params;
    if (!billId) return res.status(400).json({ message: "Missing billId" });

    await Bill.findByIdAndDelete(billId);
    return res.json({ success: true, message: "Bill deleted successfully" });
  } catch (error) {
    console.error("Error deleting bill:", error);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

// Upload a new bill
export const uploadBill = async (req: Request, res: Response) => {
  try {
    const {
      userId,
      title,
      amount,
      category,
      expiryDate,
      description,
      storeName,
    } = req.body;
    const file = req.file;

    if (!userId || !title || !amount || !category || !expiryDate || !file) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // File path to save in DB
    const imageUrl = `/uploads/${file.filename}`;

    const bill: IBill = new Bill({
      userId,
      title,
      amount: Number(amount),
      category,
      expiryDate,
      description: description || "",
      storeName: storeName || "",
      imageUrl,
    });

    await bill.save();
    return res.status(201).json({ success: true, bill });
  } catch (error) {
    console.error("Error in uploadBill:", error);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};
