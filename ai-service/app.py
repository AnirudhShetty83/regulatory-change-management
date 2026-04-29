from flask import Flask, jsonify
from routes.test_route import test_bp
from services.sanitizer import sanitize_request
from services.limiter import limiter

app = Flask(__name__)

# Middleware
app.before_request(sanitize_request)

# Init limiter
limiter.init_app(app)

# Routes
app.register_blueprint(test_bp)

@app.route("/")
def home():
    return "AI Service Running"

@app.errorhandler(429)
def ratelimit_handler(e):
    return jsonify({
        "error": "Rate limit exceeded",
        "message": str(e.description)
    }), 429

if __name__ == "__main__":
    app.run(port=5000)
    