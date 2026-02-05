"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveFile = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const saveFile = async (file, userId, billId) => {
    try {
        const uploadsDir = path_1.default.join(__dirname, "../../uploads", userId);
        if (!fs_1.default.existsSync(uploadsDir)) {
            fs_1.default.mkdirSync(uploadsDir, { recursive: true });
        }
        const filePath = path_1.default.join(uploadsDir, `${billId}.jpg`);
        const fileBuffer = Buffer.from(await file.arrayBuffer());
        fs_1.default.writeFileSync(filePath, fileBuffer);
        return filePath;
    }
    catch (error) {
        throw new Error("Error saving file: " + error);
    }
};
exports.saveFile = saveFile;
