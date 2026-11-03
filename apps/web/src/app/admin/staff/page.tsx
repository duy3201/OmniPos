'use client';

import React, { useState, useEffect } from 'react';
import { Icon, Badge, Button, BentoCard, Modal, useToast } from '@/components/ui';
import { useAuthStore, PRESET_STAFF_USERS, StaffUser, RoleType } from '@/stores/authStore';

interface RoleConfig {
  role: string;
  allowedRoutes: string[];
  allowedActions: string[];
  forbiddenActions: string[];
  maxDiscountPercent: number;
  notes?: string;
}

export default function StaffPage() {
  const toast = useToast();
  const { currentUser, setShowPermissionModal, setCustomStaffList } = useAuthStore();

  const [staffList, setStaffList] = useState<StaffUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffPhone, setNewStaffPhone] = useState('');
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffRole, setNewStaffRole] = useState<RoleType>('CASHIER');
  const [newStaffPin, setNewStaffPin] = useState('');
  const [newStaffDiscount, setNewStaffDiscount] = useState<number>(5);
  const [newStaffCanVoid, setNewStaffCanVoid] = useState(false);
  const [showPinStaffId, setShowPinStaffId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dynamic Permission Matrix states (Super Admin can edit)
  const [permissionConfigs, setPermissionConfigs] = useState<Record<string, RoleConfig>>({});
  const [isSavingPermissions, setIsSavingPermissions] = useState(false);

  // Load real staff and permission configs from PostgreSQL
  const loadStaffAndConfigs = async () => {
    try {
      setLoading(true);
      const [staffRes, permRes] = await Promise.all([
        fetch('/api/staff'),
        fetch('/api/settings/permissions'),
      ]);

      if (staffRes.ok) {
        const staffData = await staffRes.json();
        if (Array.isArray(staffData) && staffData.length > 0) {
          setStaffList(staffData);
          setCustomStaffList(staffData);
        } else {
          setStaffList(PRESET_STAFF_USERS);
        }
      } else {
        setStaffList(PRESET_STAFF_USERS);
      }

      if (permRes.ok) {
        const permData = await permRes.json();
        if (Array.isArray(permData)) {
          const mapped: Record<string, RoleConfig> = {};
          permData.forEach((item: any) => {
            mapped[item.role] = {
              role: item.role,
              allowedRoutes: Array.isArray(item.allowedRoutes) ? item.allowedRoutes : [],
              allowedActions: Array.isArray(item.allowedActions) ? item.allowedActions : [],
              forbiddenActions: Array.isArray(item.forbiddenActions) ? item.forbiddenActions : [],
              maxDiscountPercent: Number(item.maxDiscountPercent) || 0,
              notes: item.notes,
            };
          });
          setPermissionConfigs(mapped);
        }
      }
    } catch (err: any) {
      console.error('Lỗi khi tải dữ liệu nhân sự:', err);
      setStaffList(PRESET_STAFF_USERS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStaffAndConfigs();
  }, []);

  // Update default discount limit when role changes in modal
  const handleRoleChange = (role: RoleType) => {
    setNewStaffRole(role);
    if (role === 'SUPER_ADMIN') {
      setNewStaffDiscount(100);
      setNewStaffCanVoid(true);
    } else if (role === 'STORE_MANAGER') {
      setNewStaffDiscount(20);
      setNewStaffCanVoid(true);
    } else if (role === 'AQUA_TECHNICIAN') {
      setNewStaffDiscount(10);
      setNewStaffCanVoid(false);
    } else if (role === 'CASHIER') {
      setNewStaffDiscount(5);
      setNewStaffCanVoid(false);
    } else {
      setNewStaffDiscount(0);
      setNewStaffCanVoid(false);
    }
  };

  // Save new staff directly to PostgreSQL
  const handleSaveStaff = async () => {
    if (!newStaffName.trim()) {
      toast.error('Thiếu họ tên', 'Vui lòng nhập họ và tên nhân viên!');
      return;
    }
    if (!newStaffPhone.trim()) {
      toast.error('Thiếu số điện thoại', 'Vui lòng nhập số điện thoại để liên hệ và quản trị!');
      return;
    }
    if (!newStaffPin || newStaffPin.length < 4) {
      toast.warning('Mã PIN chưa hợp lệ', 'Mã PIN POS phải có ít nhất 4 chữ số!');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch('/api/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newStaffName.trim(),
          phone: newStaffPhone.trim(),
          email: newStaffEmail.trim() || undefined,
          role: newStaffRole,
          pinCode: newStaffPin.trim(),
          discountLimitPercent: Number(newStaffDiscount),
          canVoidOrder: newStaffCanVoid,
        }),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || 'Không thể tạo nhân sự');
      }

      toast.success(
        'Đã lưu vào PostgreSQL!',
        `Nhân sự ${result.name} (${result.roleName}) - Mã PIN: ${newStaffPin} đã được lưu bền vững vào Neon Database.`,
      );

      setShowAddModal(false);
      setNewStaffName('');
      setNewStaffPhone('');
      setNewStaffEmail('');
      setNewStaffPin('');
      await loadStaffAndConfigs();
    } catch (err: any) {
      toast.error('Lỗi lưu nhân sự', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete staff from PostgreSQL
  const handleDeleteStaff = async (staff: StaffUser) => {
    if (staff.role === 'SUPER_ADMIN') {
      toast.error('Bảo mật', 'Không thể xóa tài khoản Super Admin tối cao!');
      return;
    }
    if (!confirm(`Bạn có chắc chắn muốn xóa/ngưng hoạt động nhân sự "${staff.name}" (${staff.staffCode})?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/staff/${staff.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi khi xóa');

      toast.success('Thành công', data.message || 'Đã cập nhật trạng thái nhân sự');
      await loadStaffAndConfigs();
    } catch (err: any) {
      toast.error('Lỗi xóa nhân sự', err.message);
    }
  };

  // Toggle permission in matrix for a specific role
  const handleToggleAction = (role: string, actionKey: string) => {
    setPermissionConfigs((prev) => {
      const current = prev[role] || {
        role,
        allowedRoutes: [],
        allowedActions: [],
        forbiddenActions: [],
        maxDiscountPercent: 5,
      };

      const hasAction = current.allowedActions.includes(actionKey);
      const newAllowed = hasAction
        ? current.allowedActions.filter((a) => a !== actionKey)
        : [...current.allowedActions, actionKey];

      return {
        ...prev,
        [role]: {
          ...current,
          allowedActions: newAllowed,
        },
      };
    });
  };

  // Save updated permissions to PostgreSQL
  const handleSavePermissionConfig = async (role: string) => {
    const cfg = permissionConfigs[role];
    if (!cfg) return;

    try {
      setIsSavingPermissions(true);
      const res = await fetch('/api/settings/permissions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cfg),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Lỗi khi lưu');
      }

      toast.success(
        'Đã cập nhật phân quyền!',
        `Phân quyền cho chức vụ ${role} đã được lưu trực tiếp vào cơ sở dữ liệu PostgreSQL.`,
      );
    } catch (err: any) {
      toast.error('Lỗi cập nhật quyền', err.message);
    } finally {
      setIsSavingPermissions(false);
    }
  };

  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';

  const matrixRows = [
    {
      key: 'pos.sell',
      task: 'Bán hàng siêu tốc POS (F1-F9)',
      desc: 'Quét mã vạch, thanh toán tiền mặt & VietQR',
      defaultRoles: ['SUPER_ADMIN', 'STORE_MANAGER', 'AQUA_TECHNICIAN', 'CASHIER'],
    },
    {
      key: 'debt.collect',
      task: 'Thu nợ vụ nuôi & Lập phiếu thu tiền mặt',
      desc: 'Ghi nhận đợt thu tiền bán tôm của chủ đầm và in phiếu thu K80',
      defaultRoles: ['SUPER_ADMIN', 'STORE_MANAGER', 'CASHIER'],
    },
    {
      key: 'debt.sell_within_limit',
      task: 'Bán nợ vụ nuôi trong hạn mức',
      desc: 'Ghi sổ nợ vụ đầm tôm theo định mức được duyệt',
      defaultRoles: ['SUPER_ADMIN', 'STORE_MANAGER', 'AQUA_TECHNICIAN', 'CASHIER'],
    },
    {
      key: 'debt.approve',
      task: 'Duyệt bán nợ VƯỢT hạn mức tín dụng',
      desc: 'Cần thẩm định rủi ro vụ nuôi & sản lượng ao',
      defaultRoles: ['SUPER_ADMIN', 'STORE_MANAGER'],
    },
    {
      key: 'pos.void',
      task: 'Hủy đơn hàng POS (Void Order)',
      desc: 'Xóa hóa đơn sai sót hoặc khách trả lại hàng',
      defaultRoles: ['SUPER_ADMIN', 'STORE_MANAGER'],
    },
    {
      key: 'prescription.prescribe',
      task: 'Xét nghiệm nước & Kê toa thuốc',
      desc: 'Chỉ định phác đồ điều trị bệnh tôm và chuyển sang POS',
      defaultRoles: ['SUPER_ADMIN', 'STORE_MANAGER', 'AQUA_TECHNICIAN'],
    },
    {
      key: 'inventory.create_product',
      task: 'Tạo sản phẩm & Đơn vị quy đổi mới',
      desc: 'Khai báo hàng mới, quy cách can/bao/thùng/tấn',
      defaultRoles: ['SUPER_ADMIN', 'STORE_MANAGER', 'WAREHOUSE_KEEPER'],
    },
    {
      key: 'inventory.stocktake',
      task: 'Nhập hàng NCC, Kiểm kê & Lô FEFO',
      desc: 'Quét mã vạch đối soát tồn kho, cân bằng Thẻ Kho Bất Biến',
      defaultRoles: ['SUPER_ADMIN', 'STORE_MANAGER', 'WAREHOUSE_KEEPER'],
    },
    {
      key: 'inventory.transfer',
      task: 'Điều chuyển kho bờ ao / Bến ghe',
      desc: 'Lập lệnh chuyển hàng ra kho vệ tinh gần đầm tôm',
      defaultRoles: ['SUPER_ADMIN', 'STORE_MANAGER', 'WAREHOUSE_KEEPER'],
    },
    {
      key: 'inventory.edit_mac',
      task: 'Xem & Sửa giá vốn MAC nhà cung cấp',
      desc: 'Bảo mật chính sách giá mua sỉ của công ty',
      defaultRoles: ['SUPER_ADMIN', 'STORE_MANAGER'],
    },
    {
      key: 'report.view_financials',
      task: 'Xem báo cáo Lãi gộp & Két tiền mặt',
      desc: 'Đối chiếu chênh lệch tiền mặt cuối ca thu ngân',
      defaultRoles: ['SUPER_ADMIN', 'STORE_MANAGER'],
    },
    {
      key: 'staff.manage',
      task: 'Quản trị nhân sự & Cấp mã PIN',
      desc: 'Tạo tài khoản, cấp mã PIN và phân quyền',
      defaultRoles: ['SUPER_ADMIN', 'STORE_MANAGER'],
    },
    {
      key: 'system.config',
      task: 'Toàn quyền cấu hình hệ thống & Super Admin',
      desc: 'Điều chỉnh ma trận quyền cho Quản lý và các chức vụ',
      defaultRoles: ['SUPER_ADMIN'],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-headline-sm sm:text-headline-lg font-bold text-on-surface">
              Quản Lý Nhân Sự &amp; Bảng Phân Quyền
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-label-xs font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              PostgreSQL Connected
            </span>
          </div>
          <p className="text-body-sm text-outline mt-0.5">
            Cấp mã PIN cảm ứng • Phân quyền Super Admin linh hoạt • Lưu bền vững vào Neon Database
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="outline"
            icon="shield"
            onClick={() => setShowPermissionModal(true)}
            className="text-xs sm:text-sm"
          >
            Quyền của tôi ({currentUser?.name})
          </Button>
          <Button
            variant="primary"
            icon="person_add"
            onClick={() => setShowAddModal(true)}
            className="text-xs sm:text-sm"
          >
            + Thêm nhân sự mới
          </Button>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-outline-variant/20 bg-surface-container-low/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h3 className="font-bold text-title-md text-on-surface flex items-center gap-2">
            <Icon name="badge" className="text-primary text-[20px]" />
            Danh sách nhân sự cửa hàng ({staffList.length} nhân viên)
          </h3>
          <span className="text-[12px] text-outline">
            Dữ liệu kết nối Neon PostgreSQL • Bấm nút thao tác để quản lý
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-body-sm min-w-[700px]">
            <thead>
              <tr className="bg-surface-container-low text-outline uppercase text-[11px] font-bold border-b border-outline-variant/20">
                <th className="py-3 px-4">Mã &amp; Họ Tên</th>
                <th className="py-3 px-3">Chức Danh / Vai Trò</th>
                <th className="py-3 px-3 text-center">Mã PIN POS</th>
                <th className="py-3 px-3 text-center">Hạn Mức Chiết Khấu</th>
                <th className="py-3 px-3 text-center">Quyền Hủy Bill</th>
                <th className="py-3 px-3 text-center">Trạng Thái</th>
                <th className="py-3 px-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/15">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-outline">
                    <div className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
                      <span>Đang đồng bộ nhân sự từ PostgreSQL...</span>
                    </div>
                  </td>
                </tr>
              ) : staffList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-outline">
                    Chưa có nhân sự nào trong hệ thống.
                  </td>
                </tr>
              ) : (
                staffList.map((st) => {
                  const isCurrent = currentUser?.id === st.id;
                  const isSA = st.role === 'SUPER_ADMIN';

                  return (
                    <tr
                      key={st.id}
                      className={`transition-colors ${
                        isCurrent ? 'bg-primary-fixed/20' : 'hover:bg-surface-container-low/50'
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl font-bold text-xs flex items-center justify-center shrink-0 shadow-xs ${
                              isSA ? 'bg-purple-600 text-white' : 'bg-primary text-white'
                            }`}
                          >
                            {st.avatar || 'NV'}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <p className="font-bold text-on-surface">{st.name}</p>
                              {isSA && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] bg-purple-600 text-white font-bold">
                                  Tối Cao
                                </span>
                              )}
                              {isCurrent && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-600 text-white font-bold">
                                  Đang online
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-outline font-mono">
                              {st.staffCode} • {st.phone}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <span
                          className={`font-semibold text-xs px-2 py-0.5 rounded-full ${
                            isSA
                              ? 'bg-purple-100 text-purple-700 border border-purple-200'
                              : st.role === 'STORE_MANAGER'
                              ? 'bg-primary/10 text-primary border border-primary/20'
                              : st.role === 'AQUA_TECHNICIAN'
                              ? 'bg-sky-100 text-sky-700 border border-sky-200'
                              : st.role === 'CASHIER'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                          }`}
                        >
                          {st.roleName || st.role}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => setShowPinStaffId(showPinStaffId === st.id ? null : st.id)}
                          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded font-mono font-bold text-[12px] bg-surface-container border border-outline-variant/40 hover:bg-surface-container-high transition-colors"
                          title="Nhấp để ẩn/hiện mã PIN"
                        >
                          <span>{showPinStaffId === st.id ? st.pinCode : '••••'}</span>
                          <Icon
                            name={showPinStaffId === st.id ? 'visibility_off' : 'visibility'}
                            className="text-[14px] text-outline"
                          />
                        </button>
                      </td>

                      <td className="py-3 px-3 text-center font-bold text-on-surface">
                        {st.discountLimitPercent >= 100 ? '100% (Không giới hạn)' : `Tối đa ${st.discountLimitPercent}%`}
                      </td>

                      <td className="py-3 px-3 text-center">
                        {st.canVoidOrder ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-[12px]">
                            <Icon name="check_circle" className="text-[16px]" />
                            Có quyền
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-rose-600 font-bold text-[12px]">
                            <Icon name="lock" className="text-[16px]" />
                            Cần PIN QL
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-center">
                        {st.active !== false ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-[12px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            Hoạt động
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-outline font-bold text-[12px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-outline"></span>
                            Đã khóa
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setShowPermissionModal(true)}
                            className="px-2.5 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-label-xs font-semibold transition-colors"
                            title="Xem chi tiết quyền hạn"
                          >
                            Xem quyền
                          </button>
                          {!isSA && (
                            <button
                              type="button"
                              onClick={() => handleDeleteStaff(st)}
                              className="p-1 rounded-lg text-outline hover:text-error hover:bg-error-container/20 transition-colors"
                              title="Xóa hoặc vô hiệu hóa nhân sự"
                            >
                              <Icon name="delete" className="text-[16px]" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Permissions Traceability Matrix & Dynamic Adjustment */}
      <BentoCard
        title="Bảng Ma Trận Phân Quyền Chi Tiết & Tùy Chỉnh Linh Hoạt"
        action={
          isSuperAdmin ? (
            <span className="px-2 py-0.5 rounded bg-purple-600 text-white text-xs font-bold flex items-center gap-1">
              <Icon name="security" className="text-[14px]" /> Super Admin Chế Độ Tùy Biến
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded bg-surface-container-high text-outline text-xs font-medium">
              Chỉ xem (Cần Super Admin để chỉnh sửa)
            </span>
          )
        }
      >
        <p className="text-body-sm text-outline mb-4">
          Quy chuẩn phân định ranh giới trách nhiệm giữa Super Admin, Quản Lý Cửa Hàng, Kỹ Sư Xét Nghiệm, Thu Ngân và Thủ Kho.
          {isSuperAdmin && (
            <strong className="text-primary block mt-1">
              ★ Là Super Admin, bạn có thể nhấp trực tiếp vào các ô bên dưới để bật/tắt quyền hạn linh hoạt và lưu cấu hình vào PostgreSQL.
            </strong>
          )}
        </p>

        <div className="overflow-x-auto rounded-xl border border-outline-variant/30">
          <table className="w-full text-left border-collapse text-body-sm min-w-[750px]">
            <thead>
              <tr className="bg-surface-container text-on-surface uppercase text-[11px] font-bold border-b border-outline-variant/30">
                <th className="py-3 px-4 w-[35%]">Tác Vụ Nghiệp Vụ Cửa Hàng Thủy Sản</th>
                <th className="py-3 px-3 text-center bg-purple-500/10 text-purple-800">Super Admin</th>
                <th className="py-3 px-3 text-center bg-primary/10 text-primary">Quản Lý Cửa Hàng</th>
                <th className="py-3 px-3 text-center bg-sky-500/10 text-sky-700">Kỹ Sư Thủy Sản</th>
                <th className="py-3 px-3 text-center bg-amber-500/10 text-amber-800">Thu Ngân Quầy</th>
                <th className="py-3 px-3 text-center bg-indigo-500/10 text-indigo-800">Thủ Kho</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20 bg-surface-container-lowest">
              {matrixRows.map((row) => {
                const isActionAllowed = (role: string) => {
                  const cfg = permissionConfigs[role];
                  if (cfg && Array.isArray(cfg.allowedActions)) {
                    return cfg.allowedActions.includes(row.key);
                  }
                  return row.defaultRoles.includes(role);
                };

                return (
                  <tr key={row.key} className="hover:bg-surface-container-low/40">
                    <td className="py-3 px-4">
                      <p className="font-bold text-on-surface leading-tight">{row.task}</p>
                      <p className="text-[11px] text-outline mt-0.5">{row.desc}</p>
                    </td>

                    {/* Super Admin */}
                    <td className="py-3 px-3 text-center bg-purple-500/5">
                      <span className="inline-flex items-center gap-1 text-purple-700 font-bold text-[12px]">
                        <Icon name="verified" className="text-[16px]" /> Toàn quyền
                      </span>
                    </td>

                    {/* Manager */}
                    <td className="py-3 px-3 text-center bg-primary/5">
                      {isSuperAdmin && row.key !== 'system.config' ? (
                        <button
                          type="button"
                          onClick={() => handleToggleAction('STORE_MANAGER', row.key)}
                          className="inline-flex items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity"
                        >
                          {isActionAllowed('STORE_MANAGER') ? (
                            <span className="text-emerald-600 font-bold text-[12px] flex items-center gap-1">
                              <Icon name="check_circle" className="text-[16px]" /> Cho phép
                            </span>
                          ) : (
                            <span className="text-rose-600 font-bold text-[12px] flex items-center gap-1">
                              <Icon name="block" className="text-[16px]" /> Bị cấm
                            </span>
                          )}
                        </button>
                      ) : (
                        isActionAllowed('STORE_MANAGER') ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-[12px]">
                            <Icon name="check_circle" className="text-[16px]" /> Cho phép
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-rose-600 font-bold text-[12px]">
                            <Icon name="block" className="text-[16px]" /> Cấm
                          </span>
                        )
                      )}
                    </td>

                    {/* Technician */}
                    <td className="py-3 px-3 text-center bg-sky-500/5">
                      {isSuperAdmin ? (
                        <button
                          type="button"
                          onClick={() => handleToggleAction('AQUA_TECHNICIAN', row.key)}
                          className="inline-flex items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity"
                        >
                          {isActionAllowed('AQUA_TECHNICIAN') ? (
                            <span className="text-emerald-600 font-bold text-[12px] flex items-center gap-1">
                              <Icon name="check_circle" className="text-[16px]" /> Cho phép
                            </span>
                          ) : (
                            <span className="text-rose-600 font-bold text-[12px] flex items-center gap-1">
                              <Icon name="lock" className="text-[16px]" /> Bị cấm
                            </span>
                          )}
                        </button>
                      ) : (
                        isActionAllowed('AQUA_TECHNICIAN') ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-[12px]">
                            <Icon name="check_circle" className="text-[16px]" /> Cho phép
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-rose-600 font-bold text-[12px]">
                            <Icon name="lock" className="text-[16px]" /> Bị cấm
                          </span>
                        )
                      )}
                    </td>

                    {/* Cashier */}
                    <td className="py-3 px-3 text-center bg-amber-500/5">
                      {isSuperAdmin ? (
                        <button
                          type="button"
                          onClick={() => handleToggleAction('CASHIER', row.key)}
                          className="inline-flex items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity"
                        >
                          {isActionAllowed('CASHIER') ? (
                            <span className="text-emerald-600 font-bold text-[12px] flex items-center gap-1">
                              <Icon name="check_circle" className="text-[16px]" /> Cho phép
                            </span>
                          ) : (
                            <span className="text-rose-600 font-bold text-[12px] flex items-center gap-1">
                              <Icon name="lock" className="text-[16px]" /> Bị cấm
                            </span>
                          )}
                        </button>
                      ) : (
                        isActionAllowed('CASHIER') ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-[12px]">
                            <Icon name="check_circle" className="text-[16px]" /> Cho phép
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-rose-600 font-bold text-[12px]">
                            <Icon name="lock" className="text-[16px]" /> Bị cấm
                          </span>
                        )
                      )}
                    </td>

                    {/* Warehouse */}
                    <td className="py-3 px-3 text-center bg-indigo-500/5">
                      {isSuperAdmin ? (
                        <button
                          type="button"
                          onClick={() => handleToggleAction('WAREHOUSE_KEEPER', row.key)}
                          className="inline-flex items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity"
                        >
                          {isActionAllowed('WAREHOUSE_KEEPER') ? (
                            <span className="text-emerald-600 font-bold text-[12px] flex items-center gap-1">
                              <Icon name="check_circle" className="text-[16px]" /> Cho phép
                            </span>
                          ) : (
                            <span className="text-rose-600 font-bold text-[12px] flex items-center gap-1">
                              <Icon name="block" className="text-[16px]" /> Bị cấm
                            </span>
                          )}
                        </button>
                      ) : (
                        isActionAllowed('WAREHOUSE_KEEPER') ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-[12px]">
                            <Icon name="check_circle" className="text-[16px]" /> Cho phép
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-rose-600 font-bold text-[12px]">
                            <Icon name="block" className="text-[16px]" /> Bị cấm
                          </span>
                        )
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Super Admin Save Buttons */}
        {isSuperAdmin && (
          <div className="mt-4 pt-4 border-t border-outline-variant/30 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-outline">
              Nhấp vào nút để lưu cấu hình đã tùy chỉnh cho từng chức vụ vào Neon Database.
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSavePermissionConfig('STORE_MANAGER')}
                disabled={isSavingPermissions}
              >
                Lưu Quản Lý
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSavePermissionConfig('AQUA_TECHNICIAN')}
                disabled={isSavingPermissions}
              >
                Lưu Kỹ Sư
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSavePermissionConfig('CASHIER')}
                disabled={isSavingPermissions}
              >
                Lưu Thu Ngân
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSavePermissionConfig('WAREHOUSE_KEEPER')}
                disabled={isSavingPermissions}
              >
                Lưu Thủ Kho
              </Button>
            </div>
          </div>
        )}
      </BentoCard>

      {/* Add Staff Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Thêm Nhân Sự Mới &amp; Cấp Mã PIN POS"
        subtitle="Dữ liệu nhân sự được đồng bộ lưu trực tiếp vào cơ sở dữ liệu PostgreSQL"
        maxWidth="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-label-sm font-semibold text-on-surface mb-1">
              Họ và tên nhân sự <span className="text-error">*</span>
            </label>
            <input
              type="text"
              placeholder="VD: Nguyễn Văn An"
              value={newStaffName}
              onChange={(e) => setNewStaffName(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-outline-variant/40 bg-surface-container-lowest text-body-sm font-semibold text-on-surface focus:outline-none focus:border-primary"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-label-sm font-semibold text-on-surface mb-1">
                Số điện thoại liên hệ <span className="text-error">*</span>
              </label>
              <input
                type="tel"
                placeholder="0912.345.678"
                value={newStaffPhone}
                onChange={(e) => setNewStaffPhone(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-outline-variant/40 bg-surface-container-lowest text-body-sm font-semibold text-on-surface focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-label-sm font-semibold text-on-surface mb-1">
                Email (Tùy chọn)
              </label>
              <input
                type="email"
                placeholder="nhansu@omnipos.vn"
                value={newStaffEmail}
                onChange={(e) => setNewStaffEmail(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-outline-variant/40 bg-surface-container-lowest text-body-sm text-on-surface focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-label-sm font-semibold text-on-surface mb-1">
                Vai trò chức danh
              </label>
              <select
                value={newStaffRole}
                onChange={(e) => handleRoleChange(e.target.value as RoleType)}
                className="w-full h-10 px-3 rounded-lg border border-outline-variant/40 bg-surface-container-lowest text-label-sm text-on-surface outline-none cursor-pointer"
              >
                {isSuperAdmin && (
                  <option value="SUPER_ADMIN">★ Super Admin (Tổng quản trị tối cao)</option>
                )}
                <option value="STORE_MANAGER">Quản Lý Cửa Hàng (Toàn quyền chi nhánh)</option>
                <option value="AQUA_TECHNICIAN">Kỹ Sư Thủy Sản (Xét nghiệm &amp; Kê toa)</option>
                <option value="CASHIER">Thu Ngân Quầy POS (Bán lẻ &amp; Thu nợ)</option>
                <option value="WAREHOUSE_KEEPER">Thủ Kho (Kiểm kê &amp; Nhập hàng NCC)</option>
              </select>
            </div>

            <div>
              <label className="block text-label-sm font-semibold text-on-surface mb-1">
                Mã PIN máy POS (4-6 số) <span className="text-error">*</span>
              </label>
              <input
                type="password"
                maxLength={6}
                placeholder="4-6 chữ số"
                value={newStaffPin}
                onChange={(e) => setNewStaffPin(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-outline-variant/40 bg-surface-container-lowest font-mono text-center text-headline-sm font-bold tracking-widest focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-label-sm font-semibold text-on-surface mb-1">
                Hạn mức chiết khấu POS (%)
              </label>
              <input
                type="number"
                min={0}
                max={100}
                value={newStaffDiscount}
                onChange={(e) => setNewStaffDiscount(Number(e.target.value))}
                className="w-full h-10 px-3 rounded-lg border border-outline-variant/40 bg-surface-container-lowest text-body-sm font-semibold text-on-surface focus:outline-none focus:border-primary"
              />
            </div>

            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="canVoidOrderCheck"
                checked={newStaffCanVoid}
                onChange={(e) => setNewStaffCanVoid(e.target.checked)}
                className="w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer"
              />
              <label htmlFor="canVoidOrderCheck" className="text-label-sm font-semibold text-on-surface cursor-pointer">
                Được phép hủy đơn hàng POS (Void)
              </label>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-surface-container-low text-[12px] text-outline">
            Sau khi lưu, nhân viên sẽ được tạo trong cơ sở dữ liệu PostgreSQL thật và có thể dùng mã PIN đăng nhập ngay tại quầy POS hoặc chuyển tài khoản.
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-outline-variant/20">
            <Button variant="outline" onClick={() => setShowAddModal(false)} disabled={isSubmitting}>
              Hủy bỏ
            </Button>
            <Button variant="primary" icon="save" onClick={handleSaveStaff} disabled={isSubmitting}>
              {isSubmitting ? 'Đang lưu vào DB...' : 'Lưu vào PostgreSQL'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
