"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = require("./config/db");
const bills_1 = __importDefault(require("./routes/bills"));
const category_1 = __importDefault(require("./routes/category"));
const path_1 = __importDefault(require("path"));
// Load environment variables
dotenv_1.default.config();
// Connect to MongoDB
(0, db_1.connectDB)();
const app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Routes
app.use("/api/bills", bills_1.default);
app.use("/api/categories", category_1.default);
// ✅ Health check route
app.get("/", (req, res) => {
    res.json({ success: true, message: "SaveMyBill backend running 🚀" });
});
// ✅ Serve uploaded images statically
app.use("/uploads", express_1.default.static(path_1.default.join(__dirname, "uploads")));
// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
exports.default = app;
