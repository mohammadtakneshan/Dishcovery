// Use environment variable for API base URL
// Falls back to localhost for development if not set
const API_BASE = process.env.EXPO_PUBLIC_API_URL || "http://localhost:5001";

export async function generateRecipeFromImage({ uri, name, file } = {}) {
  console.log('=== Generate Recipe Called ===');
  console.log('Input:', { uri: uri ? 'present' : 'missing', name, file: file ? 'present' : 'missing' });
  
  const formData = new FormData();

  if (file instanceof File) {
    console.log('Using File object:', file.name, file.size, 'bytes');
    formData.append("file", file, file.name);
  } else if (uri && typeof uri === "string") {
    console.log('Using URI:', uri);
    
    // React Native approach - append URI directly with proper structure
    const fileName = name || "photo.jpg";
    const fileType = fileName.endsWith('.png') ? 'image/png' : 'image/jpeg';
    
    formData.append("file", {
      uri: uri,
      type: fileType,
      name: fileName,
    });
    
    console.log('Appended file:', fileName, fileType);
  } else {
    throw new Error("No image provided. Please select a photo.");
  }

  try {
    const apiUrl = `${API_BASE}/api/generate-recipe`;
    console.log('Calling API:', apiUrl);
    
    const resp = await fetch(apiUrl, {
      method: "POST",
      body: formData,
    });

    console.log('Response status:', resp.status);

    if (!resp.ok) {
      let errorMessage = `Server error (${resp.status})`;
      
      try {
        const errorData = await resp.json();
        console.log('Error data:', errorData);
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
    console.log('Recipe generated successfully');
    
    if (!data.success) {
      throw new Error(data.error || "Failed to generate recipe");
    }

    return data.recipe;
  } catch (error) {
    console.error('API call failed:', error);
    if (error.message) {
      throw error;
    }
    throw new Error("Network error. Please check your connection and try again.");
  }
}
