import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { storage } from '../../../lib/storage';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { Badge } from '../../../components/ui/badge';
import { Progress } from '../../../components/ui/progress';
import { ArrowLeft, DollarSign, Shield, Package } from 'lucide-react';
import { formatCurrency, formatDate } from '../../../lib/utils';
import { PAYMENT_STATUSES, GUARANTEE_TYPES } from '../../../lib/constants';
import type { Contract, PurchaseOrder } from '../../../lib/types';

export function ContractDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [contract, setContract] = useState<Contract | null>(null);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);

  useEffect(() => {
    if (!id) return;

    const foundContract = storage.getContractById(id);
    setContract(foundContract || null);

    if (foundContract) {
      const pos = storage.getPurchaseOrders().filter(po => po.contractId === foundContract.id);
      setPurchaseOrders(pos);
    }
  }, [id]);

  if (!contract) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-lg font-semibold">Không tìm thấy hợp đồng</p>
          <Button onClick={() => navigate('/staff/contracts')} className="mt-4">
            Quay lại danh sách
          </Button>
        </div>
      </div>
    );
  }

  const supplier = storage.getSupplierById(contract.supplierId);
  const biddingProject = storage.getBiddingProjectById(contract.biddingProjectId);

  const totalPaid = contract.paymentSchedule
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);
  const paymentProgress = (totalPaid / contract.value) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Button variant="ghost" onClick={() => navigate('/staff/contracts')} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại
        </Button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">Hợp đồng {contract.code}</h1>
            <p className="text-muted-foreground mt-1">
              Gói thầu: {biddingProject?.name || 'Unknown'}
            </p>
          </div>
          <StatusBadge
            status={contract.status}
            type="contract"
            size="md"
          />
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Nhà cung cấp</p>
            <p className="text-lg font-semibold mt-1">{supplier?.companyName}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Giá trị hợp đồng</p>
            <p className="text-lg font-semibold mt-1">{formatCurrency(contract.value)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Ngày ký</p>
            <p className="text-lg font-semibold mt-1">
              {contract.signedDate ? formatDate(contract.signedDate) : '—'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Hiệu lực đến</p>
            <p className="text-lg font-semibold mt-1">
              {contract.expiryDate ? formatDate(contract.expiryDate) : '—'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="payment" className="space-y-4">
        <TabsList>
          <TabsTrigger value="payment">
            <DollarSign className="mr-2 h-4 w-4" />
            Lịch thanh toán
          </TabsTrigger>
          <TabsTrigger value="guarantees">
            <Shield className="mr-2 h-4 w-4" />
            Bảo lãnh
          </TabsTrigger>
          <TabsTrigger value="pos">
            <Package className="mr-2 h-4 w-4" />
            Đơn hàng ({purchaseOrders.length})
          </TabsTrigger>
        </TabsList>

        {/* Payment Schedule Tab */}
        <TabsContent value="payment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tiến độ thanh toán</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Đã thanh toán</span>
                  <span className="font-medium">{paymentProgress.toFixed(1)}%</span>
                </div>
                <Progress value={paymentProgress} className="h-3" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Đã trả: {formatCurrency(totalPaid)}</span>
                  <span>Còn lại: {formatCurrency(contract.value - totalPaid)}</span>
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Đợt</TableHead>
                    <TableHead className="text-right">Số tiền</TableHead>
                    <TableHead className="text-center">%</TableHead>
                    <TableHead>Hạn thanh toán</TableHead>
                    <TableHead>Ngày trả</TableHead>
                    <TableHead>Trạng thái</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contract.paymentSchedule.map((payment) => {
                    const statusConfig = PAYMENT_STATUSES[payment.status];
                    const isOverdue = payment.status === 'pending' && new Date(payment.dueDate) < new Date();

                    return (
                      <TableRow key={payment.id}>
                        <TableCell className="font-medium">{payment.phase}</TableCell>
                        <TableCell className="text-right">{formatCurrency(payment.amount)}</TableCell>
                        <TableCell className="text-center">{payment.percentage}%</TableCell>
                        <TableCell>{formatDate(payment.dueDate)}</TableCell>
                        <TableCell>
                          {payment.paidDate ? formatDate(payment.paidDate) : '—'}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`bg-${isOverdue ? 'red' : statusConfig.color}-100 text-${isOverdue ? 'red' : statusConfig.color}-700 border-${isOverdue ? 'red' : statusConfig.color}-200`}
                          >
                            {isOverdue ? 'Quá hạn' : statusConfig.label}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Guarantees Tab */}
        <TabsContent value="guarantees" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bảo lãnh thực hiện</CardTitle>
            </CardHeader>
            <CardContent>
              {contract.guarantees.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Loại bảo lãnh</TableHead>
                      <TableHead className="text-right">Giá trị</TableHead>
                      <TableHead className="text-center">%</TableHead>
                      <TableHead>Ngày bắt đầu</TableHead>
                      <TableHead>Ngày kết thúc</TableHead>
                      <TableHead>Trạng thái</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contract.guarantees.map((guarantee) => {
                      const typeConfig = GUARANTEE_TYPES[guarantee.type];

                      return (
                        <TableRow key={guarantee.id}>
                          <TableCell className="font-medium">{typeConfig.label}</TableCell>
                          <TableCell className="text-right">{formatCurrency(guarantee.value)}</TableCell>
                          <TableCell className="text-center">{guarantee.percentage}%</TableCell>
                          <TableCell>{formatDate(guarantee.startDate)}</TableCell>
                          <TableCell>{formatDate(guarantee.endDate)}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              style={
                                guarantee.status === 'active'
                                  ? { backgroundColor: '#F0FDF4', color: '#15803D', borderColor: '#BBF7D0' }
                                  : { backgroundColor: '#F1F5F9', color: '#475569', borderColor: '#E2E8F0' }
                              }
                            >
                              {guarantee.status === 'active' ? 'Đang hiệu lực' : guarantee.status === 'expired' ? 'Hết hạn' : 'Đã trả'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-sm text-muted-foreground py-8 text-center">
                  Chưa có bảo lãnh
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Purchase Orders Tab */}
        <TabsContent value="pos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Đơn hàng liên kết</CardTitle>
            </CardHeader>
            <CardContent>
              {purchaseOrders.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mã PO</TableHead>
                      <TableHead>Ngày đặt</TableHead>
                      <TableHead className="text-right">Giá trị</TableHead>
                      <TableHead>Tiến độ nhận hàng</TableHead>
                      <TableHead>Trạng thái</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {purchaseOrders.map((po) => {
                      const totalOrdered = po.items.reduce((sum, item) => sum + item.quantity, 0);
                      const totalReceived = po.items.reduce((sum, item) => sum + item.receivedQuantity, 0);
                      const receiveProgress = totalOrdered > 0 ? (totalReceived / totalOrdered) * 100 : 0;

                      return (
                        <TableRow key={po.id}>
                          <TableCell className="font-medium">{po.code}</TableCell>
                          <TableCell>{formatDate(po.orderedDate)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(po.totalValue)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress value={receiveProgress} className="flex-1 h-2" />
                              <span className="text-xs text-muted-foreground w-16 text-right">
                                {totalReceived}/{totalOrdered}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {po.status === 'completed' ? 'Hoàn thành' : po.status === 'partial' ? 'Nhận một phần' : 'Đã duyệt'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-sm text-muted-foreground py-8 text-center">
                  Chưa có đơn hàng
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}