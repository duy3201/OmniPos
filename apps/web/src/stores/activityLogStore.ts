'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ActivityActionType =
  | 'LOGIN'
  | 'LOGOUT'
  | 'POS_SALE'
  | 'POS_VOID'
  | 'MANAGER_OVERRIDE'
  | 'PRODUCT_CREATE'
  | 'PRODUCT_UPDATE'
  | 'PRODUCT_DELETE'
  | 'STOCKTAKE'
  | 'SHIFT_CLOSE';

export interface ActivityLog {
  id: string;
  timestamp: string;
  staffName: string;
  staffRole: string;
  actionType: ActivityActionType;
  actionName: string;
  details: string;
  status: 'SUCCESS' | 'WARNING' | 'DENIED';
  device?: string;
}

interface ActivityLogStore {
  logs: ActivityLog[];
  logAction: (entry: Omit<ActivityLog, 'id' | 'timestamp'>) => void;
  clearLogs: () => void;
}

const INITIAL_LOGS: ActivityLog[] = [
  {
    id: 'log-01',
    timestamp: '31/10/2026 00:02:15',
    staffName: 'KS. Trần Minh Anh',
    staffRole: 'Kỹ Sư Thủy Sản',
    actionType: 'POS_SALE',
    actionName: 'Bán lẻ & Ghi nợ vụ nuôi',
    details: 'Xuất bán 2 Chai Yucca Cấp Tốc + 1 Bao Khoáng Tạt cho Ao số 1 (Chú Ba Hùng). Tổng tiền: 980.000₫',
    status: 'SUCCESS',
    device: 'POS Terminal Quầy 1',
  },
  {
    id: 'log-02',
    timestamp: '30/10/2026 23:45:00',
    staffName: 'Nguyễn Hoàng Nam',
    staffRole: 'Cửa Hàng Trưởng',
    actionType: 'MANAGER_OVERRIDE',
    actionName: 'Duyệt nợ vượt hạn mức',
    details: 'Mở khóa xuất kho hóa đơn 14.250.000₫ cho khách hàng VIP Đầm Tôm Cà Mau',
    status: 'SUCCESS',
    device: 'Admin Portal (Chrome)',
  },
  {
    id: 'log-03',
    timestamp: '30/10/2026 22:30:11',
    staffName: 'Lê Hoàng Kho',
    staffRole: 'Thủ Kho',
    actionType: 'LOGIN',
    actionName: 'Đăng nhập hệ thống bằng PIN',
    details: 'Thủ kho đăng nhập thành công vào phân hệ Quản trị Kho',
    status: 'SUCCESS',
    device: 'Tablet Kho Vệ Tinh',
  },
  {
    id: 'log-04',
    timestamp: '30/10/2026 21:10:45',
    staffName: 'Lê Hoàng Kho',
    staffRole: 'Thủ Kho',
    actionType: 'POS_SALE',
    actionName: 'Cố gắng truy cập POS bán hàng',
    details: 'Hệ thống RBAC chặn thao tác: Thủ kho bị cấm bán hàng theo nguyên tắc bất kiêm nhiệm',
    status: 'DENIED',
    device: 'POS Terminal Quầy 2',
  },
  {
    id: 'log-05',
    timestamp: '30/10/2026 20:00:00',
    staffName: 'Phạm Thảo Vy',
    staffRole: 'Thu Ngân',
    actionType: 'SHIFT_CLOSE',
    actionName: 'Đóng ca & Chốt két tiền mặt',
    details: 'Khớp két tiền thực tế 6.250.000₫ (lệch 0₫). Bàn giao phiên làm việc cho ca tối',
    status: 'SUCCESS',
    device: 'Két tiền Quầy 1',
  },
];

export const useActivityLogStore = create<ActivityLogStore>()(
  persist(
    (set, get) => ({
      logs: INITIAL_LOGS,

      logAction: (entry) => {
        const newLog: ActivityLog = {
          id: `log-${Date.now()}`,
          timestamp: new Date().toLocaleString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          }),
          device: 'OmniPOS Web / Mobile',
          ...entry,
        };

        set({
          logs: [newLog, ...get().logs],
        });
      },

      clearLogs: () => set({ logs: [] }),
    }),
    {
      name: 'omnipos_activity_logs',
    }
  )
);
