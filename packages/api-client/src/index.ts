// API Client for PDF to DOC Converter

// API types
export interface ConvertRequest {
  file: File;
  languages: string[];
  outputFormat: 'docx' | 'pdf' | 'md' | 'json';
  quality: 'fast' | 'balanced' | 'best';
  preserveLayout: boolean;
}

export interface ConvertResponse {
  jobId: string;
  status: string;
  message: string;
  downloadUrl?: string;
  fileName?: string;
}

export interface LanguageResponse {
  code: string;
  name: string;
  nativeName: string;
  isRTL: boolean;
}

export interface JobStatusResponse {
  jobId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  result?: {
    downloadUrl: string;
    fileName: string;
    fileSize: number;
  };
  error?: string;
}

export interface HealthResponse {
  status: string;
  version: string;
  ocrEngine: string;
}

export interface LanguageResponse {
  code: string;
  name: string;
  nativeName: string;
  isRTL: boolean;
}

export interface JobStatusResponse {
  jobId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  result?: {
    downloadUrl: string;
    fileName: string;
    fileSize: number;
  };
  error?: string;
}

export interface HealthResponse {
  status: string;
  version: string;
  ocrEngine: string;
}

// Create API base URL
const getApiBaseUrl = () => {
  try {
    // @ts-ignore
    return import.meta.env.VITE_API_BASE_URL || '/api/v1';
  } catch {
    return '/api/v1';
  }
};

const API_BASE_URL = getApiBaseUrl();

/**
 * Health check
 */
export async function healthCheck(): Promise<HealthResponse> {
  const response = await fetch(`${API_BASE_URL}/health`);
  if (!response.ok) throw new Error('Health check failed');
  return response.json();
}

/**
 * Get supported languages
 */
export async function getLanguages() {
  const response = await fetch(`${API_BASE_URL}/languages`);
  if (!response.ok) throw new Error('Failed to fetch languages');
  return response.json();
}

/**
 * Convert PDF to DOCX (upload and process)
 */
export async function convertPdf(file: File, options: {
  languages: string[];
  outputFormat: 'docx' | 'pdf' | 'md' | 'json';
  quality: 'fast' | 'balanced' | 'best';
  preserveLayout: boolean;
}) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('languages', options.languages.join(','));
  formData.append('outputFormat', options.outputFormat);
  formData.append('quality', options.quality);
  formData.append('preserveLayout', String(options.preserveLayout));

  const response = await fetch(`${API_BASE_URL}/convert`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Conversion failed' }));
    throw new Error(error.message || 'Conversion failed');
  }

  return response.json();
}

/**
 * Get job status
 */
export async function getJobStatus(jobId: string) {
  const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`);
  if (!response.ok) throw new Error('Failed to get job status');
  return response.json();
}

/**
 * Download result
 */
export async function downloadResult(downloadUrl: string): Promise<Blob> {
  const response = await fetch(downloadUrl);
  if (!response.ok) {
    throw new Error(`Download failed: ${response.statusText}`);
  }
  return response.blob();
}