import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { storage } from '../../lib/storage';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Separator } from '../../components/ui/separator';
import { Badge } from '../../components/ui/badge';
import {
  ArrowLeft,
  FileText,
  Calendar,
  DollarSign,
  Building,
  AlertTriangle,
  CheckCircle,
  Clock,
  Download,
  Upload,
  Paperclip,
  X,
  Trophy,
  Info,
} from 'lucide-react';
import { formatCurrency, formatDate, formatDateTime, daysRemaining, generateId } from '../../lib/utils';
import { BIDDING_METHODS, BIDDING_STATES } from '../../lib/constants';
import type { BiddingProject, Supplier as SupplierType, Bid, Document } from '../../lib/types';
import { toast } from 'sonner';

// ─── Mock file upload helper ──────────────────────────────────────────────────
interface MockUploadedFile {
  name: string;
  size: number;
  type: 'technical' | 'financial';
}

export function TenderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [tender, setTender] = useState<BiddingProject | null>(null);
  const [supplier, setSupplier] = useState<SupplierType | null>(null);
  const [existingBid, setExistingBid] = useState<Bid | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Form state ──────────────────────────────────────────────────────────────
  const [bidAmount, setBidAmount] = useState('');
  const [techFiles, setTechFiles] = useState<MockUploadedFile[]>([]);
  const [finFiles, setFinFiles] = useState<MockUploadedFile[]>([]);

  // ── Load data ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!id || !user) return;

    const foundTender = storage.getBiddingProjectById(id);
    setTender(foundTender || null);

    const allSuppliers = storage.getSuppliers();
    const currentSupplier = allSuppliers.find(s => s.email === user.email);
    setSupplier(currentSupplier || null);

    if (foundTender && currentSupplier) {
      const bid = foundTender.bids.find(b => b.supplierId === currentSupplier.id);
      if (bid) {
        setExistingBid(bid);
        setBidAmount(bid.bidAmount ? bid.bidAmount.toString() : '');
        setTechFiles(bid.technicalProposal.map(d => ({ name: d.name, size: d.size, type: 'technical' as const })));
        setFinFiles(bid.financialProposal.map(d => ({ name: d.name, size: d.size, type: 'financial' as const })));
      }
    }
  }, [id, user]);

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleMockUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'technical' | 'financial') => {
    const files = Array.from(e.target.files || []);
    const mockFiles: MockUploadedFile[] = files.map(f => ({ name: f.name, size: f.size, type }));
    if (type === 'technical') setTechFiles(prev => [...prev, ...mockFiles]);
    else setFinFiles(prev => [...prev, ...mockFiles]);
    // Reset input
    e.target.value = '';
  };

  const removeFile = (type: 'technical' | 'financial', index: number) => {
    if (type === 'technical') setTechFiles(prev => prev.filter((_, i) => i !== index));
    else setFinFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmitBid = () => {
    if (!tender || !supplier) return;

    const amount = parseFloat(bidAmount.replace(/,/g, ''));
    if (!bidAmount || isNaN(amount) || amount <= 0) {
      toast.error('Vui lòng nhập giá dự thầu hợp lệ');
      return;
    }
    if (techFiles.length === 0) {
      toast.error('Vui lòng tải lên ít nhất một tài liệu kỹ thuật');
      return;
    }
    if (finFiles.length === 0) {
      toast.error('Vui lòng tải lên ít nhất một tài liệu tài chính');
      return;
    }

    setIsSubmitting(true);

    const now = new Date().toISOString();

    const toDocList = (files: MockUploadedFile[]): Document[] =>
      files.map((f, i) => ({
        id: generateId('doc'),
        name: f.name,
        url: `/mock-uploads/${f.name}`,
        size: f.size,
        uploadedBy: supplier.id,
        uploadedAt: now,
      }));

    const newBid: Bid = {
      id: existingBid?.id || generateId('bid'),
      biddingProjectId: tender.id,
      supplierId: supplier.id,
      submittedAt: now,
      bidAmount: amount,
      technicalProposal: toDocList(techFiles),
      financialProposal: toDocList(finFiles),
      status: 'submitted',
    };

    const updatedBids = existingBid
      ? tender.bids.map(b => (b.supplierId === supplier.id ? newBid : b))
      : [...tender.bids, newBid];

    storage.updateBiddingProject(tender.id, { bids: updatedBids });
    setExistingBid(newBid);
    setIsSubmitting(false);
    toast.success(existingBid ? 'Đã cập nhật hồ sơ dự thầu' : 'Đã nộp hồ sơ dự thầu thành công');

    // Refresh
    const updated = storage.getBiddingProjectById(tender.id);
    if (updated) setTender(updated);
  };

  // ── Derived state ─────────────────────────────────────────────────────────────
  if (!tender) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p style={{ fontSize: 18, fontWeight: 600, color: '#1E293B' }}>Không tìm thấy gói thầu</p>
          <Button onClick={() => navigate('/supplier/tenders')} className="mt-4">
            Quay lại danh sách
          </Button>
        </div>
      </div>
    );
  }

  const days = tender.deadlineDate ? daysRemaining(tender.deadlineDate) : 0;
  const isExpired = days <= 0;
  const isUrgent = days <= 3 && days > 0;
  const canSubmit = tender.currentState === 'bidding_open' && !isExpired;
  const isWinner = existingBid?.status === 'winner';
  const stateConfig = BIDDING_STATES[tender.currentState];

  const formatBidAmountDisplay = (val: string) => {
    const num = parseFloat(val.replace(/,/g, ''));
    if (isNaN(num)) return '';
    return formatCurrency(num);
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }} className="space-y-6">
      {/* ── Back + Header ──────────────────────────────────────────────────── */}
      <div>
        <Button
          variant="ghost"
          onClick={() => navigate('/supplier/tenders')}
          style={{ marginBottom: 16, color: '#475569', fontSize: 14 }}
        >
          <ArrowLeft style={{ width: 16, height: 16, marginRight: 6 }} />
          Quay lại danh sách
        </Button>

        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 13,
                  color: '#64748B',
                  backgroundColor: '#F1F5F9',
                  padding: '2px 8px',
                  borderRadius: 4,
                }}
              >
                {tender.code}
              </span>
              <StatusBadge status={tender.currentState} type="bidding" size="md" />
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 600, color: '#1E293B', lineHeight: 1.3 }}>
              {tender.name}
            </h1>
          </div>
        </div>
      </div>

      {/* ── Winner Banner ────────────────────────────────────────────────────── */}
      {isWinner && (
        <div
          style={{
            backgroundColor: '#F0FDF4',
            border: '1px solid #86EFAC',
            borderRadius: 8,
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <Trophy style={{ width: 24, height: 24, color: '#15803D', flexShrink: 0 }} />
          <div>
            <p style={{ fontWeight: 600, color: '#15803D', fontSize: 15, margin: 0 }}>
              Chúc mừng! Công ty bạn đã trúng thầu gói này
            </p>
            <p style={{ fontSize: 13, color: '#166534', margin: '2px 0 0' }}>
              Giá trúng thầu: {formatCurrency(existingBid?.bidAmount || 0)} •
              Điểm tổng: {existingBid?.totalScore?.toFixed(1) ?? 'N/A'}
            </p>
          </div>
        </div>
      )}

      {/* ── Deadline Alerts ──────────────────────────────────────────────────── */}
      {canSubmit && isUrgent && (
        <Alert style={{ backgroundColor: '#FEF2F2', borderColor: '#FECACA' }}>
          <AlertTriangle style={{ width: 16, height: 16, color: '#DC2626' }} />
          <AlertDescription>
            <span style={{ fontWeight: 600, color: '#DC2626' }}>Khẩn cấp! </span>
            <span style={{ color: '#991B1B' }}>
              Còn {days} ngày nộp hồ sơ — Hạn chót: {formatDate(tender.deadlineDate!)}
            </span>
          </AlertDescription>
        </Alert>
      )}

      {canSubmit && !isUrgent && (
        <Alert style={{ backgroundColor: '#FFFBEB', borderColor: '#FDE68A' }}>
          <Clock style={{ width: 16, height: 16, color: '#B45309' }} />
          <AlertDescription style={{ color: '#92400E' }}>
            Còn <strong>{days} ngày</strong> để nộp hồ sơ — Hạn chót: {formatDate(tender.deadlineDate!)}
          </AlertDescription>
        </Alert>
      )}

      {isExpired && !existingBid && (
        <Alert style={{ backgroundColor: '#FEF2F2', borderColor: '#FECACA' }}>
          <AlertTriangle style={{ width: 16, height: 16, color: '#DC2626' }} />
          <AlertDescription style={{ color: '#991B1B' }}>
            <strong>Đã hết hạn nộp hồ sơ</strong> vào {tender.deadlineDate ? formatDate(tender.deadlineDate) : 'N/A'}
          </AlertDescription>
        </Alert>
      )}

      {existingBid && !isWinner && (
        <Alert style={{ backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' }}>
          <CheckCircle style={{ width: 16, height: 16, color: '#15803D' }} />
          <AlertDescription>
            <span style={{ fontWeight: 600, color: '#15803D' }}>Đã nộp hồ sơ</span>
            <span style={{ color: '#166534' }}>
              {' '}— {formatDateTime(existingBid.submittedAt)} •{' '}
              Giá dự thầu: {formatCurrency(existingBid.bidAmount || 0)}
            </span>
          </AlertDescription>
        </Alert>
      )}

      {/* ── Info Grid ───────────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {[
          {
            icon: <DollarSign style={{ width: 18, height: 18, color: '#1D4ED8' }} />,
            label: 'Giá trị dự toán',
            value: formatCurrency(tender.estimatedValue),
            mono: true,
          },
          {
            icon: <FileText style={{ width: 18, height: 18, color: '#1D4ED8' }} />,
            label: 'Phương thức đấu thầu',
            value: BIDDING_METHODS[tender.method]?.label ?? tender.method,
          },
          {
            icon: <Calendar style={{ width: 18, height: 18, color: '#1D4ED8' }} />,
            label: 'Hạn nộp hồ sơ',
            value: tender.deadlineDate ? formatDate(tender.deadlineDate) : 'Chưa xác định',
          },
        ].map((item, i) => (
          <Card key={i} style={{ border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(15,23,42,0.08)' }}>
            <CardContent style={{ paddingTop: 20, paddingBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    backgroundColor: '#EFF6FF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {item.icon}
                </div>
                <div>
                  <p style={{ fontSize: 12, color: '#64748B', margin: 0 }}>{item.label}</p>
                  <p
                    style={{
                      fontSize: 15,
                      fontWeight: 600,
                      color: '#1E293B',
                      margin: '4px 0 0',
                      fontFamily: item.mono ? "'IBM Plex Mono', monospace" : undefined,
                    }}
                  >
                    {item.value}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, alignItems: 'start' }}>
        {/* ── Left column ─────────────────────────────────────────────────── */}
        <div className="space-y-6">
          {/* Description */}
          <Card style={{ border: '1px solid #E2E8F0' }}>
            <CardHeader style={{ paddingBottom: 12 }}>
              <CardTitle style={{ fontSize: 16, color: '#1E293B' }}>Mô tả gói thầu</CardTitle>
            </CardHeader>
            <CardContent>
              <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.6, margin: 0 }}>
                {tender.description || 'Chưa có mô tả chi tiết.'}
              </p>
            </CardContent>
          </Card>

          {/* HSMT Documents */}
          <Card style={{ border: '1px solid #E2E8F0' }}>
            <CardHeader style={{ paddingBottom: 12 }}>
              <CardTitle style={{ fontSize: 16, color: '#1E293B' }}>
                Hồ sơ mời thầu (HSMT)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {tender.hsmt && tender.hsmt.documents.length > 0 ? (
                <div className="space-y-2">
                  {tender.hsmt.documents.map((doc) => (
                    <div
                      key={doc.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        backgroundColor: '#F8FAFC',
                        border: '1px solid #E2E8F0',
                        borderRadius: 6,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <FileText style={{ width: 18, height: 18, color: '#64748B' }} />
                        <div>
                          <p style={{ fontSize: 14, fontWeight: 500, color: '#1E293B', margin: 0 }}>
                            {doc.name}
                          </p>
                          <p style={{ fontSize: 12, color: '#94A3B8', margin: '2px 0 0' }}>
                            {(doc.size / 1024 / 1024).toFixed(2)} MB •{' '}
                            Cập nhật {formatDate(doc.uploadedAt)}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        style={{ color: '#1D4ED8', fontSize: 13 }}
                      >
                        <Download style={{ width: 14, height: 14, marginRight: 6 }} />
                        Tải xuống
                      </Button>
                    </div>
                  ))}
                  {tender.hsmt.approvedAt && (
                    <p style={{ fontSize: 12, color: '#64748B', marginTop: 8 }}>
                      HSMT được phê duyệt ngày {formatDate(tender.hsmt.approvedAt)}
                    </p>
                  )}
                </div>
              ) : (
                <p style={{ fontSize: 14, color: '#94A3B8', textAlign: 'center', padding: '20px 0' }}>
                  Chưa có tài liệu HSMT
                </p>
              )}
            </CardContent>
          </Card>

          {/* ── Bid Submission Form ───────────────────────────────────────── */}
          <Card
            id="submit-section"
            style={{
              border: canSubmit ? '1px solid #BFDBFE' : '1px solid #E2E8F0',
              backgroundColor: canSubmit ? '#FAFCFF' : undefined,
            }}
          >
            <CardHeader style={{ paddingBottom: 12 }}>
              <CardTitle style={{ fontSize: 16, color: '#1E293B' }}>
                {existingBid ? 'Hồ sơ dự thầu đã nộp' : 'Nộp hồ sơ dự thầu'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {canSubmit || existingBid ? (
                <div className="space-y-6">
                  {/* Bid Amount */}
                  <div>
                    <Label
                      htmlFor="bidAmount"
                      style={{ fontSize: 13, fontWeight: 500, color: '#475569', display: 'block', marginBottom: 6 }}
                    >
                      Giá dự thầu (VNĐ){' '}
                      {canSubmit && <span style={{ color: '#DC2626' }}>*</span>}
                    </Label>
                    <Input
                      id="bidAmount"
                      type="number"
                      placeholder="Nhập giá dự thầu..."
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      disabled={!canSubmit}
                      style={{
                        fontFamily: "'IBM Plex Mono', monospace",
                        fontSize: 15,
                        borderColor: '#CBD5E1',
                      }}
                    />
                    {bidAmount && !isNaN(parseFloat(bidAmount)) && (
                      <p style={{ fontSize: 13, color: '#475569', marginTop: 6 }}>
                        ≈ <strong>{formatBidAmountDisplay(bidAmount)}</strong>
                        {tender.estimatedValue > 0 && (
                          <span style={{ color: '#64748B', marginLeft: 8 }}>
                            ({((parseFloat(bidAmount) / tender.estimatedValue) * 100).toFixed(1)}% dự toán)
                          </span>
                        )}
                      </p>
                    )}
                  </div>

                  <Separator />

                  {/* Technical Proposal Upload */}
                  <div>
                    <Label
                      style={{ fontSize: 13, fontWeight: 500, color: '#475569', display: 'block', marginBottom: 6 }}
                    >
                      Hồ sơ đề xuất kỹ thuật{' '}
                      {canSubmit && <span style={{ color: '#DC2626' }}>*</span>}
                    </Label>
                    {canSubmit && (
                      <label
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '2px dashed #94A3B8',
                          borderRadius: 8,
                          padding: '20px 16px',
                          backgroundColor: '#F8FAFC',
                          cursor: 'pointer',
                          transition: 'border-color 0.15s, background 0.15s',
                          marginBottom: 8,
                        }}
                        onDragOver={e => { e.preventDefault(); (e.currentTarget as HTMLElement).style.borderColor = '#1D4ED8'; (e.currentTarget as HTMLElement).style.backgroundColor = '#EFF6FF'; }}
                        onDragLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#94A3B8'; (e.currentTarget as HTMLElement).style.backgroundColor = '#F8FAFC'; }}
                      >
                        <Upload style={{ width: 24, height: 24, color: '#94A3B8', marginBottom: 8 }} />
                        <p style={{ fontSize: 13, color: '#475569', margin: 0, textAlign: 'center' }}>
                          Kéo thả file hoặc <span style={{ color: '#1D4ED8', fontWeight: 500 }}>click để chọn</span>
                        </p>
                        <p style={{ fontSize: 12, color: '#94A3B8', margin: '4px 0 0' }}>
                          PDF, DOC, DOCX — tối đa 10MB/file
                        </p>
                        <input
                          type="file"
                          multiple
                          accept=".pdf,.doc,.docx"
                          style={{ display: 'none' }}
                          onChange={(e) => handleMockUpload(e, 'technical')}
                        />
                      </label>
                    )}
                    {techFiles.length > 0 && (
                      <div className="space-y-2">
                        {techFiles.map((file, idx) => (
                          <div
                            key={idx}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 8,
                              padding: '8px 12px',
                              backgroundColor: '#F1F5F9',
                              borderRadius: 6,
                            }}
                          >
                            <Paperclip style={{ width: 14, height: 14, color: '#64748B', flexShrink: 0 }} />
                            <span style={{ flex: 1, fontSize: 13, color: '#1E293B' }}>{file.name}</span>
                            <span style={{ fontSize: 12, color: '#94A3B8' }}>
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </span>
                            {canSubmit && (
                              <button
                                onClick={() => removeFile('technical', idx)}
                                style={{ padding: 2, color: '#94A3B8', border: 'none', background: 'none', cursor: 'pointer' }}
                              >
                                <X style={{ width: 14, height: 14 }} />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    {techFiles.length === 0 && !canSubmit && (
                      <p style={{ fontSize: 13, color: '#94A3B8' }}>Không có tài liệu kỹ thuật</p>
                    )}
                  </div>

                  {/* Financial Proposal Upload */}
                  <div>
                    <Label
                      style={{ fontSize: 13, fontWeight: 500, color: '#475569', display: 'block', marginBottom: 6 }}
                    >
                      Hồ sơ đề xuất tài chính{' '}
                      {canSubmit && <span style={{ color: '#DC2626' }}>*</span>}
                    </Label>
                    {canSubmit && (
                      <label
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '2px dashed #94A3B8',
                          borderRadius: 8,
                          padding: '20px 16px',
                          backgroundColor: '#F8FAFC',
                          cursor: 'pointer',
                          marginBottom: 8,
                        }}
                      >
                        <Upload style={{ width: 24, height: 24, color: '#94A3B8', marginBottom: 8 }} />
                        <p style={{ fontSize: 13, color: '#475569', margin: 0, textAlign: 'center' }}>
                          Kéo thả file hoặc <span style={{ color: '#1D4ED8', fontWeight: 500 }}>click để chọn</span>
                        </p>
                        <p style={{ fontSize: 12, color: '#94A3B8', margin: '4px 0 0' }}>
                          PDF, XLS, XLSX — tối đa 10MB/file
                        </p>
                        <input
                          type="file"
                          multiple
                          accept=".pdf,.xls,.xlsx"
                          style={{ display: 'none' }}
                          onChange={(e) => handleMockUpload(e, 'financial')}
                        />
                      </label>
                    )}
                    {finFiles.length > 0 && (
                      <div className="space-y-2">
                        {finFiles.map((file, idx) => (
                          <div
                            key={idx}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 8,
                              padding: '8px 12px',
                              backgroundColor: '#F1F5F9',
                              borderRadius: 6,
                            }}
                          >
                            <Paperclip style={{ width: 14, height: 14, color: '#64748B', flexShrink: 0 }} />
                            <span style={{ flex: 1, fontSize: 13, color: '#1E293B' }}>{file.name}</span>
                            <span style={{ fontSize: 12, color: '#94A3B8' }}>
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </span>
                            {canSubmit && (
                              <button
                                onClick={() => removeFile('financial', idx)}
                                style={{ padding: 2, color: '#94A3B8', border: 'none', background: 'none', cursor: 'pointer' }}
                              >
                                <X style={{ width: 14, height: 14 }} />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    {finFiles.length === 0 && !canSubmit && (
                      <p style={{ fontSize: 13, color: '#94A3B8' }}>Không có tài liệu tài chính</p>
                    )}
                  </div>

                  {/* Submit Button */}
                  {canSubmit && (
                    <div style={{ display: 'flex', gap: 12, paddingTop: 8 }}>
                      <Button
                        onClick={handleSubmitBid}
                        disabled={isSubmitting}
                        style={{
                          backgroundColor: '#1D4ED8',
                          color: '#fff',
                          fontWeight: 500,
                          padding: '10px 20px',
                          flex: 1,
                        }}
                      >
                        {isSubmitting
                          ? 'Đang xử lý...'
                          : existingBid
                          ? 'Cập nhật hồ sơ'
                          : 'Nộp hồ sơ dự thầu'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => navigate('/supplier/tenders')}
                        style={{ borderColor: '#CBD5E1', color: '#334155' }}
                      >
                        Hủy
                      </Button>
                    </div>
                  )}

                  {/* Evaluation result if evaluated */}
                  {existingBid && existingBid.technicalScore !== undefined && (
                    <>
                      <Separator />
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 500, color: '#1E293B', marginBottom: 12 }}>
                          Kết quả đánh giá
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                          {[
                            { label: 'Điểm kỹ thuật', value: existingBid.technicalScore?.toFixed(1) },
                            { label: 'Điểm tài chính', value: existingBid.priceScore?.toFixed(1) },
                            {
                              label: 'Tổng điểm',
                              value: existingBid.totalScore?.toFixed(1),
                              highlight: true,
                            },
                          ].map((item, i) => (
                            <div
                              key={i}
                              style={{
                                padding: '12px 16px',
                                backgroundColor: item.highlight ? '#F0FDF4' : '#F8FAFC',
                                border: `1px solid ${item.highlight ? '#86EFAC' : '#E2E8F0'}`,
                                borderRadius: 8,
                                textAlign: 'center',
                              }}
                            >
                              <p style={{ fontSize: 12, color: '#64748B', margin: '0 0 4px' }}>
                                {item.label}
                              </p>
                              <p
                                style={{
                                  fontSize: 22,
                                  fontWeight: 700,
                                  color: item.highlight ? '#15803D' : '#1E293B',
                                  margin: 0,
                                }}
                              >
                                {item.value ?? '—'}
                              </p>
                            </div>
                          ))}
                        </div>
                        {existingBid.evaluationNote && (
                          <div
                            style={{
                              marginTop: 12,
                              padding: '10px 14px',
                              backgroundColor: '#F8FAFC',
                              border: '1px solid #E2E8F0',
                              borderRadius: 6,
                            }}
                          >
                            <p style={{ fontSize: 12, color: '#64748B', marginBottom: 4 }}>Nhận xét:</p>
                            <p style={{ fontSize: 14, color: '#1E293B', margin: 0 }}>
                              {existingBid.evaluationNote}
                            </p>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '32px 16px',
                    color: '#94A3B8',
                  }}
                >
                  <Info style={{ width: 32, height: 32, marginBottom: 12, margin: '0 auto 12px' }} />
                  <p style={{ fontSize: 14, color: '#475569' }}>
                    {isExpired
                      ? 'Gói thầu đã đóng — không còn nhận hồ sơ dự thầu'
                      : `Gói thầu đang ở trạng thái "${stateConfig?.label}" — chưa mở nhận hồ sơ`}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── Right column ─────────────────────────────────────────────────── */}
        <div className="space-y-6">
          {/* Timeline */}
          <Card style={{ border: '1px solid #E2E8F0' }}>
            <CardHeader style={{ paddingBottom: 12 }}>
              <CardTitle style={{ fontSize: 16, color: '#1E293B' }}>Tiến trình</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { label: 'Ngày công bố', value: tender.publishedDate },
                  { label: 'Hạn nộp hồ sơ', value: tender.deadlineDate },
                  { label: 'Ngày mở thầu', value: tender.openingDate },
                  { label: 'Kết thúc chờ phản đối', value: tender.standstillEndDate },
                ]
                  .filter(item => item.value)
                  .map((item, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 13, color: '#64748B' }}>{item.label}</span>
                      <span style={{ fontSize: 13, fontWeight: 500, color: '#1E293B' }}>
                        {formatDate(item.value!)}
                      </span>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Organizer Info */}
          <Card style={{ border: '1px solid #E2E8F0' }}>
            <CardHeader style={{ paddingBottom: 12 }}>
              <CardTitle style={{ fontSize: 16, color: '#1E293B' }}>Bên mời thầu</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <Building style={{ width: 16, height: 16, color: '#64748B', marginTop: 2, flexShrink: 0 }} />
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#1E293B', margin: 0 }}>
                      Trường THPT Nguyễn Huệ
                    </p>
                    <p style={{ fontSize: 13, color: '#64748B', margin: '2px 0 0' }}>
                      123 Đường Lê Lợi, Quận 1, TP.HCM
                    </p>
                    <p style={{ fontSize: 13, color: '#64748B', margin: '2px 0 0' }}>
                      (028) 3829 1234
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bid Summary if has bid */}
          {existingBid && (
            <Card style={{ border: '1px solid #E2E8F0', backgroundColor: '#FAFCFF' }}>
              <CardHeader style={{ paddingBottom: 12 }}>
                <CardTitle style={{ fontSize: 16, color: '#1E293B' }}>Tóm tắt hồ sơ</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 13, color: '#64748B' }}>Trạng thái</span>
                    <StatusBadge status={existingBid.status === 'rejected' ? 'cancelled' : existingBid.status} type="bid" size="sm" />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 13, color: '#64748B' }}>Giá dự thầu</span>
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: '#1E293B',
                        fontFamily: "'IBM Plex Mono', monospace",
                      }}
                    >
                      {formatCurrency(existingBid.bidAmount || 0)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 13, color: '#64748B' }}>Ngày nộp</span>
                    <span style={{ fontSize: 13, color: '#1E293B' }}>
                      {formatDate(existingBid.submittedAt)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 13, color: '#64748B' }}>Hồ sơ kỹ thuật</span>
                    <span style={{ fontSize: 13, color: '#1E293B' }}>
                      {existingBid.technicalProposal.length} tài liệu
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 13, color: '#64748B' }}>Hồ sơ tài chính</span>
                    <span style={{ fontSize: 13, color: '#1E293B' }}>
                      {existingBid.financialProposal.length} tài liệu
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
