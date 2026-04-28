import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { AlertBanner } from '../../../components/shared/AlertBanner';
import { ConfirmDialog } from '../../../components/shared/ConfirmDialog';
import { storage } from '../../../lib/storage';
import { formatDate } from '../../../lib/utils';
import { toast } from 'sonner';
import type { WarehouseReceipt, WarehouseReceiptItem, QualityStatus } from '../../../lib/types';

const WR_KEY = 'qttb_warehouse_receipts';
const WR_STATUS_KEY = 'qttb_wr_status';

function getReceipts(): WarehouseReceipt[] {
  const raw = localStorage.getItem(WR_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveReceipts(receipts: WarehouseReceipt[]) {
  localStorage.setItem(WR_KEY, JSON.stringify(receipts));
}

function getStatuses(): Record<string, 'draft' | 'confirmed' | 'rejected'> {
  const raw = localStorage.getItem(WR_STATUS_KEY);
  return raw ? JSON.parse(raw) : {};
}

function saveStatus(id: string, status: 'draft' | 'confirmed' | 'rejected') {
  const all = getStatuses();
  all[id] = status;
  localStorage.setItem(WR_STATUS_KEY, JSON.stringify(all));
}

const QUALITY_CONFIG: Record<QualityStatus, { label: string; bg: string; color: string; border: string }> = {
  good:      { label: 'Tốt',   bg: '#F0FDF4', color: '#15803D', border: '#15803D' },
  defective: { label: 'Lỗi',   bg: '#FEF2F2', color: '#DC2626', border: '#DC2626' },
  missing:   { label: 'Thiếu', bg: '#FFFBEB', color: '#B45309', border: '#B45309' },
};

function QualityBadge({ status }: { status: QualityStatus }) {
  const cfg = QUALITY_CONFIG[status];
  return (
    <span
      style={{
        fontSize: '11px', fontWeight: 600, padding: '2px 8px',
        borderRadius: '9999px', backgroundColor: cfg.bg,
        color: cfg.color, border: `1px solid ${cfg.border}`,
        display: 'inline-block',
      }}
      aria-label={`Chất lượng: ${cfg.label}`}
    >
      {cfg.label}
    </span>
  );
}

export function WarehouseReceiptDetail() {
  const { id } = useParams<{ id: string }>();
  const [receipt, setReceipt] = useState<WarehouseReceipt | null>(null);
  const [items, setItems] = useState<WarehouseReceiptItem[]>([]);
  const [status, setStatus] = useState<'draft' | 'confirmed' | 'rejected'>('draft');
  const [confirmAction, setConfirmAction] = useState<'confirm' | 'reject' | null>(null);

  const pos = storage.getPurchaseOrders();
  const suppliers = storage.getSuppliers();

  const load = () => {
    const all = getReceipts();
    const r = all.find(x => x.id === id);
    if (r) {
      setReceipt(r);
      setItems(r.items);
      const statuses = getStatuses();
      setStatus(statuses[r.id] ?? 'draft');
    }
  };

  useEffect(() => { load(); }, [id]);

  if (!receipt) return (
    <div className="flex items-center justify-center h-64">
      <p style={{ fontSize: '14px', color: '#64748B' }}>Không tìm thấy phiếu nhập kho.</p>
    </div>
  );

  const po = pos.find(p => p.id === receipt.poId);
  const supplier = suppliers.find(s => s.id === po?.supplierId);
  const isDraft = status === 'draft';

  const updateQuality = (idx: number, qs: QualityStatus) => {
    setItems(prev => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], qualityStatus: qs };
      return updated;
    });
  };

  const updateQty = (idx: number, qty: number) => {
    setItems(prev => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], receivedQuantity: qty };
      return updated;
    });
  };

  const updateNote = (idx: number, note: string) => {
    setItems(prev => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], note };
      return updated;
    });
  };

  const applyAction = (action: 'confirm' | 'reject') => {
    const all = getReceipts();
    const idx = all.findIndex(r => r.id === receipt.id);
    if (idx === -1) return;
    all[idx] = { ...all[idx], items };
    saveReceipts(all);
    const newStatus = action === 'confirm' ? 'confirmed' : 'rejected';
    saveStatus(receipt.id, newStatus);
    setStatus(newStatus);
    setConfirmAction(null);
    if (action === 'confirm') {
      toast.success('Đã xác nhận phiếu nhập kho. Số lượng PO đã được cập nhật.');
    } else {
      toast.error('Đã từ chối phiếu nhập kho.');
    }
    load();
  };

  const qualitySummary = {
    good: items.filter(i => i.qualityStatus === 'good').length,
    defective: items.filter(i => i.qualityStatus === 'defective').length,
    missing: items.filter(i => i.qualityStatus === 'missing').length,
  };

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-5">
        <Link to="/staff/warehouse/receipt" style={{ color: '#64748B', fontSize: '13px' }} className="flex items-center gap-1.5 hover:text-blue-600 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Phiếu nhập kho
        </Link>
        <span style={{ color: '#CBD5E1' }}>/</span>
        <span style={{ fontSize: '13px', color: '#1E293B' }}>{receipt.code}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-5 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 style={{ fontSize: '24px', fontWeight: 600, color: '#1E293B' }}>{receipt.code}</h1>
            <span
              style={{
                fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '9999px',
                backgroundColor: status === 'confirmed' ? '#F0FDF4' : status === 'rejected' ? '#FEF2F2' : '#F1F5F9',
                color: status === 'confirmed' ? '#15803D' : status === 'rejected' ? '#DC2626' : '#475569',
                border: `1px solid ${status === 'confirmed' ? '#15803D' : status === 'rejected' ? '#DC2626' : '#CBD5E1'}`,
              }}
              aria-label={`Trạng thái: ${status === 'confirmed' ? 'Đã xác nhận' : status === 'rejected' ? 'Từ chối' : 'Nháp'}`}
            >
              {status === 'confirmed' ? 'Đã xác nhận' : status === 'rejected' ? 'Từ chối' : 'Nháp'}
            </span>
          </div>
          <div className="flex items-center gap-4 flex-wrap" style={{ marginTop: '4px' }}>
            <span style={{ fontSize: '13px', color: '#64748B' }}>PO: <span style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{po?.code ?? receipt.poId}</span></span>
            <span style={{ fontSize: '13px', color: '#64748B' }}>NCC: {supplier?.companyName ?? '—'}</span>
            <span style={{ fontSize: '13px', color: '#64748B' }}>Ngày nhận: {formatDate(receipt.receivedDate)}</span>
            <span style={{ fontSize: '13px', color: '#64748B' }}>Kiểm tra: {receipt.inspector}</span>
          </div>
        </div>
        {isDraft && (
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              onClick={() => setConfirmAction('reject')}
              style={{ backgroundColor: '#DC2626', color: '#fff', borderRadius: '6px', fontSize: '14px', fontWeight: 500, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <XCircle className="h-4 w-4" /> Từ chối
            </Button>
            <Button
              onClick={() => setConfirmAction('confirm')}
              style={{ backgroundColor: '#15803D', color: '#fff', borderRadius: '6px', fontSize: '14px', fontWeight: 500, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <CheckCircle className="h-4 w-4" /> Xác nhận nhập kho
            </Button>
          </div>
        )}
      </div>

      {/* Quality Summary */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        {[
          { label: 'Tốt', count: qualitySummary.good, bg: '#F0FDF4', color: '#15803D', border: '#BBF7D0' },
          { label: 'Lỗi', count: qualitySummary.defective, bg: '#FEF2F2', color: '#DC2626', border: '#FECACA' },
          { label: 'Thiếu', count: qualitySummary.missing, bg: '#FFFBEB', color: '#B45309', border: '#FDE68A' },
        ].map((s) => (
          <div key={s.label} style={{ backgroundColor: s.bg, border: `1px solid ${s.border}`, borderRadius: '8px', padding: '16px 20px' }}>
            <p style={{ fontSize: '13px', color: s.color, fontWeight: 500, marginBottom: '4px' }}>Chất lượng: {s.label}</p>
            <p style={{ fontSize: '28px', fontWeight: 700, color: s.color }}>{s.count}</p>
            <p style={{ fontSize: '12px', color: s.color, opacity: 0.7 }}>hạng mục</p>
          </div>
        ))}
      </div>

      {isDraft && (
        <AlertBanner
          variant="warning"
          title="Kiểm tra chất lượng"
          message="Xem xét kỹ từng hạng mục trước khi xác nhận. Sau khi xác nhận, số lượng đã nhận trên PO sẽ được cập nhật tự động."
          className="mb-5"
        />
      )}

      {/* Items Table */}
      <div className="bg-white" style={{ borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(15,23,42,0.08)', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#1E293B' }}>Danh sách hàng hóa nhận</h2>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#F1F5F9' }}>
                {['#', 'Tên hàng hóa', 'SL theo PO', 'SL thực nhận', 'Chất lượng', 'Ghi chú'].map((h, i) => (
                  <th key={i} style={{ fontSize: '13px', fontWeight: 500, color: '#475569', padding: '10px 16px', textAlign: i >= 2 ? 'center' : 'left', borderBottom: '1px solid #E2E8F0', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => {
                const poItem = po?.items.find(pi => pi.id === item.poItemId);
                return (
                  <tr key={item.id} style={{ backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC', borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '10px 16px', fontSize: '13px', color: '#64748B', width: '40px' }}>{idx + 1}</td>
                    <td style={{ padding: '10px 16px', fontSize: '14px', fontWeight: 500, color: '#1E293B' }}>{item.productName}</td>
                    <td style={{ padding: '10px 16px', textAlign: 'center' }}>
                      <span style={{ fontSize: '13px', fontFamily: "'IBM Plex Mono', monospace", color: '#475569' }}>
                        {poItem?.quantity ?? '—'} {poItem?.unit ?? ''}
                      </span>
                    </td>
                    <td style={{ padding: '8px 16px', textAlign: 'center', width: '120px' }}>
                      {isDraft ? (
                        <input
                          type="number"
                          value={item.receivedQuantity}
                          onChange={(e) => updateQty(idx, Number(e.target.value))}
                          style={{ width: '80px', fontSize: '13px', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '4px 8px', textAlign: 'right', fontFamily: "'IBM Plex Mono', monospace" }}
                          min={0}
                        />
                      ) : (
                        <span style={{ fontSize: '13px', fontFamily: "'IBM Plex Mono', monospace", color: '#334155' }}>{item.receivedQuantity}</span>
                      )}
                    </td>
                    <td style={{ padding: '8px 16px', textAlign: 'center' }}>
                      {isDraft ? (
                        <select
                          value={item.qualityStatus}
                          onChange={(e) => updateQuality(idx, e.target.value as QualityStatus)}
                          style={{
                            fontSize: '12px', fontWeight: 600, padding: '2px 8px', borderRadius: '9999px',
                            backgroundColor: QUALITY_CONFIG[item.qualityStatus].bg,
                            color: QUALITY_CONFIG[item.qualityStatus].color,
                            border: `1px solid ${QUALITY_CONFIG[item.qualityStatus].border}`,
                            cursor: 'pointer',
                          }}
                        >
                          <option value="good">Tốt</option>
                          <option value="defective">Lỗi</option>
                          <option value="missing">Thiếu</option>
                        </select>
                      ) : (
                        <QualityBadge status={item.qualityStatus} />
                      )}
                    </td>
                    <td style={{ padding: '8px 16px' }}>
                      {isDraft ? (
                        <input
                          type="text"
                          value={item.note ?? ''}
                          onChange={(e) => updateNote(idx, e.target.value)}
                          placeholder="Ghi chú..."
                          style={{ width: '100%', fontSize: '13px', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '4px 8px', outline: 'none', minWidth: '160px' }}
                        />
                      ) : (
                        <span style={{ fontSize: '13px', color: '#64748B' }}>{item.note ?? '—'}</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {receipt.note && (
          <div style={{ padding: '12px 20px', borderTop: '1px solid #E2E8F0', backgroundColor: '#F8FAFC' }}>
            <span style={{ fontSize: '12px', color: '#64748B' }}>Ghi chú phiếu: </span>
            <span style={{ fontSize: '13px', color: '#475569' }}>{receipt.note}</span>
          </div>
        )}
      </div>

      {/* Confirm Dialogs */}
      <ConfirmDialog
        open={confirmAction === 'confirm'}
        onClose={() => setConfirmAction(null)}
        onConfirm={() => applyAction('confirm')}
        title="Xác nhận nhập kho"
        description="Xác nhận sẽ cập nhật số lượng đã nhận trên PO liên kết. Hành động này không thể hoàn tác."
        variant="warning"
        confirmLabel="Xác nhận nhập kho"
      />
      <ConfirmDialog
        open={confirmAction === 'reject'}
        onClose={() => setConfirmAction(null)}
        onConfirm={() => applyAction('reject')}
        title="Từ chối phiếu nhập"
        description="Bạn đang từ chối phiếu nhập kho này. Vui lòng nhập lý do để ghi nhận."
        variant="destructive"
        requireReason
        confirmLabel="Từ chối"
      />
    </div>
  );
}