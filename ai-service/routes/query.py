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

    try:
        # ✅ STEP 0 — CHECK CACHE FIRST
        cached = get_cache(question)
        if cached:
            return jsonify(cached)

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

Context:
{context}

Question:
{question}

Answer clearly and concisely.
"""

        # Step 4: Call Groq + track time
        start = time.time()

        answer = groq.generate(prompt)

        end = time.time()

        response_times.append(end - start)
        if len(response_times) > 10:
            response_times.pop(0)

        # STEP 5 — SAVE TO CACHE
        result = {
            "answer": answer,
            "sources": docs
        }

        set_cache(question, result)

        return jsonify(result)

    except Exception as e:
        return jsonify({"error": str(e)}), 500