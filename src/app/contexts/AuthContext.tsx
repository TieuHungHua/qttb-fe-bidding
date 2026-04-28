import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { storage } from '../lib/storage';
import type { User, UserRole } from '../lib/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; role?: string; error?: string }>;
  logout: () => void;
  hasRole: (role: UserRole | UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const auth = storage.getAuth();
    if (auth) {
      const userData = storage.getUserById(auth.userId);
      if (userData) {
        setUser(userData);
      } else {
        storage.clearAuth();
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; role?: string; error?: string }> => {
    setIsLoading(true);

    await new Promise(resolve => setTimeout(resolve, 500));

    const users = storage.getUsers();
    const foundUser = users.find(u => u.email === email);

    if (!foundUser) {
      setIsLoading(false);
      return { success: false, error: 'Email không tồn tại trong hệ thống' };
    }

    if (foundUser.role === 'supplier') {
      const supplier = storage.getSuppliers().find(s => s.email === email);
      if (!supplier) {
        setIsLoading(false);
        return { success: false, error: 'Tài khoản nhà cung cấp không hợp lệ' };
      }
      if (supplier.status === 'pending_approval') {
        setIsLoading(false);
        return { success: false, error: 'Tài khoản đang chờ phê duyệt' };
      }
      if (supplier.status === 'rejected') {
        setIsLoading(false);
        return { success: false, error: 'Tài khoản đã bị từ chối' };
      }
      if (supplier.status === 'suspended') {
        setIsLoading(false);
        return { success: false, error: 'Tài khoản đã bị tạm ngưng' };
      }
    }

    setUser(foundUser);
    storage.saveAuth({
      userId: foundUser.id,
      role: foundUser.role,
      token: `mock-token-${foundUser.id}`,
    });

    setIsLoading(false);
    return { success: true, role: foundUser.role };
  };

  const logout = () => {
    setUser(null);
    storage.clearAuth();
  };

  const hasRole = (role: UserRole | UserRole[]): boolean => {
    if (!user) return false;
    if (Array.isArray(role)) {
      return role.includes(user.role);
    }
    return user.role === role;
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};