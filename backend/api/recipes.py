import base64
import io
import json
import logging
import mimetypes
import re
import traceback
from typing import Any, Dict, Tuple

import google.generativeai as genai
from anthropic import Anthropic
from flask import jsonify, request
from openai import OpenAI
from PIL import Image, UnidentifiedImageError

from config import Config
from . import api_bp

logger = logging.getLogger(__name__)


class ProviderError(Exception):
    """Raised when a provider fails to return a usable response."""

    def __init__(self, code: str, message: str, *, status: int = 500, hint: str | None = None, debug: str | None = None):
        super().__init__(message)
        self.code = code
        self.status = status
        self.hint = hint
        self.debug = debug


def problem_response(code: str, message: str, *, status: int = 400, hint: str | None = None, debug: str | None = None):
    payload: Dict[str, Any] = {
        "success": False,
        "error": {
            "code": code,
            "message": message,
        },
    }

    if hint:
        payload["error"]["hint"] = hint

    if debug and Config.FLASK_ENV.lower() in {"development", "debug"}:
        payload["error"]["debug"] = debug

    return jsonify(payload), status


@api_bp.route('/generate-recipe', methods=['POST'])
def generate_recipe():
    """
    Generate recipe from image OR text prompt.
    Accepts:
    - file: Image file upload
    - image_url: URL to an image
    - text_prompt: Text description of dish
    """
    try:
        # === INPUT EXTRACTION ===
        file = request.files.get('file')
        image_url = request.form.get('image_url', '').strip()
        text_prompt = request.form.get('text_prompt', '').strip()

        # === INPUT VALIDATION ===
        has_file = bool(file)
        has_url = bool(image_url)
        has_prompt = bool(text_prompt)

        if not has_file and not has_url and not has_prompt:
            return problem_response(
                code='missing_input',
                message='Either an image (file or URL) or text prompt is required',
                hint='Upload an image, provide an image URL, or enter a text description',
                status=400
            )

        # === IMAGE PROCESSING ===
        image_bytes = None
        mime_type = None

        if has_file or has_url:
            try:
                if has_file:
                    # Existing file upload logic
                    filename = file.filename
                    if not filename or '.' not in filename:
                        return problem_response(
                            code='invalid_filename',
                            message='Invalid file name',
                            hint='Ensure your image has a proper file extension',
                            status=400
                        )

                    file_ext = filename.rsplit('.', 1)[1].lower()
                    if file_ext not in Config.ALLOWED_EXTENSIONS:
                        return problem_response(
                            code='invalid_file_type',
                            message=f'File type .{file_ext} not allowed',
                            hint=f'Allowed types: {", ".join(Config.ALLOWED_EXTENSIONS)}',
                            status=400
                        )

                    image_bytes = file.read()
                    mime_type = file.content_type or f'image/{file_ext}'

                    # Validate image
                    image = Image.open(io.BytesIO(image_bytes))
                    image.verify()

                elif has_url:
                    # Download image from URL
                    import requests

                    try:
                        img_response = requests.get(image_url, timeout=10)
                        img_response.raise_for_status()

                        image_bytes = img_response.content
                        mime_type = img_response.headers.get('Content-Type', 'image/png')

                        # Validate image
                        image = Image.open(io.BytesIO(image_bytes))
                        image.verify()

                    except requests.RequestException as e:
                        return problem_response(
                            code='invalid_image_url',
                            message='Could not download image from URL',
                            hint='Ensure the image URL is accessible and valid',
                            status=400,
                            debug=str(e)
                        )

            except Exception as e:
                return problem_response(
                    code='invalid_image',
                    message='File is not a valid image',
                    hint='Try uploading a JPEG or PNG file',
                    status=400,
                    debug=str(e)
                )

        # === PROVIDER CONFIGURATION ===
        language = request.form.get('language', Config.DEFAULT_LANGUAGE)
        dietary_restrictions = request.form.get('dietary_restrictions')
        cuisine_preference = request.form.get('cuisine_preference')

        provider_id = request.form.get('provider', Config.DEFAULT_PROVIDER).lower()
        api_key = request.form.get('api_key')
        model = request.form.get('model')

        provider_config = get_provider_config(provider_id)
        if not provider_config:
            return problem_response(
                code='invalid_provider',
                message=f'Provider "{provider_id}" not supported',
                hint='Use gemini, openai, or anthropic',
                status=400
            )

        if not api_key:
            api_key = Config.get_api_key_for(provider_id)

        if not api_key:
            return problem_response(
                code='missing_api_key',
                message=f'{provider_config["label"]} API key required',
                hint=provider_config.get('key_hint', 'Add API key in settings'),
                status=400
            )

        if not model:
            model = provider_config['default_model']

        handler = provider_config['handler']

        # Build prompt
        recipe_prompt = build_prompt(language, dietary_restrictions, cuisine_preference)

        # === RECIPE GENERATION ===
        try:
            if image_bytes:
                recipe_text, provider_meta = handler(
                    image_bytes=image_bytes,
                    text_prompt=None,
                    prompt=recipe_prompt,
                    model=model,
                    api_key=api_key,
                    mime_type=mime_type
                )
            else:
                recipe_text, provider_meta = handler(
                    image_bytes=None,
                    text_prompt=text_prompt,
                    prompt=recipe_prompt,
                    model=model,
                    api_key=api_key,
                    mime_type=None
                )
        except ProviderError as provider_error:
            logger.warning(
                "Provider error (%s): %s",
                provider_error.code,
                provider_error,
            )
            return problem_response(
                code=provider_error.code,
                message=str(provider_error),
                status=provider_error.status,
                hint=provider_error.hint,
                debug=provider_error.debug,
            )
        except Exception as unexpected_error:  # noqa: BLE001
            logger.error(
                "Unhandled provider exception: %s",
                unexpected_error,
            )
            logger.debug(traceback.format_exc())
            return problem_response(
                code='provider_failure',
                message='AI processing failed. Please try again later.',
                status=500,
                debug=str(unexpected_error),
            )

        # === RESPONSE FORMATTING ===
        try:
            recipe_data, warning = parse_recipe(recipe_text)
        except Exception as e:
            logger.warning(f"Recipe parsing failed: {str(e)}")
            return problem_response(
                code='recipe_parse_error',
                message='Could not parse recipe from AI response',
                hint='The AI response format was unexpected. Please try again.',
                status=500,
                debug=str(e)
            )

        response_data = {
            'success': True,
            'recipe': recipe_data,
            'meta': {
                'provider': provider_id,
                'provider_label': provider_config['label'],
                'model': model,
                'language': language,
                'dietary_restrictions': dietary_restrictions,
                'cuisine_preference': cuisine_preference,
                'input_type': 'image' if image_bytes else 'text_prompt'
            }
        }

        if warning:
            response_data['warning'] = warning

        if Config.FLASK_ENV.lower() in {'development', 'debug'}:
            response_data['debug'] = {
                'raw_response': recipe_text,
            }

        return jsonify(response_data), 200

    except Exception as e:
        logger.error(f"Recipe generation error: {str(e)}")
        logger.debug(traceback.format_exc())
        return problem_response(
            code='internal_error',
            message='An unexpected error occurred',
            status=500,
            debug=str(e)
        )

@api_bp.route('/health', methods=['GET'])
def health_check():
    """API health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'Dishcovery API',
        'version': '1.0.0'
    })


@api_bp.route('/generate-image', methods=['POST'])
def generate_food_image():
    """
    Generate a food image from text prompt using OpenAI DALL-E.
    Only works with OpenAI provider.
    """
    try:
        # Extract prompt
        prompt = request.form.get('prompt', '').strip()

        if not prompt:
            return problem_response(
                code='missing_prompt',
                message='Text prompt is required',
                hint='Enter a description of the dish you want to generate',
                status=400
            )

        # Validate prompt length
        if len(prompt) < Config.MIN_PROMPT_LENGTH:
            return problem_response(
                code='prompt_too_short',
                message=f'Prompt must be at least {Config.MIN_PROMPT_LENGTH} characters',
                hint='Provide a more detailed description',
                status=400
            )

        if len(prompt) > Config.MAX_PROMPT_LENGTH:
            return problem_response(
                code='prompt_too_long',
                message=f'Prompt must be less than {Config.MAX_PROMPT_LENGTH} characters',
                hint='Please shorten your description',
                status=400
            )

        # Extract provider (must be OpenAI for image generation)
        provider = request.form.get('provider', 'openai').lower()
        if provider != 'openai':
            return problem_response(
                code='invalid_provider',
                message='Image generation is only supported with OpenAI provider',
                hint='Switch to OpenAI in settings',
                status=400
            )

        # Get API key
        api_key = request.form.get('api_key', '').strip()
        if not api_key:
            api_key = Config.get_api_key_for('openai')

        if not api_key:
            return problem_response(
                code='missing_api_key',
                message='OpenAI API key is required',
                hint='Add your OpenAI API key in settings',
                status=400
            )

        # Get image size
        size = request.form.get('size', Config.DEFAULT_IMAGE_SIZE)
        if size not in Config.ALLOWED_IMAGE_SIZES:
            return problem_response(
                code='invalid_size',
                message=f'Invalid image size: {size}',
                hint=f'Allowed sizes: {", ".join(Config.ALLOWED_IMAGE_SIZES)}',
                status=400
            )

        # Generate image using OpenAI DALL-E
        try:
            client = OpenAI(api_key=api_key)

            # Enhance prompt for food photography
            enhanced_prompt = f"Professional food photography of {prompt}, appetizing, well-lit, high quality"

            response = client.images.generate(
                model=Config.IMAGE_GENERATION_MODEL,
                prompt=enhanced_prompt,
                size=size,
                quality="standard",
                n=1
            )

            if not response.data or len(response.data) == 0:
                raise ProviderError(
                    code='empty_response',
                    message='OpenAI did not return an image',
                    hint='Please try again with a different prompt'
                )

            image_url = response.data[0].url

            return jsonify({
                'success': True,
                'imageUrl': image_url,
                'meta': {
                    'provider': 'openai',
                    'model': Config.IMAGE_GENERATION_MODEL,
                    'size': size,
                    'prompt': prompt
                }
            }), 200

        except ProviderError:
            raise
        except Exception as exc:
            logger.error(f"Image generation error: {str(exc)}")
            raise ProviderError(
                code='image_generation_failed',
                message='Failed to generate image',
                hint='Check your OpenAI API key and quota',
                debug=str(exc)
            ) from exc

    except ProviderError as e:
        return problem_response(
            code=e.code,
            message=e.message,
            hint=e.hint,
            status=e.status,
            debug=e.debug
        )
    except Exception as e:
        logger.error(f"Server error: {str(e)}")
        logger.debug(traceback.format_exc())
        return problem_response(
            code='server_error',
            message='Server error. Please try again later.',
            status=500,
            debug=str(e)
        )


def get_provider_config(provider: str | None) -> Dict[str, Any] | None:
    providers: Dict[str, Dict[str, Any]] = {
        'gemini': {
            'label': 'Google Gemini',
            'default_model': 'gemini-2.5-flash',
            'key_hint': 'Visit Google AI Studio and copy an API key that begins with "AI".',
            'handler': generate_with_gemini,
        },
        'openai': {
            'label': 'OpenAI GPT-4o',
            'default_model': 'gpt-4o-mini',
            'key_hint': 'Use an OpenAI key that starts with "sk-" or "sk-proj-".',
            'handler': generate_with_openai,
        },
        'anthropic': {
            'label': 'Anthropic Claude',
            'default_model': 'claude-3-sonnet-20240229',
            'key_hint': 'Use an Anthropic key that starts with "sk-ant-".',
            'handler': generate_with_anthropic,
        },
    }
    return providers.get(provider or '')


def build_prompt(language: str, dietary_restrictions: str, cuisine_preference: str) -> str:
    dietary_text = dietary_restrictions if dietary_restrictions else 'None'
    cuisine_text = cuisine_preference if cuisine_preference else 'Auto-detect from image'

    return f"""Analyze this food image and generate a detailed recipe to recreate this dish.

Language: {language}
Dietary restrictions: {dietary_text}
Cuisine preference: {cuisine_text}

Return a complete recipe in valid JSON with these exact keys:
{{
  "name": "Dish name",
  "prep_time": "X min",
  "cook_time": "X min",
  "servings": "X",
  "ingredients_with_measurements": ["ingredient 1 with amount", "ingredient 2 with amount"],
  "instructions": ["Step 1 detailed description", "Step 2 detailed description"],
  "nutrition": {{
    "calories": "X kcal",
    "protein": "Xg",
    "fat": "Xg",
    "carbs": "Xg"
  }},
  "tips": "Helpful serving suggestions and variations"
}}

Important: Return ONLY valid JSON. Do not include markdown fences or commentary."""


def parse_recipe(raw_text: str) -> Tuple[Dict[str, Any], str | None]:
    cleaned = raw_text.strip()
    cleaned = re.sub(r'^```json\s*', '', cleaned)
    cleaned = re.sub(r'^```\s*', '', cleaned)
    cleaned = re.sub(r'```\s*$', '', cleaned)
    cleaned = cleaned.strip()

    try:
        recipe_json = json.loads(cleaned)
        return transform_recipe(recipe_json), None
    except json.JSONDecodeError:
        fallback_recipe = {
            'title': 'Generated Recipe',
            'prep_time': 'N/A',
            'cook_time': 'N/A',
            'servings': 'N/A',
            'ingredients': [],
            'steps': [raw_text.strip()],
            'nutrition': {},
            'tips': '',
        }
        return fallback_recipe, 'Could not parse structured recipe. Returning raw text response.'


def transform_recipe(recipe_json: Dict[str, Any]) -> Dict[str, Any]:
    return {
        'title': recipe_json.get('name', 'Delicious Recipe'),
        'prep_time': recipe_json.get('prep_time', 'N/A'),
        'cook_time': recipe_json.get('cook_time', 'N/A'),
        'servings': recipe_json.get('servings', 'N/A'),
        'ingredients': recipe_json.get('ingredients_with_measurements', []),
        'steps': recipe_json.get('instructions', []),
        'nutrition': recipe_json.get('nutrition', {}),
        'tips': recipe_json.get('tips', ''),
    }


def generate_with_gemini(
    *,
    image_bytes: bytes | None = None,
    text_prompt: str | None = None,
    prompt: str,
    model: str,
    api_key: str,
    mime_type: str | None = None
) -> Tuple[str, Dict[str, Any]]:
    """
    Generate recipe using Gemini.
    Accepts either image_bytes OR text_prompt.

    Args:
        image_bytes: Image file bytes (optional)
        text_prompt: Text description for text-only generation (optional)
        prompt: Recipe generation prompt (from build_prompt)
        model: Gemini model name
        api_key: Gemini API key
        mime_type: Image MIME type (optional, required if image_bytes provided)
    """
    if not image_bytes and not text_prompt:
        raise ValueError("Either image_bytes or text_prompt is required")

    try:
        genai.configure(api_key=api_key)
        generative_model = genai.GenerativeModel(model)

        if image_bytes:
            # Existing vision logic
            image = Image.open(io.BytesIO(image_bytes))
            response = generative_model.generate_content([prompt, image])
        else:
            # NEW: Text-only recipe generation
            enhanced_prompt = f"{prompt}\n\nGenerate a recipe for: {text_prompt}"
            response = generative_model.generate_content([enhanced_prompt])

        text = getattr(response, 'text', None)
        if not text:
            raise ProviderError('empty_response', 'AI did not return a response. Please try again.', hint='Try another photo or wait a moment before retrying.')
        return text, {'model': model}
    except ProviderError:
        raise
    except Exception as exc:  # noqa: BLE001
        raise ProviderError(
            code='gemini_error',
            message='Gemini could not process the request.',
            hint='Verify the API key and quota in Google AI Studio.',
            debug=str(exc),
        ) from exc


def generate_with_openai(
    *,
    image_bytes: bytes | None = None,
    text_prompt: str | None = None,
    prompt: str,
    model: str,
    api_key: str,
    mime_type: str | None = None
) -> Tuple[str, Dict[str, Any]]:
    """
    Generate recipe using OpenAI.
    Uses responses.create API (NOT chat.completions.create).
    """
    if not image_bytes and not text_prompt:
        raise ValueError("Either image_bytes or text_prompt is required")

    try:
        client = OpenAI(api_key=api_key)

        if image_bytes:
            # Existing vision logic - Use responses.create
            base64_image = base64.b64encode(image_bytes).decode('utf-8')
            response = client.responses.create(
                model=model,
                input=[
                    {
                        'role': 'user',
                        'content': [
                            {'type': 'input_text', 'text': prompt},
                            {'type': 'input_image', 'image': {'base64': base64_image}},
                        ],
                    }
                ],
                max_output_tokens=1024,
            )
        else:
            # NEW: Text-only recipe generation
            enhanced_prompt = f"{prompt}\n\nGenerate a recipe for: {text_prompt}"
            response = client.responses.create(
                model=model,
                input=[
                    {
                        'role': 'user',
                        'content': [
                            {'type': 'input_text', 'text': enhanced_prompt},
                        ],
                    }
                ],
                max_output_tokens=1024,
            )

        text = getattr(response, 'output_text', None) or extract_openai_text(response)
        if not text:
            raise ProviderError('empty_response', 'AI did not return a response. Please try again.', hint='Try another image or retry with a different model.')
        return text, {'model': model}
    except ProviderError:
        raise
    except Exception as exc:  # noqa: BLE001
        raise ProviderError(
            code='openai_error',
            message='OpenAI could not process the request.',
            hint='Check the model availability and your API key permissions.',
            debug=str(exc),
        ) from exc


def generate_with_anthropic(
    *,
    image_bytes: bytes | None = None,
    text_prompt: str | None = None,
    prompt: str,
    model: str,
    api_key: str,
    mime_type: str | None = None
) -> Tuple[str, Dict[str, Any]]:
    """
    Generate recipe using Anthropic Claude.
    """
    if not image_bytes and not text_prompt:
        raise ValueError("Either image_bytes or text_prompt is required")

    try:
        client = Anthropic(api_key=api_key)

        content_parts = []

        if image_bytes:
            # Existing vision logic
            base64_image = base64.b64encode(image_bytes).decode('utf-8')
            content_parts.append({
                'type': 'image',
                'source': {
                    'type': 'base64',
                    'media_type': mime_type or 'image/jpeg',
                    'data': base64_image,
                },
            })
            content_parts.append({'type': 'text', 'text': prompt})
        else:
            # NEW: Text-only recipe generation
            enhanced_prompt = f"{prompt}\n\nGenerate a recipe for: {text_prompt}"
            content_parts.append({'type': 'text', 'text': enhanced_prompt})

        response = client.messages.create(
            model=model,
            max_tokens=4096,
            messages=[{'role': 'user', 'content': content_parts}],
        )

        text = extract_anthropic_text(response)
        if not text:
            raise ProviderError('empty_response', 'AI did not return a response. Please try again.', hint='Try switching to another Claude model or re-upload the image.')
        return text, {'model': model}
    except ProviderError:
        raise
    except Exception as exc:  # noqa: BLE001
        raise ProviderError(
            code='anthropic_error',
            message='Anthropic could not process the request.',
            hint='Verify your Claude API key and model access.',
            debug=str(exc),
        ) from exc


def extract_openai_text(response: Any) -> str:
    try:
        outputs = getattr(response, 'outputs', [])
        if outputs:
            first = outputs[0]
            if hasattr(first, 'content'):
                for item in first.content:
                    text = getattr(item, 'text', None)
                    if text:
                        return text
        return ''
    except Exception:  # noqa: BLE001
        return ''


def extract_anthropic_text(response: Any) -> str:
    try:
        parts = getattr(response, 'content', [])
        texts = [part.text for part in parts if getattr(part, 'type', None) == 'text']
        return '\n'.join(texts).strip()
    except Exception:  # noqa: BLE001
        return ''
