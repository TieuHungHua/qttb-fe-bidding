import { useState } from 'react';
import { AlertTriangle, XCircle, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (reason?: string) => void;
  title: string;
  description: string;
  variant?: 'warning' | 'destructive';
  requireReason?: boolean;
  reasonLabel?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  variant = 'warning',
  requireReason = false,
  reasonLabel = 'Lý do *',
  confirmLabel = 'Xác nhận',
  cancelLabel = 'Hủy',
  isLoading = false,
}: ConfirmDialogProps) {
  const [reason, setReason] = useState('');

  if (!open) return null;

  const isDestructive = variant === 'destructive';
  const canConfirm = !requireReason || reason.trim().length > 0;

  const handleConfirm = () => {
    if (canConfirm) {
      onConfirm(requireReason ? reason : undefined);
      setReason('');
    }
  };

  const handleClose = () => {
    if (!isDestructive) {
      onClose();
      setReason('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: 'rgba(15,23,42,0.4)' }}
        onClick={handleClose}
      />

      {/* Dialog */}
      <div
        className="relative w-full bg-white rounded-xl overflow-hidden"
        style={{
          width: '480px',
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

        {/* Header */}
        <div className="flex items-start gap-3 p-6 pb-4">
          <div
            className="flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-full"
            style={{
              backgroundColor: isDestructive ? '#FEF2F2' : '#FFFBEB',
            }}
          >
            {isDestructive ? (
              <XCircle className="h-5 w-5" style={{ color: '#DC2626' }} />
            ) : (
              <AlertTriangle className="h-5 w-5" style={{ color: '#B45309' }} />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h2
              className="font-semibold"
              style={{ fontSize: '16px', lineHeight: '1.4', color: '#1E293B' }}
            >
              {title}
            </h2>
          </div>
          {!isDestructive && (
            <button
              onClick={onClose}
              className="flex-shrink-0 p-1 rounded-md hover:bg-gray-100 transition-colors"
              aria-label="Đóng"
            >
              <X className="h-4 w-4" style={{ color: '#64748B' }} />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="px-6 pb-4">
          <p
            style={{
              fontSize: '13px',
              lineHeight: '1.5',
              color: '#475569',
            }}
          >
            {description}
          </p>

          {requireReason && (
            <div className="mt-4">
              <label
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: '#475569',
                  marginBottom: '6px',
                }}
              >
                {reasonLabel}
              </label>
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Nhập lý do..."
                rows={3}
                style={{
                  fontSize: '14px',
                  borderColor: reason.trim() ? '#94A3B8' : '#CBD5E1',
                  borderRadius: '6px',
                  resize: 'none',
                }}
              />
              {requireReason && !reason.trim() && (
                <p style={{ fontSize: '12px', color: '#94A3B8', marginTop: '4px' }}>
                  Bắt buộc nhập lý do
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-end gap-3 px-6 py-4"
          style={{
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
            onClick={handleConfirm}
            disabled={!canConfirm || isLoading}
            style={{
              backgroundColor: isDestructive ? '#DC2626' : '#1D4ED8',
              color: '#FFFFFF',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 500,
              padding: '10px 16px',
              opacity: (!canConfirm || isLoading) ? 0.5 : 1,
              cursor: (!canConfirm || isLoading) ? 'not-allowed' : 'pointer',
            }}
          >
            {isLoading ? 'Đang xử lý...' : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}