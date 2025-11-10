# 🚀 Quick Deployment Guide

## TL;DR - Deploy Now!

### 1. Add Environment Variables in Vercel
Go to: https://vercel.com/[your-project]/settings/environment-variables

Add these (for Production, Preview, Development):
```
GEMINI_API_KEY = your-actual-gemini-api-key
FLASK_ENV = production
ALLOWED_ORIGINS = https://dishcovery-ecru.vercel.app
```

Optional but recommended:
```
SECRET_KEY = (run: openssl rand -hex 32)
```

### 2. Commit and Push
```bash
git add .
git commit -m "Production-ready: Clean up and deploy"
git push origin main
```

### 3. Wait ~2 Minutes
Vercel will automatically deploy.

### 4. Test
- Visit: https://dishcovery-ecru.vercel.app
- Upload a food photo
- Generate recipe
- ✅ Done!

---

## 📋 What Was Fixed

✅ Fixed Expo Go mobile issues
✅ Fixed ImagePicker deprecation  
✅ Fixed image upload (React Native FormData)
✅ Combined frontend + backend in one Vercel project
✅ Security audit passed
✅ All tests passing
✅ Documentation organized
✅ Temporary files cleaned up

---

## 🐛 If Something Goes Wrong

### Check These:
1. Vercel environment variables are set
2. API health endpoint: https://dishcovery-ecru.vercel.app/api/health
3. Browser console for errors (F12)
4. Vercel deployment logs

### Common Issues:
- **"Failed to fetch"**: Environment variables not set
- **CORS error**: ALLOWED_ORIGINS missing or wrong
- **500 error**: Check GEMINI_API_KEY is valid
- **Image upload fails**: File too large (max 16MB)

---

## 📚 Full Documentation

See `/docs` folder for:
- `PRE_DEPLOYMENT_CHECKLIST.md` - Complete checklist
- `SECURITY.md` - Security configuration
- `MOBILE_SETUP.md` - Mobile development
- `CLEANUP_SUMMARY.md` - What changed today

---

## ✨ Current Status: READY ✅

All checks passed. You're good to deploy! 🚀
