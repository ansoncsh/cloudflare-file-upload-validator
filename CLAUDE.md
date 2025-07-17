## Project Awareness & Context

This guide outlines patterns and standards for building a simple file validation program using TypeScript and deploying
it to Cloudflare Workers. The primary objective is to verify that the program can correctly receive and handle file
uploads via HTTP requests. A GitHub repository will be used for source control and project tracking.

## Core Principles

**IMPORTANT: You MUST follow these principles in all code changes and project development:**

### KISS (Keep It Simple, Stupid)

- Prioritize simple, understandable logic over clever or complex patterns
- Make decisions that reduce code complexity and cognitive load
- Simple code is more reliable and easier to maintain

### YAGNI (You Aren't Gonna Need It)

- Avoid building features unless they are explicitly required
- Focus only on the core functionality: receiving and validating files

### Open/Closed Principle

- Structure code to allow new capabilities without modifying existing components
- Add flexibility through small, composable functions and interfaces

## Package Management & Tooling

**CRITICAL: This project uses `yarn` for Node.js package management and the Wrangler CLI for Cloudflare Workers
development.**

### Essential yarn Commands

```bash
# Install dependencies from package.json
yarn

# Add a dependency
yarn add package-name

# Add a development dependency
yarn add -D package-name

# Remove a package
yarn remove package-name

# Update dependencies
yarn upgrade

# Run development server using Wrangler
yarn dev
```
