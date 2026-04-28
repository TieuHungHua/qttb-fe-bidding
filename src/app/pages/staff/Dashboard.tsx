import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { storage } from '../../lib/storage';
import { generateMonthlyContractData, generateBudgetPieData } from '../../lib/mockData';
import { KPICard } from '../../components/shared/KPICard';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { MonthlyContractChart } from '../../components/charts/MonthlyContractChart';
import { BudgetAllocationPie } from '../../components/charts/BudgetAllocationPie';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Button } from '../../components/ui/button';
import { Gavel, FileText, Building2, Wallet, ArrowRight } from 'lucide-react';
import { formatCurrency, formatDate } from '../../lib/utils';
import type { BiddingProject, PurchaseOrder } from '../../lib/types';

export function StaffDashboard() {
  const [biddingProjects, setBiddingProjects] = useState<BiddingProject[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [kpis, setKpis] = useState({
    activeBidding: 0,
    activeContracts: 0,
    approvedSuppliers: 0,
    totalBudget: 0,
  });

  useEffect(() => {
    const projects = storage.getBiddingProjects();
    const contracts = storage.getContracts();
    const suppliers = storage.getSuppliers();
    const budget = storage.getYearBudget();
    const orders = storage.getPurchaseOrders();

    setBiddingProjects(projects);
    setPurchaseOrders(orders);

    setKpis({
      activeBidding: projects.filter(p =>
        ['bidding_open', 'evaluation', 'standstill', 'winner_announced'].includes(p.currentState)
      ).length,
      activeContracts: contracts.filter(c => c.status === 'executing').length,
      approvedSuppliers: suppliers.filter(s => s.status === 'approved').length,
      totalBudget: budget.totalAmount,
    });
  }, []);

  const recentBidding = biddingProjects
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const pendingPOs = purchaseOrders
    .filter(po => po.status === 'approved' || po.status === 'partial')
    .slice(0, 5);

  const monthlyData = generateMonthlyContractData();
  const budgetPieData = generateBudgetPieData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Tổng quan hệ thống QTTB</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          label="Gói thầu đang hoạt động"
          value={kpis.activeBidding}
          icon={Gavel}
          delta={12}
          deltaType="increase"
        />
        <KPICard
          label="Hợp đồng đang thực hiện"
          value={kpis.activeContracts}
          icon={FileText}
          delta={5}
          deltaType="increase"
        />
        <KPICard
          label="Nhà cung cấp đã duyệt"
          value={kpis.approvedSuppliers}
          icon={Building2}
          delta={8}
          deltaType="increase"
        />
        <KPICard
          label="Ngân sách năm"
          value={kpis.totalBudget}
          icon={Wallet}
          format="currency"
          delta={-3}
          deltaType="decrease"
        />
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <MonthlyContractChart data={monthlyData} />
        <BudgetAllocationPie data={budgetPieData} />
      </div>

      {/* Recent Tables */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Recent Bidding Projects */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Gói thầu gần đây</CardTitle>
            <Link to="/staff/bidding">
              <Button variant="ghost" size="sm">
                Xem tất cả
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã gói thầu</TableHead>
                  <TableHead>Tên gói thầu</TableHead>
                  <TableHead>Trạng thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentBidding.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      Chưa có gói thầu nào
                    </TableCell>
                  </TableRow>
                ) : (
                  recentBidding.map((project) => (
                    <TableRow key={project.id}>
                      <TableCell className="font-medium">{project.code}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{project.name}</TableCell>
                      <TableCell>
                        <StatusBadge status={project.currentState} type="bidding" />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Pending Purchase Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Đơn hàng chờ duyệt</CardTitle>
            <Link to="/staff/warehouse/po">
              <Button variant="ghost" size="sm">
                Xem tất cả
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã PO</TableHead>
                  <TableHead>Ngày đặt</TableHead>
                  <TableHead className="text-right">Giá trị</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingPOs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      Không có đơn hàng chờ duyệt
                    </TableCell>
                  </TableRow>
                ) : (
                  pendingPOs.map((po) => (
                    <TableRow key={po.id}>
                      <TableCell className="font-medium">{po.code}</TableCell>
                      <TableCell>{formatDate(po.orderedDate)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(po.totalValue)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}