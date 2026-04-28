import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { AlertBanner } from '../../../../components/shared/AlertBanner';
import { ConfirmDialog } from '../../../../components/shared/ConfirmDialog';
import { EmptyState } from '../../../../components/shared/EmptyState';
import { storage } from '../../../../lib/storage';
import { formatCurrency } from '../../../../lib/utils';
import { CheckCircle, ChevronRight, Trophy, ClipboardList } from 'lucide-react';
import type { BiddingProject, Bid } from '../../../../lib/types';

interface EvaluationTabProps {
  project: BiddingProject;
  onUpdate: (project: BiddingProject) => void;
}

// ─── Preliminary Criteria ─────────────────────────────────────────────────────
const PRELIMINARY_CRITERIA = [
  { id: 'legal', label: 'Tư cách pháp lý hợp lệ' },
  { id: 'financial', label: 'Năng lực tài chính đáp ứng' },
  { id: 'experience', label: 'Kinh nghiệm thực hiện tương tự' },
  { id: 'validity', label: 'Hồ sơ đúng hạn và hợp lệ' },
];

// ─── Technical Criteria ────────────────────────────────────────────────────────
const TECHNICAL_CRITERIA = [
  { id: 'solution', label: 'Giải pháp kỹ thuật', weight: 0.4 },
  { id: 'experience', label: 'Kinh nghiệm thực hiện', weight: 0.3 },
  { id: 'schedule', label: 'Tiến độ thực hiện', weight: 0.2 },
  { id: 'warranty', label: 'Chế độ bảo hành', weight: 0.1 },
];

type Phase = 'preliminary' | 'technical' | 'financial' | 'ranked';

// Local state types
type PrelimChecks = Record<string, Record<string, boolean>>; // bidId → criteriaId → pass/fail
type TechScores = Record<string, Record<string, number>>;    // bidId → criteriaId → score

const PHASE_STEPS: { id: Phase; label: string; desc: string }[] = [
  { id: 'preliminary', label: 'Sơ bộ', desc: 'Kiểm tra tư cách và tính hợp lệ' },
  { id: 'technical', label: 'Kỹ thuật', desc: 'Chấm điểm kỹ thuật theo tiêu chí' },
  { id: 'financial', label: 'Tài chính', desc: 'Chấm điểm tài chính và xếp hạng' },
  { id: 'ranked', label: 'Kết quả', desc: 'Xếp hạng cuối và chọn trúng thầu' },
];

export function EvaluationTab({ project, onUpdate }: EvaluationTabProps) {
  const bids = project.bids;

  // Determine initial phase from bid statuses
  const allEvaluated = bids.every((b) => b.status === 'winner' || b.status === 'rejected' || b.status === 'evaluated');
  const hasWinner = bids.some((b) => b.status === 'winner');

  const [currentPhase, setCurrentPhase] = useState<Phase>(
    hasWinner ? 'ranked' : allEvaluated ? 'financial' : 'preliminary'
  );

  // Preliminary state: initialize all criteria as true (pass) for each bid
  const [prelimChecks, setPrelimChecks] = useState<PrelimChecks>(() => {
    const init: PrelimChecks = {};
    bids.forEach((b) => {
      init[b.id] = {};
      PRELIMINARY_CRITERIA.forEach((c) => { init[b.id][c.id] = true; });
    });
    return init;
  });

  // Technical scores state
  const [techScores, setTechScores] = useState<TechScores>(() => {
    const init: TechScores = {};
    bids.forEach((b) => {
      init[b.id] = {};
      TECHNICAL_CRITERIA.forEach((c) => {
        // Pre-fill from existing data if available
        const existingTech = b.technicalScore;
        init[b.id][c.id] = existingTech ? Math.round(existingTech * c.weight) : 0;
      });
    });
    return init;
  });

  // Computed: bids passing preliminary
  const passingBids = useMemo(() => {
    return bids.filter((bid) => {
      const checks = prelimChecks[bid.id] ?? {};
      return PRELIMINARY_CRITERIA.every((c) => checks[c.id] !== false);
    });
  }, [bids, prelimChecks]);

  // Computed: technical totals
  const techTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    passingBids.forEach((bid) => {
      const scores = techScores[bid.id] ?? {};
      totals[bid.id] = TECHNICAL_CRITERIA.reduce((sum, c) => {
        return sum + (scores[c.id] ?? 0) * c.weight;
      }, 0);
    });
    return totals;
  }, [passingBids, techScores]);

  // Financial scores: based on inverse price (lower price = higher score)
  const priceScores = useMemo(() => {
    const result: Record<string, number> = {};
    const lowestPrice = Math.min(
      ...passingBids.map((b) => b.priceScore ?? b.totalScore ?? 80)
    );
    passingBids.forEach((bid) => {
      const price = bid.priceScore ?? bid.totalScore ?? 80;
      // Scale: lowest price gets 100, others proportionally lower
      result[bid.id] = Math.round((lowestPrice / price) * 100 * 10) / 10;
    });
    return result;
  }, [passingBids]);

  // Combined scores (70% tech + 30% price per VN procurement law)
  const combinedScores = useMemo(() => {
    const result: Record<string, number> = {};
    passingBids.forEach((bid) => {
      const tech = bid.technicalScore ?? techTotals[bid.id] ?? 0;
      const price = priceScores[bid.id] ?? 0;
      result[bid.id] = Math.round((tech * 0.7 + price * 0.3) * 10) / 10;
    });
    return result;
  }, [passingBids, techTotals, priceScores]);

  // Ranked bids for financial phase
  const rankedBids = useMemo(() => {
    return [...passingBids].sort((a, b) => (combinedScores[b.id] ?? 0) - (combinedScores[a.id] ?? 0));
  }, [passingBids, combinedScores]);

  const [showConfirmRank, setShowConfirmRank] = useState(false);

  const handlePrelimNext = () => setCurrentPhase('technical');
  const handleTechNext = () => setCurrentPhase('financial');

  const handleConfirmRank = () => {
    const winnerId = rankedBids[0]?.supplierId;
    const updatedBids: Bid[] = bids.map((bid) => {
      if (!passingBids.find((p) => p.id === bid.id)) {
        return { ...bid, status: 'rejected' as const };
      }
      const techScore = bid.technicalScore ?? Math.round(techTotals[bid.id] ?? 0);
      const priceScr = bid.priceScore ?? Math.round(priceScores[bid.id] ?? 0);
      const total = combinedScores[bid.id] ?? 0;
      return {
        ...bid,
        technicalScore: techScore,
        priceScore: priceScr,
        totalScore: total,
        evaluatedBy: 'user-5',
        evaluatedAt: new Date().toISOString(),
        status: bid.supplierId === winnerId ? ('winner' as const) : ('evaluated' as const),
      };
    });

    const updatedProject: BiddingProject = {
      ...project,
      bids: updatedBids,
      winnerId,
      currentState: 'evaluation_complete',
      stateHistory: [
        ...project.stateHistory,
        {
          state: 'evaluation_complete',
          changedBy: 'user-5',
          changedAt: new Date().toISOString(),
          note: 'Hoàn thành đánh giá 3 pha, đã xếp hạng nhà thầu',
        },
      ],
    };

    storage.updateBiddingProject(project.id, updatedProject);
    onUpdate(updatedProject);
    setCurrentPhase('ranked');
    setShowConfirmRank(false);
  };

  const phaseIndex = PHASE_STEPS.findIndex((p) => p.id === currentPhase);

  if (bids.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <EmptyState
            icon={<ClipboardList style={{ width: 40, height: 40, color: '#94A3B8' }} />}
            title="Chưa có hồ sơ dự thầu"
            description="Cần có ít nhất một hồ sơ dự thầu để thực hiện đánh giá."
          />
        </CardContent>
      </Card>
    );
  }

  const canEvaluate = ['evaluation', 'bidding_closed', 'evaluation_complete'].includes(project.currentState);

  return (
    <div className="space-y-4">
      {/* Phase Progress Indicator */}
      <Card>
        <CardContent style={{ padding: '20px' }}>
          <div className="flex items-center gap-2">
            {PHASE_STEPS.map((step, idx) => {
              const isCompleted = idx < phaseIndex;
              const isCurrent = idx === phaseIndex;
              return (
                <div key={step.id} className="flex items-center gap-2 flex-1">
                  <div
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={() => {
                      // Allow going back to previous phases
                      if (idx <= phaseIndex) setCurrentPhase(step.id);
                    }}
                  >
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-full flex-shrink-0"
                      style={{
                        backgroundColor: isCompleted ? '#15803D' : isCurrent ? '#1D4ED8' : '#F1F5F9',
                        border: `2px solid ${isCompleted ? '#15803D' : isCurrent ? '#1D4ED8' : '#E2E8F0'}`,
                      }}
                    >
                      {isCompleted ? (
                        <CheckCircle style={{ width: 14, height: 14, color: '#FFFFFF' }} />
                      ) : (
                        <span
                          style={{
                            fontSize: '12px',
                            fontWeight: 600,
                            color: isCurrent ? '#FFFFFF' : '#94A3B8',
                          }}
                        >
                          {idx + 1}
                        </span>
                      )}
                    </div>
                    <div className="hidden sm:block">
                      <p
                        style={{
                          fontSize: '13px',
                          fontWeight: isCurrent ? 600 : 400,
                          color: isCompleted ? '#15803D' : isCurrent ? '#1D4ED8' : '#94A3B8',
                          lineHeight: '1.2',
                        }}
                      >
                        {step.label}
                      </p>
                      <p style={{ fontSize: '11px', color: '#94A3B8', lineHeight: '1.2' }}>
                        {step.desc}
                      </p>
                    </div>
                  </div>
                  {idx < PHASE_STEPS.length - 1 && (
                    <ChevronRight
                      style={{ width: 16, height: 16, color: '#CBD5E1', flexShrink: 0, marginLeft: 'auto' }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {!canEvaluate && currentPhase === 'preliminary' && (
        <AlertBanner
          variant="warning"
          title="Chưa đến giai đoạn đánh giá"
          message="Gói thầu phải ở trạng thái 'Đóng thầu' hoặc 'Đang đánh giá' để thực hiện đánh giá hồ sơ."
        />
      )}

      {/* ── Phase 1: Preliminary ─────────────────────────────────────���────────── */}
      {currentPhase === 'preliminary' && (
        <Card>
          <CardHeader>
            <CardTitle style={{ fontSize: '16px', fontWeight: 600, color: '#1E293B' }}>
              Pha 1 — Đánh giá sơ bộ
            </CardTitle>
            <p style={{ fontSize: '13px', color: '#64748B', marginTop: '4px' }}>
              Kiểm tra tư cách pháp lý, năng lực và tính hợp lệ của hồ sơ
            </p>
          </CardHeader>
          <CardContent>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F1F5F9' }}>
                    <th
                      style={{
                        textAlign: 'left',
                        padding: '10px 16px',
                        fontSize: '13px',
                        fontWeight: 500,
                        color: '#475569',
                        borderBottom: '1px solid #E2E8F0',
                        whiteSpace: 'nowrap',
                        minWidth: '200px',
                      }}
                    >
                      Tiêu chí
                    </th>
                    {bids.map((bid) => {
                      const supplier = storage.getSupplierById(bid.supplierId);
                      return (
                        <th
                          key={bid.id}
                          style={{
                            textAlign: 'center',
                            padding: '10px 16px',
                            fontSize: '13px',
                            fontWeight: 500,
                            color: '#475569',
                            borderBottom: '1px solid #E2E8F0',
                            minWidth: '160px',
                          }}
                        >
                          {supplier?.companyName ?? bid.supplierId}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {PRELIMINARY_CRITERIA.map((criteria, rowIdx) => (
                    <tr
                      key={criteria.id}
                      style={{ backgroundColor: rowIdx % 2 === 0 ? '#FFFFFF' : '#F8FAFC' }}
                    >
                      <td
                        style={{
                          padding: '12px 16px',
                          fontSize: '14px',
                          color: '#1E293B',
                          borderBottom: '1px solid #E2E8F0',
                        }}
                      >
                        {criteria.label}
                      </td>
                      {bids.map((bid) => {
                        const checked = prelimChecks[bid.id]?.[criteria.id] !== false;
                        return (
                          <td
                            key={bid.id}
                            style={{
                              padding: '12px 16px',
                              textAlign: 'center',
                              borderBottom: '1px solid #E2E8F0',
                            }}
                          >
                            <label className="inline-flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={(e) => {
                                  setPrelimChecks((prev) => ({
                                    ...prev,
                                    [bid.id]: {
                                      ...prev[bid.id],
                                      [criteria.id]: e.target.checked,
                                    },
                                  }));
                                }}
                                style={{ width: 16, height: 16, accentColor: '#15803D' }}
                              />
                              <span
                                style={{
                                  fontSize: '12px',
                                  fontWeight: 500,
                                  color: checked ? '#15803D' : '#DC2626',
                                }}
                              >
                                {checked ? 'Đạt' : 'Không đạt'}
                              </span>
                            </label>
                          </td>
                        );
                      })}
                    </tr>
                  ))}

                  {/* Summary row */}
                  <tr style={{ backgroundColor: '#F1F5F9' }}>
                    <td
                      style={{
                        padding: '12px 16px',
                        fontSize: '13px',
                        fontWeight: 600,
                        color: '#475569',
                      }}
                    >
                      Kết quả sơ bộ
                    </td>
                    {bids.map((bid) => {
                      const passes = passingBids.find((p) => p.id === bid.id);
                      return (
                        <td key={bid.id} style={{ padding: '12px 16px', textAlign: 'center' }}>
                          <span
                            style={{
                              display: 'inline-block',
                              fontSize: '11px',
                              fontWeight: 600,
                              padding: '3px 10px',
                              borderRadius: '9999px',
                              backgroundColor: passes ? '#F0FDF4' : '#FEF2F2',
                              color: passes ? '#15803D' : '#DC2626',
                              border: `1px solid ${passes ? '#BBF7D0' : '#FECACA'}`,
                            }}
                          >
                            {passes ? '✓ Đạt sơ bộ' : '✕ Không đạt'}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <p style={{ fontSize: '13px', color: '#64748B' }}>
                {passingBids.length}/{bids.length} hồ sơ đủ điều kiện sang pha kỹ thuật
              </p>
              <Button
                onClick={handlePrelimNext}
                disabled={passingBids.length === 0}
                style={{
                  fontSize: '14px',
                  fontWeight: 500,
                  borderRadius: '6px',
                  backgroundColor: '#1D4ED8',
                  color: '#FFFFFF',
                  padding: '10px 20px',
                  opacity: passingBids.length === 0 ? 0.5 : 1,
                }}
              >
                Chuyển sang đánh giá kỹ thuật →
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Phase 2: Technical ───────────────────────────────────────────────── */}
      {currentPhase === 'technical' && (
        <Card>
          <CardHeader>
            <CardTitle style={{ fontSize: '16px', fontWeight: 600, color: '#1E293B' }}>
              Pha 2 — Đánh giá kỹ thuật
            </CardTitle>
            <p style={{ fontSize: '13px', color: '#64748B', marginTop: '4px' }}>
              Chấm điểm kỹ thuật theo tiêu chí (thang điểm 100)
            </p>
          </CardHeader>
          <CardContent>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F1F5F9' }}>
                    <th
                      style={{
                        textAlign: 'left',
                        padding: '10px 16px',
                        fontSize: '13px',
                        fontWeight: 500,
                        color: '#475569',
                        borderBottom: '1px solid #E2E8F0',
                      }}
                    >
                      Tiêu chí (Trọng số)
                    </th>
                    {passingBids.map((bid) => {
                      const supplier = storage.getSupplierById(bid.supplierId);
                      return (
                        <th
                          key={bid.id}
                          style={{
                            textAlign: 'center',
                            padding: '10px 16px',
                            fontSize: '13px',
                            fontWeight: 500,
                            color: '#475569',
                            borderBottom: '1px solid #E2E8F0',
                            minWidth: '160px',
                          }}
                        >
                          {supplier?.companyName ?? bid.supplierId}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {TECHNICAL_CRITERIA.map((criteria, rowIdx) => (
                    <tr
                      key={criteria.id}
                      style={{ backgroundColor: rowIdx % 2 === 0 ? '#FFFFFF' : '#F8FAFC' }}
                    >
                      <td
                        style={{
                          padding: '12px 16px',
                          fontSize: '14px',
                          color: '#1E293B',
                          borderBottom: '1px solid #E2E8F0',
                        }}
                      >
                        <span>{criteria.label}</span>
                        <span
                          style={{
                            display: 'inline-block',
                            marginLeft: '8px',
                            fontSize: '11px',
                            fontWeight: 600,
                            padding: '1px 6px',
                            borderRadius: '4px',
                            backgroundColor: '#EFF6FF',
                            color: '#1D4ED8',
                          }}
                        >
                          {Math.round(criteria.weight * 100)}%
                        </span>
                      </td>
                      {passingBids.map((bid) => {
                        const score = techScores[bid.id]?.[criteria.id] ?? 0;
                        return (
                          <td
                            key={bid.id}
                            style={{
                              padding: '8px 16px',
                              textAlign: 'center',
                              borderBottom: '1px solid #E2E8F0',
                            }}
                          >
                            <input
                              type="number"
                              min={0}
                              max={100}
                              value={score}
                              onChange={(e) => {
                                const val = Math.min(100, Math.max(0, Number(e.target.value)));
                                setTechScores((prev) => ({
                                  ...prev,
                                  [bid.id]: { ...prev[bid.id], [criteria.id]: val },
                                }));
                              }}
                              style={{
                                width: '72px',
                                textAlign: 'center',
                                fontSize: '14px',
                                fontWeight: 500,
                                padding: '6px 8px',
                                borderRadius: '6px',
                                border: '1px solid #CBD5E1',
                                backgroundColor: '#FFFFFF',
                                color: '#1E293B',
                                outline: 'none',
                              }}
                            />
                          </td>
                        );
                      })}
                    </tr>
                  ))}

                  {/* Weighted totals */}
                  <tr style={{ backgroundColor: '#EFF6FF' }}>
                    <td
                      style={{
                        padding: '12px 16px',
                        fontSize: '13px',
                        fontWeight: 600,
                        color: '#1D4ED8',
                      }}
                    >
                      Điểm kỹ thuật (có trọng số)
                    </td>
                    {passingBids.map((bid) => {
                      const total = Math.round(techTotals[bid.id] * 10) / 10;
                      return (
                        <td
                          key={bid.id}
                          style={{
                            padding: '12px 16px',
                            textAlign: 'center',
                            fontSize: '15px',
                            fontWeight: 700,
                            color: '#1D4ED8',
                            fontFamily: 'monospace',
                          }}
                        >
                          {total.toFixed(1)}
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Qualifying threshold note */}
            <div className="mt-3">
              <AlertBanner
                variant="info"
                message="Hồ sơ đạt ngưỡng kỹ thuật tối thiểu 70 điểm mới được chuyển sang đánh giá tài chính (theo Nghị định 24/2024/NĐ-CP)."
              />
            </div>

            <div className="mt-4 flex justify-end">
              <Button
                onClick={handleTechNext}
                style={{
                  fontSize: '14px',
                  fontWeight: 500,
                  borderRadius: '6px',
                  backgroundColor: '#1D4ED8',
                  color: '#FFFFFF',
                  padding: '10px 20px',
                }}
              >
                Chuyển sang đánh giá tài chính →
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Phase 3: Financial ───────────────────────────────────────────────── */}
      {currentPhase === 'financial' && (
        <Card>
          <CardHeader>
            <CardTitle style={{ fontSize: '16px', fontWeight: 600, color: '#1E293B' }}>
              Pha 3 — Đánh giá tài chính & Xếp hạng
            </CardTitle>
            <p style={{ fontSize: '13px', color: '#64748B', marginTop: '4px' }}>
              Điểm tổng hợp = Kỹ thuật × 70% + Tài chính × 30%
            </p>
          </CardHeader>
          <CardContent>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F1F5F9' }}>
                    {['Nhà thầu', 'Điểm kỹ thuật', 'Giá đề xuất', 'Điểm tài chính', 'Tổng điểm (TH)'].map(
                      (h) => (
                        <th
                          key={h}
                          style={{
                            padding: '10px 16px',
                            fontSize: '13px',
                            fontWeight: 500,
                            color: '#475569',
                            borderBottom: '1px solid #E2E8F0',
                            textAlign: h === 'Nhà thầu' ? 'left' : 'center',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {rankedBids.map((bid, idx) => {
                    const supplier = storage.getSupplierById(bid.supplierId);
                    const tech = bid.technicalScore ?? Math.round(techTotals[bid.id] ?? 0);
                    const priceScr = Math.round(priceScores[bid.id] ?? 0);
                    const combined = combinedScores[bid.id] ?? 0;
                    const isTopRanked = idx === 0;

                    return (
                      <tr
                        key={bid.id}
                        style={{
                          backgroundColor: isTopRanked ? '#FEF3C7' : idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC',
                        }}
                      >
                        <td style={{ padding: '12px 16px', borderBottom: '1px solid #E2E8F0' }}>
                          <div className="flex items-center gap-2">
                            {isTopRanked && (
                              <Trophy style={{ width: 16, height: 16, color: '#D97706', flexShrink: 0 }} />
                            )}
                            <div>
                              <p style={{ fontSize: '14px', fontWeight: isTopRanked ? 600 : 400, color: '#1E293B' }}>
                                {supplier?.companyName}
                              </p>
                              {isTopRanked && (
                                <p style={{ fontSize: '11px', color: '#D97706', fontWeight: 600 }}>
                                  Xếp hạng 1 — Đề xuất trúng thầu
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td
                          style={{
                            padding: '12px 16px',
                            textAlign: 'center',
                            fontSize: '14px',
                            fontFamily: 'monospace',
                            borderBottom: '1px solid #E2E8F0',
                            color: '#1E293B',
                          }}
                        >
                          {tech}
                        </td>
                        <td
                          style={{
                            padding: '12px 16px',
                            textAlign: 'center',
                            fontSize: '14px',
                            fontFamily: 'monospace',
                            borderBottom: '1px solid #E2E8F0',
                            color: '#1E293B',
                          }}
                        >
                          {formatCurrency(bid.totalScore ? bid.totalScore * 1000000 : project.estimatedValue * 0.95)}
                        </td>
                        <td
                          style={{
                            padding: '12px 16px',
                            textAlign: 'center',
                            fontSize: '14px',
                            fontFamily: 'monospace',
                            borderBottom: '1px solid #E2E8F0',
                            color: '#1E293B',
                          }}
                        >
                          {priceScr}
                        </td>
                        <td
                          style={{
                            padding: '12px 16px',
                            textAlign: 'center',
                            borderBottom: '1px solid #E2E8F0',
                          }}
                        >
                          <span
                            style={{
                              fontSize: '15px',
                              fontWeight: 700,
                              fontFamily: 'monospace',
                              color: isTopRanked ? '#D97706' : '#1E293B',
                            }}
                          >
                            {combined.toFixed(1)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-lg"
                style={{ backgroundColor: '#FEF3C7', border: '1px solid #FDE68A' }}
              >
                <Trophy style={{ width: 16, height: 16, color: '#D97706' }} />
                <p style={{ fontSize: '13px', color: '#92400E', fontWeight: 500 }}>
                  Nhà thầu đề xuất trúng: {storage.getSupplierById(rankedBids[0]?.supplierId)?.companyName}
                </p>
              </div>
              <Button
                onClick={() => setShowConfirmRank(true)}
                style={{
                  fontSize: '14px',
                  fontWeight: 500,
                  borderRadius: '6px',
                  backgroundColor: '#1D4ED8',
                  color: '#FFFFFF',
                  padding: '10px 20px',
                }}
              >
                Xác nhận xếp hạng & Hoàn thành đánh giá
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Phase 4: Ranked Result ───────────────────────────────────────────── */}
      {currentPhase === 'ranked' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle style={{ fontSize: '16px', fontWeight: 600, color: '#1E293B' }}>
                Kết quả đánh giá cuối
              </CardTitle>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '3px 10px',
                  borderRadius: '9999px',
                  backgroundColor: '#F0FDF4',
                  color: '#15803D',
                  border: '1px solid #BBF7D0',
                }}
              >
                ✓ Đánh giá hoàn tất
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <AlertBanner
              variant="success"
              title="Đánh giá 3 pha hoàn tất"
              message="Kết quả xếp hạng đã được lưu. Vui lòng gửi biên bản đánh giá để Hội đồng thẩm định xem xét và BGĐ phê duyệt."
            />
            <div className="mt-4 space-y-3">
              {[...project.bids]
                .sort((a, b) => (b.totalScore ?? 0) - (a.totalScore ?? 0))
                .map((bid, idx) => {
                  const supplier = storage.getSupplierById(bid.supplierId);
                  const isWinner = bid.status === 'winner';
                  return (
                    <div
                      key={bid.id}
                      className="flex items-center gap-4 p-4 rounded-lg"
                      style={{
                        border: `1px solid ${isWinner ? '#FDE68A' : '#E2E8F0'}`,
                        backgroundColor: isWinner ? '#FEF3C7' : '#F8FAFC',
                      }}
                    >
                      <div
                        className="flex h-8 w-8 items-center justify-center rounded-full flex-shrink-0"
                        style={{
                          backgroundColor: isWinner ? '#D97706' : '#E2E8F0',
                        }}
                      >
                        {isWinner ? (
                          <Trophy style={{ width: 16, height: 16, color: '#FFFFFF' }} />
                        ) : (
                          <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748B' }}>
                            {idx + 1}
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <p style={{ fontSize: '14px', fontWeight: isWinner ? 600 : 400, color: '#1E293B' }}>
                          {supplier?.companyName}
                        </p>
                        <p style={{ fontSize: '12px', color: '#64748B' }}>
                          KT: {bid.technicalScore ?? '—'} | TC: {bid.priceScore ?? '—'} | Tổng:{' '}
                          <strong>{bid.totalScore?.toFixed(1) ?? '—'}</strong>
                        </p>
                      </div>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 600,
                          padding: '3px 10px',
                          borderRadius: '9999px',
                          backgroundColor: isWinner ? '#F0FDF4' : bid.status === 'rejected' ? '#FEF2F2' : '#F1F5F9',
                          color: isWinner ? '#15803D' : bid.status === 'rejected' ? '#DC2626' : '#475569',
                          border: `1px solid ${isWinner ? '#BBF7D0' : bid.status === 'rejected' ? '#FECACA' : '#E2E8F0'}`,
                        }}
                      >
                        {isWinner ? 'Trúng thầu' : bid.status === 'rejected' ? 'Không đạt' : 'Không trúng'}
                      </span>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Confirm rank dialog */}
      <ConfirmDialog
        open={showConfirmRank}
        onClose={() => setShowConfirmRank(false)}
        onConfirm={handleConfirmRank}
        title="Xác nhận hoàn thành đánh giá và xếp hạng"
        description={`Kết quả xếp hạng sẽ được lưu chính thức. Nhà thầu đề xuất trúng: ${storage.getSupplierById(rankedBids[0]?.supplierId)?.companyName}. Trạng thái gói thầu sẽ chuyển sang "Đánh giá hoàn tất".`}
        variant="warning"
        confirmLabel="Xác nhận xếp hạng"
        cancelLabel="Kiểm tra lại"
      />
    </div>
  );
}