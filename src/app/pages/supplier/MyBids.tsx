import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { storage } from '../../lib/storage';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { EmptyState } from '../../components/shared/EmptyState';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { Search, FileText, Eye } from 'lucide-react';
import { formatCurrency, formatDate } from '../../lib/utils';
import type { Bid, BiddingProject, Supplier as SupplierType } from '../../lib/types';

interface BidWithProject extends Bid {
  project?: BiddingProject;
}

export function MyBids() {
  const { user } = useAuth();
  const [supplier, setSupplier] = useState<SupplierType | null>(null);
  const [bids, setBids] = useState<BidWithProject[]>([]);
  const [filteredBids, setFilteredBids] = useState<BidWithProject[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!user) return;

    const allSuppliers = storage.getSuppliers();
    const currentSupplier = allSuppliers.find(s => s.email === user.email);
    setSupplier(currentSupplier || null);

    if (!currentSupplier) return;

    const projects = storage.getBiddingProjects();
    const myBids: BidWithProject[] = [];

    projects.forEach(project => {
      const bid = project.bids.find(b => b.supplierId === currentSupplier.id);
      if (bid) {
        myBids.push({ ...bid, project });
      }
    });

    // Sort by submitted date, newest first
    myBids.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

    setBids(myBids);
    setFilteredBids(myBids);
  }, [user]);

  useEffect(() => {
    if (searchQuery) {
      const filtered = bids.filter(bid =>
        bid.project?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bid.project?.code.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredBids(filtered);
    } else {
      setFilteredBids(bids);
    }
  }, [searchQuery, bids]);

  const winnerBids = bids.filter(b => b.status === 'winner').length;
  const evaluatedBids = bids.filter(b => b.status === 'evaluated').length;
  const submittedBids = bids.filter(b => b.status === 'submitted').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Hồ sơ đã nộp</h1>
        <p className="text-muted-foreground mt-1">Quản lý các hồ sơ dự thầu đã nộp</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{bids.length}</div>
            <p className="text-sm text-muted-foreground">Tổng số hồ sơ</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{submittedBids}</div>
            <p className="text-sm text-muted-foreground">Chờ đánh giá</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{evaluatedBids}</div>
            <p className="text-sm text-muted-foreground">Đã đánh giá</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-success">{winnerBids}</div>
            <p className="text-sm text-muted-foreground">Trúng thầu</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm theo tên hoặc mã gói thầu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Bids Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách hồ sơ dự thầu</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredBids.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="Chưa có hồ sơ nào"
              description="Bạn chưa nộp hồ sơ dự thầu nào. Hãy xem các gói thầu đang mở để tham gia."
              action={
                <Link to="/supplier/tenders">
                  <Button>Xem gói thầu đang mở</Button>
                </Link>
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã gói thầu</TableHead>
                    <TableHead>Tên gói thầu</TableHead>
                    <TableHead>Giá dự thầu</TableHead>
                    <TableHead>Ngày nộp</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-center">Điểm</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBids.map((bid) => (
                    <TableRow key={bid.id}>
                      <TableCell className="font-mono text-sm">
                        {bid.project?.code}
                      </TableCell>
                      <TableCell>
                        <div className="max-w-md">
                          <p className="font-medium line-clamp-2">{bid.project?.name}</p>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono">
                        {formatCurrency(bid.bidAmount)}
                      </TableCell>
                      <TableCell>{formatDate(bid.submittedAt)}</TableCell>
                      <TableCell>
                        <StatusBadge
                          status={bid.status === 'rejected' ? 'cancelled' : bid.status}
                          type="bid"
                          size="sm"
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        {bid.totalScore !== undefined ? (
                          <span className="font-semibold">{bid.totalScore.toFixed(2)}</span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Link to={`/supplier/tenders/${bid.project?.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
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

      {/* Evaluation Details for evaluated bids */}
      {filteredBids.filter(b => b.technicalScore !== undefined).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Chi tiết đánh giá</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredBids
                .filter(b => b.technicalScore !== undefined)
                .map((bid) => (
                  <div key={bid.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-semibold">{bid.project?.name}</p>
                        <p className="text-sm text-muted-foreground">{bid.project?.code}</p>
                      </div>
                      <StatusBadge
                        status={bid.status === 'rejected' ? 'cancelled' : bid.status}
                        type="bid"
                        size="sm"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Điểm kỹ thuật</p>
                        <p className="font-semibold text-lg">
                          {bid.technicalScore?.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Điểm giá</p>
                        <p className="font-semibold text-lg">
                          {bid.priceScore?.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Tổng điểm</p>
                        <p className="font-semibold text-lg text-success">
                          {bid.totalScore?.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    {bid.evaluationNote && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-sm text-muted-foreground">Nhận xét:</p>
                        <p className="text-sm mt-1">{bid.evaluationNote}</p>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}