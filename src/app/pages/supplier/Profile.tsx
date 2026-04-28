import { useEffect, useState } from 'react';
import { storage } from '../../lib/storage';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Separator } from '../../components/ui/separator';
import { Badge } from '../../components/ui/badge';
import {
  Building,
  Mail,
  Phone,
  MapPin,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Clock,
} from 'lucide-react';
import { formatDate } from '../../lib/utils';
import type { Supplier as SupplierType } from '../../lib/types';
import { toast } from 'sonner';

export function Profile() {
  const { user } = useAuth();
  const [supplier, setSupplier] = useState<SupplierType | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Form state
  const [companyName, setCompanyName] = useState('');
  const [taxCode, setTaxCode] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (!user) return;

    const allSuppliers = storage.getSuppliers();
    const currentSupplier = allSuppliers.find(s => s.email === user.email);
    setSupplier(currentSupplier || null);

    if (currentSupplier) {
      setCompanyName(currentSupplier.companyName);
      setTaxCode(currentSupplier.taxCode);
      setAddress(currentSupplier.address);
      setPhone(currentSupplier.phone);
      setEmail(currentSupplier.email);
      setDescription(currentSupplier.description || '');
    }
  }, [user]);

  const handleSave = () => {
    if (!supplier || !companyName || !taxCode || !address || !phone || !email) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    const updatedSupplier: SupplierType = {
      ...supplier,
      companyName,
      taxCode,
      address,
      phone,
      email,
      description,
    };

    storage.updateSupplier(updatedSupplier);
    setSupplier(updatedSupplier);
    setIsEditing(false);
    toast.success('Đã cập nhật thông tin công ty');
  };

  const handleCancel = () => {
    if (supplier) {
      setCompanyName(supplier.companyName);
      setTaxCode(supplier.taxCode);
      setAddress(supplier.address);
      setPhone(supplier.phone);
      setEmail(supplier.email);
      setDescription(supplier.description || '');
    }
    setIsEditing(false);
  };

  if (!supplier) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Đang tải thông tin...</p>
      </div>
    );
  }

  const getStatusIcon = () => {
    switch (supplier.status) {
      case 'approved':
        return <CheckCircle2 className="h-5 w-5 text-success" />;
      case 'pending_approval':
        return <Clock className="h-5 w-5 text-warning" />;
      case 'rejected':
      case 'suspended':
      case 'blacklisted':
        return <AlertTriangle className="h-5 w-5 text-destructive" />;
      default:
        return null;
    }
  };

  const getStatusMessage = () => {
    switch (supplier.status) {
      case 'approved':
        return 'Tài khoản đã được phê duyệt và có thể tham gia đấu thầu';
      case 'pending_approval':
        return 'Tài khoản đang chờ phê duyệt. Vui lòng chờ 1-3 ngày làm việc.';
      case 'rejected':
        return 'Tài khoản đã bị từ chối. Vui lòng liên hệ quản trị viên để biết thêm chi tiết.';
      case 'suspended':
        return 'Tài khoản đã bị tạm ngưng. Vui lòng liên hệ quản trị viên.';
      case 'blacklisted':
        return 'Tài khoản đã bị đưa vào danh sách đen và không thể tham gia đấu thầu.';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Hồ sơ công ty</h1>
        <p className="text-muted-foreground mt-1">Quản lý thông tin và hồ sơ năng lực của công ty</p>
      </div>

      {/* Account Status */}
      <Alert
        style={
          supplier.status === 'approved'
            ? { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' }
            : supplier.status === 'pending_approval'
            ? { backgroundColor: '#FEF3C7', borderColor: '#FDE68A' }
            : { backgroundColor: '#FEF2F2', borderColor: '#FECACA' }
        }
      >
        {getStatusIcon()}
        <AlertDescription>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold mb-1">Trạng thái tài khoản</p>
              <p className="text-sm">{getStatusMessage()}</p>
            </div>
            <StatusBadge status={supplier.status} type="supplier" size="md" />
          </div>
        </AlertDescription>
      </Alert>

      {/* Company Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Thông tin công ty</CardTitle>
            {!isEditing && (
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                Chỉnh sửa
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="companyName">
                    Tên công ty <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="companyName"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taxCode">
                    Mã số thuế <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="taxCode"
                    value={taxCode}
                    onChange={(e) => setTaxCode(e.target.value)}
                    className="font-mono"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">
                  Địa chỉ <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">
                    Số điện thoại <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">
                    Email <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Giới thiệu công ty</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Mô tả về công ty, lĩnh vực hoạt động, năng lực..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button onClick={handleSave}>Lưu thay đổi</Button>
                <Button variant="outline" onClick={handleCancel}>
                  Hủy
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="flex items-start gap-3">
                  <Building className="h-5 w-5 text-muted-foreground mt-1" />
                  <div>
                    <p className="text-sm text-muted-foreground">Tên công ty</p>
                    <p className="font-semibold mt-1">{supplier.companyName}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground mt-1" />
                  <div>
                    <p className="text-sm text-muted-foreground">Mã số thuế</p>
                    <p className="font-semibold font-mono mt-1">{supplier.taxCode}</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-1" />
                <div>
                  <p className="text-sm text-muted-foreground">Địa chỉ</p>
                  <p className="font-medium mt-1">{supplier.address}</p>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground mt-1" />
                  <div>
                    <p className="text-sm text-muted-foreground">Số điện thoại</p>
                    <p className="font-medium mt-1">{supplier.phone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground mt-1" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium mt-1">{supplier.email}</p>
                  </div>
                </div>
              </div>

              {supplier.description && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Giới thiệu công ty</p>
                    <p className="text-sm leading-relaxed">{supplier.description}</p>
                  </div>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Approved Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Ngành nghề đã được phê duyệt</CardTitle>
        </CardHeader>
        <CardContent>
          {supplier.approvedCategories && supplier.approvedCategories.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {supplier.approvedCategories.map((category, idx) => (
                <Badge
                  key={idx}
                  variant="outline"
                  style={{ backgroundColor: '#EFF6FF', color: '#1D4ED8', borderColor: '#BFDBFE' }}
                >
                  {category}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Chưa có ngành nghề được phê duyệt. Vui lòng chờ quản trị viên xét duyệt.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Registration Info */}
      <Card>
        <CardHeader>
          <CardTitle>Thông tin đăng ký</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 text-sm">
            <div>
              <p className="text-muted-foreground">Ngày đăng ký</p>
              <p className="font-medium mt-1">{formatDate(supplier.createdAt)}</p>
            </div>
            {supplier.approvedAt && (
              <div>
                <p className="text-muted-foreground">Ngày phê duyệt</p>
                <p className="font-medium mt-1">{formatDate(supplier.approvedAt)}</p>
              </div>
            )}
            {supplier.approvedBy && (
              <div>
                <p className="text-muted-foreground">Người phê duyệt</p>
                <p className="font-medium mt-1">
                  {storage.getUserById(supplier.approvedBy)?.name || 'N/A'}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
