import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Send, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { StatusBadge } from '../../../components/shared/StatusBadge';
import { AlertBanner } from '../../../components/shared/AlertBanner';
import { ConfirmDialog } from '../../../components/shared/ConfirmDialog';
import { storage } from '../../../lib/storage';
import { generateId, formatDate, formatCurrency } from '../../../lib/utils';
import { toast } from 'sonner';
import type { ProcurementPlan, ProcurementPlanItem } from '../../../lib/types';

export function ProcurementPlanDetail() {
  const { id } = useParams<{ id: string }>();
  const [plan, setPlan] = useState<ProcurementPlan | null>(null);
  const [items, setItems] = useState<ProcurementPlanItem[]>([]);
  const [confirmAction, setConfirmAction] = useState<'submit' | 'approve' | 'reject' | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const departments = storage.getDepartments();
  const user = storage.getAuth();

  const load = () => {
    const p = storage.getProcurementPlanById(id!);
    if (p) {
      setPlan(p);
      setItems(p.items);
    }
  };

  useEffect(() => { load(); }, [id]);

  if (!plan) return (
    <div className="flex items-center justify-center h-64">
      <p style={{ fontSize: '14px', color: '#64748B' }}>Không tìm thấy kế hoạch mua sắm.</p>
    </div>
  );

  const getDeptName = (id: string) => departments.find(d => d.id === id)?.name ?? '—';

  const totalEstimated = items.reduce((sum, i) => sum + i.totalPrice, 0);

  const isDraft = plan.status === 'draft';
  const isPending = plan.status === 'pending';
  const isApproved = plan.status === 'approved';
  const userRole = storage.getUsers().find(u => u.id === user?.userId)?.role;
  const canApprove = userRole === 'approver' || userRole === 'admin';

  const addRow = () => {
    if (!isDraft) return;
    const newItem: ProcurementPlanItem = {
      id: generateId('item'),
      productId: '',
      productName: '',
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0,
      unit: 'bộ',
    };
    setItems(prev => [...prev, newItem]);
  };

  const updateItem = (idx: number, field: keyof ProcurementPlanItem, value: string | number) => {
    setItems(prev => {
      const updated = [...prev];
      const item = { ...updated[idx], [field]: value };
      if (field === 'quantity' || field === 'unitPrice') {
        item.totalPrice = Number(item.quantity) * Number(item.unitPrice);
      }
      updated[idx] = item;
      return updated;
    });
  };

  const removeItem = (idx: number) => {
    setItems(prev => prev.filter((_, i) => i !== idx));
  };

  const saveItems = () => {
    setIsSaving(true);
    const all = storage.getProcurementPlans();
    const idx = all.findIndex(p => p.id === plan.id);
    if (idx !== -1) {
      all[idx] = { ...all[idx], items, totalEstimated };
      storage.saveProcurementPlans(all);
      toast.success('Đã lưu danh sách hạng mục');
      load();
    }
    setIsSaving(false);
  };

  const applyAction = (action: 'submit' | 'approve' | 'reject', reason?: string) => {
    const all = storage.getProcurementPlans();
    const idx = all.findIndex(p => p.id === plan.id);
    if (idx === -1) return;

    const now = new Date().toISOString();
    if (action === 'submit') {
      all[idx] = { ...all[idx], items, totalEstimated, status: 'pending' };
      toast.success('Đã gửi phê duyệt');
    } else if (action === 'approve') {
      all[idx] = { ...all[idx], status: 'approved', approvedBy: user?.userId, approvedAt: now };
      toast.success('Đã phê duyệt kế hoạch');
    } else if (action === 'reject') {
      all[idx] = { ...all[idx], status: 'rejected' };
      toast.error('Đã từ chối kế hoạch');
    }
    storage.saveProcurementPlans(all);
    setConfirmAction(null);
    load();
  };

  const CONFIRM_CONFIG = {
    submit: { title: 'Gửi phê duyệt', description: 'Kế hoạch sẽ được gửi lên lãnh đạo phê duyệt. Bạn không thể chỉnh sửa sau khi gửi.', variant: 'warning' as const, label: 'Gửi duyệt' },
    approve: { title: 'Phê duyệt kế hoạch', description: 'Bạn xác nhận phê duyệt kế hoạch mua sắm này. Kế hoạch sẽ được chuyển sang trạng thái đã duyệt.', variant: 'warning' as const, label: 'Phê duyệt' },
    reject: { title: 'Từ chối kế hoạch', description: 'Kế hoạch mua sắm sẽ bị từ chối và trả về trạng thái cần chỉnh sửa.', variant: 'destructive' as const, requireReason: true, label: 'Từ chối' },
  };

  const cfg = confirmAction ? CONFIRM_CONFIG[confirmAction] : null;

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-5">
        <Link to="/staff/procurement-plan" className="flex items-center gap-1.5 text-sm hover:text-blue-600 transition-colors" style={{ color: '#64748B', fontSize: '13px' }}>
          <ArrowLeft className="h-4 w-4" />
          Kế hoạch mua sắm
        </Link>
        <span style={{ color: '#CBD5E1' }}>/</span>
        <span style={{ fontSize: '13px', color: '#1E293B' }}>{plan.code}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 style={{ fontSize: '24px', fontWeight: 600, color: '#1E293B' }}>{plan.name}</h1>
            <StatusBadge status={plan.status} size="md" />
          </div>
          <div className="flex items-center gap-4 flex-wrap" style={{ marginTop: '4px' }}>
            <span style={{ fontSize: '13px', color: '#64748B' }}>
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", backgroundColor: '#F1F5F9', padding: '1px 6px', borderRadius: '4px', border: '1px solid #E2E8F0', marginRight: '8px' }}>{plan.code}</span>
              {getDeptName(plan.departmentId)}
            </span>
            <span style={{ fontSize: '13px', color: '#64748B' }}>Năm: {plan.budgetYear}</span>
            <span style={{ fontSize: '13px', color: '#64748B' }}>Tạo: {formatDate(plan.createdAt)}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {isDraft && (
            <>
              <Button
                onClick={saveItems}
                disabled={isSaving}
                style={{ backgroundColor: '#F1F5F9', color: '#334155', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '14px', fontWeight: 500, padding: '10px 16px' }}
              >
                Lưu nháp
              </Button>
              <Button
                onClick={() => setConfirmAction('submit')}
                style={{ backgroundColor: '#1D4ED8', color: '#fff', borderRadius: '6px', fontSize: '14px', fontWeight: 500, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Send className="h-4 w-4" /> Gửi phê duyệt
              </Button>
            </>
          )}
          {isPending && canApprove && (
            <>
              <Button
                onClick={() => setConfirmAction('reject')}
                style={{ backgroundColor: '#DC2626', color: '#fff', borderRadius: '6px', fontSize: '14px', fontWeight: 500, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <XCircle className="h-4 w-4" /> Từ chối
              </Button>
              <Button
                onClick={() => setConfirmAction('approve')}
                style={{ backgroundColor: '#15803D', color: '#fff', borderRadius: '6px', fontSize: '14px', fontWeight: 500, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <CheckCircle className="h-4 w-4" /> Phê duyệt
              </Button>
            </>
          )}
        </div>
      </div>

      {isPending && (
        <AlertBanner variant="info" message="Kế hoạch đang chờ lãnh đạo phê duyệt. Vui lòng không thay đổi trong thời gian ch���." className="mb-5" />
      )}
      {isApproved && (
        <AlertBanner variant="success" title="Kế hoạch đã được phê duyệt" message={`Phê duyệt bởi: ${storage.getUserById(plan.approvedBy ?? '')?.name ?? '—'} lúc ${plan.approvedAt ? formatDate(plan.approvedAt) : '—'}`} className="mb-5" />
      )}
      {plan.status === 'rejected' && (
        <AlertBanner variant="error" message="Kế hoạch đã bị từ chối. Vui lòng chỉnh sửa và gửi lại." className="mb-5" />
      )}

      {/* Plan note */}
      {plan.note && (
        <div className="mb-5 rounded-lg px-4 py-3" style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
          <p style={{ fontSize: '13px', fontWeight: 500, color: '#475569', marginBottom: '2px' }}>Ghi chú</p>
          <p style={{ fontSize: '14px', color: '#1E293B' }}>{plan.note}</p>
        </div>
      )}

      {/* Inline Editable Table */}
      <div className="bg-white" style={{ borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(15,23,42,0.08)', overflow: 'hidden' }}>
        <div className="flex items-center justify-between" style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#1E293B' }}>Danh sách hạng mục</h2>
          <span style={{ fontSize: '13px', color: '#64748B' }}>{items.length} hạng mục</span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#F1F5F9' }}>
                {['#', 'Tên hàng hóa', 'Đơn vị', 'Số lượng', 'Đơn giá ước tính (VNĐ)', 'Thành tiền', 'Ghi chú', isDraft ? '' : ''].map((h, i) => (
                  <th key={i} style={{ fontSize: '13px', fontWeight: 500, color: '#475569', padding: '10px 14px', textAlign: i >= 3 ? 'right' : 'left', whiteSpace: 'nowrap', borderBottom: '1px solid #E2E8F0' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '40px 0', color: '#94A3B8', fontSize: '14px' }}>
                    Chưa có hạng mục. {isDraft && 'Nhấn "+ Thêm dòng" để bắt đầu.'}
                  </td>
                </tr>
              )}
              {items.map((item, idx) => (
                <tr key={item.id} style={{ backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC', borderBottom: '1px solid #F1F5F9' }}
                  className="group"
                >
                  <td style={{ padding: '8px 14px', fontSize: '13px', color: '#64748B', width: '40px' }}>{idx + 1}</td>
                  <td style={{ padding: '6px 8px', minWidth: '200px' }}>
                    {isDraft ? (
                      <Input
                        value={item.productName}
                        onChange={(e) => updateItem(idx, 'productName', e.target.value)}
                        placeholder="Tên hàng hóa..."
                        style={{ fontSize: '13px', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '6px 10px', height: '32px' }}
                      />
                    ) : (
                      <span style={{ fontSize: '14px', color: '#1E293B' }}>{item.productName || '—'}</span>
                    )}
                  </td>
                  <td style={{ padding: '6px 8px', width: '80px' }}>
                    {isDraft ? (
                      <Input
                        value={item.unit}
                        onChange={(e) => updateItem(idx, 'unit', e.target.value)}
                        placeholder="bộ"
                        style={{ fontSize: '13px', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '6px 10px', height: '32px', textAlign: 'center' }}
                      />
                    ) : (
                      <span style={{ fontSize: '13px', color: '#475569', display: 'block', textAlign: 'right' }}>{item.unit}</span>
                    )}
                  </td>
                  <td style={{ padding: '6px 8px', width: '100px', textAlign: 'right' }}>
                    {isDraft ? (
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(idx, 'quantity', Number(e.target.value))}
                        style={{ fontSize: '13px', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '6px 10px', height: '32px', textAlign: 'right' }}
                      />
                    ) : (
                      <span style={{ fontSize: '13px', fontFamily: "'IBM Plex Mono', monospace", color: '#334155', display: 'block', textAlign: 'right' }}>{item.quantity}</span>
                    )}
                  </td>
                  <td style={{ padding: '6px 8px', minWidth: '160px', textAlign: 'right' }}>
                    {isDraft ? (
                      <Input
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(idx, 'unitPrice', Number(e.target.value))}
                        style={{ fontSize: '13px', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '6px 10px', height: '32px', textAlign: 'right', fontFamily: "'IBM Plex Mono', monospace" }}
                      />
                    ) : (
                      <span style={{ fontSize: '13px', fontFamily: "'IBM Plex Mono', monospace", color: '#334155', display: 'block', textAlign: 'right' }}>{formatCurrency(item.unitPrice)}</span>
                    )}
                  </td>
                  <td style={{ padding: '8px 14px', textAlign: 'right' }}>
                    <span style={{ fontSize: '13px', fontFamily: "'IBM Plex Mono', monospace", fontWeight: 500, color: '#1E293B' }}>{formatCurrency(item.totalPrice)}</span>
                  </td>
                  <td style={{ padding: '6px 8px', minWidth: '140px' }}>
                    {isDraft ? (
                      <Input
                        value={item.note ?? ''}
                        onChange={(e) => updateItem(idx, 'note', e.target.value)}
                        placeholder="Ghi chú..."
                        style={{ fontSize: '13px', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '6px 10px', height: '32px' }}
                      />
                    ) : (
                      <span style={{ fontSize: '13px', color: '#64748B' }}>{item.note ?? '—'}</span>
                    )}
                  </td>
                  {isDraft && (
                    <td style={{ padding: '6px 8px', width: '40px', textAlign: 'center' }}>
                      <button
                        onClick={() => removeItem(idx)}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded transition-opacity hover:bg-red-50"
                        title="Xóa dòng"
                      >
                        <Trash2 className="h-3.5 w-3.5" style={{ color: '#DC2626' }} />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add Row */}
        {isDraft && (
          <div style={{ padding: '12px 14px', borderTop: '1px solid #E2E8F0' }}>
            <button
              onClick={addRow}
              className="flex items-center gap-2 text-sm hover:text-blue-700 transition-colors"
              style={{ color: '#1D4ED8', fontSize: '13px', fontWeight: 500 }}
            >
              <Plus className="h-4 w-4" />
              Thêm dòng
            </button>
          </div>
        )}

        {/* Total footer */}
        <div
          className="flex items-center justify-between"
          style={{ padding: '12px 20px', borderTop: '2px solid #E2E8F0', backgroundColor: '#F8FAFC' }}
        >
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>Tổng giá trị ước tính</span>
          <span style={{ fontSize: '16px', fontWeight: 700, color: '#1E293B', fontFamily: "'IBM Plex Mono', monospace" }}>
            {formatCurrency(totalEstimated)}
          </span>
        </div>
      </div>

      {/* Confirm Dialogs */}
      {cfg && (
        <ConfirmDialog
          open={!!confirmAction}
          onClose={() => setConfirmAction(null)}
          onConfirm={(reason) => applyAction(confirmAction!, reason)}
          title={cfg.title}
          description={cfg.description}
          variant={cfg.variant}
          requireReason={(cfg as any).requireReason ?? false}
          confirmLabel={cfg.label}
        />
      )}
    </div>
  );
}