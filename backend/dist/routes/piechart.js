"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const billModel_1 = require("../models/billModel");
const router = express_1.default.Router();
router.get("/", async (req, res) => {
    try {
        const userId = req.query.userId;
        if (!userId) {
            return res.status(400).json({
                success: false,
                error: "userId is required",
            });
        }
        const result = await billModel_1.Bill.aggregate([
            {
                $match: {
                    userId: userId,
                },
            },
            {
                $lookup: {
                    from: "categories",
                    localField: "category",
                    foreignField: "_id",
                    as: "categoryData",
                },
            },
            {
                $unwind: "$categoryData",
            },
            {
                $group: {
                    _id: "$categoryData.name",
                    total: {
                        $sum: "$amount",
                    },
                },
            },
        ]);
        const data = result.map((item) => ({
            category: item._id,
            total: item.total,
        }));
        return res.json({
            success: true,
            data,
        });
    }
    catch (error) {
        console.error("Pie Chart Error:", error);
        return res.status(500).json({
            success: false,
            error: "Server error",
        });
    }
});
exports.default = router;
