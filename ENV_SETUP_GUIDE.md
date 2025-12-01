# Environment Variables Setup Guide

This guide will help you set up your Firebase environment variables for the Next.js app.

## Step 1: Create `.env.local` File

Create a new file called `.env.local` in the root directory of your project (same level as `package.json`).

```bash
# From the project root directory
touch .env.local
```

Or you can create it manually in your code editor.

## Step 2: Get Firebase Configuration Values

You need to get these values from your Firebase Console.

### Option A: From Firebase Console (Recommended)

1. **Go to Firebase Console:**
   - Visit: https://console.firebase.google.com/
   - Select your project (or create a new one if you haven't)

2. **Get Project Settings:**
   - Click the ⚙️ (gear icon) next to "Project Overview"
   - Select "Project settings"

3. **Scroll to "Your apps" section:**
   - You'll see different platforms (iOS, Android, Web)
   - If you don't have a Web app, click "Add app" → Select "Web" (</> icon)
   - Give it a name (e.g., "EmpowerHer Web")
   - Click "Register app"

4. **Copy the Configuration:**
   - You'll see a code snippet like this:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "123456789012",
     appId: "1:123456789012:web:abcdef123456789"
   };
   ```

5. **Map to Environment Variables:**
   - `apiKey` → `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `authDomain` → `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `projectId` → `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `storageBucket` → `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `messagingSenderId` → `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `appId` → `NEXT_PUBLIC_FIREBASE_APP_ID`

### Option B: From Existing Firebase Project

If you already have a Firebase project set up:

1. Go to Firebase Console → Your Project
2. Project Settings (⚙️ icon)
3. Scroll to "Your apps" section
4. Click on your Web app
5. Copy the configuration values

## Step 3: Fill in `.env.local` File

Create `.env.local` with the following format:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key-here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef123456789

# Optional: For local Firebase emulator development
# NEXT_PUBLIC_USE_EMULATOR=true
```

### Important Notes:

1. **No quotes needed** - Don't wrap values in quotes in `.env.local`
2. **NEXT_PUBLIC_ prefix** - All variables MUST start with `NEXT_PUBLIC_` to be accessible in the browser
3. **No spaces** - Make sure there are no spaces around the `=` sign
4. **Restart server** - After creating/modifying `.env.local`, restart your dev server

## Step 4: Verify Your Setup

1. **Restart your development server:**
   ```bash
   # Stop the current server (Ctrl+C)
   # Then restart it
   npm run dev
   ```

2. **Check if variables are loaded:**
   - Open your browser console
   - The app should initialize Firebase without errors
   - Check the Network tab for Firebase requests

3. **Test authentication:**
   - Try signing up a new user
   - If it works, your environment variables are set up correctly!

## Step 5: Enable Firebase Services

Make sure these Firebase services are enabled in your Firebase Console:

### 1. Authentication
- Go to: Firebase Console → Authentication
- Click "Get Started"
- Enable "Email/Password" sign-in method
- (Optional) Enable "Google" sign-in if you want

### 2. Firestore Database
- Go to: Firebase Console → Firestore Database
- Click "Create database"
- Start in "test mode" (for development)
- Choose a location closest to your users

### 3. Storage
- Go to: Firebase Console → Storage
- Click "Get Started"
- Start in "test mode" (for development)
- Use the same location as Firestore

### 4. Functions
- Go to: Firebase Console → Functions
- Click "Get Started"
- Follow the prompts (requires billing for production)

## Example `.env.local` File

Here's a complete example (with placeholder values):

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyC1234567890abcdefghijklmnopqrstuvwxyz
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=empowerher-app.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=empowerher-app
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=empowerher-app.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890abcdef

# Optional: Enable Firebase Emulator for local development
# NEXT_PUBLIC_USE_EMULATOR=true
```

## Troubleshooting

### Issue: "Firebase: Error (auth/api-key-not-valid)"
- **Solution**: Double-check your `NEXT_PUBLIC_FIREBASE_API_KEY` value
- Make sure there are no extra spaces or quotes

### Issue: "Firebase: Error (auth/unauthorized-domain)"
- **Solution**: Add your domain to authorized domains in Firebase Console
- Go to: Authentication → Settings → Authorized domains
- Add: `localhost` (for development)

### Issue: Variables not loading
- **Solution**: 
  1. Make sure file is named exactly `.env.local` (not `.env.local.txt`)
  2. Restart your development server
  3. Make sure all variables start with `NEXT_PUBLIC_`

### Issue: "Permission denied" errors
- **Solution**: 
  1. Check Firestore security rules
  2. Make sure Authentication is enabled
  3. Deploy security rules: `firebase deploy --only firestore:rules`

## Security Notes

1. **Never commit `.env.local`** - This file should already be in `.gitignore`
2. **Use different projects** - Use separate Firebase projects for development and production
3. **Restrict API keys** - In production, restrict your API keys in Google Cloud Console

## For Production Deployment

When deploying to production (Vercel, Netlify, etc.):

1. Go to your hosting platform's environment variables settings
2. Add all the same variables
3. Use your production Firebase project values

### Vercel Example:
- Go to: Vercel Dashboard → Your Project → Settings → Environment Variables
- Add each variable one by one
- Deploy again to apply changes

## Quick Checklist

- [ ] Created `.env.local` file in project root
- [ ] Got Firebase config from Firebase Console
- [ ] Added all 6 required environment variables
- [ ] Enabled Authentication in Firebase Console
- [ ] Enabled Firestore Database
- [ ] Enabled Storage
- [ ] Restarted development server
- [ ] Tested signup/login functionality

## Still Need Help?

If you're still having issues:

1. Check the browser console for error messages
2. Verify your Firebase project is set up correctly
3. Make sure all Firebase services are enabled
4. Check that your `.env.local` file format is correct (no quotes, no spaces around `=`)

---

**Next Steps:**
- Once environment variables are set up, you can test the authentication
- Complete an assessment to test the full integration
- Check the dashboard to see real data from Firestore


