import { RouterProvider, createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Toaster } from './components/ui/sonner';

// Layouts
import { AuthLayout } from './layouts/AuthLayout';
import { StaffLayout } from './layouts/StaffLayout';
import { SupplierLayout } from './layouts/SupplierLayout';

// Auth Pages
import { Login } from './pages/auth/Login';
import { SupplierRegister } from './pages/auth/SupplierRegister';

// Staff Pages
import { StaffDashboard } from './pages/staff/Dashboard';
import { BudgetList } from './pages/staff/budget/BudgetList';
import { BudgetDetail } from './pages/staff/budget/BudgetDetail';
import { ProcurementPlanList } from './pages/staff/budget/ProcurementPlanList';
import { ProcurementPlanDetail } from './pages/staff/budget/ProcurementPlanDetail';
import { BiddingList } from './pages/staff/bidding/BiddingList';
import { BiddingDetail } from './pages/staff/bidding/BiddingDetail';
import { SimpleBiddingList } from './pages/staff/bidding/SimpleBiddingList';
import { SimpleBiddingDetail } from './pages/staff/bidding/SimpleBiddingDetail';
import { PAWList } from './pages/staff/paw/PAWList';
import { PAWBuilder } from './pages/staff/paw/PAWBuilder';
import { ContractList } from './pages/staff/contracts/ContractList';
import { ContractDetail } from './pages/staff/contracts/ContractDetail';
import { POList } from './pages/staff/warehouse/POList';
import { PODetail } from './pages/staff/warehouse/PODetail';
import { WarehouseReceiptList } from './pages/staff/warehouse/WarehouseReceiptList';
import { WarehouseReceiptDetail } from './pages/staff/warehouse/WarehouseReceiptDetail';
import { DepartmentList } from './pages/staff/admin/DepartmentList';
import { SupplierList } from './pages/staff/admin/SupplierList';
import { SupplierDetail } from './pages/staff/admin/SupplierDetail';
import { SupplierAccountList } from './pages/staff/admin/SupplierAccountList';
import { CatalogManagement } from './pages/staff/admin/CatalogManagement';

// Supplier Pages
import { SupplierDashboard } from './pages/supplier/Dashboard';
import { TenderList } from './pages/supplier/TenderList';
import { TenderDetail } from './pages/supplier/TenderDetail';
import { MyBids } from './pages/supplier/MyBids';
import { MyContracts } from './pages/supplier/MyContracts';
import { Profile } from './pages/supplier/Profile';

// ─── Protected Route ────────────────────────────────────────────────────────
function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles?: string[];
}) {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center" style={{ backgroundColor: '#F8FAFC' }}>
        <div
          className="animate-spin h-8 w-8 rounded-full"
          style={{ border: '3px solid #DBEAFE', borderTopColor: '#1D4ED8' }}
        />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === 'supplier' ? '/supplier' : '/staff'} replace />;
  }

  return <>{children}</>;
}

// ─── Public Route ────────────────────────────────────────────────────────────
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center" style={{ backgroundColor: '#F8FAFC' }}>
        <div
          className="animate-spin h-8 w-8 rounded-full"
          style={{ border: '3px solid #DBEAFE', borderTopColor: '#1D4ED8' }}
        />
      </div>
    );
  }

  if (isAuthenticated && user) {
    return <Navigate to={user.role === 'supplier' ? '/supplier' : '/staff'} replace />;
  }

  return <>{children}</>;
}

// ─── Coming Soon placeholder ─────────────────────────────────────────────────
function ComingSoon({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          backgroundColor: '#F1F5F9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span style={{ fontSize: '28px' }}>🚧</span>
      </div>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: '18px', fontWeight: 600, color: '#1E293B' }}>{title}</p>
        <p style={{ fontSize: '14px', color: '#64748B', marginTop: '4px' }}>
          Tính năng đang được phát triển
        </p>
      </div>
    </div>
  );
}

// ─── Root layout — provides AuthContext to all routes ─────────────────────────
function Root() {
  return (
    <AuthProvider>
      <Outlet />
      <Toaster />
    </AuthProvider>
  );
}

// ─── Router ──────────────────────────────────────────────────────────────────
const STAFF_ROLES = [
  'admin',
  'equipment_manager',
  'accountant',
  'council_expert',
  'council_evaluator',
  'approver',
];

const router = createBrowserRouter([
  {
    path: '/',
    Component: Root,
    children: [
      // ── Default redirect ───────────────────────────────────────────────────
      { index: true, element: <Navigate to="/login" replace /> },

      // ── Auth routes ────────────────────────────────────────────────────────
      {
        Component: AuthLayout,
        children: [
          {
            path: 'login',
            element: (
              <PublicRoute>
                <Login />
              </PublicRoute>
            ),
          },
          {
            path: 'supplier-register',
            element: (
              <PublicRoute>
                <SupplierRegister />
              </PublicRoute>
            ),
          },
        ],
      },

      // ── Staff Portal routes ────────────────────────────────────────────────
      {
        path: 'staff',
        element: (
          <ProtectedRoute allowedRoles={STAFF_ROLES}>
            <StaffLayout />
          </ProtectedRoute>
        ),
        children: [
          { index: true, Component: StaffDashboard },

          // Budget
          { path: 'budget', Component: BudgetList },
          { path: 'budget/:id', Component: BudgetDetail },

          // Procurement Plan
          { path: 'procurement-plan', Component: ProcurementPlanList },
          { path: 'procurement-plan/:id', Component: ProcurementPlanDetail },

          // Bidding
          { path: 'bidding', Component: BiddingList },
          { path: 'bidding/simple', Component: SimpleBiddingList },
          { path: 'bidding/simple/:id', Component: SimpleBiddingDetail },
          { path: 'bidding/:id', Component: BiddingDetail },

          // Contracts
          { path: 'contracts', Component: ContractList },
          { path: 'contracts/:id', Component: ContractDetail },

          // Warehouse
          { path: 'warehouse/po', Component: POList },
          { path: 'warehouse/po/:id', Component: PODetail },
          { path: 'warehouse/receipt', Component: WarehouseReceiptList },
          { path: 'warehouse/receipt/:id', Component: WarehouseReceiptDetail },

          // PAW
          { path: 'paw', Component: PAWList },
          { path: 'paw/builder', Component: PAWBuilder },

          // Admin
          { path: 'admin/departments', Component: DepartmentList },
          { path: 'admin/catalog', Component: CatalogManagement },
          { path: 'admin/suppliers', Component: SupplierList },
          { path: 'admin/suppliers/:id', Component: SupplierDetail },
          { path: 'admin/supplier-accounts', Component: SupplierAccountList },
          { path: 'admin/users', element: <ComingSoon title="Quản lý người dùng" /> },
        ],
      },

      // ── Supplier Portal routes ─────────────────────────────────────────────
      {
        path: 'supplier',
        element: (
          <ProtectedRoute allowedRoles={['supplier']}>
            <SupplierLayout />
          </ProtectedRoute>
        ),
        children: [
          { index: true, Component: SupplierDashboard },
          { path: 'tenders', Component: TenderList },
          { path: 'tenders/:id', Component: TenderDetail },
          { path: 'my-bids', Component: MyBids },
          { path: 'my-contracts', Component: MyContracts },
          { path: 'contracts/:id', element: <ComingSoon title="Chi tiết hợp đồng NCC" /> },
          { path: 'profile', Component: Profile },
        ],
      },

      // ── Catch-all ──────────────────────────────────────────────────────────
      { path: '*', element: <Navigate to="/login" replace /> },
    ],
  },
]);

// ─── App entry point ─────────────────────────────────────────────────────────
export default function App() {
  return <RouterProvider router={router} />;
}
