"""Provider API key validation and model listing."""

import requests
from typing import Dict, List


def _get_user_friendly_error(exception: requests.RequestException) -> str:
    """
    Convert a requests exception to a user-friendly error message.
    
    Avoids exposing sensitive or overly technical information from
    the underlying exception.
    """
    if isinstance(exception, requests.exceptions.Timeout):
        return "Request timed out. Please try again."
    elif isinstance(exception, requests.exceptions.ConnectionError):
        return "Unable to connect to the API. Please check your network connection."
    elif isinstance(exception, requests.exceptions.HTTPError):
        return "The API returned an error. Please try again later."
    else:
        return "Unable to validate API key. Please check your network connection and try again."


def validate_openai_key(api_key: str) -> Dict:
    """
    Validates OpenAI API key and fetches available models.

    Endpoint: GET https://api.openai.com/v1/models
    Headers: Authorization: Bearer <api_key>

    Returns:
        {
            "valid": bool,
            "models": [{"id": "gpt-4o", "name": "GPT-4o"}, ...],
            "error": str (optional)
        }
    """
    try:
        response = requests.get(
            "https://api.openai.com/v1/models",
            headers={"Authorization": f"Bearer {api_key}"},
            timeout=10
        )

        if response.status_code == 401:
            return {"valid": False, "error": "Invalid API key"}

        response.raise_for_status()
        data = response.json()

        # Filter for VISION-CAPABLE models only (exclude gpt-3.5, o1, o3)
        vision_models = [
            m for m in data.get("data", [])
            if m["id"].startswith(("gpt-4o", "gpt-4-turbo", "gpt-4-vision"))
        ]

        # Convert to friendly names
        models = [
            {"id": m["id"], "name": format_model_name(m["id"])}
            for m in vision_models
        ]

        # Sort by recommendation priority
        models = sort_openai_models(models)

        return {"valid": True, "models": models}

    except requests.RequestException as e:
        return {"valid": False, "error": _get_user_friendly_error(e)}


def validate_anthropic_key(api_key: str) -> Dict:
    """
    Validates Anthropic API key and fetches available models.

    Endpoint: GET https://api.anthropic.com/v1/models
    Headers:
        x-api-key: <api_key>
        anthropic-version: 2023-06-01

    Returns:
        {
            "valid": bool,
            "models": [{"id": "claude-sonnet-4-20250514", "name": "Claude Sonnet 4"}, ...],
            "error": str (optional)
        }
    """
    try:
        response = requests.get(
            "https://api.anthropic.com/v1/models",
            headers={
                "x-api-key": api_key,
                "anthropic-version": "2023-06-01"
            },
            timeout=10
        )

        if response.status_code == 401:
            return {"valid": False, "error": "Invalid API key"}

        response.raise_for_status()
        data = response.json()

        # All models from Anthropic API are Claude models (all have vision)
        models = [
            {"id": m["id"], "name": m.get("display_name", format_model_name(m["id"]))}
            for m in data.get("data", [])
        ]

        # Sort by recommendation priority
        models = sort_anthropic_models(models)

        return {"valid": True, "models": models}

    except requests.RequestException as e:
        return {"valid": False, "error": _get_user_friendly_error(e)}


def validate_gemini_key(api_key: str) -> Dict:
    """
    Validates Gemini API key and fetches available models.

    Endpoint: GET https://generativelanguage.googleapis.com/v1beta/models?key=<api_key>

    Returns:
        {
            "valid": bool,
            "models": [{"id": "gemini-2.0-flash-exp", "name": "Gemini 2.0 Flash Exp"}, ...],
            "error": str (optional)
        }
    """
    try:
        # SECURITY NOTE:
        # The Gemini API key is passed directly in the URL query parameter as required by Google AI Studio API.
        # This can expose the API key in server logs, browser history, proxy logs, and referrer headers.
        #
        # For production with Google Cloud Vertex AI, consider using OAuth2 Bearer tokens:
        # - Obtain access token via google-auth (ADC or service account)
        # - Send as: Authorization: Bearer <ACCESS_TOKEN>
        # - Add x-goog-user-project header for Cloud resources
        # - Use endpoint: https://generativelanguage.googleapis.com/v1beta/models
        # - Handle token refresh failures appropriately
        #
        # Current implementation uses AI Studio API which only supports API keys.
        response = requests.get(
            f"https://generativelanguage.googleapis.com/v1beta/models?key={api_key}",
            timeout=10
        )

        if response.status_code == 400:
            return {"valid": False, "error": "Invalid API key"}

        response.raise_for_status()
        data = response.json()

        # Filter for models that support generateContent and are Gemini 1.5+/2.0+
        generation_models = [
            m for m in data.get("models", [])
            if "generateContent" in m.get("supportedGenerationMethods", [])
            and ("gemini-1.5" in m["name"] or "gemini-2" in m["name"])
        ]

        # Convert to friendly names
        models = [
            {
                "id": m["name"].replace("models/", ""),
                "name": format_model_name(m["name"].replace("models/", ""))
            }
            for m in generation_models
        ]

        # Sort by recommendation priority
        models = sort_gemini_models(models)

        return {"valid": True, "models": models}

    except requests.RequestException as e:
        return {"valid": False, "error": _get_user_friendly_error(e)}


def format_model_name(model_id: str) -> str:
    """
    Convert model ID to human-readable name.

    Examples:
        gpt-4o → GPT-4o
        claude-sonnet-4-20250514 → Claude Sonnet 4 20250514
        gemini-2.0-flash-exp → Gemini 2.0 Flash Exp
    """
    # Handle special cases
    if "gpt" in model_id.lower():
        # Keep GPT uppercase, handle vision/turbo specially
        parts = model_id.split("-")
        formatted = []
        for p in parts:
            if p.lower() in ["gpt", "4o", "4", "3.5"]:
                formatted.append(p.upper())
            else:
                formatted.append(p.capitalize())
        return " ".join(formatted)

    # For Claude and Gemini, capitalize each word
    parts = model_id.replace("-", " ").replace("_", " ").split()
    return " ".join(p.capitalize() if len(p) > 2 else p.upper() for p in parts)


def sort_openai_models(models: List[Dict]) -> List[Dict]:
    """
    Sort OpenAI models by recommendation priority.
    Priority: gpt-4o > gpt-4-turbo > gpt-4-vision
    """
    priority_map = {
        "gpt-4o": 0,
        "gpt-4o-mini": 1,
        "gpt-4-turbo": 2,
        "gpt-4-vision": 3,
    }

    def get_priority(model: Dict) -> int:
        model_id = model["id"]
        # Check for exact matches first
        if model_id in priority_map:
            return priority_map[model_id]
        # Check for prefix matches
        for prefix, priority in priority_map.items():
            if model_id.startswith(prefix):
                return priority + 0.1  # Slight offset for variants
        return 100  # Unknown models go last

    return sorted(models, key=get_priority)


def sort_anthropic_models(models: List[Dict]) -> List[Dict]:
    """
    Sort Anthropic models by recommendation priority.
    Priority: Latest Sonnet > Latest Opus > Haiku (by date in model ID)
    """
    def get_priority(model: Dict) -> tuple:
        model_id = model["id"]

        # Extract model type (sonnet, opus, haiku)
        if "sonnet" in model_id.lower():
            type_priority = 0
        elif "opus" in model_id.lower():
            type_priority = 1
        elif "haiku" in model_id.lower():
            type_priority = 2
        else:
            type_priority = 3

        # Extract date (if present) - newer is better
        # Model IDs like: claude-sonnet-4-20250514
        parts = model_id.split("-")
        date_str = "0"
        for part in parts:
            if part.isdigit() and len(part) == 8:  # Date format: YYYYMMDD
                date_str = part
                break

        # Return tuple: (type_priority, -date) to sort by type first, then newest first
        return (type_priority, -int(date_str))

    return sorted(models, key=get_priority)


def sort_gemini_models(models: List[Dict]) -> List[Dict]:
    """
    Sort Gemini models by recommendation priority.
    Priority: gemini-2.0-flash-exp > gemini-2.5-pro > gemini-1.5-pro
    """
    priority_map = {
        "gemini-2.0-flash-exp": 0,
        "gemini-2.5-pro": 1,
        "gemini-2.0-flash": 2,
        "gemini-1.5-pro": 3,
        "gemini-1.5-flash": 4,
    }

    def get_priority(model: Dict) -> int:
        model_id = model["id"]
        # Check for exact matches first
        if model_id in priority_map:
            return priority_map[model_id]
        # Check for prefix matches
        for prefix, priority in priority_map.items():
            if model_id.startswith(prefix):
                return priority + 0.1  # Slight offset for variants
        # 2.x models before 1.x models
        if "gemini-2" in model_id:
            return 50
        return 100  # Unknown models go last

    return sorted(models, key=get_priority)
