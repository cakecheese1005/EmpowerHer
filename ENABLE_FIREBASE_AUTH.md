# Enable Email/Password Authentication in Firebase

## ⚠️ IMPORTANT: Enable Email/Password Auth

The signup is likely failing because **Email/Password authentication is not enabled** in your Firebase project.

## Steps to Enable:

1. **Go to Firebase Console:**
   - Open: https://console.firebase.google.com/project/studio-9165758963-a10e4/authentication/providers

2. **Enable Email/Password:**
   - Click on **"Email/Password"** provider
   - Toggle **"Enable"** to ON
   - Make sure **"Email/Password"** (first option) is enabled
   - Click **"Save"**

3. **Verify it's enabled:**
   - You should see "Email/Password" listed as **"Enabled"** in the providers list

## Alternative: Quick Check

You can also check by going to:
```
https://console.firebase.google.com/project/studio-9165758963-a10e4/authentication
```

Click **"Sign-in method"** tab, and verify **"Email/Password"** shows as enabled.

## After Enabling:

1. Wait 10-30 seconds for changes to propagate
2. Refresh your browser at http://localhost:3000/signup
3. Try signing up again

## Common Issues:

- **"auth/operation-not-allowed"** - Email/Password is not enabled
- **"auth/network-request-failed"** - Network issue OR auth provider not enabled
- **"Creating account..." hangs** - Usually means Email/Password auth is disabled

---

## Quick Test:

After enabling, try signing up again. You should see in the browser console:
- "Starting signup for: your@email.com"
- "User created: [user-id]"
- Then redirect to dashboard

If you still see errors, check the browser console (F12) for specific error messages.


