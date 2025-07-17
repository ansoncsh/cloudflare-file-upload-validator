# Cloudflare File Upload Validator

A simple TypeScript application for validating file uploads, deployed on Cloudflare Workers.

**Developed through context engineering with Claude Code** - This project demonstrates AI-assisted development patterns and best practices.

## Overview

This project provides a lightweight file validation service that receives and processes file uploads via HTTP requests. Built with simplicity and reliability in mind, following KISS and YAGNI principles.

## Getting Started

### Prerequisites

- Node.js (latest LTS version recommended)
- Yarn package manager
- Cloudflare account (for deployment)

### Installation

```bash
# Install dependencies
yarn
```

### Development

```bash
# Start development server
yarn dev
```

### Deployment

Deploy to Cloudflare Workers using Wrangler CLI (configured through yarn scripts).

## Project Structure

The codebase is organized with simplicity and maintainability as core principles:

- **KISS (Keep It Simple, Stupid)**: Prioritizes understandable logic over complexity
- **YAGNI (You Aren't Gonna Need It)**: Builds only required functionality
- **Open/Closed Principle**: Allows extension without modification of existing code

## Package Management

This project uses **yarn** for dependency management. Key commands:

```bash
yarn                    # Install dependencies
yarn add <package>      # Add dependency
yarn add -D <package>   # Add dev dependency
yarn remove <package>   # Remove package
yarn upgrade            # Update dependencies
```

## Core Functionality

- File upload reception via HTTP
- File validation and processing
- Simple, composable architecture
- Cloudflare Workers deployment ready
