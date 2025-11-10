# 🍽️ Dishcovery

> AI-Powered Recipe Generation from Food Photos - Snap, Analyze, Cook!

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.10+](https://img.shields.io/badge/python-3.10+-blue.svg)](https://www.python.org/downloads/)
[![React Native](https://img.shields.io/badge/react--native-0.81-blue.svg)](https://reactnative.dev/)
[![Flask 3.0](https://img.shields.io/badge/flask-3.0-green.svg)](https://flask.palletsprojects.com/)

## 🚀 Overview

Dishcovery is an innovative AI-powered recipe discovery platform that **generates complete recipes from food images**. Simply upload a photo of any meal, and our Gemini Vision AI will analyze it and provide a detailed recipe with ingredients, instructions, nutrition facts, and cooking tips—all in your preferred language.

### ✨ Key Features

- 📸 **Image-Based Recipe Generation** - Upload a food photo, get a complete recipe
- 🤖 **Gemini Vision AI** - Advanced image analysis for accurate recipe creation
- 🌍 **6 Languages** - English, Spanish, Hungarian, Persian, Arabic, Japanese, Vietnamese
- 📊 **Nutrition Facts** - Complete nutritional information per serving
- 🎨 **Beautiful UI** - Modern, responsive design with dark/orange theme
- 🔒 **Secure** - API keys protected, input validation, CORS enabled
- ✅ **Fully Tested** - Comprehensive unit tests with pytest

## 🎯 How It Works

1. **📷 Upload** - Take or select a photo of food
2. **🔍 Analyze** - AI examines the image to identify ingredients and dish
3. **📝 Generate** - Creates a complete recipe with measurements and steps
4. **🍳 Cook** - Follow the detailed instructions and enjoy!

## 🛠️ Tech Stack

### Frontend
- **React Native** + **Expo** - Cross-platform mobile & web
- **Axios** - HTTP client for API calls
- **Expo ImagePicker** - Native image selection
- **react-i18next** - Internationalization
- **Custom Theme** - Beautiful orange/dark brand colors

### Backend
- **Flask 3.0.0** - Python web framework
- **Gemini Vision (1.5 Flash)** - Google's advanced image AI
- **Pillow** - Image processing and validation
- **Flask-CORS** - Cross-origin resource sharing
- **pytest** - Testing framework

## 📂 Project Structure

```
dishcovery/
├── backend/
│   ├── api/
│   │   ├── recipes.py          # Image upload & AI processing
│   │   └── __init__.py
│   ├── tests/
│   │   ├── test_app.py         # Basic endpoint tests
│   │   └── test_recipes.py     # Recipe generation tests
│   ├── app.py                  # Flask application factory
│   ├── config.py               # Configuration & env vars
│   └── requirements.txt        # Python dependencies
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── index.js        # API client
│   │   ├── components/
│   │   │   └── ImageUpload.jsx # Image picker component
│   │   ├── screens/
│   │   │   ├── UploadScreen.jsx   # Photo upload UI
│   │   │   └── RecipeScreen.jsx   # Recipe display
│   │   ├── theme.js            # Design system
│   │   └── locales/            # i18n translations
│   ├── App.js                  # Main app component
│   └── package.json
│
└── docs/
    ├── IMPLEMENTATION_GUIDE.md  # Complete setup guide
    ├── API_DOCUMENTATION.md     # API reference
    └── TESTING_GUIDE.md         # Manual testing checklist
```

## 🚦 Quick Start

### Option 1: Automated Setup (Windows)

```batch
quick-start.bat
```

### Option 2: Automated Setup (Linux/Mac)

```bash
chmod +x quick-start.sh
./quick-start.sh
```

### Option 3: Manual Setup

#### 1. Backend Setup

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Add your GEMINI_API_KEY to .env

# Run server
python app.py
```

Backend runs at: `http://localhost:5001`

#### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start

# For web only
npm run web
```

## 🔑 Get Your Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key and add to `backend/.env`:
   ```env
   GEMINI_API_KEY=your-actual-key-here
   ```

## 📖 API Documentation

### Generate Recipe from Image

**Endpoint**: `POST /api/generate-recipe`

**Request** (multipart/form-data):
```bash
curl -X POST http://localhost:5001/api/generate-recipe \
  -F "file=@food-photo.jpg" \
  -F "language=en" \
  -F "dietary_restrictions=vegetarian" \
  -F "cuisine_preference=Italian"
```

**Response** (200 OK):
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
      "100g basil leaves, chopped"
    ],
    "steps": [
      "Heat oil in a pan, sauté chicken until browned.",
      "Add peppers and stir-fry for 5 minutes."
    ],
    "nutrition": {
      "calories": "420 kcal",
      "protein": "32g",
      "fat": "12g",
      "carbs": "35g"
    },
    "tips": "Serve with jasmine rice"
  },
  "source": "gemini-vision"
}
```

For complete API documentation, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

## 🧪 Testing

### Run Backend Tests

```bash
cd backend
pytest tests/ -v --cov=api
```

### Test Coverage
- ✅ Input validation (no file, invalid type, corrupted image)
- ✅ Error handling (API failures, rate limits)
- ✅ Response structure validation
- ✅ Optional parameters support

See [TESTING_GUIDE.md](./TESTING_GUIDE.md) for manual testing scenarios.

## 🌐 Supported Languages

| Code | Language | Native Name |
|------|----------|-------------|
| `en` | English | English |
| `es` | Spanish | Español |
| `hu` | Hungarian | Magyar |
| `fa` | Persian | فارسی |
| `ar` | Arabic | العربية |
| `ja` | Japanese | 日本語 |
| `vi` | Vietnamese | Tiếng Việt |

## 📊 Acceptance Criteria Status

| Criteria | Status | Implementation |
|----------|--------|----------------|
| ✅ Input Validation | Complete | Rejects invalid images with 400 errors |
| ✅ AI Integration | Complete | Gemini Vision with secure API keys |
| ✅ Output Structure | Complete | Full JSON with nutrition & tips |
| ✅ Error Handling | Complete | Rate limits, API failures handled |
| ✅ Security | Complete | Env vars, input validation, CORS |

## 🎨 Screenshots

### Upload Screen
![Upload](https://via.placeholder.com/800x500?text=Upload+Food+Photo)

*Clean interface with image preview and generate button*

### Recipe Display
![Recipe](https://via.placeholder.com/800x500?text=Beautiful+Recipe+Display)

*Structured layout with ingredients, steps, and nutrition*

## 🚀 Deployment

### Backend (Vercel/Heroku)

```bash
cd backend
# Set environment variables in dashboard
# Deploy with Git push or CLI
```

### Frontend (Vercel/Netlify)

```bash
cd frontend
npm run build-pwa
vercel --prod
```

## 🔒 Security Features

- ✅ **API Keys**: Stored in environment variables only
- ✅ **Input Validation**: File type & integrity checks
- ✅ **Error Sanitization**: No sensitive info in responses
- ✅ **CORS**: Configured allowed origins
- ✅ **Rate Limiting**: Handled gracefully with 429 responses

## 📈 Performance

- **Image Upload**: < 2 seconds
- **AI Processing**: 5-10 seconds (Gemini API)
- **Total Response Time**: 6-12 seconds
- **Max File Size**: 16MB
- **Supported Formats**: PNG, JPG, JPEG, GIF, WEBP

## 🐛 Troubleshooting

### "No module named 'PIL'"
```bash
pip install Pillow
```

### "AI service authentication failed"
- Check `GEMINI_API_KEY` in `.env`
- Verify key is active at Google AI Studio
- Restart backend server

### "Network error"
- Ensure backend is running on port 5001
- Check firewall settings
- Verify `API_BASE` in `frontend/src/api/index.js`

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 Development Roadmap

- [ ] User authentication & saved recipes
- [ ] PostgreSQL database integration
- [ ] Recipe search & filtering
- [ ] Social sharing features
- [ ] Offline mode support
- [ ] Recipe rating system
- [ ] OCR for ingredient extraction
- [ ] Recipe modification suggestions

## 📄 License

MIT License - see [LICENSE](./LICENSE) for details

## 🙏 Acknowledgments

- **Google Gemini** for powerful vision AI capabilities
- **Expo Team** for excellent cross-platform tools
- **Flask Community** for robust web framework

## 📞 Support

- **Documentation**: [/docs](./docs)
- **Issues**: [GitHub Issues](https://github.com/your-org/dishcovery/issues)
- **Email**: support@dishcovery.app

---

**Made with ❤️ by the Dishcovery Team**

*Last Updated: 2024-11-09*
