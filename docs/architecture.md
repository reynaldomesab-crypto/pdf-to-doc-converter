# Architecture

## System Overview

PDF to DOC Converter is a multi-platform application built as a monorepo with shared code across web, desktop, and mobile platforms. The core OCR processing is implemented in Python (FastAPI) and can run locally (desktop) or as a cloud service (web/mobile).

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            USER INTERFACES                                   │
├─────────────────┬─────────────────────┬─────────────────┬───────────────────┤
│   Web (PWA)     │  Desktop (Tauri)    │  Mobile (Cap)   │  CLI (Future)     │
│  React + Vite   │  Rust + WebView     │  Ionic + Cap    │  Python/Rust      │
└────────┬────────┴──────────┬───────────┴────────┬────────┴────────────────┘
         │                   │                    │
         ▼                   ▼                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         SHARED PACKAGES                                      │
├──────────────────┬──────────────────┬──────────────────┬───────────────────┤
│  @pdf-ocr-       │  @pdf-ocr-       │  @pdf-ocr-       │  @pdf-ocr-        │
│  converter/ui    │  converter/      │  converter/      │  converter/       │
│  (Components)    │  types           │  utils           │  api-client       │
└──────────────────┴──────────────────┴──────────────────┴───────────────────┘
         │                   │                    │                    │
         ▼                   ▼                    ▼                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        PROCESSING LAYER                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│  Desktop: Embedded Python (PyInstaller sidecar)                             │
│  Web/Mobile: REST API (FastAPI) → Cloudflare Workers / Fly.io / Railway     │
└─────────────────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         OCR PIPELINE                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│  1. PDF Input → PyMuPDF (fitz)                                              │
│  2. Page Analysis → Detect text vs image regions                            │
│  3. Hybrid OCR → Tesseract only on image regions                            │
│  4. Text Extraction → Structured data (blocks, lines, spans, tables)        │
│  5. Layout Reconstruction → pdf2docx → DOCX output                          │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Technology Stack

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| **Frontend Framework** | React | 18.2+ | UI components, state management |
| **Build Tool** | Vite | 5.2+ | Fast dev server, optimized builds |
| **Language** | TypeScript | 5.5+ | Type safety across frontend |
| **Styling** | TailwindCSS | 3.4+ | Utility-first CSS, dark mode |
| **UI Components** | shadcn/ui | Latest | Accessible, customizable components |
| **State Management** | Zustand | 4.5+ | Lightweight global state |
| **Desktop Runtime** | Tauri | 2.0+ | Native desktop apps (Rust + WebView) |
| **Mobile Runtime** | Capacitor | 6.0+ | Native mobile apps (WebView) |
| **OCR Engine** | PyMuPDF (fitz) | 1.23+ | PDF rendering, text extraction, OCR |
| **OCR Backend** | Tesseract | 5.3+ | Character recognition (100+ langs) |
| **PDF→DOCX** | pdf2docx | 0.5+ | Layout-preserving conversion |
| **API Framework** | FastAPI | 0.110+ | High-performance async API |
| **API Server** | Uvicorn | 0.29+ | ASGI server |
| **Validation** | Pydantic | 2.7+ | Data validation & serialization |
| **Python Bundling** | PyInstaller | 6.5+ | Single-file Python executable |
| **Package Manager** | pnpm | 9.4+ | Fast, disk-efficient monorepo |
| **Build Orchestration** | Turborepo | 2.0+ | Cached, parallel builds |
| **Linting/Formatting** | Biome | 1.8+ | Fast, Rust-based toolchain |
| **Testing** | Vitest / Playwright | Latest | Unit, integration, E2E tests |
| **CI/CD** | GitHub Actions | Latest | Matrix builds, automated releases |
| **Hosting (Web)** | Cloudflare Pages | Latest | Edge deployment, unlimited bandwidth |

## Data Flow

### Desktop (Local Processing)

```
User drops PDF
      │
      ▼
Tauri Frontend (React) → invoke('ocr_pdf') command
      │
      ▼
Rust Backend → Spawns Python sidecar (PyInstaller bundle)
      │
      ▼
Python Process:
  1. fitz.open(pdf_path)
  2. For each page:
     - page.get_textpage_ocr(language=langs)
     - Analyze layout: find_tables(), get_text("dict")
  3. pdf2docx.convert(pdf_path, docx_path)
      │
      ▼
Return DOCX file path → Frontend shows progress → Download
```

### Web/Mobile (Cloud API)

```
User uploads PDF
      │
      ▼
Frontend → POST /api/v1/convert (multipart/form-data)
      │
      ▼
Cloudflare Worker / Load Balancer
      │
      ▼
FastAPI Backend (Horizontal scaling)
      │
      ▼
Processing Pipeline (same as desktop)
      │
      ▼
Store result in R2/S3 (signed URL, 24h TTL)
      │
      ▼
Return { download_url, expires_at } → Frontend polls → Download
```

## OCR Pipeline Details

### Hybrid OCR Strategy

PyMuPDF 4LLM implements intelligent hybrid OCR:
1. **Analyze page** - Determine which regions have extractable text
2. **Skip digital text** - Regions with selectable text are extracted directly
3. **OCR only images** - Tesseract runs only on regions without text
4. **Merge results** - Combine extracted + OCR'd text seamlessly

Benefits:
- 50% faster processing on mixed documents
- Higher accuracy (Tesseract focuses on difficult regions)
- Preserves original fonts, positions, formatting

### Language Support

| Category | Languages | tessdata Variant |
|----------|-----------|------------------|
| Primary | Spanish, English | `tessdata_best` (desktop), `tessdata_fast` (web) |
| European | French, German, Italian, Portuguese, Russian | `tessdata_best` |
| Asian | Chinese Simplified, Japanese, Korean | `tessdata_best` |
| RTL | Arabic, Hindi | `tessdata_best` |

Language detection: Automatic (Tesseract script detection) or user selection.

### Output Formats

| Format | Library | Features |
|--------|---------|----------|
| DOCX | python-docx + pdf2docx | Tables, images, formatting, styles |
| PDF (searchable) | PyMuPDF | OCR text layer + original images |
| Markdown | PyMuPDF4LLM | LLM-ready, structured |
| JSON | PyMuPDF | Full layout data (bboxes, fonts, tables) |

## Shared Packages

### `@pdf-ocr-converter/types`
TypeScript types shared across all platforms:
- API request/response types
- OCR configuration types
- Progress event types
- Error types

### `@pdf-ocr-converter/utils`
Shared utilities:
- File validation (type, size)
- Progress calculation
- Format helpers (bytes, duration)
- Language code mappings

### `@pdf-ocr-converter/ui`
Reusable React components:
- DropZone (drag & drop, click, validation)
- LanguageSelector (multi-select, search, flags)
- ProgressSteps (animated stepper)
- DocPreview (iframe/docx-preview)
- Toast/Sonner notifications

### `@pdf-ocr-converter/api-client`
Type-safe API client generated from OpenAPI spec:
- `ocrPdf()` - Upload and process
- `getLanguages()` - Supported languages
- `healthCheck()` - API status
- Automatic retries, progress events

## Deployment Architecture

### Web (Cloudflare Pages)

```
GitHub Push (main) → GitHub Actions → Vite Build → Cloudflare Pages Deploy
                                                    │
                                                    ▼
                                            Global Edge Network
                                                    │
                                                    ▼
                                            Users worldwide
```

- Static assets served from Cloudflare CDN (300+ locations)
- SPA routing via `_redirects` (`/* /index.html 200`)
- Service Worker for offline support (Workbox)
- Custom domain via Cloudflare DNS

### Desktop (GitHub Releases)

```
Git Tag (v*) → GitHub Actions Matrix Build
    │
    ├─► Ubuntu → .AppImage
    ├─► Windows → .exe (NSIS installer)
    └─► macOS → .dmg (Universal: x64 + ARM64)
         │
         ▼
    GitHub Release with artifacts
         │
         ▼
    Auto-update via Tauri updater (signature verification)
```

Code signing:
- Windows: Authenticode (EV certificate for SmartScreen)
- macOS: Apple Developer ID + Notarization
- Linux: GPG-signed AppImage

### Mobile (Google Play Store / Direct APK)

```
Git Tag (v*) → GitHub Actions → Gradle Build
    │
    ├─► APK (universal, sideload)
    └─► AAB (Play Store)
         │
         ▼
    GitHub Release artifacts
         │
         ▼
    Play Store submission (manual/semi-auto)
```

### Backend API (Cloud)

```
Docker Image → Fly.io / Railway / Cloudflare Workers (Python via Pyodide)
    │
    ├─► Horizontal scaling (0 to N)
    ├─► Auto-sleep on inactivity
    ├─► R2/S3 for temporary file storage
    └─► Health checks, metrics, logs
```

## Security Architecture

### Desktop
- No network access required (fully offline)
- No telemetry, analytics, or tracking
- File system access via Tauri scoped permissions
- Rust memory safety for native layer

### Web/Mobile
- HTTPS only (HSTS, CSP headers)
- Content Security Policy: `default-src 'self'; script-src 'self' 'unsafe-inline'`
- Temporary file storage with signed URLs (24h expiry)
- Rate limiting: 10 req/min/IP, 100MB max upload
- No persistent storage of user documents

### Supply Chain
- Dependabot for automated dependency updates
- CodeQL static analysis on every PR
- `cargo audit`, `npm audit`, `pip-audit` in CI
- Signed releases with SBOM (Software Bill of Materials)
- Reproducible builds (pinned dependencies, lockfiles)

## Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Desktop app size | < 20 MB | Release binary |
| Desktop startup | < 1 second | Cold start |
| Web initial load | < 3 seconds | LCP on 3G |
| OCR accuracy | > 95% | Standard test docs |
| Processing speed | > 5 pages/sec | Modern CPU |
| Memory usage | < 500 MB | Peak during OCR |
| API response (health) | < 100 ms | p95 |

## Future Extensibility

- **Plugin system** for custom OCR engines (RapidOCR, PaddleOCR)
- **Batch processing** CLI for enterprise
- **Cloud functions** for serverless processing
- **WebAssembly** port of PyMuPDF for browser-only OCR
- **Real-time collaboration** on documents
- **AI-enhanced** layout detection (table recognition, form extraction)