from flask import Blueprint, request, jsonify
from services.groq_client import GroqClient
import json
import re

categorise_bp = Blueprint("categorise", __name__)

client = GroqClient()

@categorise_bp.route("/categorise", methods=["POST"])
def categorise():
    data = request.get_json()

    if not data or "text" not in data:
        return jsonify({"error": "Missing 'text' field"}), 400

    user_text = data["text"]

    prompt = f"""
You are an AI classifier.

Classify the text into one of these categories:
Compliance, Risk, Legal, Financial, Operational

Text:
\"\"\"{user_text}\"\"\"

Respond ONLY in valid JSON. No extra text.

Example:
{{
  "category": "Compliance",
  "confidence": 0.95,
  "reasoning": "This relates to regulatory compliance requirements."
}}
"""

    try:
        response = client.generate(prompt)

        if not response:
            return jsonify({"error": "AI service unavailable"}), 500

        # ✅ Extract JSON safely (IMPORTANT FIX)
        match = re.search(r"\{.*\}", response, re.DOTALL)

        if not match:
            return jsonify({"error": "AI did not return valid JSON"}), 500

        json_str = match.group()

        parsed = json.loads(json_str)

        return jsonify(parsed)

    except json.JSONDecodeError:
        return jsonify({"error": "Failed to parse AI JSON response"}), 500

    except Exception as e:
        return jsonify({"error": str(e)}), 500