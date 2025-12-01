# 🚀 Deploy ML Service to Cloud Run

## Quick Deployment Steps

### Option 1: Using Google Cloud Console (Easiest)

1. **Go to Cloud Run Console:**
   - https://console.cloud.google.com/run?project=studio-9165758963-a10e4

2. **Click "Create Service"**

3. **Configure:**
   - **Service name**: `empowerher-ml-service`
   - **Region**: `europe-west1`
   - **Deploy one revision from a source repository**
   - **Source**: Connect to your GitHub repo or upload source
   - **Build type**: Dockerfile
   - **Dockerfile path**: `ml-service/Dockerfile`
   - **Directory**: `ml-service`

4. **Runtime Settings:**
   - **Memory**: 512Mi
   - **CPU**: 1
   - **Timeout**: 300 seconds
   - **Min instances**: 0
   - **Max instances**: 10

5. **Environment Variables:**
   - Add: `MODEL_DIR` = `/app/models`

6. **Click "Create"**

### Option 2: Install gcloud CLI First

```bash
# Install gcloud CLI (if not installed)
# macOS:
curl https://sdk.cloud.google.com | bash
exec -l $SHELL

# Or download from:
# https://cloud.google.com/sdk/docs/install

# Then authenticate
gcloud auth login
gcloud config set project studio-9165758963-a10e4
```

Then run:
```bash
cd ml-service

gcloud run deploy empowerher-ml-service \
  --source . \
  --region europe-west1 \
  --platform managed \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --timeout 300 \
  --set-env-vars MODEL_DIR=/app/models
```

### Option 3: Using Cloud Build (GitHub Integration)

If you have Cloud Build connected to GitHub:

1. Push your code to GitHub
2. Cloud Build will automatically build and deploy
3. Or trigger manually from Cloud Build console

## ✅ After Deployment

### 1. Get Service URL

```bash
# From console, copy the service URL
# Or from command line:
gcloud run services describe empowerher-ml-service \
  --region europe-west1 \
  --format 'value(status.url)'
```

### 2. Verify Models Loaded

```bash
curl https://YOUR-SERVICE-URL/health

# Should return:
# {
#   "status": "healthy",
#   "model_loaded": true,  ← Must be true!
#   "imputer_loaded": true
# }
```

### 3. Test Prediction

```bash
curl -X POST https://YOUR-SERVICE-URL/predict \
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

### 4. Update Firebase Functions (if URL changed)

```bash
# Get new URL
SERVICE_URL=$(gcloud run services describe empowerher-ml-service \
  --region europe-west1 \
  --format 'value(status.url)')

# Update config
firebase functions:config:set ml_service.url="$SERVICE_URL"
firebase deploy --only functions
```

## 📋 Pre-Deployment Checklist

- [x] Model files in `ml-service/models/`
- [x] Dockerfile configured to copy models
- [x] Environment variable `MODEL_DIR=/app/models` set
- [x] ML service code ready
- [ ] gcloud CLI installed (or use Console)
- [ ] Authenticated to Google Cloud
- [ ] Project set: `studio-9165758963-a10e4`

## 🎯 Current Status

**Ready to Deploy**: ✅ All code and models are ready!

**Next**: Choose one of the deployment options above.

