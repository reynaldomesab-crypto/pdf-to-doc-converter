# PDF to DOC Converter

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub Actions](https://github.com/reynaldomesab-crypto/pdf-to-doc-converter/workflows/CI/badge.svg)](https://github.com/reynaldomesab-crypto/pdf-to-doc-converter/actions)
[![GitHub Release](https://img.shields.io/github/v/release/reynaldomesab-crypto/pdf-to-doc-converter)](https://github.com/reynaldomesab-crypto/pdf-to-doc-converter/releases)
[![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20Linux%20%7C%20macOS%20%7C%20Android%20%7C%20Web-lightgrey)](https://github.com/reynaldomesab-crypto/pdf-to-doc-converter/releases)

A professional, lightweight, cross-platform application to convert scanned PDF documents (image-based) to editable Microsoft Word documents (.docx) using advanced OCR technology with support for 10+ languages.

## ✨ Features

- **Multi-platform**: Native desktop apps (Windows `.exe`, Linux `.AppImage`, macOS `.dmg`), Android APK, and Web PWA
- **Advanced OCR**: Powered by PyMuPDF + Tesseract with hybrid OCR (only processes regions needing recognition)
- **10+ Languages**: Spanish, English, French, German, Italian, Portuguese, Russian, Chinese, Japanese, Korean, Arabic, Hindi
- **Layout Preservation**: Maintains tables, images, formatting, and document structure
- **Privacy-First**: Desktop version runs 100% offline - no data leaves your device
- **Professional UI**: Clean, accessible (WCAG 2.1 AA), dark/light mode, responsive design
- **Lightweight**: Desktop app ~15MB (vs 150MB+ Electron apps), fast startup, low memory

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     MONOREPO (pnpm workspaces)                  │
├─────────────────┬─────────────────┬─────────────────┬───────────┤
│   apps/web      │  apps/desktop   │  apps/mobile    │ packages/ │
│   (React+Vite)  │    (Tauri 2)    │   (Capacitor)   │  shared   │
│                 │                 │                 │           │
│  Cloudflare     │  Windows .exe   │   Android APK   │  UI Kit   │
│  Pages + PWA    │  Linux AppImage │   iOS (future)  │  Types    │
│                 │  macOS .dmg     │                 │  Utils    │
└────────┬────────┴────────┬────────┴────────┬────────┴───────────┘
         │                 │                 │
         ▼                 ▼                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND PYTHON (FastAPI)                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │  PyMuPDF    │  │  Tesseract  │  │  python-    │             │
│  │  (fitz)     │  │  OCR 100+   │  │  docx       │             │
│  │  + pdf2docx │  │  languages  │  │             │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
└─────────────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 20+ and **pnpm** 9+
- **Python** 3.11+ and **uv** (or pip)
- **Rust** 1.75+ (for Tauri desktop)
- **Android SDK** (for mobile builds)

### Installation

```bash
# Clone repository
git clone https://github.com/reynaldomesab-crypto/pdf-to-doc-converter.git
cd pdf-to-doc-converter

# Install dependencies
pnpm install

# Install Python dependencies (backend)
cd backend && uv sync && cd ..

# Development servers
pnpm dev:web      # Web app at http://localhost:5173
pnpm dev:desktop  # Tauri dev window
pnpm dev:mobile   # Capacitor mobile (requires Android Studio/Xcode)
pnpm dev:api      # FastAPI at http://localhost:8000
```

### Building

```bash
# Build all platforms
pnpm build:all

# Individual platforms
pnpm build:web      # Static files in apps/web/dist
pnpm build:desktop  # Native binaries in apps/desktop/src-tauri/target/release/bundle
pnpm build:mobile   # APK/AAB in apps/mobile/android/app/build/outputs
pnpm build:api      # Docker image for backend
```

## 📦 Downloads

### Latest Releases
| Platform | Download | Size |
|----------|----------|------|
| Windows (x64) | [`.exe`](https://github.com/reynaldomesab-crypto/pdf-to-doc-converter/releases/latest/download/pdf-to-doc-converter-windows.exe) | ~15 MB |
| Linux (x64) | [`.AppImage`](https://github.com/reynaldomesab-crypto/pdf-to-doc-converter/releases/latest/download/pdf-to-doc-converter-linux.AppImage) | ~18 MB |
| macOS (Universal) | [`.dmg`](https://github.com/reynaldomesab-crypto/pdf-to-doc-converter/releases/latest/download/pdf-to-doc-converter-macos.dmg) | ~20 MB |
| Android | [`.apk`](https://github.com/reynaldomesab-crypto/pdf-to-doc-converter/releases/latest/download/pdf-to-doc-converter-android.apk) | ~12 MB |
| Web App | [Online](https://pdf-to-doc-converter.pages.dev) | N/A |

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, TypeScript, Vite, TailwindCSS, shadcn/ui |
| **Desktop** | Tauri 2.0 (Rust + WebView) |
| **Mobile** | Capacitor 6 (Ionic Core) |
| **OCR Engine** | PyMuPDF (fitz) + Tesseract |
| **PDF→DOCX** | pdf2docx |
| **Backend API** | FastAPI, Uvicorn, Pydantic |
| **Bundling** | PyInstaller (Python), cargo-tauri (Rust) |
| **Hosting** | Cloudflare Pages (Web), GitHub Releases (Desktop/Mobile) |
| **CI/CD** | GitHub Actions (matrix builds) |

## 🌐 Supported Languages (OCR)

| Code | Language | tessdata |
|------|----------|----------|
| `spa` | Spanish | ✅ |
| `eng` | English | ✅ |
| `fra` | French | ✅ |
| `deu` | German | ✅ |
| `ita` | Italian | ✅ |
| `por` | Portuguese | ✅ |
| `rus` | Russian | ✅ |
| `chi_sim` | Chinese Simplified | ✅ |
| `jpn` | Japanese | ✅ |
| `kor` | Korean | ✅ |
| `ara` | Arabic | ✅ |
| `hin` | Hindi | ✅ |

*Desktop includes `tessdata_best` for maximum accuracy. Web/Mobile use `tessdata_fast` with CDN caching.*

## 🔒 Privacy & Security

- **Desktop**: 100% local processing - no network required, no telemetry
- **Web/Mobile**: HTTPS only, temporary file storage (24h TTL), no content logging
- **Dependencies**: Automated security scanning (CodeQL, dependabot, cargo audit, npm audit, pip-audit)
- **Supply Chain**: Signed releases, SBOM generation, reproducible builds

## 🤝 Contributing

We welcome contributions! Please read our [Contributing Guide](CONTRIBUTING.md) for details on:
- Code style (Biome, TypeScript strict, Rust fmt)
- Conventional commits (`feat:`, `fix:`, `docs:`, etc.)
- Pull request process
- Testing requirements (80%+ coverage)

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

Copyright (c) 2024 reynaldomesab-crypto

## 🙏 Acknowledgments

- [PyMuPDF](https://pymupdf.com/) - High-performance PDF library
- [Tesseract OCR](https://github.com/tesseract-ocr/tesseract) - OCR engine
- [pdf2docx](https://github.com/artifex/pdf2docx) - PDF to DOCX conversion
- [Tauri](https://tauri.app/) - Lightweight desktop framework
- [Capacitor](https://capacitorjs.com/) - Cross-platform mobile runtime
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful accessible components