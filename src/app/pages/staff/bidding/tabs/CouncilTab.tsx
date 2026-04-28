import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { AlertBanner } from '../../../../components/shared/AlertBanner';
import { ConfirmDialog } from '../../../../components/shared/ConfirmDialog';
import { storage } from '../../../../lib/storage';
import { formatDate } from '../../../../lib/utils';
import { UserPlus, Trash2, ShieldAlert, Users, X } from 'lucide-react';
import type { BiddingProject, CouncilMember, User, UserRole } from '../../../../lib/types';

interface CouncilTabProps {
  project: BiddingProject;
  councilType: 'expert' | 'evaluation';
  onUpdate: (project: BiddingProject) => void;
}

type MemberRole = 'chairman' | 'member' | 'secretary';

const ROLE_LABELS: Record<MemberRole, string> = {
  chairman: 'Chủ tịch hội đồng',
  member: 'Thành viên',
  secretary: 'Thư ký',
};

const ELIGIBLE_ROLES: UserRole[] = [
  'admin',
  'equipment_manager',
  'accountant',
  'council_expert',
  'council_evaluator',
  'approver',
];

const ROLE_DISPLAY: Record<string, string> = {
  admin: 'Quản trị viên',
  equipment_manager: 'Quản lý thiết bị',
  accountant: 'Kế toán',
  council_expert: 'Chuyên gia hội đồng',
  council_evaluator: 'Thẩm định viên',
  approver: 'Người phê duyệt',
};

export function CouncilTab({ project, councilType, onUpdate }: CouncilTabProps) {
  const isExpert = councilType === 'expert';
  const councilTitle = isExpert ? 'Hội đồng chuyên môn' : 'Hội đồng thẩm định';
  const currentCouncil = isExpert ? project.expertCouncil : project.evaluationCouncil;
  const otherCouncil = isExpert ? project.evaluationCouncil : project.expertCouncil;

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<MemberRole>('member');
  const [removingMember, setRemovingMember] = useState<string | null>(null);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  const allUsers = storage.getUsers().filter((u) => ELIGIBLE_ROLES.includes(u.role));
  const otherCouncilUserIds = new Set(otherCouncil.map((m) => m.userId));
  const currentCouncilUserIds = new Set(currentCouncil.map((m) => m.userId));

  // Check NĐ9 conflicts: users in both councils
  const conflicts = currentCouncil.filter((m) => otherCouncilUserIds.has(m.userId));
  const hasNd9Violation = conflicts.length > 0;

  const handleAddMember = () => {
    if (!selectedUserId) return;

    const newMember: CouncilMember = {
      id: `${councilType}-${Date.now()}`,
      userId: selectedUserId,
      role: selectedRole,
      assignedAt: new Date().toISOString(),
    };

    const updatedProject: BiddingProject = {
      ...project,
      expertCouncil: isExpert ? [...project.expertCouncil, newMember] : project.expertCouncil,
      evaluationCouncil: !isExpert ? [...project.evaluationCouncil, newMember] : project.evaluationCouncil,
    };

    storage.updateBiddingProject(project.id, updatedProject);
    onUpdate(updatedProject);
    setShowAddModal(false);
    setSelectedUserId(null);
    setSelectedRole('member');
  };

  const handleRemoveMember = () => {
    if (!removingMember) return;

    const filteredCouncil = currentCouncil.filter((m) => m.id !== removingMember);
    const updatedProject: BiddingProject = {
      ...project,
      expertCouncil: isExpert ? filteredCouncil : project.expertCouncil,
      evaluationCouncil: !isExpert ? filteredCouncil : project.evaluationCouncil,
    };

    storage.updateBiddingProject(project.id, updatedProject);
    onUpdate(updatedProject);
    setRemovingMember(null);
    setShowRemoveConfirm(false);
  };

  const canEdit = !['cancelled', 'contract_signed', 'winner_announced'].includes(project.currentState);
  const selectedUserConflict = selectedUserId ? otherCouncilUserIds.has(selectedUserId) : false;
  const selectedUserAlready = selectedUserId ? currentCouncilUserIds.has(selectedUserId) : false;

  return (
    <div className="space-y-4">
      {/* NĐ9 Independence Notice */}
      <AlertBanner
        variant="info"
        title="Yêu cầu độc lập theo Nghị định 9/2024/NĐ-CP"
        message="Hội đồng thẩm định phải hoàn toàn độc lập với Hội đồng chuyên môn. Không được phép có thành viên trùng lặp giữa hai hội đồng."
      />

      {/* NĐ9 Violation Warning */}
      {hasNd9Violation && (
        <div
          className="flex items-start gap-3 p-4 rounded-lg"
          style={{
            backgroundColor: '#FEF2F2',
            border: '2px solid #DC2626',
            borderRadius: '8px',
          }}
        >
          <ShieldAlert style={{ width: 20, height: 20, color: '#DC2626', flexShrink: 0, marginTop: '2px' }} />
          <div>
            <p style={{ fontSize: '14px', fontWeight: 700, color: '#991B1B', marginBottom: '4px' }}>
              ⚠️ VI PHẠM NGHỊ ĐỊNH 9 — Phát hiện thành viên trùng lặp!
            </p>
            <p style={{ fontSize: '13px', color: '#7F1D1D', lineHeight: '1.5' }}>
              Các thành viên sau đang xuất hiện trong cả hai hội đồng, vi phạm yêu cầu độc lập:
            </p>
            <ul className="mt-2 space-y-1">
              {conflicts.map((m) => {
                const user = storage.getUserById(m.userId);
                return (
                  <li
                    key={m.id}
                    style={{ fontSize: '13px', fontWeight: 600, color: '#DC2626' }}
                  >
                    • {user?.name} ({ROLE_DISPLAY[user?.role ?? ''] ?? user?.role})
                  </li>
                );
              })}
            </ul>
            <p style={{ fontSize: '12px', color: '#7F1D1D', marginTop: '8px', fontStyle: 'italic' }}>
              Vui lòng loại bỏ các thành viên trùng lặp trước khi tiến hành đánh giá.
            </p>
          </div>
        </div>
      )}

      {/* Council Members Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users style={{ width: 18, height: 18, color: '#475569' }} />
              <CardTitle style={{ fontSize: '16px', fontWeight: 600, color: '#1E293B' }}>
                {councilTitle}
              </CardTitle>
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  backgroundColor: '#F1F5F9',
                  color: '#475569',
                  border: '1px solid #E2E8F0',
                }}
              >
                {currentCouncil.length} thành viên
              </span>
            </div>
            {canEdit && (
              <Button
                onClick={() => setShowAddModal(true)}
                style={{
                  fontSize: '13px',
                  fontWeight: 500,
                  borderRadius: '6px',
                  backgroundColor: '#1D4ED8',
                  color: '#FFFFFF',
                  padding: '8px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <UserPlus style={{ width: 14, height: 14 }} />
                Thêm thành viên
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {currentCouncil.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-10 gap-3"
              style={{ color: '#94A3B8' }}
            >
              <Users style={{ width: 36, height: 36 }} />
              <p style={{ fontSize: '14px', fontWeight: 500, color: '#64748B' }}>
                Chưa có thành viên nào
              </p>
              <p style={{ fontSize: '13px', color: '#94A3B8' }}>
                Bổ nhiệm thành viên vào {councilTitle}
              </p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#F1F5F9' }}>
                  {['Họ tên', 'Chức danh', 'Vai trò trong HĐ', 'Ngày bổ nhiệm', ''].map((h) => (
                    <th
                      key={h}
                      style={{
                        textAlign: 'left',
                        padding: '10px 16px',
                        fontSize: '13px',
                        fontWeight: 500,
                        color: '#475569',
                        borderBottom: '1px solid #E2E8F0',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentCouncil.map((member, idx) => {
                  const user = storage.getUserById(member.userId);
                  const isConflict = otherCouncilUserIds.has(member.userId);
                  const isHovered = hoveredRow === member.id;

                  return (
                    <tr
                      key={member.id}
                      onMouseEnter={() => setHoveredRow(member.id)}
                      onMouseLeave={() => setHoveredRow(null)}
                      style={{
                        backgroundColor: isConflict
                          ? '#FEF2F2'
                          : isHovered
                          ? '#F1F5F9'
                          : idx % 2 === 0
                          ? '#FFFFFF'
                          : '#F8FAFC',
                        transition: 'background-color 80ms',
                      }}
                    >
                      <td style={{ padding: '12px 16px', borderBottom: '1px solid #E2E8F0' }}>
                        <div className="flex items-center gap-3">
                          <div
                            className="flex h-8 w-8 items-center justify-center rounded-full flex-shrink-0"
                            style={{ backgroundColor: '#EFF6FF', fontSize: '12px', fontWeight: 600, color: '#1D4ED8' }}
                          >
                            {user?.name?.charAt(0) ?? '?'}
                          </div>
                          <div>
                            <p style={{ fontSize: '14px', fontWeight: 500, color: '#1E293B' }}>
                              {user?.name}
                            </p>
                            <p style={{ fontSize: '12px', color: '#64748B' }}>{user?.email}</p>
                          </div>
                          {isConflict && (
                            <span
                              style={{
                                fontSize: '11px',
                                fontWeight: 600,
                                padding: '2px 6px',
                                borderRadius: '4px',
                                backgroundColor: '#FEF2F2',
                                color: '#DC2626',
                                border: '1px solid #FECACA',
                              }}
                            >
                              ⚠ Vi phạm NĐ9
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', borderBottom: '1px solid #E2E8F0' }}>
                        <span style={{ fontSize: '13px', color: '#475569' }}>
                          {ROLE_DISPLAY[user?.role ?? ''] ?? user?.role}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', borderBottom: '1px solid #E2E8F0' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            fontSize: '12px',
                            fontWeight: 500,
                            padding: '2px 8px',
                            borderRadius: '4px',
                            backgroundColor: member.role === 'chairman' ? '#EFF6FF' : '#F1F5F9',
                            color: member.role === 'chairman' ? '#1D4ED8' : '#475569',
                            border: `1px solid ${member.role === 'chairman' ? '#BFDBFE' : '#E2E8F0'}`,
                          }}
                        >
                          {ROLE_LABELS[member.role as MemberRole]}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: '#475569', borderBottom: '1px solid #E2E8F0' }}>
                        {formatDate(member.assignedAt)}
                      </td>
                      <td style={{ padding: '12px 16px', borderBottom: '1px solid #E2E8F0' }}>
                        {canEdit && isHovered && (
                          <button
                            onClick={() => {
                              setRemovingMember(member.id);
                              setShowRemoveConfirm(true);
                            }}
                            aria-label="Xóa thành viên"
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '12px',
                              fontWeight: 500,
                              color: '#DC2626',
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              padding: '4px 8px',
                              borderRadius: '4px',
                            }}
                          >
                            <Trash2 style={{ width: 14, height: 14 }} />
                            Xóa
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0"
            style={{ backgroundColor: 'rgba(15,23,42,0.4)' }}
            onClick={() => setShowAddModal(false)}
          />
          <div
            className="relative bg-white"
            style={{
              width: '560px',
              maxHeight: '90vh',
              borderRadius: '12px',
              boxShadow: '0 10px 15px rgba(15,23,42,0.08), 0 4px 6px rgba(15,23,42,0.04)',
              display: 'flex',
              flexDirection: 'column',
              animation: 'fadeScaleIn 150ms ease-out',
            }}
          >
            <style>{`
              @keyframes fadeScaleIn { from { opacity: 0; transform: scale(0.97); } to { opacity: 1; transform: scale(1); } }
            `}</style>

            {/* Modal Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '20px 24px',
                borderBottom: '1px solid #E2E8F0',
              }}
            >
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#1E293B', lineHeight: '1.35' }}>
                  Thêm thành viên — {councilTitle}
                </h2>
                <p style={{ fontSize: '13px', color: '#64748B', marginTop: '2px' }}>
                  Chọn nhân viên và vai trò trong hội đồng
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                aria-label="Đóng"
              >
                <X style={{ width: 18, height: 18, color: '#64748B' }} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
              {/* Role Selection */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#475569', marginBottom: '8px' }}>
                  Vai trò trong hội đồng *
                </label>
                <div className="flex gap-3">
                  {(Object.keys(ROLE_LABELS) as MemberRole[]).map((role) => (
                    <label
                      key={role}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer"
                      style={{
                        border: `1px solid ${selectedRole === role ? '#1D4ED8' : '#E2E8F0'}`,
                        backgroundColor: selectedRole === role ? '#EFF6FF' : '#FFFFFF',
                        flex: 1,
                      }}
                    >
                      <input
                        type="radio"
                        name="member-role"
                        value={role}
                        checked={selectedRole === role}
                        onChange={() => setSelectedRole(role)}
                        style={{ accentColor: '#1D4ED8' }}
                      />
                      <span
                        style={{
                          fontSize: '13px',
                          fontWeight: selectedRole === role ? 500 : 400,
                          color: selectedRole === role ? '#1D4ED8' : '#475569',
                        }}
                      >
                        {ROLE_LABELS[role]}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* User List */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#475569', marginBottom: '8px' }}>
                  Chọn nhân viên *
                </label>
                <div
                  style={{
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    maxHeight: '300px',
                    overflowY: 'auto',
                  }}
                >
                  {allUsers.map((user, idx) => {
                    const isInCurrent = currentCouncilUserIds.has(user.id);
                    const isInOther = otherCouncilUserIds.has(user.id);
                    const isSelected = selectedUserId === user.id;
                    const isDisabled = isInCurrent;

                    return (
                      <label
                        key={user.id}
                        className="flex items-center gap-3 px-4 py-3 cursor-pointer"
                        style={{
                          backgroundColor: isSelected
                            ? '#EFF6FF'
                            : isDisabled
                            ? '#F8FAFC'
                            : isInOther
                            ? '#FEF2F2'
                            : idx % 2 === 0
                            ? '#FFFFFF'
                            : '#F8FAFC',
                          borderBottom: idx < allUsers.length - 1 ? '1px solid #F1F5F9' : 'none',
                          cursor: isDisabled ? 'not-allowed' : 'pointer',
                          opacity: isDisabled ? 0.6 : 1,
                        }}
                      >
                        <input
                          type="radio"
                          name="selected-user"
                          value={user.id}
                          checked={isSelected}
                          disabled={isDisabled}
                          onChange={() => !isDisabled && setSelectedUserId(user.id)}
                          style={{ accentColor: '#1D4ED8', flexShrink: 0 }}
                        />
                        <div
                          className="flex h-8 w-8 items-center justify-center rounded-full flex-shrink-0"
                          style={{ backgroundColor: isInOther ? '#FEF2F2' : '#EFF6FF', fontSize: '12px', fontWeight: 600, color: isInOther ? '#DC2626' : '#1D4ED8' }}
                        >
                          {user.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p style={{ fontSize: '14px', fontWeight: 500, color: '#1E293B' }}>{user.name}</p>
                          <p style={{ fontSize: '12px', color: '#64748B' }}>
                            {ROLE_DISPLAY[user.role]} • {user.email}
                          </p>
                        </div>
                        {isInCurrent && (
                          <span style={{ fontSize: '11px', color: '#64748B', flexShrink: 0 }}>Đã có mặt</span>
                        )}
                        {!isInCurrent && isInOther && (
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 600,
                              padding: '2px 6px',
                              borderRadius: '4px',
                              backgroundColor: '#FEF2F2',
                              color: '#DC2626',
                              border: '1px solid #FECACA',
                              flexShrink: 0,
                              whiteSpace: 'nowrap',
                            }}
                          >
                            ⚠ Trong HĐ kia (NĐ9)
                          </span>
                        )}
                      </label>
                    );
                  })}
                </div>

                {/* NĐ9 warning for selected user */}
                {selectedUserConflict && (
                  <div className="mt-3">
                    <AlertBanner
                      variant="error"
                      title="Vi phạm độc lập NĐ9"
                      message="Nhân viên này đang có mặt trong hội đồng kia. Bổ nhiệm sẽ vi phạm yêu cầu độc lập theo Nghị định 9/2024/NĐ-CP. Bạn vẫn có thể thêm nhưng cần xem xét lại."
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '12px',
                padding: '16px 24px',
                borderTop: '1px solid #E2E8F0',
              }}
            >
              <button
                onClick={() => { setShowAddModal(false); setSelectedUserId(null); }}
                style={{
                  fontSize: '14px',
                  fontWeight: 500,
                  padding: '10px 16px',
                  borderRadius: '6px',
                  backgroundColor: '#F1F5F9',
                  color: '#334155',
                  border: '1px solid #CBD5E1',
                  cursor: 'pointer',
                }}
              >
                Hủy
              </button>
              <button
                onClick={handleAddMember}
                disabled={!selectedUserId || selectedUserAlready}
                style={{
                  fontSize: '14px',
                  fontWeight: 500,
                  padding: '10px 16px',
                  borderRadius: '6px',
                  backgroundColor: selectedUserConflict ? '#DC2626' : '#1D4ED8',
                  color: '#FFFFFF',
                  border: 'none',
                  cursor: !selectedUserId || selectedUserAlready ? 'not-allowed' : 'pointer',
                  opacity: !selectedUserId || selectedUserAlready ? 0.5 : 1,
                }}
              >
                {selectedUserConflict ? 'Thêm (bất chấp cảnh báo)' : 'Bổ nhiệm thành viên'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Remove Confirm Dialog */}
      <ConfirmDialog
        open={showRemoveConfirm}
        onClose={() => { setShowRemoveConfirm(false); setRemovingMember(null); }}
        onConfirm={handleRemoveMember}
        title="Xác nhận xóa thành viên khỏi hội đồng"
        description="Thành viên này sẽ bị xóa khỏi hội đồng. Hành động này có thể ảnh hưởng đến tính hợp lệ của quá trình đánh giá."
        variant="warning"
        confirmLabel="Xóa thành viên"
        cancelLabel="Hủy"
      />
    </div>
  );
}
