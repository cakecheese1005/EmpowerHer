#!/bin/bash

# Quick deployment script for ML Service
# Run this after gcloud is installed and authenticated

echo "🚀 Deploying ML Service to Cloud Run..."
echo ""

# Add gcloud to PATH if not already there
export PATH="$HOME/google-cloud-sdk/bin:$PATH"

# Check if gcloud is available
if ! command -v gcloud &> /dev/null; then
    echo "❌ gcloud not found. Please add it to PATH:"
    echo "   export PATH=\"\$HOME/google-cloud-sdk/bin:\$PATH\""
    exit 1
fi

echo "✅ gcloud found"
echo ""

# Navigate to ml-service directory
cd "$(dirname "$0")/ml-service" || exit 1

echo "📦 Deploying from: $(pwd)"
echo ""

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

echo ""
echo "✅ Deployment complete!"
echo ""
echo "Next steps:"
echo "1. Get service URL:"
echo "   gcloud run services describe empowerher-ml-service --region europe-west1 --format 'value(status.url)'"
echo ""
echo "2. Test health:"
echo "   curl \$(gcloud run services describe empowerher-ml-service --region europe-west1 --format 'value(status.url)')/health"
echo ""
echo "3. Update Firebase Functions config (if URL changed)"

