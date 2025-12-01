# Deploy ML Service to Cloud Run - Step by Step

## Prerequisites
- ✅ Code is pushed to GitHub (`feature/complete-integration` branch)
- ✅ Cloud Run API is enabled
- ✅ You have access to Google Cloud Console

## Step-by-Step Deployment

### 1. Go to Cloud Run Console
- Visit: https://console.cloud.google.com/run?project=studio-9165758963-a10e4
- Click **"+ CREATE SERVICE"** (or edit existing service)

### 2. Configure Source
- Select **"Continuously deploy from a repository"**
- Connect GitHub repository: `p-raj2702/EmpowerHer`
- **Branch**: `feature/complete-integration` ⚠️ IMPORTANT!
- **Dockerfile path**: `ml-service/Dockerfile`

### 3. Configure Service
- **Service name**: `empowerher-ml-service`
- **Region**: `us-central1`
- **Authentication**: ✅ **Allow unauthenticated invocations**

### 4. Container Settings
- **Container port**: `8000` ⚠️ (not 8080!)
- **Memory**: `1 GiB` (not 512 MiB)
- **CPU**: `1`
- **Timeout**: `300 seconds`

### 5. Environment Variables
- **Name**: `MODEL_DIR`
- **Value**: `/app/models`

### 6. Deploy
- Click **"CREATE"** or **"DEPLOY"**
- Wait 5-10 minutes for build and deployment

### 7. Get URL
- After deployment, copy the service URL
- It looks like: `https://empowerher-ml-service-xxxxx-uc.a.run.app`

## Troubleshooting

### Build fails with "path ml-service not found"
- ✅ Make sure branch is set to `feature/complete-integration`
- ✅ Verify `ml-service/` folder exists in that branch on GitHub

### Service doesn't start
- Check logs in Cloud Run → Logs tab
- Verify `MODEL_DIR` environment variable is set
- Check container port is `8000`

### Models not loading
- Models need to be in the container or downloaded at runtime
- Update Dockerfile to copy models, or modify main.py to download from Storage


