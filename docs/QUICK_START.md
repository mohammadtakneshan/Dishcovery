# 🚀 Quick Test Commands

## Test Backend (3 commands)

```bash
cd backend
pip install -r requirements.txt
python app.py
```

That's it! Server runs on **http://localhost:5001**

## Test Full Flow

**Terminal 1 (Backend):**
```bash
cd backend
python app.py
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm install
npm start
```

Then press **W** for web, upload a food photo, click "Generate Recipe"

## Quick API Test (with cURL)

```bash
curl -X POST http://localhost:5001/api/generate-recipe -F "file=@path/to/food-image.jpg"
```

## Check if API key works

```bash
cd backend
python test_gemini_key.py
```

---

**Your Gemini API key is already configured in `backend/.env`** ✅
