import { useState, useRef } from 'react';
import { Paperclip, FileText, X, Upload } from 'lucide-react';
import { formatFileSize } from '../../lib/utils';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  file?: File;
}

interface UploadAreaProps {
  files: UploadedFile[];
  onChange: (files: UploadedFile[]) => void;
  accept?: string;
  maxSizeMB?: number;
  label?: string;
  disabled?: boolean;
}

export function UploadArea({
  files,
  onChange,
  accept = '.pdf,.doc,.docx,.xls,.xlsx',
  maxSizeMB = 10,
  label = 'PDF, DOCX, XLS',
  disabled = false,
}: UploadAreaProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (newFiles: FileList | null) => {
    if (!newFiles) return;
    const maxBytes = maxSizeMB * 1024 * 1024;
    const added: UploadedFile[] = Array.from(newFiles)
      .filter((f) => f.size <= maxBytes)
      .map((f) => ({
        id: `file-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        name: f.name,
        size: f.size,
        file: f,
      }));
    onChange([...files, ...added]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (!disabled) handleFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragOver(true);
  };

  const handleDragLeave = () => setIsDragOver(false);

  const removeFile = (id: string) => {
    onChange(files.filter((f) => f.id !== id));
  };

  return (
    <div className="space-y-2">
      {/* Drop Zone */}
      <div
        onClick={() => !disabled && inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className="flex flex-col items-center justify-center gap-2 rounded-lg cursor-pointer transition-colors"
        style={{
          border: `2px dashed ${isDragOver ? '#3B82F6' : '#94A3B8'}`,
          backgroundColor: isDragOver ? '#EFF6FF' : '#F1F5F9',
          padding: '24px 16px',
          borderRadius: '8px',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.6 : 1,
        }}
        aria-label="Khu vực tải lên tệp"
      >
        <div
          className="flex h-10 w-10 items-center justify-center rounded-full"
          style={{ backgroundColor: isDragOver ? '#DBEAFE' : '#E2E8F0' }}
        >
          {isDragOver ? (
            <Upload className="h-5 w-5" style={{ color: '#3B82F6' }} />
          ) : (
            <Paperclip className="h-5 w-5" style={{ color: '#64748B' }} />
          )}
        </div>
        <div className="text-center">
          <p style={{ fontSize: '14px', fontWeight: 500, color: '#334155' }}>
            {isDragOver ? 'Thả tệp vào đây' : 'Kéo thả tệp hoặc nhấn để chọn'}
          </p>
          <p style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
            {label} — tối đa {maxSizeMB}MB
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={accept}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
          disabled={disabled}
        />
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-1.5">
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center gap-3 rounded-md"
              style={{
                backgroundColor: '#F1F5F9',
                padding: '8px 12px',
                borderRadius: '6px',
              }}
            >
              <FileText className="h-4 w-4 flex-shrink-0" style={{ color: '#475569' }} />
              <div className="flex-1 min-w-0">
                <p
                  className="truncate"
                  style={{ fontSize: '13px', fontWeight: 500, color: '#334155' }}
                >
                  {file.name}
                </p>
                <p style={{ fontSize: '12px', color: '#64748B' }}>{formatFileSize(file.size)}</p>
              </div>
              {!disabled && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(file.id);
                  }}
                  className="flex-shrink-0 p-1 rounded hover:bg-gray-200 transition-colors"
                  aria-label={`Xóa ${file.name}`}
                >
                  <X className="h-3.5 w-3.5" style={{ color: '#64748B' }} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
