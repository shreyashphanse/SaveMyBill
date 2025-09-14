import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.set("strictQuery", true); // optional but recommended
    const conn = await mongoose.connect("mongodb://127.0.0.1:27017/savemybill");
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Error connecting to DB: ${error}`);
    process.exit(1);
  }
};
