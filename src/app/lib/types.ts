// Core User & Authentication Types
export type UserRole =
  | 'admin'
  | 'equipment_manager'
  | 'accountant'
  | 'council_expert'
  | 'council_evaluator'
  | 'approver'
  | 'supplier';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  departmentId?: string;
  avatarUrl?: string;
  phone?: string;
  createdAt: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  budgetLimit: number;
  parentId?: string;
  managerId?: string;
  createdAt: string;
}

// Budget Types
export type BudgetStatus = 'draft' | 'pending' | 'approved' | 'rejected';

export interface YearBudget {
  id: string;
  year: number;
  totalAmount: number;
  allocatedAmount: number;
  remainingAmount: number;
  status: BudgetStatus;
  departmentBudgets: DepartmentBudget[];
  createdBy: string;
  approvedBy?: string;
  createdAt: string;
  approvedAt?: string;
}

export interface DepartmentBudget {
  id: string;
  departmentId: string;
  allocatedAmount: number;
  usedAmount: number;
  remainingAmount: number;
  percentage: number;
  note?: string;
}

export interface ProcurementPlan {
  id: string;
  code: string;
  name: string;
  departmentId: string;
  budgetYear: number;
  items: ProcurementPlanItem[];
  totalEstimated: number;
  status: BudgetStatus;
  createdBy: string;
  approvedBy?: string;
  createdAt: string;
  approvedAt?: string;
  note?: string;
}

export interface ProcurementPlanItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  unit: string;
  note?: string;
}

// Bidding Types (16 states per Luật 2023)
export type BiddingState =
  | 'draft'                    // 1. Khởi tạo
  | 'pending_approval'         // 2. Chờ phê duyệt
  | 'approved_hsmt'            // 3. HSMT đã duyệt
  | 'published'                // 4. Đã công bố
  | 'bidding_open'             // 5. Đang mở thầu
  | 'bidding_closed'           // 6. Đã đóng thầu
  | 'evaluation'               // 7. Đang đánh giá
  | 'evaluation_complete'      // 8. Đánh giá hoàn tất
  | 'evaluation_approved'      // 9. Kết quả đã duyệt
  | 'standstill'               // 10. Chờ phản đối (30 ngày)
  | 'complaint_period'         // 11. Có khiếu nại
  | 'complaint_resolved'       // 12. Khiếu nại đã giải quyết
  | 'winner_announced'         // 13. Đã công bố trúng thầu
  | 'contract_pending'         // 14. Chờ ký hợp đồng
  | 'contract_signed'          // 15. Đã ký hợp đồng
  | 'cancelled';               // 16. Đã hủy

export type BiddingMethod = 'open' | 'limited' | 'direct' | 'shopping';

export interface BiddingProject {
  id: string;
  code: string;
  name: string;
  description: string;
  budgetSourceId: string;
  estimatedValue: number;
  method: BiddingMethod;
  currentState: BiddingState;
  stateHistory: StateHistory[];

  // HSMT - Hồ sơ mời thầu
  hsmt?: {
    documents: Document[];
    approvedBy?: string;
    approvedAt?: string;
  };

  // Councils
  expertCouncil: CouncilMember[];
  evaluationCouncil: CouncilMember[];

  // Timeline
  publishedDate?: string;
  deadlineDate?: string;
  openingDate?: string;
  standstillStartDate?: string;
  standstillEndDate?: string;

  // Bids & Results
  bids: Bid[];
  complaints: Complaint[];
  winnerId?: string;

  // Metadata
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface StateHistory {
  state: BiddingState;
  changedBy: string;
  changedAt: string;
  note?: string;
}

export interface CouncilMember {
  id: string;
  userId: string;
  role: 'chairman' | 'member' | 'secretary';
  assignedAt: string;
}

export interface Document {
  id: string;
  name: string;
  url: string;
  size: number;
  uploadedBy: string;
  uploadedAt: string;
}

export interface Bid {
  id: string;
  biddingProjectId: string;
  supplierId: string;
  submittedAt: string;

  // Bid price
  bidAmount: number;

  // Documents
  technicalProposal: Document[];
  financialProposal: Document[];

  // Evaluation scores
  technicalScore?: number;
  priceScore?: number;
  totalScore?: number;

  // Evaluation details
  evaluatedBy?: string;
  evaluatedAt?: string;
  evaluationNote?: string;

  status: 'submitted' | 'evaluated' | 'winner' | 'rejected';
}

export interface Complaint {
  id: string;
  biddingProjectId: string;
  supplierId: string;
  content: string;
  documents: Document[];
  submittedAt: string;

  resolution?: 'accepted' | 'rejected' | 'partial';
  resolutionNote?: string;
  resolvedBy?: string;
  resolvedAt?: string;
}

// Supplier Types
export interface Supplier {
  id: string;
  companyName: string;
  taxCode: string;
  address: string;
  phone: string;
  email: string;
  description?: string;

  // Account info
  username: string;

  // Approval
  status: 'pending_approval' | 'approved' | 'rejected' | 'suspended';
  approvedCategories: string[];
  approvedBy?: string;
  approvedAt?: string;

  createdAt: string;
}

// Contract Types
export type ContractStatus = 'draft' | 'signed' | 'executing' | 'completed' | 'terminated';

export interface Contract {
  id: string;
  code: string;
  biddingProjectId: string;
  supplierId: string;
  value: number;
  signedDate?: string;
  effectiveDate?: string;
  expiryDate?: string;
  status: ContractStatus;

  paymentSchedule: PaymentSchedule[];
  guarantees: Guarantee[];
  purchaseOrders: string[]; // PO IDs

  documents: Document[];

  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export type PaymentStatus = 'pending' | 'paid' | 'overdue';

export interface PaymentSchedule {
  id: string;
  phase: string;
  amount: number;
  percentage: number;
  dueDate: string;
  status: PaymentStatus;
  paidDate?: string;
  note?: string;
}

export type GuaranteeType = 'performance' | 'advance' | 'warranty';
export type GuaranteeStatus = 'active' | 'expired' | 'returned';

export interface Guarantee {
  id: string;
  type: GuaranteeType;
  value: number;
  percentage: number;
  startDate: string;
  endDate: string;
  status: GuaranteeStatus;
  documents: Document[];
  note?: string;
}

// Purchase Order & Warehouse Types
export type POStatus = 'draft' | 'approved' | 'partial' | 'completed' | 'cancelled';

export interface PurchaseOrder {
  id: string;
  code: string;
  contractId: string;
  supplierId: string;
  items: POItem[];
  totalValue: number;
  orderedDate: string;
  expectedDeliveryDate: string;
  status: POStatus;

  createdBy: string;
  approvedBy?: string;
  createdAt: string;
  approvedAt?: string;
}

export interface POItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  receivedQuantity: number;
  unitPrice: number;
  totalPrice: number;
  unit: string;
  note?: string;
}

export type QualityStatus = 'good' | 'defective' | 'missing';

export interface WarehouseReceipt {
  id: string;
  code: string;
  poId: string;
  items: WarehouseReceiptItem[];
  receivedDate: string;
  inspector: string;
  note?: string;

  createdBy: string;
  createdAt: string;
}

export interface WarehouseReceiptItem {
  id: string;
  poItemId: string;
  productName: string;
  receivedQuantity: number;
  qualityStatus: QualityStatus;
  note?: string;
}

// Equipment Catalog Types
export interface EquipmentCategory {
  id: string;
  name: string;
  code: string;
  level: 1 | 2 | 3;
  parentId?: string;
  description?: string;
}

export interface Product {
  id: string;
  name: string;
  code: string;
  categoryId: string;
  unit: string;
  specifications: Record<string, any>; // JSON TSKT
  estimatedPrice?: number;
  description?: string;
  imageUrl?: string;
}

// PAW (Form Builder) Types
export type FieldType = 'text' | 'number' | 'date' | 'select' | 'textarea' | 'file' | 'checkbox';

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[]; // For select type
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
  order: number;
}

export interface FormTemplate {
  id: string;
  name: string;
  description?: string;
  fields: FormField[];
  approvalSteps: ApprovalStep[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApprovalStep {
  id: string;
  order: number;
  roleName: string;
  roleIds: UserRole[];
  required: boolean;
}

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface ApprovalDocument {
  id: string;
  code: string;
  templateId: string;
  title: string;
  content: Record<string, any>; // Form field values
  currentStep: number;
  approvalHistory: ApprovalHistoryItem[];
  status: ApprovalStatus;

  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApprovalHistoryItem {
  step: number;
  userId: string;
  action: 'approved' | 'rejected' | 'pending';
  comment?: string;
  timestamp: string;
}

// Dashboard KPI Types
export interface KPIData {
  label: string;
  value: number;
  delta?: number;
  deltaType?: 'increase' | 'decrease';
  icon?: string;
}

// Chart Data Types
export interface MonthlyChartData {
  month: string;
  value: number;
}

export interface PieChartData {
  name: string;
  value: number;
  color?: string;
}