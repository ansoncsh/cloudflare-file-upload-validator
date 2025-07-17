import { FileValidation, FileMetadata } from '../types.js';

/**
 * Maximum file size in bytes (100MB for Cloudflare Workers free tier)
 * Based on Cloudflare plan limits from PRP research
 */
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

/**
 * Allowed MIME types for file uploads
 * Keep this restrictive for validation purposes
 */
const ALLOWED_MIME_TYPES = [
  'text/plain',
  'text/csv',
  'application/json',
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/zip',
  'application/x-zip-compressed'
];

/**
 * Validates a file against size and type constraints
 * @param file - The File object to validate
 * @returns FileValidation object with valid flag and optional error message
 */
export function validateFile(file: File): FileValidation {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size ${file.size} bytes exceeds maximum allowed size of ${MAX_FILE_SIZE} bytes (100MB)`
    };
  }

  // Check if file is empty
  if (file.size === 0) {
    return {
      valid: false,
      error: 'File is empty'
    };
  }

  // Check MIME type
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `File type '${file.type}' is not allowed. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`
    };
  }

  return { valid: true };
}

/**
 * Extracts metadata from a File object
 * @param file - The File object to extract metadata from
 * @returns FileMetadata object with file information
 */
export function extractFileMetadata(file: File): FileMetadata {
  return {
    name: file.name,
    size: file.size,
    type: file.type,
    lastModified: file.lastModified
  };
}