import os
from flask import Flask, request, jsonify
import pytesseract
import cv2
import numpy as np
import re
import shutil


app = Flask(__name__)


def extract_amount_and_date(image_bytes):
    print("Tesseract location:", shutil.which("tesseract"))

    # Convert bytes to OpenCV image
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if img is None:
        raise Exception("Could not decode image")

    # Convert to grayscale
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # Apply threshold
    gray = cv2.threshold(
        gray,
        0,
        255,
        cv2.THRESH_BINARY + cv2.THRESH_OTSU
    )[1]

    print("Starting OCR...")

    # OCR text extraction
    text = pytesseract.image_to_string(gray)

    print("OCR TEXT:")
    print(text)

    # Extract amount
    amount = 0.0

    for line in text.split("\n"):
        if (
            "total" in line.lower()
            or "₹" in line
            or "amount" in line.lower()
            or "price" in line.lower()
            or "cost" in line.lower()
            or "balance" in line.lower()
        ):
            nums = re.findall(r"\d+(?:\.\d{1,2})?", line)

            if nums:
                amount = float(nums[-1])
                break

    # Extract date
    date_matches = re.findall(
        r"(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})",
        text
    )

    expiry_date = date_matches[-1] if date_matches else ""

    return {
        "amount": amount,
        "expiryDate": expiry_date
    }


@app.route("/")
def home():
    return jsonify({
        "success": True,
        "message": "OCR server running"
    })


@app.route("/ocr", methods=["POST"])
def ocr_endpoint():

    print("========== OCR REQUEST RECEIVED ==========")

    if "file" not in request.files:
        print("ERROR: No file uploaded")

        return jsonify({
            "success": False,
            "error": "No file uploaded"
        }), 400

    file = request.files["file"]

    print(f"File received: {file.filename}")

    image_bytes = file.read()

    try:
        result = extract_amount_and_date(image_bytes)

        print("OCR SUCCESS")
        print(result)

        return jsonify({
            "success": True,
            "data": result
        })

    except Exception as e:

        print("OCR ERROR:")
        print(str(e))

        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=int(os.environ.get("PORT", 5001))
    )