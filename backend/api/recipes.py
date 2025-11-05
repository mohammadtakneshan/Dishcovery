from flask import request, jsonify
from . import api_bp
import google.generativeai as genai
from config import Config
import os

# Configure Gemini AI
genai.configure(api_key=Config.GEMINI_API_KEY)

@api_bp.route('/generate-recipe', methods=['POST'])
def generate_recipe():
    """Generate recipe from ingredients using Gemini AI"""
    try:
        data = request.get_json()
        ingredients = data.get('ingredients', [])
        language = data.get('language', Config.DEFAULT_LANGUAGE)
        dietary_restrictions = data.get('dietary_restrictions', [])
        cuisine_preference = data.get('cuisine_preference', '')
        
        if not ingredients:
            return jsonify({'error': 'No ingredients provided'}), 400
        
        # Build prompt
        prompt = f"""Generate a delicious recipe using the following ingredients: {', '.join(ingredients)}.
        
Language: {language}
Dietary restrictions: {', '.join(dietary_restrictions) if dietary_restrictions else 'None'}
Cuisine preference: {cuisine_preference if cuisine_preference else 'Any'}

Please provide:
1. Recipe name
2. Preparation time
3. Cooking time
4. Servings
5. Difficulty level (Easy/Medium/Hard)
6. Complete ingredient list with measurements
7. Step-by-step instructions
8. Nutritional information (approximate)
9. Tips and variations

Format the response as JSON with these fields: name, prep_time, cook_time, servings, difficulty, ingredients_with_measurements, instructions, nutrition, tips"""

        # Generate with Gemini
        model = genai.GenerativeModel('gemini-pro')
        response = model.generate_content(prompt)
        
        return jsonify({
            'success': True,
            'recipe': response.text,
            'source': 'gemini'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api_bp.route('/health', methods=['GET'])
def health_check():
    """API health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'Dishcovery API',
        'version': '1.0.0'
    })
