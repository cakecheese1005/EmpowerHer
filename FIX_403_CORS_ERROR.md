# 🔧 Fixing 403 CORS Error on Firebase Functions

## Problem
Getting a `403 Forbidden` error on the preflight (OPTIONS) request when calling Firebase Callable Function:
```
Preflight response is not successful. Status code: 403
Fetch API cannot load https://us-central1-studio-9165758963-a10e4.cloudfunctions.net/predict due to access control checks.
```

## Root Cause
Firebase Callable Functions should automatically handle CORS, but the 403 suggests the request is being blocked before it reaches the function. This could be due to:

1. **Firebase Functions Configuration**: The function might need CORS explicitly enabled
2. **Authentication Token**: The auth token might not be attached to the request
3. **Function URL/Region**: The function region might not match between client and server

## Solutions Applied

### 1. ✅ Improved Firestore Network Connectivity
- Added retry logic to ensure Firestore stays online
- This prevents authentication token refresh issues

### 2. ✅ Added Auth Token Verification
- Getting auth token explicitly before calling the function
- This ensures the token is ready and attached

### 3. 🔍 Check Firebase Console Settings

**Important:** Check these settings in Firebase Console:

1. **Function Ingress Settings**:
   - Go to Firebase Console → Functions
   - Click on the `predict` function
   - Check "Ingress settings"
   - Should be set to "Allow all traffic" or "Allow internal traffic and Cloud Load Balancing"

2. **Authentication Providers**:
   - Go to Firebase Console → Authentication → Sign-in method
   - Ensure Email/Password is enabled
   - Ensure Google is enabled (if using Google login)

3. **Function Permissions**:
   - Ensure the function allows authenticated requests
   - Check if there are any IAM restrictions

### 4. 🔍 Verify Function Deployment

Check that the function is deployed correctly:
```bash
firebase functions:list | grep predict
```

Should show:
```
predict      │ v1      │ callable │ us-central1 │ 512    │ nodejs20 │
```

### 5. 🔄 Test the Function Directly

Try calling the function using curl to see the raw response:
```bash
# Get your auth token from browser console:
# await firebase.auth().currentUser.getIdToken()

curl -X POST \
  https://us-central1-studio-9165758963-a10e4.cloudfunctions.net/predict \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"data":{"age":28,"weight":65,"height":165,"cycleRegularity":"irregular","exerciseFrequency":"1-2_week","diet":"balanced"}}'
```

## Next Steps

1. **Restart the Next.js dev server** after these changes
2. **Try the assessment again**
3. **Check browser console** for more detailed error messages
4. **Check Firebase Function logs**:
   ```bash
   firebase functions:log --only predict
   ```

If the issue persists, the function might need to be reconfigured in Firebase Console to allow CORS properly.


