# 🚀 Deploy ML Service - Steps After gcloud Installation

## Step 1: Complete gcloud Installation

The installer will:
1. Ask for installation directory (press Enter for default: `/Users/piyushraj`)
2. Install Google Cloud SDK
3. Ask if you want to modify your PATH

**After installation completes:**
```bash
# Restart your terminal or run:
exec -l $SHELL

# Or source the completion script:
source ~/google-cloud-sdk/path.bash.inc
```

## Step 2: Initialize and Authenticate

```bash
# Initialize gcloud
gcloud init

# Or manually authenticate
gcloud auth login

# Set your project
gcloud config set project studio-9165758963-a10e4

# Verify
gcloud config list
```

## Step 3: Enable Required APIs

```bash
# Enable Cloud Run API
gcloud services enable run.googleapis.com

# Enable Cloud Build API
gcloud services enable cloudbuild.googleapis.com
```

## Step 4: Deploy ML Service

```bash
cd /Users/piyushraj/Downloads/EmpowerHer-main-2/ml-service

gcloud run deploy empowerher-ml-service \
  --source . \
  --region europe-west1 \
  --platform managed \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --timeout 300 \
  --min-instances 0 \
  --max-instances 10 \
  --set-env-vars MODEL_DIR=/app/models
```

**This will:**
- Build Docker image from source
- Include models in the image
- Deploy to Cloud Run
- Take about 5-10 minutes

## Step 5: Verify Deployment

After deployment completes, you'll get a service URL. Then:

```bash
# Get the service URL
SERVICE_URL=$(gcloud run services describe empowerher-ml-service \
  --region europe-west1 \
  --format 'value(status.url)')

echo "Service URL: $SERVICE_URL"

# Test health (should show model_loaded: true)
curl $SERVICE_URL/health

# Test prediction
curl -X POST $SERVICE_URL/predict \
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

## Step 6: Update Firebase Functions Config

```bash
# Get the service URL
SERVICE_URL=$(gcloud run services describe empowerher-ml-service \
  --region europe-west1 \
  --format 'value(status.url)')

# Update Firebase Functions config
firebase functions:config:set ml_service.url="$SERVICE_URL"

# Verify config
firebase functions:config:get

# Redeploy functions (if needed)
cd /Users/piyushraj/Downloads/EmpowerHer-main-2
firebase deploy --only functions
```

## ✅ Done!

After these steps:
- ✅ ML service deployed with models
- ✅ Real ML predictions active
- ✅ Your app will use trained model instead of mocks

## 🐛 Troubleshooting

### If gcloud command not found:
```bash
# Add to your ~/.zshrc or ~/.bashrc:
export PATH="$HOME/google-cloud-sdk/bin:$PATH"

# Then reload:
source ~/.zshrc  # or source ~/.bashrc
```

### If deployment fails:
- Check Cloud Build logs in console
- Verify Dockerfile is correct
- Make sure models are in `ml-service/models/`

### If models not loading:
```bash
# Check service logs
gcloud run services logs read empowerher-ml-service \
  --region europe-west1 \
  --limit 50
```

