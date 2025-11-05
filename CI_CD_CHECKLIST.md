# ✅ Dishcovery CI/CD - Setup Checklist

Use this checklist to ensure your CI/CD pipeline is fully configured and operational.

## 🔧 Pre-Setup (Already Done ✅)

- [x] GitHub Actions workflow created
- [x] Backend tests written and passing
- [x] Frontend test structure created
- [x] Linting configuration added
- [x] Documentation written
- [x] Setup script created

## 🚀 Required Setup (You Must Do)

### 1. Link Vercel Project

- [ ] Run setup script: `./scripts/setup-cicd.sh`
  
  **OR manually:**
  
  ```bash
  cd frontend
  npx vercel link
  # Answer prompts to link your project
  ```

### 2. Get Vercel Credentials

- [ ] Get your Vercel IDs:
  ```bash
  cat frontend/.vercel/project.json
  ```
  
  You should see:
  ```json
  {
    "orgId": "team_xxxxx",
    "projectId": "prj_xxxxx"
  }
  ```

### 3. Create Vercel Token

- [ ] Go to https://vercel.com/account/tokens
- [ ] Click "Create Token"
- [ ] Name: `Dishcovery GitHub Actions`
- [ ] Scope: Full Access
- [ ] Expiration: No expiration (or as per your policy)
- [ ] Copy the token (you won't see it again!)

### 4. Add GitHub Secrets

- [ ] Go to your GitHub repo
- [ ] Navigate to: `Settings` → `Secrets and variables` → `Actions`
- [ ] Click `New repository secret` for each:

  **Secret 1:**
  - Name: `VERCEL_TOKEN`
  - Value: [paste token from step 3]
  
  **Secret 2:**
  - Name: `VERCEL_ORG_ID`
  - Value: [from step 2, the "orgId" value]
  
  **Secret 3:**
  - Name: `VERCEL_PROJECT_ID`
  - Value: [from step 2, the "projectId" value]

### 5. Test the Workflow

- [ ] Create a test branch:
  ```bash
  git checkout -b test/ci-cd-setup
  ```

- [ ] Make a small change (e.g., edit README):
  ```bash
  echo "# CI/CD Test" >> README_TEST.md
  git add README_TEST.md
  git commit -m "Test CI/CD workflow"
  git push origin test/ci-cd-setup
  ```

- [ ] Open a Pull Request on GitHub

- [ ] Watch the Actions tab - you should see:
  - ✅ `lint-and-test` job running
  - ✅ `build-frontend` job running
  - ✅ `deploy-preview` job running

- [ ] Check PR comments for Vercel preview URL

- [ ] If all checks pass ✅, merge the PR

- [ ] Verify `deploy-production` runs on main branch

## 🛡️ Recommended Setup (Best Practices)

### 6. Enable Branch Protection

- [ ] Go to: `Settings` → `Branches`
- [ ] Click `Add branch protection rule`
- [ ] Branch name pattern: `main`
- [ ] Enable these settings:
  - [x] Require a pull request before merging
  - [x] Require approvals: 1 (or more for team)
  - [x] Require status checks to pass before merging
    - [x] `lint-and-test`
    - [x] `build-frontend`
  - [x] Require branches to be up to date before merging
  - [ ] Require conversation resolution before merging (optional)
  - [ ] Include administrators (optional, but recommended)
- [ ] Click `Create` or `Save changes`

### 7. Configure Notifications (Optional)

- [ ] Add Slack webhook (if using Slack)
- [ ] Add Discord webhook (if using Discord)
- [ ] Configure email notifications in GitHub settings

### 8. Add Status Badge to README (Optional)

- [ ] Go to Actions tab
- [ ] Click on your workflow
- [ ] Click `...` → `Create status badge`
- [ ] Copy the markdown
- [ ] Add to your README.md:
  ```markdown
  ![CI/CD](https://github.com/YOUR_USERNAME/Dishcovery/workflows/Dishcovery%20CI/CD/badge.svg)
  ```

## 🧪 Validation Checklist

### Local Tests Work

- [ ] Backend linting works:
  ```bash
  cd backend && flake8 .
  ```

- [ ] Backend tests pass:
  ```bash
  cd backend && pytest tests/ -v
  ```

- [ ] Frontend builds successfully:
  ```bash
  cd frontend && npm run build-pwa
  ```

### CI/CD Pipeline Works

- [ ] Pull requests trigger workflow
- [ ] All jobs pass (lint-and-test, build-frontend)
- [ ] Preview deployment creates successfully
- [ ] Preview URL is accessible
- [ ] Merging PR triggers production deployment
- [ ] Production site updates successfully

## 📊 Post-Setup Tasks

### Immediate

- [ ] Delete test branch/PR from step 5
- [ ] Review workflow logs for any warnings
- [ ] Bookmark Vercel dashboard for monitoring
- [ ] Share setup with team members

### Short Term (This Week)

- [ ] Add more backend tests
- [ ] Configure ESLint for frontend
- [ ] Add Jest for frontend testing
- [ ] Document custom workflows for team

### Long Term (Nice to Have)

- [ ] Add code coverage reporting (Codecov/Coveralls)
- [ ] Add security scanning (Snyk, CodeQL)
- [ ] Set up staging environment
- [ ] Add performance monitoring
- [ ] Add automated dependency updates (Dependabot)

## 🆘 Troubleshooting

If something doesn't work:

1. **Check GitHub Actions logs**
   - Go to Actions tab
   - Click on failed workflow
   - Review error messages

2. **Verify secrets**
   - Settings → Secrets → Actions
   - All 3 secrets should be present
   - Re-create if suspicious

3. **Check Vercel connection**
   - Verify project is linked: `cat frontend/.vercel/project.json`
   - Check Vercel dashboard for project

4. **Review documentation**
   - `docs/CI_CD_SETUP.md` - Detailed guide
   - `docs/CI_CD_QUICKSTART.md` - Quick reference
   - `CI_CD_IMPLEMENTATION.md` - Implementation notes

## ✅ Final Verification

Once everything is checked:

- [ ] CI/CD pipeline is operational
- [ ] Team members understand workflow
- [ ] Documentation is accessible
- [ ] Monitoring is in place
- [ ] You're ready to ship! 🚀

---

**Completion Date:** ________________

**Verified By:** ________________

**Notes:**

_________________________________________________

_________________________________________________

_________________________________________________

---

**🎉 Congratulations! Your Dishcovery CI/CD pipeline is production-ready!**
