"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadBill = exports.deleteBill = exports.getBill = void 0;
const billModel_1 = require("../models/billModel");
// Get all bills for a user
const getBill = async (req, res) => {
    try {
        const { userId } = req.query;
        if (!userId)
            return res.status(400).json({ message: "Missing userId" });
        const bills = await billModel_1.Bill.find({ userId }).sort({ createdAt: -1 });
        return res.json({ success: true, bills });
    }
    catch (error) {
        console.error("Error fetching bills:", error);
        return res.status(500).json({ success: false, error: "Server error" });
    }
};
exports.getBill = getBill;
// Delete a bill
const deleteBill = async (req, res) => {
    try {
        const { billId } = req.params;
        if (!billId)
            return res.status(400).json({ message: "Missing billId" });
        await billModel_1.Bill.findByIdAndDelete(billId);
        return res.json({ success: true, message: "Bill deleted successfully" });
    }
    catch (error) {
        console.error("Error deleting bill:", error);
        return res.status(500).json({ success: false, error: "Server error" });
    }
};
exports.deleteBill = deleteBill;
// Upload a new bill
const uploadBill = async (req, res) => {
    try {
        const { userId, title, amount, category, expiryDate, description, storeName, } = req.body;
        const file = req.file;
        if (!userId || !title || !amount || !category || !expiryDate || !file) {
            return res.status(400).json({ message: "Missing required fields" });
        }
        // File path to save in DB
        const imageUrl = `/uploads/${file.filename}`;
        const bill = new billModel_1.Bill({
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
    }
    catch (error) {
        console.error("Error in uploadBill:", error);
        return res.status(500).json({ success: false, error: "Server error" });
    }
};
exports.uploadBill = uploadBill;
//# sourceMappingURL=billController.js.map