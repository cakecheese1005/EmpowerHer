# Get Started: Setting Up Your Environment Variables

## 🎯 What You Need

You need to set up Firebase configuration values so your app can connect to Firebase services (Authentication, Firestore, etc.).

## 📋 Quick Start (Choose One)

### Option 1: Quick Setup Guide (5 min)
📄 Read: `QUICK_ENV_SETUP.md`

### Option 2: Detailed Guide (10 min)
📄 Read: `ENV_SETUP_GUIDE.md`

---

## 🔍 Where to Get Firebase Values

### Step 1: Go to Firebase Console
🔗 **URL**: https://console.firebase.google.com/

### Step 2: Select Your Project
- Click on your project name
- Or create a new project if you don't have one

### Step 3: Get Configuration Values
1. Click the ⚙️ **gear icon** (top left)
2. Click **"Project settings"**
3. Scroll down to **"Your apps"** section
4. Find or create a **Web app** (icon: `</>`)
5. Copy the configuration values

### Step 4: What You'll See

You'll see something like this in Firebase Console:

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

---

## 📝 Create `.env.local` File

### Location
Create the file in the **root directory** of your project (same folder as `package.json`).

### File Name
Exactly: `.env.local` (note the dot at the beginning)

### Content Format

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-value-here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-value-here
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-value-here
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-value-here
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-value-here
NEXT_PUBLIC_FIREBASE_APP_ID=your-value-here
```

### Mapping Firebase Values

| What Firebase Shows | What to Put in .env.local |
|---------------------|---------------------------|
| `apiKey: "AIza..."` | `NEXT_PUBLIC_FIREBASE_API_KEY=AIza...` |
| `authDomain: "..."` | `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...` |
| `projectId: "..."` | `NEXT_PUBLIC_FIREBASE_PROJECT_ID=...` |
| `storageBucket: "..."` | `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...` |
| `messagingSenderId: "..."` | `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...` |
| `appId: "..."` | `NEXT_PUBLIC_FIREBASE_APP_ID=...` |

---

## ⚙️ Enable Required Firebase Services

Before testing, make sure these are enabled in Firebase Console:

### ✅ Authentication
- **Path**: Firebase Console → Authentication → Get Started
- **Enable**: Email/Password sign-in method

### ✅ Firestore Database
- **Path**: Firebase Console → Firestore Database → Create database
- **Mode**: Start in "test mode" (for development)

### ✅ Storage
- **Path**: Firebase Console → Storage → Get Started
- **Mode**: Start in "test mode"

---

## 🚀 After Setup

1. **Restart your development server:**
   ```bash
   # Stop (Ctrl+C or Cmd+C)
   npm run dev
   ```

2. **Test authentication:**
   - Go to http://localhost:3000
   - Click "Sign up" or go to `/signup`
   - Try creating an account
   - If it works, you're all set! ✅

---

## ❓ Troubleshooting

### Can't find the values?
- Make sure you're looking at the Web app (not iOS/Android)
- Create a Web app if you don't have one

### Values not working?
- Check for extra spaces or quotes (should be: `KEY=value`)
- Make sure all variables start with `NEXT_PUBLIC_`
- Restart your dev server after changes

### Still having issues?
- Check browser console for error messages
- Verify all Firebase services are enabled
- See detailed troubleshooting in `ENV_SETUP_GUIDE.md`

---

## 📚 Documentation Files

- **`QUICK_ENV_SETUP.md`** - Quick 5-minute guide
- **`ENV_SETUP_GUIDE.md`** - Detailed step-by-step guide
- **`.env.local.example`** - Template file you can copy

---

## ✅ Checklist

- [ ] Opened Firebase Console
- [ ] Found Firebase configuration values
- [ ] Created `.env.local` file
- [ ] Added all 6 environment variables
- [ ] Enabled Authentication in Firebase
- [ ] Enabled Firestore in Firebase
- [ ] Enabled Storage in Firebase
- [ ] Restarted development server
- [ ] Tested signup/login successfully

---

**You're ready to go! 🎉**

Once environment variables are set up, you can:
- ✅ Sign up and log in
- ✅ Complete assessments
- ✅ See real results on dashboard
- ✅ All data will save to Firebase


