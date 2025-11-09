const API_BASE = "http://localhost:5001";

export async function generateRecipeFromImage({ uri, name, type, file } = {}) {
  const formData = new FormData();

  if (file instanceof File) {
    formData.append("file", file, file.name);
  } else if (uri && typeof uri === "string") {
    try {
      const res = await fetch(uri);
      const blob = await res.blob();
      formData.append("file", blob, name || "photo.jpg");
    } catch (err) {
      formData.append("file", uri);
    }
  } else {
    throw new Error("No image provided");
  }

  const resp = await fetch(`${API_BASE}/api/generate-recipe`, {
    method: "POST",
    body: formData,
  });

  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    throw new Error(`Server error: ${resp.status} ${text}`);
  }

  return resp.json();
}
