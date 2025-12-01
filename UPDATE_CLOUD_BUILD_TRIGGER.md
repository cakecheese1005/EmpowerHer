# Update Cloud Build Trigger Branch

## Current Issue
Your Cloud Build trigger is configured to build on `^main$` branch, but your `ml-service` code is on `feature/complete-integration` branch.

## Solution: Change Branch Pattern

### Step 1: Find Branch Configuration

In the "Edit trigger" page you're viewing:

1. **Look for "Event" section** (you can see this is selected)
   - "Push to a branch" should be selected ✅

2. **Find the branch pattern field:**
   - It might be labeled as:
     - "Branch"
     - "Branch pattern"
     - "Branch regex"
   - Currently shows: `^main$`

### Step 2: Update Branch Pattern

Change the branch pattern from:
- **From**: `^main$`
- **To**: `^feature/complete-integration$`

Or simply:
- **To**: `feature/complete-integration`

### Step 3: Update Description (Optional)

You can also update the description to reflect the change:
- **From**: "Build and deploy to Cloud Run service empowerher on push to "^main$""
- **To**: "Build and deploy to Cloud Run service empowerher on push to "^feature/complete-integration$""

### Step 4: Save

Click **"Save"** or **"Update"** button at the bottom of the page.

## Where to Find Branch Pattern

The branch pattern field is usually located:
- In the **"Event"** section
- Below "Push to a branch" option
- As a text input field with regex pattern

If you don't see it immediately:
- Scroll down in the "Event" section
- Look for any field related to "branch" or "pattern"
- It might be in a sub-section or expandable area

## After Updating

Once you save:
1. The trigger will now build on pushes to `feature/complete-integration`
2. You can test by making a commit to that branch
3. Or manually trigger a build to test immediately

## Verify It Worked

After saving:
1. Check the trigger description - it should mention `feature/complete-integration`
2. The next push to `feature/complete-integration` should trigger a build
3. Check Cloud Build logs to see if it finds `ml-service/Dockerfile`


