import { X } from 'lucide-react';
import { Button } from '../ui/button';

interface FormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  title: string;
  size?: 'standard' | 'wide';
  submitLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  isSubmitDisabled?: boolean;
  children: React.ReactNode;
}

export function FormModal({
  open,
  onClose,
  onSubmit,
  title,
  size = 'standard',
  submitLabel = 'Lưu',
  cancelLabel = 'Hủy',
  isLoading = false,
  isSubmitDisabled = false,
  children,
}: FormModalProps) {
  if (!open) return null;

  const width = size === 'wide' ? '720px' : '560px';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: 'rgba(15,23,42,0.4)' }}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative flex flex-col bg-white"
        style={{
          width,
          maxWidth: 'calc(100vw - 32px)',
          maxHeight: 'calc(100vh - 48px)',
          borderRadius: '12px',
          boxShadow: '0 10px 15px rgba(15,23,42,0.08), 0 4px 6px rgba(15,23,42,0.04)',
          animation: 'fadeScaleIn 150ms ease-out',
        }}
      >
        <style>{`
          @keyframes fadeScaleIn {
            from { opacity: 0; transform: scale(0.97); }
            to { opacity: 1; transform: scale(1); }
          }
        `}</style>

        {/* Sticky Header */}
        <div
          className="flex items-center justify-between flex-shrink-0"
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid #E2E8F0',
          }}
        >
          <h2
            style={{
              fontSize: '20px',
              fontWeight: 600,
              lineHeight: '1.35',
              color: '#1E293B',
            }}
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
            aria-label="Đóng"
          >
            <X className="h-5 w-5" style={{ color: '#64748B' }} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div
          className="flex-1 overflow-y-auto"
          style={{
            padding: '24px',
          }}
        >
          {children}
        </div>

        {/* Sticky Footer */}
        <div
          className="flex items-center justify-end gap-3 flex-shrink-0"
          style={{
            padding: '16px 24px',
            borderTop: '1px solid #E2E8F0',
          }}
        >
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            style={{
              backgroundColor: '#F1F5F9',
              color: '#334155',
              border: '1px solid #CBD5E1',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 500,
              padding: '10px 16px',
            }}
          >
            {cancelLabel}
          </Button>
          <Button
            onClick={onSubmit}
            disabled={isSubmitDisabled || isLoading}
            style={{
              backgroundColor: '#1D4ED8',
              color: '#FFFFFF',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 500,
              padding: '10px 16px',
            }}
          >
            {isLoading ? 'Đang lưu...' : submitLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
