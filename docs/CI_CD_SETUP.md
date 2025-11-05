# 🚀 Dishcovery CI/CD Setup Guide

This guide explains the GitHub Actions CI/CD pipeline for Dishcovery.

## 📋 Overview

The CI/CD pipeline automates:
- ✅ Code linting (frontend & backend)
- ✅ Running tests
- ✅ Building the PWA
- ✅ Deploying to Vercel (preview for PRs, production for main)

## 🔐 Required GitHub Secrets

Add these secrets in your GitHub repository settings (`Settings > Secrets and variables > Actions`):

### Vercel Secrets

1. **VERCEL_TOKEN**
   - Go to [Vercel Dashboard](https://vercel.com/account/tokens)
   - Create a new token
   - Copy and add to GitHub secrets

2. **VERCEL_ORG_ID**
   ```bash
   # Run in your project root
   cat .vercel/project.json
   # Copy the "orgId" value
   ```

3. **VERCEL_PROJECT_ID**
   ```bash
   # Run in your project root
   cat .vercel/project.json
   # Copy the "projectId" value
   ```

### Getting Vercel IDs

If you don't have a `.vercel` directory yet:

```bash
cd frontend
npx vercel link
# Follow the prompts to link your project
# This creates .vercel/project.json with the IDs
```

## 🔄 Workflow Triggers

### Pull Requests
- Runs on all PRs to `main` branch
- Performs: lint → test → build → deploy preview
- Creates a preview deployment on Vercel

### Push to Main
- Runs when code is merged to `main`
- Performs: lint → test → build → deploy production
- Deploys to production Vercel environment

## 🛠️ Local Testing

### Backend Tests
```bash
cd backend
pip install -r requirements.txt
pip install pytest pytest-cov flake8

# Run linter
flake8 .

# Run tests
pytest tests/

# Run tests with coverage
pytest tests/ --cov=. --cov-report=html
```

### Frontend Tests
```bash
cd frontend
npm install

# Run linter (when configured)
npm run lint

# Run tests (when configured)
npm test

# Build PWA
npm run build-pwa
```

## 📊 Pipeline Jobs

### 1. **lint-and-test**
- Sets up Node.js and Python
- Installs dependencies (cached)
- Runs linters (ESLint, Flake8)
- Runs test suites

### 2. **build-frontend**
- Builds the Expo PWA
- Uploads build artifacts
- Runs only if lint-and-test passes

### 3. **deploy-preview** (PRs only)
- Downloads build artifacts
- Deploys to Vercel preview environment
- Posts preview URL in PR comments

### 4. **deploy-production** (main branch only)
- Downloads build artifacts
- Deploys to Vercel production
- Updates live site

## 🎯 Branch Protection Rules

Recommended settings for `main` branch:

1. Go to `Settings > Branches > Branch protection rules`
2. Add rule for `main`:
   - ✅ Require a pull request before merging
   - ✅ Require status checks to pass before merging
     - Select: `lint-and-test`
     - Select: `build-frontend`
   - ✅ Require branches to be up to date before merging
   - ✅ Do not allow bypassing the above settings

## 📝 Adding Tests

### Backend Tests

Create new test files in `backend/tests/`:

```python
# backend/tests/test_your_feature.py
import pytest

def test_your_feature(client):
    response = client.get('/api/your-endpoint')
    assert response.status_code == 200
```

### Frontend Tests (Coming Soon)

Install Jest and React Testing Library:

```bash
cd frontend
npm install --save-dev jest @testing-library/react @testing-library/react-native
```

Create test files alongside components:
```javascript
// frontend/src/components/__tests__/YourComponent.test.js
import { render } from '@testing-library/react-native';
import YourComponent from '../YourComponent';

test('renders correctly', () => {
  const { getByText } = render(<YourComponent />);
  expect(getByText('Hello')).toBeTruthy();
});
```

## 🚨 Troubleshooting

### Build Fails on Vercel
- Check that `frontend/web-build` directory is created
- Verify `vercel.json` configuration
- Ensure all environment variables are set in Vercel dashboard

### Tests Failing
- Run tests locally first: `pytest tests/` or `npm test`
- Check for missing dependencies in `requirements.txt` or `package.json`
- Verify environment variables are not required for tests

### Linting Errors
- Run linters locally: `flake8 .` or `npm run lint`
- Fix errors before pushing
- Use `--fix` flag for auto-fixable issues (ESLint)

### Deployment Not Triggering
- Check GitHub Actions tab for errors
- Verify secrets are properly set
- Ensure workflow file is in `.github/workflows/`

## 🔧 Customization

### Adding More Checks

Edit `.github/workflows/dishcovery-ci.yml`:

```yaml
- name: Security scan
  run: npm audit --audit-level=high
  
- name: Type checking
  run: npm run type-check
```

### Notifications

Add Slack/Discord notifications:

```yaml
- name: Notify on success
  if: success()
  uses: slackapi/slack-github-action@v1
  with:
    webhook-url: ${{ secrets.SLACK_WEBHOOK }}
    payload: |
      {
        "text": "✅ Dishcovery deployed successfully!"
      }
```

## 📚 Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vercel CLI Documentation](https://vercel.com/docs/cli)
- [pytest Documentation](https://docs.pytest.org/)
- [ESLint Documentation](https://eslint.org/)

## ✅ Checklist

Before enabling CI/CD:

- [ ] Add all required secrets to GitHub
- [ ] Link project to Vercel
- [ ] Test backend locally with `pytest tests/`
- [ ] Test frontend build with `npm run build-pwa`
- [ ] Enable branch protection on `main`
- [ ] Create a test PR to verify workflow
- [ ] Monitor first deployment

---

🎉 Your CI/CD pipeline is now ready! Every PR will be automatically tested and deployed as a preview, and merges to main will go live instantly.
