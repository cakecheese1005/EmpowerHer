# 🚀 Deploy ML Service - Final Steps

## ✅ gcloud is Installed!

Now follow these steps:

## Step 1: Add gcloud to PATH (One-time setup)

Add this to your `~/.zshrc` file:

```bash
export PATH="$HOME/google-cloud-sdk/bin:$PATH"
```

Then reload:
```bash
source ~/.zshrc
```

Or just run this for this session:
```bash
export PATH="$HOME/google-cloud-sdk/bin:$PATH"
```

## Step 2: Authenticate

```bash
gcloud auth login
```

This will open a browser window - sign in with your Google account.

## Step 3: Set Project

```bash
gcloud config set project studio-9165758963-a10e4
```

## Step 4: Enable APIs

```bash
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
```

## Step 5: Deploy ML Service

Run this command:

```bash
cd /Users/piyushraj/Downloads/EmpowerHer-main-2/ml-service

export PATH="$HOME/google-cloud-sdk/bin:$PATH"

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

**This will take 5-10 minutes** - it builds the Docker image and deploys.

## Step 6: Verify Deployment

After deployment completes:

```bash
# Get service URL
gcloud run services describe empowerher-ml-service \
  --region europe-west1 \
  --format 'value(status.url)'

# Test health (should show model_loaded: true)
curl https://YOUR-SERVICE-URL/health
```

## Step 7: Update Firebase Functions (if URL changed)

If the service URL is different from the current one:

```bash
SERVICE_URL=$(gcloud run services describe empowerher-ml-service \
  --region europe-west1 \
  --format 'value(status.url)')

firebase functions:config:set ml_service.url="$SERVICE_URL"
firebase deploy --only functions
```

## ✅ Done!

Your app will now use **real ML predictions**!

---

**Quick Copy-Paste Commands:**

```bash
# 1. Add to PATH (if not already done)
export PATH="$HOME/google-cloud-sdk/bin:$PATH"

# 2. Authenticate
gcloud auth login

# 3. Set project
gcloud config set project studio-9165758963-a10e4

# 4. Enable APIs
gcloud services enable run.googleapis.com cloudbuild.googleapis.com

# 5. Deploy
cd /Users/piyushraj/Downloads/EmpowerHer-main-2/ml-service
gcloud run deploy empowerher-ml-service --source . --region europe-west1 --platform managed --allow-unauthenticated --memory 512Mi --cpu 1 --timeout 300 --set-env-vars MODEL_DIR=/app/models
```

