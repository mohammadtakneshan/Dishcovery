#!/bin/bash

# Dishcovery Quick Setup Script
# This script helps you set up the Dishcovery project quickly

echo "🍽️  Dishcovery Setup Script"
echo "=========================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check prerequisites
echo "Checking prerequisites..."

# Check Python
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version)
    echo -e "${GREEN}✓${NC} Python found: $PYTHON_VERSION"
else
    echo -e "${RED}✗${NC} Python 3 not found. Please install Python 3.9+"
    exit 1
fi

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✓${NC} Node.js found: $NODE_VERSION"
else
    echo -e "${RED}✗${NC} Node.js not found. Please install Node.js 18+"
    exit 1
fi

# Check npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}✓${NC} npm found: $NPM_VERSION"
else
    echo -e "${RED}✗${NC} npm not found. Please install npm"
    exit 1
fi

echo ""
echo "Setting up backend..."
cd backend

# Create virtual environment
if [ ! -d "venv" ]; then
    python3 -m venv venv
    echo -e "${GREEN}✓${NC} Virtual environment created"
else
    echo -e "${YELLOW}⚠${NC} Virtual environment already exists"
fi

# Activate virtual environment
source venv/bin/activate 2>/dev/null || source venv/Scripts/activate 2>/dev/null

# Install Python dependencies
pip install -q --upgrade pip
pip install -q -r requirements.txt
echo -e "${GREEN}✓${NC} Backend dependencies installed"

# Create .env if not exists
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo -e "${YELLOW}⚠${NC} Created .env file - Please add your API keys!"
else
    echo -e "${YELLOW}⚠${NC} .env file already exists"
fi

cd ..

echo ""
echo "Setting up frontend..."
cd frontend

# Install frontend dependencies
npm install --silent
echo -e "${GREEN}✓${NC} Frontend dependencies installed"

cd ..

echo ""
echo -e "${GREEN}✓✓✓ Setup complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Add your API keys to backend/.env"
echo "2. Start backend: cd backend && source venv/bin/activate && python app.py"
echo "3. Start frontend: cd frontend && npm start"
echo ""
echo "For more information, see README.md"
