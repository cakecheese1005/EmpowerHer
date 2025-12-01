# 🔍 Verify Real ML Predictions

## Current Configuration Status ✅

```json
{
  "ml_service": {
    "dev_mode": "false",  ← Should use REAL ML
    "url": "https://empowerher-893349237440.europe-west1.run.app"
  }
}
```

## How to Verify

### Method 1: Check Recent Function Logs

Run this command to see what the function is actually doing:

```bash
firebase functions:log --only predict --limit 20
```

**Look for these indicators:**

✅ **Real ML (Good)**:
- `"Calling ML service at: https://..."` 
- `"ML service response received successfully"`
- `"ML Model Configuration: { devMode: false, usingRealML: true }"`

❌ **Mock (Bad)**:
- `"Using mock prediction (DEV_MODE enabled)"`
- `"ML service error, falling back to mock"`
- `"ML Model Configuration: { devMode: true }"`

### Method 2: Test ML Service Directly

Test if the ML service is responding:

```bash
curl -X POST https://empowerher-893349237440.europe-west1.run.app/predict \
  -H "Content-Type: application/json" \
  -d '{
    "age": 28,
    "weight": 65,
    "height": 165,
    "cycleRegularity": "irregular",
    "exerciseFrequency": "1-2_week",
    "diet": "balanced"
  }'
```

**Expected Response:**
- If working: JSON with `label`, `probabilities`, `topContributors`
- If not: Error message

### Method 3: Make a Test Assessment

1. Go to your app: `http://localhost:3000/assessment`
2. Fill out the form and submit
3. Check browser console (F12) → Network tab
4. Look for the prediction request
5. Check Firebase Function logs immediately after

## Common Issues

### Issue 1: ML Service Not Loaded
**Symptom**: `"model_loaded":false` in health check
**Solution**: Models may need to be uploaded to the ML service

### Issue 2: Fallback to Mock
**Symptom**: Logs show "falling back to mock"
**Reason**: ML service failed or timed out
**Solution**: Check ML service logs and health

### Issue 3: Config Not Applied
**Symptom**: Still using mock despite config
**Solution**: Functions need to be redeployed after config change

## Quick Test Script

Run this to test everything at once:

```bash
# 1. Check config
firebase functions:config:get | grep ml_service

# 2. Check ML service health
curl https://empowerher-893349237440.europe-west1.run.app/health

# 3. Check recent function logs
firebase functions:log --only predict --limit 5
```

