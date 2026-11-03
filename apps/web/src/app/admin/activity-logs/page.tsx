'use client';

import React, { useState } from 'react';
import { Icon, Badge, Button, BentoCard } from '@/components/ui';
import { useActivityLogStore, ActivityActionType, ActivityLog } from '@/stores/activityLogStore';

export default function ActivityLogsPage() {
  const { logs, clearLogs } = useActivityLogStore();
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLogs = logs.filter((log) => {
    const matchesFilter = filterType === 'ALL' || log.actionType === filterType;
    const matchesSearch =
      searchQuery === '' ||
      log.staffName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.actionName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getActionIcon = (type: ActivityActionType) => {
    switch (type) {
      case 'POS_SALE':
        return 'shopping_cart';
      case 'POS_VOID':
        return 'remove_shopping_cart';
      case 'MANAGER_OVERRIDE':
        return 'shield_person';
      case 'PRODUCT_CREATE':
      case 'PRODUCT_UPDATE':
      case 'PRODUCT_DELETE':
        return 'inventory_2';
      case 'SHIFT_CLOSE':
        return 'point_of_sale';
      case 'LOGIN':
      case 'LOGOUT':
        return 'account_circle';
      default:
        return 'history';
    }
  };

  const getStatusBadge = (status: ActivityLog['status']) => {
    switch (status) {
      case 'SUCCESS':
        return <Badge variant="success" size="sm">Thành công</Badge>;
      case 'DENIED':
        return <Badge variant="danger" size="sm">Bị chặn (RBAC)</Badge>;
      case 'WARNING':
        return <Badge variant="warning" size="sm">Cảnh báo</Badge>;
    }
  };

  const deniedCount = logs.filter((l) => l.status === 'DENIED').length;
  const saleCount = logs.filter((l) => l.actionType === 'POS_SALE').length;
  const overrideCount = logs.filter((l) => l.actionType === 'MANAGER_OVERRIDE').length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline-sm text-headline-lg font-bold text-on-surface">
            Nhật Ký Hoạt Động &amp; Kiểm Toán Hệ Thống (Audit Trail)
          </h1>
          <p className="text-body-sm text-outline">
            Ghi vết bất biến 100% mọi thao tác nhân viên, bán hàng POS, phê duyệt quyền và chặn vi phạm RBAC
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            icon="delete_sweep"
            onClick={() => {
              if (confirm('Bạn có chắc muốn xóa lịch sử nhật ký hiển thị?')) {
                clearLogs();
              }
            }}
          >
            Làm sạch nhật ký
          </Button>
        </div>
      </div>

      {/* KPI Bento Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <BentoCard>
          <span className="text-label-sm uppercase text-outline font-bold tracking-wider block">
            Tổng số thao tác đã ghi nhận
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-display text-headline-lg font-black text-primary">
              {logs.length}
            </span>
            <Badge variant="primary" size="sm">Audit Active</Badge>
          </div>
          <span className="text-[11px] text-outline mt-1 block">
            Theo dõi real-time toàn cửa hàng
          </span>
        </BentoCard>

        <BentoCard>
          <span className="text-label-sm uppercase text-secondary font-bold tracking-wider block">
            Giao dịch bán lẻ &amp; Nợ vụ POS
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-display text-headline-lg font-black text-secondary">
              {saleCount}
            </span>
            <span className="text-label-sm text-outline font-medium">Lệnh xuất bill</span>
          </div>
          <span className="text-[11px] text-secondary mt-1 block">
            Hóa đơn tiền mặt, VietQR và sổ nợ ao
          </span>
        </BentoCard>

        <BentoCard>
          <span className="text-label-sm uppercase text-tertiary font-bold tracking-wider block">
            Phê duyệt vượt quyền quản lý
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-display text-headline-lg font-black text-tertiary">
              {overrideCount}
            </span>
            <Badge variant="warning" size="sm">Manager PIN</Badge>
          </div>
          <span className="text-[11px] text-tertiary mt-1 block">
            Duyệt vượt hạn mức nợ &amp; giảm giá
          </span>
        </BentoCard>

        <BentoCard>
          <span className="text-label-sm uppercase text-error font-bold tracking-wider block">
            Vi phạm quyền hạn (Chặn RBAC)
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-display text-headline-lg font-black text-error">
              {deniedCount}
            </span>
            <Badge variant="danger" dot size="sm">Nguyên tắc kiêm nhiệm</Badge>
          </div>
          <span className="text-[11px] text-error mt-1 block">
            Thủ kho thử bán hàng hoặc thu nợ
          </span>
        </BentoCard>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-4 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Icon name="search" className="absolute left-3 top-2.5 text-outline text-[18px]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm nhân viên, thao tác, nội dung..."
              className="w-full h-10 pl-9 pr-3 rounded-xl bg-surface-container-low text-body-sm text-on-surface border border-outline-variant/40 focus:outline-none focus:border-primary"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {[
              { id: 'ALL', label: 'Tất cả hoạt động' },
              { id: 'POS_SALE', label: 'Bán hàng POS' },
              { id: 'MANAGER_OVERRIDE', label: 'Duyệt quyền Quản lý' },
              { id: 'PRODUCT_UPDATE', label: 'Sản phẩm & Biến thể' },
              { id: 'SHIFT_CLOSE', label: 'Đóng két ca' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilterType(f.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  filterType === f.id
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-surface-container-low text-outline hover:text-on-surface'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Activity Timeline List */}
        <div className="divide-y divide-outline-variant/20 pt-2">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12 text-outline">
              <Icon name="manage_search" className="text-[44px] mx-auto text-outline/50 mb-2" />
              <p className="font-semibold text-on-surface">Không có nhật ký nào phù hợp</p>
              <p className="text-xs text-outline mt-1">Thử đổi bộ lọc hoặc từ khóa tìm kiếm</p>
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div key={log.id} className="py-4 flex items-start gap-4 hover:bg-surface-container-low/40 px-2 rounded-xl transition-colors">
                {/* Icon Circle */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  log.status === 'DENIED'
                    ? 'bg-error-container text-error'
                    : log.actionType === 'MANAGER_OVERRIDE'
                    ? 'bg-tertiary-fixed text-on-tertiary-container'
                    : 'bg-primary-fixed text-primary'
                }`}>
                  <Icon name={getActionIcon(log.actionType)} className="text-[20px]" />
                </div>

                {/* Content */}
                <div className="flex-1 space-y-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-label-md text-on-surface">
                        {log.actionName}
                      </span>
                      {getStatusBadge(log.status)}
                    </div>
                    <span className="text-xs text-outline font-mono">
                      {log.timestamp}
                    </span>
                  </div>

                  <p className="text-body-sm text-on-surface-variant leading-relaxed">
                    {log.details}
                  </p>

                  <div className="flex items-center gap-3 text-xs text-outline pt-1">
                    <span className="flex items-center gap-1 font-medium text-on-surface">
                      <Icon name="person" className="text-[14px] text-primary" />
                      {log.staffName} ({log.staffRole})
                    </span>
                    {log.device && (
                      <span className="flex items-center gap-1">
                        <Icon name="devices" className="text-[14px]" />
                        {log.device}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
