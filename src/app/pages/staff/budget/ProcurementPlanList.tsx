import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, Plus, Search, Eye } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { StatusBadge } from '../../../components/shared/StatusBadge';
import { EmptyState } from '../../../components/shared/EmptyState';
import { FormModal } from '../../../components/shared/FormModal';
import { storage } from '../../../lib/storage';
import { generateId, formatDate, formatCurrency } from '../../../lib/utils';
import { toast } from 'sonner';
import type { ProcurementPlan, BudgetStatus } from '../../../lib/types';

export function ProcurementPlanList() {
  const [plans, setPlans] = useState<ProcurementPlan[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: '', departmentId: '', budgetYear: '2026', note: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const departments = storage.getDepartments();
  const user = storage.getAuth();

  const load = () => setPlans(storage.getProcurementPlans());
  useEffect(() => { load(); }, []);

  const filtered = plans.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.code.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const getDeptName = (id: string) => departments.find(d => d.id === id)?.name ?? '—';

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Bắt buộc';
    if (!form.departmentId) e.departmentId = 'Bắt buộc';
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }

    const year = Number(form.budgetYear) || 2026;
    const all = storage.getProcurementPlans();
    const idx = all.length + 1;
    const newPlan: ProcurementPlan = {
      id: generateId('pp'),
      code: `KHMS-${year}-${String(idx).padStart(3, '0')}`,
      name: form.name,
      departmentId: form.departmentId,
      budgetYear: year,
      items: [],
      totalEstimated: 0,
      status: 'draft',
      createdBy: user?.userId ?? 'user-1',
      createdAt: new Date().toISOString(),
      note: form.note || undefined,
    };
    storage.saveProcurementPlans([...all, newPlan]);
    toast.success('Đã tạo kế hoạch mua sắm mới');
    setModalOpen(false);
    setForm({ name: '', departmentId: '', budgetYear: '2026', note: '' });
    load();
  };

  const STATUS_LABELS: Record<BudgetStatus, string> = {
    draft: 'Nháp', pending: 'Chờ duyệt', approved: 'Đã duyệt', rejected: 'Từ chối',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 600, color: '#1E293B' }}>Kế hoạch mua sắm</h1>
          <p style={{ fontSize: '14px', color: '#64748B', marginTop: '4px' }}>Quản lý kế hoạch mua sắm theo phòng ban</p>
        </div>
        <Button
          onClick={() => { setModalOpen(true); setErrors({}); }}
          style={{ backgroundColor: '#1D4ED8', color: '#fff', borderRadius: '6px', fontSize: '14px', fontWeight: 500, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Plus className="h-4 w-4" /> Tạo kế hoạch
        </Button>
      </div>

      <div className="bg-white" style={{ borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(15,23,42,0.08)', overflow: 'hidden' }}>
        {/* Header bar */}
        <div className="flex items-center gap-3 flex-wrap" style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0' }}>
          <div className="relative" style={{ minWidth: '240px' }}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: '#94A3B8' }} />
            <Input
              placeholder="Tìm tên hoặc mã kế hoạch..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '36px', fontSize: '14px', border: '1px solid #E2E8F0', borderRadius: '6px' }}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ fontSize: '14px', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '9px 12px', color: '#1E293B', backgroundColor: '#FFFFFF' }}
          >
            <option value="all">Tất cả trạng thái</option>
            {Object.entries(STATUS_LABELS).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
          <p style={{ fontSize: '13px', color: '#64748B', marginLeft: 'auto' }}>{filtered.length} kế hoạch</p>
        </div>

        <Table>
          <TableHeader>
            <TableRow style={{ backgroundColor: '#F1F5F9' }}>
              {['#', 'Mã', 'Tên kế hoạch', 'Phòng ban', 'Năm', 'Tổng ước tính', 'Trạng thái', 'Ngày tạo', ''].map((h, i) => (
                <TableHead key={i} style={{ fontSize: '13px', fontWeight: 500, color: '#475569', padding: '12px 16px' }}>{h}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} style={{ padding: '48px 0' }}>
                  <EmptyState
                    icon={<ClipboardList className="h-10 w-10" style={{ color: '#94A3B8' }} />}
                    title="Chưa có kế hoạch mua sắm"
                    description="Tạo kế hoạch đầu tiên để bắt đầu."
                    action={
                      <Button onClick={() => setModalOpen(true)} style={{ backgroundColor: '#1D4ED8', color: '#fff', borderRadius: '6px', fontSize: '14px', fontWeight: 500, padding: '10px 16px' }}>
                        <Plus className="h-4 w-4 mr-2" /> Tạo kế hoạch
                      </Button>
                    }
                  />
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((plan, idx) => (
                <TableRow
                  key={plan.id}
                  style={{ backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC' }}
                  className="hover:bg-[#F1F5F9] transition-colors"
                >
                  <TableCell style={{ fontSize: '14px', color: '#64748B', padding: '12px 16px', width: '40px' }}>{idx + 1}</TableCell>
                  <TableCell style={{ padding: '12px 16px' }}>
                    <span style={{ fontSize: '12px', fontFamily: "'IBM Plex Mono', monospace", backgroundColor: '#F1F5F9', color: '#334155', padding: '2px 6px', borderRadius: '4px', border: '1px solid #E2E8F0' }}>
                      {plan.code}
                    </span>
                  </TableCell>
                  <TableCell style={{ fontSize: '14px', fontWeight: 500, color: '#1E293B', padding: '12px 16px', maxWidth: '240px' }}>
                    <span className="block truncate" title={plan.name}>{plan.name}</span>
                  </TableCell>
                  <TableCell style={{ fontSize: '13px', color: '#475569', padding: '12px 16px' }}>{getDeptName(plan.departmentId)}</TableCell>
                  <TableCell style={{ fontSize: '13px', color: '#475569', padding: '12px 16px' }}>{plan.budgetYear}</TableCell>
                  <TableCell style={{ fontSize: '13px', color: '#334155', padding: '12px 16px', fontFamily: "'IBM Plex Mono', monospace", textAlign: 'right' }}>
                    {formatCurrency(plan.totalEstimated)}
                  </TableCell>
                  <TableCell style={{ padding: '12px 16px' }}>
                    <StatusBadge status={plan.status} />
                  </TableCell>
                  <TableCell style={{ fontSize: '13px', color: '#64748B', padding: '12px 16px' }}>{formatDate(plan.createdAt)}</TableCell>
                  <TableCell style={{ padding: '12px 16px' }}>
                    <Link to={`/staff/procurement-plan/${plan.id}`}>
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
        title="Tạo kế hoạch mua sắm mới"
        submitLabel="Tạo"
      >
        <div className="space-y-4">
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#475569', marginBottom: '6px' }}>
              Tên kế hoạch <span style={{ color: '#DC2626' }}>*</span>
            </label>
            <Input
              value={form.name}
              onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="VD: Kế hoạch mua sắm thiết bị CNTT năm 2026"
              style={{ fontSize: '14px', borderColor: errors.name ? '#DC2626' : '#CBD5E1', borderRadius: '6px' }}
            />
            {errors.name && <p style={{ fontSize: '12px', color: '#DC2626', marginTop: '4px' }}>{errors.name}</p>}
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#475569', marginBottom: '6px' }}>
              Phòng ban <span style={{ color: '#DC2626' }}>*</span>
            </label>
            <select
              value={form.departmentId}
              onChange={(e) => setForm(f => ({ ...f, departmentId: e.target.value }))}
              style={{ width: '100%', fontSize: '14px', border: `1px solid ${errors.departmentId ? '#DC2626' : '#CBD5E1'}`, borderRadius: '6px', padding: '9px 12px', backgroundColor: '#FFFFFF', color: '#1E293B' }}
            >
              <option value="">— Chọn phòng ban —</option>
              {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
            {errors.departmentId && <p style={{ fontSize: '12px', color: '#DC2626', marginTop: '4px' }}>{errors.departmentId}</p>}
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#475569', marginBottom: '6px' }}>
              Năm ngân sách
            </label>
            <Input
              type="number"
              value={form.budgetYear}
              onChange={(e) => setForm(f => ({ ...f, budgetYear: e.target.value }))}
              style={{ fontSize: '14px', borderColor: '#CBD5E1', borderRadius: '6px' }}
            />
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