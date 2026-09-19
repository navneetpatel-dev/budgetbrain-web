'use client';

import { useState, useRef, ChangeEvent, DragEvent } from 'react';
import { AppIcon } from '@/shared/components/ui/icons/AppIcon';
import type { Attachment } from '../hooks/useReceiptAttachment.hook';

interface ReceiptUploaderProps {
  existingAttachments?: Attachment[];
  pendingFile?: File | null;
  onFileSelect?: (file: File | null) => void;
  onDeleteExisting?: (attachmentId: string) => Promise<void>;
  disabled?: boolean;
}

export function ReceiptUploader({
  existingAttachments = [],
  pendingFile,
  onFileSelect,
  onDeleteExisting,
  disabled = false,
}: ReceiptUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [activeModalUrl, setActiveModalUrl] = useState<string | null>(null);

  const handleFile = (file: File) => {
    const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      alert('Only JPG, PNG, and PDF files are supported.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('Receipt size must be less than 10MB.');
      return;
    }

    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
    onFileSelect?.(file);
  };

  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const onDragOver = (e: DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const clearPending = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    onFileSelect?.(null);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold tracking-wider uppercase text-slate-400">
          Receipt Attachment
        </label>
        <span className="text-xs text-slate-500">JPG, PNG, PDF (max 10MB)</span>
      </div>

      {/* Existing attachments */}
      {existingAttachments.length > 0 && (
        <div className="space-y-2">
          {existingAttachments.map((att) => (
            <div
              key={att.id}
              className="flex items-center justify-between p-3 rounded-xl border border-slate-700/60 bg-slate-900/40"
            >
              <div className="flex items-center space-x-3 overflow-hidden">
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                  <AppIcon name={att.fileType.includes('pdf') ? 'document' : 'receipt'} size={20} />
                </div>
                <div className="truncate">
                  <p className="text-sm font-medium text-slate-200 truncate">{att.fileName}</p>
                  <p className="text-xs text-slate-400">{(att.fileSize / 1024).toFixed(1)} KB</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <a
                  href={att.s3Url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
                  title="View / Download"
                >
                  <AppIcon name="link" size={16} />
                </a>
                {onDeleteExisting && (
                  <button
                    type="button"
                    onClick={() => void onDeleteExisting(att.id)}
                    disabled={disabled}
                    className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition"
                    title="Delete Receipt"
                  >
                    <AppIcon name="trash" size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pending file preview */}
      {pendingFile && (
        <div className="flex items-center justify-between p-3 rounded-xl border border-indigo-500/40 bg-indigo-500/5">
          <div className="flex items-center space-x-3 overflow-hidden">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Receipt thumbnail"
                className="w-10 h-10 rounded-lg object-cover border border-indigo-500/30 cursor-pointer"
                onClick={() => setActiveModalUrl(previewUrl)}
              />
            ) : (
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                <AppIcon name="document" size={20} />
              </div>
            )}
            <div className="truncate">
              <p className="text-sm font-medium text-slate-200 truncate">{pendingFile.name}</p>
              <p className="text-xs text-slate-400">{(pendingFile.size / 1024).toFixed(1)} KB · Ready to upload</p>
            </div>
          </div>

          <button
            type="button"
            onClick={clearPending}
            disabled={disabled}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
            title="Remove selection"
          >
            <AppIcon name="close" size={16} />
          </button>
        </div>
      )}

      {/* Upload Dropzone */}
      {!pendingFile && (
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => !disabled && fileInputRef.current?.click()}
          className={`cursor-pointer flex flex-col items-center justify-center p-5 rounded-xl border-2 border-dashed transition text-center ${
            isDragging
              ? 'border-indigo-500 bg-indigo-500/10'
              : 'border-slate-700/80 hover:border-slate-600 bg-slate-900/20 hover:bg-slate-900/40'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.pdf"
            onChange={onInputChange}
            className="hidden"
            disabled={disabled}
          />
          <div className="p-2.5 mb-2 rounded-full bg-slate-800 text-slate-400">
            <AppIcon name="upload" size={20} />
          </div>
          <p className="text-xs font-medium text-slate-300">
            Click to upload or drag & drop receipt
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">JPG, PNG, or PDF</p>
        </div>
      )}

      {/* Modal image preview */}
      {activeModalUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setActiveModalUrl(null)}
        >
          <div className="relative max-w-3xl max-h-[90vh]">
            <img
              src={activeModalUrl}
              alt="Receipt Preview"
              className="max-h-[85vh] max-w-full rounded-xl object-contain"
            />
            <button
              type="button"
              onClick={() => setActiveModalUrl(null)}
              className="absolute top-2 right-2 p-2 rounded-full bg-slate-900/80 text-white hover:bg-slate-800"
            >
              <AppIcon name="close" size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
