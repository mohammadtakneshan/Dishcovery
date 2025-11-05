# ⚡ Dishcovery Quick Start Guide

Get Dishcovery running in **5 minutes**!

## 🎯 Fast Track Setup

### Option 1: Automated Setup (Recommended)

```bash
# From project root
./setup.sh
```

Then add your API keys to `backend/.env` and you're done!

### Option 2: Manual Setup

**Backend (Terminal 1):**
```bash
cd backend
[v1.0.0-beta1] - 2025-11-05

Initial Foundation Release

Core Features

- Complete project structure with backend (Flask) and frontend (React Native PWA)
- AI-powered recipe generation using Gemini AI integration
- RESTful API with health check and recipe generation endpoints
- Flask application with CORS support and environment-based configuration

Internationalization

- Full i18next integration with language detection
- Complete translations for 6 languages: English, Hungarian, Persian, Arabic, Japanese, Vietnamese
- RTL support foundation for Arabic and Persian
- Locale-based date and number formatting ready

UI/UX Components

- Apple-inspired design system with SF Pro fonts
- Tailwind CSS configuration with custom color palette
- Dark/Light theme system with seamless switching
- Three reusable components: Button, Input, Card
- Responsive layout foundation for mobile and desktop

Backend Infrastructure

- Python Flask server with blueprint architecture
- Environment variable management with python-dotenv
- Virtual environment setup with all dependencies
- API endpoint structure: /api/generate-recipe, /api/health
- Support for multiple AI providers: Gemini, OpenAI, Anthropic

Frontend Architecture

- React Native + Expo setup for cross-platform support
- Navigation structure with React Navigation
- Component-based architecture with barrel exports
- PWA configuration for installable web app
- NativeWind integration for Tailwind in React Native

Development & Deployment

- Automated setup script (setup.sh) for one-command initialization
- Vercel deployment configuration with routing setup
- Comprehensive .gitignore for clean repository
- Environment template (.env.example) with all required variables
- Git-ready structure with proper file organization

Documentation

- Complete README.md with full project overview
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your API keys
python app.py
```

**Frontend (Terminal 2):**
```bash
cd frontend
npm install
npm start
```

## 🔑 Get Your API Keys

1. **Gemini AI** (Free tier available)
   - Visit: https://makersuite.google.com/app/apikey
   - Create API key
   - Add to `backend/.env`: `GEMINI_API_KEY=your_key`

2. **OpenAI** (Optional)
   - Visit: https://platform.openai.com/api-keys
   - Create API key
   - Add to `backend/.env`: `OPENAI_API_KEY=your_key`

## ✅ Verify It's Working

1. **Backend:** Visit http://localhost:5000
   - Should see: "Welcome to Dishcovery API"

2. **Health Check:** http://localhost:5000/api/health
   - Should return: `{"status": "healthy"}`

3. **Frontend:** Terminal shows Expo dev server
   - Open web: http://localhost:19006

## 🧪 Test Recipe Generation

```bash
curl -X POST http://localhost:5000/api/generate-recipe \
  -H "Content-Type: application/json" \
  -d '{
    "ingredients": ["pasta", "tomato", "basil"],
    "language": "en"
  }'
```

You should get a recipe back!

## 🌍 Change Language

In the frontend, update language preference to test multilingual support:
- English (en) 🇬🇧
- Hungarian (hu) 🇭🇺
- Persian (fa) 🇮🇷
- Arabic (ar) 🇸🇦
- Japanese (ja) 🇯🇵
- Vietnamese (vi) 🇻🇳

## 🎨 Toggle Dark Mode

Theme switching is configured and ready to use in your components.

## 📱 Mobile Testing

**iOS Simulator:**
```bash
cd frontend
npm run ios
```

**Android Emulator:**
```bash
cd frontend
npm run android
```

**Physical Device:**
1. Install Expo Go app
2. Scan QR code from terminal

## 🚀 Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy frontend
cd frontend
vercel --prod
```

Add environment variables in Vercel dashboard!

## 🆘 Troubleshooting

**"Module not found"**
```bash
cd frontend
rm -rf node_modules
npm install
```

**"Python module not found"**
```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
```

**"API key invalid"**
- Check `.env` file exists in `backend/`
- Verify API key has no quotes or extra spaces
- Ensure virtual environment is activated

## 📚 Next Steps

1. ✅ Setup complete? Check `SETUP_CHECKLIST.md`
2. 👥 Team onboarding? Share `README.md`
3. 🏗️ Start building? See project structure below

## 📁 Project Structure

```
dishcovery/
├── backend/           # Flask API + AI
│   ├── api/          # Endpoints
│   ├── app.py        # Main app
│   └── .env          # Your secrets
├── frontend/          # React Native PWA
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── screens/     # App screens
│   │   └── locales/     # Translations
│   └── App.jsx
└── setup.sh          # One-click setup
```

## 💡 Tips

- Keep backend running in one terminal
- Frontend in another terminal
- Use VS Code for best experience
- Install recommended extensions
- Check console for errors

## 🎉 You're Ready!

Start building amazing features for Dishcovery!

Need help? Check:
- `README.md` - Full documentation
- `SETUP_CHECKLIST.md` - Detailed setup
- GitHub Issues - Report problems

Happy cooking! 🍳
