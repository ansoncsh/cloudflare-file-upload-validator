name: "Cloudflare Workers File Upload Validator PRP"
description: |

## Purpose
Complete implementation guide for creating a Cloudflare Worker that validates file upload capabilities using TypeScript, with comprehensive context for one-pass implementation success.

## Core Principles
1. **Context is King**: Include ALL necessary documentation, examples, and caveats
2. **Validation Loops**: Provide executable tests/lints the AI can run and fix
3. **Information Dense**: Use keywords and patterns from the codebase
4. **Progressive Success**: Start simple, validate, then enhance
5. **Global rules**: Be sure to follow all rules in CLAUDE.md

---

## Goal
Build a minimal Cloudflare Worker written in TypeScript that validates the ability to receive and process file uploads through HTTP requests. The worker should accept POST requests with files, extract metadata, and respond with confirmation JSON to verify edge platform file handling capabilities.

## Why
- **Validation**: Verify that Cloudflare Workers can handle multipart/form-data uploads reliably
- **Foundation**: Establish baseline for future file processing pipelines on edge infrastructure
- **Learning**: Understand platform constraints and file handling behavior in edge runtime
- **Testing**: Validate file size limits, content types, and streaming vs buffering behavior

## What
A TypeScript-based Cloudflare Worker that:
- Accepts POST requests with multipart/form-data files
- Uses the formData() API to extract files from requests
- Logs file metadata (name, size, type) for verification
- Returns structured JSON confirmation responses
- Handles errors gracefully with appropriate HTTP status codes

### Success Criteria
- [ ] Worker accepts and processes file uploads via POST requests
- [ ] Correctly extracts file metadata (name, size, content-type)
- [ ] Returns JSON response with upload confirmation
- [ ] Handles various file types and sizes within Cloudflare limits
- [ ] Deployed successfully to Cloudflare Workers
- [ ] Tested with example upload scripts

## All Needed Context

### Documentation & References
```yaml
# MUST READ - Include these in your context window
- url: https://developers.cloudflare.com/workers/platform/limits/
  why: Critical platform constraints for request/response sizes and CPU limits
  
- url: https://developers.cloudflare.com/workers/examples/read-post/
  why: Official example for handling POST requests and formData parsing
  
- url: https://developers.cloudflare.com/workers/wrangler/
  why: Wrangler CLI setup and configuration for development/deployment
  
- url: https://developers.cloudflare.com/r2/api/workers/workers-multipart-usage/
  why: Multipart upload patterns and R2 integration examples
  
- file: CLAUDE.md
  why: Project principles (KISS, YAGNI), yarn usage, and development patterns
  
- doc: https://developers.cloudflare.com/workers/configuration/multipart-upload-metadata/
  section: Multipart upload metadata handling
  critical: FormData requires up-to-date compatibility_date in wrangler.toml
```

### Current Codebase tree
```bash
cloudflare-file-upload-validator/
├── .claude/
│   └── settings.local.json
├── PRPs/
│   ├── features/
│   │   └── INITIAL.md
│   └── templates/
│       └── prp_base.md
├── CLAUDE.md
└── LICENSE
```

### Desired Codebase tree with files to be added and responsibility of file
```bash
cloudflare-file-upload-validator/
├── src/
│   ├── index.ts              # Main worker entry point with request handling
│   ├── types.ts              # TypeScript interfaces for request/response
│   └── utils/
│       └── file-validator.ts # File validation and metadata extraction logic
├── tests/
│   └── index.test.ts         # Unit tests for worker functions
├── examples/
│   ├── upload-test.js        # Node.js script for testing uploads
│   └── curl-examples.sh      # Shell script with curl commands
├── package.json              # Dependencies and scripts
├── wrangler.toml            # Cloudflare Workers configuration
├── tsconfig.json            # TypeScript configuration
└── vitest.config.ts         # Test configuration
```

### Known Gotchas of our codebase & Library Quirks
```typescript
// CRITICAL: Cloudflare Workers file upload constraints
// 1. Request body size limits based on Cloudflare plan:
//    - Free: 100MB, Pro/Business: ~500MB, Enterprise: 500MB+
// 2. FormData requires compatibility_date >= "2023-05-18" in wrangler.toml
// 3. Use yarn (not npm) as specified in CLAUDE.md
// 4. File objects from formData have .stream() method for large files
// 5. Workers have 50 subrequests (Free) / 1000 subrequests (Paid) limits

// Example: This project uses yarn for package management
// Example: FormData parsing needs modern compatibility date
// Example: Response must be JSON.stringify() for proper content-type
```

## Implementation Blueprint

### Data models and structure
Create core TypeScript interfaces for type safety and consistency:
```typescript
// types.ts - Core interfaces
interface FileUploadRequest {
  file: File;
  metadata?: Record<string, string>;
}

interface FileUploadResponse {
  success: boolean;
  file?: {
    name: string;
    size: number;
    type: string;
    lastModified?: number;
  };
  error?: string;
  timestamp: string;
}

interface WorkerEnv {
  // Future: Add environment variables like R2 bindings
}
```

### List of tasks to be completed to fulfill the PRP in the order they should be completed

```yaml
Task 1:
CREATE package.json:
  - PATTERN: Follow yarn usage from CLAUDE.md
  - INCLUDE: TypeScript, Wrangler, Vitest dependencies
  - SCRIPTS: dev, deploy, test, build commands

Task 2:
CREATE wrangler.toml:
  - CRITICAL: compatibility_date = "2024-05-01" or later for FormData support
  - PATTERN: Standard worker configuration
  - INCLUDE: name, main entry point, compatibility settings

Task 3:
CREATE tsconfig.json:
  - PATTERN: Standard TypeScript config for Cloudflare Workers
  - TARGET: ES2022 for modern async/await support
  - STRICT: Enable for type safety

Task 4:
CREATE src/types.ts:
  - DEFINE: FileUploadRequest, FileUploadResponse, WorkerEnv interfaces
  - PATTERN: Export all interfaces for use across files

Task 5:
CREATE src/utils/file-validator.ts:
  - FUNCTION: validateFile() - check file type and size constraints
  - FUNCTION: extractFileMetadata() - get name, size, type from File object
  - PATTERN: Pure functions that can be easily tested

Task 6:
CREATE src/index.ts:
  - IMPLEMENT: Main fetch handler following ExportedHandler pattern
  - HANDLE: POST requests with multipart/form-data
  - USE: formData() API to extract files
  - PATTERN: Mirror official read-post example structure
  - ERROR: Graceful handling with appropriate HTTP status codes

Task 7:
CREATE tests/index.test.ts:
  - TEST: File upload success scenarios
  - TEST: Error handling for oversized files
  - TEST: Invalid content-type handling
  - PATTERN: Use Vitest for Cloudflare Workers testing

Task 8:
CREATE examples/upload-test.js:
  - SCRIPT: Node.js script using FormData to test uploads
  - INCLUDE: Various file types and sizes
  - TARGET: Both local dev and deployed worker endpoints

Task 9:
CREATE examples/curl-examples.sh:
  - COMMANDS: Shell script with curl multipart upload examples
  - INCLUDE: Success and error test cases
  - DOCUMENT: Expected responses

Task 10:
CREATE vitest.config.ts:
  - CONFIG: Vitest setup for Cloudflare Workers environment
  - PATTERN: Standard worker testing configuration
```

### Per task pseudocode as needed added to each task

```typescript
// Task 6: Main worker implementation (src/index.ts)
export default {
  async fetch(request: Request, env: WorkerEnv): Promise<Response> {
    // PATTERN: Check request method first
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }
    
    // PATTERN: Validate content-type header
    const contentType = request.headers.get('content-type');
    if (!contentType?.includes('multipart/form-data')) {
      return new Response('Content-Type must be multipart/form-data', { 
        status: 400 
      });
    }
    
    try {
      // CRITICAL: Use formData() API for file extraction
      const formData = await request.formData();
      const file = formData.get('file') as File;
      
      if (!file) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'No file provided' 
        }), { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      // PATTERN: Extract metadata using utility function
      const metadata = extractFileMetadata(file);
      
      // PATTERN: Validate file constraints
      const validation = validateFile(file);
      if (!validation.valid) {
        return new Response(JSON.stringify({
          success: false,
          error: validation.error
        }), { status: 400 });
      }
      
      // PATTERN: Return structured success response
      return new Response(JSON.stringify({
        success: true,
        file: metadata,
        timestamp: new Date().toISOString()
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
      
    } catch (error) {
      // GOTCHA: Handle 413 Request Entity Too Large
      return new Response(JSON.stringify({
        success: false,
        error: 'File upload failed: ' + error.message
      }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
}
```

### Integration Points
```yaml
PACKAGE_MANAGER:
  - tool: yarn (specified in CLAUDE.md)
  - pattern: "yarn add @cloudflare/workers-types typescript"
  
DEVELOPMENT:
  - command: "yarn dev" -> wrangler dev for local testing
  - pattern: Hot reload on file changes
  
DEPLOYMENT:
  - command: "yarn deploy" -> wrangler deploy
  - pattern: Deploy to Cloudflare Workers platform
  
TESTING:
  - framework: Vitest (Workers-compatible testing)
  - pattern: "yarn test" -> vitest run
```

## Validation Loop

### Level 1: Syntax & Style
```bash
# Run these FIRST - fix any errors before proceeding
yarn tsc --noEmit                    # Type checking
yarn wrangler dev --dry-run         # Validate worker configuration

# Expected: No errors. If errors, READ the error and fix.
```

### Level 2: Unit Tests
```typescript
// CREATE tests/index.test.ts with these test cases:
import { describe, it, expect } from 'vitest';

describe('File Upload Worker', () => {
  it('should accept valid file uploads', async () => {
    const formData = new FormData();
    formData.append('file', new File(['test'], 'test.txt', { type: 'text/plain' }));
    
    const request = new Request('http://localhost/', {
      method: 'POST',
      body: formData
    });
    
    const response = await worker.fetch(request, {});
    const result = await response.json();
    
    expect(response.status).toBe(200);
    expect(result.success).toBe(true);
    expect(result.file.name).toBe('test.txt');
  });

  it('should reject non-POST requests', async () => {
    const request = new Request('http://localhost/', { method: 'GET' });
    const response = await worker.fetch(request, {});
    expect(response.status).toBe(405);
  });

  it('should handle missing files gracefully', async () => {
    const formData = new FormData();
    const request = new Request('http://localhost/', {
      method: 'POST',
      body: formData
    });
    
    const response = await worker.fetch(request, {});
    const result = await response.json();
    
    expect(response.status).toBe(400);
    expect(result.success).toBe(false);
    expect(result.error).toContain('No file provided');
  });
});
```

```bash
# Run and iterate until passing:
yarn test
# If failing: Read error, understand root cause, fix code, re-run
```

### Level 3: Integration Test
```bash
# Start local development server
yarn dev

# Test with curl (using examples/curl-examples.sh)
curl -X POST http://localhost:8787 \
  -F "file=@test-file.txt" \
  -H "Accept: application/json"

# Expected: {"success": true, "file": {...}, "timestamp": "..."}

# Test error case
curl -X POST http://localhost:8787 \
  -H "Content-Type: application/json" \
  -d '{"invalid": "data"}'

# Expected: {"success": false, "error": "Content-Type must be multipart/form-data"}
```

## Final validation Checklist
- [ ] All tests pass: `yarn test`
- [ ] No TypeScript errors: `yarn tsc --noEmit`
- [ ] Worker starts locally: `yarn dev`
- [ ] File upload test successful: curl test with sample file
- [ ] Error cases handled: Invalid requests return proper error responses
- [ ] Deployment successful: `yarn deploy`
- [ ] Production endpoint responsive: Test deployed worker URL

---

## Anti-Patterns to Avoid
- ❌ Don't use npm when CLAUDE.md specifies yarn
- ❌ Don't skip compatibility_date in wrangler.toml (breaks FormData)
- ❌ Don't ignore file size limits (causes 413 errors)
- ❌ Don't use sync file reading methods (not available in Workers)
- ❌ Don't hardcode worker URLs (use environment variables)
- ❌ Don't ignore error handling for oversized uploads

---

## Confidence Score: 9/10

This PRP provides comprehensive context including:
- ✅ Official Cloudflare Workers documentation and examples
- ✅ Specific platform constraints and gotchas
- ✅ Complete task breakdown with order dependencies
- ✅ Executable validation steps using yarn/wrangler
- ✅ Real TypeScript code patterns from official docs
- ✅ Project-specific requirements from CLAUDE.md
- ✅ Error handling and edge cases covered
- ✅ Testing strategy with concrete examples

The only potential challenge is initial setup complexity, but the step-by-step approach and comprehensive context should enable successful one-pass implementation.