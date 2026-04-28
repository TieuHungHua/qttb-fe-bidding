import type {
  User,
  Department,
  YearBudget,
  ProcurementPlan,
  BiddingProject,
  Supplier,
  Contract,
  PurchaseOrder,
  BiddingState,
} from './types';

// Helper function to generate ID
const generateId = () => Math.random().toString(36).substring(2, 11);

// Helper function to generate date string
const dateOffset = (daysOffset: number) => {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  return date.toISOString();
};

// Mock Departments
export const mockDepartments: Department[] = [
  {
    id: 'dept-1',
    name: 'Phòng Công nghệ thông tin',
    code: 'CNTT',
    budgetLimit: 5000000000,
    managerId: 'user-2',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'dept-2',
    name: 'Phòng Thiết bị',
    code: 'TB',
    budgetLimit: 8000000000,
    managerId: 'user-3',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'dept-3',
    name: 'Phòng Thí nghiệm',
    code: 'TN',
    budgetLimit: 6000000000,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'dept-4',
    name: 'Thư viện',
    code: 'TV',
    budgetLimit: 3000000000,
    createdAt: '2024-01-01T00:00:00Z',
  },
];

// Mock Users
export const mockUsers: User[] = [
  {
    id: 'user-1',
    name: 'Nguyễn Văn Admin',
    email: 'admin@school.edu.vn',
    role: 'admin',
    phone: '0901234567',
    avatarUrl: 'https://i.pravatar.cc/150?u=admin',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'user-2',
    name: 'Trần Thị Hương',
    email: 'huong.tt@school.edu.vn',
    role: 'equipment_manager',
    departmentId: 'dept-1',
    phone: '0902345678',
    avatarUrl: 'https://i.pravatar.cc/150?u=huong',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'user-3',
    name: 'Lê Văn Minh',
    email: 'minh.lv@school.edu.vn',
    role: 'accountant',
    departmentId: 'dept-2',
    phone: '0903456789',
    avatarUrl: 'https://i.pravatar.cc/150?u=minh',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'user-4',
    name: 'Phạm Thị Lan',
    email: 'lan.pt@school.edu.vn',
    role: 'council_expert',
    departmentId: 'dept-3',
    phone: '0904567890',
    avatarUrl: 'https://i.pravatar.cc/150?u=lan',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'user-5',
    name: 'Hoàng Văn Đức',
    email: 'duc.hv@school.edu.vn',
    role: 'council_evaluator',
    departmentId: 'dept-4',
    phone: '0905678901',
    avatarUrl: 'https://i.pravatar.cc/150?u=duc',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'user-6',
    name: 'PGS.TS Nguyễn Văn Trường',
    email: 'truong.nv@school.edu.vn',
    role: 'approver',
    phone: '0906789012',
    avatarUrl: 'https://i.pravatar.cc/150?u=truong',
    createdAt: '2024-01-01T00:00:00Z',
  },
  // Supplier users — emails must match the Supplier records below
  {
    id: 'user-sup-1',
    name: 'Nguyễn Thị Linh (TBGDVN)',
    email: 'contact@tbgdvn.com',
    role: 'supplier',
    phone: '0241234567',
    avatarUrl: 'https://i.pravatar.cc/150?u=sup1',
    createdAt: '2024-01-10T00:00:00Z',
  },
  {
    id: 'user-sup-2',
    name: 'Trần Văn Hải (Công Nghệ Số)',
    email: 'info@congngheso.vn',
    role: 'supplier',
    phone: '0242345678',
    avatarUrl: 'https://i.pravatar.cc/150?u=sup2',
    createdAt: '2024-01-20T00:00:00Z',
  },
  {
    id: 'user-sup-3',
    name: 'Lê Thị Mai (TB Phòng Thí Nghiệm)',
    email: 'sales@tbptn.com',
    role: 'supplier',
    phone: '0243456789',
    avatarUrl: 'https://i.pravatar.cc/150?u=sup3',
    createdAt: '2024-02-05T00:00:00Z',
  },
];

// Mock Suppliers
export const mockSuppliers: Supplier[] = [
  {
    id: 'sup-1',
    companyName: 'Công ty TNHH Thiết bị Giáo dục Việt Nam',
    taxCode: '0123456789',
    address: '123 Đường Láng, Đống Đa, Hà Nội',
    phone: '0241234567',
    email: 'contact@tbgdvn.com',
    username: 'tbgdvn',
    description: 'Chuyên cung cấp máy tính, thiết bị mạng, phần mềm giáo dục cho các trường học và tổ chức giáo dục trên toàn quốc.',
    status: 'approved',
    approvedCategories: ['Máy tính & Thiết bị CNTT', 'Thiết bị mạng', 'Phần mềm giáo dục'],
    approvedBy: 'user-1',
    approvedAt: '2024-01-15T00:00:00Z',
    createdAt: '2024-01-10T00:00:00Z',
  },
  {
    id: 'sup-2',
    companyName: 'Công ty Cổ phần Công nghệ Số',
    taxCode: '0234567890',
    address: '456 Phố Huế, Hai Bà Trưng, Hà Nội',
    phone: '0242345678',
    email: 'info@congngheso.vn',
    username: 'congngheso',
    description: 'Chuyên cung cấp máy chiếu, bảng tương tác, camera an ninh và các thiết bị điện tử hiện đại.',
    status: 'approved',
    approvedCategories: ['Máy chiếu & Màn hình', 'Bảng tương tác', 'Camera & An ninh'],
    approvedBy: 'user-1',
    approvedAt: '2024-02-01T00:00:00Z',
    createdAt: '2024-01-20T00:00:00Z',
  },
  {
    id: 'sup-3',
    companyName: 'Công ty TNHH Thiết bị Phòng thí nghiệm',
    taxCode: '0345678901',
    address: '789 Giải Phóng, Hoàng Mai, Hà Nội',
    phone: '0243456789',
    email: 'sales@tbptn.com',
    username: 'tbptn',
    description: 'Chuyên nhập khẩu và phân phối thiết bị phòng thí nghiệm, hóa chất và dụng cụ khoa học chất lượng cao.',
    status: 'approved',
    approvedCategories: ['Thiết bị thí nghiệm', 'Hóa chất & Dụng cụ', 'Kính hiển vi & Quang học'],
    approvedBy: 'user-1',
    approvedAt: '2024-02-10T00:00:00Z',
    createdAt: '2024-02-05T00:00:00Z',
  },
  {
    id: 'sup-4',
    companyName: 'Công ty CP Sách và Thiết bị Giáo dục',
    taxCode: '0456789012',
    address: '321 Trường Chinh, Thanh Xuân, Hà Nội',
    phone: '0244567890',
    email: 'contact@sachhvaothietbi.vn',
    username: 'sachhvaothietbi',
    status: 'pending_approval',
    approvedCategories: [],
    createdAt: '2024-04-15T00:00:00Z',
  },
];

// Mock Year Budget
export const mockYearBudget: YearBudget = {
  id: 'budget-2026',
  year: 2026,
  totalAmount: 22000000000, // 22 tỷ VNĐ
  allocatedAmount: 22000000000,
  remainingAmount: 8000000000,
  status: 'approved',
  departmentBudgets: [
    {
      id: 'db-1',
      departmentId: 'dept-1',
      allocatedAmount: 5000000000,
      usedAmount: 2000000000,
      remainingAmount: 3000000000,
      percentage: 22.7,
    },
    {
      id: 'db-2',
      departmentId: 'dept-2',
      allocatedAmount: 8000000000,
      usedAmount: 5000000000,
      remainingAmount: 3000000000,
      percentage: 36.4,
    },
    {
      id: 'db-3',
      departmentId: 'dept-3',
      allocatedAmount: 6000000000,
      usedAmount: 5000000000,
      remainingAmount: 1000000000,
      percentage: 27.3,
    },
    {
      id: 'db-4',
      departmentId: 'dept-4',
      allocatedAmount: 3000000000,
      usedAmount: 2000000000,
      remainingAmount: 1000000000,
      percentage: 13.6,
    },
  ],
  createdBy: 'user-3',
  approvedBy: 'user-6',
  createdAt: '2025-11-01T00:00:00Z',
  approvedAt: '2025-12-15T00:00:00Z',
};

// Mock Procurement Plans
export const mockProcurementPlans: ProcurementPlan[] = [
  {
    id: 'pp-1',
    code: 'KHMS-2026-001',
    name: 'Kế hoạch mua sắm thiết bị CNTT năm 2026',
    departmentId: 'dept-1',
    budgetYear: 2026,
    items: [
      {
        id: 'ppi-1',
        productId: 'prod-1',
        productName: 'Máy tính để bàn Dell OptiPlex 7090',
        quantity: 50,
        unitPrice: 20000000,
        totalPrice: 1000000000,
        unit: 'bộ',
      },
      {
        id: 'ppi-2',
        productId: 'prod-2',
        productName: 'Màn hình Dell 24 inch',
        quantity: 50,
        unitPrice: 5000000,
        totalPrice: 250000000,
        unit: 'cái',
      },
      {
        id: 'ppi-3',
        productId: 'prod-3',
        productName: 'Phần mềm Microsoft Office 365',
        quantity: 100,
        unitPrice: 2000000,
        totalPrice: 200000000,
        unit: 'license',
      },
    ],
    totalEstimated: 1450000000,
    status: 'approved',
    createdBy: 'user-2',
    approvedBy: 'user-6',
    createdAt: '2026-01-10T00:00:00Z',
    approvedAt: '2026-01-20T00:00:00Z',
    note: 'Ưu tiên trang bị cho phòng máy mới',
  },
  {
    id: 'pp-2',
    code: 'KHMS-2026-002',
    name: 'Kế hoạch mua sắm thiết bị thí nghiệm',
    departmentId: 'dept-3',
    budgetYear: 2026,
    items: [
      {
        id: 'ppi-4',
        productId: 'prod-4',
        productName: 'Kính hiển vi điện tử',
        quantity: 5,
        unitPrice: 300000000,
        totalPrice: 1500000000,
        unit: 'bộ',
      },
      {
        id: 'ppi-5',
        productId: 'prod-5',
        productName: 'Bộ thí nghiệm hóa học',
        quantity: 20,
        unitPrice: 50000000,
        totalPrice: 1000000000,
        unit: 'bộ',
      },
    ],
    totalEstimated: 2500000000,
    status: 'pending',
    createdBy: 'user-4',
    createdAt: '2026-02-01T00:00:00Z',
  },
];

// Mock Bidding Projects (representing different states)
export const mockBiddingProjects: BiddingProject[] = [
  {
    id: 'bid-1',
    code: 'GT-2026-001',
    name: 'Gói thầu mua sắm máy tính và thiết bị ngoại vi',
    description: 'Mua sắm 50 bộ máy tính Dell OptiPlex 7090 và các thiết bị ngoại vi',
    budgetSourceId: 'budget-2026',
    estimatedValue: 1500000000,
    method: 'open',
    currentState: 'standstill',
    stateHistory: [
      { state: 'draft', changedBy: 'user-2', changedAt: '2026-01-25T00:00:00Z' },
      { state: 'pending_approval', changedBy: 'user-2', changedAt: '2026-01-26T00:00:00Z' },
      { state: 'approved_hsmt', changedBy: 'user-6', changedAt: '2026-01-28T00:00:00Z' },
      { state: 'published', changedBy: 'user-2', changedAt: '2026-02-01T00:00:00Z' },
      { state: 'bidding_open', changedBy: 'user-2', changedAt: '2026-02-01T00:00:00Z' },
      { state: 'bidding_closed', changedBy: 'user-2', changedAt: '2026-02-15T00:00:00Z' },
      { state: 'evaluation', changedBy: 'user-5', changedAt: '2026-02-16T00:00:00Z' },
      { state: 'evaluation_complete', changedBy: 'user-5', changedAt: '2026-02-20T00:00:00Z' },
      { state: 'evaluation_approved', changedBy: 'user-6', changedAt: '2026-02-22T00:00:00Z' },
      { state: 'standstill', changedBy: 'user-2', changedAt: '2026-02-23T00:00:00Z' },
    ],
    hsmt: {
      documents: [
        {
          id: 'doc-1',
          name: 'HSMT_GT-2026-001.pdf',
          url: '/documents/hsmt-001.pdf',
          size: 2048576,
          uploadedBy: 'user-2',
          uploadedAt: '2026-01-27T00:00:00Z',
        },
      ],
      approvedBy: 'user-6',
      approvedAt: '2026-01-28T00:00:00Z',
    },
    expertCouncil: [
      { id: 'ec-1', userId: 'user-4', role: 'chairman', assignedAt: '2026-01-28T00:00:00Z' },
      { id: 'ec-2', userId: 'user-2', role: 'member', assignedAt: '2026-01-28T00:00:00Z' },
    ],
    evaluationCouncil: [
      { id: 'ev-1', userId: 'user-5', role: 'chairman', assignedAt: '2026-02-16T00:00:00Z' },
      { id: 'ev-2', userId: 'user-3', role: 'member', assignedAt: '2026-02-16T00:00:00Z' },
    ],
    publishedDate: '2026-02-01T00:00:00Z',
    deadlineDate: '2026-02-15T00:00:00Z',
    openingDate: '2026-02-15T14:00:00Z',
    standstillStartDate: '2026-02-23T00:00:00Z',
    standstillEndDate: '2026-03-25T00:00:00Z',
    bids: [
      {
        id: 'b-1',
        biddingProjectId: 'bid-1',
        supplierId: 'sup-1',
        submittedAt: '2026-02-14T10:00:00Z',
        bidAmount: 1380000000,
        technicalProposal: [
          {
            id: 'doc-2',
            name: 'DeThiKyThuat_TBGDVN.pdf',
            url: '/bids/tech-1.pdf',
            size: 1024576,
            uploadedBy: 'sup-1',
            uploadedAt: '2026-02-14T10:00:00Z',
          },
        ],
        financialProposal: [
          {
            id: 'doc-3',
            name: 'DeXuatGia_TBGDVN.pdf',
            url: '/bids/price-1.pdf',
            size: 512000,
            uploadedBy: 'sup-1',
            uploadedAt: '2026-02-14T10:00:00Z',
          },
        ],
        technicalScore: 95,
        priceScore: 88,
        totalScore: 91.5,
        evaluatedBy: 'user-5',
        evaluatedAt: '2026-02-20T00:00:00Z',
        status: 'winner',
      },
      {
        id: 'b-2',
        biddingProjectId: 'bid-1',
        supplierId: 'sup-2',
        submittedAt: '2026-02-14T15:00:00Z',
        bidAmount: 1420000000,
        technicalProposal: [],
        financialProposal: [],
        technicalScore: 85,
        priceScore: 92,
        totalScore: 88.5,
        evaluatedBy: 'user-5',
        evaluatedAt: '2026-02-20T00:00:00Z',
        status: 'evaluated',
      },
    ],
    complaints: [
      {
        id: 'complaint-1',
        biddingProjectId: 'bid-1',
        supplierId: 'sup-2',
        content:
          'Chúng tôi phát hiện kết quả đánh giá kỹ thuật có sai sót nghiêm trọng. Điểm giải pháp kỹ thuật bị chấm thấp hơn thực tế mà không có giải thích hợp lý. Đề nghị hội đồng xem xét lại toàn bộ quá trình đánh giá và cung cấp biên bản đánh giá chi tiết theo quy định của Luật Đấu thầu 2023.',
        documents: [
          {
            id: 'comp-doc-1',
            name: 'Don_khieu_nai_CNTS.pdf',
            url: '/complaints/complaint-1.pdf',
            size: 512000,
            uploadedBy: 'sup-2',
            uploadedAt: '2026-02-25T09:00:00Z',
          },
        ],
        submittedAt: '2026-02-25T09:00:00Z',
      },
    ],
    winnerId: 'sup-1',
    createdBy: 'user-2',
    createdAt: '2026-01-25T00:00:00Z',
    updatedAt: '2026-02-23T00:00:00Z',
  },
  {
    id: 'bid-2',
    code: 'GT-2026-002',
    name: 'Gói thầu mua sắm thiết bị thí nghiệm hóa học',
    description: 'Mua sắm 20 bộ thiết bị thí nghiệm hóa học cho phòng lab',
    budgetSourceId: 'budget-2026',
    estimatedValue: 1000000000,
    method: 'open',
    currentState: 'bidding_open',
    stateHistory: [
      { state: 'draft', changedBy: 'user-4', changedAt: '2026-03-01T00:00:00Z' },
      { state: 'pending_approval', changedBy: 'user-4', changedAt: '2026-03-02T00:00:00Z' },
      { state: 'approved_hsmt', changedBy: 'user-6', changedAt: '2026-03-05T00:00:00Z' },
      { state: 'published', changedBy: 'user-4', changedAt: '2026-03-10T00:00:00Z' },
      { state: 'bidding_open', changedBy: 'user-4', changedAt: '2026-03-10T00:00:00Z' },
    ],
    hsmt: {
      documents: [
        {
          id: 'doc-4',
          name: 'HSMT_GT-2026-002.pdf',
          url: '/documents/hsmt-002.pdf',
          size: 3145728,
          uploadedBy: 'user-4',
          uploadedAt: '2026-03-04T00:00:00Z',
        },
      ],
      approvedBy: 'user-6',
      approvedAt: '2026-03-05T00:00:00Z',
    },
    expertCouncil: [
      { id: 'ec-3', userId: 'user-2', role: 'chairman', assignedAt: '2026-03-05T00:00:00Z' },
      { id: 'ec-4', userId: 'user-4', role: 'member', assignedAt: '2026-03-05T00:00:00Z' },
    ],
    evaluationCouncil: [],
    publishedDate: '2026-03-10T00:00:00Z',
    deadlineDate: '2026-04-30T00:00:00Z',
    bids: [
      {
        id: 'b-3',
        biddingProjectId: 'bid-2',
        supplierId: 'sup-3',
        submittedAt: '2026-04-20T00:00:00Z',
        bidAmount: 950000000,
        technicalProposal: [],
        financialProposal: [],
        status: 'submitted',
      },
    ],
    complaints: [],
    createdBy: 'user-4',
    createdAt: '2026-03-01T00:00:00Z',
    updatedAt: '2026-04-20T00:00:00Z',
  },
  {
    id: 'bid-3',
    code: 'GT-2026-003',
    name: 'Gói thầu mua sắm sách và tài liệu tham khảo',
    description: 'Mua sắm sách và tài liệu tham khảo cho thư viện',
    budgetSourceId: 'budget-2026',
    estimatedValue: 500000000,
    method: 'shopping',
    currentState: 'draft',
    stateHistory: [
      { state: 'draft', changedBy: 'user-2', changedAt: dateOffset(-5) },
    ],
    hsmt: undefined,
    expertCouncil: [],
    evaluationCouncil: [],
    bids: [],
    complaints: [],
    createdBy: 'user-2',
    createdAt: dateOffset(-5),
    updatedAt: dateOffset(-5),
  },
];

// Mock Contracts
export const mockContracts: Contract[] = [
  {
    id: 'contract-1',
    code: 'HD-2026-001',
    biddingProjectId: 'bid-1',
    supplierId: 'sup-1',
    value: 1450000000,
    signedDate: '2026-03-26T00:00:00Z',
    effectiveDate: '2026-03-26T00:00:00Z',
    expiryDate: '2026-09-26T00:00:00Z',
    status: 'executing',
    paymentSchedule: [
      {
        id: 'ps-1',
        phase: 'Tạm ứng',
        amount: 435000000,
        percentage: 30,
        dueDate: '2026-04-10T00:00:00Z',
        status: 'paid',
        paidDate: '2026-04-08T00:00:00Z',
      },
      {
        id: 'ps-2',
        phase: 'Thanh toán lần 2',
        amount: 580000000,
        percentage: 40,
        dueDate: '2026-06-30T00:00:00Z',
        status: 'pending',
      },
      {
        id: 'ps-3',
        phase: 'Thanh toán cuối',
        amount: 435000000,
        percentage: 30,
        dueDate: '2026-09-26T00:00:00Z',
        status: 'pending',
      },
    ],
    guarantees: [
      {
        id: 'g-1',
        type: 'performance',
        value: 145000000,
        percentage: 10,
        startDate: '2026-03-26T00:00:00Z',
        endDate: '2026-12-26T00:00:00Z',
        status: 'active',
        documents: [],
      },
      {
        id: 'g-2',
        type: 'advance',
        value: 435000000,
        percentage: 100,
        startDate: '2026-04-08T00:00:00Z',
        endDate: '2026-09-26T00:00:00Z',
        status: 'active',
        documents: [],
      },
    ],
    purchaseOrders: ['po-1'],
    documents: [],
    createdBy: 'user-2',
    createdAt: '2026-03-26T00:00:00Z',
    updatedAt: '2026-04-08T00:00:00Z',
  },
];

// Mock Purchase Orders
export const mockPurchaseOrders: PurchaseOrder[] = [
  {
    id: 'po-1',
    code: 'PO-2026-001',
    contractId: 'contract-1',
    supplierId: 'sup-1',
    items: [
      {
        id: 'poi-1',
        productId: 'prod-1',
        productName: 'Máy tính để bàn Dell OptiPlex 7090',
        quantity: 50,
        receivedQuantity: 30,
        unitPrice: 20000000,
        totalPrice: 1000000000,
        unit: 'bộ',
      },
      {
        id: 'poi-2',
        productId: 'prod-2',
        productName: 'Màn hình Dell 24 inch',
        quantity: 50,
        receivedQuantity: 30,
        unitPrice: 5000000,
        totalPrice: 250000000,
        unit: 'cái',
      },
      {
        id: 'poi-3',
        productId: 'prod-3',
        productName: 'Phần mềm Microsoft Office 365',
        quantity: 100,
        receivedQuantity: 0,
        unitPrice: 2000000,
        totalPrice: 200000000,
        unit: 'license',
      },
    ],
    totalValue: 1450000000,
    orderedDate: '2026-04-01T00:00:00Z',
    expectedDeliveryDate: '2026-06-30T00:00:00Z',
    status: 'partial',
    createdBy: 'user-2',
    approvedBy: 'user-3',
    createdAt: '2026-04-01T00:00:00Z',
    approvedAt: '2026-04-02T00:00:00Z',
  },
];

// Generate chart data for dashboard
export const generateMonthlyContractData = () => {
  const months = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
  return months.map((month, index) => ({
    id: `month-${index}`,
    month,
    value: Math.floor(Math.random() * 3000000000) + 500000000,
  }));
};

export const generateBudgetPieData = () => {
  return mockDepartments.map(dept => {
    const deptBudget = mockYearBudget.departmentBudgets.find(db => db.departmentId === dept.id);
    return {
      id: dept.id,
      name: dept.name,
      value: deptBudget?.allocatedAmount || 0,
    };
  });
};

// Initial data seeding function
export const getInitialData = () => ({
  users: mockUsers,
  departments: mockDepartments,
  suppliers: mockSuppliers,
  yearBudget: mockYearBudget,
  procurementPlans: mockProcurementPlans,
  biddingProjects: mockBiddingProjects,
  contracts: mockContracts,
  purchaseOrders: mockPurchaseOrders,
  formTemplates: [],
  approvalDocuments: [],
});