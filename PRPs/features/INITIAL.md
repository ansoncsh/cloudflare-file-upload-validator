# File Upload Validator (Cloudflare Worker)

## Summary

This is a minimal Cloudflare Worker written in TypeScript that validates the ability to receive and process file uploads
through HTTP requests. This setup is foundational for building more complex upload and processing pipelines on edge
infrastructure.

## Problem

When deploying services to edge platforms like Cloudflare Workers, traditional file upload mechanisms—commonly used in
centralized environments—may not behave as expected due to platform constraints and differences in runtime environments.
There is a need to validate:

- Whether the worker can receive and parse incoming files (e.g., `multipart/form-data` or raw `binary` streams)
- What content types are supported
- How large a file can be accepted without errors
- How streaming versus buffering behaves in this context

Without verifying this in a minimal, controlled project, future file-processing systems could be built on uncertain
foundations.

## Implementation

This worker:

- Accepts `POST` requests with files
- Uses the `formData()` API to extract files from the request
- Logs metadata (name, size, type) to verify file integrity
- Responds with a confirmation JSON

The source code is located in the `src/` directory of the GitHub repository. Example request scripts and a Postman
collection are also provided for testing.

## Environment

- **Platform**: Cloudflare Workers
- **Language**: TypeScript
- **Tooling**: [Wrangler](https://developers.cloudflare.com/workers/wrangler/)
- **Deployment**: Cloudflare CLI + GitHub Actions (CI/CD optional)

