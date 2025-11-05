# 🔐 Environment Variables Setup Guide

## 📋 Quick Answer

**Q: Where do I put my API keys?**

- ✅ **Local Dev**: `backend/.env` (already gitignored)
- ✅ **GitHub**: Repository Settings → Secrets and variables
- ✅ **Vercel**: Project Settings → Environment Variables

---

## 🏠 Local Development

### Step 1: Copy the template
```bash
cd backend
cp .env.example .env
```

### Step 2: Add your API keys
```bash
# Edit backend/.env
nano .env  # or use your editor
```

Add your actual keys:
```env
GEMINI_API_KEY=AIzaSyDg_YOUR_ACTUAL_KEY_HERE
OPENAI_API_KEY=sk-YOUR_ACTUAL_KEY_HERE
ANTHROPIC_API_KEY=sk-ant-YOUR_ACTUAL_KEY_HERE
```

### Step 3: Save and NEVER commit!
The `.gitignore` already prevents this from being committed.

✅ **Verify it's ignored:**
```bash
git status
# Should NOT show backend/.env
```

---

## 🚀 Vercel Deployment (Production)

### Step 1: Go to Vercel Dashboard
1. Open your project on vercel.com
2. Click **Settings** tab
3. Click **Environment Variables** in sidebar

### Step 2: Add Each Variable

For **GEMINI_API_KEY**:
- **Key**: `GEMINI_API_KEY`
- **Value**: `AIzaSyDg_YOUR_KEY` (paste your actual key)
- **Environment**: Check all (Production, Preview, Development)
- Click **Save**

Repeat for:
- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`
- `SECRET_KEY`
- `ALLOWED_ORIGINS`

### Step 3: Redeploy
```bash
git push origin main
# Vercel auto-deploys with new env vars
```

---

## 🐙 GitHub Secrets (For CI/CD)

### Step 1: Go to Repository Settings
1. Open your GitHub repo
2. Click **Settings** tab
3. Click **Secrets and variables** → **Actions**

### Step 2: Add Repository Secrets
Click **New repository secret**

Add each secret:
- Name: `GEMINI_API_KEY`
- Value: `AIzaSyDg_YOUR_KEY`
- Click **Add secret**

Repeat for all API keys.

### Step 3: Use in GitHub Actions
```yaml
# .github/workflows/test.yml
env:
  GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
```

---

## 📊 Comparison Table

| Environment | Where to Add | How Code Accesses |
|-------------|--------------|-------------------|
| **Local Dev** | `backend/.env` file | `os.getenv('KEY')` |
| **Vercel** | Project Settings → Env Vars | Auto-injected |
| **GitHub Actions** | Repo Settings → Secrets | `${{ secrets.KEY }}` |

---

## 🔒 Security Best Practices

### ✅ DO:
- ✓ Keep `.env` in `.gitignore`
- ✓ Use `.env.example` as template (no real keys)
- ✓ Rotate keys if accidentally committed
- ✓ Use different keys for dev/staging/production
- ✓ Share `.env.example` with team
- ✓ Each team member creates their own `.env`

### ❌ DON'T:
- ✗ Commit `.env` to git
- ✗ Share keys in Slack/Discord
- ✗ Use same keys across environments
- ✗ Hardcode keys in source code
- ✗ Push keys to public repos

---

## 🆘 "I Accidentally Committed My API Key!"

### Immediate Actions:

1. **Revoke the key immediately**
   - Gemini: https://makersuite.google.com/app/apikey
   - OpenAI: https://platform.openai.com/api-keys
   - Generate a new key

2. **Remove from Git history**
   ```bash
   # WARNING: This rewrites history!
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch backend/.env" \
     --prune-empty --tag-name-filter cat -- --all
   
   # Force push
   git push origin --force --all
   ```

3. **Add new key to `.env` (locally)**

4. **Update Vercel/GitHub with new key**

5. **Verify `.gitignore` is working**
   ```bash
   git check-ignore backend/.env
   # Should output: backend/.env
   ```

---

## 👥 Team Member Onboarding

When a new team member joins:

```bash
# 1. Clone repo
git clone <repo-url>
cd Dishcovery

# 2. Setup backend
cd backend
cp .env.example .env
nano .env  # Add their own API keys
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# 3. Setup frontend
cd ../frontend
npm install

# 4. Start developing!
```

**Share with them:**
- Link to get Gemini API key
- This guide (ENV_SETUP_GUIDE.md)
- QUICK_START.md

---

## 📝 Environment Variables Reference

### Backend (.env)

```env
# Required
GEMINI_API_KEY=your_gemini_key_here

# Optional
OPENAI_API_KEY=your_openai_key_here
ANTHROPIC_API_KEY=your_anthropic_key_here

# App Config
FLASK_ENV=development
SECRET_KEY=your-secret-key-here
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:19006,http://localhost:5001
MAX_INGREDIENTS=10
DEFAULT_LANGUAGE=en
```

### Where to Get Keys:

- **Gemini**: https://makersuite.google.com/app/apikey (FREE tier available)
- **OpenAI**: https://platform.openai.com/api-keys (Paid)
- **Anthropic**: https://console.anthropic.com/ (Paid)

---

## ✅ Verification Checklist

- [ ] `backend/.env` exists locally
- [ ] `backend/.env` is in `.gitignore`
- [ ] `git status` does NOT show `.env`
- [ ] API keys work (test with: `python backend/app.py`)
- [ ] `.env.example` is committed (template only)
- [ ] Vercel has all environment variables set
- [ ] Team knows where to get API keys

---

**Last Updated:** 2025-11-05  
**Questions?** Check TROUBLESHOOTING.md or open an issue
