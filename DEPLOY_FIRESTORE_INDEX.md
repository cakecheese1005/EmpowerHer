# Deploy Firestore Indexes

The dashboard needs a Firestore index to load assessment history. 

## Quick Fix

**Option 1: Click the Link in the Error** (Easiest)
- The error message in your browser console contains a link
- Click it to automatically create the index in Firebase Console
- Wait a few minutes for the index to build

**Option 2: Deploy via Firebase CLI**
```bash
firebase deploy --only firestore:indexes
```

**Option 3: Create Manually in Firebase Console**
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: `studio-9165758963-a10e4`
3. Go to Firestore Database > Indexes
4. Click "Create Index"
5. Set:
   - Collection ID: `assessments`
   - Fields:
     - `userId` (Ascending)
     - `createdAt` (Descending)
   - Query scope: Collection
6. Click "Create"

The index will take a few minutes to build. The dashboard will work without the index (using fallback), but will be faster once the index is ready.

