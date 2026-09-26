# Security Policy

## Supported Versions

We release security updates for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | ✅ Yes             |
| < 1.0   | ❌ No (pre-release) |

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security vulnerability, please report it responsibly:

### Preferred Method: GitHub Security Advisories

1. Go to the [Security tab](https://github.com/reynaldomesab-crypto/pdf-to-doc-converter/security) of this repository
2. Click "Report a vulnerability"
3. Fill out the form with details about the vulnerability

### Alternative: Email

Send details to: **security@reynaldomesab-crypto.github.io** (or reynaldomesab@gmail.com with subject "[SECURITY]")

### What to Include

Please include as much of the following as possible:

- Type of vulnerability (e.g., XSS, SQL injection, RCE, information disclosure)
- Affected component(s) (web, desktop, mobile, backend API)
- Steps to reproduce or proof-of-concept
- Potential impact
- Suggested fix (if any)
- Your contact information for follow-up

## Response Timeline

- **Acknowledgment**: Within 48 hours
- **Initial Assessment**: Within 7 days
- **Fix Development**: Depends on severity (Critical: 7 days, High: 14 days, Medium: 30 days, Low: 60 days)
- **Disclosure**: Coordinated disclosure after fix is released

## Disclosure Policy

- We follow coordinated disclosure practices
- Vulnerabilities will be publicly disclosed after a fix is released
- Credit will be given to reporters (unless anonymity is requested)
- CVE identifiers will be requested for significant vulnerabilities

## Security Best Practices for Users

- Always download from official GitHub Releases
- Verify release signatures (when available)
- Keep the application updated
- Desktop: Runs 100% offline - no network exposure
- Web/Mobile: Uses HTTPS only, temporary file storage (24h TTL)

## Scope

This security policy applies to:
- All source code in this repository
- Released binaries (Windows, Linux, macOS, Android)
- Web application (Cloudflare Pages)
- Backend API (if deployed)
- Docker images

## Out of Scope

- Third-party dependencies (report to their maintainers)
- User environment issues (OS, browser, hardware)
- Social engineering or phishing attacks
- Physical access attacks

## Acknowledgments

We appreciate the security research community and all those who responsibly disclose vulnerabilities. Hall of Fame: (will be populated as reports are received)