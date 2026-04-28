import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Home,
  Wallet,
  Gavel,
  FileText,
  Package,
  FileCheck,
  Settings,
  ChevronDown,
  LogOut,
  User,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from '../components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { Button } from '../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../components/ui/collapsible';
import { getInitials } from '../lib/utils';
import { USER_ROLES } from '../lib/constants';

const ICONS = {
  Home,
  Wallet,
  Gavel,
  FileText,
  Package,
  FileCheck,
  Settings,
};

const MENU_ITEMS = [
  { label: 'Dashboard', path: '/staff', icon: 'Home' },
  {
    label: 'Ngân sách',
    icon: 'Wallet',
    children: [
      { label: 'Ngân sách năm', path: '/staff/budget' },
      { label: 'Kế hoạch mua sắm', path: '/staff/procurement-plan' },
    ],
  },
  {
    label: 'Đấu thầu',
    icon: 'Gavel',
    children: [
      { label: 'Đấu thầu chính thức', path: '/staff/bidding' },
      { label: 'Đấu thầu đơn giản', path: '/staff/bidding/simple' },
    ],
  },
  { label: 'Hợp đồng', path: '/staff/contracts', icon: 'FileText' },
  {
    label: 'Kho',
    icon: 'Package',
    children: [
      { label: 'Đơn hàng (PO)', path: '/staff/warehouse/po' },
      { label: 'Phiếu nhập kho', path: '/staff/warehouse/receipt' },
    ],
  },
  {
    label: 'Tờ trình (PAW)',
    icon: 'FileCheck',
    children: [
      { label: 'Danh sách tờ trình', path: '/staff/paw' },
      { label: 'Tạo mẫu tờ trình', path: '/staff/paw/builder' },
    ],
  },
  {
    label: 'Quản trị',
    icon: 'Settings',
    children: [
      { label: 'Phòng ban', path: '/staff/admin/departments' },
      { label: 'Danh mục hàng hóa', path: '/staff/admin/catalog' },
      { label: 'Nhà cung cấp', path: '/staff/admin/suppliers' },
      { label: 'Tài khoản NCC', path: '/staff/admin/supplier-accounts' },
    ],
  },
];

export function StaffLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (!user || user.role === 'supplier') {
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="border-b px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Package className="h-6 w-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-semibold">QTTB System</span>
              <span className="text-xs text-muted-foreground">Quản trị thiết bị</span>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {MENU_ITEMS.map((item) => {
                  const Icon = ICONS[item.icon as keyof typeof ICONS];

                  if (item.children) {
                    return (
                      <Collapsible key={item.label} asChild defaultOpen={location.pathname.includes(item.children[0].path.split('/')[2])}>
                        <SidebarMenuItem>
                          <CollapsibleTrigger asChild>
                            <SidebarMenuButton>
                              <Icon className="h-4 w-4" />
                              <span>{item.label}</span>
                              <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]:rotate-180" />
                            </SidebarMenuButton>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <SidebarMenuSub>
                              {item.children.map((child) => (
                                <SidebarMenuSubItem key={child.path}>
                                  <SidebarMenuSubButton asChild isActive={location.pathname === child.path}>
                                    <Link to={child.path}>{child.label}</Link>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              ))}
                            </SidebarMenuSub>
                          </CollapsibleContent>
                        </SidebarMenuItem>
                      </Collapsible>
                    );
                  }

                  return (
                    <SidebarMenuItem key={item.path}>
                      <SidebarMenuButton asChild isActive={location.pathname === item.path}>
                        <Link to={item.path!}>
                          <Icon className="h-4 w-4" />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="border-t p-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start gap-2 px-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatarUrl} />
                  <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                </Avatar>
                <div className="flex flex-1 flex-col items-start text-sm">
                  <span className="font-medium">{user.name}</span>
                  <span className="text-xs text-muted-foreground">{USER_ROLES[user.role].label}</span>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Tài khoản</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Hồ sơ</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Đăng xuất</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
          <SidebarTrigger />
          <div className="flex-1" />
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}