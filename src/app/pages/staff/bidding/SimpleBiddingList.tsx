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
import { Plus, Search, Filter } from 'lucide-react';
import { formatCurrency, formatDate } from '../../../lib/utils';
import type { BiddingProject, BiddingState } from '../../../lib/types';

export function SimpleBiddingList() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<BiddingProject[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<BiddingProject[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [stateFilter, setStateFilter] = useState<string>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    estimatedValue: '',
    publishedDate: '',
    deadlineDate: '',
  });

  const loadProjects = () => {
    const allProjects = storage.getBiddingProjects();
    const simpleProjects = allProjects.filter(p => p.method === 'shopping');
    setProjects(simpleProjects);
    setFilteredProjects(simpleProjects);
  };

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    let filtered = projects;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.code.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by state
    if (stateFilter !== 'all') {
      filtered = filtered.filter(p => p.currentState === stateFilter);
    }

    setFilteredProjects(filtered);
  }, [searchQuery, stateFilter, projects]);

  const handleCreateProject = () => {
    if (!formData.code || !formData.name || !formData.estimatedValue) {
      return;
    }

    const newProject: BiddingProject = {
      id: `bid-${Date.now()}`,
      code: formData.code,
      name: formData.name,
      description: formData.description || '',
      method: 'shopping',
      estimatedValue: parseFloat(formData.estimatedValue),
      currentState: 'draft',
      createdAt: new Date().toISOString(),
      publishedDate: formData.publishedDate || undefined,
      deadlineDate: formData.deadlineDate || undefined,
      bids: [],
      complaints: [],
      stateHistory: [
        {
          state: 'draft',
          changedBy: 'user-1',
          changedAt: new Date().toISOString(),
          note: 'Tạo chào hàng mới',
        },
      ],
    };

    storage.saveBiddingProject(newProject);
    setShowCreateDialog(false);
    setFormData({
      code: '',
      name: '',
      description: '',
      estimatedValue: '',
      publishedDate: '',
      deadlineDate: '',
    });
    loadProjects();
    navigate(`/staff/bidding/simple/${newProject.id}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Đấu thầu đơn giản</h1>
          <p className="text-muted-foreground mt-1">Chào hàng cạnh tranh - Quy trình đơn giản hóa</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Tạo chào hàng mới
        </Button>
      </div>

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
                  placeholder="Tìm theo tên hoặc mã chào hàng..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <Select value={stateFilter} onValueChange={setStateFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="draft">Nháp</SelectItem>
                <SelectItem value="pending_approval">Chờ phê duyệt</SelectItem>
                <SelectItem value="bidding_open">Đang mở thầu</SelectItem>
                <SelectItem value="evaluation">Đang đánh giá</SelectItem>
                <SelectItem value="winner_announced">Đã chọn nhà cung cấp</SelectItem>
                <SelectItem value="contract_signed">Đã ký hợp đồng</SelectItem>
                <SelectItem value="cancelled">Đã hủy</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Projects Table */}
      <Card>
        <CardContent className="p-0">
          {filteredProjects.length === 0 ? (
            <EmptyState
              title="Không tìm thấy chào hàng"
              description="Thử thay đổi bộ lọc hoặc tạo chào hàng mới"
              action={{
                label: 'Tạo chào hàng mới',
                onClick: () => setShowCreateDialog(true),
              }}
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã chào hàng</TableHead>
                    <TableHead>Tên chào hàng</TableHead>
                    <TableHead className="text-right">Giá trị ước tính</TableHead>
                    <TableHead>Ngày tạo</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProjects.map((project) => (
                    <TableRow key={project.id}>
                      <TableCell className="font-medium">{project.code}</TableCell>
                      <TableCell className="max-w-[300px]">
                        <div className="truncate">{project.name}</div>
                        <div className="text-xs text-muted-foreground truncate mt-0.5">
                          {project.description}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(project.estimatedValue)}
                      </TableCell>
                      <TableCell>{formatDate(project.createdAt)}</TableCell>
                      <TableCell>
                        <StatusBadge status={project.currentState} type="bidding" />
                      </TableCell>
                      <TableCell className="text-right">
                        <Link to={`/staff/bidding/simple/${project.id}`}>
                          <Button variant="outline" size="sm">
                            Chi tiết
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {filteredProjects.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Hiển thị <span className="font-medium">{filteredProjects.length}</span> trong{' '}
            <span className="font-medium">{projects.length}</span> chào hàng
          </p>
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Tạo chào hàng cạnh tranh mới</DialogTitle>
            <DialogDescription>
              Nhập thông tin cơ bản cho chào hàng. Bạn có thể bổ sung chi tiết sau khi tạo.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code">Mã chào hàng *</Label>
                <Input
                  id="code"
                  placeholder="CH-2026-001"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="estimatedValue">Giá trị ước tính (VNĐ) *</Label>
                <Input
                  id="estimatedValue"
                  type="number"
                  placeholder="50000000"
                  value={formData.estimatedValue}
                  onChange={(e) => setFormData({ ...formData, estimatedValue: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Tên chào hàng *</Label>
              <Input
                id="name"
                placeholder="Mua sắm thiết bị văn phòng..."
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                placeholder="Mô tả chi tiết về chào hàng..."
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="publishedDate">Ngày công bố</Label>
                <Input
                  id="publishedDate"
                  type="date"
                  value={formData.publishedDate}
                  onChange={(e) => setFormData({ ...formData, publishedDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deadlineDate">Hạn nộp báo giá</Label>
                <Input
                  id="deadlineDate"
                  type="date"
                  value={formData.deadlineDate}
                  onChange={(e) => setFormData({ ...formData, deadlineDate: e.target.value })}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateDialog(false);
                setFormData({
                  code: '',
                  name: '',
                  description: '',
                  estimatedValue: '',
                  publishedDate: '',
                  deadlineDate: '',
                });
              }}
            >
              Hủy
            </Button>
            <Button
              onClick={handleCreateProject}
              disabled={!formData.code || !formData.name || !formData.estimatedValue}
            >
              Tạo chào hàng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
