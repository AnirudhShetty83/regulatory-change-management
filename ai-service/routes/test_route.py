from flask import Blueprint, request, jsonify
from services.limiter import limiter
from services.ai_service import process_text

test_bp = Blueprint("test", __name__)


@test_bp.route("/test", methods=["POST"])
@limiter.limit("5 per minute")
def test():
    if not request.is_json:
        return jsonify({
            "success": False,
            "error": "Request must be in JSON format"
        }), 400

    data = request.get_json()
    text = data.get("text")

    if not text:
        return jsonify({
            "success": False,
            "error": "Missing 'text' field"
        }), 400

    try:
        result = process_text(text)

        return jsonify({
            "success": True,
            "data": {
                "input": data,
                "response": result
            }
        }), 200

    except ValueError:
        return jsonify({
            "success": False,
            "error": "Invalid or malicious input detected"
        }), 400

    except Exception:
        return jsonify({
            "success": False,
            "error": "Internal server error"
        }), 500