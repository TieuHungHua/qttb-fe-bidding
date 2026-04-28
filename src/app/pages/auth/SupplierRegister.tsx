import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { storage } from '../../lib/storage';
import { generateId, isValidTaxCode, isValidPhoneNumber, isValidEmail } from '../../lib/utils';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Separator } from '../../components/ui/separator';
import { Loader2, AlertCircle, Info, CheckCircle } from 'lucide-react';
import type { Supplier } from '../../lib/types';

export function SupplierRegister() {
  const [formData, setFormData] = useState({
    companyName: '',
    taxCode: '',
    address: '',
    phone: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.companyName) newErrors.companyName = 'Vui lòng nhập tên công ty';
    if (!formData.taxCode) {
      newErrors.taxCode = 'Vui lòng nhập mã số thuế';
    } else if (!isValidTaxCode(formData.taxCode)) {
      newErrors.taxCode = 'Mã số thuế không hợp lệ (10 hoặc 13 số)';
    } else {
      const suppliers = storage.getSuppliers();
      if (suppliers.some(s => s.taxCode === formData.taxCode)) {
        newErrors.taxCode = 'Mã số thuế đã tồn tại trong hệ thống';
      }
    }

    if (!formData.address) newErrors.address = 'Vui lòng nhập địa chỉ';
    if (!formData.phone) {
      newErrors.phone = 'Vui lòng nhập số điện thoại';
    } else if (!isValidPhoneNumber(formData.phone)) {
      newErrors.phone = 'Số điện thoại không hợp lệ';
    }

    if (!formData.email) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    } else {
      const suppliers = storage.getSuppliers();
      if (suppliers.some(s => s.email === formData.email)) {
        newErrors.email = 'Email đã tồn tại trong hệ thống';
      }
    }

    if (!formData.username) {
      newErrors.username = 'Vui lòng nhập tên đăng nhập';
    } else if (formData.username.length < 4) {
      newErrors.username = 'Tên đăng nhập phải có ít nhất 4 ký tự';
    } else {
      const suppliers = storage.getSuppliers();
      if (suppliers.some(s => s.username === formData.username)) {
        newErrors.username = 'Tên đăng nhập đã tồn tại';
      }
    }

    if (!formData.password) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    await new Promise(resolve => setTimeout(resolve, 1000));

    const newSupplier: Supplier = {
      id: generateId('sup'),
      companyName: formData.companyName,
      taxCode: formData.taxCode,
      address: formData.address,
      phone: formData.phone,
      email: formData.email,
      username: formData.username,
      status: 'pending_approval',
      approvedCategories: [],
      createdAt: new Date().toISOString(),
    };

    const suppliers = storage.getSuppliers();
    storage.saveSuppliers([...suppliers, newSupplier]);

    setIsLoading(false);
    setSuccess(true);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (success) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
              <CheckCircle className="h-10 w-10" />
            </div>
          </div>
          <CardTitle className="text-center">Đăng ký thành công!</CardTitle>
          <CardDescription className="text-center">
            Tài khoản của bạn đã được tạo và đang chờ phê duyệt
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Tài khoản sẽ được quản trị viên xem xét và phê duyệt trong vòng 1-3 ngày làm việc.
              Bạn sẽ nhận được email thông báo khi tài khoản được kích hoạt.
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button onClick={() => navigate('/login')}>Về trang đăng nhập</Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Đăng ký nhà cung cấp</CardTitle>
        <CardDescription>Đăng ký tài khoản để tham gia đấu thầu</CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Tài khoản sẽ được duyệt trong 1–3 ngày làm việc
            </AlertDescription>
          </Alert>

          {/* Company Information */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold mb-3">Thông tin doanh nghiệp</h3>
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyName">Tên công ty *</Label>
              <Input
                id="companyName"
                placeholder="Công ty TNHH..."
                value={formData.companyName}
                onChange={(e) => handleChange('companyName', e.target.value)}
                disabled={isLoading}
              />
              {errors.companyName && (
                <p className="text-sm text-destructive">{errors.companyName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="taxCode">Mã số thuế *</Label>
              <Input
                id="taxCode"
                placeholder="0123456789"
                value={formData.taxCode}
                onChange={(e) => handleChange('taxCode', e.target.value)}
                disabled={isLoading}
              />
              {errors.taxCode && (
                <p className="text-sm text-destructive">{errors.taxCode}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Địa chỉ *</Label>
              <Input
                id="address"
                placeholder="Số nhà, đường, phường, quận, thành phố"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                disabled={isLoading}
              />
              {errors.address && (
                <p className="text-sm text-destructive">{errors.address}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Số điện thoại *</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="0901234567"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  disabled={isLoading}
                />
                {errors.phone && (
                  <p className="text-sm text-destructive">{errors.phone}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="contact@company.com"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Account Information */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold mb-3">Tài khoản đăng nhập</h3>
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Tên đăng nhập *</Label>
              <Input
                id="username"
                placeholder="username"
                value={formData.username}
                onChange={(e) => handleChange('username', e.target.value)}
                disabled={isLoading}
              />
              {errors.username && (
                <p className="text-sm text-destructive">{errors.username}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu *</Label>
              <Input
                id="password"
                type="password"
                placeholder="Ít nhất 6 ký tự"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                disabled={isLoading}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Xác nhận mật khẩu *</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Nhập lại mật khẩu"
                value={formData.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                disabled={isLoading}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">{errors.confirmPassword}</p>
              )}
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              'Đăng ký'
            )}
          </Button>
        </CardContent>

        <CardFooter className="flex flex-col gap-2">
          <div className="text-sm text-center text-muted-foreground">
            Đã có tài khoản?{' '}
            <Link to="/login" className="text-primary hover:underline">
              Đăng nhập
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}