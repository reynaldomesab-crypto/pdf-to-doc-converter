// API Client for PDF to DOC Converter

import { createClient } from 'openapi-fetch';
import type { paths } from './schema';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export const apiClient = createClient<paths>({
  baseUrl: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Health check
 */
export async function healthCheck() {
  const { data, error } = await apiClient.GET('/health');
  if (error) throw error;
  return data;
}

/**
 * Get supported languages
 */
export async function getLanguages() {
  const { data, error } = await apiClient.GET('/languages');
  if (error) throw error;
  return data;
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

  const { data, error } = await apiClient.POST('/convert', {
    body: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  if (error) throw error;
  return data;
}

/**
 * Get job status
 */
export async function getJobStatus(jobId: string) {
  const { data, error } = await apiClient.GET('/jobs/{jobId}', {
    params: { path: { jobId } },
  });
  if (error) throw error;
  return data;
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