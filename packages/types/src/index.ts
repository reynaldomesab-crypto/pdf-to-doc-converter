// Shared TypeScript types for PDF to DOC Converter

// API Types
export interface OCRRequest {
  file: File;
  languages: string[];
  outputFormat: 'docx' | 'pdf' | 'md' | 'json';
  quality: 'fast' | 'balanced' | 'best';
  preserveLayout: boolean;
}

export interface OCRResponse {
  jobId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number; // 0-100
  result?: OCRResult;
  error?: string;
}

export interface OCRResult {
  downloadUrl: string;
  expiresAt: string; // ISO 8601
  fileName: string;
  fileSize: number;
  pageCount: number;
  languagesDetected: string[];
  processingTimeMs: number;
}

export interface HealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  version: string;
  uptime: number;
  ocrEngine: 'pymupdf' | 'tesseract';
  supportedLanguages: string[];
}

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  tessdataCode: string;
  isRTL: boolean;
}

// Progress Events
export interface ProgressEvent {
  stage: 'uploading' | 'analyzing' | 'ocr' | 'converting' | 'finalizing';
  progress: number; // 0-100
  message: string;
  details?: Record<string, unknown>;
}

// Error Types
export interface APIError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp: string;
}

export class OCRError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'OCRError';
  }
}

// Configuration Types
export interface OCRConfig {
  languages: string[];
  outputFormat: 'docx' | 'pdf' | 'md' | 'json';
  quality: 'fast' | 'balanced' | 'best';
  preserveLayout: boolean;
  maxFileSize: number; // bytes
  allowedMimeTypes: string[];
}

export const DEFAULT_OCR_CONFIG: OCRConfig = {
  languages: ['spa', 'eng'],
  outputFormat: 'docx',
  quality: 'balanced',
  preserveLayout: true,
  maxFileSize: 100 * 1024 * 1024, // 100 MB
  allowedMimeTypes: ['application/pdf'],
};

// Platform Types
export type Platform = 'web' | 'desktop' | 'mobile' | 'cli';

export interface PlatformCapabilities {
  offline: boolean;
  fileSystemAccess: boolean;
  cameraAccess: boolean;
  haptics: boolean;
  backgroundProcessing: boolean;
  pushNotifications: boolean;
}

export const PLATFORM_CAPABILITIES: Record<Platform, PlatformCapabilities> = {
  web: {
    offline: true, // PWA
    fileSystemAccess: true, // File System Access API
    cameraAccess: true,
    haptics: false,
    backgroundProcessing: false,
    pushNotifications: true,
  },
  desktop: {
    offline: true,
    fileSystemAccess: true,
    cameraAccess: true,
    haptics: false,
    backgroundProcessing: true,
    pushNotifications: true,
  },
  mobile: {
    offline: true,
    fileSystemAccess: true,
    cameraAccess: true,
    haptics: true,
    backgroundProcessing: true,
    pushNotifications: true,
  },
  cli: {
    offline: true,
    fileSystemAccess: true,
    cameraAccess: false,
    haptics: false,
    backgroundProcessing: true,
    pushNotifications: false,
  },
};