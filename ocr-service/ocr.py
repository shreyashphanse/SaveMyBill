from flask import Flask, request, jsonify
import pytesseract
import cv2
import numpy as np
import re

# Configure pytesseract path on Windows
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

app = Flask(__name__)


def extract_amount_and_date(image_bytes):
    """Extract amount and expiry date from uploaded image using OCR."""
    # Convert bytes to OpenCV image
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    # Convert to grayscale & apply threshold for better OCR
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    gray = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)[1]

    # OCR text extraction
    text = pytesseract.image_to_string(gray)

    # Extract amount (₹ or numbers with decimals)
    amount = 0.0
    for line in text.split("\n"):
        if "total" in line.lower() or "₹" in line or "amount" in line.lower():
            nums = re.findall(r"\d+(?:\.\d{1,2})?", line)
            if nums:
                amount = float(nums[-1])
                break

    # Extract date (DD/MM/YYYY or similar)
    date_matches = re.findall(r"(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})", text)
    expiry_date = date_matches[-1] if date_matches else ""

    return {
        "amount": amount,
        "expiryDate": expiry_date
    }


@app.route("/ocr", methods=["POST"])
def ocr_endpoint():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    image_bytes = file.read()

    try:
        result = extract_amount_and_date(image_bytes)
        return jsonify({"success": True, "data": result})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)

# Example usage:
# D:\coding\Major_Projects\SaveMyBill\ocr-service\puc.jpg
# curl -X POST -F "file=@D:\coding\Major_Projects\SaveMyBill\ocr-service\puc.jpg" http://localhost:5001/ocr
