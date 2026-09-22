import { useState } from 'react';
import { apiDownloadBinary } from '@/shared/services/api';

export function useReports() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const download = async (format: 'csv' | 'pdf' | 'excel', params?: Record<string, string>) => {
    setLoading(true); setError(null);
    try {
      const blob = await apiDownloadBinary(`/reports/${format}`, params);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const ext = format === 'excel' ? 'xlsx' : format;
      a.href = url; a.download = `report.${ext}`; a.click();
      URL.revokeObjectURL(url);
    } catch { setError('Download failed'); }
    finally { setLoading(false); }
  };

  return { download, loading, error };
}
