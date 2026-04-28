import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { storage } from '../../lib/storage';
import { useAuth } from '../../contexts/AuthContext';
import { KPICard } from '../../components/shared/KPICard';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Search, FileText, FileCheck, ArrowRight, Clock } from 'lucide-react';
import { formatCurrency, formatDate, daysRemaining } from '../../lib/utils';
import type { BiddingProject, Bid, Contract, Supplier as SupplierType } from '../../lib/types';

export function SupplierDashboard() {
  const { user } = useAuth();
  const [supplier, setSupplier] = useState<SupplierType | null>(null);
  const [openTenders, setOpenTenders] = useState<BiddingProject[]>([]);
  const [myBids, setMyBids] = useState<Bid[]>([]);
  const [myContracts, setMyContracts] = useState<Contract[]>([]);

  useEffect(() => {
    if (!user) return;

    const allSuppliers = storage.getSuppliers();
    const currentSupplier = allSuppliers.find(s => s.email === user.email);
    setSupplier(currentSupplier || null);

    if (!currentSupplier) return;

    const projects = storage.getBiddingProjects();
    const openProjects = projects.filter(
      p => p.currentState === 'bidding_open' && p.deadlineDate && new Date(p.deadlineDate) > new Date()
    );
    setOpenTenders(openProjects);

    const allBids = projects.flatMap(p => p.bids.filter(b => b.supplierId === currentSupplier.id));
    setMyBids(allBids);

    const contracts = storage.getContracts();
    const supplierContracts = contracts.filter(c => c.supplierId === currentSupplier.id);
    setMyContracts(supplierContracts);
  }, [user]);

  const activeContracts = myContracts.filter(c => c.status === 'executing').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Chào mừng, {supplier?.companyName}</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <KPICard
          label="Gói thầu đang mở"
          value={openTenders.length}
          icon={Search}
        />
        <KPICard
          label="Hồ sơ đã nộp"
          value={myBids.length}
          icon={FileText}
        />
        <KPICard
          label="Hợp đồng đang thực hiện"
          value={activeContracts}
          icon={FileCheck}
        />
      </div>

      {/* Open Tenders - Card Grid */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Gói thầu mới nhất</CardTitle>
          <Link to="/supplier/tenders">
            <Button variant="ghost" size="sm">
              Xem tất cả
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {openTenders.slice(0, 6).map((tender) => {
              const days = tender.deadlineDate ? daysRemaining(tender.deadlineDate) : 0;
              const isNew = new Date(tender.publishedDate!).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000;

              return (
                <Card key={tender.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <StatusBadge status={tender.currentState} type="bidding" size="sm" />
                          {isNew && (
                            <Badge className="shrink-0" style={{ backgroundColor: '#FEF3C7', color: '#D97706', borderColor: '#FCD34D' }}>
                              Mới
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-base font-semibold line-clamp-2">{tender.name}</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Giá trị:</span>
                        <span className="font-medium">{formatCurrency(tender.estimatedValue)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Hạn nộp:</span>
                        <span className="font-medium">{tender.deadlineDate ? formatDate(tender.deadlineDate) : 'N/A'}</span>
                      </div>
                    </div>

                    {tender.deadlineDate && (
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4" style={{ color: days <= 3 ? '#DC2626' : '#B45309' }} />
                        <span className="font-medium" style={{ color: days <= 3 ? '#DC2626' : '#B45309' }}>
                          {days > 0 ? `Còn ${days} ngày` : 'Đã hết hạn'}
                        </span>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Link to={`/supplier/tenders/${tender.id}`} className="flex-1">
                        <Button size="sm" variant="outline" className="w-full">
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

            {openTenders.length === 0 && (
              <div className="col-span-full py-12 text-center">
                <Search className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-semibold">Chưa có gói thầu mở</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Hiện tại không có gói thầu nào đang mở. Vui lòng quay lại sau.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Notification Area for Bidding Results */}
      {myBids.filter(b => b.status === 'winner').length > 0 && (
        <Card style={{ backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' }}>
          <CardHeader>
            <CardTitle style={{ color: '#15803D' }}>Thông báo kết quả đấu thầu</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {myBids
                .filter(b => b.status === 'winner')
                .map((bid) => {
                  const project = storage.getBiddingProjects().find(p => p.id === bid.biddingProjectId);
                  return (
                    <div key={bid.id} className="flex items-center justify-between p-3 bg-card rounded-lg border">
                      <div>
                        <p className="font-medium">{project?.name}</p>
                        <p className="text-sm text-muted-foreground">Chúc mừng! Bạn đã trúng thầu</p>
                      </div>
                      <Link to="/supplier/my-bids">
                        <Button size="sm">Xem chi tiết</Button>
                      </Link>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}