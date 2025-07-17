#!/bin/bash

# Curl examples for testing the Cloudflare Workers file upload validator
# Usage: ./examples/curl-examples.sh [worker-url]

WORKER_URL="${1:-http://localhost:8787}"

echo "🧪 Testing Cloudflare Workers File Upload Validator"
echo "📡 Worker URL: $WORKER_URL"
echo ""

# Create a test file
TEST_FILE="/tmp/test-upload.txt"
cat > "$TEST_FILE" << EOF
This is a test file for Cloudflare Workers file upload validation.
Created at: $(date)
File size: Small text file for testing
Content type: text/plain
EOF

echo "📁 Created test file: $TEST_FILE"
echo ""

# Test 1: Valid file upload
echo "--- Test 1: Valid file upload ---"
curl -X POST "$WORKER_URL" \
  -F "file=@$TEST_FILE" \
  -H "Accept: application/json" \
  -w "\nHTTP Status: %{http_code}\n" \
  -s | jq '.' 2>/dev/null || cat
echo ""

# Test 2: Missing file (should fail)
echo "--- Test 2: Missing file (should fail) ---"
curl -X POST "$WORKER_URL" \
  -F "notfile=data" \
  -H "Accept: application/json" \
  -w "\nHTTP Status: %{http_code}\n" \
  -s | jq '.' 2>/dev/null || cat
echo ""

# Test 3: Wrong content type (should fail)
echo "--- Test 3: Wrong content type (should fail) ---"
curl -X POST "$WORKER_URL" \
  -H "Content-Type: application/json" \
  -d '{"invalid": "data"}' \
  -w "\nHTTP Status: %{http_code}\n" \
  -s | jq '.' 2>/dev/null || cat
echo ""

# Test 4: GET request (should fail)
echo "--- Test 4: GET request (should fail) ---"
curl -X GET "$WORKER_URL" \
  -H "Accept: application/json" \
  -w "\nHTTP Status: %{http_code}\n" \
  -s | jq '.' 2>/dev/null || cat
echo ""

# Test 5: OPTIONS request (CORS preflight)
echo "--- Test 5: OPTIONS request (CORS preflight) ---"
curl -X OPTIONS "$WORKER_URL" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -w "\nHTTP Status: %{http_code}\nCORS Headers:\n" \
  -D - \
  -s -o /dev/null
echo ""

# Test 6: Large file (create 1MB file to test size limits)
echo "--- Test 6: Moderately large file (1MB) ---"
LARGE_FILE="/tmp/large-test.txt"
dd if=/dev/zero of="$LARGE_FILE" bs=1024 count=1024 2>/dev/null
curl -X POST "$WORKER_URL" \
  -F "file=@$LARGE_FILE" \
  -H "Accept: application/json" \
  -w "\nHTTP Status: %{http_code}\n" \
  -s | jq '.' 2>/dev/null || cat
echo ""

# Test 7: Empty file (should fail)
echo "--- Test 7: Empty file (should fail) ---"
EMPTY_FILE="/tmp/empty.txt"
touch "$EMPTY_FILE"
curl -X POST "$WORKER_URL" \
  -F "file=@$EMPTY_FILE" \
  -H "Accept: application/json" \
  -w "\nHTTP Status: %{http_code}\n" \
  -s | jq '.' 2>/dev/null || cat
echo ""

# Cleanup
rm -f "$TEST_FILE" "$LARGE_FILE" "$EMPTY_FILE"

echo "🎉 All curl tests completed!"
echo ""
echo "Expected results:"
echo "✅ Test 1: HTTP 200, success: true"
echo "❌ Test 2: HTTP 400, error about missing file"
echo "❌ Test 3: HTTP 400, error about content-type"
echo "❌ Test 4: HTTP 405, method not allowed"
echo "✅ Test 5: HTTP 200, CORS headers present"
echo "✅ Test 6: HTTP 200, success: true (1MB file)"
echo "❌ Test 7: HTTP 400, error about empty file"