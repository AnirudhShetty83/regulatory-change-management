from flask import Blueprint, request, jsonify
from services.chroma_service import ChromaService
from services.groq_client import GroqClient
import time
from routes.health import response_times
from services.cache_service import get_cache, set_cache

query_bp = Blueprint("query", __name__)

chroma = ChromaService()
groq = GroqClient()

@query_bp.route("/query", methods=["POST"])
def query():
    data = request.get_json()

    if not data or "question" not in data:
        return jsonify({"error": "Missing 'question' field"}), 400

    question = data["question"]
    
    if not question.strip():
        return jsonify({"error": "Question cannot be empty"}), 400

    if len(question) < 5:
        return jsonify({"error": "Question too short"}), 400

    if len(question) > 500:
        return jsonify({"error": "Question too long"}), 400

    try:
        # STEP 0 — CACHE CHECK
        cached = get_cache(question)
        if cached:
            return jsonify({
                "data": cached,
                "meta": {
                    "confidence": 1.0,
                    "model_used": "cache",
                    "tokens_used": 0,
                    "response_time_ms": 0,
                    "cached": True
                }
            })

        # Step 1: Retrieve documents
        results = chroma.query(question, n_results=3)
        docs = results.get("documents", [[]])[0]

        if not docs:
            return jsonify({"error": "No relevant documents found"}), 404

        # Step 2: Build context
        context = "\n\n".join(docs)

        # Step 3: Prompt
        prompt = f"""
You are an AI assistant.

Use ONLY the context below to answer the question.

Rules:
- Do NOT use outside knowledge
- If answer is clearly supported by context, use it
- If partially supported, give best possible answer based on context
- If not supported at all, say:
  "Answer not available in provided context"
- Be concise and clear

Context:
{context}

Question:
{question}
"""

        # Step 4: Call Groq + track time
        start = time.time()

        ai_result = groq.generate(prompt)

        end = time.time()

        response_time_ms = int((end - start) * 1000)

        # Track avg time
        response_times.append(end - start)
        if len(response_times) > 10:
            response_times.pop(0)

        answer = ai_result["content"]
        tokens_used = ai_result["tokens"]
        model_used = ai_result["model"]

        # STEP 5 — SAVE TO CACHE
        result = {
            "answer": answer,
            "sources": docs
        }

        set_cache(question, result)

        return jsonify({
            "data": result,
            "meta": {
                "confidence": 0.9,
                "model_used": model_used,
                "tokens_used": tokens_used,
                "response_time_ms": response_time_ms,
                "cached": False
            }
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500