from flask import Blueprint, request, jsonify
from services.limiter import limiter
from services.ai_service import process_text

test_bp = Blueprint("test", __name__)

@test_bp.route("/test", methods=["POST"])
@limiter.limit("5 per minute")
def test():
    data = request.json.get("text", "")
    result = process_text(data)
    return jsonify({
        "input": data,
        "response": result
    })