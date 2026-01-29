# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ImGORAI is a Chrome extension (Manifest V3) that verifies image authenticity using C2PA (Coalition for Content Provenance and Authenticity) content credentials. It uses WebAssembly for cryptographic verification.

## Commands

```bash
npm install          # Install dependencies
npm run dev          # Build in watch mode for development
npm run build        # Production build
npm run lint         # Run ESLint
npm run typecheck    # TypeScript type checking
```

## Architecture

```
src/
├── background/      # Service worker - handles C2PA verification requests
├── content/         # Content script - injects badges onto images
├── popup/           # Extension popup UI
└── lib/             # Shared utilities (c2pa.ts wrapper)
public/
├── manifest.json    # Chrome extension manifest (MV3)
└── icons/           # Extension icons
```

**Key flow:**
1. Content script observes images on web pages
2. Sends verification requests to background service worker
3. Background worker uses c2pa-web (WASM) for cryptographic verification
4. Content script displays badge overlay on images (✓ verified, ✗ invalid, ? no credentials)

## Dependencies

- `c2pa` - Official C2PA SDK with WASM engine
- `@crxjs/vite-plugin` - Vite plugin for Chrome extension bundling
- `vite-plugin-wasm` - WASM support for Vite

## Security Notes

- Manifest uses minimal permissions (activeTab, storage only)
- CSP allows 'wasm-unsafe-eval' (required for WASM)
- URL validation before processing any image requests
- No host_permissions unless explicitly needed
