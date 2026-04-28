import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, Ban, RotateCcw } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { StatusBadge } from '../../../components/shared/StatusBadge';
import { AlertBanner } from '../../../components/shared/AlertBanner';
import { ConfirmDialog } from '../../../components/shared/ConfirmDialog';
import { storage } from '../../../lib/storage';
import { formatDate } from '../../../lib/utils';
import { toast } from 'sonner';
import type { Supplier } from '../../../lib/types';

type ActionType = 'approve' | 'reject' | 'suspend' | 'unsuspend';

const EVALUATION_MOCK = {
  quality: 8.5,
  price: 7.8,
  delivery: 9.0,
  afterSale: 8.2,
};

const HISTORY_MOCK = [
  { id: 'e1', period: 'Q1/2026', total: 8.4, note: 'Giao hàng đúng hạn, chất lượng tốt', evaluatedBy: 'Trần Thị Hương', date: '2026-03-15' },
  { id: 'e2', period: 'Q4/2025', total: 8.1, note: 'Một lô hàng bị lỗi nhỏ, đã khắc phục', evaluatedBy: 'Lê Văn Minh', date: '2025-12-20' },
];

const CATEGORIES_MOCK = [
  { id: 'c1', name: 'Máy tính & Thiết bị ngoại vi', status: 'approved' },
  { id: 'c2', name: 'Phần mềm & Bản quyền', status: 'approved' },
  { id: 'c3', name: 'Thiết bị mạng', status: 'pending' },
];

const REGISTRATION_MOCK = [
  { id: 'r1', submittedAt: '2024-01-10', status: 'approved', approvedAt: '2024-01-15', note: 'Hồ sơ đầy đủ' },
];

export function SupplierDetail() {
  const { id } = useParams<{ id: string }>();
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'categories' | 'evaluation' | 'registrations'>('info');
  const [confirmAction, setConfirmAction] = useState<ActionType | null>(null);

  const load = () => {
    const s = storage.getSupplierById(id!);
    setSupplier(s ?? null);
  };

  useEffect(() => { load(); }, [id]);

  if (!supplier) return (
    <div className="flex items-center justify-center h-64">
      <p style={{ fontSize: '14px', color: '#64748B' }}>Không tìm thấy nhà cung cấp.</p>
    </div>
  );

  const isSuspended = supplier.status === 'suspended';
  const isApproved = supplier.status === 'approved';
  const isPending = supplier.status === 'pending_approval';

  const applyAction = (action: ActionType, reason?: string) => {
    const all = storage.getSuppliers();
    const idx = all.findIndex(s => s.id === supplier.id);
    if (idx === -1) return;
    const now = new Date().toISOString();
    const auth = storage.getAuth();

    if (action === 'approve') {
      all[idx] = { ...all[idx], status: 'approved', approvedBy: auth?.userId, approvedAt: now };
      toast.success('Đã phê duyệt nhà cung cấp');
    } else if (action === 'reject') {
      all[idx] = { ...all[idx], status: 'rejected' };
      toast.error('Đã từ chối nhà cung cấp');
    } else if (action === 'suspend') {
      all[idx] = { ...all[idx], status: 'suspended' };
      toast.warning('Đã tạm ngưng nhà cung cấp');
    } else if (action === 'unsuspend') {
      all[idx] = { ...all[idx], status: 'approved' };
      toast.success('Đã khôi phục nhà cung cấp');
    }
    storage.saveSuppliers(all);
    setConfirmAction(null);
    load();
  };

  const CONFIRM_CONFIG: Record<ActionType, {
    title: string; description: string; variant: 'warning' | 'destructive'; requireReason?: boolean; label: string;
  }> = {
    approve: { title: 'Phê duyệt nhà cung cấp', description: 'Nhà cung cấp sẽ được duyệt và có thể tham gia đấu thầu.', variant: 'warning', label: 'Phê duyệt' },
    reject: { title: 'Từ chối nhà cung cấp', description: 'Nhà cung cấp sẽ bị từ chối và không thể đăng nhập vào hệ thống.', variant: 'destructive', requireReason: true, label: 'Từ chối' },
    suspend: { title: 'Tạm ngưng (Blacklist)', description: 'Nhà cung cấp sẽ bị tạm ngưng và không thể tham gia đấu thầu. Hành động này yêu cầu ghi nhận lý do.', variant: 'destructive', requireReason: true, label: 'Tạm ngưng' },
    unsuspend: { title: 'Khôi phục nhà cung cấp', description: 'Nhà cung cấp sẽ được khôi phục trạng thái hoạt động và có thể tham gia đấu thầu trở lại.', variant: 'warning', label: 'Khôi phục' },
  };

  const avgScore = Object.values(EVALUATION_MOCK).reduce((a, b) => a + b, 0) / 4;

  const TABS = [
    { key: 'info', label: 'Thông tin chung' },
    { key: 'categories', label: 'Nhóm hàng đã duyệt' },
    { key: 'evaluation', label: 'Lịch sử đánh giá' },
    { key: 'registrations', label: 'Đơn đăng ký' },
  ] as const;

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-5">
        <Link to="/staff/admin/suppliers" style={{ color: '#64748B', fontSize: '13px' }} className="flex items-center gap-1.5 hover:text-blue-600 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Nhà cung cấp
        </Link>
        <span style={{ color: '#CBD5E1' }}>/</span>
        <span style={{ fontSize: '13px', color: '#1E293B' }}>{supplier.companyName}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-5 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1 flex-wrap">
            <h1 style={{ fontSize: '24px', fontWeight: 600, color: '#1E293B' }}>{supplier.companyName}</h1>
            <StatusBadge status={supplier.status} size="md" />
          </div>
          <div className="flex items-center gap-4 flex-wrap" style={{ marginTop: '4px' }}>
            <span style={{ fontSize: '13px', color: '#64748B' }}>MST: <span style={{ fontFamily: "'IBM Plex Mono', monospace", color: '#334155' }}>{supplier.taxCode}</span></span>
            <span style={{ fontSize: '13px', color: '#64748B' }}>Email: {supplier.email}</span>
            <span style={{ fontSize: '13px', color: '#64748B' }}>SĐT: {supplier.phone}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
          {isPending && (
            <>
              <Button onClick={() => setConfirmAction('reject')} style={{ backgroundColor: '#DC2626', color: '#fff', borderRadius: '6px', fontSize: '14px', fontWeight: 500, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <XCircle className="h-4 w-4" /> Từ chối
              </Button>
              <Button onClick={() => setConfirmAction('approve')} style={{ backgroundColor: '#15803D', color: '#fff', borderRadius: '6px', fontSize: '14px', fontWeight: 500, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle className="h-4 w-4" /> Phê duyệt
              </Button>
            </>
          )}
          {isApproved && (
            <Button onClick={() => setConfirmAction('suspend')} style={{ backgroundColor: '#DC2626', color: '#fff', borderRadius: '6px', fontSize: '14px', fontWeight: 500, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Ban className="h-4 w-4" /> Tạm ngưng (Blacklist)
            </Button>
          )}
          {isSuspended && (
            <Button onClick={() => setConfirmAction('unsuspend')} style={{ backgroundColor: '#15803D', color: '#fff', borderRadius: '6px', fontSize: '14px', fontWeight: 500, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <RotateCcw className="h-4 w-4" /> Khôi phục
            </Button>
          )}
        </div>
      </div>

      {isSuspended && (
        <AlertBanner variant="error" title="Nhà cung cấp đang bị tạm ngưng" message="NCC này không thể tham gia đấu thầu. Liên hệ quản trị viên để biết thêm." className="mb-5" />
      )}

      {/* Score Overview */}
      {isApproved && (
        <div className="grid grid-cols-5 gap-4 mb-5">
          {[
            { label: 'Trung bình', value: avgScore, isTotal: true },
            { label: 'Chất lượng', value: EVALUATION_MOCK.quality },
            { label: 'Giá cả', value: EVALUATION_MOCK.price },
            { label: 'Giao hàng', value: EVALUATION_MOCK.delivery },
            { label: 'Hậu mãi', value: EVALUATION_MOCK.afterSale },
          ].map((s, i) => (
            <div key={i} style={{ backgroundColor: s.isTotal ? '#EFF6FF' : '#FFFFFF', border: `1px solid ${s.isTotal ? '#3B82F6' : '#E2E8F0'}`, borderRadius: '8px', padding: '16px', textAlign: 'center' }}>
              <p style={{ fontSize: '12px', color: '#64748B', marginBottom: '4px', fontWeight: s.isTotal ? 600 : 400 }}>{s.label}</p>
              <p style={{ fontSize: '24px', fontWeight: 700, color: s.value >= 8 ? '#15803D' : s.value >= 6 ? '#B45309' : '#DC2626' }}>
                {s.value.toFixed(1)}
              </p>
              <p style={{ fontSize: '11px', color: '#94A3B8' }}>/10</p>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white" style={{ borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(15,23,42,0.08)', overflow: 'hidden' }}>
        <div className="flex" style={{ borderBottom: '1px solid #E2E8F0' }}>
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: '12px 20px', fontSize: '14px', fontWeight: activeTab === tab.key ? 600 : 400,
                color: activeTab === tab.key ? '#1D4ED8' : '#64748B',
                borderBottom: activeTab === tab.key ? '2px solid #1D4ED8' : '2px solid transparent',
                backgroundColor: 'transparent', cursor: 'pointer', transition: 'all 80ms',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ padding: '24px' }}>
          {/* Info Tab */}
          {activeTab === 'info' && (
            <div className="grid grid-cols-2 gap-x-8 gap-y-5">
              {[
                { label: 'Tên doanh nghiệp', value: supplier.companyName },
                { label: 'Mã số thuế (MST)', value: supplier.taxCode, mono: true },
                { label: 'Địa chỉ', value: supplier.address },
                { label: 'Số điện thoại', value: supplier.phone },
                { label: 'Email', value: supplier.email },
                { label: 'Tên đăng nhập', value: supplier.username, mono: true },
                { label: 'Ngày đăng ký', value: formatDate(supplier.createdAt) },
                { label: 'Ngày phê duyệt', value: supplier.approvedAt ? formatDate(supplier.approvedAt) : '—' },
                { label: 'Người phê duyệt', value: supplier.approvedBy ? (storage.getUserById(supplier.approvedBy)?.name ?? supplier.approvedBy) : '—' },
              ].map((f) => (
                <div key={f.label}>
                  <p style={{ fontSize: '12px', color: '#64748B', marginBottom: '3px', fontWeight: 500 }}>{f.label}</p>
                  <p style={{ fontSize: '14px', color: '#1E293B', fontFamily: f.mono ? "'IBM Plex Mono', monospace" : undefined }}>
                    {f.value}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Categories Tab */}
          {activeTab === 'categories' && (
            <div>
              {CATEGORIES_MOCK.length === 0 ? (
                <p style={{ color: '#94A3B8', fontSize: '14px' }}>Chưa có nhóm hàng được duyệt.</p>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#F1F5F9' }}>
                      {['Tên nhóm hàng', 'Trạng thái'].map((h, i) => (
                        <th key={i} style={{ fontSize: '13px', fontWeight: 500, color: '#475569', padding: '10px 16px', textAlign: 'left', borderBottom: '1px solid #E2E8F0' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {CATEGORIES_MOCK.map((c, idx) => (
                      <tr key={c.id} style={{ backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC', borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '10px 16px', fontSize: '14px', color: '#1E293B' }}>{c.name}</td>
                        <td style={{ padding: '10px 16px' }}>
                          <span style={{
                            fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '9999px',
                            backgroundColor: c.status === 'approved' ? '#F0FDF4' : '#FFFBEB',
                            color: c.status === 'approved' ? '#15803D' : '#B45309',
                            border: `1px solid ${c.status === 'approved' ? '#15803D' : '#B45309'}`,
                          }}>
                            {c.status === 'approved' ? 'Đã duyệt' : 'Chờ duyệt'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Evaluation Tab */}
          {activeTab === 'evaluation' && (
            <div>
              {HISTORY_MOCK.length === 0 ? (
                <p style={{ color: '#94A3B8', fontSize: '14px' }}>Chưa có lịch sử đánh giá.</p>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#F1F5F9' }}>
                      {['Kỳ đánh giá', 'Điểm tổng', 'Ghi chú', 'Người đánh giá', 'Ngày'].map((h, i) => (
                        <th key={i} style={{ fontSize: '13px', fontWeight: 500, color: '#475569', padding: '10px 16px', textAlign: i === 1 ? 'center' : 'left', borderBottom: '1px solid #E2E8F0' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {HISTORY_MOCK.map((e, idx) => (
                      <tr key={e.id} style={{ backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC', borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '10px 16px', fontSize: '14px', fontWeight: 500, color: '#1E293B' }}>{e.period}</td>
                        <td style={{ padding: '10px 16px', textAlign: 'center' }}>
                          <span style={{ fontSize: '15px', fontWeight: 700, color: e.total >= 8 ? '#15803D' : '#B45309', fontFamily: "'IBM Plex Mono', monospace" }}>{e.total}</span>
                          <span style={{ fontSize: '11px', color: '#94A3B8' }}>/10</span>
                        </td>
                        <td style={{ padding: '10px 16px', fontSize: '13px', color: '#475569' }}>{e.note}</td>
                        <td style={{ padding: '10px 16px', fontSize: '13px', color: '#475569' }}>{e.evaluatedBy}</td>
                        <td style={{ padding: '10px 16px', fontSize: '13px', color: '#64748B' }}>{e.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Registrations Tab */}
          {activeTab === 'registrations' && (
            <div>
              {REGISTRATION_MOCK.length === 0 ? (
                <p style={{ color: '#94A3B8', fontSize: '14px' }}>Chưa có đơn đăng ký.</p>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#F1F5F9' }}>
                      {['Ngày nộp', 'Trạng thái', 'Ngày duyệt', 'Ghi chú'].map((h, i) => (
                        <th key={i} style={{ fontSize: '13px', fontWeight: 500, color: '#475569', padding: '10px 16px', textAlign: 'left', borderBottom: '1px solid #E2E8F0' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {REGISTRATION_MOCK.map((r, idx) => (
                      <tr key={r.id} style={{ backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC', borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '10px 16px', fontSize: '13px', color: '#475569' }}>{r.submittedAt}</td>
                        <td style={{ padding: '10px 16px' }}>
                          <span style={{ fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '9999px', backgroundColor: '#F0FDF4', color: '#15803D', border: '1px solid #15803D' }}>
                            {r.status === 'approved' ? 'Đã duyệt' : r.status}
                          </span>
                        </td>
                        <td style={{ padding: '10px 16px', fontSize: '13px', color: '#475569' }}>{r.approvedAt ?? '—'}</td>
                        <td style={{ padding: '10px 16px', fontSize: '13px', color: '#475569' }}>{r.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Confirm Dialogs */}
      {confirmAction && (
        <ConfirmDialog
          open={!!confirmAction}
          onClose={() => setConfirmAction(null)}
          onConfirm={(reason) => applyAction(confirmAction, reason)}
          title={CONFIRM_CONFIG[confirmAction].title}
          description={CONFIRM_CONFIG[confirmAction].description}
          variant={CONFIRM_CONFIG[confirmAction].variant}
          requireReason={CONFIRM_CONFIG[confirmAction].requireReason}
          confirmLabel={CONFIRM_CONFIG[confirmAction].label}
        />
      )}
    </div>
  );
}