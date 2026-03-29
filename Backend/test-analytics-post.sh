#!/bin/bash

# Test Analytics POST Route
# Replace YOUR_CLERK_JWT_TOKEN with actual token from your frontend

echo "Testing Analytics POST Route"
echo "============================="

# Replace this with your actual Clerk JWT token
# You can get this from your browser's dev tools when logged in to your frontend
TOKEN="sk_test_ZChxk3ZcyGCOAlCAoGmyQnA2jfPKnzgpjPKhnCTJIv"

echo "Using token: ${TOKEN:0:50}..."
echo ""

# Test 1: Basic POST request
echo "Test 1: Basic analytics request"
RESPONSE=$(curl -s -X POST http://localhost:3000/api/analytics \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "range": "month",
    "filters": {}
  }')

echo "Status: $(echo "$RESPONSE" | grep -o '"success":[^,]*' || echo 'No success field')"
echo "Response preview: $(echo "$RESPONSE" | head -c 200)..."
echo ""

# Test 2: With category filter
echo "Test 2: Analytics with category filter"
RESPONSE2=$(curl -s -X POST http://localhost:3000/api/analytics \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "range": "month",
    "filters": {
      "category": "Food",
      "minAmount": 100,
      "maxAmount": 5000
    }
  }')

echo "Status: $(echo "$RESPONSE2" | grep -o '"success":[^,]*' || echo 'No success field')"
echo "Response preview: $(echo "$RESPONSE2" | head -c 200)..."
echo ""

# Test 3: Without token (should fail)
echo "Test 3: Request without token (should fail with 401)"
RESPONSE3=$(curl -s -X POST http://localhost:3000/api/analytics \
  -H "Content-Type: application/json" \
  -d '{
    "range": "month",
    "filters": {}
  }')

echo "Status: $(echo "$RESPONSE3" | grep -o '"success":[^,]*' || echo 'No success field')"
echo "Response preview: $(echo "$RESPONSE3" | head -c 200)..."
echo ""

echo "Done."