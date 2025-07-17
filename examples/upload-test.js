#!/usr/bin/env node

/**
 * Node.js script to test file uploads to the Cloudflare Worker
 * Usage: node examples/upload-test.js [worker-url]
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Default to local development server
const WORKER_URL = process.argv[2] || 'http://localhost:8787';

/**
 * Create a test file for uploading
 */
function createTestFile() {
  const testContent = `Test file for Cloudflare Workers file upload validation
Created at: ${new Date().toISOString()}
File size: Small text file for testing
Content type: text/plain`;

  const testFilePath = join(__dirname, 'test-upload.txt');
  writeFileSync(testFilePath, testContent);
  return testFilePath;
}

/**
 * Upload a file using FormData
 */
async function uploadFile(filePath, filename) {
  try {
    const fileContent = readFileSync(filePath);
    const formData = new FormData();
    
    // Create a File object from the buffer
    const file = new File([fileContent], filename, { type: 'text/plain' });
    formData.append('file', file);

    console.log(`🚀 Uploading ${filename} to ${WORKER_URL}...`);
    
    const response = await fetch(WORKER_URL, {
      method: 'POST',
      body: formData
    });

    const result = await response.json();
    
    console.log(`📊 Response Status: ${response.status}`);
    console.log(`📝 Response Body:`, JSON.stringify(result, null, 2));
    
    return { response, result };
    
  } catch (error) {
    console.error(`❌ Upload failed:`, error.message);
    throw error;
  }
}

/**
 * Test various upload scenarios
 */
async function runTests() {
  console.log('🧪 Starting file upload tests...\n');
  
  try {
    // Test 1: Valid file upload
    console.log('--- Test 1: Valid file upload ---');
    const testFilePath = createTestFile();
    await uploadFile(testFilePath, 'test-upload.txt');
    console.log('✅ Test 1 completed\n');

    // Test 2: Different file type (JSON)
    console.log('--- Test 2: JSON file upload ---');
    const jsonContent = JSON.stringify({ test: 'data', timestamp: new Date().toISOString() });
    const jsonPath = join(__dirname, 'test.json');
    writeFileSync(jsonPath, jsonContent);
    await uploadFile(jsonPath, 'test.json');
    console.log('✅ Test 2 completed\n');

    // Test 3: Empty form data (should fail)
    console.log('--- Test 3: Empty form data (should fail) ---');
    try {
      const emptyFormData = new FormData();
      const response = await fetch(WORKER_URL, {
        method: 'POST',
        body: emptyFormData
      });
      const result = await response.json();
      console.log(`📊 Response Status: ${response.status}`);
      console.log(`📝 Response Body:`, JSON.stringify(result, null, 2));
      console.log('✅ Test 3 completed\n');
    } catch (error) {
      console.error(`❌ Test 3 failed:`, error.message);
    }

    // Test 4: Wrong HTTP method (should fail)
    console.log('--- Test 4: GET request (should fail) ---');
    try {
      const response = await fetch(WORKER_URL, { method: 'GET' });
      const result = await response.json();
      console.log(`📊 Response Status: ${response.status}`);
      console.log(`📝 Response Body:`, JSON.stringify(result, null, 2));
      console.log('✅ Test 4 completed\n');
    } catch (error) {
      console.error(`❌ Test 4 failed:`, error.message);
    }

    console.log('🎉 All tests completed!');
    
  } catch (error) {
    console.error('💥 Test suite failed:', error.message);
    process.exit(1);
  }
}

// Run the tests
runTests().catch(console.error);