import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { storage } from '../../../lib/storage';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Progress } from '../../../components/ui/progress';
import { StatusBadge } from '../../../components/shared/StatusBadge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../../../lib/utils';
import type { YearBudget } from '../../../lib/types';
import { toast } from 'sonner';

export function BudgetDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [budget, setBudget] = useState<YearBudget | null>(null);

  useEffect(() => {
    // For now, we only have one budget (2026)
    const yearBudget = storage.getYearBudget();
    setBudget(yearBudget);
  }, [id]);

  const handleSendForApproval = () => {
    if (!budget) return;

    const updated = { ...budget, status: 'pending' as const };
    storage.updateYearBudget(updated);
    setBudget(updated);
    toast.success('Đã gửi ngân sách để phê duyệt');
  };

  const handleApprove = () => {
    if (!budget) return;

    const updated = { ...budget, status: 'approved' as const };
    storage.updateYearBudget(updated);
    setBudget(updated);
    toast.success('Đã phê duyệt ngân sách');
  };

  const handleReject = () => {
    if (!budget) return;

    const updated = { ...budget, status: 'rejected' as const };
    storage.updateYearBudget(updated);
    setBudget(updated);
    toast.error('Đã từ chối ngân sách');
  };

  if (!budget) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Đang tải...</p>
      </div>
    );
  }

  const allocatedPercent = (budget.allocatedAmount / budget.totalAmount) * 100;
  const remainingAmount = budget.totalAmount - budget.allocatedAmount;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Button variant="ghost" onClick={() => navigate('/staff/budget')} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại
        </Button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">Ngân sách năm {budget.year}</h1>
            <p className="text-muted-foreground mt-1">Quản lý phân bổ ngân sách theo phòng ban</p>
          </div>
          <StatusBadge status={budget.status} type="budget" size="lg" />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground mb-2">Tổng dự toán</p>
            <p className="text-2xl font-bold">{formatCurrency(budget.totalAmount)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground mb-2">Đã phân bổ</p>
            <p className="text-2xl font-bold text-primary">{formatCurrency(budget.allocatedAmount)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground mb-2">Còn lại</p>
            <p className="text-2xl font-bold text-success">{formatCurrency(remainingAmount)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Tiến độ phân bổ</span>
              <span className="font-semibold">{allocatedPercent.toFixed(1)}%</span>
            </div>
            <Progress value={allocatedPercent} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Department Allocation Table */}
      <Card>
        <CardHeader>
          <CardTitle>Phân bổ theo phòng ban</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Phòng ban</TableHead>
                  <TableHead className="text-right">Phân bổ</TableHead>
                  <TableHead className="text-right">% Tổng</TableHead>
                  <TableHead className="text-right">Đã sử dụng</TableHead>
                  <TableHead className="text-right">Còn lại</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {budget.departmentBudgets.map((deptBudget) => {
                  const dept = storage.getDepartmentById(deptBudget.departmentId);
                  const percent = (deptBudget.allocatedAmount / budget.totalAmount) * 100;
                  const remaining = deptBudget.allocatedAmount - deptBudget.usedAmount;

                  return (
                    <TableRow key={deptBudget.departmentId}>
                      <TableCell className="font-medium">{dept?.name || 'N/A'}</TableCell>
                      <TableCell className="text-right font-mono">
                        {formatCurrency(deptBudget.allocatedAmount)}
                      </TableCell>
                      <TableCell className="text-right">{percent.toFixed(1)}%</TableCell>
                      <TableCell className="text-right font-mono">
                        {formatCurrency(deptBudget.usedAmount)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-success">
                        {formatCurrency(remaining)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Workflow Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertCircle className="h-4 w-4" />
              <span>Các hành động phụ thuộc vào trạng thái hiện tại</span>
            </div>
            <div className="flex gap-3">
              {budget.status === 'draft' && (
                <Button onClick={handleSendForApproval}>
                  Gửi phê duyệt
                </Button>
              )}
              {budget.status === 'pending' && (
                <>
                  <Button variant="outline" onClick={handleReject}>
                    Từ chối
                  </Button>
                  <Button onClick={handleApprove}>
                    Phê duyệt
                  </Button>
                </>
              )}
              {budget.status === 'approved' && (
                <div className="text-sm text-success font-medium flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Ngân sách đã được phê duyệt
                </div>
              )}
              {budget.status === 'rejected' && (
                <Button onClick={handleSendForApproval}>
                  Gửi lại để duyệt
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}