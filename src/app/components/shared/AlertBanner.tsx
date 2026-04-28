import { Info, CheckCircle, AlertTriangle, XCircle, X } from 'lucide-react';

type AlertVariant = 'info' | 'success' | 'warning' | 'error';

interface AlertBannerProps {
  variant: AlertVariant;
  title?: string;
  message: string;
  onClose?: () => void;
  className?: string;
}

const VARIANT_CONFIG: Record<AlertVariant, {
  bg: string;
  border: string;
  iconColor: string;
  titleColor: string;
  textColor: string;
  Icon: typeof Info;
}> = {
  info: {
    bg: '#EFF6FF',
    border: '#3B82F6',
    iconColor: '#3B82F6',
    titleColor: '#1D4ED8',
    textColor: '#1E293B',
    Icon: Info,
  },
  success: {
    bg: '#F0FDF4',
    border: '#15803D',
    iconColor: '#15803D',
    titleColor: '#15803D',
    textColor: '#1E293B',
    Icon: CheckCircle,
  },
  warning: {
    bg: '#FFFBEB',
    border: '#B45309',
    iconColor: '#B45309',
    titleColor: '#92400E',
    textColor: '#1E293B',
    Icon: AlertTriangle,
  },
  error: {
    bg: '#FEF2F2',
    border: '#DC2626',
    iconColor: '#DC2626',
    titleColor: '#991B1B',
    textColor: '#1E293B',
    Icon: XCircle,
  },
};

export function AlertBanner({ variant, title, message, onClose, className }: AlertBannerProps) {
  const config = VARIANT_CONFIG[variant];
  const { Icon } = config;

  return (
    <div
      className={`flex items-start gap-3 rounded-lg px-4 py-3 ${className ?? ''}`}
      style={{
        backgroundColor: config.bg,
        borderLeft: `4px solid ${config.border}`,
        border: `1px solid ${config.border}`,
        borderRadius: '8px',
      }}
      role="alert"
    >
      <Icon
        className="flex-shrink-0 mt-0.5 h-4 w-4"
        style={{ color: config.iconColor }}
        aria-hidden="true"
      />
      <div className="flex-1 min-w-0">
        {title && (
          <p
            className="mb-0.5"
            style={{
              fontSize: '13px',
              fontWeight: 600,
              color: config.titleColor,
              lineHeight: '1.4',
            }}
          >
            {title}
          </p>
        )}
        <p
          style={{
            fontSize: '13px',
            lineHeight: '1.5',
            color: config.textColor,
          }}
        >
          {message}
        </p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="flex-shrink-0 p-0.5 rounded hover:opacity-70 transition-opacity"
          aria-label="Đóng"
        >
          <X className="h-4 w-4" style={{ color: config.iconColor }} />
        </button>
      )}
    </div>
  );
}
