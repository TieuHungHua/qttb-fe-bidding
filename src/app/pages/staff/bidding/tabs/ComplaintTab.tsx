import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Textarea } from '../../../../components/ui/textarea';
import { AlertBanner } from '../../../../components/shared/AlertBanner';
import { ConfirmDialog } from '../../../../components/shared/ConfirmDialog';
import { StatusBadge } from '../../../../components/shared/StatusBadge';
import { EmptyState } from '../../../../components/shared/EmptyState';
import { storage } from '../../../../lib/storage';
import { formatDateTime } from '../../../../lib/utils';
import { FileText, CheckCircle, XCircle, MinusCircle, MessageSquare } from 'lucide-react';
import type { BiddingProject, Complaint } from '../../../../lib/types';

interface ComplaintTabProps {
  project: BiddingProject;
  onUpdate: (project: BiddingProject) => void;
}

type Resolution = 'accepted' | 'rejected' | 'partial';

const RESOLUTION_OPTIONS: { value: Resolution; label: string; icon: typeof CheckCircle; color: string }[] = [
  { value: 'accepted', label: 'Chấp nhận khiếu nại', icon: CheckCircle, color: '#DC2626' },
  { value: 'rejected', label: 'Bác bỏ khiếu nại', icon: XCircle, color: '#15803D' },
  { value: 'partial', label: 'Chấp nhận một phần', icon: MinusCircle, color: '#B45309' },
];

const RESOLUTION_BADGE: Record<Resolution, { label: string; bg: string; color: string; border: string }> = {
  accepted: { label: 'Đã chấp nhận', bg: '#FEF2F2', color: '#DC2626', border: '#FECACA' },
  rejected: { label: 'Đã bác bỏ', bg: '#F0FDF4', color: '#15803D', border: '#BBF7D0' },
  partial: { label: 'Chấp nhận một phần', bg: '#FFFBEB', color: '#B45309', border: '#FDE68A' },
};

export function ComplaintTab({ project, onUpdate }: ComplaintTabProps) {
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedResolution, setSelectedResolution] = useState<Resolution | null>(null);
  const [resolutionNote, setResolutionNote] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  const resetForm = () => {
    setProcessingId(null);
    setSelectedResolution(null);
    setResolutionNote('');
  };

  const handleStartProcess = (complaintId: string) => {
    if (processingId === complaintId) {
      resetForm();
    } else {
      setProcessingId(complaintId);
      setSelectedResolution(null);
      setResolutionNote('');
    }
  };

  const handleSubmit = () => {
    if (!processingId || !selectedResolution || !resolutionNote.trim()) return;
    setShowConfirm(true);
  };

  const handleConfirm = () => {
    if (!processingId || !selectedResolution) return;

    const updatedComplaints = project.complaints.map((c) => {
      if (c.id !== processingId) return c;
      return {
        ...c,
        resolution: selectedResolution,
        resolutionNote: resolutionNote.trim(),
        resolvedBy: 'user-1',
        resolvedAt: new Date().toISOString(),
      };
    });

    let updatedProject: BiddingProject = {
      ...project,
      complaints: updatedComplaints,
    };

    // If accepted → auto-cancel the bidding project
    if (selectedResolution === 'accepted') {
      updatedProject = {
        ...updatedProject,
        currentState: 'cancelled',
        stateHistory: [
          ...project.stateHistory,
          {
            state: 'cancelled',
            changedBy: 'user-1',
            changedAt: new Date().toISOString(),
            note: `Tự động hủy do khiếu nại được chấp nhận. Lý do: ${resolutionNote.trim()}`,
          },
        ],
      };
    }

    storage.updateBiddingProject(project.id, updatedProject);
    onUpdate(updatedProject);
    setShowConfirm(false);
    resetForm();
  };

  const complaints = project.complaints;
  const isAccepted = selectedResolution === 'accepted';
  const canSubmit = selectedResolution !== null && resolutionNote.trim().length > 0;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle style={{ fontSize: '16px', fontWeight: 600, color: '#1E293B' }}>
              Danh sách khiếu nại ({complaints.length})
            </CardTitle>
            {complaints.filter((c) => !c.resolution).length > 0 && (
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  backgroundColor: '#FEF2F2',
                  color: '#DC2626',
                  border: '1px solid #FECACA',
                }}
              >
                {complaints.filter((c) => !c.resolution).length} chờ xử lý
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {complaints.length === 0 ? (
            <EmptyState
              icon={<MessageSquare style={{ width: 40, height: 40, color: '#94A3B8' }} />}
              title="Không có khiếu nại"
              description="Không có khiếu nại nào được ghi nhận cho gói thầu này."
            />
          ) : (
            <div className="space-y-4">
              {complaints.map((complaint) => {
                const supplier = storage.getSupplierById(complaint.supplierId);
                const isProcessing = processingId === complaint.id;
                const hasResolution = !!complaint.resolution;
                const badge = hasResolution ? RESOLUTION_BADGE[complaint.resolution as Resolution] : null;

                return (
                  <div
                    key={complaint.id}
                    style={{
                      border: '1px solid #E2E8F0',
                      borderRadius: '8px',
                      overflow: 'hidden',
                    }}
                  >
                    {/* Complaint Header */}
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                            <p style={{ fontSize: '14px', fontWeight: 600, color: '#1E293B' }}>
                              {supplier?.companyName ?? 'Nhà cung cấp không xác định'}
                            </p>
                            {badge && (
                              <span
                                style={{
                                  fontSize: '11px',
                                  fontWeight: 600,
                                  padding: '2px 8px',
                                  borderRadius: '9999px',
                                  backgroundColor: badge.bg,
                                  color: badge.color,
                                  border: `1px solid ${badge.border}`,
                                }}
                              >
                                {badge.label}
                              </span>
                            )}
                            {!hasResolution && (
                              <span
                                style={{
                                  fontSize: '11px',
                                  fontWeight: 600,
                                  padding: '2px 8px',
                                  borderRadius: '9999px',
                                  backgroundColor: '#FEF3C7',
                                  color: '#B45309',
                                  border: '1px solid #FDE68A',
                                }}
                              >
                                Chờ xử lý
                              </span>
                            )}
                          </div>
                          <p style={{ fontSize: '12px', color: '#64748B' }}>
                            Ngày nộp: {formatDateTime(complaint.submittedAt)}
                          </p>
                        </div>
                        {!hasResolution && project.currentState !== 'cancelled' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStartProcess(complaint.id)}
                            style={{
                              fontSize: '13px',
                              fontWeight: 500,
                              borderRadius: '6px',
                              backgroundColor: isProcessing ? '#F1F5F9' : '#FFFFFF',
                              borderColor: '#CBD5E1',
                              color: '#334155',
                              flexShrink: 0,
                            }}
                          >
                            {isProcessing ? 'Đóng' : 'Xử lý khiếu nại'}
                          </Button>
                        )}
                      </div>

                      {/* Complaint Content */}
                      <div
                        className="mt-3 p-3 rounded-md"
                        style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}
                      >
                        <p style={{ fontSize: '13px', color: '#475569', lineHeight: '1.6' }}>
                          {complaint.content}
                        </p>
                      </div>

                      {/* Documents */}
                      {complaint.documents.length > 0 && (
                        <div className="mt-3">
                          <p style={{ fontSize: '12px', fontWeight: 500, color: '#475569', marginBottom: '6px' }}>
                            Tài liệu đính kèm:
                          </p>
                          <div className="space-y-1">
                            {complaint.documents.map((doc) => (
                              <div
                                key={doc.id}
                                className="flex items-center gap-2 px-3 py-2 rounded-md"
                                style={{ backgroundColor: '#F1F5F9' }}
                              >
                                <FileText style={{ width: 14, height: 14, color: '#64748B' }} />
                                <span style={{ fontSize: '13px', color: '#475569' }}>{doc.name}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Resolution Note */}
                      {hasResolution && complaint.resolutionNote && (
                        <div
                          className="mt-3 p-3 rounded-md"
                          style={{ backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0' }}
                        >
                          <p style={{ fontSize: '12px', fontWeight: 600, color: '#15803D', marginBottom: '4px' }}>
                            Kết quả xử lý:
                          </p>
                          <p style={{ fontSize: '13px', color: '#1E293B' }}>{complaint.resolutionNote}</p>
                        </div>
                      )}
                    </div>

                    {/* Processing Form (expanded inline) */}
                    {isProcessing && (
                      <div
                        style={{
                          borderTop: '1px solid #E2E8F0',
                          backgroundColor: '#FAFBFC',
                          padding: '20px',
                        }}
                      >
                        <p
                          style={{
                            fontSize: '14px',
                            fontWeight: 600,
                            color: '#1E293B',
                            marginBottom: '16px',
                          }}
                        >
                          Xử lý khiếu nại
                        </p>

                        {/* Resolution Options */}
                        <div className="space-y-3 mb-4">
                          <p style={{ fontSize: '13px', fontWeight: 500, color: '#475569', marginBottom: '8px' }}>
                            Kết quả xử lý *
                          </p>
                          {RESOLUTION_OPTIONS.map((opt) => {
                            const isSelected = selectedResolution === opt.value;
                            const Icon = opt.icon;
                            return (
                              <label
                                key={opt.value}
                                className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors"
                                style={{
                                  border: `1px solid ${isSelected ? opt.color : '#E2E8F0'}`,
                                  backgroundColor: isSelected ? `${opt.color}10` : '#FFFFFF',
                                }}
                              >
                                <input
                                  type="radio"
                                  name={`resolution-${complaint.id}`}
                                  value={opt.value}
                                  checked={isSelected}
                                  onChange={() => setSelectedResolution(opt.value)}
                                  style={{ accentColor: opt.color }}
                                />
                                <Icon style={{ width: 16, height: 16, color: opt.color, flexShrink: 0 }} />
                                <span style={{ fontSize: '14px', color: '#1E293B', fontWeight: isSelected ? 500 : 400 }}>
                                  {opt.label}
                                </span>
                              </label>
                            );
                          })}
                        </div>

                        {/* Destructive Warning for "Chấp nhận" */}
                        {isAccepted && (
                          <div className="mb-4">
                            <AlertBanner
                              variant="error"
                              title="CẢNH BÁO: Hành động không thể hoàn tác"
                              message="Chấp nhận khiếu nại sẽ TỰ ĐỘNG HỦY gói thầu này. Toàn bộ hồ sơ dự thầu và kết quả đánh giá sẽ bị vô hiệu hóa. Hành động này không thể hoàn tác."
                            />
                          </div>
                        )}

                        {/* Reason Textarea */}
                        <div className="mb-4">
                          <label
                            htmlFor={`reason-${complaint.id}`}
                            style={{
                              display: 'block',
                              fontSize: '13px',
                              fontWeight: 500,
                              color: '#475569',
                              marginBottom: '6px',
                            }}
                          >
                            Lý do xử lý *
                          </label>
                          <Textarea
                            id={`reason-${complaint.id}`}
                            value={resolutionNote}
                            onChange={(e) => setResolutionNote(e.target.value)}
                            placeholder="Nhập lý do xử lý chi tiết..."
                            rows={4}
                            style={{
                              fontSize: '14px',
                              borderColor: resolutionNote.trim() ? '#94A3B8' : '#CBD5E1',
                              borderRadius: '6px',
                              resize: 'none',
                              backgroundColor: '#FFFFFF',
                            }}
                          />
                          {!resolutionNote.trim() && (
                            <p style={{ fontSize: '12px', color: '#94A3B8', marginTop: '4px' }}>
                              Bắt buộc nhập lý do xử lý
                            </p>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-3">
                          <Button
                            variant="outline"
                            onClick={resetForm}
                            style={{
                              fontSize: '14px',
                              fontWeight: 500,
                              borderRadius: '6px',
                              backgroundColor: '#F1F5F9',
                              color: '#334155',
                              border: '1px solid #CBD5E1',
                              padding: '10px 16px',
                            }}
                          >
                            Hủy
                          </Button>
                          <Button
                            onClick={handleSubmit}
                            disabled={!canSubmit}
                            style={{
                              fontSize: '14px',
                              fontWeight: 500,
                              borderRadius: '6px',
                              backgroundColor: isAccepted ? '#DC2626' : '#1D4ED8',
                              color: '#FFFFFF',
                              padding: '10px 16px',
                              opacity: !canSubmit ? 0.5 : 1,
                              cursor: !canSubmit ? 'not-allowed' : 'pointer',
                            }}
                          >
                            {isAccepted ? 'Xác nhận hủy gói thầu' : 'Lưu kết quả xử lý'}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleConfirm}
        title={
          isAccepted
            ? 'Xác nhận chấp nhận khiếu nại — gói thầu sẽ bị hủy'
            : 'Xác nhận xử lý khiếu nại'
        }
        description={
          isAccepted
            ? 'Bạn đang chấp nhận khiếu nại này. Hệ thống sẽ TỰ ĐỘNG HỦY gói thầu ngay lập tức. Toàn bộ hồ sơ dự thầu và kết quả đánh giá sẽ vô hiệu. Hành động này KHÔNG THỂ hoàn tác.'
            : 'Kết quả xử lý khiếu nại sẽ được lưu và thông báo đến nhà cung cấp. Bạn có chắc chắn muốn tiếp tục?'
        }
        variant={isAccepted ? 'destructive' : 'warning'}
        confirmLabel={isAccepted ? 'Xác nhận hủy gói thầu' : 'Lưu kết quả'}
        cancelLabel="Quay lại kiểm tra"
      />
    </div>
  );
}
