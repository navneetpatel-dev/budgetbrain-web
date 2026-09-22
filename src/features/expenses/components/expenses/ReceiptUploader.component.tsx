'use client';

import { useState, useRef, ChangeEvent, DragEvent } from 'react';
import { AppIcon } from '@/shared/components/ui/icons/AppIcon';
import { receiptUploaderStyles as receiptStyles } from '../../styles/expenses/expenses.styles';
import type { Attachment } from '../../hooks/expenses/useReceiptAttachment.hook';

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
    <div className={receiptStyles.root}>
      <div className={receiptStyles.header}>
        <label className={receiptStyles.label}>
          Receipt Attachment
        </label>
        <span className={receiptStyles.hint}>JPG, PNG, PDF (max 10MB)</span>
      </div>

      {/* Existing attachments */}
      {existingAttachments.length > 0 && (
        <div className={receiptStyles.attachmentList}>
          {existingAttachments.map((att) => (
            <div
              key={att.id}
              className={receiptStyles.attachment}
            >
              <div className={receiptStyles.fileMeta}>
                <div className={receiptStyles.fileIcon}>
                  <AppIcon name={att.fileType.includes('pdf') ? 'document' : 'receipt'} size={20} />
                </div>
                <div className={receiptStyles.truncate}>
                  <p className={receiptStyles.fileName}>{att.fileName}</p>
                  <p className={receiptStyles.fileSize}>{(att.fileSize / 1024).toFixed(1)} KB</p>
                </div>
              </div>

              <div className={receiptStyles.actions}>
                <a
                  href={att.s3Url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={receiptStyles.viewLink}
                  title="View / Download"
                >
                  <AppIcon name="link" size={16} />
                </a>
                {onDeleteExisting && (
                  <button
                    type="button"
                    onClick={() => void onDeleteExisting(att.id)}
                    disabled={disabled}
                    className={receiptStyles.deleteButton}
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
        <div className={receiptStyles.pending}>
          <div className={receiptStyles.fileMeta}>
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Receipt thumbnail"
                className={receiptStyles.thumbnail}
                onClick={() => setActiveModalUrl(previewUrl)}
              />
            ) : (
              <div className={receiptStyles.fileIcon}>
                <AppIcon name="document" size={20} />
              </div>
            )}
            <div className={receiptStyles.truncate}>
              <p className={receiptStyles.fileName}>{pendingFile.name}</p>
              <p className={receiptStyles.fileSize}>{(pendingFile.size / 1024).toFixed(1)} KB · Ready to upload</p>
            </div>
          </div>

          <button
            type="button"
            onClick={clearPending}
            disabled={disabled}
            className={receiptStyles.clearButton}
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
          className={`${receiptStyles.dropzone} ${isDragging ? receiptStyles.dropzoneActive : receiptStyles.dropzoneIdle}${disabled ? ` ${receiptStyles.dropzoneDisabled}` : ''}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.pdf"
            onChange={onInputChange}
            className={receiptStyles.fileInput}
            disabled={disabled}
          />
          <div className={receiptStyles.uploadIcon}>
            <AppIcon name="upload" size={20} />
          </div>
          <p className={receiptStyles.uploadTitle}>
            Click to upload or drag & drop receipt
          </p>
          <p className={receiptStyles.uploadHint}>JPG, PNG, or PDF</p>
        </div>
      )}

      {/* Modal image preview */}
      {activeModalUrl && (
        <div
          className={receiptStyles.modal}
          onClick={() => setActiveModalUrl(null)}
        >
          <div className={receiptStyles.modalFrame}>
            <img
              src={activeModalUrl}
              alt="Receipt Preview"
              className={receiptStyles.modalImage}
            />
            <button
              type="button"
              onClick={() => setActiveModalUrl(null)}
              className={receiptStyles.modalClose}
            >
              <AppIcon name="close" size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
