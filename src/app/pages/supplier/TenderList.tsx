import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { storage } from '../../lib/storage';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { EmptyState } from '../../components/shared/EmptyState';
import { Search, Clock, FileText } from 'lucide-react';
import { formatCurrency, formatDate, daysRemaining } from '../../lib/utils';
import { BIDDING_METHODS } from '../../lib/constants';
import type { BiddingProject } from '../../lib/types';

export function TenderList() {
  const { user } = useAuth();
  const [tenders, setTenders] = useState<BiddingProject[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTenders, setFilteredTenders] = useState<BiddingProject[]>([]);

  useEffect(() => {
    const projects = storage.getBiddingProjects();
    const openTenders = projects.filter(
      p => p.currentState === 'bidding_open' && p.deadlineDate && new Date(p.deadlineDate) > new Date()
    );
    setTenders(openTenders);
    setFilteredTenders(openTenders);
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = tenders.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.code.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredTenders(filtered);
    } else {
      setFilteredTenders(tenders);
    }
  }, [searchQuery, tenders]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Gói thầu đang mở</h1>
        <p className="text-muted-foreground mt-1">Tìm kiếm và nộp hồ sơ dự thầu</p>
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

      {/* Tender Cards Grid */}
      {filteredTenders.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <EmptyState
              icon={Search}
              title="Không tìm thấy gói thầu"
              description="Hiện tại không có gói thầu nào đang mở hoặc không khớp với từ khóa tìm kiếm"
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTenders.map((tender) => {
            const days = tender.deadlineDate ? daysRemaining(tender.deadlineDate) : 0;
            const isNew = new Date(tender.publishedDate!).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000;
            const isUrgent = days <= 3 && days > 0;

            return (
              <Card key={tender.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <StatusBadge status={tender.currentState} type="bidding" size="sm" />
                        <Badge variant="outline" className="text-xs">
                          {BIDDING_METHODS[tender.method].label}
                        </Badge>
                        {isNew && (
                          <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
                            Mới
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-base font-semibold line-clamp-2">
                        {tender.name}
                      </CardTitle>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Mã: {tender.code}</p>
                </CardHeader>

                <CardContent className="space-y-3">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Giá trị:</span>
                      <span className="font-semibold">{formatCurrency(tender.estimatedValue)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Công bố:</span>
                      <span className="font-medium">
                        {tender.publishedDate ? formatDate(tender.publishedDate) : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Hạn nộp:</span>
                      <span className="font-medium">
                        {tender.deadlineDate ? formatDate(tender.deadlineDate) : 'N/A'}
                      </span>
                    </div>
                  </div>

                  {tender.deadlineDate && (
                    <div
                      className={`flex items-center gap-2 p-2 rounded ${
                        isUrgent ? 'bg-red-50 dark:bg-red-900/10' : 'bg-orange-50 dark:bg-orange-900/10'
                      }`}
                    >
                      <Clock className={`h-4 w-4 ${isUrgent ? 'text-red-600' : 'text-orange-600'}`} />
                      <span
                        className={`text-sm font-medium ${
                          isUrgent ? 'text-red-700 dark:text-red-400' : 'text-orange-700 dark:text-orange-400'
                        }`}
                      >
                        {days > 0 ? `Còn ${days} ngày` : 'Đã hết hạn'}
                        {days <= 1 && days > 0 && ' - Khẩn cấp!'}
                      </span>
                    </div>
                  )}

                  <div className="pt-2 flex gap-2">
                    <Link to={`/supplier/tenders/${tender.id}`} className="flex-1">
                      <Button size="sm" variant="outline" className="w-full">
                        <FileText className="mr-2 h-4 w-4" />
                        Xem chi tiết
                      </Button>
                    </Link>
                    <Link to={`/supplier/tenders/${tender.id}#submit`} className="flex-1">
                      <Button size="sm" className="w-full">
                        Nộp hồ sơ
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Stats */}
      {filteredTenders.length > 0 && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{filteredTenders.length}</div>
              <p className="text-sm text-muted-foreground">Gói thầu đang mở</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {filteredTenders.filter(t => t.deadlineDate && daysRemaining(t.deadlineDate) <= 3).length}
              </div>
              <p className="text-sm text-muted-foreground">Sắp hết hạn (≤ 3 ngày)</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {formatCurrency(filteredTenders.reduce((sum, t) => sum + t.estimatedValue, 0))}
              </div>
              <p className="text-sm text-muted-foreground">Tổng giá trị</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}