# Contributing to PDF to DOC Converter

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to this project.

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md). Please read it before contributing.

## How to Contribute

### Reporting Bugs

Before creating a bug report, please check if the issue already exists in our [issue tracker](https://github.com/reynaldomesab-crypto/pdf-to-doc-converter/issues).

When creating a bug report, please include:
- Clear, descriptive title
- Steps to reproduce the issue
- Expected vs actual behavior
- Platform and version information
- Screenshots or logs if applicable

### Suggesting Features

Feature requests are welcome! Please:
- Check existing issues first
- Clearly describe the problem and proposed solution
- Explain why this feature would be valuable
- Consider implementation complexity

### Pull Requests

1. **Fork** the repository
2. **Create a branch** from `main` with a descriptive name:
   - `feat/add-new-language-support`
   - `fix/ocr-crash-on-large-pdf`
   - `docs/update-installation-guide`
3. **Make your changes** following our coding standards
4. **Test your changes** thoroughly
5. **Submit a PR** using our [PR template](.github/PULL_REQUEST_TEMPLATE.md)

## Development Setup

### Prerequisites

- Node.js 20+
- pnpm 9+
- Python 3.11+
- Rust 1.75+
- Android SDK (for mobile development)

### Installation

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/pdf-to-doc-converter.git
cd pdf-to-doc-converter

# Add upstream remote
git remote add upstream https://github.com/reynaldomesab-crypto/pdf-to-doc-converter.git

# Install dependencies
pnpm install

# Install Python dependencies
cd backend && uv sync && cd ..

# Start development
pnpm dev:web      # Web app
pnpm dev:desktop  # Tauri desktop
pnpm dev:mobile   # Capacitor mobile
pnpm dev:api      # FastAPI backend
```

## Coding Standards

### General

- Write clear, self-documenting code
- Prefer composition over inheritance
- Keep functions small (< 50 lines)
- Maximum file length: 400 lines
- No deep nesting (> 4 levels)

### TypeScript/React

- Use TypeScript strict mode
- Functional components with hooks
- Use `interface` for object types, `type` for unions/primitives
- Prefer `const` over `let`
- No `any` type without justification
- Use path aliases (`@pdf-ocr-converter/*`)

### Rust

- Follow Rust API Guidelines
- Use `clippy` and `rustfmt`
- Document public APIs with `///`
- Handle errors with `Result<T, E>`
- Prefer `?` operator over `unwrap()`

### Python

- Follow PEP 8 (enforced by Ruff)
- Type hints required for all public functions
- Use `async`/`await` for I/O operations
- Docstrings in Google format
- Maximum line length: 100 characters

### Git Commits

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Formatting, missing semicolons, etc.
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `perf`: Performance improvement
- `test`: Adding missing tests
- `chore`: Maintenance tasks

Examples:
```
feat(ocr): add support for Arabic language
fix(web): resolve drag-and-drop on mobile Safari
docs(readme): update installation instructions
refactor(api): simplify OCR pipeline
```

## Testing Requirements

- **Minimum coverage**: 80% for all new code
- **Test types required**:
  - Unit tests (functions, utilities, components)
  - Integration tests (API endpoints, database operations)
  - E2E tests (critical user flows with Playwright)
- **TDD workflow**: Write test first (RED) → Implement (GREEN) → Refactor

Run tests:
```bash
pnpm test           # All tests
pnpm test:watch     # Watch mode
pnpm test:coverage  # With coverage report
```

## Pull Request Process

1. Ensure all CI checks pass (lint, typecheck, tests, build)
2. Update documentation if needed
3. Add tests for new functionality
4. Update CHANGELOG.md (will be automated via changesets)
5. Request review from maintainers
6. Address review comments
7. Squash and merge (maintainers will handle)

## Release Process

Releases are automated via [Changesets](https://github.com/changesets/changesets):

1. Maintainer runs `pnpm changeset` to create a changeset
2. Changeset describes the change and version bump type
3. On merge to `main`, GitHub Action creates release PR
4. When release PR is merged, packages are published and GitHub Release created

## Getting Help

- **Discussions**: [GitHub Discussions](https://github.com/reynaldomesab-crypto/pdf-to-doc-converter/discussions)
- **Issues**: [GitHub Issues](https://github.com/reynaldomesab-crypto/pdf-to-doc-converter/issues)
- **Discord**: [Join our Discord] (TBD)

## Recognition

Contributors are recognized in:
- GitHub Contributors graph
- Release notes
- README acknowledgments (for significant contributions)

Thank you for contributing! 🎉