# Quick Environment Variables Setup 🚀

## Step-by-Step Guide (5 minutes)

### Step 1: Get Your Firebase Config Values

1. **Open Firebase Console:**
   - Go to: https://console.firebase.google.com/
   - Select your project (or create one if needed)

2. **Navigate to Project Settings:**
   ```
   Click the ⚙️ gear icon (top left) → Project settings
   ```

3. **Find Your Web App Config:**
   - Scroll down to "Your apps" section
   - Look for a Web app (icon: `</>`)
   - If you don't have one, click "Add app" → Select Web icon
   - Give it a name like "EmpowerHer Web"

4. **Copy Configuration:**
   You'll see something like this:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSy...",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "123456789012",
     appId: "1:123456789012:web:abc..."
   };
   ```

### Step 2: Create `.env.local` File

In your project root directory, create a file named `.env.local`:

```bash
# Using terminal (from project root)
touch .env.local
```

Or create it manually in your code editor.

### Step 3: Add Your Values

Open `.env.local` and add your Firebase values:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=PASTE_YOUR_API_KEY_HERE
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=PASTE_YOUR_AUTH_DOMAIN_HERE
NEXT_PUBLIC_FIREBASE_PROJECT_ID=PASTE_YOUR_PROJECT_ID_HERE
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=PASTE_YOUR_STORAGE_BUCKET_HERE
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=PASTE_YOUR_SENDER_ID_HERE
NEXT_PUBLIC_FIREBASE_APP_ID=PASTE_YOUR_APP_ID_HERE
```

**Map Firebase values like this:**

| Firebase Config | Environment Variable |
|----------------|---------------------|
| `apiKey` | `NEXT_PUBLIC_FIREBASE_API_KEY` |
| `authDomain` | `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` |
| `projectId` | `NEXT_PUBLIC_FIREBASE_PROJECT_ID` |
| `storageBucket` | `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` |
| `messagingSenderId` | `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` |
| `appId` | `NEXT_PUBLIC_FIREBASE_APP_ID` |

### Step 4: Enable Firebase Services

#### Enable Authentication:
1. Go to: Firebase Console → Authentication
2. Click "Get Started"
3. Go to "Sign-in method" tab
4. Enable "Email/Password"

#### Enable Firestore:
1. Go to: Firebase Console → Firestore Database
2. Click "Create database"
3. Start in "test mode" (for now)
4. Choose a location

#### Enable Storage:
1. Go to: Firebase Console → Storage
2. Click "Get Started"
3. Start in "test mode"

### Step 5: Restart Server

```bash
# Stop your server (Ctrl+C or Cmd+C)
# Then restart:
npm run dev
```

### Step 6: Test It!

1. Open http://localhost:3000
2. Try to sign up a new account
3. If it works, you're all set! ✅

---

## Example `.env.local` File

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyC1234567890abcdefghijklmnopqrstuvwxyz
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=empowerher-app.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=empowerher-app
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=empowerher-app.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890abcdef
```

---

## Common Issues & Solutions

### ❌ "api-key-not-valid"
- Check that you copied the entire API key (they're long!)
- No extra spaces or quotes

### ❌ Variables not loading
- File must be named exactly `.env.local` (check for hidden characters)
- Restart your dev server after changes
- All variables must start with `NEXT_PUBLIC_`

### ❌ "unauthorized-domain"
- Go to: Firebase Console → Authentication → Settings → Authorized domains
- Add: `localhost`

### ❌ "Permission denied"
- Make sure Firestore rules allow authenticated users
- Check that Authentication is enabled

---

## Visual Guide

```
Firebase Console
    ↓
Project Settings (⚙️)
    ↓
Your apps → Web app
    ↓
Copy config values
    ↓
Paste into .env.local
    ↓
Restart server
    ↓
Done! ✅
```

---

## Quick Checklist

- [ ] Opened Firebase Console
- [ ] Found/copied Firebase config values
- [ ] Created `.env.local` file
- [ ] Added all 6 environment variables
- [ ] Enabled Authentication
- [ ] Enabled Firestore
- [ ] Enabled Storage
- [ ] Restarted dev server
- [ ] Tested signup/login

---

## Need Help?

1. Check `ENV_SETUP_GUIDE.md` for detailed instructions
2. Check browser console for error messages
3. Verify all Firebase services are enabled
4. Make sure `.env.local` format is correct (no quotes, no spaces)

**You got this! 🎉**


