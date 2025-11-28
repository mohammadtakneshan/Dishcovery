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

/**
 * Upload an image and request recipe generation from the server.
 * @param {{uri?: string, name?: string, file?: File}} [image] - Image input; supply a File via `file` or a URI via `uri`. `name` overrides the inferred filename when provided.
 * @param {{baseUrl?: string, provider?: string, apiKey?: string, model?: string, language?: string}} [options] - Optional request settings.
 * @param {string} [options.baseUrl] - Custom API base URL; trailing slash is removed. If not set, DEFAULT_API_BASE is used.
 * @param {string} [options.provider] - Provider identifier to include with the request.
 * @param {string} [options.apiKey] - API key to include with the request.
 * @param {string} [options.model] - Model identifier to include with the request.
 * @param {string} [options.language] - Language code to include with the request.
 * @returns {Promise<any>} The parsed response payload returned by the generate-recipe endpoint.
 * @throws {ApiError} If no image is provided, the API base URL is not configured, a network error occurs, or the server returns an error or unsuccessful payload.
 */
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
 * Appends a key/value pair to a FormData instance when the value is not undefined, not null, and not an empty string.
 * @param {FormData} formData - The FormData instance to append the field to.
 * @param {string} key - The form field name.
 * @param {*} value - The value to append; its string representation is used to determine emptiness.
 */
function appendIfValue(formData, key, value) {
  if (value !== undefined && value !== null && String(value).trim() !== "") {
    formData.append(key, value);
  }
}

/**
 * Parse an HTTP Response body into JSON or a standardized error object.
 * @param {Response} response - The Response object whose body should be parsed.
 * @returns {any|null|{success: false, error: {message: string}}} Parsed JSON if the response indicates JSON or the text can be parsed as JSON; `null` if the body is empty; otherwise an object `{ success: false, error: { message } }` with the raw text.
 */
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

/**
 * Remove a trailing slash from a base URL string and return an empty string for falsy or non-string input.
 * @param {string} value - The base URL to sanitize.
 * @returns {string} The input with any trailing slash removed, or an empty string if the input is falsy or not a string.
 */
function sanitizeBaseUrl(value) {
  if (!value || typeof value !== "string") {
    return "";
  }
  return value.replace(/\/$/, "");
}

/**
 * Derives a file name from a URI's last path segment, or returns "photo.jpg" if one cannot be determined.
 * @param {string} uri - The URI to extract the file name from.
 * @returns {string} The extracted file name, or "photo.jpg" if extraction fails.
 */
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

/**
 * Determine the image MIME type based on a file name's extension.
 * @param {string} fileName - The file name or path from which to infer the MIME type.
 * @returns {string} The MIME type inferred from the file extension (`image/png`, `image/webp`, `image/gif`, `image/jpeg`).
 */
function inferMimeType(fileName) {
  if (fileName.endsWith(".png")) return "image/png";
  if (fileName.endsWith(".webp")) return "image/webp";
  if (fileName.endsWith(".gif")) return "image/gif";
  if (fileName.endsWith(".jpeg")) return "image/jpeg";
  return "image/jpeg";
}