'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore, checkRoutePermission } from '@/stores/authStore';
import { StaffPermissionModal } from './StaffPermissionModal';
import { ManagerOverrideModal } from './ManagerOverrideModal';
import { Icon, Button } from '@/components/ui';

export const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { currentUser, isAuthenticated, setShowPermissionModal } = useAuthStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && (!isAuthenticated || !currentUser)) {
      if (pathname !== '/auth/pin-login' && pathname !== '/landing') {
        router.push(`/auth/pin-login?redirect=${encodeURIComponent(pathname)}`);
      }
    }
  }, [isMounted, isAuthenticated, currentUser, pathname, router]);

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-body-sm text-outline">Đang khởi tạo phiên làm việc...</p>
        </div>
      </div>
    );
  }

  // Not authenticated and not on login/landing page
  if (!isAuthenticated || !currentUser) {
    if (pathname === '/auth/pin-login' || pathname === '/landing') {
      return <>{children}</>;
    }

    return (
      <div className="min-h-screen bg-[#0F172A] text-white flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md p-8 rounded-2xl bg-white/5 border border-white/10 text-center shadow-2xl backdrop-blur-md">
          <div className="w-16 h-16 rounded-2xl bg-primary text-white flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/30">
            <Icon name="lock" className="text-[32px]" />
          </div>
          <h2 className="text-headline-md font-bold text-white mb-2">
            Yêu Cầu Đăng Nhập PIN
          </h2>
          <p className="text-body-sm text-white/70 mb-6">
            Hệ thống OmniPOS yêu cầu xác thực mã PIN của nhân viên để bảo vệ thẻ kho và doanh thu két tiền.
          </p>
          <Button
            variant="primary"
            icon="login"
            className="w-full h-12 text-body-md font-bold"
            onClick={() => router.push(`/auth/pin-login?redirect=${encodeURIComponent(pathname)}`)}
          >
            Đến màn hình nhập PIN
          </Button>
        </div>
      </div>
    );
  }

  // Route-level Role Permission Enforcement (403 Forbidden Guard)
  const { isAllowed, rule, reason } = checkRoutePermission(currentUser.role, pathname);

  if (!isAllowed) {
    const defaultHomeRoute =
      currentUser.role === 'WAREHOUSE_KEEPER'
        ? '/admin/inventory'
        : currentUser.role === 'AQUA_TECHNICIAN'
        ? '/admin/prescriptions'
        : '/pos/terminal';

    const defaultHomeLabel =
      currentUser.role === 'WAREHOUSE_KEEPER'
        ? 'Về Danh Mục & Thẻ Kho'
        : currentUser.role === 'AQUA_TECHNICIAN'
        ? 'Về Đo Nước & Kê Đơn Thuốc'
        : 'Về Quầy Bán Hàng POS';

    return (
      <div className="min-h-[calc(100vh-56px)] flex items-center justify-center bg-surface-dim p-6 select-none">
        <div className="w-full max-w-xl bg-surface-container-lowest rounded-3xl p-8 border border-error/30 shadow-2xl text-center space-y-6 animate-scale-up">
          {/* Lock Icon */}
          <div className="w-20 h-20 rounded-3xl bg-error/10 border-2 border-error/30 text-error flex items-center justify-center mx-auto ring-8 ring-error/10 animate-pulse">
            <Icon name="shield_lock" className="text-[44px]" />
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-error/10 text-error text-label-sm font-bold uppercase tracking-wider mb-3">
              <Icon name="gavel" className="text-[16px]" />
              Phân Quyền: {currentUser.roleName}
            </div>
            <h2 className="text-headline-md font-bold text-on-surface">
              Từ Chối Quyền Truy Cập Màn Hình
            </h2>
            <p className="text-headline-sm font-semibold text-primary mt-1">
              {rule?.title || pathname}
            </p>
          </div>

          {/* Reason Card */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-left space-y-2">
            <div className="flex items-start gap-2.5">
              <Icon name="info" className="text-amber-600 text-[20px] shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-label-md text-amber-900">
                  Quy chế phân quyền nội bộ cửa hàng:
                </p>
                <p className="text-body-sm text-amber-800/95 mt-1 leading-relaxed">
                  {reason}
                </p>
              </div>
            </div>
          </div>

          {/* User badge */}
          <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/30 flex items-center justify-between text-label-md">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-primary text-white font-bold text-xs flex items-center justify-center">
                {currentUser.avatar}
              </div>
              <div className="text-left">
                <span className="font-bold text-on-surface block">{currentUser.name}</span>
                <span className="text-[11px] text-outline block">{currentUser.staffCode} • {currentUser.roleName}</span>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-md bg-error/10 text-error font-bold text-[11px]">
              KHÔNG ĐỦ THẨM QUYỀN
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              variant="outline"
              icon="home"
              className="flex-1 h-12 font-bold"
              onClick={() => router.push(defaultHomeRoute)}
            >
              {defaultHomeLabel}
            </Button>
            <Button
              variant="primary"
              icon="switch_account"
              className="flex-1 h-12 font-bold shadow-lg shadow-primary/25"
              onClick={() => setShowPermissionModal(true)}
            >
              Đổi Tài Khoản / Nhập PIN
            </Button>
          </div>
        </div>

        <StaffPermissionModal />
        <ManagerOverrideModal />
      </div>
    );
  }

  return (
    <>
      {children}
      <StaffPermissionModal />
      <ManagerOverrideModal />
    </>
  );
};
