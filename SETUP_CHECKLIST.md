# 🚀 Dishcovery Setup Checklist

## Prerequisites Installation

- [ ] Install Node.js 18+ from [nodejs.org](https://nodejs.org/)
- [ ] Install Python 3.9+ from [python.org](https://www.python.org/)
- [ ] Install Git from [git-scm.com](https://git-scm.com/)
- [ ] Install VS Code or your preferred editor
- [ ] Create accounts:
  - [ ] Google AI Studio for Gemini API key
  - [ ] OpenAI for GPT API key (optional)
  - [ ] Anthropic for Claude API key (optional)
  - [ ] Vercel account for deployment

## Project Setup

### 1. Clone & Initialize

```bash
# If not already done
git init
git add .
git commit -m "Initial Dishcovery setup"
```

- [ ] Repository initialized
- [ ] `.gitignore` configured
- [ ] README.md reviewed

### 2. Backend Setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
```

- [ ] Virtual environment created
- [ ] Dependencies installed
- [ ] `.env` file configured with API keys

**Required Environment Variables:**
```env
GEMINI_API_KEY=your_key_here
OPENAI_API_KEY=your_key_here  # Optional
ANTHROPIC_API_KEY=your_key_here  # Optional
FLASK_ENV=development
SECRET_KEY=generate_random_secret
```

- [ ] All API keys added
- [ ] Secret key generated
- [ ] CORS origins configured

### 3. Frontend Setup

```bash
cd frontend
npm install
```

- [ ] Node modules installed
- [ ] No installation errors
- [ ] Package.json dependencies resolved

### 4. Quick Setup (Alternative)

```bash
# From project root
chmod +x setup.sh
./setup.sh
```

- [ ] Setup script executed successfully
- [ ] Both backend and frontend ready

## Testing Local Development

### Backend Test

```bash
cd backend
source venv/bin/activate
python app.py
```

Expected output:
```
* Running on http://0.0.0.0:5000
* Restarting with stat
```

- [ ] Backend starts without errors
- [ ] Visit `http://localhost:5000` - see welcome message
- [ ] Test health endpoint: `http://localhost:5000/api/health`

### Frontend Test

```bash
cd frontend
npm start
```

- [ ] Expo dev server starts
- [ ] QR code displayed
- [ ] Web opens at localhost:19006 (optional)
- [ ] No compilation errors

## Configuration Verification

### Multilingual Support
- [ ] All 6 translation files present (en, hu, fa, ar, ja, vi)
- [ ] i18n configuration loaded
- [ ] Language detection working

### Styling
- [ ] Tailwind CSS configured
- [ ] NativeWind installed
- [ ] Apple fonts referenced
- [ ] Dark/Light mode config ready

### Components
- [ ] Button component works
- [ ] Input component works
- [ ] Card component works
- [ ] Components export properly

## API Integration Testing

Test the recipe generation endpoint:

```bash
curl -X POST http://localhost:5000/api/generate-recipe \
  -H "Content-Type: application/json" \
  -d '{
    "ingredients": ["chicken", "garlic", "tomatoes"],
    "language": "en",
    "dietary_restrictions": [],
    "cuisine_preference": "Italian"
  }'
```

- [ ] API responds with recipe
- [ ] No authentication errors
- [ ] Response format is correct
- [ ] Gemini API key working

## Deployment Preparation

### Vercel Setup
- [ ] Vercel account created
- [ ] Vercel CLI installed: `npm i -g vercel`
- [ ] Project linked: `vercel link`
- [ ] Environment variables set in Vercel dashboard

### Environment Variables in Vercel
Navigate to: Project Settings → Environment Variables

Add:
- [ ] `GEMINI_API_KEY`
- [ ] `OPENAI_API_KEY` (if using)
- [ ] `ANTHROPIC_API_KEY` (if using)
- [ ] `SECRET_KEY`
- [ ] `ALLOWED_ORIGINS`

### Deployment Test

```bash
# Frontend
cd frontend
vercel --prod

# Backend (separate deployment or serverless)
cd backend
# Configure based on chosen deployment method
```

- [ ] Frontend deploys successfully
- [ ] Backend accessible
- [ ] CORS configured correctly
- [ ] API endpoints work in production

## Team Collaboration

### Git Workflow
- [ ] Main branch protected
- [ ] Feature branch strategy agreed
- [ ] Commit message convention set
- [ ] Pull request template created (optional)

### Documentation
- [ ] README.md complete
- [ ] API documentation clear
- [ ] Setup instructions tested by team member
- [ ] Known issues documented

### Development Environment
- [ ] All team members have access
- [ ] Shared API keys (or individual keys)
- [ ] Code editor extensions recommended:
  - [ ] ESLint
  - [ ] Prettier
  - [ ] Python extension
  - [ ] Tailwind CSS IntelliSense

## Feature Checklist

### Core Features
- [ ] Recipe generation working
- [ ] Ingredient input functional
- [ ] Language switching works
- [ ] Theme toggle (dark/light)
- [ ] Responsive design verified

### Coming Soon
- [ ] User authentication
- [ ] Recipe saving
- [ ] Share functionality
- [ ] Ingredient scanning with camera
- [ ] Offline mode with service workers
- [ ] Recipe favorites
- [ ] Cooking timer
- [ ] Shopping list generation

## Troubleshooting

### Common Issues

**Backend won't start:**
- Check Python version: `python3 --version`
- Verify virtual environment activated
- Check `.env` file exists with valid keys
- Review error logs

**Frontend build errors:**
- Clear node_modules: `rm -rf node_modules && npm install`
- Clear cache: `npm cache clean --force`
- Check Node version: `node --version`

**API calls failing:**
- Verify backend is running
- Check CORS settings
- Confirm API keys are valid
- Test with curl first

**Translation not working:**
- Check i18n.js import in App.jsx
- Verify translation JSON files exist
- Console log current language

## Success Criteria

✅ **Setup Complete When:**
- Backend API responds to health checks
- Frontend loads without errors
- Recipe generation produces results
- Language switching works
- Dark/light mode toggles
- No console errors in development
- Team members can run locally
- Ready for first feature development

## Next Steps

After setup completion:
1. Review project architecture
2. Assign initial tasks to team members
3. Set up CI/CD pipeline (optional)
4. Create first feature branch
5. Begin development sprint!

---

**Questions or issues?** Document them in GitHub Issues or team chat.

**Last Updated:** 2025-11-05
