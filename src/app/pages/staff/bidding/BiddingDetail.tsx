import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { storage } from '../../../lib/storage';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { BiddingStateStepper } from '../../../components/shared/BiddingStateStepper';
import { StatusBadge } from '../../../components/shared/StatusBadge';
import { AlertBanner } from '../../../components/shared/AlertBanner';
import { ConfirmDialog } from '../../../components/shared/ConfirmDialog';

// Tab components
import { ComplaintTab } from './tabs/ComplaintTab';
import { EvaluationTab } from './tabs/EvaluationTab';
import { CouncilTab } from './tabs/CouncilTab';
import { HSMTTab } from './tabs/HSMTTab';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { ArrowLeft, FileText, Users, Gavel, ClipboardList, MessageSquare, History, XCircle } from 'lucide-react';
import { formatCurrency, formatDate, formatDateTime, daysRemaining } from '../../../lib/utils';
import { BIDDING_METHODS } from '../../../lib/constants';
import type { BiddingProject } from '../../../lib/types';

export function BiddingDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<BiddingProject | null>(null);
  const [standstillDays, setStandstillDays] = useState<number>(0);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const loadProject = useCallback(() => {
    if (!id) return;
    const foundProject = storage.getBiddingProjectById(id);
    setProject(foundProject || null);
    if (foundProject?.standstillEndDate) {
      const days = daysRemaining(foundProject.standstillEndDate);
      setStandstillDays(days);
    }
  }, [id]);

  useEffect(() => {
    loadProject();
  }, [loadProject]);

  const handleProjectUpdate = (updated: BiddingProject) => {
    setProject(updated);
    if (updated.standstillEndDate) {
      setStandstillDays(daysRemaining(updated.standstillEndDate));
    }
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
          note: reason ?? 'Hủy gói thầu',
        },
      ],
    };
    storage.updateBiddingProject(project.id, updated);
    handleProjectUpdate(updated);
    setShowCancelDialog(false);
  };

  if (!project) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p style={{ fontSize: '18px', fontWeight: 600, color: '#1E293B' }}>Không tìm thấy gói thầu</p>
          <Button
            onClick={() => navigate('/staff/bidding')}
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
  const pendingComplaints = project.complaints.filter((c) => !c.resolution).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => navigate('/staff/bidding')}
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
                {BIDDING_METHODS[project.method]?.label ?? project.method}
              </span>
              <span style={{ fontSize: '13px', color: '#94A3B8' }}>•</span>
              <span style={{ fontSize: '13px', fontFamily: '"IBM Plex Mono", monospace', color: '#64748B' }}>
                {formatCurrency(project.estimatedValue)}
              </span>
            </div>
          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
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
                Hủy gói thầu
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Cancelled Banner */}
      {isCancelled && (
        <AlertBanner
          variant="error"
          title="Gói thầu đã bị hủy"
          message="Gói thầu này đã được hủy và không thể tiếp tục thực hiện."
        />
      )}

      {/* Standstill + Complaint Banner */}
      {project.currentState === 'standstill' && pendingComplaints > 0 && (
        <AlertBanner
          variant="error"
          title={`Có ${pendingComplaints} khiếu nại chờ xử lý`}
          message="Gói thầu đang trong giai đoạn standstill và có khiếu nại chưa được xử lý. Xem tab 'Khiếu nại' để xử lý."
        />
      )}

      {/* Standstill Countdown */}
      {project.currentState === 'standstill' && project.standstillEndDate && standstillDays > 0 && pendingComplaints === 0 && (
        <AlertBanner
          variant="warning"
          title="Giai đoạn chờ phản đối (Standstill)"
          message={`Còn ${standstillDays} ngày đến ${formatDate(project.standstillEndDate)}. Trong thời gian này, nhà thầu không trúng có thể nộp khiếu nại.`}
        />
      )}

      {/* 3-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Info + Stepper (1/3) */}
        <div className="space-y-4">
          {/* Project Info Card */}
          <Card style={{ border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(15,23,42,0.08)', borderRadius: '8px' }}>
            <CardHeader style={{ padding: '16px 20px 12px' }}>
              <CardTitle style={{ fontSize: '14px', fontWeight: 600, color: '#475569' }}>
                Thông tin cơ bản
              </CardTitle>
            </CardHeader>
            <CardContent style={{ padding: '0 20px 16px' }}>
              <div className="space-y-3">
                <InfoRow label="Phương thức" value={BIDDING_METHODS[project.method]?.label} />
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
                  <InfoRow label="Hạn nộp hồ sơ" value={formatDate(project.deadlineDate)} />
                )}
                {project.openingDate && (
                  <InfoRow label="Ngày mở thầu" value={formatDateTime(project.openingDate)} />
                )}
                {project.standstillStartDate && (
                  <InfoRow label="Bắt đầu standstill" value={formatDate(project.standstillStartDate)} />
                )}
                {project.standstillEndDate && (
                  <InfoRow label="Kết thúc standstill" value={formatDate(project.standstillEndDate)} />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Stepper */}
          <Card style={{ border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(15,23,42,0.08)', borderRadius: '8px' }}>
            <CardHeader style={{ padding: '16px 20px 12px' }}>
              <CardTitle style={{ fontSize: '14px', fontWeight: 600, color: '#475569' }}>
                Tiến trình (Luật 2023)
              </CardTitle>
            </CardHeader>
            <CardContent style={{ padding: '0 20px 16px' }}>
              <BiddingStateStepper
                currentState={project.currentState}
                stateHistory={project.stateHistory}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Tabs (2/3) */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="info" className="space-y-4">
            <TabsList
              style={{
                backgroundColor: '#F1F5F9',
                borderRadius: '8px',
                padding: '4px',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '2px',
                height: 'auto',
              }}
            >
              <TabsTrigger value="info" style={{ fontSize: '13px', borderRadius: '6px' }}>
                <FileText style={{ width: 14, height: 14, marginRight: '6px' }} />
                Thông tin
              </TabsTrigger>
              <TabsTrigger value="hsmt" style={{ fontSize: '13px', borderRadius: '6px' }}>
                <FileText style={{ width: 14, height: 14, marginRight: '6px' }} />
                HSMT
              </TabsTrigger>
              <TabsTrigger value="expert-council" style={{ fontSize: '13px', borderRadius: '6px' }}>
                <Users style={{ width: 14, height: 14, marginRight: '6px' }} />
                HĐ Chuyên môn
              </TabsTrigger>
              <TabsTrigger value="eval-council" style={{ fontSize: '13px', borderRadius: '6px' }}>
                <Users style={{ width: 14, height: 14, marginRight: '6px' }} />
                HĐ Thẩm định
              </TabsTrigger>
              <TabsTrigger value="bids" style={{ fontSize: '13px', borderRadius: '6px' }}>
                <Gavel style={{ width: 14, height: 14, marginRight: '6px' }} />
                Dự thầu ({project.bids.length})
              </TabsTrigger>
              <TabsTrigger value="evaluation" style={{ fontSize: '13px', borderRadius: '6px' }}>
                <ClipboardList style={{ width: 14, height: 14, marginRight: '6px' }} />
                Đánh giá 3 pha
              </TabsTrigger>
              <TabsTrigger value="complaints" style={{ fontSize: '13px', borderRadius: '6px' }}>
                <MessageSquare style={{ width: 14, height: 14, marginRight: '6px' }} />
                Khiếu nại
                {pendingComplaints > 0 && (
                  <span
                    style={{
                      marginLeft: '6px',
                      fontSize: '10px',
                      fontWeight: 700,
                      padding: '1px 5px',
                      borderRadius: '9999px',
                      backgroundColor: '#DC2626',
                      color: '#FFFFFF',
                    }}
                  >
                    {pendingComplaints}
                  </span>
                )}
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
                    Mô tả gói thầu
                  </CardTitle>
                </CardHeader>
                <CardContent style={{ padding: '0 20px 20px' }}>
                  <p style={{ fontSize: '14px', color: '#475569', lineHeight: '1.6' }}>
                    {project.description}
                  </p>
                </CardContent>
              </Card>

              {/* Quick stats */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Hồ sơ dự thầu', value: project.bids.length },
                  {
                    label: 'Đã đánh giá',
                    value: project.bids.filter((b) => b.evaluatedAt).length,
                  },
                  { label: 'Khiếu nại', value: project.complaints.length },
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

            {/* Tab: HSMT */}
            <TabsContent value="hsmt">
              <HSMTTab project={project} onUpdate={handleProjectUpdate} />
            </TabsContent>

            {/* Tab: Expert Council */}
            <TabsContent value="expert-council">
              <CouncilTab
                project={project}
                councilType="expert"
                onUpdate={handleProjectUpdate}
              />
            </TabsContent>

            {/* Tab: Evaluation Council */}
            <TabsContent value="eval-council">
              <CouncilTab
                project={project}
                councilType="evaluation"
                onUpdate={handleProjectUpdate}
              />
            </TabsContent>

            {/* Tab: Bids */}
            <TabsContent value="bids" className="space-y-4">
              <Card style={{ border: '1px solid #E2E8F0', borderRadius: '8px' }}>
                <CardHeader style={{ padding: '16px 20px 12px' }}>
                  <CardTitle style={{ fontSize: '16px', fontWeight: 600, color: '#1E293B' }}>
                    Danh sách hồ sơ dự thầu
                  </CardTitle>
                </CardHeader>
                <CardContent style={{ padding: '0' }}>
                  {project.bids.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow style={{ backgroundColor: '#F1F5F9' }}>
                          {['Nhà cung cấp', 'Ngày nộp', 'Điểm KT', 'Điểm TC', 'Tổng điểm', 'Trạng thái'].map(
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
                                    TRÚNG THẦU
                                  </span>
                                )}
                              </TableCell>
                              <TableCell style={{ fontSize: '13px', color: '#475569', padding: '12px 16px' }}>
                                {formatDateTime(bid.submittedAt)}
                              </TableCell>
                              <TableCell style={{ textAlign: 'center', fontFamily: '"IBM Plex Mono", monospace', fontSize: '14px', padding: '12px 16px' }}>
                                {bid.technicalScore ?? '—'}
                              </TableCell>
                              <TableCell style={{ textAlign: 'center', fontFamily: '"IBM Plex Mono", monospace', fontSize: '14px', padding: '12px 16px' }}>
                                {bid.priceScore ?? '—'}
                              </TableCell>
                              <TableCell style={{ textAlign: 'center', fontFamily: '"IBM Plex Mono", monospace', fontSize: '15px', fontWeight: 700, color: isWinner ? '#D97706' : '#1E293B', padding: '12px 16px' }}>
                                {bid.totalScore?.toFixed(1) ?? '—'}
                              </TableCell>
                              <TableCell style={{ padding: '12px 16px' }}>
                                <StatusBadge
                                  status={
                                    bid.status === 'winner'
                                      ? 'contract_signed'
                                      : bid.status === 'rejected'
                                      ? 'cancelled'
                                      : bid.status === 'evaluated'
                                      ? 'approved'
                                      : 'submitted'
                                  }
                                  type="budget"
                                  size="sm"
                                />
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
                        Chưa có hồ sơ dự thầu
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab: Evaluation */}
            <TabsContent value="evaluation">
              <EvaluationTab project={project} onUpdate={handleProjectUpdate} />
            </TabsContent>

            {/* Tab: Complaints */}
            <TabsContent value="complaints">
              <ComplaintTab project={project} onUpdate={handleProjectUpdate} />
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
                    {/* Timeline connector */}
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
        title="Hủy gói thầu — Xác nhận hành động không thể hoàn tác"
        description="Gói thầu sẽ bị hủy vĩnh viễn. Toàn bộ hồ sơ dự thầu, kết quả đánh giá và các bước tiếp theo sẽ bị vô hiệu. Hành động này KHÔNG THỂ hoàn tác."
        variant="destructive"
        requireReason
        reasonLabel="Lý do hủy gói thầu *"
        confirmLabel="Xác nhận hủy gói thầu"
        cancelLabel="Quay lại"
      />
    </div>
  );
}

// ─── Helper component ────────────────────────────────────────────────────────
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