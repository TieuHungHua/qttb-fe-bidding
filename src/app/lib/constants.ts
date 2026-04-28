import type { BiddingState, UserRole, BudgetStatus, BiddingMethod } from './types';

// Bidding States Configuration (16 states per Luật Đấu thầu 2023)
export const BIDDING_STATES: Record<BiddingState, { label: string; color: string; order: number }> = {
  draft: { label: 'Khởi tạo', color: 'gray', order: 1 },
  pending_approval: { label: 'Chờ phê duyệt', color: 'yellow', order: 2 },
  approved_hsmt: { label: 'HSMT đã duyệt', color: 'blue', order: 3 },
  published: { label: 'Đã công bố', color: 'green', order: 4 },
  bidding_open: { label: 'Đang mở thầu', color: 'cyan', order: 5 },
  bidding_closed: { label: 'Đã đóng thầu', color: 'orange', order: 6 },
  evaluation: { label: 'Đang đánh giá', color: 'purple', order: 7 },
  evaluation_complete: { label: 'Đánh giá hoàn tất', color: 'indigo', order: 8 },
  evaluation_approved: { label: 'Kết quả đã duyệt', color: 'blue', order: 9 },
  standstill: { label: 'Chờ phản đối (30 ngày)', color: 'amber', order: 10 },
  complaint_period: { label: 'Có khiếu nại', color: 'red', order: 11 },
  complaint_resolved: { label: 'Khiếu nại đã giải quyết', color: 'teal', order: 12 },
  winner_announced: { label: 'Đã công bố trúng thầu', color: 'green', order: 13 },
  contract_pending: { label: 'Chờ ký hợp đồng', color: 'yellow', order: 14 },
  contract_signed: { label: 'Đã ký hợp đồng', color: 'green', order: 15 },
  cancelled: { label: 'Đã hủy', color: 'red', order: 16 },
};

// User Roles Configuration
export const USER_ROLES: Record<UserRole, { label: string; description: string }> = {
  admin: { label: 'Quản trị viên', description: 'Quản trị hệ thống' },
  equipment_manager: { label: 'Quản lý thiết bị', description: 'Quản lý mua sắm thiết bị' },
  accountant: { label: 'Kế toán', description: 'Quản lý ngân sách và tài chính' },
  council_expert: { label: 'Hội đồng chuyên môn', description: 'Thành viên hội đồng chuyên môn' },
  council_evaluator: { label: 'Hội đồng thẩm định', description: 'Thành viên hội đồng thẩm định' },
  approver: { label: 'Lãnh đạo phê duyệt', description: 'Phê duyệt các quyết định quan trọng' },
  supplier: { label: 'Nhà cung cấp', description: 'Nhà cung cấp thiết bị' },
};

// Budget Status Configuration
export const BUDGET_STATUSES: Record<BudgetStatus, { label: string; color: string }> = {
  draft: { label: 'Nháp', color: 'gray' },
  pending: { label: 'Chờ duyệt', color: 'yellow' },
  approved: { label: 'Đã duyệt', color: 'green' },
  rejected: { label: 'Từ chối', color: 'red' },
};

// Bidding Methods
export const BIDDING_METHODS: Record<BiddingMethod, { label: string; description: string }> = {
  open: { label: 'Đấu thầu rộng rãi', description: 'Công khai cho mọi nhà cung cấp' },
  limited: { label: 'Đấu thầu hạn chế', description: 'Giới hạn số lượng nhà cung cấp' },
  direct: { label: 'Chỉ định thầu', description: 'Chỉ định trực tiếp nhà cung cấp' },
  shopping: { label: 'Chào hàng cạnh tranh', description: 'Mua sắm trực tiếp với giá trị nhỏ' },
};

// Payment Status
export const PAYMENT_STATUSES = {
  pending: { label: 'Chưa thanh toán', color: 'yellow' },
  paid: { label: 'Đã thanh toán', color: 'green' },
  overdue: { label: 'Quá hạn', color: 'red' },
};

// Quality Status
export const QUALITY_STATUSES = {
  good: { label: 'Tốt', color: 'green' },
  defective: { label: 'Lỗi', color: 'red' },
  missing: { label: 'Thiếu', color: 'orange' },
};

// Contract Status
export const CONTRACT_STATUSES = {
  draft: { label: 'Nháp', color: 'gray' },
  signed: { label: 'Đã ký', color: 'green' },
  executing: { label: 'Đang thực hiện', color: 'blue' },
  completed: { label: 'Hoàn thành', color: 'green' },
  terminated: { label: 'Đã chấm dứt', color: 'red' },
};

// PO Status
export const PO_STATUSES = {
  draft: { label: 'Nháp', color: 'gray' },
  approved: { label: 'Đã duyệt', color: 'green' },
  partial: { label: 'Nhận một phần', color: 'yellow' },
  completed: { label: 'Hoàn thành', color: 'green' },
  cancelled: { label: 'Đã hủy', color: 'red' },
};

// Bid Status
export const BID_STATUSES = {
  submitted: { label: 'Đã nộp', color: 'blue' },
  evaluated: { label: 'Đã đánh giá', color: 'purple' },
  winner: { label: 'Trúng thầu', color: 'green' },
  rejected: { label: 'Không trúng', color: 'red' },
};

// Supplier Status
export const SUPPLIER_STATUSES = {
  pending_approval: { label: 'Chờ duyệt', color: 'yellow' },
  approved: { label: 'Đã duyệt', color: 'green' },
  rejected: { label: 'Từ chối', color: 'red' },
  suspended: { label: 'Tạm ngưng', color: 'orange' },
};

// Guarantee Types
export const GUARANTEE_TYPES = {
  performance: { label: 'Bảo lãnh thực hiện', description: 'Bảo đảm thực hiện hợp đồng' },
  advance: { label: 'Bảo lãnh tạm ứng', description: 'Bảo đảm khoản tạm ứng' },
  warranty: { label: 'Bảo hành', description: 'Bảo hành sản phẩm/dịch vụ' },
};

// Approval Actions
export const APPROVAL_ACTIONS = {
  approved: { label: 'Đã phê duyệt', color: 'green', icon: '✓' },
  rejected: { label: 'Từ chối', color: 'red', icon: '✗' },
  pending: { label: 'Chờ xử lý', color: 'yellow', icon: '⏳' },
};

// Vietnamese Months for Charts
export const MONTHS_VN = [
  'T1', 'T2', 'T3', 'T4', 'T5', 'T6',
  'T7', 'T8', 'T9', 'T10', 'T11', 'T12'
];

// Complaint Resolutions
export const COMPLAINT_RESOLUTIONS = {
  accepted: { label: 'Chấp nhận', color: 'red', warning: 'Chấp nhận khiếu nại sẽ TỰ ĐỘNG HUỶ gói thầu' },
  rejected: { label: 'Bác bỏ', color: 'green', warning: null },
  partial: { label: 'Chấp nhận một phần', color: 'yellow', warning: 'Gói thầu sẽ được xem xét lại' },
};

// Council Validation Messages
export const COUNCIL_VALIDATION = {
  independence_warning: 'Hội đồng thẩm định phải độc lập với hội đồng chuyên môn (NĐ9)',
  duplicate_error: 'Thành viên này đã có trong hội đồng chuyên môn',
};

// Standstill Period (days)
export const STANDSTILL_PERIOD_DAYS = 30;

// File Upload Limits
export const FILE_UPLOAD = {
  maxSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.zip', '.rar'],
};

// Pagination
export const PAGINATION = {
  defaultPageSize: 10,
  pageSizeOptions: [10, 20, 50, 100],
};

// Date Format
export const DATE_FORMAT = {
  display: 'dd/MM/yyyy',
  displayTime: 'dd/MM/yyyy HH:mm',
  api: 'yyyy-MM-dd',
};

// Currency
export const CURRENCY = {
  code: 'VND',
  symbol: '₫',
  locale: 'vi-VN',
};

// Staff Navigation Menu
export const STAFF_MENU = [
  { label: 'Dashboard', path: '/staff', icon: 'Home' },
  {
    label: 'Ngân sách',
    icon: 'Wallet',
    children: [
      { label: 'Ngân sách năm', path: '/staff/budget' },
      { label: 'Kế hoạch mua sắm', path: '/staff/budget/procurement-plan' },
    ],
  },
  {
    label: 'Đấu thầu',
    icon: 'Gavel',
    children: [
      { label: 'Đấu thầu chính thức', path: '/staff/bidding' },
      { label: 'Đấu thầu đơn giản', path: '/staff/bidding/simple' },
    ],
  },
  { label: 'Hợp đồng', path: '/staff/contracts', icon: 'FileText' },
  {
    label: 'Kho',
    icon: 'Package',
    children: [
      { label: 'Đơn hàng (PO)', path: '/staff/warehouse/po' },
      { label: 'Phiếu nhập kho', path: '/staff/warehouse/receipt' },
    ],
  },
  {
    label: 'Tờ trình (PAW)',
    icon: 'FileCheck',
    children: [
      { label: 'Danh sách tờ trình', path: '/staff/paw' },
      { label: 'Tạo mẫu tờ trình', path: '/staff/paw/builder' },
    ],
  },
  {
    label: 'Quản trị',
    icon: 'Settings',
    children: [
      { label: 'Người dùng', path: '/staff/admin/users' },
      { label: 'Phòng ban', path: '/staff/admin/departments' },
      { label: 'Danh mục thiết bị', path: '/staff/admin/catalog' },
      { label: 'Nhà cung cấp', path: '/staff/admin/suppliers' },
    ],
  },
];

// Supplier Navigation Menu
export const SUPPLIER_MENU = [
  { label: 'Dashboard', path: '/supplier', icon: 'Home' },
  { label: 'Gói thầu mở', path: '/supplier/tenders', icon: 'Search' },
  { label: 'Hồ sơ đã nộp', path: '/supplier/my-bids', icon: 'FileText' },
  { label: 'Hợp đồng', path: '/supplier/my-contracts', icon: 'FileCheck' },
  { label: 'Hồ sơ công ty', path: '/supplier/profile', icon: 'Building' },
];
