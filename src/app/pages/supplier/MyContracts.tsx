import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { storage } from '../../lib/storage';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { EmptyState } from '../../components/shared/EmptyState';
import { Progress } from '../../components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { FileCheck, Package, AlertCircle, CheckCircle2 } from 'lucide-react';
import { formatCurrency, formatDate } from '../../lib/utils';
import type { Contract, BiddingProject, Supplier as SupplierType, PurchaseOrder } from '../../lib/types';

interface ContractWithDetails extends Contract {
  project?: BiddingProject;
  pos: PurchaseOrder[];
}

export function MyContracts() {
  const { user } = useAuth();
  const [supplier, setSupplier] = useState<SupplierType | null>(null);
  const [contracts, setContracts] = useState<ContractWithDetails[]>([]);

  useEffect(() => {
    if (!user) return;

    const allSuppliers = storage.getSuppliers();
    const currentSupplier = allSuppliers.find(s => s.email === user.email);
    setSupplier(currentSupplier || null);

    if (!currentSupplier) return;

    const allContracts = storage.getContracts();
    const myContracts = allContracts.filter(c => c.supplierId === currentSupplier.id);

    const projects = storage.getBiddingProjects();
    const allPOs = storage.getPurchaseOrders();

    const contractsWithDetails: ContractWithDetails[] = myContracts.map(contract => ({
      ...contract,
      project: projects.find(p => p.id === contract.biddingProjectId),
      pos: allPOs.filter(po => po.contractId === contract.id),
    }));

    // Sort by signed date, newest first
    contractsWithDetails.sort((a, b) =>
      new Date(b.signedDate || b.createdAt).getTime() - new Date(a.signedDate || a.createdAt).getTime()
    );

    setContracts(contractsWithDetails);
  }, [user]);

  const activeContracts = contracts.filter(c => c.status === 'executing').length;
  const completedContracts = contracts.filter(c => c.status === 'completed').length;
  const totalValue = contracts.reduce((sum, c) => sum + c.value, 0);

  const calculateDeliveryProgress = (pos: PurchaseOrder[]) => {
    if (pos.length === 0) return 0;
    const totalOrdered = pos.reduce((sum, po) => sum + po.items.reduce((s, item) => s + item.quantity, 0), 0);
    const totalReceived = pos.reduce((sum, po) => sum + po.items.reduce((s, item) => s + item.receivedQuantity, 0), 0);
    return totalOrdered > 0 ? (totalReceived / totalOrdered) * 100 : 0;
  };

  const calculatePaymentProgress = (contract: Contract) => {
    const totalScheduled = contract.paymentSchedule.reduce((sum, p) => sum + p.amount, 0);
    const totalPaid = contract.paymentSchedule
      .filter(p => p.status === 'paid')
      .reduce((sum, p) => sum + p.amount, 0);
    return totalScheduled > 0 ? (totalPaid / totalScheduled) * 100 : 0;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Hợp đồng của tôi</h1>
        <p className="text-muted-foreground mt-1">Quản lý các hợp đồng đang thực hiện</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{activeContracts}</div>
            <p className="text-sm text-muted-foreground">Đang thực hiện</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{completedContracts}</div>
            <p className="text-sm text-muted-foreground">Đã hoàn thành</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
            <p className="text-sm text-muted-foreground">Tổng giá trị</p>
          </CardContent>
        </Card>
      </div>

      {/* Contracts List */}
      {contracts.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <EmptyState
              icon={FileCheck}
              title="Chưa có hợp đồng"
              description="Bạn chưa có hợp đồng nào. Hãy tham gia các gói thầu để trúng thầu và ký hợp đồng."
              action={
                <Link to="/supplier/tenders">
                  <Button>Xem gói thầu đang mở</Button>
                </Link>
              }
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {contracts.map((contract) => {
            const deliveryProgress = calculateDeliveryProgress(contract.pos);
            const paymentProgress = calculatePaymentProgress(contract);
            const hasOverdue = contract.paymentSchedule.some(p => p.status === 'overdue');

            return (
              <Card key={contract.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-lg">{contract.project?.name}</CardTitle>
                        <StatusBadge status={contract.status} type="contract" size="sm" />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Mã HĐ: {contract.code} • Ký ngày: {formatDate(contract.signedDate)}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Contract Value */}
                  <div className="flex items-center justify-between p-4 bg-accent/50 rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">Giá trị hợp đồng</p>
                      <p className="text-2xl font-bold">{formatCurrency(contract.value)}</p>
                    </div>
                    {hasOverdue && (
                      <div className="flex items-center gap-2 text-destructive">
                        <AlertCircle className="h-5 w-5" />
                        <span className="text-sm font-medium">Có thanh toán quá hạn</span>
                      </div>
                    )}
                  </div>

                  {/* Progress Bars */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Tiến độ giao hàng</span>
                        <span className="font-medium">{deliveryProgress.toFixed(0)}%</span>
                      </div>
                      <Progress value={deliveryProgress} />
                      <p className="text-xs text-muted-foreground">
                        {contract.pos.length} đơn hàng
                      </p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Tiến độ thanh toán</span>
                        <span className="font-medium">{paymentProgress.toFixed(0)}%</span>
                      </div>
                      <Progress value={paymentProgress} className="bg-success/20" />
                      <p className="text-xs text-muted-foreground">
                        {contract.paymentSchedule.filter(p => p.status === 'paid').length}/
                        {contract.paymentSchedule.length} đợt đã thanh toán
                      </p>
                    </div>
                  </div>

                  {/* Payment Schedule Summary */}
                  {contract.paymentSchedule.length > 0 && (
                    <div className="border rounded-lg p-4">
                      <p className="font-medium mb-3 flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        Lịch thanh toán
                      </p>
                      <div className="space-y-2">
                        {contract.paymentSchedule.slice(0, 3).map((payment, idx) => (
                          <div key={idx} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              {payment.status === 'paid' ? (
                                <CheckCircle2 className="h-4 w-4 text-success" />
                              ) : (
                                <AlertCircle
                                  className="h-4 w-4"
                                  style={{ color: payment.status === 'overdue' ? '#DC2626' : '#B45309' }}
                                />
                              )}
                              <span>{payment.phase}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-mono">{formatCurrency(payment.amount)}</span>
                              <StatusBadge status={payment.status} type="payment" size="sm" />
                            </div>
                          </div>
                        ))}
                        {contract.paymentSchedule.length > 3 && (
                          <p className="text-xs text-muted-foreground text-center pt-2">
                            +{contract.paymentSchedule.length - 3} đợt nữa
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Purchase Orders */}
                  {contract.pos.length > 0 && (
                    <div className="border rounded-lg p-4">
                      <p className="font-medium mb-3 flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        Đơn hàng ({contract.pos.length})
                      </p>
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Mã PO</TableHead>
                              <TableHead>Tổng SL</TableHead>
                              <TableHead>Đã nhận</TableHead>
                              <TableHead>Trạng thái</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {contract.pos.slice(0, 3).map((po) => (
                              <TableRow key={po.id}>
                                <TableCell className="font-mono text-sm">{po.code}</TableCell>
                                <TableCell>{po.items.reduce((s, i) => s + i.quantity, 0)}</TableCell>
                                <TableCell>{po.items.reduce((s, i) => s + i.receivedQuantity, 0)}</TableCell>
                                <TableCell>
                                  <StatusBadge status={po.status} type="po" size="sm" />
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                        {contract.pos.length > 3 && (
                          <p className="text-xs text-muted-foreground text-center pt-2">
                            +{contract.pos.length - 3} đơn hàng nữa
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Action Button */}
                  <div className="pt-2">
                    <Button variant="outline" className="w-full" asChild>
                      <Link to={`/supplier/contracts/${contract.id}`}>
                        Xem chi tiết hợp đồng
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}