import mongoose, { Schema, Document } from "mongoose";

export interface IBill extends Document {
  userId: string;
  title: string;
  amount: number;
  category: mongoose.Schema.Types.ObjectId;
  expiryDate: string;
  imageUrl: string;
  description?: string;
  storeName?: string;
  createdAt: Date;
}

const BillSchema: Schema = new Schema<IBill>(
  {
    userId: { type: String, required: true },
    title: { type: String, required: true },
    amount: { type: Number, required: true },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    expiryDate: { type: String, required: true },
    imageUrl: { type: String, required: true },
    description: { type: String, default: "" },
    storeName: { type: String, default: "" },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Bill = mongoose.model<IBill>("Bill", BillSchema);
