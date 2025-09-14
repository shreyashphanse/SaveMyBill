from flask import Flask, request, jsonify
from pymongo import MongoClient
from bson.objectid import ObjectId

app = Flask(__name__)

# MongoDB connection (update URI as per your DB)
client = MongoClient("mongodb://localhost:27017/")
db = client["savemybill"]  # your DB name
bills_collection = db["bills"]  # collection where bills are stored

@app.route("/piechart", methods=["GET"])
def piechart():
    user_id = request.args.get("userId")
    if not user_id:
        return jsonify({"success": False, "error": "userId is required"}), 400

    try:
        pipeline = [
            {"$match": {"userId": user_id}},
            {"$group": {"_id": "$categoryName", "total": {"$sum": "$amount"}}}
        ]
        result = list(bills_collection.aggregate(pipeline))

        # Format for frontend
        data = [{"category": r["_id"], "total": r["total"]} for r in result]

        return jsonify({"success": True, "data": data})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5002, debug=True)
