# 🔍 Check If Real ML is Being Used

## Issue: Same 78% Result Every Time

If you're seeing the same result (78% "No Risk") every time, it could mean:

1. **Using cached results** from sessionStorage
2. **Falling back to mock** predictions
3. **Real ML** but with similar inputs (which is normal)

## How to Check

### Step 1: Open Browser Console

1. Open your app: `http://localhost:3000/assessment`
2. Press `F12` to open DevTools
3. Go to **Console** tab
4. Go to **Network** tab (to see API calls)

### Step 2: Clear Cache and Submit New Assessment

```javascript
// Run this in browser console to clear cache:
sessionStorage.clear();
```

### Step 3: Submit Assessment with Different Data

Try different inputs:
- **Test 1**: Age 25, Weight 60, Height 160, Regular cycle, No exercise
- **Test 2**: Age 35, Weight 80, Height 160, Irregular cycle, No exercise
- **Test 3**: Age 28, Weight 70, Height 165, Irregular cycle, Regular exercise

### Step 4: Check Console Logs

**Look for these messages:**

✅ **Real ML Working:**
- `"Calling ML service at: https://..."`
- Network request to `empowerher-ml-service-893349237440.europe-west1.run.app`
- Response with specific probabilities like `0.15839272737503052`

❌ **Using Mock:**
- `"All prediction methods failed, using emergency mock fallback"`
- `"Request timed out"`
- Probabilities like `0.7`, `0.6`, `0.1` (normalized)

### Step 5: Check Network Tab

In Network tab, look for:
- ✅ Request to `empowerher-ml-service-893349237440.europe-west1.run.app` → Real ML
- ❌ Only requests to Firebase Functions → Might be slow/falling back

## Quick Test: Direct ML Service Call

Run this in browser console after logging in:

```javascript
fetch('https://empowerher-ml-service-893349237440.europe-west1.run.app/predict', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    age: 30,
    weight: 70,
    height: 165,
    cycleRegularity: "irregular",
    exerciseFrequency: "none",
    diet: "unhealthy"
  })
})
.then(r => r.json())
.then(console.log)
```

**Expected**: Real ML predictions with specific probabilities

## If Still Seeing Same Results

### Solution 1: Clear sessionStorage
```javascript
// In browser console:
sessionStorage.clear();
// Then submit new assessment
```

### Solution 2: Check Firebase Function Logs
```bash
firebase functions:log --only predict --limit 10
```

Look for:
- `"Calling ML service at: https://..."`
- `"ML service response received successfully"`

### Solution 3: Verify ML Service is Working
```bash
curl -X POST https://empowerher-ml-service-893349237440.europe-west1.run.app/predict \
  -H "Content-Type: application/json" \
  -d '{
    "age": 30,
    "weight": 70,
    "height": 165,
    "cycleRegularity": "irregular",
    "exerciseFrequency": "none",
    "diet": "unhealthy"
  }'
```

Should return different probabilities than the mock.

## Common Causes

1. **SessionStorage caching**: Old results stored
2. **Timeout**: Service too slow, falls back to mock
3. **Same inputs**: Real ML might return similar results for similar inputs
4. **Service not accessible**: Network/CORS issues

## Next Steps

After checking, let me know what you see in the console/network tab!

