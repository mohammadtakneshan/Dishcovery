from flask import request, jsonify
from . import api_bp
import google.generativeai as genai
from config import Config
import os
import json
import re
from PIL import Image
import io
import logging
import traceback

# Configure logging
logger = logging.getLogger(__name__)

# Configure Gemini AI
genai.configure(api_key=Config.GEMINI_API_KEY)

@api_bp.route('/generate-recipe', methods=['POST'])
def generate_recipe():
    """Generate recipe from food image using Gemini Vision AI"""
    try:
        # Check if image file is present
        if 'file' not in request.files:
            return jsonify({'error': 'No image file provided. Please upload a food photo.'}), 400
        
        file = request.files['file']
        
        # Validate file
        if file.filename == '':
            return jsonify({'error': 'Empty filename. Please select a valid image.'}), 400
        
        # Validate file type
        allowed_extensions = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
        file_ext = file.filename.rsplit('.', 1)[1].lower() if '.' in file.filename else ''
        if file_ext not in allowed_extensions:
            return jsonify({'error': f'Invalid file type. Allowed: {", ".join(allowed_extensions)}'}), 400
        
        # Get optional parameters
        language = request.form.get('language', Config.DEFAULT_LANGUAGE)
        dietary_restrictions = request.form.get('dietary_restrictions', '')
        cuisine_preference = request.form.get('cuisine_preference', '')
        
        # Read and validate image
        try:
            image_data = file.read()
            if len(image_data) == 0:
                return jsonify({'error': 'Empty image file'}), 400
            
            # Verify it's a valid image
            img = Image.open(io.BytesIO(image_data))
            img.verify()
        except Exception as img_error:
            return jsonify({'error': f'Invalid or corrupted image file: {str(img_error)}'}), 400
        
        # Build prompt for Gemini Vision
        prompt = f"""Analyze this food image and generate a detailed recipe to recreate this dish.

Language: {language}
Dietary restrictions: {dietary_restrictions if dietary_restrictions else 'None'}
Cuisine preference: {cuisine_preference if cuisine_preference else 'Auto-detect from image'}

Please provide a complete recipe in valid JSON format with these exact fields:
{{
  "name": "Dish name",
  "prep_time": "X min",
  "cook_time": "X min", 
  "servings": "X",
  "ingredients_with_measurements": ["ingredient 1 with amount", "ingredient 2 with amount", ...],
  "instructions": ["Step 1 detailed description", "Step 2 detailed description", ...],
  "nutrition": {{
    "calories": "X kcal",
    "protein": "Xg",
    "fat": "Xg",
    "carbs": "Xg"
  }},
  "tips": "Helpful serving suggestions and variations"
}}

Important: Return ONLY valid JSON, no markdown formatting or extra text."""

        # Generate with Gemini Vision
        try:
            # Re-open image for Gemini (verify consumed the stream)
            img = Image.open(io.BytesIO(image_data))
            model = genai.GenerativeModel('gemini-2.5-flash')
            logger.info("Using model: gemini-2.5-flash")
            response = model.generate_content([prompt, img])
            
            if not response or not response.text:
                return jsonify({'error': 'AI did not return a response. Please try again.'}), 500
            
            # Parse the response
            recipe_text = response.text.strip()
            
            # Remove markdown code blocks if present
            recipe_text = re.sub(r'^```json\s*', '', recipe_text)
            recipe_text = re.sub(r'^```\s*', '', recipe_text)
            recipe_text = re.sub(r'\s*```$', '', recipe_text)
            recipe_text = recipe_text.strip()
            
            # Try to parse as JSON
            try:
                recipe_json = json.loads(recipe_text)
            except json.JSONDecodeError:
                # If JSON parsing fails, return raw text with warning
                fallback_recipe = {
                    'title': 'Generated Recipe',
                    'prep_time': 'N/A',
                    'cook_time': 'N/A',
                    'servings': 'N/A',
                    'ingredients': [],
                    'steps': [recipe_text],
                    'nutrition': {},
                    'tips': ''
                }
                return jsonify({
                    'success': True,
                    'warning': 'Could not parse structured recipe, returning raw text',
                    'recipe': fallback_recipe,
                    'raw_response': recipe_text,
                    'source': 'gemini-vision'
                })
            
            # Transform to frontend format
            transformed_recipe = {
                'title': recipe_json.get('name', 'Delicious Recipe'),
                'prep_time': recipe_json.get('prep_time', 'N/A'),
                'cook_time': recipe_json.get('cook_time', 'N/A'),
                'servings': recipe_json.get('servings', 'N/A'),
                'ingredients': recipe_json.get('ingredients_with_measurements', []),
                'steps': recipe_json.get('instructions', []),
                'nutrition': recipe_json.get('nutrition', {}),
                'tips': recipe_json.get('tips', '')
            }
            
            return jsonify({
                'success': True,
                'recipe': transformed_recipe,
                'source': 'gemini-vision'
            })
            
        except Exception as ai_error:
            error_msg = str(ai_error)
            logger.error(f"AI Error: {error_msg}")
            logger.debug(traceback.format_exc())
            
            if 'rate limit' in error_msg.lower():
                return jsonify({'error': 'AI service rate limit reached. Please try again in a few moments.'}), 429
            elif 'api key' in error_msg.lower() or 'auth' in error_msg.lower():
                response = {'error': 'AI service authentication failed. Please contact support.'}
                if Config.FLASK_ENV.lower() in ['development', 'debug']:
                    response['debug'] = error_msg
                return jsonify(response), 500
            else:
                return jsonify({'error': f'AI processing failed: {error_msg}'}), 500
        
    except Exception as e:
        logger.error(f"Server Error: {str(e)}")
        logger.debug(traceback.format_exc())
        return jsonify({'error': f'Server error: {str(e)}'}), 500

@api_bp.route('/health', methods=['GET'])
def health_check():
    """API health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'Dishcovery API',
        'version': '1.0.0'
    })
