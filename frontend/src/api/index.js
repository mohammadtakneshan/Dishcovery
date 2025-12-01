import "../global-overrides.css";

const DEFAULT_API_BASE = sanitizeBaseUrl(
  process.env.EXPO_PUBLIC_API_URL || "http://localhost:5001"
);

export class ApiError extends Error {
  constructor(message, { code, hint, status, cause } = {}) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.hint = hint;
    this.status = status;
    this.cause = cause;
  }
}

export async function generateRecipeFromImage(
  { uri, name, file } = {},
  options = {}
) {
  const formData = new FormData();

  if (file instanceof File) {
    formData.append("file", file, file.name);
  } else if (uri && typeof uri === "string") {
    const fileName = name || inferFileNameFromUri(uri);
    const fileType = inferMimeType(fileName);

    formData.append("file", {
      uri,
      type: fileType,
      name: fileName,
    });
  } else {
    throw new ApiError("No image provided. Please select a photo.", {
      code: "image_missing",
      status: 400,
    });
  }

  const baseUrl = sanitizeBaseUrl(options.baseUrl) || DEFAULT_API_BASE;
  if (!baseUrl) {
    throw new ApiError("API base URL is not configured.", {
      code: "api_base_missing",
    });
  }

  appendIfValue(formData, "provider", options.provider);
  appendIfValue(formData, "api_key", options.apiKey);
  appendIfValue(formData, "model", options.model);
  appendIfValue(formData, "language", options.language);

  formData.append("client", "frontend");

  let response;
  try {
    const headers = {};

    // Add Vercel Protection Bypass if available
    const bypassToken = process.env.EXPO_PUBLIC_VERCEL_BYPASS;
    if (bypassToken) {
      headers["x-vercel-protection-bypass"] = bypassToken;
    }

    response = await fetch(`${baseUrl}/api/generate-recipe`, {
      method: "POST",
      body: formData,
      headers: headers,
    });
  } catch (networkError) {
    throw new ApiError(
      "Network error. Please check your connection and try again.",
      {
        code: "network_error",
        cause: networkError,
      }
    );
  }

  const payload = await parseResponse(response);

  if (!response.ok) {
    const errorInfo = payload?.error || {};
    throw new ApiError(errorInfo.message || "Server rejected the request.", {
      code: errorInfo.code || `http_${response.status}`,
      hint: errorInfo.hint,
      status: response.status,
    });
  }

  if (!payload?.success) {
    const errorInfo = payload?.error || {};
    throw new ApiError(errorInfo.message || "Recipe generation failed.", {
      code: errorInfo.code || "generation_failed",
      hint: errorInfo.hint,
      status: response.status,
    });
  }

  return payload;
}

/**
 * Validates API key and fetches available models from the provider.
 *
 * @param {string} baseUrl - Backend API base URL
 * @param {string} provider - Provider ID (openai, anthropic, gemini)
 * @param {string} apiKey - API key to validate
 * @returns {Promise<{valid: boolean, models: Array, error?: string}>}
 */
export async function validateApiKey(baseUrl, provider, apiKey) {
  const sanitizedBaseUrl = sanitizeBaseUrl(baseUrl) || DEFAULT_API_BASE;

  if (!sanitizedBaseUrl) {
    throw new ApiError("API base URL is not configured.", {
      code: "api_base_missing",
    });
  }

  if (!provider || !apiKey) {
    throw new ApiError("Provider and API key are required for validation.", {
      code: "missing_parameters",
      status: 400,
    });
  }

  let response;
  try {
    const headers = {
      "Content-Type": "application/json",
    };

    // Add Vercel Protection Bypass if available
    const bypassToken = process.env.EXPO_PUBLIC_VERCEL_BYPASS;
    if (bypassToken) {
      headers["x-vercel-protection-bypass"] = bypassToken;
    }

    response = await fetch(`${sanitizedBaseUrl}/api/validate-key`, {
      method: "POST",
      headers: headers,
      body: JSON.stringify({ provider, apiKey }),
    });
  } catch (networkError) {
    throw new ApiError(
      "Network error. Please check your connection and try again.",
      {
        code: "network_error",
        cause: networkError,
      }
    );
  }

  const payload = await parseResponse(response);

  if (!response.ok) {
    // Return the validation result even for 401 (invalid key)
    if (response.status === 401 && payload?.valid === false) {
      return payload;
    }

    // Handle other errors
    const errorInfo = payload?.error || {};
    throw new ApiError(errorInfo.message || "Validation request failed.", {
      code: errorInfo.code || `http_${response.status}`,
      hint: errorInfo.hint,
      status: response.status,
    });
  }

  return payload;
}

function appendIfValue(formData, key, value) {
  if (value !== undefined && value !== null && String(value).trim() !== "") {
    formData.append(key, value);
  }
}

async function parseResponse(response) {
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
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
  if (!value || typeof value !== "string") {
    return "";
  }
  return value.replace(/\/$/, "");
}

function inferFileNameFromUri(uri) {
  try {
    const url = new URL(uri);
    const parts = url.pathname.split("/").filter(Boolean);
    if (parts.length > 0) {
      return parts[parts.length - 1];
    }
  } catch (error) {
    // ignore parsing errors and fall through
  }
  return "photo.jpg";
}

function inferMimeType(fileName) {
  if (fileName.endsWith(".png")) return "image/png";
  if (fileName.endsWith(".webp")) return "image/webp";
  if (fileName.endsWith(".gif")) return "image/gif";
  if (fileName.endsWith(".jpeg")) return "image/jpeg";
  return "image/jpeg";
}
