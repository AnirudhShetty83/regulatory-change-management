from flask import Flask
from routes.categorise import categorise_bp
from routes.query import query_bp
from routes.health import health_bp
from routes.generate_report import generate_report_bp


app = Flask(__name__)

app.register_blueprint(categorise_bp)
app.register_blueprint(query_bp)
app.register_blueprint(health_bp)
app.register_blueprint(generate_report_bp)


if __name__ == "__main__":
    app.run(debug=True, port=5000)