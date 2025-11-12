import os
import sys

# Add backend directory to path so we can import the Flask app
backend_path = os.path.join(os.path.dirname(__file__), '..', 'backend')
sys.path.insert(0, backend_path)

# Import the Flask app from backend
from app import app

# Explicitly export app for Vercel
# Vercel looks for 'app' variable to serve
__all__ = ['app']
