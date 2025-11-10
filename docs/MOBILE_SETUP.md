# Dishcovery - Mobile Development Setup Guide

## The Problem
When using Expo tunnel mode (for phone testing), your phone cannot directly access your laptop's local IP address (172.22.82.111:5001) for the backend API.

## The Solution
You have two options:

### Option 1: Use Tunnel for Backend (RECOMMENDED)

1. **Start the Backend with Tunnel**:
   ```bash
   cd backend
   start-tunnel.bat
   ```
   
   This will:
   - Start your Flask backend on port 5001
   - Create a public tunnel URL (e.g., `https://random-name.loca.lt`)
   - Copy the tunnel URL from the terminal

2. **Update Frontend .env**:
   ```bash
   cd frontend
   # Edit .env file and replace:
   EXPO_PUBLIC_API_URL=https://YOUR-TUNNEL-URL-HERE
   ```
   Example: `EXPO_PUBLIC_API_URL=https://funny-cats-1234.loca.lt`

3. **Restart Expo**:
   ```bash
   npx expo start --tunnel
   ```

4. **Scan QR code** with Expo Go app on your phone

### Option 2: Use LAN Mode (simpler, but requires same WiFi)

1. **Start Backend**:
   ```bash
   cd backend
   python app.py
   ```

2. **Ensure .env has local IP**:
   ```bash
   cd frontend
   # .env should have:
   EXPO_PUBLIC_API_URL=http://172.22.82.111:5001
   ```

3. **Start Expo in LAN mode** (instead of tunnel):
   ```bash
   npx expo start --lan
   ```
   
4. **Important**: Make sure Windows Firewall allows Python:
   - Go to Windows Defender Firewall
   - Allow an app through firewall
   - Make sure Python is allowed on Private networks

5. **Scan QR code** with Expo Go app

## Testing the Setup

After setup, test by:
1. Opening the app on your phone
2. Selecting a food photo
3. Clicking "Generate Recipe"
4. Check the Expo terminal for console logs
5. Check the Flask terminal for incoming requests

## Common Issues

### "Empty image file" error
- **Fixed**: Updated ImagePicker to use `MediaType.Images` instead of deprecated `MediaTypeOptions`
- The image should now upload correctly

### Backend returns 400 error
- Check Flask terminal logs for specific error
- Verify image is being received (check file size in logs)
- Ensure GEMINI_API_KEY is set in backend/.env

### "Network error" or timeout
- Verify tunnel URL is correct in frontend/.env
- Test tunnel URL in browser: `https://your-tunnel-url/api/health`
- If using LAN mode, verify firewall allows Python

## Current Status
✅ Expo package updated to 54.0.23
✅ ImagePicker deprecation warning fixed  
✅ Added better error logging
✅ Image validation improved
✅ Localtunnel installed for backend tunneling
