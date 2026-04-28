import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { StatusBadge } from '../../../components/shared/StatusBadge';
import { AlertBanner } from '../../../components/shared/AlertBanner';
import { ConfirmDialog } from '../../../components/shared/ConfirmDialog';
import { storage } from '../../../lib/storage';
import { formatDate, formatCurrency } from '../../../lib/utils';
import { toast } from 'sonner';
import type { PurchaseOrder } from '../../../lib/types';

export function PODetail() {
  const { id } = useParams<{ id: string }>();
  const [po, setPO] = useState<PurchaseOrder | null>(null);
  const [confirmAction, setConfirmAction] = useState<'approve' | 'cancel' | null>(null);
  const suppliers = storage.getSuppliers();
  const contracts = storage.getContracts();

  const load = () => setPO(storage.getPurchaseOrderById(id!));
  useEffect(() => { load(); }, [id]);

  if (!po) return (
    <div className="flex items-center justify-center h-64">
      <p style={{ fontSize: '14px', color: '#64748B' }}>Không tìm thấy đơn hàng.</p>
    </div>
  );

  const supplier = suppliers.find(s => s.id === po.supplierId);
  const contract = contracts.find(c => c.id === po.contractId);
  const isDraft = po.status === 'draft';

  const applyAction = (action: 'approve' | 'cancel') => {
    const all = storage.getPurchaseOrders();
    const idx = all.findIndex(p => p.id === po.id);
    if (idx === -1) return;
    const auth = storage.getAuth();
    const now = new Date().toISOString();
    if (action === 'approve') {
      all[idx] = { ...all[idx], status: 'approved', approvedBy: auth?.userId, approvedAt: now };
      toast.success('Đã phê duyệt đơn hàng');
    } else {
      all[idx] = { ...all[idx], status: 'cancelled' };
      toast.error('Đã hủy đơn hàng');
    }
    storage.savePurchaseOrders(all);
    setConfirmAction(null);
    load();
  };

  const totalOrdered = po.items.reduce((s, i) => s + i.totalPrice, 0);
  const totalReceived = po.items.reduce((s, i) => s + (i.receivedQuantity / i.quantity) * i.totalPrice, 0);

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-5">
        <Link to="/staff/warehouse/po" style={{ color: '#64748B', fontSize: '13px' }} className="flex items-center gap-1.5 hover:text-blue-600 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Đơn hàng (PO)
        </Link>
        <span style={{ color: '#CBD5E1' }}>/</span>
        <span style={{ fontSize: '13px', color: '#1E293B' }}>{po.code}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-5 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 style={{ fontSize: '24px', fontWeight: 600, color: '#1E293B' }}>{po.code}</h1>
            <StatusBadge status={po.status} size="md" />
          </div>
          <div className="flex items-center gap-4 flex-wrap" style={{ marginTop: '4px' }}>
            <span style={{ fontSize: '13px', color: '#64748B' }}>HĐ: <span style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{contract?.code ?? po.contractId}</span></span>
            <span style={{ fontSize: '13px', color: '#64748B' }}>NCC: {supplier?.companyName ?? '—'}</span>
            <span style={{ fontSize: '13px', color: '#64748B' }}>Ngày tạo: {formatDate(po.createdAt)}</span>
          </div>
        </div>
        {isDraft && (
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button onClick={() => setConfirmAction('cancel')} style={{ backgroundColor: '#DC2626', color: '#fff', borderRadius: '6px', fontSize: '14px', fontWeight: 500, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <XCircle className="h-4 w-4" /> Hủy PO
            </Button>
            <Button onClick={() => setConfirmAction('approve')} style={{ backgroundColor: '#15803D', color: '#fff', borderRadius: '6px', fontSize: '14px', fontWeight: 500, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle className="h-4 w-4" /> Phê duyệt
            </Button>
          </div>
        )}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        {[
          { label: 'Tổng giá trị', value: formatCurrency(totalOrdered), color: '#1D4ED8' },
          { label: 'Đã nhận (ước tính)', value: formatCurrency(Math.round(totalReceived)), color: '#15803D' },
          { label: 'Giao hàng dự kiến', value: formatDate(po.expectedDeliveryDate), color: '#B45309' },
        ].map((s, i) => (
          <div key={i} style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '16px 20px', boxShadow: '0 1px 3px rgba(15,23,42,0.08)' }}>
            <p style={{ fontSize: '12px', color: '#64748B', marginBottom: '4px', fontWeight: 500 }}>{s.label}</p>
            <p style={{ fontSize: '18px', fontWeight: 700, color: s.color, fontFamily: i < 2 ? "'IBM Plex Mono', monospace" : undefined }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Items Table */}
      <div className="bg-white" style={{ borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(15,23,42,0.08)', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#1E293B' }}>Danh sách hàng hóa</h2>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#F1F5F9' }}>
                {['#', 'Tên hàng hóa', 'ĐVT', 'SL đặt', 'SL đã nhận', 'Tiến độ', 'Đơn giá', 'Thành tiền'].map((h, i) => (
                  <th key={i} style={{ fontSize: '13px', fontWeight: 500, color: '#475569', padding: '10px 16px', textAlign: i >= 3 ? 'right' : 'left', borderBottom: '1px solid #E2E8F0', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {po.items.map((item, idx) => {
                const pct = Math.round((item.receivedQuantity / item.quantity) * 100);
                return (
                  <tr key={item.id} style={{ backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC', borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '10px 16px', fontSize: '13px', color: '#64748B', width: '40px' }}>{idx + 1}</td>
                    <td style={{ padding: '10px 16px', fontSize: '14px', fontWeight: 500, color: '#1E293B' }}>{item.productName}</td>
                    <td style={{ padding: '10px 16px', fontSize: '13px', color: '#475569' }}>{item.unit}</td>
                    <td style={{ padding: '10px 16px', fontSize: '13px', fontFamily: "'IBM Plex Mono', monospace", color: '#334155', textAlign: 'right' }}>{item.quantity}</td>
                    <td style={{ padding: '10px 16px', fontSize: '13px', fontFamily: "'IBM Plex Mono', monospace", color: item.receivedQuantity === item.quantity ? '#15803D' : '#B45309', textAlign: 'right' }}>
                      {item.receivedQuantity}
                    </td>
                    <td style={{ padding: '10px 16px', width: '120px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end' }}>
                        <div style={{ flex: 1, height: '6px', backgroundColor: '#E2E8F0', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', backgroundColor: pct === 100 ? '#15803D' : '#1D4ED8', borderRadius: '3px', transition: 'width 300ms' }} />
                        </div>
                        <span style={{ fontSize: '11px', color: '#64748B', minWidth: '32px' }}>{pct}%</span>
                      </div>
                    </td>
                    <td style={{ padding: '10px 16px', fontSize: '13px', fontFamily: "'IBM Plex Mono', monospace", color: '#334155', textAlign: 'right' }}>{formatCurrency(item.unitPrice)}</td>
                    <td style={{ padding: '10px 16px', fontSize: '13px', fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600, color: '#1E293B', textAlign: 'right' }}>{formatCurrency(item.totalPrice)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div style={{ padding: '12px 20px', borderTop: '2px solid #E2E8F0', backgroundColor: '#F8FAFC', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>Tổng giá trị PO</span>
          <span style={{ fontSize: '16px', fontWeight: 700, color: '#1E293B', fontFamily: "'IBM Plex Mono', monospace" }}>{formatCurrency(po.totalValue)}</span>
        </div>
      </div>

      {/* Confirm Dialogs */}
      <ConfirmDialog
        open={confirmAction === 'approve'}
        onClose={() => setConfirmAction(null)}
        onConfirm={() => applyAction('approve')}
        title="Phê duyệt đơn hàng"
        description="Đơn hàng sẽ được phê duyệt và gửi đến nhà cung cấp để thực hiện."
        variant="warning"
        confirmLabel="Phê duyệt"
      />
      <ConfirmDialog
        open={confirmAction === 'cancel'}
        onClose={() => setConfirmAction(null)}
        onConfirm={() => applyAction('cancel')}
        title="Hủy đơn hàng"
        description="Đơn hàng sẽ bị hủy. Hành động này không thể hoàn tác."
        variant="destructive"
        requireReason
        confirmLabel="Hủy PO"
      />
    </div>
  );
}