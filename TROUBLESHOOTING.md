# 🔧 Dishcovery Troubleshooting Guide

## Common Issues & Solutions

### Backend Issues

#### ❌ Port 5000 Already in Use
**Error:** `Address already in use - Port 5000 is in use by another program`

**Solution:**
Port 5000 is used by macOS AirPlay Receiver by default.

Option 1 (Recommended): Use port 5001 (already configured)
```bash
# Backend is already set to port 5001
python app.py  # Runs on port 5001
```

Option 2: Disable AirPlay Receiver
- System Preferences → General → AirDrop & Handoff
- Turn off "AirPlay Receiver"

---

#### ❌ Python 3.14 Compatibility Issues
**Error:** `TypeError: Metaclasses with custom tp_new are not supported`

**Solution:**
Python 3.14 is very new. Use Python 3.13 or 3.12.

```bash
# Remove old venv
cd backend
rm -rf venv

# Create new venv with Python 3.13
python3.13 -m venv venv  # or python3.12
source venv/bin/activate
pip install -r requirements.txt
```

---

#### ❌ Architecture Mismatch (ARM64 vs x86_64)
**Error:** `incompatible architecture (have 'arm64', need 'x86_64')`

**Solution:**
```bash
cd backend
rm -rf venv
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

---

#### ❌ Protobuf Import Error
**Error:** `ImportError: cannot import name '_message'`

**Solution:**
Upgrade protobuf to latest version:
```bash
source venv/bin/activate
pip install --upgrade protobuf google-generativeai
```

---

#### ❌ Google Generative AI Import Error
**Error:** Issues importing `google.generativeai`

**Solution:**
```bash
source venv/bin/activate
pip install --upgrade google-generativeai==0.8.3 protobuf>=5.29.1
```

---

#### ❌ Missing API Keys
**Error:** API returns errors about authentication

**Solution:**
1. Check `.env` file exists in `backend/` directory
2. Verify API keys are set correctly:
```bash
cat backend/.env
# Should show:
# GEMINI_API_KEY=your_actual_key_here
```

3. Get API keys:
- Gemini: https://makersuite.google.com/app/apikey
- OpenAI: https://platform.openai.com/api-keys

---

### Frontend Issues

#### ❌ Module Not Found Errors
**Error:** `Module not found: Can't resolve...`

**Solution:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

---

#### ❌ Expo Not Starting
**Error:** `Command 'expo' not found`

**Solution:**
```bash
cd frontend
npm install -g expo-cli
npm install
npm start
```

---

#### ❌ Metro Bundler Errors
**Error:** Metro bundler fails or hangs

**Solution:**
```bash
cd frontend
# Clear cache and restart
npm start -- --clear
```

---

### API Connection Issues

#### ❌ CORS Errors
**Error:** `Access to fetch at 'http://localhost:5001' has been blocked by CORS`

**Solution:**
1. Check backend `.env` has correct origins:
```env
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:19006,http://localhost:5001
```

2. Restart backend after changing `.env`

---

#### ❌ Cannot Connect to Backend
**Error:** `Failed to fetch` or `ERR_CONNECTION_REFUSED`

**Solution:**
1. Check backend is running:
```bash
curl http://localhost:5001/api/health
```

2. Verify port is correct (5001, not 5000)

3. Check firewall settings

---

### Installation Issues

#### ❌ Python Version Too Old
**Error:** `Python 3.9+ required`

**Solution:**
```bash
# Install Python 3.13
brew install python@3.13  # macOS
# or download from python.org

# Verify version
python3 --version
```

---

#### ❌ Node Version Issues
**Error:** `Requires Node 18+`

**Solution:**
```bash
# Install Node 18+
brew install node  # macOS
# or download from nodejs.org

# Verify version
node --version
```

---

## Verification Checklist

### Backend Health Check
```bash
cd backend
source venv/bin/activate
python app.py &
sleep 2
curl http://localhost:5001/api/health
# Should return: {"status": "healthy", ...}
```

### Frontend Health Check
```bash
cd frontend
npm start
# Should see: "Metro waiting on exp://..."
```

### Full Stack Test
```bash
# Terminal 1: Start backend
cd backend && source venv/bin/activate && python app.py

# Terminal 2: Test API
curl -X POST http://localhost:5001/api/generate-recipe \
  -H "Content-Type: application/json" \
  -d '{"ingredients": ["test"], "language": "en"}'

# Terminal 3: Start frontend
cd frontend && npm start
```

---

## Still Having Issues?

1. **Check Python/Node versions:**
```bash
python3 --version  # Should be 3.12 or 3.13
node --version     # Should be 18+
```

2. **Clean reinstall:**
```bash
# Backend
cd backend
rm -rf venv
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Frontend
cd frontend
rm -rf node_modules package-lock.json
npm install
```

3. **Check logs:**
```bash
# Backend errors
cd backend
source venv/bin/activate
python app.py  # See errors in terminal

# Frontend errors
cd frontend
npm start  # See errors in terminal
```

4. **Create GitHub issue:**
Include:
- Operating system
- Python version (`python3 --version`)
- Node version (`node --version`)
- Error message
- Steps you tried

---

## Quick Reference

### Working Configuration (2025-11-05)
- ✅ Python 3.13 (recommended) or 3.12
- ✅ Node.js 18+
- ✅ Backend port: 5001
- ✅ google-generativeai: 0.8.3+
- ✅ protobuf: 5.29.1+

### Commands That Should Work
```bash
# Backend
cd backend && source venv/bin/activate && python app.py

# Frontend  
cd frontend && npm start

# Health check
curl http://localhost:5001/api/health
```

---

**Last Updated:** 2025-11-05
**Tested On:** macOS (ARM64), Python 3.13, Node 18+
