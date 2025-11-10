# Dishcovery API Documentation

## Base URL

**Development**: `http://localhost:5001`  
**Production**: `https://your-domain.com`

---

## Endpoints

### 1. Health Check

Get API status and version information.

**Endpoint**: `GET /api/health`

**Response**:
```json
{
  "status": "healthy",
  "service": "Dishcovery API",
  "version": "1.0.0"
}
```

---

### 2. Generate Recipe from Image

Upload a food image and receive an AI-generated recipe.

**Endpoint**: `POST /api/generate-recipe`

**Content-Type**: `multipart/form-data`

#### Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `file` | File | ✅ Yes | Image file (PNG, JPG, JPEG, GIF, WEBP) |
| `language` | String | ❌ No | Recipe language (default: 'en') |
| `dietary_restrictions` | String | ❌ No | E.g., "vegetarian", "vegan", "gluten-free" |
| `cuisine_preference` | String | ❌ No | E.g., "Italian", "Thai", "Mexican" |

#### Example Request (cURL)

```bash
curl -X POST http://localhost:5001/api/generate-recipe \
  -F "file=@/path/to/food-photo.jpg" \
  -F "language=en" \
  -F "dietary_restrictions=vegetarian" \
  -F "cuisine_preference=Italian"
```

#### Example Request (JavaScript/Fetch)

```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('language', 'en');
formData.append('dietary_restrictions', 'vegetarian');

const response = await fetch('http://localhost:5001/api/generate-recipe', {
  method: 'POST',
  body: formData
});

const data = await response.json();
```

#### Success Response (200 OK)

```json
{
  "success": true,
  "recipe": {
    "title": "Spicy Thai Basil Stir-Fry",
    "prep_time": "15 min",
    "cook_time": "25 min",
    "servings": "4",
    "ingredients": [
      "200g chicken breast, cubed",
      "150g bell peppers, sliced",
      "100g basil leaves, chopped",
      "2 tbsp soy sauce",
      "1 tsp chili paste"
    ],
    "steps": [
      "Heat oil in a pan, sauté chicken until browned.",
      "Add peppers and stir-fry for 5 minutes.",
      "Mix in basil and soy sauce, cook 2 more minutes.",
      "Finish with chili paste and serve hot."
    ],
    "nutrition": {
      "calories": "420 kcal",
      "protein": "32g",
      "fat": "12g",
      "carbs": "35g"
    },
    "tips": "Serve with jasmine rice and garnish with lime wedges."
  },
  "source": "gemini-vision"
}
```

#### Error Responses

##### 400 Bad Request - No File
```json
{
  "error": "No image file provided. Please upload a food photo."
}
```

##### 400 Bad Request - Invalid File Type
```json
{
  "error": "Invalid file type. Allowed: png, jpg, jpeg, gif, webp"
}
```

##### 400 Bad Request - Corrupted Image
```json
{
  "error": "Invalid or corrupted image file: cannot identify image file"
}
```

##### 429 Too Many Requests
```json
{
  "error": "AI service rate limit reached. Please try again in a few moments."
}
```

##### 500 Internal Server Error
```json
{
  "error": "AI service authentication failed. Please contact support."
}
```

---

## Response Schema

### Recipe Object

| Field | Type | Description |
|-------|------|-------------|
| `title` | String | Name of the dish |
| `prep_time` | String | Preparation time (e.g., "15 min") |
| `cook_time` | String | Cooking time (e.g., "25 min") |
| `servings` | String | Number of servings (e.g., "4") |
| `ingredients` | Array[String] | List of ingredients with measurements |
| `steps` | Array[String] | Step-by-step cooking instructions |
| `nutrition` | Object | Nutritional information per serving |
| `tips` | String | Serving suggestions and variations |

### Nutrition Object

| Field | Type | Example |
|-------|------|---------|
| `calories` | String | "420 kcal" |
| `protein` | String | "32g" |
| `fat` | String | "12g" |
| `carbs` | String | "35g" |

---

## Rate Limits

**Free Tier (Gemini API)**:
- 60 requests per minute
- 1,500 requests per day

Exceeding limits returns a `429 Too Many Requests` response.

---

## File Upload Constraints

| Constraint | Value |
|------------|-------|
| Max file size | 16 MB |
| Allowed formats | PNG, JPG, JPEG, GIF, WEBP |
| Image quality | Minimum 300x300px recommended |

---

## Error Codes

| HTTP Status | Meaning | Action |
|-------------|---------|--------|
| 200 | Success | Parse recipe data |
| 400 | Bad Request | Check input validation errors |
| 429 | Too Many Requests | Wait and retry after delay |
| 500 | Server Error | Contact support or retry later |

---

## Supported Languages

Use the `language` parameter with these codes:

| Code | Language |
|------|----------|
| `en` | English (default) |
| `es` | Spanish |
| `fr` | French |
| `de` | German |
| `it` | Italian |
| `ja` | Japanese |
| `zh` | Chinese |
| `ar` | Arabic |
| `hu` | Hungarian |
| `fa` | Farsi/Persian |
| `vi` | Vietnamese |

---

## Best Practices

### Image Quality Tips
- ✅ Use clear, well-lit photos
- ✅ Focus on a single dish
- ✅ Minimum resolution: 300x300px
- ✅ Avoid heavily filtered images
- ❌ Don't use blurry or dark photos
- ❌ Avoid images with text overlays

### Performance Optimization
- Compress images before upload (< 5MB ideal)
- Cache frequently requested recipes
- Implement retry logic with exponential backoff
- Handle loading states gracefully

### Error Handling
```javascript
try {
  const recipe = await generateRecipe(imageFile);
  displayRecipe(recipe);
} catch (error) {
  if (error.message.includes('rate limit')) {
    // Show retry UI with countdown
    showRetryMessage(60); // seconds
  } else if (error.message.includes('Invalid')) {
    // Show file selection UI again
    showFileError(error.message);
  } else {
    // Generic error
    showErrorMessage('Something went wrong. Please try again.');
  }
}
```

---

## SDK Examples

### Python

```python
import requests

url = "http://localhost:5001/api/generate-recipe"

files = {'file': open('food.jpg', 'rb')}
data = {
    'language': 'en',
    'dietary_restrictions': 'vegan',
    'cuisine_preference': 'Thai'
}

response = requests.post(url, files=files, data=data)
recipe = response.json()

print(f"Recipe: {recipe['recipe']['title']}")
```

### Node.js

```javascript
const FormData = require('form-data');
const fs = require('fs');
const axios = require('axios');

const form = new FormData();
form.append('file', fs.createReadStream('food.jpg'));
form.append('language', 'en');

const response = await axios.post(
  'http://localhost:5001/api/generate-recipe',
  form,
  { headers: form.getHeaders() }
);

console.log('Recipe:', response.data.recipe.title);
```

### React Native

```javascript
const pickAndGenerateRecipe = async () => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 0.8,
  });

  if (!result.cancelled) {
    const formData = new FormData();
    formData.append('file', {
      uri: result.uri,
      type: 'image/jpeg',
      name: 'photo.jpg',
    });

    const response = await fetch('http://localhost:5001/api/generate-recipe', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    setRecipe(data.recipe);
  }
};
```

---

## Changelog

### v1.0.0 (2025-11-09)
- ✨ Initial release
- ✨ Image-based recipe generation with Gemini Vision
- ✨ Multi-language support
- ✨ Dietary restrictions and cuisine preferences
- ✨ Structured JSON output with nutrition facts

---

## Support

- **Issues**: [GitHub Issues](https://github.com/your-org/dishcovery/issues)
- **Email**: support@dishcovery.app
- **Docs**: [https://docs.dishcovery.app](https://docs.dishcovery.app)

---

**API Version**: 1.0.0  
**Last Updated**: 2024-11-09
