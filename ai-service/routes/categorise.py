from flask import Blueprint, request, jsonify
from services.groq_client import GroqClient
import json
import re
import time
from services.cache_service import get_cache, set_cache

fallback_categorise = {
    "category": "Operational",
    "confidence": 0.5,
    "reasoning": "Fallback response due to AI service unavailability"
}

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

    # CACHE CHECK (ADD HERE)
    key = user_text.lower().strip()
    cached = get_cache(key)
    if cached:
        return jsonify({
            "data": cached,
            "meta": {
                "confidence": cached.get("confidence", 1.0),
                "model_used": "cache",
                "tokens_used": 0,
                "response_time_ms": 0,
                "cached": True,
                "is_fallback": False
            }
        })
    
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
            raise Exception("Invalid JSON from AI")

        parsed = json.loads(match.group())
        
        #  SAVE TO CACHE
        set_cache(key, parsed)

        return jsonify({
            "data": parsed,
            "meta": {
                "confidence": parsed.get("confidence", 0.9),
                "model_used": model_used,
                "tokens_used": tokens_used,
                "response_time_ms": response_time_ms,
                "cached": False,
                "is_fallback": False
            }
        })

    except json.JSONDecodeError:
        return jsonify({
            "data": fallback_categorise,
            "meta": {
                "confidence": 0.5,
                "model_used": "fallback",
                "tokens_used": 0,
                "response_time_ms": 0,
                "cached": False,
                "is_fallback": True
            }
        })
        
    except Exception as e:
        return jsonify({
            "data": fallback_categorise,
            "meta": {
                "confidence": 0.5,
                "model_used": "fallback",
                "tokens_used": 0,
                "response_time_ms": 0,
                "cached": False,
                "is_fallback": True
            }
        })