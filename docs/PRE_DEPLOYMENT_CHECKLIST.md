# Pre-Deployment Checklist

Run this before pushing to GitHub/Vercel:

## ✅ Code Quality

- [x] All backend tests passing: `cd backend && python -m pytest`
- [x] No console.log statements in production code
- [x] Code properly formatted and commented
- [x] Error handling implemented for all API calls

## ✅ Security

- [x] No API keys in code (all in .env files)
- [x] `.env` files in `.gitignore`
- [x] `.env.example` files up to date
- [x] `SECRET_KEY` not using default value in production
- [x] CORS properly configured (no wildcard in production)
- [x] No sensitive data in console logs
- [x] Frontend npm audit: 0 vulnerabilities

## ✅ Configuration

- [x] `frontend/.env.production` points to production URL
- [x] `vercel.json` properly configured
- [x] Backend `vercel.json` removed (not needed)
- [x] ALLOWED_ORIGINS includes production domain
- [x] Image upload limits set (16MB max)

## ✅ Files & Structure

- [x] Documentation moved to `docs/` folder
- [x] Temporary files removed (start-tunnel.bat, deploy-setup.*)
- [x] Unnecessary vercel configs removed
- [x] `.gitignore` updated
- [x] All import paths working

## ✅ Vercel Environment Variables

Go to: https://vercel.com/[your-project]/settings/environment-variables

Add these:
- [ ] `GEMINI_API_KEY` = your-api-key
- [ ] `FLASK_ENV` = production
- [ ] `SECRET_KEY` = generated-random-key
- [ ] `ALLOWED_ORIGINS` = https://dishcovery-ecru.vercel.app

## ✅ Testing

### Local Testing:
```bash
# Backend
cd backend
python app.py
# Should start on http://localhost:5001

# Frontend (separate terminal)
cd frontend
npx expo start
# Test on phone with Expo Go
```

### Production URLs to Test After Deployment:
- [ ] Frontend: https://dishcovery-ecru.vercel.app
- [ ] API Health: https://dishcovery-ecru.vercel.app/api/health
- [ ] Upload image and generate recipe

## ✅ Git Status

```bash
# Check what's being committed
git status

# Review changes
git diff

# Should NOT see:
# - .env files
# - __pycache__
# - node_modules
# - .vercel
```

## 🚀 Ready to Deploy!

```bash
git add .
git commit -m "Clean up and prepare for production deployment"
git push origin main
```

Vercel will automatically deploy in ~2 minutes.

## 📊 Post-Deployment Verification

After Vercel finishes deploying:

1. Visit https://dishcovery-ecru.vercel.app
2. Open browser DevTools (F12) → Console
3. Upload a test image
4. Verify API call succeeds
5. Check recipe is generated
6. Test on mobile device

## 🐛 If Something Breaks

1. Check Vercel deployment logs
2. Check browser console for errors
3. Verify environment variables are set
4. Check API endpoint: https://dishcovery-ecru.vercel.app/api/health
5. Review recent commits

## 📝 Files Changed in This Session

✅ Created/Updated:
- `vercel.json` - Combined frontend + backend config
- `frontend/.env.production` - Production API URL
- `backend/app.py` - Added Vercel handler
- `frontend/src/components/ImageUpload.jsx` - Fixed ImagePicker
- `frontend/src/api/index.js` - Fixed React Native FormData
- `.gitignore` - Updated exclusions
- `docs/MOBILE_SETUP.md` - Mobile development guide
- `docs/QUICK_FIX_VERCEL.md` - Deployment quick fix
- `docs/VERCEL_DEPLOYMENT.md` - Detailed deployment guide
- `docs/SECURITY.md` - Security checklist

✅ Removed:
- `backend/vercel.json` - Not needed
- `backend/start-tunnel.bat` - Temporary tool
- `deploy-setup.bat/.sh` - Temporary tools
- `vercel/` folder - Old config

## 🎯 Current Status: READY FOR DEPLOYMENT ✅
