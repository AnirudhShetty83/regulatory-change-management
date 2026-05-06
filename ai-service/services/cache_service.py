import redis
import hashlib
import json
import os

# Connect to Redis — use env vars so Docker networking works correctly
_REDIS_HOST = os.getenv("REDIS_HOST", "redis")
_REDIS_PORT = int(os.getenv("REDIS_PORT", 6379))
r = redis.Redis(host=_REDIS_HOST, port=_REDIS_PORT, decode_responses=True)

# stats
cache_hits = 0
cache_misses = 0

TTL = 900  # 15 minutes

def generate_key(text):
    return hashlib.sha256(text.encode()).hexdigest()

def get_cache(question):
    global cache_hits, cache_misses

    key = generate_key(question)
    data = r.get(key)

    if data:
        cache_hits += 1
        return json.loads(data)

    cache_misses += 1
    return None

def set_cache(question, response):
    key = generate_key(question)
    r.setex(key, TTL, json.dumps(response))

def get_cache_stats():
    return {
        "hits": cache_hits,
        "misses": cache_misses
    }