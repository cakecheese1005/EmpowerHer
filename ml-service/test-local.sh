#!/bin/bash

# Quick test script for ML service locally

echo "🧪 Testing ML Service Locally..."
echo ""

# Check if models exist
echo "1. Checking model files..."
if [ -f "models/basic_pcos_model.pkl" ]; then
    echo "   ✅ basic_pcos_model.pkl found"
else
    echo "   ❌ basic_pcos_model.pkl NOT found"
    exit 1
fi

if [ -f "models/basic_imputer.pkl" ]; then
    echo "   ✅ basic_imputer.pkl found"
else
    echo "   ⚠️  basic_imputer.pkl NOT found (optional)"
fi

if [ -f "models/basic_features.pkl" ]; then
    echo "   ✅ basic_features.pkl found"
else
    echo "   ⚠️  basic_features.pkl NOT found (optional)"
fi

echo ""
echo "2. Testing health endpoint..."
echo "   Starting service in background..."

# Start service in background
python main.py > /tmp/ml-service.log 2>&1 &
SERVICE_PID=$!

# Wait for service to start and models to load (takes a few seconds)
sleep 5

# Check if service is running
if ps -p $SERVICE_PID > /dev/null; then
    echo "   ✅ Service started (PID: $SERVICE_PID)"
else
    echo "   ❌ Service failed to start. Check /tmp/ml-service.log"
    exit 1
fi

# Test health endpoint
echo ""
echo "3. Testing /health endpoint..."
HEALTH_RESPONSE=$(curl -s http://localhost:8000/health)
echo "   Response: $HEALTH_RESPONSE"

# Check if model is loaded
if echo "$HEALTH_RESPONSE" | grep -q '"model_loaded":true'; then
    echo "   ✅ Model loaded successfully!"
else
    echo "   ❌ Model NOT loaded. Check logs:"
    tail -20 /tmp/ml-service.log
    kill $SERVICE_PID 2>/dev/null
    exit 1
fi

# Test prediction
echo ""
echo "4. Testing /predict endpoint..."
PREDICTION_RESPONSE=$(curl -s -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{
    "age": 28,
    "weight": 65,
    "height": 165,
    "cycleRegularity": "irregular",
    "exerciseFrequency": "1-2_week",
    "diet": "balanced"
  }')

echo "   Response: $PREDICTION_RESPONSE" | head -c 200
echo "..."

if echo "$PREDICTION_RESPONSE" | grep -q '"label"'; then
    echo "   ✅ Prediction successful!"
else
    echo "   ❌ Prediction failed"
    kill $SERVICE_PID 2>/dev/null
    exit 1
fi

# Stop service
echo ""
echo "5. Cleaning up..."
kill $SERVICE_PID 2>/dev/null
echo "   ✅ Service stopped"

echo ""
echo "✅ All tests passed! ML service is working correctly."
echo ""
echo "To run the service:"
echo "  python main.py"
echo "Or:"
echo "  uvicorn main:app --host 0.0.0.0 --port 8000"

