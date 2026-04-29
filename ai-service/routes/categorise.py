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
You are a strict classification AI.

Classify the text into EXACTLY one category:
Compliance, Risk, Legal, Financial, Operational

Rules:
- Output ONLY valid JSON
- DO NOT include markdown (no ``` or ```json)
- DO NOT add any text outside JSON
- Confidence must be between 0 and 1

Text:
\"\"\"{user_text}\"\"\"

Output:
{{
  "category": "...",
  "confidence": 0.0,
  "reasoning": "..."
}}
"""

    try:
        response = client.generate(prompt)

        if not response:
            return jsonify({"error": "AI service unavailable"}), 500

        # Remove markdown formatting (NEW)
        cleaned = response.replace("```json", "").replace("```", "").strip()

        # Extract JSON
        match = re.search(r"\{.*\}", cleaned, re.DOTALL)

        if not match:
            return jsonify({"error": "AI did not return valid JSON"}), 500

        json_str = match.group()

        parsed = json.loads(json_str)

        return jsonify(parsed)

    except json.JSONDecodeError:
        return jsonify({"error": "Failed to parse AI JSON response"}), 500

    except Exception as e:
        return jsonify({"error": str(e)}), 500