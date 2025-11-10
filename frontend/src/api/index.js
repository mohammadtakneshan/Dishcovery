const API_BASE = "http://localhost:5001";

export async function generateRecipeFromImage({ uri, name, file } = {}) {
  const formData = new FormData();

  if (file instanceof File) {
    formData.append("file", file, file.name);
  } else if (uri && typeof uri === "string") {
    try {
      const res = await fetch(uri);
      const blob = await res.blob();
      formData.append("file", blob, name || "photo.jpg");
    } catch (err) {
      console.error("Error processing image from URI:", err);
      throw new Error("Failed to process image. Please try another photo.");
    }
  } else {
    throw new Error("No image provided. Please select a photo.");
  }

  try {
    const resp = await fetch(`${API_BASE}/api/generate-recipe`, {
      method: "POST",
      body: formData,
    });

    if (!resp.ok) {
      let errorMessage = `Server error (${resp.status})`;
      
      try {
        const errorData = await resp.json();
        errorMessage = errorData.error || errorMessage;
      } catch {
        const text = await resp.text().catch(() => "");
        if (text) errorMessage = text;
      }

      // Handle specific error codes
      if (resp.status === 400) {
        throw new Error(errorMessage);
      } else if (resp.status === 429) {
        throw new Error("Too many requests. Please wait a moment and try again.");
      } else if (resp.status >= 500) {
        throw new Error("Server is experiencing issues. Please try again later.");
      }
      
      throw new Error(errorMessage);
    }

    const data = await resp.json();
    
    if (!data.success) {
      throw new Error(data.error || "Failed to generate recipe");
    }

    return data.recipe;
  } catch (error) {
    if (error.message) {
      throw error;
    }
    throw new Error("Network error. Please check your connection and try again.");
  }
}
