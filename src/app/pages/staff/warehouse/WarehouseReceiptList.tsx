import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Warehouse, Plus, Search, Eye } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { EmptyState } from '../../../components/shared/EmptyState';
import { FormModal } from '../../../components/shared/FormModal';
import { storage } from '../../../lib/storage';
import { generateId, formatDate } from '../../../lib/utils';
import { toast } from 'sonner';
import type { WarehouseReceipt, PurchaseOrder } from '../../../lib/types';

// Extend storage to handle warehouse receipts via localStorage directly
const WR_KEY = 'qttb_warehouse_receipts';

function getReceipts(): WarehouseReceipt[] {
  const raw = localStorage.getItem(WR_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveReceipts(receipts: WarehouseReceipt[]) {
  localStorage.setItem(WR_KEY, JSON.stringify(receipts));
}

// Seed initial receipt if none exist
function seedReceipts(pos: PurchaseOrder[]) {
  const existing = getReceipts();
  if (existing.length > 0) return;
  if (pos.length === 0) return;
  const po = pos[0];
  const receipt: WarehouseReceipt = {
    id: 'wr-1',
    code: 'PIK-2026-001',
    poId: po.id,
    items: po.items.map((item, i) => ({
      id: `wri-${i + 1}`,
      poItemId: item.id,
      productName: item.productName,
      receivedQuantity: item.receivedQuantity,
      qualityStatus: i === 0 ? 'good' : i === 1 ? 'good' : 'missing',
      note: i === 2 ? 'Chưa giao đủ số lượng' : undefined,
    })),
    receivedDate: '2026-04-10T00:00:00Z',
    inspector: 'Nguyễn Văn Admin',
    note: 'Đợt nhận hàng lần 1',
    createdBy: 'user-2',
    createdAt: '2026-04-10T00:00:00Z',
  };
  saveReceipts([receipt]);
}

export function WarehouseReceiptList() {
  const [receipts, setReceipts] = useState<WarehouseReceipt[]>([]);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ poId: '', inspector: '', receivedDate: '', note: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const pos = storage.getPurchaseOrders();
  const suppliers = storage.getSuppliers();

  const load = () => {
    seedReceipts(pos);
    setReceipts(getReceipts());
  };

  useEffect(() => { load(); }, []);

  const filtered = receipts.filter(r =>
    r.code.toLowerCase().includes(search.toLowerCase()) ||
    r.poId.toLowerCase().includes(search.toLowerCase())
  );

  const getPOCode = (id: string) => pos.find(p => p.id === id)?.code ?? id;
  const getSupplierName = (poId: string) => {
    const po = pos.find(p => p.id === poId);
    if (!po) return '—';
    return suppliers.find(s => s.id === po.supplierId)?.companyName ?? '—';
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.poId) e.poId = 'Bắt buộc';
    if (!form.inspector.trim()) e.inspector = 'Bắt buộc';
    if (!form.receivedDate) e.receivedDate = 'Bắt buộc';
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    const po = pos.find(p => p.id === form.poId);
    if (!po) return;
    const allReceipts = getReceipts();
    const newReceipt: WarehouseReceipt = {
      id: generateId('wr'),
      code: `PIK-${new Date().getFullYear()}-${String(allReceipts.length + 1).padStart(3, '0')}`,
      poId: form.poId,
      items: po.items.map((item, i) => ({
        id: generateId('wri'),
        poItemId: item.id,
        productName: item.productName,
        receivedQuantity: 0,
        qualityStatus: 'good' as const,
      })),
      receivedDate: new Date(form.receivedDate).toISOString(),
      inspector: form.inspector,
      note: form.note || undefined,
      createdBy: storage.getAuth()?.userId ?? 'user-1',
      createdAt: new Date().toISOString(),
    };
    saveReceipts([...allReceipts, newReceipt]);
    toast.success('Đã tạo phiếu nhập kho');
    setModalOpen(false);
    setForm({ poId: '', inspector: '', receivedDate: '', note: '' });
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 600, color: '#1E293B' }}>Phiếu nhập kho</h1>
          <p style={{ fontSize: '14px', color: '#64748B', marginTop: '4px' }}>Quản lý việc nhận và kiểm tra hàng hóa</p>
        </div>
        <Button
          onClick={() => { setModalOpen(true); setErrors({}); setForm({ poId: '', inspector: '', receivedDate: '', note: '' }); }}
          style={{ backgroundColor: '#1D4ED8', color: '#fff', borderRadius: '6px', fontSize: '14px', fontWeight: 500, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Plus className="h-4 w-4" /> Tạo phiếu nhập
        </Button>
      </div>

      <div className="bg-white" style={{ borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(15,23,42,0.08)', overflow: 'hidden' }}>
        <div className="flex items-center gap-3" style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0' }}>
          <div className="relative" style={{ minWidth: '240px' }}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: '#94A3B8' }} />
            <Input
              placeholder="Tìm mã phiếu..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '36px', fontSize: '14px', border: '1px solid #E2E8F0', borderRadius: '6px' }}
            />
          </div>
          <p style={{ fontSize: '13px', color: '#64748B', marginLeft: 'auto' }}>{filtered.length} phiếu</p>
        </div>

        <Table>
          <TableHeader>
            <TableRow style={{ backgroundColor: '#F1F5F9' }}>
              {['#', 'Mã phiếu', 'PO liên kết', 'Nhà cung cấp', 'Ngày nhận', 'Người kiểm tra', 'Số hạng mục', ''].map((h, i) => (
                <TableHead key={i} style={{ fontSize: '13px', fontWeight: 500, color: '#475569', padding: '12px 16px' }}>{h}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} style={{ padding: '48px 0' }}>
                  <EmptyState
                    icon={<Warehouse className="h-10 w-10" style={{ color: '#94A3B8' }} />}
                    title="Chưa có phiếu nhập kho"
                    description="Tạo phiếu nhập kho khi nhận hàng từ nhà cung cấp."
                    action={
                      <Button onClick={() => setModalOpen(true)} style={{ backgroundColor: '#1D4ED8', color: '#fff', borderRadius: '6px', fontSize: '14px', fontWeight: 500, padding: '10px 16px' }}>
                        <Plus className="h-4 w-4 mr-2" /> Tạo phiếu nhập
                      </Button>
                    }
                  />
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((r, idx) => (
                <TableRow
                  key={r.id}
                  style={{ backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC' }}
                  className="hover:bg-[#F1F5F9] transition-colors"
                >
                  <TableCell style={{ fontSize: '14px', color: '#64748B', padding: '12px 16px', width: '40px' }}>{idx + 1}</TableCell>
                  <TableCell style={{ padding: '12px 16px' }}>
                    <span style={{ fontSize: '12px', fontFamily: "'IBM Plex Mono', monospace", backgroundColor: '#F1F5F9', color: '#334155', padding: '2px 6px', borderRadius: '4px', border: '1px solid #E2E8F0' }}>
                      {r.code}
                    </span>
                  </TableCell>
                  <TableCell style={{ fontSize: '13px', color: '#475569', padding: '12px 16px' }}>
                    <span style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{getPOCode(r.poId)}</span>
                  </TableCell>
                  <TableCell style={{ fontSize: '14px', color: '#1E293B', padding: '12px 16px' }}>{getSupplierName(r.poId)}</TableCell>
                  <TableCell style={{ fontSize: '13px', color: '#475569', padding: '12px 16px' }}>{formatDate(r.receivedDate)}</TableCell>
                  <TableCell style={{ fontSize: '13px', color: '#475569', padding: '12px 16px' }}>{r.inspector}</TableCell>
                  <TableCell style={{ fontSize: '13px', color: '#475569', padding: '12px 16px' }}>{r.items.length}</TableCell>
                  <TableCell style={{ padding: '12px 16px' }}>
                    <Link to={`/staff/warehouse/receipt/${r.id}`}>
                      <button className="p-1.5 rounded hover:bg-gray-100 transition-colors" title="Xem chi tiết">
                        <Eye className="h-4 w-4" style={{ color: '#475569' }} />
                      </button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create Modal */}
      <FormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        title="Tạo phiếu nhập kho"
        submitLabel="Tạo phiếu"
      >
        <div className="space-y-4">
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#475569', marginBottom: '6px' }}>
              Đơn hàng (PO) <span style={{ color: '#DC2626' }}>*</span>
            </label>
            <select
              value={form.poId}
              onChange={(e) => setForm(f => ({ ...f, poId: e.target.value }))}
              style={{ width: '100%', fontSize: '14px', border: `1px solid ${errors.poId ? '#DC2626' : '#CBD5E1'}`, borderRadius: '6px', padding: '9px 12px', backgroundColor: '#FFFFFF', color: '#1E293B' }}
            >
              <option value="">— Chọn PO —</option>
              {pos.map(p => <option key={p.id} value={p.id}>{p.code} — {suppliers.find(s => s.id === p.supplierId)?.companyName ?? '—'}</option>)}
            </select>
            {errors.poId && <p style={{ fontSize: '12px', color: '#DC2626', marginTop: '4px' }}>{errors.poId}</p>}
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#475569', marginBottom: '6px' }}>
              Người kiểm tra <span style={{ color: '#DC2626' }}>*</span>
            </label>
            <Input
              value={form.inspector}
              onChange={(e) => setForm(f => ({ ...f, inspector: e.target.value }))}
              placeholder="Họ tên người kiểm tra hàng"
              style={{ fontSize: '14px', borderColor: errors.inspector ? '#DC2626' : '#CBD5E1', borderRadius: '6px' }}
            />
            {errors.inspector && <p style={{ fontSize: '12px', color: '#DC2626', marginTop: '4px' }}>{errors.inspector}</p>}
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#475569', marginBottom: '6px' }}>
              Ngày nhận hàng <span style={{ color: '#DC2626' }}>*</span>
            </label>
            <Input
              type="date"
              value={form.receivedDate}
              onChange={(e) => setForm(f => ({ ...f, receivedDate: e.target.value }))}
              style={{ fontSize: '14px', borderColor: errors.receivedDate ? '#DC2626' : '#CBD5E1', borderRadius: '6px' }}
            />
            {errors.receivedDate && <p style={{ fontSize: '12px', color: '#DC2626', marginTop: '4px' }}>{errors.receivedDate}</p>}
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#475569', marginBottom: '6px' }}>
              Ghi chú
            </label>
            <textarea
              value={form.note}
              onChange={(e) => setForm(f => ({ ...f, note: e.target.value }))}
              placeholder="Ghi chú thêm..."
              rows={3}
              style={{ width: '100%', fontSize: '14px', border: '1px solid #CBD5E1', borderRadius: '6px', padding: '9px 12px', resize: 'vertical', outline: 'none', color: '#1E293B' }}
            />
          </div>
        </div>
      </FormModal>
    </div>
  );
}