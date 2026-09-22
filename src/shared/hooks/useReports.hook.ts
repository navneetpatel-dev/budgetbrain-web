'use client';

import { useState } from 'react';
import { apiGet, apiPost } from '@/shared/services/api';

interface ExportJobStatus {
  status: 'pending' | 'active' | 'completed' | 'failed';
  downloadUrl?: string;
  fileName?: string;
}

const POLL_INTERVAL_MS = 2000;
const MAX_POLL_ATTEMPTS = 30;

async function pollExportJob(jobId: string): Promise<string> {
  for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
    const status = await apiGet<ExportJobStatus>(`/reports/export-async/${jobId}`);
    if (status.status === 'completed' && status.downloadUrl) return status.downloadUrl;
    if (status.status === 'failed') throw new Error('Export failed');
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }
  throw new Error('Export timed out');
}

export function useReports() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const download = async (format: 'csv' | 'pdf' | 'excel', params?: Record<string, string>) => {
    setLoading(true); setError(null);
    try {
      const { jobId } = await apiPost<{ jobId: string }>('/reports/export-async', {
        format,
        filters: params,
      });
      const downloadUrl = await pollExportJob(jobId);
      // Presigned S3 URL (or local-storage fallback) — not behind app auth, so a direct
      // navigation works; no need for the blob/object-URL dance the old synchronous
      // endpoint needed to attach an Authorization header.
      window.location.href = downloadUrl;
    } catch { setError('Export failed'); }
    finally { setLoading(false); }
  };

  return { download, loading, error };
}
