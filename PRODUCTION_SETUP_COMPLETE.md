# Production Setup - Almost Complete! 🎉

## ✅ What's Been Configured

### 1. ML Service ✅
- **Status**: ✅ **DEPLOYED and RUNNING**
- **URL**: `https://empowerher-893349237440.europe-west1.run.app`
- **Health Check**: ✅ Responding (`{"status":"healthy"}`)
- **Location**: Europe West 1 region

### 2. Firebase Functions Configuration ✅
- **Status**: ✅ **CONFIGURED**
- **DEV_MODE**: Set to `false` (production mode)
- **ML_SERVICE_URL**: Set to `https://empowerher-893349237440.europe-west1.run.app`

**Configuration verified:**
```json
{
  "ml_service": {
    "url": "https://empowerher-893349237440.europe-west1.run.app",
    "dev_mode": "false"
  }
}
```

### 3. Frontend ✅
- **Status**: ✅ **READY**
- Environment variables configured
- Firebase connected
- All integrations complete

---

## ⚠️ Current Issue

### Disk Space Problem
There's a disk space issue preventing npm install in the functions folder:
```
ENOSPC: no space left on device
```

**This is preventing the build/deploy step.**

---

## 🚀 Next Steps (After Freeing Disk Space)

### Step 1: Free Up Disk Space

You need to free up some disk space on your Mac. Options:

1. **Check disk space:**
   ```bash
   df -h
   ```

2. **Common space-fillers to check:**
   - Empty Trash
   - Clear Downloads folder (keep only what you need)
   - Clear system caches
   - Remove unused applications
   - Clear npm cache: `npm cache clean --force`
   - Remove old node_modules: `find . -name "node_modules" -type d -prune -exec rm -rf '{}' +`

3. **Check what's taking space:**
   ```bash
   # Check largest directories
   du -sh ~/* | sort -h | tail -10
   ```

### Step 2: Install Functions Dependencies

After freeing space:

```bash
cd functions
npm install
```

### Step 3: Build Functions

```bash
cd functions
npm run build
```

**Note**: If test files cause build errors, you can temporarily exclude them by updating `tsconfig.json`:
```json
{
  "exclude": ["**/__tests__/**", "**/*.test.ts"]
}
```

### Step 4: Deploy Firebase Functions

```bash
# From project root
firebase deploy --only functions
```

---

## ✅ After Deployment Succeeds

Once functions are deployed, your production setup will be complete:

1. ✅ ML service running on Cloud Run
2. ✅ Firebase Functions configured to use ML service
3. ✅ Production mode enabled (DEV_MODE=false)
4. ✅ Frontend ready and connected

**Your app will then use real ML predictions instead of mock data!**

---

## 🧪 Testing After Deployment

### Test ML Service Directly:
```bash
curl https://empowerher-893349237440.europe-west1.run.app/health

# Test prediction
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

### Test in Your App:
1. Go to http://localhost:3000
2. Complete an assessment
3. Check that predictions come from the real ML service (not mock)
4. Check Firebase Functions logs to verify:
   ```bash
   firebase functions:log --only predict
   ```

---

## 📊 Current Configuration Summary

| Component | Status | URL/Config |
|-----------|--------|------------|
| **ML Service** | ✅ Deployed | `https://empowerher-893349237440.europe-west1.run.app` |
| **Firebase Functions** | ⚠️ Config set, needs deploy | `dev_mode: false`, `url: [ML service URL]` |
| **Frontend** | ✅ Ready | Environment variables set |

---

## 🎯 Quick Commands Reference

### Check Configuration:
```bash
firebase functions:config:get
```

### Build Functions (after freeing space):
```bash
cd functions
npm install
npm run build
```

### Deploy Functions:
```bash
firebase deploy --only functions
```

### Check Logs:
```bash
# Firebase Functions logs
firebase functions:log --only predict

# Cloud Run logs (in Cloud Console)
# Or use gcloud:
gcloud run services logs read empowerher-893349237440 --region europe-west1
```

---

## 📝 Summary

**What's Done:**
- ✅ ML service deployed and healthy
- ✅ Firebase Functions configured for production
- ✅ All environment variables set correctly

**What's Left:**
- ⚠️ Free up disk space
- ⏳ Install functions dependencies
- ⏳ Build and deploy Firebase Functions

**Once deployed, you'll be in full production mode!** 🚀

---

## 💡 Quick Disk Space Tips

1. **Clear npm cache:**
   ```bash
   npm cache clean --force
   ```

2. **Remove old builds:**
   ```bash
   # In project root
   rm -rf .next
   rm -rf functions/lib
   ```

3. **Check and clean large files:**
   - Empty Trash
   - Clear Downloads folder
   - Remove unused Docker images: `docker system prune -a`

After freeing up space, just run the build and deploy steps above!


