#!/bin/bash

# Script to configure Firebase Functions for production ML service

set -e

echo "🔧 Configuring Firebase Functions for Production"
echo ""

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI is not installed. Please install it first:"
    echo "   npm install -g firebase-tools"
    exit 1
fi

# Check if logged in
if ! firebase projects:list &> /dev/null; then
    echo "❌ Not logged in to Firebase. Please run:"
    echo "   firebase login"
    exit 1
fi

echo "📋 Current Firebase project:"
firebase use

echo ""
echo "⚠️  IMPORTANT: You need your Cloud Run ML Service URL first!"
echo "   If you haven't deployed to Cloud Run yet, do that first."
echo ""

read -p "Enter your Cloud Run ML Service URL (or press Enter to skip): " ML_URL

if [ -z "$ML_URL" ]; then
    echo ""
    echo "⏭️  Skipping configuration. You can run this script again after deploying to Cloud Run."
    echo ""
    echo "📝 To configure manually later:"
    echo "   firebase functions:config:set ml_service.dev_mode=\"false\""
    echo "   firebase functions:config:set ml_service.url=\"YOUR_CLOUD_RUN_URL\""
    exit 0
fi

echo ""
echo "🔧 Setting environment variables..."

# Set DEV_MODE to false
firebase functions:config:set ml_service.dev_mode="false"

# Set ML_SERVICE_URL
firebase functions:config:set ml_service.url="$ML_URL"

echo ""
echo "✅ Configuration set successfully!"
echo ""
echo "📝 Current configuration:"
firebase functions:config:get

echo ""
echo "📦 Next steps:"
echo "   1. Build the functions: cd functions && npm run build"
echo "   2. Deploy: firebase deploy --only functions"
echo ""


