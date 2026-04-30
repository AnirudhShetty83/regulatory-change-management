from flask import Blueprint, request, jsonify
from services.groq_client import GroqClient
import json
import re
import time

categorise_bp = Blueprint("categorise", __name__)

client = GroqClient()

@categorise_bp.route("/categorise", methods=["POST"])
def categorise():
    data = request.get_json()

    if not data or "text" not in data:
        return jsonify({"error": "Missing 'text' field"}), 400

    user_text = data["text"]
    
    if not user_text.strip():
        return jsonify({"error": "Text cannot be empty"}), 400

    if len(user_text) < 5:
        return jsonify({"error": "Text too short"}), 400

    if len(user_text) > 1000:
        return jsonify({"error": "Text too long"}), 400

    prompt = f"""
You are a strict classification AI.

Classify the text into EXACTLY one category:
Compliance, Risk, Legal, Financial, Operational

Rules:
- Output ONLY valid JSON
- DO NOT include markdown
- DO NOT add any text outside JSON
- Confidence must be between 0 and 1

Decision rules:
- Regulatory rules, penalties, enforcement → Compliance
- Laws, court cases, legal disputes → Legal
- Financial reports, audits, accounting → Financial
- Risk assessment, mitigation → Risk
- Internal processes, workflows → Operational

Always choose the MOST relevant category.


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
        start = time.time()

        ai_result = client.generate(prompt)

        end = time.time()

        response_time_ms = int((end - start) * 1000)

        raw_text = ai_result["content"]
        tokens_used = ai_result["tokens"]
        model_used = ai_result["model"]

        # Clean markdown
        cleaned = raw_text.replace("```json", "").replace("```", "").strip()

        match = re.search(r"\{.*\}", cleaned, re.DOTALL)

        if not match:
            return jsonify({"error": "AI did not return valid JSON"}), 500

        parsed = json.loads(match.group())

        return jsonify({
            "data": parsed,
            "meta": {
                "confidence": parsed.get("confidence", 0.9),
                "model_used": model_used,
                "tokens_used": tokens_used,
                "response_time_ms": response_time_ms,
                "cached": False
            }
        })

    except json.JSONDecodeError:
        return jsonify({"error": "Failed to parse AI JSON response"}), 500

    except Exception as e:
        return jsonify({"error": str(e)}), 500