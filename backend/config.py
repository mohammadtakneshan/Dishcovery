import os
from dotenv import load_dotenv
from typing import ClassVar

load_dotenv()

class Config:
    """Application configuration"""
    FLASK_ENV = os.getenv('FLASK_ENV', 'development')
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    
    # AI API Keys
    OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
    GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
    ANTHROPIC_API_KEY = os.getenv('ANTHROPIC_API_KEY')

    PROVIDER_KEY_MAP = {
        'gemini': 'GEMINI_API_KEY',
        'openai': 'OPENAI_API_KEY',
        'anthropic': 'ANTHROPIC_API_KEY',
    }

    DEFAULT_PROVIDER = os.getenv('DEFAULT_PROVIDER', 'gemini')
    DEFAULT_MODELS = {
        'gemini': os.getenv('GEMINI_DEFAULT_MODEL', 'gemini-2.5-flash'),
        'openai': os.getenv('OPENAI_DEFAULT_MODEL', 'gpt-4o-mini'),
        'anthropic': os.getenv('ANTHROPIC_DEFAULT_MODEL', 'claude-3-sonnet-20240229'),
    }
    
    # CORS Settings
    ALLOWED_ORIGINS = os.getenv('ALLOWED_ORIGINS', '*').split(',')
    
    # API Settings
    MAX_INGREDIENTS = int(os.getenv('MAX_INGREDIENTS', 10))
    DEFAULT_LANGUAGE = os.getenv('DEFAULT_LANGUAGE', 'en')
    
    # File Upload Settings
    MAX_CONTENT_LENGTH = int(os.getenv('MAX_CONTENT_LENGTH', 16 * 1024 * 1024))  # 16MB default
    ALLOWED_EXTENSIONS: ClassVar[frozenset[str]] = frozenset({'png', 'jpg', 'jpeg', 'gif', 'webp'})

    @classmethod
    def get_api_key_for(cls, provider: str | None) -> str | None:
        """Retrieve the API key for the specified provider from environment variables.

        Args:
            provider: Provider name ('gemini', 'openai', or 'anthropic')

        Returns:
            API key string from environment, or None if provider is invalid or key not set
        """
        if not provider:
            return None
        env_attr = cls.PROVIDER_KEY_MAP.get(provider.lower())
        if not env_attr:
            return None
        return getattr(cls, env_attr, None)

    @classmethod
    def get_default_model_for(cls, provider: str | None) -> str | None:
        """Get the default model identifier for the specified provider.

        Args:
            provider: Provider name ('gemini', 'openai', or 'anthropic')

        Returns:
            Model identifier string, or None if provider is invalid
        """
        if not provider:
            return None
        return cls.DEFAULT_MODELS.get(provider.lower())
