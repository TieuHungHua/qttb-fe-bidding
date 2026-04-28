import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { storage } from '../../../lib/storage';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import { StatusBadge } from '../../../components/shared/StatusBadge';
import { EmptyState } from '../../../components/shared/EmptyState';
import { Plus, Search, Filter, FileText, Eye, Calendar } from 'lucide-react';
import { formatDate, formatDateTime } from '../../../lib/utils';
import type { ApprovalDocument, FormTemplate } from '../../../lib/types';

export function PAWList() {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<ApprovalDocument[]>([]);
  const [templates, setTemplates] = useState<FormTemplate[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<ApprovalDocument[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    templateId: '',
    title: '',
    code: '',
  });

  const loadData = () => {
    const allDocs = storage.getApprovalDocuments();
    const allTemplates = storage.getFormTemplates();
    setDocuments(allDocs);
    setTemplates(allTemplates);
    setFilteredDocuments(allDocs);
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    let filtered = documents;

    if (searchQuery) {
      filtered = filtered.filter(d =>
        d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.code.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(d => d.status === statusFilter);
    }

    setFilteredDocuments(filtered);
  }, [searchQuery, statusFilter, documents]);

  const handleCreateDocument = () => {
    if (!formData.templateId || !formData.title || !formData.code) {
      return;
    }

    const template = templates.find(t => t.id === formData.templateId);
    if (!template) return;

    const newDoc: ApprovalDocument = {
      id: `doc-${Date.now()}`,
      code: formData.code,
      templateId: formData.templateId,
      title: formData.title,
      content: {},
      currentStep: 0,
      approvalHistory: [],
      status: 'pending',
      createdBy: 'user-1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    storage.saveApprovalDocument(newDoc);
    setShowCreateDialog(false);
    setFormData({
      templateId: '',
      title: '',
      code: '',
    });
    loadData();
    navigate(`/staff/paw/${newDoc.id}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tờ trình phê duyệt (PAW)</h1>
          <p className="text-muted-foreground mt-1">Quản lý tờ trình và quy trình phê duyệt</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/staff/paw/builder')}>
            <FileText className="mr-2 h-4 w-4" />
            Quản lý mẫu
          </Button>
          <Button onClick={() => setShowCreateDialog(true)} disabled={templates.length === 0}>
            <Plus className="mr-2 h-4 w-4" />
            Tạo tờ trình mới
          </Button>
        </div>
      </div>

      {templates.length === 0 && (
        <Card style={{ backgroundColor: '#FEF3C7', border: '1px solid #FCD34D' }}>
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <FileText style={{ width: 20, height: 20, color: '#D97706', flexShrink: 0 }} />
              <div>
                <p style={{ fontSize: '14px', fontWeight: 600, color: '#92400E' }}>
                  Chưa có mẫu tờ trình
                </p>
                <p style={{ fontSize: '13px', color: '#78350F', marginTop: '4px' }}>
                  Bạn cần tạo ít nhất một mẫu tờ trình trước khi có thể tạo tờ trình mới.{' '}
                  <button
                    onClick={() => navigate('/staff/paw/builder')}
                    style={{ textDecoration: 'underline', fontWeight: 500, cursor: 'pointer', background: 'none', border: 'none', color: '#78350F' }}
                  >
                    Tạo mẫu ngay
                  </button>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Bộ lọc
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm theo tiêu đề hoặc mã tờ trình..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="pending">Đang chờ</SelectItem>
                <SelectItem value="approved">Đã duyệt</SelectItem>
                <SelectItem value="rejected">Đã từ chối</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Documents Table */}
      <Card>
        <CardContent className="p-0">
          {filteredDocuments.length === 0 ? (
            <EmptyState
              title="Không tìm thấy tờ trình"
              description="Thử thay đổi bộ lọc hoặc tạo tờ trình mới"
              action={templates.length > 0 ? {
                label: 'Tạo tờ trình mới',
                onClick: () => setShowCreateDialog(true),
              } : undefined}
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã tờ trình</TableHead>
                    <TableHead>Tiêu đề</TableHead>
                    <TableHead>Mẫu</TableHead>
                    <TableHead>Bước hiện tại</TableHead>
                    <TableHead>Ngày tạo</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDocuments.map((doc) => {
                    const template = templates.find(t => t.id === doc.templateId);
                    const creator = storage.getUserById(doc.createdBy);
                    const totalSteps = template?.approvalSteps.length || 0;

                    return (
                      <TableRow key={doc.id}>
                        <TableCell className="font-medium">{doc.code}</TableCell>
                        <TableCell className="max-w-[300px]">
                          <div className="truncate">{doc.title}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            Bởi: {creator?.name}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{template?.name || '—'}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm font-mono">
                            {doc.status === 'approved' ? 'Hoàn tất' : doc.status === 'rejected' ? 'Bị từ chối' : `${doc.currentStep + 1}/${totalSteps}`}
                          </span>
                        </TableCell>
                        <TableCell>{formatDate(doc.createdAt)}</TableCell>
                        <TableCell>
                          <StatusBadge
                            status={doc.status === 'approved' ? 'approved' : doc.status === 'rejected' ? 'rejected' : 'pending'}
                            type="budget"
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <Link to={`/staff/paw/${doc.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="mr-1 h-3 w-3" />
                              Xem
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {filteredDocuments.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Hiển thị <span className="font-medium">{filteredDocuments.length}</span> trong{' '}
            <span className="font-medium">{documents.length}</span> tờ trình
          </p>
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Tạo tờ trình mới</DialogTitle>
            <DialogDescription>
              Chọn mẫu tờ trình và nhập thông tin cơ bản
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="templateId">Mẫu tờ trình *</Label>
              <Select value={formData.templateId} onValueChange={(value) => setFormData({ ...formData, templateId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn mẫu tờ trình" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map(template => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="code">Mã tờ trình *</Label>
              <Input
                id="code"
                placeholder="TT-2026-001"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Tiêu đề *</Label>
              <Input
                id="title"
                placeholder="Tờ trình mua sắm thiết bị..."
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateDialog(false);
                setFormData({ templateId: '', title: '', code: '' });
              }}
            >
              Hủy
            </Button>
            <Button
              onClick={handleCreateDocument}
              disabled={!formData.templateId || !formData.title || !formData.code}
            >
              Tạo tờ trình
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
