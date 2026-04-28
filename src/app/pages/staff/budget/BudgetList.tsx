import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { storage } from '../../../lib/storage';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Progress } from '../../../components/ui/progress';
import { StatusBadge } from '../../../components/shared/StatusBadge';
import { Plus } from 'lucide-react';
import { formatCurrency } from '../../../lib/utils';
import type { YearBudget } from '../../../lib/types';

export function BudgetList() {
  const [budget, setBudget] = useState<YearBudget | null>(null);

  useEffect(() => {
    const yearBudget = storage.getYearBudget();
    setBudget(yearBudget);
  }, []);

  if (!budget) {
    return <div>Loading...</div>;
  }

  const usedAmount = budget.totalAmount - budget.remainingAmount;
  const usedPercentage = (usedAmount / budget.totalAmount) * 100;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Ngân sách năm {budget.year}</h1>
          <p className="text-muted-foreground mt-1">Quản lý ngân sách và phân bổ</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Tạo kế hoạch mua sắm
        </Button>
      </div>

      {/* Budget Overview Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Tổng quan ngân sách</CardTitle>
            <StatusBadge status={budget.status} type="budget" />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Summary Stats */}
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Tổng ngân sách</p>
              <p className="text-2xl font-bold mt-1">{formatCurrency(budget.totalAmount)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Đã phân bổ</p>
              <p className="text-2xl font-bold mt-1">{formatCurrency(budget.allocatedAmount)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Còn lại</p>
              <p className="text-2xl font-bold mt-1 text-green-600">{formatCurrency(budget.remainingAmount)}</p>
            </div>
          </div>

          {/* Large Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Tỷ lệ sử dụng</span>
              <span className="text-muted-foreground">{usedPercentage.toFixed(1)}%</span>
            </div>
            <Progress value={usedPercentage} className="h-3" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Đã sử dụng: {formatCurrency(usedAmount)}</span>
              <span>Còn lại: {formatCurrency(budget.remainingAmount)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Department Budget Allocation */}
      <Card>
        <CardHeader>
          <CardTitle>Phân bổ theo phòng ban</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b">
                <tr className="text-sm text-muted-foreground">
                  <th className="text-left py-3 px-4 font-medium">Phòng ban</th>
                  <th className="text-right py-3 px-4 font-medium">Phân bổ</th>
                  <th className="text-right py-3 px-4 font-medium">Đã dùng</th>
                  <th className="text-right py-3 px-4 font-medium">Còn lại</th>
                  <th className="text-right py-3 px-4 font-medium">% Phân bổ</th>
                  <th className="text-right py-3 px-4 font-medium">Tiến độ</th>
                </tr>
              </thead>
              <tbody>
                {budget.departmentBudgets.map((deptBudget) => {
                  const department = storage.getDepartmentById(deptBudget.departmentId);
                  const usedPercentage = (deptBudget.usedAmount / deptBudget.allocatedAmount) * 100;

                  return (
                    <tr key={deptBudget.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4 font-medium">{department?.name || 'Unknown'}</td>
                      <td className="py-3 px-4 text-right">{formatCurrency(deptBudget.allocatedAmount)}</td>
                      <td className="py-3 px-4 text-right">{formatCurrency(deptBudget.usedAmount)}</td>
                      <td className="py-3 px-4 text-right text-green-600 font-medium">
                        {formatCurrency(deptBudget.remainingAmount)}
                      </td>
                      <td className="py-3 px-4 text-right">{deptBudget.percentage.toFixed(1)}%</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Progress value={usedPercentage} className="flex-1 h-2" />
                          <span className="text-xs text-muted-foreground w-12 text-right">
                            {usedPercentage.toFixed(0)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Workflow Actions */}
      {budget.status === 'draft' && (
        <div className="flex justify-end gap-2">
          <Button variant="outline">Huỷ</Button>
          <Button>Gửi duyệt</Button>
        </div>
      )}

      {budget.status === 'pending' && (
        <div className="flex justify-end gap-2">
          <Button variant="destructive">Từ chối</Button>
          <Button>Phê duyệt</Button>
        </div>
      )}
    </div>
  );
}