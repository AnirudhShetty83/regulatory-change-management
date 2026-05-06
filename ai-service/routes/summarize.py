from flask import Blueprint, request, jsonify
from services.groq_client import GroqClient
import json
import re
import time
from services.cache_service import get_cache, set_cache

summarize_bp = Blueprint("summarize", __name__)
client = GroqClient()

fallback_summary = {
    "summary": "Summary unavailable due to service error.",
    "confidence": 0.5
}

@summarize_bp.route("/summarize", methods=["POST"])
def summarize():
    data = request.get_json()

    if not data or "text" not in data:
        return jsonify({"error": "Missing 'text' field"}), 400

    user_text = data["text"]
    
    if not user_text.strip():
        return jsonify({"error": "Text cannot be empty"}), 400

    # CACHE CHECK
    key = "sum_" + user_text.lower().strip()
    cached = get_cache(key)
    if cached:
        return jsonify({
            "data": cached,
            "meta": {"cached": True}
        })
    
    prompt = f"""
You are an expert regulatory analyst AI.

Provide a brief, clear, and concise explanation or summary of the following regulatory change.
Focus on what the change is, its impact, and what needs to be done.
Keep it to 2-3 sentences.

Rules:
- Output ONLY valid JSON
- DO NOT include markdown
- DO NOT add any text outside JSON

Text:
\"\"\"{user_text}\"\"\"

Output:
{{
  "summary": "..."
}}
"""

    try:
        ai_result = client.generate(prompt)
        raw_text = ai_result["content"]

        # Clean markdown
        cleaned = raw_text.replace("```json", "").replace("```", "").strip()
        match = re.search(r"\{.*\}", cleaned, re.DOTALL)

        if not match:
            raise Exception("Invalid JSON from AI")

        parsed = json.loads(match.group())
        
        # SAVE TO CACHE
        set_cache(key, parsed)

        return jsonify({
            "data": parsed,
            "meta": {"cached": False}
        })

    except Exception as e:
        return jsonify({
            "data": fallback_summary,
            "meta": {"cached": False, "error": str(e)}
        })
