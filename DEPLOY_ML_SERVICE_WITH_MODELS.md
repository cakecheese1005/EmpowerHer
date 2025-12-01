# 🚀 Deploy ML Service with Real Models

## ✅ What's Been Done

1. **Model Files Copied**: Models are now in `ml-service/models/` directory
2. **Dockerfile Updated**: Configured to copy models into container
3. **Model Path Detection**: Service automatically finds models in multiple locations

## 📁 Model Files Location

```
ml-service/
  ├── models/
  │   ├── basic_pcos_model.pkl (169KB) ✅
  │   ├── basic_imputer.pkl (967B) ✅
  │   └── basic_features.pkl (172B) ✅
  ├── main.py
  ├── Dockerfile
  └── requirements.txt
```

## 🔧 Test Locally First

### Step 1: Test ML Service Locally

```bash
cd ml-service

# Install dependencies
pip install -r requirements.txt

# Run the service
python main.py
# OR
uvicorn main:app --host 0.0.0.0 --port 8000
```

### Step 2: Verify Models Load

In another terminal:

```bash
# Check health
curl http://localhost:8000/health

# Should return:
# {
#   "status": "healthy",
#   "model_loaded": true,  ← Should be true!
#   "imputer_loaded": true
# }
```

### Step 3: Test Prediction

```bash
curl -X POST http://localhost:8000/predict \
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

**Expected**: JSON response with `label`, `probabilities`, and `topContributors`

## 🐳 Build Docker Image Locally (Optional Test)

```bash
cd ml-service

# Build the image
docker build -t pcos-ml-service .

# Run the container
docker run -p 8000:8000 pcos-ml-service

# Test (in another terminal)
curl http://localhost:8000/health
```

## ☁️ Deploy to Cloud Run

### Option 1: Deploy from Source (Recommended)

```bash
cd ml-service

# Deploy to Cloud Run
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

### Option 2: Deploy with Docker Build

```bash
# Build and push to Google Container Registry
cd ml-service

# Set your project
export PROJECT_ID=studio-9165758963-a10e4
export SERVICE_NAME=empowerher-ml-service
export REGION=europe-west1

# Build the image
gcloud builds submit --tag gcr.io/$PROJECT_ID/$SERVICE_NAME

# Deploy to Cloud Run
gcloud run deploy $SERVICE_NAME \
  --image gcr.io/$PROJECT_ID/$SERVICE_NAME \
  --region $REGION \
  --platform managed \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --timeout 300 \
  --set-env-vars MODEL_DIR=/app/models
```

## ✅ Verify Deployment

After deployment, get the service URL:

```bash
gcloud run services describe empowerher-ml-service \
  --region europe-west1 \
  --format 'value(status.url)'
```

### Test the Deployed Service

```bash
# Replace with your actual service URL
SERVICE_URL="https://empowerher-893349237440.europe-west1.run.app"

# Health check
curl $SERVICE_URL/health

# Should return:
# {
#   "status": "healthy",
#   "model_loaded": true,  ← Must be true!
#   "imputer_loaded": true
# }

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

## 🔄 Update Firebase Functions Config (If URL Changed)

If you deployed to a new service URL, update Firebase Functions:

```bash
# Get your new service URL
SERVICE_URL=$(gcloud run services describe empowerher-ml-service \
  --region europe-west1 \
  --format 'value(status.url)')

# Update Firebase Functions config
firebase functions:config:set ml_service.url="$SERVICE_URL"
firebase functions:config:set ml_service.dev_mode="false"

# Redeploy functions
cd functions
npm run build
cd ..
firebase deploy --only functions
```

## 🐛 Troubleshooting

### Models Not Loading

**Check logs:**
```bash
gcloud run services logs read empowerher-ml-service \
  --region europe-west1 \
  --limit 50
```

**Common issues:**
1. **Models not in Docker image**: Check Dockerfile includes `COPY models /app/models`
2. **Wrong MODEL_DIR**: Set `MODEL_DIR=/app/models` environment variable
3. **File permissions**: Models should be readable (chmod 644)

### Test Locally with Docker

```bash
cd ml-service
docker build -t test-ml-service .
docker run -p 8000:8000 test-ml-service

# In another terminal
curl http://localhost:8000/health
```

### Check Model Files in Container

```bash
# Run container interactively
docker run -it --entrypoint /bin/bash test-ml-service

# Inside container
ls -lh /app/models/
python -c "import pickle; f=open('/app/models/basic_pcos_model.pkl','rb'); print('Model file readable!')"
```

## 📊 Verify Real ML is Working

1. **Check health endpoint**: `model_loaded` should be `true`
2. **Test prediction**: Should return probabilities and feature contributions
3. **Compare with mock**: Real ML predictions should be different from mock
4. **Check Firebase Function logs**: Should show "Calling ML service at: https://..."

```bash
firebase functions:log --only predict --limit 5
```

Look for:
- ✅ `"Calling ML service at: https://..."`
- ✅ `"ML service response received successfully"`
- ❌ NOT `"Using mock prediction"`

## ✨ Next Steps

Once ML service is deployed and working:

1. ✅ Test an assessment in your app
2. ✅ Verify predictions come from real ML (not mock)
3. ✅ Compare results with previous mock predictions
4. ✅ Monitor Cloud Run logs for any errors

---

**Status**: Ready to deploy! Models are in place, Dockerfile is configured. 🚀

