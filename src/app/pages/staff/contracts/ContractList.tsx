import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { storage } from '../../../lib/storage';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { Badge } from '../../../components/ui/badge';
import { EmptyState } from '../../../components/shared/EmptyState';
import { Plus, Search } from 'lucide-react';
import { formatCurrency, formatDate } from '../../../lib/utils';
import { CONTRACT_STATUSES } from '../../../lib/constants';
import type { Contract } from '../../../lib/types';

export function ContractList() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredContracts, setFilteredContracts] = useState<Contract[]>([]);

  useEffect(() => {
    const allContracts = storage.getContracts();
    setContracts(allContracts);
    setFilteredContracts(allContracts);
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = contracts.filter(c =>
        c.code.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredContracts(filtered);
    } else {
      setFilteredContracts(contracts);
    }
  }, [searchQuery, contracts]);

  const getStatusColor = (status: string) => {
    const config = CONTRACT_STATUSES[status as keyof typeof CONTRACT_STATUSES];
    return config?.color || 'gray';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Hợp đồng</h1>
          <p className="text-muted-foreground mt-1">Quản lý hợp đồng mua sắm</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Tạo hợp đồng
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Tìm kiếm</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm theo mã hợp đồng..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Contracts Table */}
      <Card>
        <CardContent className="p-0">
          {filteredContracts.length === 0 ? (
            <EmptyState
              title="Không tìm thấy hợp đồng"
              description="Tạo hợp đồng mới từ gói thầu đã trúng thầu"
              action={{
                label: 'Tạo hợp đồng',
                onClick: () => {},
              }}
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã HĐ</TableHead>
                    <TableHead>Nhà cung cấp</TableHead>
                    <TableHead className="text-right">Giá trị</TableHead>
                    <TableHead>Ngày ký</TableHead>
                    <TableHead>Hiệu lực đến</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContracts.map((contract) => {
                    const supplier = storage.getSupplierById(contract.supplierId);
                    const statusConfig = CONTRACT_STATUSES[contract.status as keyof typeof CONTRACT_STATUSES];

                    return (
                      <TableRow key={contract.id}>
                        <TableCell className="font-medium">{contract.code}</TableCell>
                        <TableCell>{supplier?.companyName || 'Unknown'}</TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(contract.value)}
                        </TableCell>
                        <TableCell>
                          {contract.signedDate ? formatDate(contract.signedDate) : '—'}
                        </TableCell>
                        <TableCell>
                          {contract.expiryDate ? formatDate(contract.expiryDate) : '—'}
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
                          <Link to={`/staff/contracts/${contract.id}`}>
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

      {/* Stats */}
      {filteredContracts.length > 0 && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {contracts.filter(c => c.status === 'executing').length}
              </div>
              <p className="text-sm text-muted-foreground">Đang thực hiện</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {contracts.filter(c => c.status === 'completed').length}
              </div>
              <p className="text-sm text-muted-foreground">Hoàn thành</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {formatCurrency(contracts.reduce((sum, c) => sum + c.value, 0))}
              </div>
              <p className="text-sm text-muted-foreground">Tổng giá trị</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}