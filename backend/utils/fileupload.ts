import fs from "fs";
import path from "path";

export const saveFile = async (file: any, userId: string, billId: string) => {
  try {
    const uploadsDir = path.join(__dirname, "../../uploads", userId);

    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filePath = path.join(uploadsDir, `${billId}.jpg`);
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(filePath, fileBuffer);

    return filePath; // Later you can serve via express.static
  } catch (error) {
    throw new Error("Error saving file: " + error);
  }
};
