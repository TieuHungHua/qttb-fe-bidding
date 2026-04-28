import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { storage } from '../../../lib/storage';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { StatusBadge } from '../../../components/shared/StatusBadge';
import { AlertBanner } from '../../../components/shared/AlertBanner';
import { ConfirmDialog } from '../../../components/shared/ConfirmDialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { ArrowLeft, FileText, Gavel, History, XCircle, CheckCircle } from 'lucide-react';
import { formatCurrency, formatDate, formatDateTime } from '../../../lib/utils';
import type { BiddingProject } from '../../../lib/types';

export function SimpleBiddingDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<BiddingProject | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showSelectWinnerDialog, setShowSelectWinnerDialog] = useState(false);
  const [selectedWinnerId, setSelectedWinnerId] = useState<string | null>(null);

  const loadProject = useCallback(() => {
    if (!id) return;
    const foundProject = storage.getBiddingProjectById(id);
    setProject(foundProject || null);
  }, [id]);

  useEffect(() => {
    loadProject();
  }, [loadProject]);

  const handleProjectUpdate = (updated: BiddingProject) => {
    setProject(updated);
  };

  const handleCancel = (reason?: string) => {
    if (!project) return;
    const updated: BiddingProject = {
      ...project,
      currentState: 'cancelled',
      stateHistory: [
        ...project.stateHistory,
        {
          state: 'cancelled',
          changedBy: 'user-1',
          changedAt: new Date().toISOString(),
          note: reason ?? 'Hủy chào hàng',
        },
      ],
    };
    storage.updateBiddingProject(project.id, updated);
    handleProjectUpdate(updated);
    setShowCancelDialog(false);
  };

  const handleSelectWinner = () => {
    if (!project || !selectedWinnerId) return;

    const updatedBids = project.bids.map(bid => ({
      ...bid,
      status: bid.id === selectedWinnerId ? 'winner' : 'rejected',
    }));

    const updated: BiddingProject = {
      ...project,
      bids: updatedBids,
      currentState: 'winner_announced',
      stateHistory: [
        ...project.stateHistory,
        {
          state: 'winner_announced',
          changedBy: 'user-1',
          changedAt: new Date().toISOString(),
          note: 'Đã chọn nhà cung cấp trúng thầu',
        },
      ],
    };
    storage.updateBiddingProject(project.id, updated);
    handleProjectUpdate(updated);
    setShowSelectWinnerDialog(false);
    setSelectedWinnerId(null);
  };

  if (!project) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p style={{ fontSize: '18px', fontWeight: 600, color: '#1E293B' }}>Không tìm thấy chào hàng</p>
          <Button
            onClick={() => navigate('/staff/bidding/simple')}
            className="mt-4"
            style={{ backgroundColor: '#1D4ED8', color: '#FFFFFF', borderRadius: '6px' }}
          >
            Quay lại danh sách
          </Button>
        </div>
      </div>
    );
  }

  const isCancelled = project.currentState === 'cancelled';
  const isCompleted = project.currentState === 'contract_signed';
  const hasWinner = project.bids.some(b => b.status === 'winner');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => navigate('/staff/bidding/simple')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '14px',
            color: '#64748B',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px 0',
            marginBottom: '12px',
          }}
        >
          <ArrowLeft style={{ width: 16, height: 16 }} />
          Quay lại danh sách
        </button>

        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3 flex-wrap mb-1">
              <h1
                style={{
                  fontSize: '24px',
                  fontWeight: 700,
                  color: '#1E293B',
                  lineHeight: '1.3',
                }}
              >
                {project.name}
              </h1>
              <StatusBadge status={project.currentState} type="bidding" size="lg" />
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              <span
                style={{
                  fontSize: '13px',
                  color: '#64748B',
                  fontFamily: '"IBM Plex Mono", monospace',
                }}
              >
                {project.code}
              </span>
              <span style={{ fontSize: '13px', color: '#94A3B8' }}>•</span>
              <span style={{ fontSize: '13px', color: '#64748B' }}>
                Chào hàng cạnh tranh
              </span>
              <span style={{ fontSize: '13px', color: '#94A3B8' }}>•</span>
              <span style={{ fontSize: '13px', fontFamily: '"IBM Plex Mono", monospace', color: '#64748B' }}>
                {formatCurrency(project.estimatedValue)}
              </span>
            </div>
          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {project.currentState === 'evaluation' && project.bids.length > 0 && !hasWinner && (
              <Button
                onClick={() => setShowSelectWinnerDialog(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '14px',
                  fontWeight: 500,
                  padding: '8px 14px',
                  borderRadius: '6px',
                  backgroundColor: '#10B981',
                  color: '#FFFFFF',
                }}
              >
                <CheckCircle style={{ width: 15, height: 15 }} />
                Chọn nhà cung cấp
              </Button>
            )}
            {!isCancelled && !isCompleted && (
              <button
                onClick={() => setShowCancelDialog(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '14px',
                  fontWeight: 500,
                  padding: '8px 14px',
                  borderRadius: '6px',
                  backgroundColor: '#DC2626',
                  color: '#FFFFFF',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <XCircle style={{ width: 15, height: 15 }} />
                Hủy chào hàng
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Cancelled Banner */}
      {isCancelled && (
        <AlertBanner
          variant="error"
          title="Chào hàng đã bị hủy"
          message="Chào hàng này đã được hủy và không thể tiếp tục thực hiện."
        />
      )}

      {/* 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Info */}
        <div className="space-y-4">
          <Card style={{ border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(15,23,42,0.08)', borderRadius: '8px' }}>
            <CardHeader style={{ padding: '16px 20px 12px' }}>
              <CardTitle style={{ fontSize: '14px', fontWeight: 600, color: '#475569' }}>
                Thông tin cơ bản
              </CardTitle>
            </CardHeader>
            <CardContent style={{ padding: '0 20px 16px' }}>
              <div className="space-y-3">
                <InfoRow label="Phương thức" value="Chào hàng cạnh tranh" />
                <InfoRow
                  label="Giá trị ước tính"
                  value={formatCurrency(project.estimatedValue)}
                  mono
                />
                <InfoRow label="Ngày tạo" value={formatDate(project.createdAt)} />
                {project.publishedDate && (
                  <InfoRow label="Ngày công bố" value={formatDate(project.publishedDate)} />
                )}
                {project.deadlineDate && (
                  <InfoRow label="Hạn nộp báo giá" value={formatDate(project.deadlineDate)} />
                )}
                {project.openingDate && (
                  <InfoRow label="Ngày mở thầu" value={formatDateTime(project.openingDate)} />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Simple Stepper */}
          <Card style={{ border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(15,23,42,0.08)', borderRadius: '8px' }}>
            <CardHeader style={{ padding: '16px 20px 12px' }}>
              <CardTitle style={{ fontSize: '14px', fontWeight: 600, color: '#475569' }}>
                Quy trình đơn giản
              </CardTitle>
            </CardHeader>
            <CardContent style={{ padding: '0 20px 16px' }}>
              <div className="space-y-2">
                {['draft', 'pending_approval', 'bidding_open', 'evaluation', 'winner_announced', 'contract_signed'].map((state, idx) => {
                  const labels: Record<string, string> = {
                    draft: 'Nháp',
                    pending_approval: 'Chờ phê duyệt',
                    bidding_open: 'Đang mở thầu',
                    evaluation: 'Đang đánh giá',
                    winner_announced: 'Đã chọn NCC',
                    contract_signed: 'Đã ký HĐ',
                  };
                  const stateOrder = ['draft', 'pending_approval', 'bidding_open', 'evaluation', 'winner_announced', 'contract_signed'];
                  const currentIdx = stateOrder.indexOf(project.currentState);
                  const isActive = idx === currentIdx;
                  const isPassed = idx < currentIdx;

                  return (
                    <div key={state} className="flex items-center gap-2">
                      <div
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: '50%',
                          backgroundColor: isActive ? '#1D4ED8' : isPassed ? '#10B981' : '#E2E8F0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {isPassed && <CheckCircle style={{ width: 12, height: 12, color: '#FFFFFF' }} />}
                      </div>
                      <span
                        style={{
                          fontSize: '13px',
                          fontWeight: isActive ? 600 : 400,
                          color: isActive ? '#1E293B' : isPassed ? '#64748B' : '#94A3B8',
                        }}
                      >
                        {labels[state]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Tabs */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="info" className="space-y-4">
            <TabsList
              style={{
                backgroundColor: '#F1F5F9',
                borderRadius: '8px',
                padding: '4px',
                display: 'flex',
                gap: '2px',
                height: 'auto',
              }}
            >
              <TabsTrigger value="info" style={{ fontSize: '13px', borderRadius: '6px' }}>
                <FileText style={{ width: 14, height: 14, marginRight: '6px' }} />
                Thông tin
              </TabsTrigger>
              <TabsTrigger value="bids" style={{ fontSize: '13px', borderRadius: '6px' }}>
                <Gavel style={{ width: 14, height: 14, marginRight: '6px' }} />
                Báo giá ({project.bids.length})
              </TabsTrigger>
              <TabsTrigger value="history" style={{ fontSize: '13px', borderRadius: '6px' }}>
                <History style={{ width: 14, height: 14, marginRight: '6px' }} />
                Lịch sử
              </TabsTrigger>
            </TabsList>

            {/* Tab: Info */}
            <TabsContent value="info" className="space-y-4">
              <Card style={{ border: '1px solid #E2E8F0', borderRadius: '8px' }}>
                <CardHeader style={{ padding: '16px 20px 12px' }}>
                  <CardTitle style={{ fontSize: '16px', fontWeight: 600, color: '#1E293B' }}>
                    Mô tả chào hàng
                  </CardTitle>
                </CardHeader>
                <CardContent style={{ padding: '0 20px 20px' }}>
                  <p style={{ fontSize: '14px', color: '#475569', lineHeight: '1.6' }}>
                    {project.description}
                  </p>
                </CardContent>
              </Card>

              {/* Quick stats */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Báo giá nhận được', value: project.bids.length },
                  {
                    label: 'Nhà cung cấp trúng thầu',
                    value: project.bids.filter((b) => b.status === 'winner').length,
                  },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="text-center p-4 rounded-lg"
                    style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}
                  >
                    <p style={{ fontSize: '24px', fontWeight: 700, color: '#1E293B', fontFamily: '"IBM Plex Mono", monospace' }}>
                      {stat.value}
                    </p>
                    <p style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>{stat.label}</p>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* Tab: Bids */}
            <TabsContent value="bids" className="space-y-4">
              <Card style={{ border: '1px solid #E2E8F0', borderRadius: '8px' }}>
                <CardHeader style={{ padding: '16px 20px 12px' }}>
                  <CardTitle style={{ fontSize: '16px', fontWeight: 600, color: '#1E293B' }}>
                    Danh sách báo giá
                  </CardTitle>
                </CardHeader>
                <CardContent style={{ padding: '0' }}>
                  {project.bids.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow style={{ backgroundColor: '#F1F5F9' }}>
                          {['Nhà cung cấp', 'Ngày nộp', 'Giá báo', 'Trạng thái', 'Chọn'].map(
                            (h) => (
                              <TableHead
                                key={h}
                                style={{
                                  fontSize: '13px',
                                  fontWeight: 500,
                                  color: '#475569',
                                  padding: '10px 16px',
                                }}
                              >
                                {h}
                              </TableHead>
                            )
                          )}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {project.bids.map((bid, idx) => {
                          const supplier = storage.getSupplierById(bid.supplierId);
                          const isWinner = bid.status === 'winner';
                          return (
                            <TableRow
                              key={bid.id}
                              style={{
                                backgroundColor: isWinner
                                  ? '#FEF3C7'
                                  : idx % 2 === 0
                                  ? '#FFFFFF'
                                  : '#F8FAFC',
                              }}
                            >
                              <TableCell style={{ fontSize: '14px', fontWeight: isWinner ? 600 : 400, color: '#1E293B', padding: '12px 16px' }}>
                                {supplier?.companyName}
                                {isWinner && (
                                  <span
                                    style={{
                                      display: 'inline-block',
                                      marginLeft: '8px',
                                      fontSize: '10px',
                                      fontWeight: 700,
                                      padding: '1px 6px',
                                      borderRadius: '9999px',
                                      backgroundColor: '#D97706',
                                      color: '#FFFFFF',
                                    }}
                                  >
                                    ĐÃ CHỌN
                                  </span>
                                )}
                              </TableCell>
                              <TableCell style={{ fontSize: '13px', color: '#475569', padding: '12px 16px' }}>
                                {formatDateTime(bid.submittedAt)}
                              </TableCell>
                              <TableCell style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '14px', fontWeight: 600, padding: '12px 16px' }}>
                                {formatCurrency(bid.bidAmount ?? 0)}
                              </TableCell>
                              <TableCell style={{ padding: '12px 16px' }}>
                                <StatusBadge
                                  status={
                                    bid.status === 'winner'
                                      ? 'contract_signed'
                                      : bid.status === 'rejected'
                                      ? 'cancelled'
                                      : 'submitted'
                                  }
                                  type="budget"
                                  size="sm"
                                />
                              </TableCell>
                              <TableCell style={{ padding: '12px 16px' }}>
                                {project.currentState === 'evaluation' && !hasWinner && (
                                  <input
                                    type="radio"
                                    name="winner"
                                    checked={selectedWinnerId === bid.id}
                                    onChange={() => setSelectedWinnerId(bid.id)}
                                    style={{ width: 16, height: 16, cursor: 'pointer' }}
                                  />
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="flex flex-col items-center py-10 gap-3" style={{ color: '#94A3B8' }}>
                      <Gavel style={{ width: 36, height: 36 }} />
                      <p style={{ fontSize: '14px', fontWeight: 500, color: '#64748B' }}>
                        Chưa có báo giá nào
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab: History */}
            <TabsContent value="history" className="space-y-4">
              <Card style={{ border: '1px solid #E2E8F0', borderRadius: '8px' }}>
                <CardHeader style={{ padding: '16px 20px 12px' }}>
                  <CardTitle style={{ fontSize: '16px', fontWeight: 600, color: '#1E293B' }}>
                    Lịch sử thay đổi trạng thái
                  </CardTitle>
                </CardHeader>
                <CardContent style={{ padding: '4px 20px 20px' }}>
                  <div className="relative">
                    <div
                      className="absolute left-3.5 top-0 bottom-0"
                      style={{ width: '1px', backgroundColor: '#E2E8F0' }}
                    />
                    <div className="space-y-4">
                      {[...project.stateHistory].reverse().map((history, index) => {
                        const user = storage.getUserById(history.changedBy);
                        const isCancelledState = history.state === 'cancelled';
                        return (
                          <div key={index} className="flex gap-4 relative">
                            <div
                              className="flex h-7 w-7 items-center justify-center rounded-full flex-shrink-0 relative z-10"
                              style={{
                                backgroundColor: isCancelledState ? '#FEF2F2' : '#EFF6FF',
                                border: `2px solid ${isCancelledState ? '#DC2626' : '#1D4ED8'}`,
                              }}
                            >
                              {isCancelledState ? (
                                <XCircle style={{ width: 12, height: 12, color: '#DC2626' }} />
                              ) : (
                                <History style={{ width: 11, height: 11, color: '#1D4ED8' }} />
                              )}
                            </div>
                            <div className="flex-1 pb-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span style={{ fontSize: '13px', color: '#64748B' }}>Chuyển sang:</span>
                                <StatusBadge status={history.state} type="bidding" size="sm" />
                              </div>
                              <p style={{ fontSize: '12px', color: '#94A3B8', marginTop: '2px' }}>
                                {formatDateTime(history.changedAt)} • {user?.name ?? history.changedBy}
                              </p>
                              {history.note && (
                                <p style={{ fontSize: '12px', color: '#475569', marginTop: '4px', fontStyle: 'italic' }}>
                                  "{history.note}"
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Cancel Confirm Dialog */}
      <ConfirmDialog
        open={showCancelDialog}
        onClose={() => setShowCancelDialog(false)}
        onConfirm={handleCancel}
        title="Hủy chào hàng — Xác nhận hành động không thể hoàn tác"
        description="Chào hàng sẽ bị hủy vĩnh viễn. Toàn bộ báo giá và các bước tiếp theo sẽ bị vô hiệu. Hành động này KHÔNG THỂ hoàn tác."
        variant="destructive"
        requireReason
        reasonLabel="Lý do hủy chào hàng *"
        confirmLabel="Xác nhận hủy"
        cancelLabel="Quay lại"
      />

      {/* Select Winner Dialog */}
      <ConfirmDialog
        open={showSelectWinnerDialog}
        onClose={() => {
          setShowSelectWinnerDialog(false);
          setSelectedWinnerId(null);
        }}
        onConfirm={handleSelectWinner}
        title="Chọn nhà cung cấp"
        description="Xác nhận chọn nhà cung cấp này làm người trúng thầu?"
        variant="default"
        confirmLabel="Xác nhận"
        cancelLabel="Hủy"
      />
    </div>
  );
}

function InfoRow({ label, value, mono }: { label: string; value?: string; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span style={{ fontSize: '13px', color: '#94A3B8', flexShrink: 0, lineHeight: '1.5' }}>
        {label}
      </span>
      <span
        style={{
          fontSize: '13px',
          fontWeight: 500,
          color: '#1E293B',
          textAlign: 'right',
          lineHeight: '1.5',
          fontFamily: mono ? '"IBM Plex Mono", monospace' : 'inherit',
        }}
      >
        {value ?? '—'}
      </span>
    </div>
  );
}
