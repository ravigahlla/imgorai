# ImGORAI

A Chrome extension that verifies image authenticity using [C2PA](https://c2pa.org/) (Coalition for Content Provenance and Authenticity) content credentials.

## Background

The rise of AI-generated imagery and sophisticated photo manipulation tools has made it increasingly difficult to distinguish authentic images from fabricated ones. This poses significant challenges for journalism, legal evidence, and public trust in visual media.

**C2PA** (Coalition for Content Provenance and Authenticity) is an open technical standard developed by Adobe, Microsoft, Intel, BBC, and other industry leaders to address this problem. C2PA embeds cryptographically signed metadata into images at the point of capture or creation, creating an unbroken chain of provenance that can be verified by anyone.

ImGORAI brings C2PA verification directly into your browser, allowing you to instantly check whether images you encounter online have valid content credentials—helping you identify authentic imagery from potentially manipulated or AI-generated content.

## Features

- Automatic scanning of images on web pages
- Visual verification badges:
  - ✓ **Green**: Valid C2PA credentials verified
  - ✗ **Red**: Invalid, tampered, or failed verification
  - ? **Gray**: No C2PA credentials found
- WebAssembly-powered cryptographic verification
- Minimal permissions for privacy

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Chrome Browser                           │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐    ┌─────────────────┐    ┌────────────────┐  │
│  │   Popup     │    │ Content Script  │    │   Background   │  │
│  │   (UI)      │    │ (Page Inject)   │    │ Service Worker │  │
│  └─────────────┘    └────────┬────────┘    └───────┬────────┘  │
│                              │                      │           │
│                              │  Chrome Messages     │           │
│                              └──────────────────────┤           │
│                                                     │           │
│                              ┌──────────────────────┴────────┐  │
│                              │     c2pa-web (WASM Engine)    │  │
│                              │  Cryptographic Verification   │  │
│                              └───────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Components

| Component | Location | Purpose |
|-----------|----------|---------|
| **Content Script** | `src/content/` | Injected into web pages. Observes DOM for images, displays badge overlays, sends verification requests. |
| **Background Worker** | `src/background/` | Service worker that handles verification requests. Isolates WASM execution from page context. |
| **C2PA Library** | `src/lib/c2pa.ts` | Wrapper around the official c2pa-web SDK. Initializes WASM, parses verification results. |
| **Popup** | `src/popup/` | Extension popup UI for manual page scanning and status display. |

### Verification Flow

1. **Detection**: Content script uses MutationObserver to detect images as they load
2. **Request**: Image URL sent to background worker via Chrome messaging API
3. **Fetch**: Background worker fetches image data (respects CORS)
4. **Verify**: c2pa-web WASM module parses C2PA manifest and verifies cryptographic signatures
5. **Display**: Content script receives result and overlays appropriate badge on image

### Security Model

- **Minimal Permissions**: Only `activeTab` and `storage` requested
- **Isolated Execution**: WASM runs in background worker, isolated from page scripts
- **Input Validation**: All URLs validated before processing
- **No Remote Code**: All verification logic runs locally

## Installation

```bash
npm install
npm run build
```

Load the extension in Chrome:
1. Navigate to `chrome://extensions`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `dist/` folder

## Development

```bash
npm run dev        # Build with watch mode
npm run build      # Production build
npm run lint       # Run ESLint
npm run typecheck  # TypeScript checking
```

## Dependencies

This project uses the following open-source libraries:

- **[c2pa-js](https://github.com/contentauth/c2pa-js)** - Official C2PA SDK (Apache 2.0 / MIT)
- **[Vite](https://vitejs.dev/)** - Build tool (MIT)
- **[@crxjs/vite-plugin](https://crxjs.dev/vite-plugin)** - Chrome extension Vite plugin (MIT)

## License

MIT License

Copyright (c) 2025 ImGORAI Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## Acknowledgments

- [C2PA](https://c2pa.org/) - Coalition for Content Provenance and Authenticity
- [Content Authenticity Initiative](https://contentauthenticity.org/) - Adobe's open-source tools for content authenticity
