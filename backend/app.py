from flask import Flask, jsonify
from flask_cors import CORS
from config import Config
from api import api_bp

def create_app(config_class=Config):
    """Application factory pattern"""
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Enable CORS with explicit configuration
    CORS(app, resources={
        r"/api/*": {
            "origins": "*",  # Allow all origins for development
            "methods": ["GET", "POST", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization", "x-api-key", "anthropic-version"]
        }
    })
    
    # Register blueprints
    app.register_blueprint(api_bp)
    
    @app.route('/')
    def index():
        """API root endpoint providing service information and available endpoints.

        Returns:
            JSON response with welcome message, version, and endpoint directory
        """
        return jsonify({
            'message': 'Welcome to Dishcovery API',
            'version': '1.0.0',
            'endpoints': {
                'health': '/api/health',
                'generate_recipe': '/api/generate-recipe'
            }
        })
    
    return app

# Create app instance for Vercel
app = create_app()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
