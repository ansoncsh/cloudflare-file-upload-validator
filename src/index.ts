/**
 * Cloudflare Workers File Upload Validator
 * A minimal worker to validate file upload capabilities using TypeScript
 */

import { WorkerEnv, FileUploadResponse } from './types.js';
import { validateFile, extractFileMetadata } from './utils/file-validator.js';

/**
 * Type guard to check if a FormDataEntryValue is a File
 */
function isFile(value: FormDataEntryValue | null): value is File {
  return value !== null && typeof value === 'object' && 'name' in value && 'size' in value;
}

export default {
  async fetch(request: Request, env: WorkerEnv): Promise<Response> {
    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    // Only allow POST requests for file uploads
    if (request.method !== 'POST') {
      const response: FileUploadResponse = {
        success: false,
        error: 'Method not allowed. Only POST requests are accepted.',
        timestamp: new Date().toISOString()
      };
      
      return new Response(JSON.stringify(response), { 
        status: 405,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // Validate content-type header for multipart/form-data
    const contentType = request.headers.get('content-type');
    if (!contentType?.includes('multipart/form-data')) {
      const response: FileUploadResponse = {
        success: false,
        error: 'Content-Type must be multipart/form-data',
        timestamp: new Date().toISOString()
      };
      
      return new Response(JSON.stringify(response), { 
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    try {
      // Extract files from the multipart form data
      const formData = await request.formData();
      const fileEntry = formData.get('file');
      
      // Check if the entry is a File object using type guard
      if (!isFile(fileEntry)) {
        const response: FileUploadResponse = {
          success: false,
          error: 'No file provided. Please include a file in the "file" field.',
          timestamp: new Date().toISOString()
        };
        
        return new Response(JSON.stringify(response), { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }
      
      const file = fileEntry;

      // Validate the file against constraints
      const validation = validateFile(file);
      if (!validation.valid) {
        const response: FileUploadResponse = {
          success: false,
          error: validation.error,
          timestamp: new Date().toISOString()
        };
        
        return new Response(JSON.stringify(response), { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }

      // Extract file metadata
      const metadata = extractFileMetadata(file);

      // Log the successful upload for debugging
      console.log('File upload successful:', {
        name: metadata.name,
        size: metadata.size,
        type: metadata.type,
        timestamp: new Date().toISOString()
      });

      // Return success response with file metadata
      const response: FileUploadResponse = {
        success: true,
        file: metadata,
        timestamp: new Date().toISOString()
      };

      return new Response(JSON.stringify(response), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });

    } catch (error) {
      // Handle any unexpected errors (including 413 Request Entity Too Large)
      console.error('File upload error:', error);
      
      const response: FileUploadResponse = {
        success: false,
        error: `File upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString()
      };

      return new Response(JSON.stringify(response), { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
  }
} satisfies ExportedHandler<WorkerEnv>;