#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color
echo "================================"
echo "Testing Kharcha-Core API Routes"
echo "================================"
echo ""

# Test 1: Health Check
echo -e "${YELLOW}Testing Health Check...${NC}"
HEALTH=$(curl -s -X GET http://localhost:3000/api/health)
if echo "$HEALTH" | grep -q "connected"; then
  echo -e "${GREEN}✓ Health Check: PASS${NC}"
else
  echo -e "${RED}✗ Health Check: FAIL${NC}"
fi
echo ""
# Test 2: Register User
echo -e "${YELLOW}Testing User Registration...${NC}"
REGISTER=$(curl -s -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Test User","email":"testuser123@example.com","password":"TestPass123"}')
  
if echo "$REGISTER" | grep -q '"success":true'; then
  echo -e "${GREEN}✓ Register: PASS${NC}"
  TOKEN=$(echo "$REGISTER" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
  USER_ID=$(echo "$REGISTER" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
  echo "  Token: $TOKEN"
else
  echo -e "${RED}✗ Register: FAIL${NC}"
  echo "  Response: $REGISTER"
fi
echo ""

# Test 3: Login
echo -e "${YELLOW}Testing User Login...${NC}"
LOGIN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"Password123"}')
  
if echo "$LOGIN" | grep -q '"success":true'; then
  echo -e "${GREEN}✓ Login: PASS${NC}"
  TOKEN=$(echo "$LOGIN" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
  echo "  Login Token obtained"
else
  echo -e "${RED}✗ Login: FAIL${NC}"
fi
echo ""
# Test 4: Get Current User
echo -e "${YELLOW}Testing Get Current User...${NC}"
CURRENT_USER=$(curl -s -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer $TOKEN")
  
if echo "$CURRENT_USER" | grep -q "john@example.com"; then
  echo -e "${GREEN}✓ Get Current User: PASS${NC}"
else
  echo -e "${RED}✗ Get Current User: FAIL${NC}"
  echo "  Response: $CURRENT_USER"
fi
echo ""
# Test 5: Get Categories
echo -e "${YELLOW}Testing Get Categories...${NC}"
CATEGORIES=$(curl -s -X GET http://localhost:3000/api/categories \
  -H "Authorization: Bearer $TOKEN")
  
if echo "$CATEGORIES" | grep -q '"success":true'; then
  COUNT=$(echo "$CATEGORIES" | grep -o '"name":"[^"]*' | wc -l)
  echo -e "${GREEN}✓ Get Categories: PASS${NC}"
  echo "  Categories found: $COUNT"
else
  echo -e "${RED}✗ Get Categories: FAIL${NC}"
fi
echo ""

# Test 6: Get Expenses
echo -e "${YELLOW}Testing Get Expenses...${NC}"
EXPENSES=$(curl -s -X GET http://localhost:3000/api/expenses \
  -H "Authorization: Bearer $TOKEN")
  
if echo "$EXPENSES" | grep -q '"success":true'; then
  COUNT=$(echo "$EXPENSES" | grep -o '"amount":' | wc -l)
  echo -e "${GREEN}✓ Get Expenses: PASS${NC}"
  echo "  Expenses found: $COUNT"
else
  echo -e "${RED}✗ Get Expenses: FAIL${NC}"
fi
echo ""

# Test 7: Get Budgets
echo -e "${YELLOW}Testing Get Budgets...${NC}"
BUDGETS=$(curl -s -X GET http://localhost:3000/api/budgets \
  -H "Authorization: Bearer $TOKEN")
  
if echo "$BUDGETS" | grep -q '"success":true'; then
  COUNT=$(echo "$BUDGETS" | grep -o '"budgetLimit":' | wc -l)
  echo -e "${GREEN}✓ Get Budgets: PASS${NC}"
  echo "  Budgets found: $COUNT"
else
  echo -e "${RED}✗ Get Budgets: FAIL${NC}"
fi
echo ""

# Test 8: Get Analytics
echo -e "${YELLOW}Testing Get Analytics...${NC}"
ANALYTICS=$(curl -s -X GET http://localhost:3000/api/analytics \
  -H "Authorization: Bearer $TOKEN")
  
if echo "$ANALYTICS" | grep -q '"success":true'; then
  echo -e "${GREEN}✓ Get Analytics: PASS${NC}"
else
  echo -e "${RED}✗ Get Analytics: FAIL${NC}"
fi
echo ""

# Test 9: Create Category
echo -e "${YELLOW}Testing Create Category...${NC}"
CREATE_CAT=$(curl -s -X POST http://localhost:3000/api/categories \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"Travel","color":"#00FF00","icon":"plane"}')
  
if echo "$CREATE_CAT" | grep -q '"success":true'; then
  echo -e "${GREEN}✓ Create Category: PASS${NC}"
else
  echo -e "${RED}✗ Create Category: FAIL${NC}"
fi
echo ""

# Test 10: Create Expense
echo -e "${YELLOW}Testing Create Expense...${NC}"
# First, get a category ID
CAT_ID=$(curl -s -X GET http://localhost:3000/api/categories \
  -H "Authorization: Bearer $TOKEN" | grep -o '"_id":"[^"]*' | head -1 | cut -d'"' -f4)

CREATE_EXP=$(curl -s -X POST http://localhost:3000/api/expenses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"description\":\"Test Expense\",\"amount\":50,\"categoryId\":\"$CAT_ID\"}")
  
if echo "$CREATE_EXP" | grep -q '"success":true'; then
  echo -e "${GREEN}✓ Create Expense: PASS${NC}"
else
  echo -e "${RED}✗ Create Expense: FAIL${NC}"
fi
echo ""

echo "================================"
echo "API Route Testing Complete!"
echo "================================"
