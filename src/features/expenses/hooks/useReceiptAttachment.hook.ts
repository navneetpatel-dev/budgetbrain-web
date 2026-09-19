'use client';

import { useState, useCallback } from 'react';
import axios from 'axios';
import { apiGet, apiDelete, api } from '@/shared/services/api';

export interface Attachment {
  id: string;
  transactionId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  s3Url: string;
  s3UrlExpiresIn?: number;
  createdAt: string;
}

export function useReceiptAttachment() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadReceipt = useCallback(async (txId: string, file: File): Promise<Attachment> => {
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('receipt', file);

      const { data } = await api.post<{ success: boolean; data: Attachment }>(
        `/expenses/${txId}/attachments`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );
      return data.data;
    } catch (err: unknown) {
      let msg = 'Failed to upload receipt';
      if (axios.isAxiosError(err)) {
        msg = (err.response?.data as { error?: { message?: string } })?.error?.message || err.message || msg;
      } else if (err instanceof Error) {
        msg = err.message;
      }
      setError(msg);
      throw new Error(msg);
    } finally {
      setUploading(false);
    }
  }, []);

  const fetchAttachments = useCallback(async (txId: string): Promise<Attachment[]> => {
    try {
      const res = await apiGet<Attachment[]>(`/expenses/${txId}/attachments`);
      return res;
    } catch (err: unknown) {
      console.warn('Failed to load attachments:', err);
      return [];
    }
  }, []);

  const deleteReceipt = useCallback(async (txId: string, attachmentId: string): Promise<void> => {
    try {
      await apiDelete(`/expenses/${txId}/attachments/${attachmentId}`);
    } catch (err: unknown) {
      let msg = 'Failed to delete attachment';
      if (axios.isAxiosError(err)) {
        msg = (err.response?.data as { error?: { message?: string } })?.error?.message || err.message || msg;
      } else if (err instanceof Error) {
        msg = err.message;
      }
      setError(msg);
      throw new Error(msg);
    }
  }, []);

  return {
    uploading,
    error,
    setError,
    uploadReceipt,
    fetchAttachments,
    deleteReceipt,
  };
}
