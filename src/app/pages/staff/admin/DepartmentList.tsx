import { useState, useEffect } from 'react';
import { Building2, Plus, Pencil, Trash2, Search } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { FormModal } from '../../../components/shared/FormModal';
import { ConfirmDialog } from '../../../components/shared/ConfirmDialog';
import { EmptyState } from '../../../components/shared/EmptyState';
import { storage } from '../../../lib/storage';
import { generateId, formatDate } from '../../../lib/utils';
import { toast } from 'sonner';
import type { Department } from '../../../lib/types';

interface DeptForm {
  name: string;
  code: string;
  budgetLimit: string;
  managerId: string;
}

const EMPTY_FORM: DeptForm = { name: '', code: '', budgetLimit: '', managerId: '' };

export function DepartmentList() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Department | null>(null);
  const [form, setForm] = useState<DeptForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<DeptForm>>({});
  const [deleteTarget, setDeleteTarget] = useState<Department | null>(null);
  const users = storage.getUsers();

  const loadDepts = () => setDepartments(storage.getDepartments());

  useEffect(() => { loadDepts(); }, []);

  const filtered = departments.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.code.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setModalOpen(true);
  };

  const openEdit = (dept: Department) => {
    setEditing(dept);
    setForm({
      name: dept.name,
      code: dept.code,
      budgetLimit: String(dept.budgetLimit),
      managerId: dept.managerId ?? '',
    });
    setErrors({});
    setModalOpen(true);
  };

  const validate = () => {
    const e: Partial<DeptForm> = {};
    if (!form.name.trim()) e.name = 'Bắt buộc';
    if (!form.code.trim()) e.code = 'Bắt buộc';
    if (!form.budgetLimit || isNaN(Number(form.budgetLimit))) e.budgetLimit = 'Không hợp lệ';
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }

    const all = storage.getDepartments();
    if (editing) {
      const updated = all.map(d =>
        d.id === editing.id
          ? { ...d, name: form.name, code: form.code, budgetLimit: Number(form.budgetLimit), managerId: form.managerId || undefined }
          : d
      );
      storage.saveDepartments(updated);
      toast.success('Đã cập nhật phòng ban');
    } else {
      const newDept: Department = {
        id: generateId('dept'),
        name: form.name,
        code: form.code,
        budgetLimit: Number(form.budgetLimit),
        managerId: form.managerId || undefined,
        createdAt: new Date().toISOString(),
      };
      storage.saveDepartments([...all, newDept]);
      toast.success('Đã thêm phòng ban mới');
    }
    setModalOpen(false);
    loadDepts();
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    const all = storage.getDepartments().filter(d => d.id !== deleteTarget.id);
    storage.saveDepartments(all);
    toast.success('Đã xóa phòng ban');
    setDeleteTarget(null);
    loadDepts();
  };

  const getManagerName = (id?: string) => {
    if (!id) return '—';
    return users.find(u => u.id === id)?.name ?? '—';
  };

  const formatBudget = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  return (
    <div style={{ padding: '0' }}>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 600, color: '#1E293B', lineHeight: '1.3' }}>
            Phòng ban
          </h1>
          <p style={{ fontSize: '14px', color: '#64748B', marginTop: '4px' }}>
            Quản lý các đơn vị trong trường học
          </p>
        </div>
        <Button
          onClick={openCreate}
          style={{
            backgroundColor: '#1D4ED8', color: '#FFFFFF',
            borderRadius: '6px', fontSize: '14px', fontWeight: 500,
            padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px',
          }}
        >
          <Plus className="h-4 w-4" />
          Thêm phòng ban
        </Button>
      </div>

      {/* Table Card */}
      <div
        className="bg-white"
        style={{
          borderRadius: '8px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(15,23,42,0.08)',
          overflow: 'hidden',
        }}
      >
        {/* Table Header Bar */}
        <div
          className="flex items-center gap-3"
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid #E2E8F0',
          }}
        >
          <div className="relative flex-1" style={{ maxWidth: '320px' }}>
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
              style={{ color: '#94A3B8' }}
            />
            <Input
              placeholder="Tìm kiếm phòng ban..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                paddingLeft: '36px', fontSize: '14px',
                border: '1px solid #E2E8F0', borderRadius: '6px',
              }}
            />
          </div>
          <p style={{ fontSize: '13px', color: '#64748B', marginLeft: 'auto' }}>
            {filtered.length} phòng ban
          </p>
        </div>

        {/* Table */}
        <Table>
          <TableHeader>
            <TableRow style={{ backgroundColor: '#F1F5F9' }}>
              {['#', 'Tên phòng ban', 'Mã', 'Trưởng phòng', 'Hạn mức ngân sách', 'Ngày tạo', ''].map((h, i) => (
                <TableHead
                  key={i}
                  style={{
                    fontSize: '13px', fontWeight: 500, color: '#475569',
                    padding: '12px 16px',
                    textAlign: i >= 5 ? 'right' : 'left',
                  }}
                >
                  {h}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} style={{ padding: '48px 0' }}>
                  <EmptyState
                    icon={<Building2 className="h-10 w-10" style={{ color: '#94A3B8' }} />}
                    title="Chưa có phòng ban"
                    description="Thêm phòng ban đầu tiên để bắt đầu quản lý."
                    action={
                      <Button onClick={openCreate} style={{ backgroundColor: '#1D4ED8', color: '#fff', borderRadius: '6px', fontSize: '14px', fontWeight: 500, padding: '10px 16px' }}>
                        <Plus className="h-4 w-4 mr-2" /> Thêm phòng ban
                      </Button>
                    }
                  />
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((dept, idx) => (
                <TableRow
                  key={dept.id}
                  style={{ backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC' }}
                  className="hover:bg-[#F1F5F9] transition-colors"
                >
                  <TableCell style={{ fontSize: '14px', color: '#64748B', padding: '12px 16px', width: '48px' }}>
                    {idx + 1}
                  </TableCell>
                  <TableCell style={{ fontSize: '14px', fontWeight: 500, color: '#1E293B', padding: '12px 16px' }}>
                    {dept.name}
                  </TableCell>
                  <TableCell style={{ padding: '12px 16px' }}>
                    <span
                      style={{
                        fontSize: '12px', fontFamily: "'IBM Plex Mono', monospace",
                        backgroundColor: '#F1F5F9', color: '#334155',
                        padding: '2px 8px', borderRadius: '4px',
                        border: '1px solid #E2E8F0',
                      }}
                    >
                      {dept.code}
                    </span>
                  </TableCell>
                  <TableCell style={{ fontSize: '14px', color: '#475569', padding: '12px 16px' }}>
                    {getManagerName(dept.managerId)}
                  </TableCell>
                  <TableCell style={{ fontSize: '13px', color: '#334155', padding: '12px 16px', fontFamily: "'IBM Plex Mono', monospace" }}>
                    {formatBudget(dept.budgetLimit)}
                  </TableCell>
                  <TableCell style={{ fontSize: '13px', color: '#64748B', padding: '12px 16px' }}>
                    {formatDate(dept.createdAt)}
                  </TableCell>
                  <TableCell style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEdit(dept)}
                        className="p-1.5 rounded hover:bg-gray-100 transition-colors"
                        aria-label="Sửa"
                        title="Sửa phòng ban"
                      >
                        <Pencil className="h-4 w-4" style={{ color: '#475569' }} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(dept)}
                        className="p-1.5 rounded hover:bg-red-50 transition-colors"
                        aria-label="Xóa"
                        title="Xóa phòng ban"
                      >
                        <Trash2 className="h-4 w-4" style={{ color: '#DC2626' }} />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create / Edit Modal */}
      <FormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        title={editing ? 'Sửa phòng ban' : 'Thêm phòng ban mới'}
        submitLabel={editing ? 'Cập nhật' : 'Thêm'}
      >
        <div className="space-y-4">
          {/* Name */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#475569', marginBottom: '6px' }}>
              Tên phòng ban <span style={{ color: '#DC2626' }}>*</span>
            </label>
            <Input
              value={form.name}
              onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="VD: Phòng Công nghệ thông tin"
              style={{ fontSize: '14px', borderColor: errors.name ? '#DC2626' : '#CBD5E1', borderRadius: '6px' }}
            />
            {errors.name && <p style={{ fontSize: '12px', color: '#DC2626', marginTop: '4px' }}>{errors.name}</p>}
          </div>

          {/* Code */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#475569', marginBottom: '6px' }}>
              Mã phòng ban <span style={{ color: '#DC2626' }}>*</span>
            </label>
            <Input
              value={form.code}
              onChange={(e) => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
              placeholder="VD: CNTT"
              maxLength={10}
              style={{ fontSize: '14px', borderColor: errors.code ? '#DC2626' : '#CBD5E1', borderRadius: '6px', fontFamily: "'IBM Plex Mono', monospace" }}
            />
            {errors.code && <p style={{ fontSize: '12px', color: '#DC2626', marginTop: '4px' }}>{errors.code}</p>}
          </div>

          {/* Budget Limit */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#475569', marginBottom: '6px' }}>
              Hạn mức ngân sách (VNĐ) <span style={{ color: '#DC2626' }}>*</span>
            </label>
            <Input
              type="number"
              value={form.budgetLimit}
              onChange={(e) => setForm(f => ({ ...f, budgetLimit: e.target.value }))}
              placeholder="VD: 5000000000"
              style={{ fontSize: '14px', borderColor: errors.budgetLimit ? '#DC2626' : '#CBD5E1', borderRadius: '6px' }}
            />
            {errors.budgetLimit && <p style={{ fontSize: '12px', color: '#DC2626', marginTop: '4px' }}>{errors.budgetLimit}</p>}
          </div>

          {/* Manager */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#475569', marginBottom: '6px' }}>
              Trưởng phòng
            </label>
            <select
              value={form.managerId}
              onChange={(e) => setForm(f => ({ ...f, managerId: e.target.value }))}
              style={{
                width: '100%', fontSize: '14px', color: '#1E293B',
                border: '1px solid #CBD5E1', borderRadius: '6px',
                padding: '9px 12px', backgroundColor: '#FFFFFF',
                outline: 'none',
              }}
            >
              <option value="">— Chưa chỉ định —</option>
              {users.filter(u => u.role !== 'supplier').map(u => (
                <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
              ))}
            </select>
          </div>
        </div>
      </FormModal>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Xóa phòng ban"
        description={`Bạn có chắc muốn xóa phòng ban "${deleteTarget?.name}"? Hành động này không thể hoàn tác.`}
        variant="destructive"
        confirmLabel="Xóa"
      />
    </div>
  );
}
