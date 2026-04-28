import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { storage } from '../../../lib/storage';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { StatusBadge } from '../../../components/shared/StatusBadge';
import { EmptyState } from '../../../components/shared/EmptyState';
import { Plus, Search, Filter } from 'lucide-react';
import { formatCurrency, formatDate } from '../../../lib/utils';
import { BIDDING_METHODS } from '../../../lib/constants';
import type { BiddingProject, BiddingState } from '../../../lib/types';

export function BiddingList() {
  const [projects, setProjects] = useState<BiddingProject[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<BiddingProject[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [stateFilter, setStateFilter] = useState<string>('all');
  const [methodFilter, setMethodFilter] = useState<string>('all');

  useEffect(() => {
    const allProjects = storage.getBiddingProjects();
    setProjects(allProjects);
    setFilteredProjects(allProjects);
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

    // Filter by method
    if (methodFilter !== 'all') {
      filtered = filtered.filter(p => p.method === methodFilter);
    }

    setFilteredProjects(filtered);
  }, [searchQuery, stateFilter, methodFilter, projects]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Đấu thầu chính thức</h1>
          <p className="text-muted-foreground mt-1">Quản lý gói thầu theo Luật 2023</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Tạo gói thầu mới
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
                  placeholder="Tìm theo tên hoặc mã gói thầu..."
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
                <SelectItem value="standstill">Chờ phản đối</SelectItem>
                <SelectItem value="winner_announced">Đã công bố trúng thầu</SelectItem>
                <SelectItem value="contract_signed">Đã ký hợp đồng</SelectItem>
                <SelectItem value="cancelled">Đã hủy</SelectItem>
              </SelectContent>
            </Select>

            <Select value={methodFilter} onValueChange={setMethodFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Phương thức" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả phương thức</SelectItem>
                <SelectItem value="open">Đấu thầu rộng rãi</SelectItem>
                <SelectItem value="limited">Đấu thầu hạn chế</SelectItem>
                <SelectItem value="direct">Chỉ định thầu</SelectItem>
                <SelectItem value="shopping">Chào hàng cạnh tranh</SelectItem>
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
              title="Không tìm thấy gói thầu"
              description="Thử thay đổi bộ lọc hoặc tạo gói thầu mới"
              action={{
                label: 'Tạo gói thầu mới',
                onClick: () => {},
              }}
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã gói thầu</TableHead>
                    <TableHead>Tên gói thầu</TableHead>
                    <TableHead>Phương thức</TableHead>
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
                      <TableCell>
                        <span className="text-sm">
                          {BIDDING_METHODS[project.method].label}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(project.estimatedValue)}
                      </TableCell>
                      <TableCell>{formatDate(project.createdAt)}</TableCell>
                      <TableCell>
                        <StatusBadge status={project.currentState} type="bidding" />
                      </TableCell>
                      <TableCell className="text-right">
                        <Link to={`/staff/bidding/${project.id}`}>
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
            <span className="font-medium">{projects.length}</span> gói thầu
          </p>
        </div>
      )}
    </div>
  );
}