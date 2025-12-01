# 🔍 Current Prediction Status

## ✅ What's Currently Active: **MOCK PREDICTIONS**

Your app is currently showing **mock/rule-based predictions**, NOT real ML model predictions.

### Why Mock Predictions?

1. **Server-side (Firebase Functions)**: `DEV_MODE = true` is hardcoded
   - Location: `functions/src/utils/mlModel.ts` line 16
   - This bypasses the real ML service and uses rule-based calculations

2. **Client-side fallback**: If server is slow (>10 seconds), instant mock is used
   - Location: `src/lib/api.ts`
   - This ensures fast response times

### Current Flow:

```
User Assessment 
  → Firebase Function 
    → DEV_MODE = true 
      → Mock Prediction (rule-based)
        → Results Page
```

## 📊 How Mock Predictions Work

The mock predictions use simple rules:
- **Age > 30**: +0.2 risk
- **BMI > 25**: +0.3 risk  
- **Irregular cycles**: +0.4 risk
- **No exercise**: +0.2 risk
- **Unhealthy diet**: +0.15 risk

Risk levels:
- Risk score < 0.3 → **No Risk**
- Risk score 0.3-0.6 → **Early**
- Risk score > 0.6 → **High**

## 🔄 How to Switch to REAL ML Predictions

### Option 1: If You Have ML Service Deployed

1. **Remove hardcoded DEV_MODE**:
   ```typescript
   // In functions/src/utils/mlModel.ts
   // Change line 16 from:
   const DEV_MODE = true; // Force enabled for immediate fix
   
   // To:
   const DEV_MODE = config.ml_service?.dev_mode === "true" || process.env.DEV_MODE === "true";
   ```

2. **Set Firebase Functions config**:
   ```bash
   firebase functions:config:set ml_service.dev_mode="false"
   firebase functions:config:set ml_service.url="https://your-ml-service-url.run.app"
   ```

3. **Deploy updated functions**:
   ```bash
   cd functions
   npm run build
   firebase deploy --only functions
   ```

### Option 2: If ML Service is Not Deployed Yet

1. Deploy your ML service to Cloud Run first
2. Get the Cloud Run service URL
3. Follow Option 1 steps above

## 🧪 How to Verify What's Being Used

### Check Firebase Function Logs:

```bash
firebase functions:log --only predict
```

Look for:
- `"Using mock prediction (DEV_MODE enabled)"` → **Mock**
- `"Calling ML service at: https://..."` → **Real ML**

### Check Browser Console:

Open browser DevTools (F12) → Console tab, then submit an assessment.

Look for network requests:
- If you see requests to Firebase Functions → Server-side prediction
- If results appear instantly (<1 second) → Likely client-side mock

## 📝 Current Configuration

- **DEV_MODE**: `true` (hardcoded)
- **ML Service URL**: `http://localhost:8000` (not used)
- **Client timeout**: 10 seconds
- **Fallback**: Instant client-side mock

## ✅ Summary

**Current Status**: 🔵 **MOCK PREDICTIONS**

The app is working correctly but using rule-based mock predictions instead of the trained ML model. This is intentional for:
- Faster development
- No dependency on ML service
- Consistent results for testing

To use real ML predictions, you need to:
1. Have ML service deployed
2. Remove hardcoded `DEV_MODE = true`
3. Configure ML service URL
4. Deploy functions

