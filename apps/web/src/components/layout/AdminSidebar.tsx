'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon } from '@/components/ui';
import { useAuthStore, checkRoutePermission } from '@/stores/authStore';
import { useUiStore } from '@/stores/uiStore';

interface NavItem {
  title: string;
  href: string;
  icon: string;
  badge?: string;
  badgeColor?: string;
  highlight?: boolean;
}

export const AdminSidebar: React.FC = () => {
  const pathname = usePathname();
  const { currentUser } = useAuthStore();
  const { isMobileSidebarOpen, closeMobileSidebar } = useUiStore();

  const navSections: { label: string; items: NavItem[] }[] = [
    {
      label: 'BÁN HÀNG & QUẦY POS',
      items: [
        {
          title: 'Quầy Bán Hàng POS',
          href: '/pos/terminal',
          icon: 'point_of_sale',
          badge: 'F1-F9',
          badgeColor: 'bg-primary-container text-white',
          highlight: true,
        },
        {
          title: 'Đăng Nhập PIN / Mở Ca',
          href: '/auth/pin-login',
          icon: 'dialpad',
        },
        {
          title: 'Quản Lý Đơn Hàng POS',
          href: '/admin/orders',
          icon: 'receipt_long',
        },
        {
          title: 'Quản Lý Ca & Két Tiền',
          href: '/admin/shifts',
          icon: 'account_balance_wallet',
        },
      ],
    },
    {
      label: 'VẬT TƯ & KHO THỦY SẢN',
      items: [
        {
          title: 'Sản Phẩm & Thẻ Kho',
          href: '/admin/inventory',
          icon: 'inventory_2',
        },
        {
          title: 'Tạo Hàng Hóa & Biến Thể',
          href: '/admin/products/new',
          icon: 'add_box',
        },
        {
          title: 'Quản Lý Lô & Hạn Dùng',
          href: '/admin/batches',
          icon: 'event_busy',
          badge: 'FEFO',
          badgeColor: 'bg-tertiary-fixed text-on-tertiary-container',
        },
        {
          title: 'Nhập Hàng NCC (Giá MAC)',
          href: '/admin/purchase/new',
          icon: 'local_shipping',
        },
        {
          title: 'Kiểm Kê Cân Bằng Kho',
          href: '/admin/stocktake/new',
          icon: 'fact_check',
        },
        {
          title: 'Điều Chuyển Kho Vệ Tinh',
          href: '/admin/transfers',
          icon: 'sync_alt',
        },
        {
          title: 'Đổi Trả Hàng Hoàn Kho',
          href: '/admin/returns',
          icon: 'assignment_return',
        },
      ],
    },
    {
      label: 'ĐẦM TÔM, NỢ VỤ & KỸ THUẬT',
      items: [
        {
          title: 'Khách Hàng & Ao Nuôi',
          href: '/admin/customers',
          icon: 'groups',
        },
        {
          title: 'Sổ Nợ Vụ Nuôi (Tín Dụng)',
          href: '/admin/debts',
          icon: 'credit_score',
          badge: 'Nợ vụ',
          badgeColor: 'bg-error-container text-on-error-container',
        },
        {
          title: 'Đo Nước & Kê Đơn Thuốc',
          href: '/admin/prescriptions',
          icon: 'science',
          badge: 'Lab ao',
          badgeColor: 'bg-secondary-container text-on-secondary-container',
        },
        {
          title: 'Nhà Cung Cấp & Nợ Hãng',
          href: '/admin/suppliers',
          icon: 'storefront',
        },
        {
          title: 'Bảo Hành Thiết Bị Serial',
          href: '/admin/warranties',
          icon: 'verified',
        },
      ],
    },
    {
      label: 'HỆ THỐNG & CÀI ĐẶT',
      items: [
        {
          title: 'Nhân Sự & Quyền Hạn PIN',
          href: '/admin/staff',
          icon: 'manage_accounts',
        },
        {
          title: 'Nhật Ký Hoạt Động (Audit)',
          href: '/admin/activity-logs',
          icon: 'history_toggle_off',
          badge: 'Audit',
          badgeColor: 'bg-primary text-white',
        },
        {
          title: 'Cài Đặt Mẫu In K80',
          href: '/admin/settings/receipt',
          icon: 'print',
        },
        {
          title: 'Landing Page Giới Thiệu',
          href: '/landing',
          icon: 'public',
        },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-[#0F172A]/70 backdrop-blur-xs z-50 md:hidden transition-opacity duration-300"
          onClick={closeMobileSidebar}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-surface-container-lowest border-r border-outline-variant/30 flex flex-col h-full shadow-2xl transition-transform duration-300 md:static md:w-64 md:h-[calc(100vh-56px)] md:translate-x-0 md:shadow-none select-none shrink-0 ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Store Identity / Branch Header */}
        <div className="p-3.5 border-b border-outline-variant/20 bg-surface-container-low/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="w-9 h-9 rounded-lg bg-primary text-white flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
              <Icon name="set_meal" className="text-[22px]" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-label-md font-bold text-on-surface truncate">
                Vật Tư Thủy Sản Bến Tre
              </h4>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                <p
                  className="text-[11px] font-semibold text-primary truncate"
                  title={currentUser ? `${currentUser.name} (${currentUser.roleName})` : ''}
                >
                  {currentUser ? `${currentUser.name} • ${currentUser.roleName}` : 'Chưa đăng nhập'}
                </p>
              </div>
            </div>
          </div>

          {/* Close button for mobile drawer */}
          <button
            type="button"
            onClick={closeMobileSidebar}
            className="p-1 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container md:hidden ml-2 transition-colors"
            aria-label="Đóng menu"
          >
            <Icon name="close" className="text-[20px]" />
          </button>
        </div>

        {/* Nav Menu Items */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {navSections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              <p className="px-3 text-[10px] font-bold text-outline uppercase tracking-wider">
                {section.label}
              </p>
              {section.items.map((item) => {
                const isActive = pathname === item.href;
                const perm = checkRoutePermission(currentUser?.role, item.href);
                const isLocked = !perm.isAllowed;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => closeMobileSidebar()}
                    title={
                      isLocked
                        ? `[BỊ KHÓA VỚI ${currentUser?.roleName?.toUpperCase()}]: ${perm.reason}`
                        : item.title
                    }
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-label-md transition-all duration-150 ${
                      isActive
                        ? 'bg-primary-container text-white font-semibold shadow-sm'
                        : isLocked
                        ? 'text-outline/70 hover:bg-surface-container/50 opacity-60'
                        : item.highlight
                        ? 'bg-primary-fixed/40 text-primary font-semibold hover:bg-primary-fixed/70'
                        : 'text-on-surface hover:bg-surface-container text-on-surface-variant'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        name={isLocked ? 'lock' : item.icon}
                        className={`text-[19px] ${
                          isActive
                            ? 'text-white'
                            : isLocked
                            ? 'text-outline/50'
                            : item.highlight
                            ? 'text-primary'
                            : 'text-outline'
                        }`}
                      />
                      <span className="truncate">{item.title}</span>
                    </div>
                    {isLocked ? (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold leading-none bg-rose-500/10 text-rose-500 border border-rose-500/20">
                        Khóa
                      </span>
                    ) : item.badge ? (
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold leading-none ${
                          item.badgeColor || 'bg-surface-container text-outline'
                        }`}
                      >
                        {item.badge}
                      </span>
                    ) : null}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        {/* Sidebar Footer: System Status */}
        <div className="p-3 border-t border-outline-variant/20 bg-surface-container-low/30 flex items-center justify-between text-[11px] text-outline">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-secondary"></span>
            <span>Hệ thống trực tuyến</span>
          </div>
          <span className="font-mono text-[10px]">v1.0.0</span>
        </div>
      </aside>
    </>
  );
};
