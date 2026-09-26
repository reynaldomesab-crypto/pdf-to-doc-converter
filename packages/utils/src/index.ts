// Shared utilities for PDF to DOC Converter

import type { OCRConfig, Language } from '@pdf-ocr-converter/types';

/**
 * Format bytes to human readable string
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Format duration in milliseconds to human readable string
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  if (ms < 3600000) return `${(ms / 60000).toFixed(1)}m`;
  return `${(ms / 3600000).toFixed(1)}h`;
}

/**
 * Validate file type and size
 */
export function validateFile(file: File, config: OCRConfig): { valid: boolean; error?: string } {
  if (!config.allowedMimeTypes.includes(file.type)) {
    return { valid: false, error: `File type ${file.type} not allowed. Only PDF files are supported.` };
  }
  if (file.size > config.maxFileSize) {
    return { valid: false, error: `File size ${formatBytes(file.size)} exceeds maximum allowed size of ${formatBytes(config.maxFileSize)}.` };
  }
  return { valid: true };
}

/**
 * Generate unique ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Sleep utility
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  let lastError: Error;
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries) {
        await sleep(baseDelay * Math.pow(2, i));
      }
    }
  }
  throw lastError!;
}

/**
 * Supported languages with metadata
 */
export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'spa', name: 'Spanish', nativeName: 'Español', tessdataCode: 'spa', isRTL: false },
  { code: 'eng', name: 'English', nativeName: 'English', tessdataCode: 'eng', isRTL: false },
  { code: 'fra', name: 'French', nativeName: 'Français', tessdataCode: 'fra', isRTL: false },
  { code: 'deu', name: 'German', nativeName: 'Deutsch', tessdataCode: 'deu', isRTL: false },
  { code: 'ita', name: 'Italian', nativeName: 'Italiano', tessdataCode: 'ita', isRTL: false },
  { code: 'por', name: 'Portuguese', nativeName: 'Português', tessdataCode: 'por', isRTL: false },
  { code: 'rus', name: 'Russian', nativeName: 'Русский', tessdataCode: 'rus', isRTL: false },
  { code: 'chi_sim', name: 'Chinese (Simplified)', nativeName: '中文 (简体)', tessdataCode: 'chi_sim', isRTL: false },
  { code: 'jpn', name: 'Japanese', nativeName: '日本語', tessdataCode: 'jpn', isRTL: false },
  { code: 'kor', name: 'Korean', nativeName: '한국어', tessdataCode: 'kor', isRTL: false },
  { code: 'ara', name: 'Arabic', nativeName: 'العربية', tessdataCode: 'ara', isRTL: true },
  { code: 'hin', name: 'Hindi', nativeName: 'हिन्दी', tessdataCode: 'hin', isRTL: false },
];

/**
 * Get language by code
 */
export function getLanguage(code: string): Language | undefined {
  return SUPPORTED_LANGUAGES.find(lang => lang.code === code);
}

/**
 * Get language codes array
 */
export function getLanguageCodes(): string[] {
  return SUPPORTED_LANGUAGES.map(lang => lang.code);
}

/**
 * Format language display name
 */
export function formatLanguageName(code: string): string {
  const lang = getLanguage(code);
  return lang ? `${lang.nativeName} (${lang.name})` : code;
}

/**
 * Clamp number between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Parse PDF page range string (e.g., "1-5,8,10-12")
 */
export function parsePageRange(range: string, maxPages: number): number[] {
  const pages = new Set<number>();
  const parts = range.split(',').map(p => p.trim());
  
  for (const part of parts) {
    if (part.includes('-')) {
      const [start, end] = part.split('-').map(n => parseInt(n, 10));
      if (!isNaN(start) && !isNaN(end)) {
        for (let i = start; i <= end && i <= maxPages; i++) {
          if (i > 0) pages.add(i - 1); // Convert to 0-indexed
        }
      }
    } else {
      const page = parseInt(part, 10);
      if (!isNaN(page) && page > 0 && page <= maxPages) {
        pages.add(page - 1);
      }
    }
  }
  
  return Array.from(pages).sort((a, b) => a - b);
}

/**
 * Create object URL for file preview
 */
export function createObjectURL(file: File | Blob): string {
  return URL.createObjectURL(file);
}

/**
 * Revoke object URL
 */
export function revokeObjectURL(url: string): void {
  URL.revokeObjectURL(url);
}

/**
 * Download blob as file
 */
export function downloadBlob(blob: Blob, fileName: string): void {
  const url = createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  revokeObjectURL(url);
}