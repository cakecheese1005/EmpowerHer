# Next Steps - Complete ML Service Deployment

## ✅ What's Done
- ✅ ML service code is ready (`ml-service/` folder)
- ✅ Dockerfile is configured
- ✅ Code is pushed to GitHub (`feature/complete-integration` branch)
- ✅ Firebase Functions code is updated to support production config

## 📋 What to Do Next

### Step 1: Update Cloud Run Branch (Do This First!)

1. **Go to Cloud Run:**
   - https://console.cloud.google.com/run?project=studio-9165758963-a10e4
   - Click on `empowerher-ml-service` (or create it if it doesn't exist)

2. **Edit Service:**
   - Click **"EDIT & DEPLOY NEW REVISION"**

3. **Change Branch:**
   - Find **"Source"** or **"Repository"** section
   - Change branch from `main` to `feature/complete-integration`
   - Or use regex: `^feature/complete-integration$`

4. **Verify Settings:**
   - Container port: `8000` ✅
   - Authentication: "Allow public access" ✅
   - Memory: `1 GiB` ✅
   - Source location: `ml-service/Dockerfile` ✅

5. **Deploy:**
   - Click **"DEPLOY"**
   - Wait 5-10 minutes for build and deployment

### Step 2: Get Your Cloud Run URL

After successful deployment:
- You'll see a URL like: `https://empowerher-ml-service-xxxxx-uc.a.run.app`
- **Copy this URL** - you'll need it for Firebase Functions

### Step 3: Test the ML Service

```bash
# Test health endpoint
curl https://YOUR-SERVICE-URL.run.app/health

# Should return:
# {"status":"healthy","model_loaded":true,"imputer_loaded":false}
```

### Step 4: Configure Firebase Functions

Once you have the Cloud Run URL:

```bash
# Set production configuration
firebase functions:config:set ml_service.dev_mode="false"
firebase functions:config:set ml_service.url="https://YOUR-SERVICE-URL.run.app"

# Verify
firebase functions:config:get

# Deploy functions
cd functions
npm run build
firebase deploy --only functions
```

### Step 5: Test End-to-End

1. **Test Firebase Function:**
   - Call the `predict` function from your app
   - It should now call the real ML service

2. **Check Logs:**
   ```bash
   # Firebase Functions logs
   firebase functions:log --only predict
   
   # Cloud Run logs
   gcloud run services logs read empowerher-ml-service --region us-central1
   ```

## 🎯 Current Status

- **ML Service**: Ready, needs deployment
- **GitHub**: Code is on `feature/complete-integration` branch
- **Cloud Run**: Needs branch update and deployment
- **Firebase Functions**: Ready, needs Cloud Run URL

## ⚠️ Important Notes

1. **Model Files**: The ML service needs model files. Options:
   - Include them in the container (update Dockerfile)
   - Download from Firebase Storage at runtime (modify main.py)

2. **Branch**: Make sure Cloud Run is building from `feature/complete-integration`

3. **Port**: Verify container port is `8000` (not 8080)

## 🚀 Quick Command Reference

```bash
# Check Cloud Run service status
gcloud run services describe empowerher-ml-service --region us-central1

# View Cloud Run logs
gcloud run services logs read empowerher-ml-service --region us-central1 --limit 50

# Test ML service
curl https://YOUR-SERVICE-URL.run.app/health
curl -X POST https://YOUR-SERVICE-URL.run.app/predict \
  -H "Content-Type: application/json" \
  -d '{"age":28,"weight":65,"height":165,"cycleRegularity":"irregular","exerciseFrequency":"1-2_week","diet":"balanced","skinDarkening":true,"fastFood":false,"pregnant":false,"cycleLength":30}'
```


