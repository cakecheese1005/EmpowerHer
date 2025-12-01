# Fix: Firebase Auth Network Error

## Problem
You're getting: `FirebaseError: Firebase: Error (auth/network-request-failed)`

## Solution

The `.env.local` file exists with your Firebase config, but the **Next.js dev server needs to be restarted** to load the environment variables.

### Step 1: Restart the Dev Server

1. **Stop the current dev server**:
   - Press `Ctrl + C` in the terminal where `npm run dev` is running

2. **Start it again**:
   ```bash
   npm run dev
   ```

3. **Wait for it to fully start** - you should see:
   ```
   ✓ Ready in XXXXms
   - Local:        http://localhost:3000
   ```

### Step 2: Verify Environment Variables are Loaded

After restarting, the Firebase config should now be loaded. You can verify in the browser console - it should connect to Firebase successfully.

### Step 3: Check Firebase Authentication is Enabled

Make sure Email/Password authentication is enabled in Firebase Console:

1. Go to: https://console.firebase.google.com/project/studio-9165758963-a10e4/authentication
2. Click **"Sign-in method"** tab
3. Make sure **"Email/Password"** provider is enabled
4. If not enabled, click on it and toggle **"Enable"**

---

## Why This Happened

The Next.js dev server reads environment variables from `.env.local` only when it starts. If the file was created or modified after the server started, it won't have the Firebase configuration loaded.

---

## Quick Test After Restart

1. Go to http://localhost:3000/login
2. Try to sign up or log in
3. The network error should be gone

---

## If Still Getting Errors

If you still get errors after restarting:

1. **Check browser console** for specific error messages
2. **Verify Firebase Auth is enabled** in Firebase Console
3. **Check network tab** - make sure requests to `identitytoolkit.googleapis.com` aren't being blocked
4. **Check firewall/antivirus** - might be blocking Firebase requests

---

## Your Firebase Config (Already Set)

Your `.env.local` file has:
- ✅ API Key
- ✅ Auth Domain
- ✅ Project ID
- ✅ Storage Bucket
- ✅ Messaging Sender ID
- ✅ App ID

Just need to restart the dev server! 🚀


