import express, { Request, Response } from "express";
import { Bill } from "../models/billModel";

const router = express.Router();

router.get("/", async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId as string;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: "userId is required",
      });
    }

    const result = await Bill.aggregate([
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
  } catch (error) {
    console.error("Pie Chart Error:", error);

    return res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
});

export default router;
