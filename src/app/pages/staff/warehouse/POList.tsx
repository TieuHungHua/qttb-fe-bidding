import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { storage } from '../../../lib/storage';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { Badge } from '../../../components/ui/badge';
import { Progress } from '../../../components/ui/progress';
import { EmptyState } from '../../../components/shared/EmptyState';
import { Plus } from 'lucide-react';
import { formatCurrency, formatDate } from '../../../lib/utils';
import { PO_STATUSES } from '../../../lib/constants';
import type { PurchaseOrder } from '../../../lib/types';

export function POList() {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);

  useEffect(() => {
    const orders = storage.getPurchaseOrders();
    setPurchaseOrders(orders);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Đơn hàng (PO)</h1>
          <p className="text-muted-foreground mt-1">Quản lý đơn đặt hàng và nhập kho</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Tạo đơn hàng
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {purchaseOrders.filter(po => po.status === 'approved').length}
            </div>
            <p className="text-sm text-muted-foreground">Đã duyệt</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {purchaseOrders.filter(po => po.status === 'partial').length}
            </div>
            <p className="text-sm text-muted-foreground">Nhận một phần</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {purchaseOrders.filter(po => po.status === 'completed').length}
            </div>
            <p className="text-sm text-muted-foreground">Hoàn thành</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {formatCurrency(purchaseOrders.reduce((sum, po) => sum + po.totalValue, 0))}
            </div>
            <p className="text-sm text-muted-foreground">Tổng giá trị</p>
          </CardContent>
        </Card>
      </div>

      {/* PO Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách đơn hàng</CardTitle>
        </CardHeader>
        <CardContent>
          {purchaseOrders.length === 0 ? (
            <EmptyState
              title="Chưa có đơn hàng"
              description="Tạo đơn hàng mới từ hợp đồng"
              action={{
                label: 'Tạo đơn hàng',
                onClick: () => {},
              }}
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã PO</TableHead>
                    <TableHead>Nhà cung cấp</TableHead>
                    <TableHead>Ngày đặt</TableHead>
                    <TableHead>Hạn giao</TableHead>
                    <TableHead className="text-right">Giá trị</TableHead>
                    <TableHead>Tiến độ nhận hàng</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchaseOrders.map((po) => {
                    const supplier = storage.getSupplierById(po.supplierId);
                    const totalOrdered = po.items.reduce((sum, item) => sum + item.quantity, 0);
                    const totalReceived = po.items.reduce((sum, item) => sum + item.receivedQuantity, 0);
                    const receiveProgress = totalOrdered > 0 ? (totalReceived / totalOrdered) * 100 : 0;
                    const statusConfig = PO_STATUSES[po.status];

                    return (
                      <TableRow key={po.id}>
                        <TableCell className="font-medium">{po.code}</TableCell>
                        <TableCell>{supplier?.companyName || 'Unknown'}</TableCell>
                        <TableCell>{formatDate(po.orderedDate)}</TableCell>
                        <TableCell>{formatDate(po.expectedDeliveryDate)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(po.totalValue)}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Progress value={receiveProgress} className="flex-1 h-2" />
                              <span className="text-xs text-muted-foreground w-12 text-right">
                                {receiveProgress.toFixed(0)}%
                              </span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {totalReceived} / {totalOrdered} sản phẩm
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`bg-${statusConfig.color}-100 text-${statusConfig.color}-700 border-${statusConfig.color}-200`}
                          >
                            {statusConfig.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Link to={`/staff/warehouse/po/${po.id}`}>
                            <Button variant="outline" size="sm">
                              Chi tiết
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Items Detail (Expandable) */}
      {purchaseOrders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Chi tiết sản phẩm</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {purchaseOrders.slice(0, 1).map((po) => (
                <div key={po.id} className="border rounded-lg p-4">
                  <div className="font-medium mb-3">Đơn hàng: {po.code}</div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Sản phẩm</TableHead>
                        <TableHead className="text-center">Đã nhận / Đặt</TableHead>
                        <TableHead className="text-right">Đơn giá</TableHead>
                        <TableHead className="text-right">Thành tiền</TableHead>
                        <TableHead>Tiến độ</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {po.items.map((item) => {
                        const progress = item.quantity > 0 ? (item.receivedQuantity / item.quantity) * 100 : 0;

                        return (
                          <TableRow key={item.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{item.productName}</div>
                                <div className="text-xs text-muted-foreground">ĐVT: {item.unit}</div>
                              </div>
                            </TableCell>
                            <TableCell className="text-center font-medium">
                              {item.receivedQuantity} / {item.quantity}
                            </TableCell>
                            <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                            <TableCell className="text-right font-medium">
                              {formatCurrency(item.totalPrice)}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Progress value={progress} className="flex-1 h-2" />
                                <span className="text-xs text-muted-foreground w-12 text-right">
                                  {progress.toFixed(0)}%
                                </span>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}