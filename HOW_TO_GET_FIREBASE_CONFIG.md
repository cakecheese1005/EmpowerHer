# How to Get Firebase Configuration Values

## 🔍 Where to Find Your Firebase Config

### Step 1: Go to Firebase Console

1. Open: https://console.firebase.google.com/
2. Select your project: **studio-9165758963-a10e4**

### Step 2: Get Web App Configuration

1. In Firebase Console, click the **gear icon** (⚙️) next to "Project Overview"
2. Select **"Project settings"**
3. Scroll down to **"Your apps"** section
4. If you see a web app already, click on it (it should have the `</>` icon)
5. If no web app exists, click **"Add app"** → Select **"Web"** (`</>` icon)
6. Register your app (give it a nickname like "EmpowerHer Web")

### Step 3: Copy Configuration Values

You'll see a code block that looks like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC5ZSEUIrh4Ajs9EVpsmwWgL9ID3sjma5U",
  authDomain: "studio-9165758963-a10e4.firebaseapp.com",
  projectId: "studio-9165758963-a10e4",
  storageBucket: "studio-9165758963-a10e4.firebasestorage.app",
  messagingSenderId: "893349237440",
  appId: "1:893349237440:web:9a6b950044d73d8f7f1325"
};
```

### Step 4: Copy Each Value

From the code block above, copy each value:

| Environment Variable | Value |
|---------------------|-------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | `AIzaSyC5ZSEUIrh4Ajs9EVpsmwWgL9ID3sjma5U` |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `studio-9165758963-a10e4.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `studio-9165758963-a10e4` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | `studio-9165758963-a10e4.firebasestorage.app` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | `893349237440` |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | `1:893349237440:web:9a6b950044d73d8f7f1325` |

---

## ✅ Quick Method - Direct Link

**Open this direct link:**
https://console.firebase.google.com/project/studio-9165758963-a10e4/settings/general/web

This will take you directly to your project settings where you can see all the config values.

---

## 📝 Your Current Values (Already Set!)

Looking at your setup, you already have these values configured in `.env.local`:

```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyC5ZSEUIrh4Ajs9EVpsmwWgL9ID3sjma5U
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=studio-9165758963-a10e4.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=studio-9165758963-a10e4
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=studio-9165758963-a10e4.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=893349237440
NEXT_PUBLIC_FIREBASE_APP_ID=1:893349237440:web:9a6b950044d73d8f7f1325
```

These are already correct! ✅

---

## 🔧 If You Need to Verify or Update

1. **Check your `.env.local` file:**
   ```bash
   cat .env.local
   ```

2. **Update if needed:**
   - Open `.env.local` in your editor
   - Update the values if they're incorrect
   - Restart your dev server

---

## 💡 Why NEXT_PUBLIC_ Prefix?

In Next.js, environment variables that start with `NEXT_PUBLIC_` are exposed to the browser. This is required for Firebase config since it runs in the browser.

---

## 📍 Direct Links

- **Project Settings**: https://console.firebase.google.com/project/studio-9165758963-a10e4/settings/general
- **Web App Config**: https://console.firebase.google.com/project/studio-9165758963-a10e4/settings/general/web

---

Your config is already set correctly! The values in your `.env.local` file match what Firebase provides. 🎉


