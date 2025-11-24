# EmpowerHer - PCOS Risk Assessment Platform

A production-ready mobile and web application for PCOS (Polycystic Ovary Syndrome) risk assessment using AI/ML, built with React Native (Expo), Next.js, Firebase Functions, and Firestore.

## 🏗️ Architecture

- **Mobile App**: React Native/Expo with Firebase Auth and Cloud Functions
- **Web App**: Next.js 15 with TypeScript and Tailwind CSS
- **Admin Panel**: Vite + React + TypeScript for content and user management
- **Backend**: Firebase Functions (TypeScript) with ML model integration
- **Database**: Firestore with comprehensive security rules
- **Storage**: Firebase Storage for user uploads

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- npm or yarn
- Firebase CLI (`npm install -g firebase-tools`)
- Python 3.8+ (for seed script)
- Firebase project with Authentication, Firestore, Storage, and Functions enabled

### 1. Clone and Install

```bash
git clone <repository-url>
cd EmpowerHer-main-2
npm ci
```

### 2. Firebase Setup

1. Create a Firebase project at https://console.firebase.google.com
2. Enable Authentication (Email/Password, Google, Phone)
3. Create Firestore database
4. Enable Storage
5. Download `serviceAccountKey.json` and place in project root (for seed script)
6. Update `.firebaserc` with your project ID:

```json
{
  "projects": {
    "default": "your-project-id"
  }
}
```

### 3. Environment Variables

#### Root (Next.js)
Create `.env.local`:
```
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

#### Functions
Create `functions/.env`:
```
DEV_MODE=true  # Set to false when model is integrated
MODEL_PATH=gs://your-bucket/models/basic_pcos_model.pkl
```

#### Mobile
Create `mobile/.env`:
```
EXPO_PUBLIC_FIREBASE_API_KEY=your-api-key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
EXPO_PUBLIC_FIREBASE_APP_ID=your-app-id
EXPO_PUBLIC_USE_EMULATOR=true  # For local development
```

#### Admin Web
Create `web-admin/.env`:
```
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_USE_EMULATOR=true  # For local development
```

### 4. Local Development with Emulators

```bash
# Terminal 1: Start Firebase Emulators
firebase emulators:start --only firestore,auth,functions,storage

# Terminal 2: Run Next.js web app
npm run dev

# Terminal 3: Run admin panel
cd web-admin
npm ci
npm run dev

# Terminal 4: Run mobile app
cd mobile
npm ci
expo start
```

### 5. Seed Sample Data

```bash
# Install Python dependencies
pip install firebase-admin

# Run seed script
python scripts/seed_firestore.py --samples 50
```

## 📱 Mobile App

### Setup

```bash
cd mobile
npm ci
```

### Run

```bash
# iOS
npm run ios

# Android
npm run android

# Web (for testing)
npm run web
```

### Build

```bash
# iOS
eas build --platform ios

# Android
eas build --platform android
```

## 🖥️ Admin Web Panel

### Setup

```bash
cd web-admin
npm ci
```

### Run

```bash
npm run dev
# Opens at http://localhost:3001
```

### Build

```bash
npm run build
```

## 🔧 Firebase Functions

### Setup

```bash
cd functions
npm ci
```

### Local Development

```bash
# Build TypeScript
npm run build

# Run with emulator
firebase emulators:start --only functions
```

### Deploy

```bash
firebase deploy --only functions
```

## 🧪 Testing

### Functions Tests

```bash
cd functions
npm test
```

### Web Tests

```bash
npm test  # Root Next.js app
cd web-admin && npm test  # Admin panel
```

### E2E Tests

```bash
# Cypress for web (when configured)
npm run cypress:open

# Detox for mobile (when configured)
cd mobile
npm run detox:build
npm run detox:test
```

## 🔐 Security

### Firestore Rules

Rules are defined in `rules/firestore.rules`. Deploy with:

```bash
firebase deploy --only firestore:rules
```

### Storage Rules

Rules are defined in `rules/storage.rules`. Deploy with:

```bash
firebase deploy --only storage:rules
```

### Custom Claims (Admin Roles)

Set admin role via Firebase Console or Admin SDK:

```javascript
admin.auth().setCustomUserClaims(uid, { role: 'admin' });
```

## 📊 ML Model Integration

### Current Status

The prediction endpoint (`/api/predict`) currently uses a mock model in development mode. To integrate the real model:

1. Upload model files to Firebase Storage:
   - `basic_pcos_model.pkl`
   - `basic_imputer.pkl`
   - `basic_features.pkl`

2. Update `functions/src/utils/mlModel.ts` to load and use the actual model

3. Set `DEV_MODE=false` in functions environment

### Model Endpoint

- **Endpoint**: `predict` (Firebase Callable Function)
- **Input**: Assessment data (see `functions/src/types.ts`)
- **Output**: Risk label, probabilities, top contributors

## 🚢 Deployment

### GitHub Actions

CI/CD is configured in `.github/workflows/`:

- **CI**: Runs on every PR (lint, test, build)
- **Deploy**: Runs on push to `main` (deploys functions and rules)

### Manual Deployment

```bash
# Deploy everything
firebase deploy

# Deploy specific services
firebase deploy --only functions
firebase deploy --only firestore:rules
firebase deploy --only storage:rules
firebase deploy --only hosting  # If hosting is configured
```

### Required GitHub Secrets

- `FIREBASE_TOKEN`: Get with `firebase login:ci`
- `GCP_SA_KEY`: Service account JSON key
- `FIREBASE_PROJECT_ID`: Your Firebase project ID

## 📚 API Documentation

See `docs/postman_collection.json` for Postman collection with all endpoints.

### Endpoints

- `predict`: ML prediction (authenticated, rate-limited)
- `exportUser`: Export user data (authenticated)
- `deleteUser`: Delete user account (authenticated)
- `foodClassify`: Food image classification (authenticated, mock)
- `health`: Health check (public)

## 🏥 Medical Disclaimer

**This application provides AI-based risk assessments for informational purposes only. It is not a medical diagnosis. Always consult with a qualified healthcare professional for medical advice, diagnosis, or treatment.**

## 📄 License

[Your License Here]

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Add tests
4. Submit a PR with clear description

## 📞 Support

For issues or questions, please open a GitHub issue.
