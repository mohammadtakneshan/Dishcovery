# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Dishcovery** is a cross-platform PWA (Progressive Web App) + native mobile app that uses AI vision models to analyze food photographs and generate detailed recipes. Users upload food photos, and the backend returns structured recipes with ingredients, cooking instructions, and nutrition information.

Key features:
- Multi-language support (7 languages: en, es, hu, fa, ar, ja, vi)
- Multiple AI providers: Google Gemini, OpenAI GPT-4o, Anthropic Claude
- React Native + Expo frontend (web and mobile)
- Flask REST API backend
- Persistent settings via AsyncStorage
- i18n internationalization

## Repository Structure

```
dishcovery/
├── frontend/              # React Native + Expo app (web + mobile)
│   ├── src/
│   │   ├── api/          # API client (generateRecipeFromImage)
│   │   ├── components/   # Reusable UI components
│   │   ├── config/       # i18n configuration
│   │   ├── context/      # SettingsContext for state management
│   │   ├── locales/      # Translation JSON files (7 languages)
│   │   ├── screens/      # UploadScreen, RecipeScreen
│   │   └── theme.js      # Tailwind theme config
│   ├── App.js            # Root component with navigation
│   ├── package.json
│   ├── tailwind.config.js
│   └── .env.example

├── backend/               # Flask REST API
│   ├── api/
│   │   └── recipes.py    # Recipe generation endpoint
│   ├── tests/            # Unit tests
│   ├── app.py            # Flask app factory
│   ├── config.py         # Configuration from environment
│   ├── requirements.txt
│   ├── vercel.json       # Deployment config
│   └── .env.example

├── docs/                 # Documentation
├── .github/workflows/    # CI/CD pipeline
└── README.md
```

## Architecture

### Frontend Data Flow

```
App.js (with SettingsProvider)
  ├─ UploadScreen
  │   ├─ useSettings() context hook
  │   ├─ useTranslation() from i18next
  │   ├─ Calls: generateRecipeFromImage(formData)
  │   └─ Passes recipe → RecipeScreen
  │
  └─ RecipeScreen
      └─ Displays formatted recipe result
```

**State Management:**
- **SettingsContext** (`src/context/SettingsContext.jsx`): Manages provider, apiKey, apiBaseUrl, model
- Persisted to AsyncStorage
- Auto-validation on save
- Methods: saveSettings(), resetSettings(), validate()

**Internationalization:**
- i18next (23.7.6) with react-i18next (13.5.0)
- 7 language files in `src/locales/[lang]/translation.json`
- Language persisted to AsyncStorage
- Device locale detection as fallback

**Image Handling:**
- ImageUpload component for file selection
- expo-image-picker integration
- Validation on frontend before upload

### Backend Architecture

**API Structure:**
```
POST /api/generate-recipe
├─ Input: multipart/form-data (file, language, dietary_restrictions, cuisine_preference, provider, api_key, model)
├─ Processing:
│   ├─ Validate image (PIL validation)
│   ├─ Get provider config (gemini/openai/anthropic)
│   ├─ Call provider handler: generate_with_gemini(), generate_with_openai(), etc.
│   ├─ Parse JSON response
│   └─ Transform to standard recipe format
└─ Output: JSON with recipe data and metadata
```

**Provider Handler Pattern:**
Each provider has its own handler function that:
1. Prepares image for the provider API
2. Makes the API call
3. Parses and returns structured response
4. Handles provider-specific errors

**Error Handling:**
- Custom `ProviderError` exception class
- `problem_response()` helper for consistent error JSON
- User-friendly error codes and hints
- Debug info only in development (check `app.config['DEBUG']`)

## Commands

### Frontend Development

```bash
# Web development
cd frontend
npm install
npm run web              # Starts on http://localhost:19006

# Start Expo Go tunnel mode
npm run tunnel

# Android/iOS (requires emulator/simulator)
npm run android
npm run ios

# Production build
npm run build-pwa        # Export for web: expo export --platform web

# Code quality
npm run lint             # ESLint check
npm run format           # Prettier formatting
```

### Backend Development

```bash
cd backend

# Setup
python -m venv venv
source venv/bin/activate  # or: venv\Scripts\activate (Windows)
pip install -r requirements.txt

# Run server
python app.py            # Runs on http://localhost:5001

# Testing
pytest tests/ -v --cov=api

# Linting
flake8 .

# Check syntax
python -m py_compile api/recipes.py
```

### Concurrent Development

```bash
# Root directory
npm run dev              # Runs frontend + backend together (requires npm-concurrently)
npm run dev:web          # Web frontend + backend
```

### Deployment

```bash
# Frontend to Vercel
cd frontend
npm run vercel-build     # Vercel-specific build
npm run deploy           # Deploy to Vercel

# Backend (already configured for Vercel serverless)
# Set VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID in GitHub secrets
# CI/CD pipeline handles deployment on push to main
```

## Development Workflow

### Adding a New Feature

1. Create feature branch from `main`
2. Implement frontend changes in `src/components/` or `src/screens/`
3. Implement backend changes in `api/recipes.py`
4. Add/update tests in `backend/tests/`
5. Add translations to `frontend/src/locales/*/translation.json`
6. Test locally:
   ```bash
   npm run dev              # or run terminals separately
   ```
7. Lint:
   ```bash
   cd frontend && npm run lint
   cd backend && flake8 .
   ```
8. Push and open PR

### Adding a New AI Provider

1. Add provider SDK to `backend/requirements.txt`
2. Add API key to environment variables in `backend/config.py`
3. Implement `generate_with_[provider]()` function in `backend/api/recipes.py`
4. Update `get_provider_config()` mapping
5. Update frontend SettingsContext with provider details
6. Test request/response parsing with unit tests

### Adding a New Language

1. Create translation file: `frontend/src/locales/[lang-code]/translation.json`
2. Import and add to i18n resources in `frontend/src/config/i18n.js`
3. Test with language selector in settings
4. Update README.md supported languages table

### Adding Tests

**Backend:**
- File naming: `test_*.py` in `backend/tests/`
- Use pytest fixtures for setup
- Include input validation tests, error handling tests, response structure tests
- Run: `pytest tests/ -v --cov=api`

**Frontend:**
- Create `__tests__` directory parallel to source files
- Test components and hooks
- Test i18n integration
- Run: `npm test` (if test script is configured)

## Configuration

### Environment Variables

**Backend (`backend/.env`):**
```
FLASK_ENV=development
SECRET_KEY=your-secret-key
OPENAI_API_KEY=...
GEMINI_API_KEY=...
ANTHROPIC_API_KEY=...
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:19006,http://localhost:5001
MAX_CONTENT_LENGTH=16777216  # 16MB
```

**Frontend (`frontend/.env`):**
```
EXPO_PUBLIC_API_URL=http://localhost:5001
EXPO_PUBLIC_VERCEL_BYPASS=optional-bypass-token
```

### Important Configuration Files

**Backend:**
- `config.py`: Environment variable loading, provider API key mapping, file limits
- `vercel.json`: Vercel deployment routing

**Frontend:**
- `babel.config.js`: Babel preset for Expo transpilation
- `tailwind.config.js`: Custom colors, dark mode, fonts
- `.eslintrc.cjs`: Linting rules
- `src/config/i18n.js`: i18next setup with all 7 languages

## Testing

### Backend Tests

```bash
cd backend
pytest tests/ -v --cov=api  # Run with coverage
pytest tests/test_recipes.py -v  # Run specific test file
pytest tests/test_recipes.py::test_generate_recipe -v  # Run specific test
```

**Test coverage includes:**
- Input validation (no file, invalid type, corrupted image)
- Error handling (API failures, rate limits, provider errors)
- Response structure validation
- Optional parameters support

### Manual Testing

- Upload images via the web interface at `http://localhost:19006`
- Test with different AI providers via settings panel
- Test language switching via language dropdown
- Check that translations display correctly
- Verify error messages are user-friendly

## Key Technologies

**Frontend:**
- React 19.1.0 + React Native 0.81.5
- Expo 54.0.23 (cross-platform)
- React Navigation (routing)
- i18next + react-i18next (translations)
- Tailwind CSS 4.x (styling)
- axios (HTTP client)
- AsyncStorage (persistence)

**Backend:**
- Flask 3.0.0 + flask-cors (REST API)
- google-generativeai (Gemini Vision)
- openai (GPT-4o Vision)
- anthropic (Claude Vision)
- Pillow (image validation)
- pytest + pytest-cov (testing)
- Gunicorn (production server)

## Common Patterns

### Error Handling

**Backend:**
```python
# Custom exception
raise ProviderError(code='invalid_image', message='File is not a valid image', hint='Try a JPEG or PNG file')

# Error response
return problem_response(status_code=400, code='invalid_image', message='...', hint='...')
```

**Frontend:**
```javascript
// Custom error class with code, hint, status
new ApiError(code, message, hint, statusCode)

// Try/catch in component
try {
  const result = await generateRecipeFromImage(formData);
} catch (error) {
  // error.code, error.hint available for UI display
}
```

### Configuration Management

**Backend:** Python Config class reading from environment
**Frontend:** React Context + AsyncStorage for persistent settings
**Abstraction:** Provider-agnostic interface allows easy provider swapping

### Component Structure

**Screens:** Full-screen components (UploadScreen, RecipeScreen)
**Components:** Reusable UI elements (Button, Card, Input, ImageUpload, etc.)
**Context:** SettingsContext provides configuration state
**Hooks:** useSettings(), useTranslation() from standard libraries

## Database & Persistence

Currently, the app is **stateless**:
- Backend: No database, configuration via environment variables
- Frontend: Settings persisted to AsyncStorage (local to device)
- No user authentication or server-side data storage

Future roadmap includes PostgreSQL integration for user accounts and saved recipes.

## CI/CD Pipeline

**File:** `.github/workflows/dishcovery-ci.yml`

**On push/PR:**
1. Lint frontend (ESLint)
2. Lint backend (flake8)
3. Run backend tests (pytest)
4. Build frontend PWA (expo export)

**On PR:** Optional Vercel preview deployment (requires secrets)
**On merge to main:** Production deployment to Vercel (requires VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID)

## Important Notes

### Security
- API keys stored in environment variables only (never committed)
- Input validation for image files
- CORS configured with allowed origins
- Error responses sanitized (no sensitive info)
- Rate limiting handled gracefully

### Performance
- Max file size: 16MB
- Image formats: PNG, JPG, JPEG, GIF, WEBP
- AI processing: 5-10 seconds (Gemini API)
- Total response: 6-12 seconds

### Browser/Device Support
- Web: Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile: iOS (via Expo), Android (via Expo)
- PWA: Offline support planned

### Debugging

**Frontend:**
- Check browser console for errors
- Check network tab for API calls
- React DevTools for component inspection
- i18next debug: Add `debug: true` to i18n config

**Backend:**
- Check Flask logs for errors
- Use `app.logger.info()` for debug output
- Enable DEBUG mode in config for more error detail
- Test endpoints with curl or Postman

## Troubleshooting Reference

| Issue | Solution |
|-------|----------|
| API connection fails | Check API_BASE URL matches backend port (5001) |
| Image upload fails | Verify MAX_CONTENT_LENGTH and allowed extensions |
| Provider error | Check API key format and validity in environment |
| Translation missing | Ensure all translation.json files have the key |
| Build fails | Clear node_modules, npm cache: `npm ci`, `npm cache clean --force` |

## Current Branch Status

- **Current Branch:** `feature/prompt-to-FoodImage`
- **Main Branch:** `main`
- **Status:** Clean (no uncommitted changes)

When making changes, typically work on feature branches and merge via PR to `main`.
