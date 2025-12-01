# Update Cloud Run to Use feature/complete-integration Branch

## Why This is Needed

Your `ml-service` folder is on the `feature/complete-integration` branch, but Cloud Run is trying to build from `main` branch (which doesn't have ml-service yet).

## Solution: Change Cloud Run Branch

### Step-by-Step:

1. **Go to Cloud Run Console:**
   - Visit: https://console.cloud.google.com/run?project=studio-9165758963-a10e4
   - Click on your service: `empowerher-ml-service`

2. **Edit the Service:**
   - Click **"EDIT & DEPLOY NEW REVISION"** button

3. **Find Source Configuration:**
   - Look for **"Source"** or **"Repository"** section
   - You should see the GitHub repository URL and branch setting

4. **Change the Branch:**
   - Find the branch dropdown/field (currently set to `main` or `^main$`)
   - Change it to: `feature/complete-integration`
   - Or use regex: `^feature/complete-integration$`

5. **Save and Deploy:**
   - Click **"DEPLOY"** or **"CREATE"**
   - The build should now find `ml-service/Dockerfile`

## Alternative: Update via Cloud Build Trigger

If you set up a Cloud Build trigger:

1. Go to **Cloud Build** → **Triggers**
2. Find your trigger for this service
3. Edit it
4. Change the branch from `main` to `feature/complete-integration`
5. Save

## Why This Works

- Your `ml-service` folder is committed and pushed to `feature/complete-integration`
- Cloud Run will now build from the correct branch
- No merge conflicts or unrelated history issues
- Clean and simple solution!

## After Deployment

Once the service deploys successfully, you'll get a URL like:
```
https://empowerher-ml-service-xxxxx-uc.a.run.app
```

Then use that URL in your Firebase Functions configuration!


