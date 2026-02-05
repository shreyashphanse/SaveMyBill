"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const categoryModel_1 = __importDefault(require("../models/categoryModel"));
const billModel_1 = require("../models/billModel");
const router = express_1.default.Router();
// Delete a category by ID along with its bills
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        // 1️ Delete all bills under this category
        await billModel_1.Bill.deleteMany({ category: id });
        // 2️ Delete the category itself
        const deletedCategory = await categoryModel_1.default.findByIdAndDelete(id);
        if (!deletedCategory) {
            return res.status(404).json({ message: "Category not found" });
        }
        res
            .status(200)
            .json({ message: "Category and its bills deleted successfully" });
    }
    catch (error) {
        console.error("Error deleting category and its bills:", error);
        res
            .status(500)
            .json({ message: "Server error while deleting category and its bills" });
    }
});
// GET categories with stats
router.get("/", async (req, res) => {
    const userId = req.query.userId;
    if (!userId)
        return res.status(400).json({ error: "Missing userId" });
    try {
        const categories = await categoryModel_1.default.find({ userId });
        const categoriesWithStats = await Promise.all(categories.map(async (cat) => {
            const bills = await billModel_1.Bill.find({ userId, category: cat._id });
            const totalAmount = bills.reduce((acc, b) => acc + b.amount, 0);
            return {
                id: cat._id,
                name: cat.name,
                bills: bills.length,
                totalAmount,
            };
        }));
        res.json({ categories: categoriesWithStats });
    }
    catch (err) {
        console.error("Error fetching categories:", err);
        res.status(500).json({ error: "Server error" });
    }
});
// POST new category
router.post("/", async (req, res) => {
    const { name, userId } = req.body;
    if (!name || !userId) {
        return res.status(400).json({ error: "Missing fields" });
    }
    try {
        const newCategory = new categoryModel_1.default({ name, userId });
        await newCategory.save();
        res.status(201).json({ id: newCategory._id, name: newCategory.name });
        console.log("✅ New Category:", req.body);
    }
    catch (err) {
        console.error("Error creating category:", err);
        res.status(500).json({ error: "Server error" });
    }
});
exports.default = router;
//# sourceMappingURL=category.js.map