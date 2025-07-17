/**
 * Unit tests for the Cloudflare Workers File Upload Validator
 */

import { describe, it, expect } from 'vitest';
import worker from '../src/index.js';
import { validateFile, extractFileMetadata } from '../src/utils/file-validator.js';

describe('File Upload Worker', () => {
  const mockEnv = {};

  describe('HTTP Method Handling', () => {
    it('should handle OPTIONS requests for CORS', async () => {
      const request = new Request('http://localhost/', { method: 'OPTIONS' });
      const response = await worker.fetch(request, mockEnv);
      
      expect(response.status).toBe(200);
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
      expect(response.headers.get('Access-Control-Allow-Methods')).toContain('POST');
    });

    it('should reject non-POST requests', async () => {
      const request = new Request('http://localhost/', { method: 'GET' });
      const response = await worker.fetch(request, mockEnv);
      const result = await response.json();
      
      expect(response.status).toBe(405);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Method not allowed');
    });
  });

  describe('Content-Type Validation', () => {
    it('should reject requests without multipart/form-data content-type', async () => {
      const request = new Request('http://localhost/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: 'test' })
      });
      
      const response = await worker.fetch(request, mockEnv);
      const result = await response.json();
      
      expect(response.status).toBe(400);
      expect(result.success).toBe(false);
      expect(result.error).toContain('multipart/form-data');
    });
  });

  describe('File Upload Handling', () => {
    it('should accept valid file uploads', async () => {
      const formData = new FormData();
      const testFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
      formData.append('file', testFile);
      
      const request = new Request('http://localhost/', {
        method: 'POST',
        body: formData
      });
      
      const response = await worker.fetch(request, mockEnv);
      const result = await response.json();
      
      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(result.file?.name).toBe('test.txt');
      expect(result.file?.type).toBe('text/plain');
      expect(result.file?.size).toBe(12); // 'test content' is 12 bytes
      expect(result.timestamp).toBeDefined();
    });

    it('should handle missing files gracefully', async () => {
      const formData = new FormData();
      // No file appended
      
      const request = new Request('http://localhost/', {
        method: 'POST',
        body: formData
      });
      
      const response = await worker.fetch(request, mockEnv);
      const result = await response.json();
      
      expect(response.status).toBe(400);
      expect(result.success).toBe(false);
      expect(result.error).toContain('No file provided');
    });

    it('should reject files that are too large', async () => {
      const formData = new FormData();
      // Create a large file (over 100MB limit)
      const largeContent = 'x'.repeat(101 * 1024 * 1024); // 101MB
      const largeFile = new File([largeContent], 'large.txt', { type: 'text/plain' });
      formData.append('file', largeFile);
      
      const request = new Request('http://localhost/', {
        method: 'POST',
        body: formData
      });
      
      const response = await worker.fetch(request, mockEnv);
      const result = await response.json();
      
      expect(response.status).toBe(400);
      expect(result.success).toBe(false);
      expect(result.error).toContain('exceeds maximum allowed size');
    });

    it('should reject unsupported file types', async () => {
      const formData = new FormData();
      const unsupportedFile = new File(['test'], 'test.exe', { type: 'application/x-executable' });
      formData.append('file', unsupportedFile);
      
      const request = new Request('http://localhost/', {
        method: 'POST',
        body: formData
      });
      
      const response = await worker.fetch(request, mockEnv);
      const result = await response.json();
      
      expect(response.status).toBe(400);
      expect(result.success).toBe(false);
      expect(result.error).toContain('not allowed');
    });

    it('should reject empty files', async () => {
      const formData = new FormData();
      const emptyFile = new File([], 'empty.txt', { type: 'text/plain' });
      formData.append('file', emptyFile);
      
      const request = new Request('http://localhost/', {
        method: 'POST',
        body: formData
      });
      
      const response = await worker.fetch(request, mockEnv);
      const result = await response.json();
      
      expect(response.status).toBe(400);
      expect(result.success).toBe(false);
      expect(result.error).toContain('empty');
    });
  });

  describe('File Validator Functions', () => {
    it('validateFile should pass for valid files', () => {
      const validFile = new File(['test'], 'test.txt', { type: 'text/plain' });
      const result = validateFile(validFile);
      
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('validateFile should reject oversized files', () => {
      // Mock a large file
      const largeFile = {
        size: 101 * 1024 * 1024, // 101MB
        type: 'text/plain',
        name: 'large.txt'
      } as File;
      
      const result = validateFile(largeFile);
      
      expect(result.valid).toBe(false);
      expect(result.error).toContain('exceeds maximum');
    });

    it('extractFileMetadata should return correct metadata', () => {
      const testFile = new File(['test content'], 'test.txt', { 
        type: 'text/plain',
        lastModified: 1234567890
      });
      
      const metadata = extractFileMetadata(testFile);
      
      expect(metadata.name).toBe('test.txt');
      expect(metadata.type).toBe('text/plain');
      expect(metadata.size).toBe(12);
      expect(metadata.lastModified).toBe(1234567890);
    });
  });

  describe('Error Handling', () => {
    it('should include CORS headers in all responses', async () => {
      const request = new Request('http://localhost/', { method: 'GET' });
      const response = await worker.fetch(request, mockEnv);
      
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
      expect(response.headers.get('Content-Type')).toBe('application/json');
    });

    it('should include timestamp in all responses', async () => {
      const request = new Request('http://localhost/', { method: 'GET' });
      const response = await worker.fetch(request, mockEnv);
      const result = await response.json();
      
      expect(result.timestamp).toBeDefined();
      expect(new Date(result.timestamp).getTime()).toBeGreaterThan(0);
    });
  });
});