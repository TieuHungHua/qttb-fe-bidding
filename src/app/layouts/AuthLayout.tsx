import { Outlet } from 'react-router-dom';
import { Package } from 'lucide-react';

export function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
            <Package className="h-10 w-10" />
          </div>
          <h1 className="text-3xl font-bold">QTTB System</h1>
          <p className="text-sm text-muted-foreground">Hệ thống quản trị thiết bị và đấu thầu</p>
        </div>

        <Outlet />

        <div className="mt-8 text-center text-xs text-muted-foreground">
          © 2026 QTTB System. Tuân thủ Luật Đấu thầu 2023
        </div>
      </div>
    </div>
  );
}