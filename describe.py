from flask import Blueprint, request, jsonify
from datetime import datetime

describe_bp = Blueprint("describe", __name__)

@describe_bp.route("/describe", methods=["POST"])
def describe():
    data = request.json
    text = data.get("text")

    if not text:
        return {"error": "Text is required"}, 400

    # Temporary response (replace with AI later)
    return jsonify({
        "summary": "Sample summary",
        "risk": "Low",
        "points": ["Point 1", "Point 2"],
        "generated_at": datetime.now().isoformat()
    })
