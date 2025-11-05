# 🍽️ Dishcovery

> AI-Powered Recipe Discovery Platform - Turn your ingredients into amazing dishes!

## 🚀 Overview

Dishcovery is a multilingual, AI-powered recipe generation platform that helps you create delicious recipes from the ingredients you have. Built with React Native for cross-platform support and Flask for the backend AI processing.

## 📋 Features

- ✨ **AI Recipe Generation** - Powered by Gemini, OpenAI, and Anthropic
- 🌍 **Multilingual Support** - English, Hungarian, Persian, Arabic, Japanese, Vietnamese
- 🎨 **Apple-Inspired Design** - Beautiful, minimalist UI with Tailwind CSS
- 🌓 **Dark/Light Mode** - Seamless theme switching
- 📱 **PWA Support** - Install on any device
- 🔒 **Privacy-First** - Your data stays yours

## 🛠️ Tech Stack

### Frontend
- React Native + Expo
- Tailwind CSS (NativeWind)
- i18next for internationalization
- React Navigation

### Backend
- Python Flask
- Google Gemini AI
- OpenAI GPT
- Anthropic Claude

## 📂 Project Structure

```
dishcovery/
├── backend/              # Python Flask API
│   ├── api/             # Recipe generation endpoints
│   ├── models/          # ML model logic
│   ├── app.py           # Main Flask app
│   ├── config.py        # Configuration
│   └── requirements.txt
├── frontend/            # React Native PWA
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── screens/     # App screens
│   │   ├── locales/     # Translations (6 languages)
│   │   ├── assets/      # Images, fonts
│   │   └── config/      # i18n, theme config
│   ├── App.jsx
│   └── package.json
└── vercel/              # Deployment config
    └── vercel.json
```

## 🚦 Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn
- Python 3.9+
- Git

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your API keys

# Run development server
python app.py
```

Backend will run at `http://localhost:5001` (Note: Port 5001 instead of 5000 to avoid macOS AirPlay conflict)

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start

# For web
npm run web

# Build PWA
npm run build-pwa
```

## 🔑 Environment Variables

### Backend (.env)
```env
FLASK_ENV=development
SECRET_KEY=your-secret-key
GEMINI_API_KEY=your-gemini-key
OPENAI_API_KEY=your-openai-key
ANTHROPIC_API_KEY=your-anthropic-key
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:19006,http://localhost:5001
```

### Frontend
Environment variables managed through Vercel dashboard for production.

## 🌐 API Endpoints

- `GET /` - API information (http://localhost:5001)
- `GET /api/health` - Health check
- `POST /api/generate-recipe` - Generate recipe from ingredients

### Example Request

```json
POST /api/generate-recipe
{
  "ingredients": ["chicken", "tomatoes", "garlic"],
  "language": "en",
  "dietary_restrictions": ["gluten-free"],
  "cuisine_preference": "Mediterranean"
}
```

## 🎨 Supported Languages

- 🇬🇧 English (en)
- 🇭🇺 Hungarian (hu)
- 🇮🇷 Persian (fa)
- 🇸🇦 Arabic (ar)
- 🇯🇵 Japanese (ja)
- 🇻🇳 Vietnamese (vi)

## 📱 PWA Installation

1. Visit the app in your browser
2. Click "Install" or "Add to Home Screen"
3. Access like a native app!

## 🚀 Deployment

### Frontend (Vercel)

```bash
cd frontend
npm run deploy
```

## 📝 Development Workflow

```bash
# Create new branch
git checkout -b feature/your-feature

# Make changes and test
npm test  # Frontend
pytest    # Backend

# Commit with descriptive message
git commit -m "feat: add new recipe filter"

# Push and create PR
git push origin feature/your-feature
```

## 📄 License

MIT License - see LICENSE file for details

---

**Happy Cooking with Dishcovery! 🍳✨**
