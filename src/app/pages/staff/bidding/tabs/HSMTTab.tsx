import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Textarea } from '../../../../components/ui/textarea';
import { AlertBanner } from '../../../../components/shared/AlertBanner';
import { ConfirmDialog } from '../../../../components/shared/ConfirmDialog';
import { UploadArea } from '../../../../components/shared/UploadArea';
import { storage } from '../../../../lib/storage';
import { formatDate, daysRemaining } from '../../../../lib/utils';
import { FileText, Plus, CheckCircle, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import type { BiddingProject, Document as BiddingDocument } from '../../../../lib/types';

interface HSMTTabProps {
  project: BiddingProject;
  onUpdate: (project: BiddingProject) => void;
}

interface HSMTVersion {
  id: string;
  version: number;
  content: string;
  status: 'draft' | 'pending_approval' | 'approved' | 'superseded';
  documents: BiddingDocument[];
  createdBy: string;
  createdAt: string;
  approvedBy?: string;
  approvedAt?: string;
  note?: string;
}

// Must match UploadArea's internal interface
interface UploadedFile {
  id: string;
  name: string;
  size: number;
  file?: File;
}

const VERSION_STATUS_LABELS: Record<string, { label: string; bg: string; color: string; border: string }> = {
  draft: { label: 'Nháp', bg: '#F1F5F9', color: '#475569', border: '#E2E8F0' },
  pending_approval: { label: 'Chờ duyệt', bg: '#FEF3C7', color: '#B45309', border: '#FDE68A' },
  approved: { label: 'Đã duyệt', bg: '#F0FDF4', color: '#15803D', border: '#BBF7D0' },
  superseded: { label: 'Đã thay thế', bg: '#F1F5F9', color: '#94A3B8', border: '#E2E8F0' },
};

const INITIAL_VERSION_CONTENT = `HỒ SƠ MỜI THẦU

PHẦN 1 — THÔNG TIN CHUNG
1.1. Tên gói thầu:
1.2. Chủ đầu tư:
1.3. Bên mời thầu:
1.4. Nguồn vốn:
1.5. Hình thức lựa chọn nhà thầu:

PHẦN 2 — YÊU CẦU KỸ THUẬT
2.1. Danh mục hàng hóa, dịch vụ:
2.2. Tiêu chuẩn kỹ thuật:
2.3. Yêu cầu về bảo hành:

PHẦN 3 — YÊU CẦU TÀI CHÍNH
3.1. Đơn giá dự toán:
3.2. Hình thức thanh toán:
3.3. Thời hạn thanh toán:

PHẦN 4 — TIÊU CHÍ ĐÁNH GIÁ
4.1. Tiêu chí kỹ thuật (70%):
4.2. Tiêu chí tài chính (30%):`;

export function HSMTTab({ project, onUpdate }: HSMTTabProps) {
  const currentUser = storage.getUsers()[0];

  const [versions, setVersions] = useState<HSMTVersion[]>(() => {
    if (!project.hsmt) return [];
    return [
      {
        id: 'hsmt-v1',
        version: 1,
        content: INITIAL_VERSION_CONTENT,
        status: project.hsmt.approvedBy ? 'approved' : 'draft',
        documents: project.hsmt.documents,
        createdBy: project.createdBy,
        createdAt: project.createdAt,
        approvedBy: project.hsmt.approvedBy,
        approvedAt: project.hsmt.approvedAt,
      },
    ];
  });

  const [expandedVersion, setExpandedVersion] = useState<string | null>(
    versions.length > 0 ? versions[0].id : null
  );
  const [editingVersionId, setEditingVersionId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newContent, setNewContent] = useState(INITIAL_VERSION_CONTENT);
  const [newNote, setNewNote] = useState('');
  const [newFiles, setNewFiles] = useState<UploadedFile[]>([]);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState<string | null>(null);
  const [showApproveConfirm, setShowApproveConfirm] = useState<string | null>(null);

  const daysToDeadline = project.deadlineDate ? daysRemaining(project.deadlineDate) : Infinity;
  const tooCloseToDeadline = daysToDeadline >= 0 && daysToDeadline <= 10;
  const approvedVersion = versions.find((v) => v.status === 'approved');
  const canApprove = ['admin', 'approver'].includes(currentUser?.role ?? '');
  const canEdit = !['cancelled', 'contract_signed'].includes(project.currentState);

  const handleSaveDraft = (versionId: string) => {
    setVersions((prev) => prev.map((v) => (v.id === versionId ? { ...v, content: editContent } : v)));
    setEditingVersionId(null);
  };

  const handleSubmitForApproval = (versionId: string) => {
    setVersions((prev) =>
      prev.map((v) => (v.id === versionId ? { ...v, status: 'pending_approval' } : v))
    );
    setShowSubmitConfirm(null);
  };

  const handleApprove = (versionId: string) => {
    setVersions((prev) =>
      prev.map((v) => {
        if (v.id === versionId)
          return { ...v, status: 'approved', approvedBy: currentUser?.id ?? 'user-1', approvedAt: new Date().toISOString() };
        if (v.status === 'approved') return { ...v, status: 'superseded' };
        return v;
      })
    );
    const updatedVersion = versions.find((v) => v.id === versionId);
    if (updatedVersion) {
      const updatedProject: BiddingProject = {
        ...project,
        hsmt: {
          documents: updatedVersion.documents,
          approvedBy: currentUser?.id ?? 'user-1',
          approvedAt: new Date().toISOString(),
        },
        currentState: 'approved_hsmt',
        stateHistory: [
          ...project.stateHistory,
          {
            state: 'approved_hsmt',
            changedBy: currentUser?.id ?? 'user-1',
            changedAt: new Date().toISOString(),
            note: `Phê duyệt HSMT phiên bản ${updatedVersion.version}`,
          },
        ],
      };
      storage.updateBiddingProject(project.id, updatedProject);
      onUpdate(updatedProject);
    }
    setShowApproveConfirm(null);
  };

  const handleCreateVersion = () => {
    const newVersionNum = (versions.at(-1)?.version ?? 0) + 1;
    const newDocs: BiddingDocument[] = newFiles
      .filter((f) => f.file)
      .map((f, i) => ({
        id: `hsmt-doc-${Date.now()}-${i}`,
        name: f.name,
        url: '#',
        size: f.size,
        uploadedBy: currentUser?.id ?? 'user-1',
        uploadedAt: new Date().toISOString(),
      }));

    const newVersion: HSMTVersion = {
      id: `hsmt-v${newVersionNum}-${Date.now()}`,
      version: newVersionNum,
      content: newContent,
      status: 'draft',
      documents: newDocs,
      createdBy: currentUser?.id ?? 'user-1',
      createdAt: new Date().toISOString(),
      note: newNote || undefined,
    };

    setVersions((prev) => [
      ...prev.map((v) => (v.status === 'draft' ? { ...v, status: 'superseded' as const } : v)),
      newVersion,
    ]);
    setExpandedVersion(newVersion.id);
    setShowCreateForm(false);
    setNewContent(INITIAL_VERSION_CONTENT);
    setNewNote('');
    setNewFiles([]);
  };

  return (
    <div className="space-y-4">
      {/* Deadline Warning */}
      {tooCloseToDeadline && project.deadlineDate && (
        <AlertBanner
          variant="warning"
          title="Sắp đến hạn nộp hồ sơ"
          message={`Không được phép sửa HSMT trong vòng 10 ngày trước hạn nộp (${formatDate(project.deadlineDate)}). Còn ${daysToDeadline} ngày.`}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p style={{ fontSize: '14px', fontWeight: 600, color: '#1E293B' }}>Lịch sử phiên bản HSMT</p>
          <p style={{ fontSize: '13px', color: '#64748B' }}>
            {versions.length} phiên bản •{' '}
            {approvedVersion
              ? `Phiên bản ${approvedVersion.version} đang có hiệu lực`
              : 'Chưa có phiên bản nào được duyệt'}
          </p>
        </div>
        {canEdit && !tooCloseToDeadline && (
          <Button
            onClick={() => setShowCreateForm(!showCreateForm)}
            style={{
              fontSize: '13px', fontWeight: 500, borderRadius: '6px',
              backgroundColor: '#1D4ED8', color: '#FFFFFF', padding: '8px 14px',
              display: 'flex', alignItems: 'center', gap: '6px',
            }}
          >
            <Plus style={{ width: 14, height: 14 }} />
            Tạo phiên bản mới
          </Button>
        )}
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle style={{ fontSize: '16px', fontWeight: 600, color: '#1E293B' }}>
              Soạn thảo phiên bản mới
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#475569', marginBottom: '6px' }}>
                Ghi chú thay đổi
              </label>
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Mô tả nội dung thay đổi..."
                rows={2}
                style={{
                  width: '100%', fontSize: '14px', padding: '10px 12px',
                  borderRadius: '6px', border: '1px solid #CBD5E1', resize: 'vertical',
                  color: '#1E293B', fontFamily: 'inherit',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#475569', marginBottom: '6px' }}>
                Nội dung HSMT *
              </label>
              <Textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                rows={12}
                style={{
                  fontSize: '13px', fontFamily: '"IBM Plex Mono", monospace', lineHeight: '1.6',
                  borderRadius: '6px', border: '1px solid #CBD5E1', resize: 'vertical',
                  backgroundColor: '#F8FAFC', color: '#1E293B',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#475569', marginBottom: '6px' }}>
                Tài liệu đính kèm
              </label>
              <UploadArea
                files={newFiles}
                onChange={setNewFiles}
                label="PDF, DOCX, XLSX"
                maxSizeMB={10}
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowCreateForm(false)}
                style={{ fontSize: '14px', fontWeight: 500, borderRadius: '6px', backgroundColor: '#F1F5F9', color: '#334155', border: '1px solid #CBD5E1', padding: '10px 16px' }}
              >
                Hủy
              </Button>
              <Button
                onClick={handleCreateVersion}
                disabled={!newContent.trim()}
                style={{ fontSize: '14px', fontWeight: 500, borderRadius: '6px', backgroundColor: '#1D4ED8', color: '#FFFFFF', padding: '10px 16px' }}
              >
                Lưu phiên bản nháp
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Versions List */}
      {versions.length === 0 ? (
        <Card>
          <CardContent className="py-10">
            <div className="flex flex-col items-center gap-3" style={{ color: '#94A3B8' }}>
              <FileText style={{ width: 40, height: 40 }} />
              <p style={{ fontSize: '14px', fontWeight: 500, color: '#64748B' }}>Chưa có HSMT nào</p>
              <p style={{ fontSize: '13px', color: '#94A3B8' }}>Tạo phiên bản đầu tiên để bắt đầu soạn thảo</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {[...versions].reverse().map((version) => {
            const badge = VERSION_STATUS_LABELS[version.status];
            const isExpanded = expandedVersion === version.id;
            const isEditing = editingVersionId === version.id;
            const createdByUser = storage.getUserById(version.createdBy);
            const approvedByUser = version.approvedBy ? storage.getUserById(version.approvedBy) : null;
            const isLatest = version.id === versions.at(-1)?.id;

            return (
              <Card
                key={version.id}
                style={{
                  border: `1px solid ${version.status === 'approved' ? '#BBF7D0' : '#E2E8F0'}`,
                  borderRadius: '8px',
                }}
              >
                {/* Header */}
                <div
                  className="flex items-center justify-between px-5 py-4 cursor-pointer"
                  onClick={() => setExpandedVersion(isExpanded ? null : version.id)}
                  style={{
                    backgroundColor:
                      version.status === 'approved' ? '#F0FDF4' :
                      version.status === 'pending_approval' ? '#FFFBEB' : '#FFFFFF',
                    borderRadius: isExpanded ? '8px 8px 0 0' : '8px',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-9 w-9 items-center justify-center rounded-full flex-shrink-0"
                      style={{
                        backgroundColor:
                          version.status === 'approved' ? '#F0FDF4' :
                          version.status === 'pending_approval' ? '#FEF3C7' : '#F1F5F9',
                      }}
                    >
                      {version.status === 'approved' ? (
                        <CheckCircle style={{ width: 18, height: 18, color: '#15803D' }} />
                      ) : version.status === 'pending_approval' ? (
                        <Clock style={{ width: 18, height: 18, color: '#B45309' }} />
                      ) : (
                        <FileText style={{ width: 18, height: 18, color: '#94A3B8' }} />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p style={{ fontSize: '14px', fontWeight: 600, color: '#1E293B' }}>
                          Phiên bản {version.version}
                        </p>
                        {isLatest && (
                          <span style={{ fontSize: '10px', fontWeight: 700, padding: '1px 6px', borderRadius: '4px', backgroundColor: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE' }}>
                            MỚI NHẤT
                          </span>
                        )}
                        <span style={{ fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '9999px', backgroundColor: badge.bg, color: badge.color, border: `1px solid ${badge.border}` }}>
                          {badge.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                        <p style={{ fontSize: '12px', color: '#64748B' }}>
                          Tạo bởi {createdByUser?.name} • {formatDate(version.createdAt)}
                        </p>
                        {version.approvedAt && approvedByUser && (
                          <p style={{ fontSize: '12px', color: '#15803D' }}>
                            • Duyệt: {approvedByUser.name} ({formatDate(version.approvedAt)})
                          </p>
                        )}
                        {version.note && (
                          <p style={{ fontSize: '12px', color: '#94A3B8', fontStyle: 'italic' }}>• {version.note}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp style={{ width: 16, height: 16, color: '#94A3B8', flexShrink: 0 }} />
                  ) : (
                    <ChevronDown style={{ width: 16, height: 16, color: '#94A3B8', flexShrink: 0 }} />
                  )}
                </div>

                {/* Expanded content */}
                {isExpanded && (
                  <div style={{ borderTop: '1px solid #E2E8F0', padding: '20px' }}>
                    {/* Content */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <p style={{ fontSize: '13px', fontWeight: 500, color: '#475569' }}>Nội dung HSMT</p>
                        {canEdit && version.status === 'draft' && !tooCloseToDeadline && !isEditing && (
                          <button
                            onClick={() => { setEditingVersionId(version.id); setEditContent(version.content); }}
                            style={{ fontSize: '13px', fontWeight: 500, color: '#1D4ED8', background: 'none', border: 'none', cursor: 'pointer' }}
                          >
                            Chỉnh sửa
                          </button>
                        )}
                      </div>
                      {isEditing ? (
                        <Textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          rows={12}
                          style={{
                            fontSize: '13px', fontFamily: '"IBM Plex Mono", monospace', lineHeight: '1.6',
                            borderRadius: '6px', border: '1px solid #3B82F6', boxShadow: '0 0 0 3px #EFF6FF',
                            resize: 'vertical', backgroundColor: '#F8FAFC', color: '#1E293B',
                          }}
                        />
                      ) : (
                        <pre style={{
                          fontSize: '13px', fontFamily: '"IBM Plex Mono", monospace', lineHeight: '1.6',
                          padding: '16px', borderRadius: '6px', backgroundColor: '#F8FAFC',
                          border: '1px solid #E2E8F0', color: '#1E293B', whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word', margin: 0,
                        }}>
                          {version.content}
                        </pre>
                      )}
                    </div>

                    {/* Documents */}
                    {version.documents.length > 0 && (
                      <div className="mb-4">
                        <p style={{ fontSize: '13px', fontWeight: 500, color: '#475569', marginBottom: '8px' }}>
                          Tài liệu đính kèm ({version.documents.length})
                        </p>
                        <div className="space-y-2">
                          {version.documents.map((doc) => (
                            <div key={doc.id} className="flex items-center justify-between px-3 py-2 rounded-md" style={{ backgroundColor: '#F1F5F9', border: '1px solid #E2E8F0' }}>
                              <div className="flex items-center gap-2">
                                <FileText style={{ width: 14, height: 14, color: '#64748B' }} />
                                <span style={{ fontSize: '13px', color: '#475569' }}>{doc.name}</span>
                                <span style={{ fontSize: '11px', color: '#94A3B8' }}>({Math.round(doc.size / 1024)} KB)</span>
                              </div>
                              <button style={{ fontSize: '12px', color: '#1D4ED8', background: 'none', border: 'none', cursor: 'pointer' }}>
                                Tải xuống
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end gap-3">
                      {isEditing && (
                        <>
                          <Button variant="outline" onClick={() => setEditingVersionId(null)} style={{ fontSize: '13px', fontWeight: 500, borderRadius: '6px', backgroundColor: '#F1F5F9', color: '#334155', border: '1px solid #CBD5E1', padding: '8px 14px' }}>
                            Hủy
                          </Button>
                          <Button onClick={() => handleSaveDraft(version.id)} style={{ fontSize: '13px', fontWeight: 500, borderRadius: '6px', backgroundColor: '#1D4ED8', color: '#FFFFFF', padding: '8px 14px' }}>
                            Lưu nháp
                          </Button>
                        </>
                      )}
                      {!isEditing && version.status === 'draft' && (
                        <Button onClick={() => setShowSubmitConfirm(version.id)} style={{ fontSize: '13px', fontWeight: 500, borderRadius: '6px', backgroundColor: '#1D4ED8', color: '#FFFFFF', padding: '8px 14px' }}>
                          Gửi phê duyệt
                        </Button>
                      )}
                      {!isEditing && version.status === 'pending_approval' && canApprove && (
                        <>
                          <Button variant="outline" onClick={() => setVersions((prev) => prev.map((v) => v.id === version.id ? { ...v, status: 'draft' } : v))} style={{ fontSize: '13px', fontWeight: 500, borderRadius: '6px', backgroundColor: '#F1F5F9', color: '#334155', border: '1px solid #CBD5E1', padding: '8px 14px' }}>
                            Trả về chỉnh sửa
                          </Button>
                          <Button onClick={() => setShowApproveConfirm(version.id)} style={{ fontSize: '13px', fontWeight: 500, borderRadius: '6px', backgroundColor: '#15803D', color: '#FFFFFF', padding: '8px 14px' }}>
                            Phê duyệt HSMT
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={!!showSubmitConfirm}
        onClose={() => setShowSubmitConfirm(null)}
        onConfirm={() => showSubmitConfirm && handleSubmitForApproval(showSubmitConfirm)}
        title="Gửi HSMT để phê duyệt"
        description="Hồ sơ mời thầu sẽ được gửi đến BGĐ để xem xét và phê duyệt. Sau khi gửi, bạn không thể chỉnh sửa cho đến khi BGĐ trả về."
        variant="warning"
        confirmLabel="Gửi phê duyệt"
        cancelLabel="Kiểm tra lại"
      />

      <ConfirmDialog
        open={!!showApproveConfirm}
        onClose={() => setShowApproveConfirm(null)}
        onConfirm={() => showApproveConfirm && handleApprove(showApproveConfirm)}
        title="Phê duyệt hồ sơ mời thầu"
        description="Phê duyệt HSMT này sẽ đánh dấu là phiên bản có hiệu lực. Trạng thái gói thầu sẽ chuyển sang 'HSMT đã duyệt'."
        variant="warning"
        confirmLabel="Xác nhận phê duyệt"
        cancelLabel="Hủy"
      />
    </div>
  );
}
