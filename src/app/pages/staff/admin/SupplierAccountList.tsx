import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { UserCheck, Search, Eye, CheckCircle, XCircle } from 'lucide-react';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { StatusBadge } from '../../../components/shared/StatusBadge';
import { EmptyState } from '../../../components/shared/EmptyState';
import { ConfirmDialog } from '../../../components/shared/ConfirmDialog';
import { storage } from '../../../lib/storage';
import { formatDate } from '../../../lib/utils';
import { toast } from 'sonner';
import type { Supplier } from '../../../lib/types';

export function SupplierAccountList() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [confirmTarget, setConfirmTarget] = useState<{ supplier: Supplier; action: 'approve' | 'reject' } | null>(null);

  const load = () => setSuppliers(storage.getSuppliers());
  useEffect(() => { load(); }, []);

  const filtered = suppliers.filter(s => {
    const matchSearch = s.companyName.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      s.taxCode.includes(search);
    const matchStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const pendingCount = suppliers.filter(s => s.status === 'pending_approval').length;

  const applyAction = (action: 'approve' | 'reject', reason?: string) => {
    if (!confirmTarget) return;
    const all = storage.getSuppliers();
    const idx = all.findIndex(s => s.id === confirmTarget.supplier.id);
    if (idx === -1) return;
    const now = new Date().toISOString();
    const auth = storage.getAuth();
    if (action === 'approve') {
      all[idx] = { ...all[idx], status: 'approved', approvedBy: auth?.userId, approvedAt: now };
      toast.success(`Đã phê duyệt tài khoản: ${confirmTarget.supplier.companyName}`);
    } else {
      all[idx] = { ...all[idx], status: 'rejected' };
      toast.error(`Đã từ chối tài khoản: ${confirmTarget.supplier.companyName}`);
    }
    storage.saveSuppliers(all);
    setConfirmTarget(null);
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 style={{ fontSize: '24px', fontWeight: 600, color: '#1E293B' }}>Tài khoản NCC</h1>
            {pendingCount > 0 && (
              <span style={{ fontSize: '12px', fontWeight: 600, backgroundColor: '#FFFBEB', color: '#B45309', border: '1px solid #B45309', borderRadius: '9999px', padding: '2px 10px' }}>
                {pendingCount} chờ duyệt
              </span>
            )}
          </div>
          <p style={{ fontSize: '14px', color: '#64748B', marginTop: '4px' }}>Phê duyệt tài khoản đăng ký từ cổng NCC</p>
        </div>
      </div>

      <div className="bg-white" style={{ borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(15,23,42,0.08)', overflow: 'hidden' }}>
        {/* Header bar */}
        <div className="flex items-center gap-3 flex-wrap" style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0' }}>
          <div className="relative" style={{ minWidth: '240px' }}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: '#94A3B8' }} />
            <Input
              placeholder="Tìm tên DN, email, MST..."
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
            <option value="all">Tất cả</option>
            <option value="pending_approval">Chờ duyệt</option>
            <option value="approved">Đã duyệt</option>
            <option value="rejected">Từ chối</option>
          </select>
          <p style={{ fontSize: '13px', color: '#64748B', marginLeft: 'auto' }}>{filtered.length} tài khoản</p>
        </div>

        <Table>
          <TableHeader>
            <TableRow style={{ backgroundColor: '#F1F5F9' }}>
              {['#', 'Tên doanh nghiệp', 'Email', 'MST', 'SĐT', 'Trạng thái', 'Ngày đăng ký', 'Thao tác'].map((h, i) => (
                <TableHead key={i} style={{ fontSize: '13px', fontWeight: 500, color: '#475569', padding: '12px 16px' }}>{h}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} style={{ padding: '48px 0' }}>
                  <EmptyState
                    icon={<UserCheck className="h-10 w-10" style={{ color: '#94A3B8' }} />}
                    title="Không có tài khoản nào"
                    description="Chưa có nhà cung cấp đăng ký tài khoản hoặc không khớp bộ lọc."
                  />
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((sup, idx) => {
                const isPending = sup.status === 'pending_approval';
                return (
                  <TableRow
                    key={sup.id}
                    style={{
                      backgroundColor: isPending
                        ? '#FFFBEB'
                        : idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC',
                    }}
                    className="hover:bg-[#F1F5F9] transition-colors"
                  >
                    <TableCell style={{ fontSize: '14px', color: '#64748B', padding: '12px 16px', width: '40px' }}>{idx + 1}</TableCell>
                    <TableCell style={{ fontSize: '14px', fontWeight: 500, color: '#1E293B', padding: '12px 16px' }}>
                      {sup.companyName}
                      {isPending && (
                        <span style={{ marginLeft: '8px', fontSize: '10px', fontWeight: 600, backgroundColor: '#FDE68A', color: '#92400E', borderRadius: '4px', padding: '1px 5px' }}>MỚI</span>
                      )}
                    </TableCell>
                    <TableCell style={{ fontSize: '13px', color: '#475569', padding: '12px 16px' }}>{sup.email}</TableCell>
                    <TableCell style={{ padding: '12px 16px' }}>
                      <span style={{ fontSize: '12px', fontFamily: "'IBM Plex Mono', monospace", backgroundColor: '#F1F5F9', color: '#334155', padding: '2px 6px', borderRadius: '4px', border: '1px solid #E2E8F0' }}>
                        {sup.taxCode}
                      </span>
                    </TableCell>
                    <TableCell style={{ fontSize: '13px', color: '#475569', padding: '12px 16px' }}>{sup.phone}</TableCell>
                    <TableCell style={{ padding: '12px 16px' }}>
                      <StatusBadge status={sup.status} />
                    </TableCell>
                    <TableCell style={{ fontSize: '13px', color: '#64748B', padding: '12px 16px' }}>{formatDate(sup.createdAt)}</TableCell>
                    <TableCell style={{ padding: '12px 16px' }}>
                      <div className="flex items-center gap-1.5">
                        <Link to={`/staff/admin/suppliers/${sup.id}`}>
                          <button className="p-1.5 rounded hover:bg-gray-100 transition-colors" title="Xem chi tiết">
                            <Eye className="h-4 w-4" style={{ color: '#475569' }} />
                          </button>
                        </Link>
                        {isPending && (
                          <>
                            <button
                              onClick={() => setConfirmTarget({ supplier: sup, action: 'reject' })}
                              className="p-1.5 rounded hover:bg-red-50 transition-colors"
                              title="Từ chối"
                            >
                              <XCircle className="h-4 w-4" style={{ color: '#DC2626' }} />
                            </button>
                            <button
                              onClick={() => setConfirmTarget({ supplier: sup, action: 'approve' })}
                              className="p-1.5 rounded hover:bg-green-50 transition-colors"
                              title="Phê duyệt"
                            >
                              <CheckCircle className="h-4 w-4" style={{ color: '#15803D' }} />
                            </button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Confirm Dialog */}
      {confirmTarget && (
        <ConfirmDialog
          open={!!confirmTarget}
          onClose={() => setConfirmTarget(null)}
          onConfirm={(reason) => applyAction(confirmTarget.action, reason)}
          title={confirmTarget.action === 'approve' ? 'Phê duyệt tài khoản NCC' : 'Từ chối tài khoản NCC'}
          description={
            confirmTarget.action === 'approve'
              ? `Phê duyệt tài khoản cho "${confirmTarget.supplier.companyName}". NCC sẽ có thể đăng nhập và tham gia đấu thầu.`
              : `Từ chối tài khoản cho "${confirmTarget.supplier.companyName}". Vui lòng nhập lý do từ chối.`
          }
          variant={confirmTarget.action === 'reject' ? 'destructive' : 'warning'}
          requireReason={confirmTarget.action === 'reject'}
          reasonLabel="Lý do từ chối *"
          confirmLabel={confirmTarget.action === 'approve' ? 'Phê duyệt' : 'Từ chối'}
        />
      )}
    </div>
  );
}