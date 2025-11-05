# 🎯 CI/CD Quick Reference

## ✅ What's Been Set Up

Your Dishcovery project now has a complete CI/CD pipeline with:

- **GitHub Actions Workflow** (`.github/workflows/dishcovery-ci.yml`)
- **Backend Tests** with pytest & coverage
- **Frontend Scripts** for linting & testing
- **Vercel Deployment** (preview + production)
- **Linting Configuration** (Flake8 for Python)

## 🚀 Quick Start

### 1. Complete Setup (One-time)

```bash
# Run the automated setup script
./scripts/setup-cicd.sh
```

**Manual alternative:**

```bash
# Link Vercel project
cd frontend
npx vercel link

# Get your Vercel IDs
cat .vercel/project.json
```

### 2. Add GitHub Secrets

Go to: `Your Repo > Settings > Secrets and variables > Actions`

Add these 3 secrets:
- `VERCEL_TOKEN` - Create at https://vercel.com/account/tokens
- `VERCEL_ORG_ID` - From `.vercel/project.json`
- `VERCEL_PROJECT_ID` - From `.vercel/project.json`

### 3. Enable Branch Protection (Recommended)

`Settings > Branches > Add rule` for `main`:
- ✅ Require pull request before merging
- ✅ Require status checks: `lint-and-test`, `build-frontend`

## 📋 How It Works

### On Pull Request to `main`:
1. ✅ Lint code (Python & JavaScript)
2. ✅ Run tests (backend & frontend)
3. ✅ Build PWA
4. ✅ Deploy preview to Vercel
5. 💬 Comment preview URL on PR

### On Merge to `main`:
1. ✅ All checks from PR
2. ✅ Deploy to production Vercel
3. 🚀 Live site updated

## 🧪 Local Testing

```bash
# Backend
cd backend
flake8 .                          # Lint
pytest tests/                      # Test
pytest tests/ --cov=.             # Coverage

# Frontend
cd frontend
npm run lint                       # Lint (when configured)
npm test                           # Test (when configured)
npm run build-pwa                  # Build
```

## 📁 Project Structure

```
dishcovery/
├── .github/workflows/
│   └── dishcovery-ci.yml        ← CI/CD workflow
├── backend/
│   ├── tests/                   ← Backend tests
│   ├── .flake8                  ← Linting config
│   └── pytest.ini               ← Test config
├── frontend/
│   ├── tests/                   ← Frontend tests
│   └── package.json             ← Updated with scripts
├── docs/
│   └── CI_CD_SETUP.md          ← Full documentation
└── scripts/
    └── setup-cicd.sh           ← Setup automation
```

## 🎓 Next Steps

1. **Test the workflow**: Create a test PR
2. **Add more tests**: See `docs/CI_CD_SETUP.md`
3. **Configure notifications**: Add Slack/Discord webhooks
4. **Monitor deployments**: Check GitHub Actions tab

## 📚 Documentation

- **Full Guide**: `docs/CI_CD_SETUP.md`
- **Backend Tests**: `backend/tests/README.md`
- **Frontend Tests**: `frontend/tests/README.md`

## 🆘 Troubleshooting

### Workflow not running?
- Check `.github/workflows/` exists
- Verify file is named `dishcovery-ci.yml`
- Check GitHub Actions tab for errors

### Tests failing?
```bash
# Run locally first
cd backend && pytest tests/ -v
cd frontend && npm test
```

### Deployment failing?
- Verify all 3 secrets are set in GitHub
- Check Vercel project is linked
- Review logs in GitHub Actions tab

---

**Need help?** Check `docs/CI_CD_SETUP.md` or open an issue!
