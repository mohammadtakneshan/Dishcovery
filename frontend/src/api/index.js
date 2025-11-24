const DEFAULT_API_BASE = sanitizeBaseUrl(
  process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5001',
);

export class ApiError extends Error {
  constructor(message, { code, hint, status, cause } = {}) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.hint = hint;
    this.status = status;
    this.cause = cause;
  }
}

export async function generateFoodImage(prompt, options = {}) {
  const baseUrl = sanitizeBaseUrl(options.baseUrl) || DEFAULT_API_BASE;
  if (!baseUrl) {
    throw new ApiError('API base URL is not configured.', {
      code: 'api_base_missing',
    });
  }

  const formData = new FormData();
  formData.append('prompt', prompt);

  if (options.provider) formData.append('provider', options.provider);
  if (options.apiKey) formData.append('api_key', options.apiKey);
  if (options.size) formData.append('size', options.size);

  try {
    const headers = {};

    // Add Vercel Protection Bypass if available
    const bypassToken = process.env.EXPO_PUBLIC_VERCEL_BYPASS;
    if (bypassToken) {
      headers['x-vercel-protection-bypass'] = bypassToken;
    }

    const response = await fetch(`${baseUrl}/api/generate-image`, {
      method: 'POST',
      body: formData,
      headers: headers,
    });

    const data = await response.json();

    if (!response.ok) {
      const error = data.error || {};
      throw new ApiError(error.message || 'Failed to generate image', {
        code: error.code || 'image_generation_failed',
        hint: error.hint,
        status: response.status,
      });
    }

    return data; // { success, imageUrl, meta }

  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError('Could not connect to server', {
      code: 'network_error',
      hint: 'Check your internet connection and try again',
      status: 0,
      cause: error,
    });
  }
}

export async function generateRecipeFromImage(imageData = null, options = {}) {
  /**
   * Generate recipe from image OR text prompt.
   *
   * @param {Object|null} imageData - Image data object { uri, name, file } or null for text-only
   * @param {Object} options - Additional parameters including textPrompt, imageUrl, provider, etc.
   */

  // Relaxed validation - allow null imageData if textPrompt or imageUrl provided
  const hasImage = imageData && (imageData.file || imageData.uri);
  const hasTextPrompt = Boolean(options.textPrompt);
  const hasImageUrl = Boolean(options.imageUrl);

  if (!hasImage && !hasTextPrompt && !hasImageUrl) {
    throw new ApiError('Either an image or text prompt is required', {
      code: 'missing_input',
      hint: 'Upload an image or enter a text description',
      status: 400,
    });
  }

  const formData = new FormData();

  // Append image if provided
  if (hasImage) {
    if (imageData.file instanceof File) {
      formData.append('file', imageData.file, imageData.file.name);
    } else if (imageData.uri && typeof imageData.uri === 'string') {
      const fileName = imageData.name || inferFileNameFromUri(imageData.uri);
      const fileType = inferMimeType(fileName);

      formData.append('file', {
        uri: imageData.uri,
        type: fileType,
        name: fileName,
      });
    }
  }

  // Append text prompt if provided
  if (hasTextPrompt) {
    formData.append('text_prompt', options.textPrompt);
  }

  // Append image URL if provided
  if (hasImageUrl) {
    formData.append('image_url', options.imageUrl);
  }

  const baseUrl = sanitizeBaseUrl(options.baseUrl) || DEFAULT_API_BASE;
  if (!baseUrl) {
    throw new ApiError('API base URL is not configured.', {
      code: 'api_base_missing',
    });
  }

  appendIfValue(formData, 'provider', options.provider);
  appendIfValue(formData, 'api_key', options.apiKey);
  appendIfValue(formData, 'model', options.model);
  appendIfValue(formData, 'language', options.language);

  formData.append('client', 'frontend');

  let response;
  try {
    const headers = {};

    // Add Vercel Protection Bypass if available
    const bypassToken = process.env.EXPO_PUBLIC_VERCEL_BYPASS;
    if (bypassToken) {
      headers['x-vercel-protection-bypass'] = bypassToken;
    }

    response = await fetch(`${baseUrl}/api/generate-recipe`, {
      method: 'POST',
      body: formData,
      headers: headers,
    });
  } catch (networkError) {
    throw new ApiError('Network error. Please check your connection and try again.', {
      code: 'network_error',
      cause: networkError,
    });
  }

  const payload = await parseResponse(response);

  if (!response.ok) {
    const errorInfo = payload?.error || {};
    throw new ApiError(
      errorInfo.message || 'Server rejected the request.',
      {
        code: errorInfo.code || `http_${response.status}`,
        hint: errorInfo.hint,
        status: response.status,
      },
    );
  }

  if (!payload?.success) {
    const errorInfo = payload?.error || {};
    throw new ApiError(
      errorInfo.message || 'Recipe generation failed.',
      {
        code: errorInfo.code || 'generation_failed',
        hint: errorInfo.hint,
        status: response.status,
      },
    );
  }

  return payload; // { success, recipe, meta, warning }
}

function appendIfValue(formData, key, value) {
  if (value !== undefined && value !== null && String(value).trim() !== '') {
    formData.append(key, value);
  }
}

async function parseResponse(response) {
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return response.json();
  }

  const text = await response.text();
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    return { success: false, error: { message: text } };
  }
}

function sanitizeBaseUrl(value) {
  if (!value || typeof value !== 'string') {
    return '';
  }
  return value.replace(/\/$/, '');
}

function inferFileNameFromUri(uri) {
  try {
    const url = new URL(uri);
    const parts = url.pathname.split('/').filter(Boolean);
    if (parts.length > 0) {
      return parts[parts.length - 1];
    }
  } catch (error) {
    // ignore parsing errors and fall through
  }
  return 'photo.jpg';
}

function inferMimeType(fileName) {
  if (fileName.endsWith('.png')) return 'image/png';
  if (fileName.endsWith('.webp')) return 'image/webp';
  if (fileName.endsWith('.gif')) return 'image/gif';
  if (fileName.endsWith('.jpeg')) return 'image/jpeg';
  return 'image/jpeg';
}
