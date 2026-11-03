'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Icon } from '@/components/ui';
import { useAuthStore } from '@/stores/authStore';
import { useUiStore } from '@/stores/uiStore';

interface AdminHeaderProps {
  title?: string;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ title }) => {
  const { currentUser, setShowPermissionModal, logout } = useAuthStore();
  const { toggleMobileSidebar } = useUiStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/auth/pin-login');
  };

  const roleBadgeStyle = {
    SUPER_ADMIN: 'bg-purple-600 text-white',
    STORE_MANAGER: 'bg-primary text-white',
    AQUA_TECHNICIAN: 'bg-sky-600 text-white',
    CASHIER: 'bg-amber-600 text-white',
    WAREHOUSE_KEEPER: 'bg-indigo-600 text-white',
  }[currentUser?.role || 'AQUA_TECHNICIAN'];

  return (
    <header className="h-14 w-full bg-surface-container-lowest border-b border-outline-variant/30 px-3 sm:px-space-md flex items-center justify-between gap-2 sm:gap-space-md sticky top-0 z-40 shadow-sm">
      <div className="flex items-center gap-2 sm:gap-space-md">
        {/* Mobile Hamburger Toggle */}
        <button
          type="button"
          onClick={toggleMobileSidebar}
          className="p-1.5 -ml-1 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container md:hidden transition-colors"
          title="Mở menu quản trị"
          aria-label="Mở menu điều hướng"
        >
          <Icon name="menu" className="text-[24px]" />
        </button>

        <Link
          href="/admin/inventory"
          className="flex items-center gap-1.5 sm:gap-2 font-headline-sm text-primary font-bold tracking-tight"
        >
          <Icon name="point_of_sale" className="text-primary text-[22px] sm:text-[24px]" />
          <span className="font-headline-md text-label-lg sm:text-headline-sm text-on-surface">
            OmniPOS <span className="text-primary text-[10px] sm:text-xs font-normal">Quản Trị</span>
          </span>
        </Link>

        {title && (
          <div className="hidden md:flex items-center gap-2 text-label-md text-outline">
            <span>/</span>
            <span className="text-on-surface font-semibold">{title}</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Launch POS Terminal Button */}
        <Link
          href="/pos/terminal"
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-on-primary text-label-md font-semibold shadow-sm transition-all active:scale-95 shrink-0"
        >
          <Icon name="point_of_sale" className="text-[18px]" />
          <span className="hidden sm:inline">Vào Bán Hàng POS</span>
          <span className="sm:hidden text-xs font-bold">POS</span>
          <span className="hidden md:inline-block px-1 py-0.2 rounded bg-black/20 text-[10px] font-mono text-white/80">
            F1-F9
          </span>
        </Link>

        {/* Sync Indicator */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary-container/40 text-on-secondary-container text-label-sm border border-secondary/20 shrink-0">
          <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
          <span>PostgreSQL Live (0ms)</span>
        </div>

        {/* User Profile Pill with Permission Trigger */}
        <button
          type="button"
          onClick={() => setShowPermissionModal(true)}
          className="flex items-center gap-2 p-1 sm:pl-2.5 sm:pr-3 sm:py-1 rounded-xl border border-outline-variant/40 hover:bg-surface-container transition-all text-left shadow-xs cursor-pointer group shrink-0"
          title="Bấm để xem Bảng phân quyền & tác vụ bị cấm"
        >
          <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold text-xs shadow-xs group-hover:scale-105 transition-transform shrink-0">
            <span>{currentUser?.avatar || 'MA'}</span>
          </div>
          <div className="hidden sm:block text-left">
            <div className="flex items-center gap-1.5">
              <p className="text-label-sm font-bold text-on-surface leading-tight">
                {currentUser?.name || 'KS. Trần Minh Anh'}
              </p>
              <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${roleBadgeStyle}`}>
                {currentUser?.roleName || 'Kỹ Sư'}
              </span>
            </div>
            <p className="text-[11px] text-outline leading-tight mt-0.5 flex items-center gap-1">
              <Icon name="shield" className="text-[12px] text-primary" />
              <span>Xem quyền &amp; tác vụ bị cấm</span>
            </p>
          </div>
          <Icon name="expand_more" className="text-[16px] text-outline group-hover:text-primary transition-colors hidden sm:block" />
        </button>

        {/* Quick Logout Button */}
        <button
          type="button"
          onClick={handleLogout}
          className="p-2 rounded-xl text-outline hover:text-error hover:bg-error-container/20 border border-outline-variant/30 transition-colors"
          title="Đăng xuất tài khoản (Về trang đăng nhập PIN)"
          aria-label="Đăng xuất"
        >
          <Icon name="logout" className="text-[20px]" />
        </button>
      </div>
    </header>
  );
};
