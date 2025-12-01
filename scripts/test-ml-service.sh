#!/bin/bash

# Script to test ML service endpoints

set -e

echo "🧪 Testing ML Service"
echo ""

# Check if URL is provided
if [ -z "$1" ]; then
    echo "Usage: ./scripts/test-ml-service.sh <ML_SERVICE_URL>"
    echo "Example: ./scripts/test-ml-service.sh https://empowerher-ml-service-xxxxx-uc.a.run.app"
    exit 1
fi

ML_URL=$1

echo "📍 Testing service at: $ML_URL"
echo ""

# Test 1: Health endpoint
echo "1️⃣  Testing /health endpoint..."
HEALTH_RESPONSE=$(curl -s "$ML_URL/health" || echo "ERROR")
if [[ "$HEALTH_RESPONSE" == *"healthy"* ]] || [[ "$HEALTH_RESPONSE" == *"status"* ]]; then
    echo "✅ Health check passed!"
    echo "$HEALTH_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$HEALTH_RESPONSE"
else
    echo "❌ Health check failed!"
    echo "Response: $HEALTH_RESPONSE"
    exit 1
fi

echo ""
echo "2️⃣  Testing /predict endpoint..."

# Test 2: Prediction endpoint
PREDICTION_RESPONSE=$(curl -s -X POST "$ML_URL/predict" \
  -H "Content-Type: application/json" \
  -d '{
    "age": 28,
    "weight": 65,
    "height": 165,
    "cycleRegularity": "irregular",
    "exerciseFrequency": "1-2_week",
    "diet": "balanced",
    "skinDarkening": true,
    "fastFood": false,
    "pregnant": false,
    "cycleLength": 30
  }' || echo "ERROR")

if [[ "$PREDICTION_RESPONSE" == *"label"* ]] && [[ "$PREDICTION_RESPONSE" == *"probabilities"* ]]; then
    echo "✅ Prediction test passed!"
    echo "$PREDICTION_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$PREDICTION_RESPONSE"
else
    echo "❌ Prediction test failed!"
    echo "Response: $PREDICTION_RESPONSE"
    exit 1
fi

echo ""
echo "✅ All tests passed!"
echo ""


