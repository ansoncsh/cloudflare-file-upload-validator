/**
 * TypeScript interfaces for the Cloudflare Workers file upload validator
 */

export interface FileUploadRequest {
  file: File;
  metadata?: Record<string, string>;
}

export interface FileUploadResponse {
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

export interface WorkerEnv {
  // Future: Add environment variables like R2 bindings
  [key: string]: any;
}

export interface FileValidation {
  valid: boolean;
  error?: string;
}

export interface FileMetadata {
  name: string;
  size: number;
  type: string;
  lastModified?: number;
}