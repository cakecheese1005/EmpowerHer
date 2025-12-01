# Complete Remaining TODOs

## TODO 1: Deploy ML Service to Cloud Run ⏳

### Status: Requires Manual Action in Google Cloud Console

**What's Done:**
- ✅ ML service code is ready
- ✅ Dockerfile is configured
- ✅ Code is pushed to GitHub (`feature/complete-integration` branch)

**What You Need to Do:**

1. **Go to Cloud Run Console:**
   - https://console.cloud.google.com/run?project=studio-9165758963-a10e4
   - Click **"+ CREATE SERVICE"** (or edit existing)

2. **Configure:**
   - Source: GitHub repository `p-raj2702/EmpowerHer`
   - **Branch**: `feature/complete-integration` ⚠️ CRITICAL!
   - Dockerfile: `ml-service/Dockerfile`
   - Service name: `empowerher-ml-service`
   - Region: `us-central1`
   - Authentication: ✅ Allow unauthenticated
   - Container port: `8000`
   - Memory: `1 GiB`
   - Environment variable: `MODEL_DIR=/app/models`

3. **Deploy and get URL:**
   - Click "CREATE" or "DEPLOY"
   - Wait 5-10 minutes
   - Copy the service URL (e.g., `https://empowerher-ml-service-xxxxx-uc.a.run.app`)

**See:** `scripts/deploy-ml-service-guide.md` for detailed steps

---

## TODO 2: Configure Firebase Functions ⏳

### Status: Ready to Configure (needs Cloud Run URL)

**What's Done:**
- ✅ Firebase Functions code updated to support production config
- ✅ Script created for easy configuration

**What You Need to Do:**

### Option A: Use the Script (Easiest)

```bash
./scripts/configure-firebase-functions.sh
```

The script will prompt you for the Cloud Run URL and set everything up.

### Option B: Manual Configuration

After you have your Cloud Run URL:

```bash
# Set DEV_MODE to false
firebase functions:config:set ml_service.dev_mode="false"

# Set ML_SERVICE_URL (replace with your actual URL)
firebase functions:config:set ml_service.url="https://empowerher-ml-service-xxxxx-uc.a.run.app"

# Verify
firebase functions:config:get

# Build and deploy
cd functions
npm run build
firebase deploy --only functions
```

**See:** `scripts/configure-firebase-functions.sh` for automated setup

---

## TODO 3: Test ML Service ⏳

### Status: Ready to Test (needs Cloud Run URL)

**What's Done:**
- ✅ Test script created
- ✅ ML service tested locally and working

**What You Need to Do:**

### Option A: Use the Test Script

```bash
./scripts/test-ml-service.sh https://YOUR-CLOUD-RUN-URL.run.app
```

### Option B: Manual Testing

```bash
# Test health endpoint
curl https://YOUR-SERVICE-URL.run.app/health

# Should return:
# {"status":"healthy","model_loaded":true,"imputer_loaded":false}

# Test prediction
curl -X POST https://YOUR-SERVICE-URL.run.app/predict \
  -H "Content-Type: application/json" \
  -d '{
    "age": 28,
    "weight": 65,
    "height": 165,
    "cycleRegularity": "irregular",
    "exerciseFrequency": "1-2_week",
    "diet": "balanced",
    "skinDarkening": true,
    "fastFood": false,
    "pregnant": false,
    "cycleLength": 30
  }'

# Should return prediction with label, probabilities, and contributors
```

**See:** `scripts/test-ml-service.sh` for automated testing

---

## Quick Summary

1. **Deploy to Cloud Run** (manual in console) → Get URL
2. **Configure Firebase Functions** (use script or manual) → Set URL
3. **Test ML Service** (use script or manual) → Verify it works

## All Scripts Created

- ✅ `scripts/configure-firebase-functions.sh` - Configure Firebase Functions
- ✅ `scripts/test-ml-service.sh` - Test ML service endpoints
- ✅ `scripts/deploy-ml-service-guide.md` - Deployment guide

## Next Actions

1. **Deploy ML service to Cloud Run** (follow guide above)
2. **Run configuration script** with the Cloud Run URL
3. **Run test script** to verify everything works


