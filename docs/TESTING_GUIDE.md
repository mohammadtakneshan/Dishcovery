# Manual Testing Guide

## Prerequisites

1. ✅ Backend server running on `http://localhost:5001`
2. ✅ GEMINI_API_KEY configured in `backend/.env`
3. ✅ Frontend running (web or native)

## Test Scenarios

### 1. Valid Image Upload (Happy Path)

**Steps:**
1. Open the Dishcovery app
2. Click "Choose photo" or "Pick photo (native)"
3. Select a clear photo of a food dish (e.g., pasta, stir-fry, salad)
4. Preview should appear
5. Click "Generate Recipe"
6. Wait 5-10 seconds

**Expected Result:**
- ✅ Loading indicator appears
- ✅ Recipe screen displays with:
  - Recipe name
  - Prep/cook times and servings
  - List of ingredients with measurements
  - Step-by-step instructions
  - Nutrition facts (calories, protein, fat, carbs)
  - Tips section
- ✅ "Back to Upload" button works

---

### 2. No Image Selected

**Steps:**
1. Open the app
2. Click "Generate Recipe" WITHOUT selecting an image

**Expected Result:**
- ✅ Error message: "Please select an image first."
- ✅ No API call made

---

### 3. Invalid File Type

**Steps:**
1. Use browser developer tools or file system to upload a `.txt` or `.pdf` file
2. Try to generate recipe

**Expected Result:**
- ✅ Error message: "Invalid file type. Allowed: png, jpg, jpeg, gif, webp"
- ✅ HTTP 400 status

---

### 4. Corrupted Image

**Steps:**
1. Create a file named `test.jpg` with random text content
2. Try to upload it

**Expected Result:**
- ✅ Error message: "Invalid or corrupted image file"
- ✅ HTTP 400 status

---

### 5. Missing API Key

**Steps:**
1. Remove or comment out `GEMINI_API_KEY` in `.env`
2. Restart backend server
3. Upload valid image

**Expected Result:**
- ✅ Error message: "AI service authentication failed"
- ✅ HTTP 500 status
- ✅ No sensitive information exposed

---

### 6. Rate Limiting (Optional)

**Steps:**
1. Upload 10-20 images rapidly in succession
2. Check if rate limit is hit

**Expected Result:**
- ✅ Error message: "AI service rate limit reached. Please try again..."
- ✅ HTTP 429 status

---

### 7. API Response Validation

**Steps:**
1. Upload a valid food image
2. Inspect the API response in browser DevTools (Network tab)

**Expected Response Structure:**
```json
{
  "success": true,
  "recipe": {
    "title": "Recipe Name",
    "prep_time": "X min",
    "cook_time": "X min",
    "servings": "X",
    "ingredients": ["...", "..."],
    "steps": ["...", "..."],
    "nutrition": {
      "calories": "X kcal",
      "protein": "Xg",
      "fat": "Xg",
      "carbs": "Xg"
    },
    "tips": "..."
  },
  "source": "gemini-vision"
}
```

---

### 8. Optional Parameters

**Steps:**
1. Use cURL or Postman to test with parameters:

```bash
curl -X POST http://localhost:5001/api/generate-recipe \
  -F "file=@path/to/food.jpg" \
  -F "language=es" \
  -F "dietary_restrictions=vegetarian" \
  -F "cuisine_preference=Mexican"
```

**Expected Result:**
- ✅ Recipe in Spanish
- ✅ Vegetarian ingredients only
- ✅ Mexican cuisine style

---

### 9. Large Image File

**Steps:**
1. Upload a very large image (>16MB)

**Expected Result:**
- ✅ Error message about file size (if implemented)
- ✅ Or server processes it (default 16MB limit in Flask)

---

### 10. Network Error Simulation

**Steps:**
1. Stop the backend server
2. Try to upload an image

**Expected Result:**
- ✅ User-friendly error: "Network error. Please check your connection..."
- ✅ No crash or white screen

---

## Testing with Different Image Types

Test with various food images:

1. **Single Dish**: ✅ Clear pasta dish, stir-fry
2. **Multiple Items**: ✅ Full meal with sides
3. **Raw Ingredients**: ✅ Fresh vegetables, meat
4. **Baked Goods**: ✅ Bread, pastries, cake
5. **Beverages**: ✅ Smoothies, cocktails
6. **Poor Quality**: ⚠️ Blurry, dark, or unclear photos

---

## Backend Unit Tests

Run automated tests:

```bash
cd backend
pytest tests/ -v --cov=api
```

**Expected Test Results:**
- ✅ `test_generate_recipe_no_file` - PASS
- ✅ `test_generate_recipe_empty_filename` - PASS
- ✅ `test_generate_recipe_invalid_extension` - PASS
- ✅ `test_generate_recipe_corrupted_image` - PASS
- ⚠️ `test_generate_recipe_valid_image_structure` - SKIP (needs API key)

---

## Performance Testing

### Response Time Benchmarks

| Scenario | Expected Time | Acceptable Range |
|----------|--------------|------------------|
| Image upload | < 1s | 0.5s - 2s |
| AI processing | 5-10s | 3s - 15s |
| Total end-to-end | 6-11s | 5s - 20s |

---

## Security Checklist

- ✅ API key not exposed in responses
- ✅ API key not in frontend code
- ✅ File type validation works
- ✅ Image integrity validation works
- ✅ Error messages don't leak sensitive info
- ✅ CORS properly configured

---

## Browser Compatibility

Test on:
- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

---

## Acceptance Criteria Validation

| Criterion | Test Scenario | Status |
|-----------|--------------|--------|
| Input Validation | Scenarios 2, 3, 4 | ✅ |
| AI Integration | Scenario 1, 5 | ✅ |
| Output Structure | Scenario 7 | ✅ |
| Error Handling | Scenarios 3-6, 10 | ✅ |
| Security | Security Checklist | ✅ |

---

## Known Issues / Future Enhancements

- [ ] Add image compression before upload
- [ ] Implement caching for frequent recipes
- [ ] Add retry logic for transient failures
- [ ] Support batch processing
- [ ] Add recipe rating/feedback

---

## Troubleshooting

### "Module not found" errors
```bash
cd backend
pip install -r requirements.txt
```

### "Connection refused"
- Check backend is running: `python app.py`
- Verify port 5001 is not in use

### "API key invalid"
- Check `.env` file has `GEMINI_API_KEY=...`
- Verify key is active at Google AI Studio
- Restart backend after changing `.env`

---

**Last Updated**: 2025-11-09
