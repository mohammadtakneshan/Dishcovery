#!/bin/bash

# Dishcovery CI/CD Quick Setup Script

echo "🚀 Setting up Dishcovery CI/CD..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running from project root
if [ ! -f "setup.sh" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

echo ""
echo "${YELLOW}Step 1: Installing backend test dependencies...${NC}"
cd backend
pip install pytest pytest-cov flake8
cd ..

echo ""
echo "${GREEN}✅ Backend test dependencies installed${NC}"

echo ""
echo "${YELLOW}Step 2: Linking Vercel project...${NC}"
echo "Follow the prompts to link your Vercel project:"
cd frontend
npx vercel link
cd ..

echo ""
echo "${GREEN}✅ Vercel project linked${NC}"

echo ""
echo "${YELLOW}Step 3: Getting Vercel credentials...${NC}"
if [ -f "frontend/.vercel/project.json" ]; then
    echo "📋 Your Vercel credentials:"
    echo ""
    cat frontend/.vercel/project.json
    echo ""
    echo "${YELLOW}Copy the orgId and projectId values to GitHub Secrets${NC}"
else
    echo "⚠️  Vercel project not linked. Run 'cd frontend && npx vercel link' manually"
fi

echo ""
echo "${YELLOW}Step 4: GitHub Secrets Setup${NC}"
echo "Add these secrets to your GitHub repository:"
echo "  Settings > Secrets and variables > Actions > New repository secret"
echo ""
echo "Required secrets:"
echo "  1. VERCEL_TOKEN - Get from https://vercel.com/account/tokens"
echo "  2. VERCEL_ORG_ID - From the project.json above"
echo "  3. VERCEL_PROJECT_ID - From the project.json above"

echo ""
echo "${GREEN}✅ Setup complete!${NC}"
echo ""
echo "📚 Next steps:"
echo "  1. Add the GitHub secrets mentioned above"
echo "  2. Review .github/workflows/dishcovery-ci.yml"
echo "  3. Read docs/CI_CD_SETUP.md for detailed instructions"
echo "  4. Create a test PR to verify the workflow"
echo ""
echo "🎉 Happy deploying!"
