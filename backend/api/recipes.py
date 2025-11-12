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
    """Generate recipe from a food image using the configured AI provider."""
    try:
        file = request.files.get('file')
        if not file:
            return problem_response(
                code='missing_file',
                message='No image file provided. Please upload a food photo.',
                hint='Choose a PNG, JPG, JPEG, GIF, or WEBP image.',
            )

        if not file.filename:
            return problem_response(
                code='empty_filename',
                message='Empty filename. Please select a valid image.',
            )

        extension = file.filename.rsplit('.', 1)[1].lower() if '.' in file.filename else ''
        if extension not in Config.ALLOWED_EXTENSIONS:
            return problem_response(
                code='unsupported_file_type',
                message=f'Invalid file type. Allowed: {", ".join(sorted(Config.ALLOWED_EXTENSIONS))}',
            )

        mime_type = file.mimetype or mimetypes.guess_type(file.filename)[0] or 'image/jpeg'

        image_bytes = file.read()
        if not image_bytes:
            return problem_response(
                code='empty_image',
                message='Empty image file.',
            )

        try:
            candidate = Image.open(io.BytesIO(image_bytes))
            candidate.verify()
        except UnidentifiedImageError as validation_error:
            logger.info("Invalid image upload: %s", validation_error)
            return problem_response(
                code='invalid_image',
                message='Invalid or corrupted image file.',
                hint='Try exporting the photo again as PNG or JPG.',
            )
        except Exception as validation_error:  # noqa: BLE001
            logger.warning("Image validation failed: %s", validation_error)
            return problem_response(
                code='invalid_image',
                message='Invalid or corrupted image file.',
            )

        language = request.form.get('language', Config.DEFAULT_LANGUAGE)
        dietary_restrictions = request.form.get('dietary_restrictions', '')
        cuisine_preference = request.form.get('cuisine_preference', '')

        provider = (request.form.get('provider') or Config.DEFAULT_PROVIDER).lower()
        provider_config = get_provider_config(provider)
        if not provider_config:
            return problem_response(
                code='unsupported_provider',
                message=f'Provider "{provider}" is not supported.',
                hint='Select one of: gemini, openai, anthropic.',
            )

        api_key = (request.form.get('api_key') or '').strip() or Config.get_api_key_for(provider)
        if not api_key:
            return problem_response(
                code='missing_api_key',
                message='API key is required for the selected provider.',
                hint=provider_config['key_hint'],
            )

        requested_model = (request.form.get('model') or '').strip()
        default_model = Config.get_default_model_for(provider) or provider_config['default_model']
        model = requested_model or default_model

        prompt = build_prompt(language, dietary_restrictions, cuisine_preference)

        try:
            raw_text, provider_meta = provider_config['handler'](
                image_bytes=image_bytes,
                prompt=prompt,
                model=model,
                api_key=api_key,
                mime_type=mime_type,
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

        recipe, warning = parse_recipe(raw_text)

        response_payload: Dict[str, Any] = {
            'success': True,
            'recipe': recipe,
            'meta': {
                'provider': provider,
                'provider_label': provider_config['label'],
                'model': provider_meta.get('model', model),
                'language': language,
                'dietary_restrictions': dietary_restrictions or None,
                'cuisine_preference': cuisine_preference or None,
            },
        }

        if warning:
            response_payload['warning'] = warning

        if Config.FLASK_ENV.lower() in {'development', 'debug'}:
            response_payload['debug'] = {
                'raw_response': raw_text,
            }

        return jsonify(response_payload)

    except Exception as exc:  # noqa: BLE001
        logger.error('Server error: %s', exc)
        logger.debug(traceback.format_exc())
        return problem_response(
            code='server_error',
            message='Server error. Please try again later.',
            status=500,
        )

@api_bp.route('/health', methods=['GET'])
def health_check():
    """API health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'Dishcovery API',
        'version': '1.0.0'
    })


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


def generate_with_gemini(*, image_bytes: bytes, prompt: str, model: str, api_key: str, mime_type: str) -> Tuple[str, Dict[str, Any]]:
    try:
        genai.configure(api_key=api_key)
        image = Image.open(io.BytesIO(image_bytes))
        generative_model = genai.GenerativeModel(model)
        response = generative_model.generate_content([prompt, image])
        text = getattr(response, 'text', None)
        if not text:
            raise ProviderError('empty_response', 'AI did not return a response. Please try again.', hint='Try another photo or wait a moment before retrying.')
        return text, {'model': model}
    except ProviderError:
        raise
    except Exception as exc:  # noqa: BLE001
        raise ProviderError(
            code='gemini_error',
            message='Gemini could not process the image.',
            hint='Verify the API key and quota in Google AI Studio.',
            debug=str(exc),
        ) from exc


def generate_with_openai(*, image_bytes: bytes, prompt: str, model: str, api_key: str, mime_type: str) -> Tuple[str, Dict[str, Any]]:
    try:
        client = OpenAI(api_key=api_key)
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
        text = getattr(response, 'output_text', None) or extract_openai_text(response)
        if not text:
            raise ProviderError('empty_response', 'AI did not return a response. Please try again.', hint='Try another image or retry with a different model.')
        return text, {'model': model}
    except ProviderError:
        raise
    except Exception as exc:  # noqa: BLE001
        raise ProviderError(
            code='openai_error',
            message='OpenAI could not process the image.',
            hint='Check the model availability and your API key permissions.',
            debug=str(exc),
        ) from exc


def generate_with_anthropic(*, image_bytes: bytes, prompt: str, model: str, api_key: str, mime_type: str) -> Tuple[str, Dict[str, Any]]:
    try:
        client = Anthropic(api_key=api_key)
        base64_image = base64.b64encode(image_bytes).decode('utf-8')
        response = client.messages.create(
            model=model,
            max_output_tokens=1024,
            messages=[
                {
                    'role': 'user',
                    'content': [
                        {'type': 'text', 'text': prompt},
                        {
                            'type': 'image',
                            'source': {
                                'type': 'base64',
                                'media_type': mime_type,
                                'data': base64_image,
                            },
                        },
                    ],
                }
            ],
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
            message='Anthropic could not process the image.',
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
