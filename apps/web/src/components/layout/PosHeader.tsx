'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Icon, KeycapBadge } from '@/components/ui';
import { useAuthStore } from '@/stores/authStore';

interface PosHeaderProps {
  activeOrderTab?: number;
  onSelectTab?: (tabIndex: number) => void;
  onNewOrder?: () => void;
  ordersCount?: { [key: number]: number };
}

export const PosHeader: React.FC<PosHeaderProps> = ({
  activeOrderTab = 1,
  onSelectTab,
  onNewOrder,
  ordersCount = { 1: 0, 2: 0, 3: 0 },
}) => {
  const router = useRouter();
  const { currentUser, setShowPermissionModal, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push('/auth/pin-login');
  };

  return (
    <header className="fixed top-0 left-0 right-0 w-full z-50 bg-[#0F172A] text-white shadow-[0_1px_8px_rgba(0,0,0,0.12)]">
      <div className="h-14 w-full px-2 sm:px-space-md flex items-center justify-between gap-2 sm:gap-space-md">
        {/* Brand & Branch Selector */}
        <div className="flex items-center gap-2 sm:gap-space-md shrink-0">
          <Link
            href="/landing"
            className="flex items-center gap-1.5 font-headline-sm text-white tracking-tight hover:opacity-90 transition-opacity"
          >
            <Icon name="point_of_sale" className="text-primary-fixed text-[20px] sm:text-[22px]" />
            <span className="font-headline-md text-label-lg sm:text-headline-sm text-white font-bold">
              OmniPOS
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-space-xs px-space-sm py-1 bg-white/10 rounded-lg text-white/90 text-label-sm cursor-pointer hover:bg-white/15 transition-colors">
            <Icon name="location_on" className="text-[14px] text-primary-fixed" />
            <span className="truncate max-w-[200px]">Đại Lý Thủy Sản Bến Tre (Kho Cầu Đen)</span>
            <Icon name="expand_more" className="text-[14px] text-white/50" />
          </div>
        </div>

        {/* Center: Order Tabs Navigator (F1, F2, F3) */}
        <nav className="flex items-center gap-1 sm:gap-space-xs overflow-x-auto flex-1 max-w-xl mx-auto px-1 no-scrollbar">
          <button
            type="button"
            onClick={() => onSelectTab?.(1)}
            className={`flex items-center gap-1 sm:gap-space-xs px-2.5 sm:px-space-md py-1.5 transition-colors whitespace-nowrap rounded-lg text-label-sm sm:text-label-md ${
              activeOrderTab === 1
                ? 'bg-primary-container text-on-primary font-bold shadow-sm'
                : 'text-white/70 hover:bg-white/10 hover:text-white'
            }`}
          >
            <span>Đơn #1 ({ordersCount[1] || 0})</span>
            <span className="hidden sm:inline"><KeycapBadge label="F1" variant="dark" /></span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab?.(2)}
            className={`flex items-center gap-1 sm:gap-space-xs px-2.5 sm:px-space-md py-1.5 transition-colors whitespace-nowrap rounded-lg text-label-sm sm:text-label-md ${
              activeOrderTab === 2
                ? 'bg-primary-container text-on-primary font-bold shadow-sm'
                : 'text-white/70 hover:bg-white/10 hover:text-white'
            }`}
          >
            <span>Đơn #2</span>
            <span className="hidden sm:inline"><KeycapBadge label="F2" variant="dark" /></span>
          </button>

          <button
            type="button"
            onClick={onNewOrder}
            className="flex items-center gap-1 px-2 sm:px-space-sm py-1.5 rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-colors text-label-sm whitespace-nowrap"
            title="Tạo đơn hàng mới (F3)"
          >
            <Icon name="add" className="text-[16px]" />
            <span className="hidden sm:inline">Tạo mới</span>
            <span className="hidden sm:inline"><KeycapBadge label="F3" variant="dark" /></span>
          </button>
        </nav>

        {/* Right: Sync Status, Cashier Shift Info, Admin Link, Logout */}
        <div className="flex items-center gap-1.5 sm:gap-space-sm shrink-0">
          <div className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary/30 text-secondary-fixed text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary-fixed animate-pulse"></span>
            <span className="font-medium">Live</span>
          </div>

          <Link
            href="/admin/inventory"
            className="px-2 sm:px-space-sm py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-label-sm transition-colors font-medium flex items-center gap-1 shrink-0"
            title="Quay về Quản trị"
          >
            <Icon name="dashboard" className="text-[16px] text-primary-fixed" />
            <span className="hidden md:inline">Quản trị</span>
          </Link>

          {/* User Profile Pill */}
          <button
            type="button"
            onClick={() => setShowPermissionModal(true)}
            className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 py-1 bg-white/10 hover:bg-white/15 rounded-xl border border-white/10 text-white text-left transition-colors cursor-pointer"
            title="Xem bảng phân quyền & tác vụ bị cấm"
          >
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center font-bold text-xs text-white">
              {currentUser?.avatar || 'MA'}
            </div>
            <div className="hidden md:block">
              <p className="text-[12px] font-bold leading-tight truncate max-w-[100px]">
                {currentUser?.name || 'KS. Minh Anh'}
              </p>
              <p className="text-[10px] text-white/70 leading-tight">
                {currentUser?.roleName || 'Kỹ Sư'}
              </p>
            </div>
            <Icon name="expand_more" className="text-[16px] text-white/50" />
          </button>

          <Link
            href="/admin/shifts"
            className="px-2 sm:px-space-md py-1.5 bg-amber-600/90 hover:bg-amber-600 text-white rounded-lg text-label-sm transition-colors font-medium flex items-center gap-1 shrink-0"
            title="Kết ca & đối soát két tiền"
          >
            <Icon name="point_of_sale" className="text-[16px]" />
            <span className="hidden sm:inline">Kết ca</span>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="px-2 sm:px-space-md py-1.5 bg-error/90 hover:bg-error text-on-error rounded-lg text-label-sm transition-colors font-medium flex items-center gap-1 shrink-0"
            title="Đăng xuất ngay (Về màn hình nhập mã PIN)"
          >
            <Icon name="logout" className="text-[16px]" />
            <span className="hidden sm:inline">Đăng xuất</span>
          </button>
        </div>
      </div>
    </header>
  );
};
