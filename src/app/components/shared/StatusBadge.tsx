import { cn } from '../ui/utils';
import type { BiddingState, BudgetStatus } from '../../lib/types';

interface StatusBadgeProps {
  status: BiddingState | BudgetStatus | string;
  type?: 'bidding' | 'budget' | 'payment' | 'quality' | 'contract' | 'po' | 'bid' | 'supplier';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// QTTB Guidelines - Status Badge Color Mapping
const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  // Bidding States
  draft: { bg: '#F1F5F9', text: '#475569', border: '#E2E8F0' }, // Secondary 90 / 40
  pending_approval: { bg: '#FEF3C7', text: '#B45309', border: '#FDE68A' }, // Tertiary 90 / 40
  approved_hsmt: { bg: '#F0FDF4', text: '#15803D', border: '#BBF7D0' }, // Success 90 / 40
  published: { bg: '#EFF6FF', text: '#1D4ED8', border: '#BFDBFE' }, // Staff Primary 90 / 30
  bidding_open: { bg: '#EFF6FF', text: '#1D4ED8', border: '#BFDBFE' }, // Staff Primary 90 / 30
  bidding_closed: { bg: '#FFFBEB', text: '#B45309', border: '#FDE68A' }, // Warning 90 / 40
  evaluation: { bg: '#FFFBEB', text: '#B45309', border: '#FDE68A' }, // Warning 90 / 40
  evaluation_complete: { bg: '#FEF3C7', text: '#92400E', border: '#FCD34D' }, // Tertiary 80 / 30
  evaluation_approved: { bg: '#F0FDF4', text: '#15803D', border: '#BBF7D0' }, // Success 90 / 40
  standstill: { bg: '#FEF3C7', text: '#92400E', border: '#FCD34D' }, // Warning 80 / 30
  complaint_period: { bg: '#FEF2F2', text: '#DC2626', border: '#FECACA' }, // Error 90 / 40
  complaint_resolved: { bg: '#F0FDF4', text: '#15803D', border: '#BBF7D0' }, // Success 90 / 40
  winner_announced: { bg: '#BBF7D0', text: '#166534', border: '#86EFAC' }, // Success 80 / 30
  contract_pending: { bg: '#FEF3C7', text: '#B45309', border: '#FDE68A' }, // Tertiary 90 / 40
  contract_signed: { bg: '#BBF7D0', text: '#166534', border: '#86EFAC' }, // Success 80 / 30
  cancelled: { bg: '#FEF2F2', text: '#DC2626', border: '#FECACA' }, // Error 90 / 50

  // Budget States
  pending: { bg: '#FEF3C7', text: '#B45309', border: '#FDE68A' },
  approved: { bg: '#F0FDF4', text: '#15803D', border: '#BBF7D0' },
  rejected: { bg: '#FEF2F2', text: '#DC2626', border: '#FECACA' },

  // Payment States
  paid: { bg: '#F0FDF4', text: '#15803D', border: '#BBF7D0' },
  overdue: { bg: '#FEF2F2', text: '#DC2626', border: '#FECACA' },

  // Quality States
  good: { bg: '#F0FDF4', text: '#15803D', border: '#BBF7D0' },
  defective: { bg: '#FEF2F2', text: '#DC2626', border: '#FECACA' },
  missing: { bg: '#FFFBEB', text: '#B45309', border: '#FDE68A' },

  // Contract States
  executing: { bg: '#EFF6FF', text: '#1D4ED8', border: '#BFDBFE' },
  completed: { bg: '#F0FDF4', text: '#15803D', border: '#BBF7D0' },
  terminated: { bg: '#FEF2F2', text: '#DC2626', border: '#FECACA' },

  // PO States
  partial: { bg: '#FEF3C7', text: '#B45309', border: '#FDE68A' },

  // Bid States
  submitted: { bg: '#EFF6FF', text: '#1D4ED8', border: '#BFDBFE' },
  evaluated: { bg: '#FEF3C7', text: '#B45309', border: '#FDE68A' },
  winner: { bg: '#BBF7D0', text: '#166534', border: '#86EFAC' },

  // Supplier States
  pending_approval: { bg: '#FEF3C7', text: '#B45309', border: '#FDE68A' },
  suspended: { bg: '#FFFBEB', text: '#B45309', border: '#FDE68A' },
  blacklisted: { bg: '#FECACA', text: '#B91C1C', border: '#FCA5A5' },
};

// Label mapping for Vietnamese
const STATUS_LABELS: Record<string, string> = {
  draft: 'Nháp',
  pending_approval: 'Chờ duyệt',
  approved_hsmt: 'HSMT đã duyệt',
  published: 'Đã công bố',
  bidding_open: 'Đang mở thầu',
  bidding_closed: 'Đã đóng thầu',
  evaluation: 'Đang đánh giá',
  evaluation_complete: 'Đánh giá xong',
  evaluation_approved: 'Kết quả đã duyệt',
  standstill: 'Chờ phản đối',
  complaint_period: 'Có khiếu nại',
  complaint_resolved: 'Đã giải quyết',
  winner_announced: 'Đã công bố trúng thầu',
  contract_pending: 'Chờ ký HĐ',
  contract_signed: 'Đã ký HĐ',
  cancelled: 'Đã hủy',
  pending: 'Chờ duyệt',
  approved: 'Đã duyệt',
  rejected: 'Từ chối',
  paid: 'Đã thanh toán',
  overdue: 'Quá hạn',
  good: 'Tốt',
  defective: 'Lỗi',
  missing: 'Thiếu',
  executing: 'Đang thực hiện',
  completed: 'Hoàn thành',
  terminated: 'Đã chấm dứt',
  partial: 'Nhận một phần',
  submitted: 'Đã nộp',
  evaluated: 'Đã đánh giá',
  winner: 'Trúng thầu',
  suspended: 'Tạm ngưng',
  blacklisted: 'Danh sách đen',
};

export function StatusBadge({ status, size = 'md', className }: StatusBadgeProps) {
  const colors = STATUS_COLORS[status] || STATUS_COLORS.draft;
  const label = STATUS_LABELS[status] || status;

  const sizeClasses = {
    sm: 'text-[11px] px-[6px] py-[1px]', // Table rows
    md: 'text-[12px] px-2 py-0.5', // Cards, headers
    lg: 'text-[13px] px-3 py-1', // Detail page
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-semibold rounded-full border',
        sizeClasses[size],
        className
      )}
      style={{
        backgroundColor: colors.bg,
        color: colors.text,
        borderColor: colors.border,
      }}
      aria-label={label}
    >
      {label}
    </span>
  );
}
