#!/bin/bash

# ==========================================
# Taskbox Automated Load Testing Pipeline
# ==========================================

# Configuration (Adjust these as needed)
API_URL="https://taskbox-cjwm.onrender.com/api"
HEALTH_URL="https://taskbox-cjwm.onrender.com/health"
DURATION="10s"
THREADS="4"
CONNECTIONS="10"

# Note: Create this user in your local DB or change these credentials
TEST_EMAIL="test@example.com"
TEST_PASSWORD="password123"

echo "========================================="
echo "🚀 Starting Taskbox Load Test Pipeline"
echo "========================================="

# 1. Check dependencies
if ! command -v wrk &> /dev/null; then
    echo "❌ Error: 'wrk' is not installed. Please install it first."
    exit 1
fi

if ! command -v jq &> /dev/null; then
    echo "❌ Error: 'jq' is not installed. Please install it first."
    exit 1
fi

# Wait for server to be ready
echo "⏳ Waiting for API to be ready..."
until curl -s "$HEALTH_URL" | grep -q '"status":"UP"'; do
    sleep 1
done
echo "✅ API is ready!"
echo ""

# 2. Authenticate
echo "🔐 Authenticating as $TEST_EMAIL..."

# Try to register the user first (ignores error if user already exists)
curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\",\"fullName\":\"Load Test User\"}" > /dev/null

LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}")

export JWT_TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.data.token')

if [ "$JWT_TOKEN" == "null" ] || [ -z "$JWT_TOKEN" ]; then
    echo "❌ Authentication failed! Make sure the server is running and the test user exists."
    echo "Response: $LOGIN_RESPONSE"
    exit 1
fi

echo "✅ Authenticated successfully."
echo ""

# Create results directory
cd "$(dirname "$0")/../.." # Ensure we are in the 'be' directory
mkdir -p scripts/load-test/results
RESULTS_FILE="scripts/load-test/results/summary.txt"
> $RESULTS_FILE

# Setup Test Data for Deep Queries
echo "🛠️  Setting up test data (Workspace -> Board)..."
WORKSPACE_RES=$(curl -s -X POST "$API_URL/workspaces" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Load Test Workspace\"}")

echo "Debug Workspace Res: $WORKSPACE_RES"
WORKSPACE_ID=$(echo "$WORKSPACE_RES" | jq -r '.data.id')

if [ -n "$WORKSPACE_ID" ] && [ "$WORKSPACE_ID" != "null" ]; then
    BOARD_RES=$(curl -s -X POST "$API_URL/boards" \
      -H "Authorization: Bearer $JWT_TOKEN" \
      -H "Content-Type: application/json" \
      -d "{\"title\":\"Load Test Board\",\"type\":\"private\",\"workspaceId\":\"$WORKSPACE_ID\"}")
    
    echo "Debug Board Res: $BOARD_RES"
    export TEST_BOARD_ID=$(echo "$BOARD_RES" | jq -r '.data.id')
    echo "✅ Created test Board ID: $TEST_BOARD_ID"
else
    echo "❌ Failed to create Workspace. Skipping Board test."
fi
echo ""

# Run Scenarios function
run_scenario() {
    local name=$1
    local script=$2
    local url=$3
    
    echo "⏳ Running: $name ($DURATION, $THREADS threads, $CONNECTIONS conns)..."
    
    # Run wrk and capture output
    if [ -n "$script" ]; then
        wrk -t$THREADS -c$CONNECTIONS -d$DURATION -s "$script" "$url" > "scripts/load-test/results/$name.raw"
    else
        wrk -t$THREADS -c$CONNECTIONS -d$DURATION "$url" > "scripts/load-test/results/$name.raw"
    fi
    
    # Parse with awk
    echo "[$name]" >> $RESULTS_FILE
    awk -f scripts/load-test/generate_report.awk "scripts/load-test/results/$name.raw" >> $RESULTS_FILE
    echo "" >> $RESULTS_FILE
}

# 3. Execute Scenarios
run_scenario "01_Health_Check" "scripts/load-test/scenarios/01_health_check.lua" "$HEALTH_URL"
run_scenario "02_Fetch_Workspaces" "scripts/load-test/scenarios/02_workspaces.lua" "$API_URL/workspaces"
run_scenario "03_Create_Workspace" "scripts/load-test/scenarios/03_create_workspace.lua" "$API_URL/workspaces"

if [ -n "$TEST_BOARD_ID" ] && [ "$TEST_BOARD_ID" != "null" ]; then
    run_scenario "04_Fetch_Board_Deep" "scripts/load-test/scenarios/04_fetch_board.lua" "$API_URL/boards/$TEST_BOARD_ID/detail"
fi

# 4. Print Summary
echo "========================================="
echo "📊 LOAD TEST SUMMARY"
echo "========================================="
cat $RESULTS_FILE
echo "========================================="
