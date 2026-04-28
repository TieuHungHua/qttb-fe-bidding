import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Building, Plus, Search, Eye } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { StatusBadge } from '../../../components/shared/StatusBadge';
import { EmptyState } from '../../../components/shared/EmptyState';
import { FormModal } from '../../../components/shared/FormModal';
import { storage } from '../../../lib/storage';
import { generateId, formatDate, isValidTaxCode, isValidEmail, isValidPhoneNumber } from '../../../lib/utils';
import { toast } from 'sonner';
import type { Supplier } from '../../../lib/types';

const STATUS_MAP: Record<string, string> = {
  all: 'Tất cả',
  pending_approval: 'Chờ duyệt',
  approved: 'Đã duyệt',
  rejected: 'Từ chối',
  suspended: 'Tạm ngưng',
};

interface SupplierForm {
  companyName: string;
  taxCode: string;
  address: string;
  phone: string;
  email: string;
  username: string;
}

const EMPTY_FORM: SupplierForm = { companyName: '', taxCode: '', address: '', phone: '', email: '', username: '' };

export function SupplierList() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<SupplierForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<SupplierForm>>({});

  const load = () => setSuppliers(storage.getSuppliers());
  useEffect(() => { load(); }, []);

  const filtered = suppliers.filter(s => {
    const matchSearch = s.companyName.toLowerCase().includes(search.toLowerCase()) ||
      s.taxCode.includes(search) || s.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const validate = () => {
    const e: Partial<SupplierForm> = {};
    if (!form.companyName.trim()) e.companyName = 'Bắt buộc';
    if (!isValidTaxCode(form.taxCode)) e.taxCode = 'MST không hợp lệ (10 chữ số)';
    if (!form.address.trim()) e.address = 'Bắt buộc';
    if (!isValidPhoneNumber(form.phone)) e.phone = 'SĐT không hợp lệ';
    if (!isValidEmail(form.email)) e.email = 'Email không hợp lệ';
    if (!form.username.trim()) e.username = 'Bắt buộc';
    // Check tax code uniqueness
    if (suppliers.some(s => s.taxCode === form.taxCode)) e.taxCode = 'MST đã tồn tại';
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    const newSupplier: Supplier = {
      id: generateId('sup'),
      ...form,
      status: 'pending_approval',
      approvedCategories: [],
      createdAt: new Date().toISOString(),
    };
    storage.saveSuppliers([...storage.getSuppliers(), newSupplier]);
    toast.success('Đã thêm nhà cung cấp');
    setModalOpen(false);
    setForm(EMPTY_FORM);
    load();
  };

  const getScoreColor = (score?: number) => {
    if (!score) return '#64748B';
    if (score >= 8) return '#15803D';
    if (score >= 6) return '#B45309';
    return '#DC2626';
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 600, color: '#1E293B' }}>Nhà cung cấp</h1>
          <p style={{ fontSize: '14px', color: '#64748B', marginTop: '4px' }}>Quản lý danh sách nhà cung cấp đã đăng ký</p>
        </div>
        <Button
          onClick={() => { setModalOpen(true); setErrors({}); setForm(EMPTY_FORM); }}
          style={{ backgroundColor: '#1D4ED8', color: '#fff', borderRadius: '6px', fontSize: '14px', fontWeight: 500, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Plus className="h-4 w-4" /> Thêm NCC
        </Button>
      </div>

      <div className="bg-white" style={{ borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(15,23,42,0.08)', overflow: 'hidden' }}>
        {/* Header bar */}
        <div className="flex items-center gap-3 flex-wrap" style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0' }}>
          <div className="relative" style={{ minWidth: '240px' }}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: '#94A3B8' }} />
            <Input
              placeholder="Tìm tên, MST, email..."
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
            {Object.entries(STATUS_MAP).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
          <p style={{ fontSize: '13px', color: '#64748B', marginLeft: 'auto' }}>{filtered.length} nhà cung cấp</p>
        </div>

        <Table>
          <TableHeader>
            <TableRow style={{ backgroundColor: '#F1F5F9' }}>
              {['#', 'Tên doanh nghiệp', 'MST', 'Email', 'SĐT', 'Nhóm hàng', 'Trạng thái', 'Ngày đăng ký', ''].map((h, i) => (
                <TableHead key={i} style={{ fontSize: '13px', fontWeight: 500, color: '#475569', padding: '12px 16px' }}>{h}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} style={{ padding: '48px 0' }}>
                  <EmptyState
                    icon={<Building className="h-10 w-10" style={{ color: '#94A3B8' }} />}
                    title="Chưa có nhà cung cấp"
                    description="Thêm nhà cung cấp hoặc chờ đăng ký từ cổng NCC."
                    action={
                      <Button onClick={() => setModalOpen(true)} style={{ backgroundColor: '#1D4ED8', color: '#fff', borderRadius: '6px', fontSize: '14px', fontWeight: 500, padding: '10px 16px' }}>
                        <Plus className="h-4 w-4 mr-2" /> Thêm NCC
                      </Button>
                    }
                  />
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((sup, idx) => (
                <TableRow
                  key={sup.id}
                  style={{ backgroundColor: sup.status === 'suspended' ? '#FEF2F2' : idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC' }}
                  className="hover:bg-[#F1F5F9] transition-colors"
                >
                  <TableCell style={{ fontSize: '14px', color: '#64748B', padding: '12px 16px', width: '40px' }}>{idx + 1}</TableCell>
                  <TableCell style={{ fontSize: '14px', fontWeight: 500, color: '#1E293B', padding: '12px 16px', maxWidth: '200px' }}>
                    <span className="block truncate" title={sup.companyName}>{sup.companyName}</span>
                  </TableCell>
                  <TableCell style={{ padding: '12px 16px' }}>
                    <span style={{ fontSize: '12px', fontFamily: "'IBM Plex Mono', monospace", backgroundColor: '#F1F5F9', color: '#334155', padding: '2px 6px', borderRadius: '4px', border: '1px solid #E2E8F0' }}>
                      {sup.taxCode}
                    </span>
                  </TableCell>
                  <TableCell style={{ fontSize: '13px', color: '#475569', padding: '12px 16px' }}>{sup.email}</TableCell>
                  <TableCell style={{ fontSize: '13px', color: '#475569', padding: '12px 16px' }}>{sup.phone}</TableCell>
                  <TableCell style={{ padding: '12px 16px' }}>
                    <span style={{ fontSize: '12px', color: '#64748B', backgroundColor: '#F1F5F9', borderRadius: '4px', padding: '2px 8px' }}>
                      {sup.approvedCategories.length} nhóm hàng
                    </span>
                  </TableCell>
                  <TableCell style={{ padding: '12px 16px' }}>
                    <StatusBadge status={sup.status} />
                  </TableCell>
                  <TableCell style={{ fontSize: '13px', color: '#64748B', padding: '12px 16px' }}>{formatDate(sup.createdAt)}</TableCell>
                  <TableCell style={{ padding: '12px 16px' }}>
                    <Link to={`/staff/admin/suppliers/${sup.id}`}>
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
        title="Thêm nhà cung cấp mới"
        submitLabel="Thêm"
      >
        <div className="space-y-4">
          {[
            { field: 'companyName', label: 'Tên doanh nghiệp', placeholder: 'VD: Công ty TNHH ABC', required: true },
            { field: 'taxCode', label: 'Mã số thuế (MST)', placeholder: '0123456789', required: true },
            { field: 'address', label: 'Địa chỉ', placeholder: 'Số nhà, đường, quận, thành phố', required: true },
            { field: 'phone', label: 'Số điện thoại', placeholder: '0901234567', required: true },
            { field: 'email', label: 'Email liên hệ', placeholder: 'contact@company.com', required: true },
            { field: 'username', label: 'Tên đăng nhập', placeholder: 'VD: abc_company', required: true },
          ].map(({ field, label, placeholder, required }) => (
            <div key={field}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#475569', marginBottom: '6px' }}>
                {label} {required && <span style={{ color: '#DC2626' }}>*</span>}
              </label>
              <Input
                value={form[field as keyof SupplierForm]}
                onChange={(e) => setForm(f => ({ ...f, [field]: e.target.value }))}
                placeholder={placeholder}
                style={{ fontSize: '14px', borderColor: errors[field as keyof SupplierForm] ? '#DC2626' : '#CBD5E1', borderRadius: '6px' }}
              />
              {errors[field as keyof SupplierForm] && (
                <p style={{ fontSize: '12px', color: '#DC2626', marginTop: '4px' }}>{errors[field as keyof SupplierForm]}</p>
              )}
            </div>
          ))}
        </div>
      </FormModal>
    </div>
  );
}