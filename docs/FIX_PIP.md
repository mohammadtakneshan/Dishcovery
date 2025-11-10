# 🔧 Fix: pip not found

## Problem
`pip` is not recognized - Python might not be installed or not in PATH

## Solutions (try in order):

### Option 1: Use `python -m pip`
```bash
cd backend
python -m pip install -r requirements.txt
python app.py
```

### Option 2: Use `py` launcher (Windows)
```bash
cd backend
py -m pip install -r requirements.txt
py app.py
```

### Option 3: Install Python
1. Download Python 3.10+ from: https://www.python.org/downloads/
2. **IMPORTANT**: Check "Add Python to PATH" during installation
3. Restart terminal
4. Try again: `pip install -r requirements.txt`

---

## Quick Test - Check if Python is installed

```bash
python --version
```

or

```bash
py --version
```

If these work, use **Option 1** or **Option 2** above ✅
