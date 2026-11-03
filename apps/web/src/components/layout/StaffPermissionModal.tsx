'use client';

import React, { useState } from 'react';
import { Icon, Modal, Button, Badge, useToast } from '@/components/ui';
import { useAuthStore, PRESET_STAFF_USERS } from '@/stores/authStore';

export const StaffPermissionModal: React.FC = () => {
  const {
    currentUser,
    showPermissionModal,
    setShowPermissionModal,
    switchUser,
    logout,
  } = useAuthStore();
  const toast = useToast();

  const [selectedStaffId, setSelectedStaffId] = useState<string>(currentUser?.id || PRESET_STAFF_USERS[0].id);
  const [pinInput, setPinInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!showPermissionModal) return null;

  const activeStaff = PRESET_STAFF_USERS.find((s) => s.id === selectedStaffId) || currentUser || PRESET_STAFF_USERS[0];
  const isCurrentActive = currentUser?.id === activeStaff.id;

  const handleSwitchAccount = () => {
    if (!pinInput.trim()) {
      setErrorMsg('Vui lòng nhập mã PIN nhân viên!');
      return;
    }
    const res = switchUser(selectedStaffId, pinInput);
    if (res.success) {
      toast.success(
        'Chuyển đổi tài khoản thành công!',
        `Đang đăng nhập với vai trò: ${res.user?.name} (${res.user?.roleName})`,
      );
      setPinInput('');
      setErrorMsg('');
      setShowPermissionModal(false);
    } else {
      setErrorMsg(res.error || 'Mã PIN không chính xác!');
    }
  };

  return (
    <Modal
      isOpen={showPermissionModal}
      onClose={() => setShowPermissionModal(false)}
      title="Hồ Sơ Nhân Viên & Bảng Phân Quyền Tác Vụ"
      maxWidth="4xl"
    >
      <div className="space-y-6">
        {/* Top Staff Switcher Cards */}
        <div>
          <label className="block text-label-sm font-bold text-outline uppercase tracking-wider mb-2.5">
            Chọn tài khoản nhân viên cửa hàng:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {PRESET_STAFF_USERS.map((staff) => {
              const isSelected = selectedStaffId === staff.id;
              const isLogged = currentUser?.id === staff.id;
              return (
                <button
                  key={staff.id}
                  type="button"
                  onClick={() => {
                    setSelectedStaffId(staff.id);
                    setErrorMsg('');
                    setPinInput('');
                  }}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'border-primary bg-primary/10 shadow-sm'
                      : 'border-outline-variant/30 bg-surface-container-low hover:bg-surface-container'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs">
                      {staff.avatar}
                    </div>
                    {isLogged && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-600 text-white font-bold">
                        Đang chọn
                      </span>
                    )}
                  </div>
                  <p className="font-bold text-on-surface text-label-md line-clamp-1">
                    {staff.name}
                  </p>
                  <p className="text-[11px] text-outline line-clamp-1">{staff.roleName}</p>
                  <p className="text-[10px] text-primary/80 font-mono mt-1">PIN: {staff.pinCode}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Staff Details Banner */}
        <div className="p-4 rounded-xl bg-surface-container border border-outline-variant/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-primary text-white flex items-center justify-center font-black text-lg shadow-sm">
              {activeStaff.avatar}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-headline-sm font-bold text-on-surface">
                  {activeStaff.name}
                </h3>
                <Badge variant={activeStaff.role === 'STORE_MANAGER' ? 'primary' : 'neutral'}>
                  {activeStaff.roleName}
                </Badge>
              </div>
              <p className="text-body-sm text-outline text-[12px] mt-0.5">
                Mã NV: <span className="font-mono font-bold text-on-surface">{activeStaff.staffCode}</span> • Điện thoại: {activeStaff.phone} • Hạn mức chiết khấu tối đa: <span className="font-bold text-primary">{activeStaff.discountLimitPercent}%</span>
              </p>
            </div>
          </div>

          {!isCurrentActive ? (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative">
                <input
                  type="password"
                  maxLength={6}
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    setErrorMsg('');
                  }}
                  placeholder="Nhập mã PIN..."
                  className="w-32 h-9 px-3 rounded-lg border border-outline-variant/50 bg-surface-container-lowest text-center font-mono text-label-md focus:outline-none focus:border-primary"
                />
              </div>
              <Button variant="primary" icon="login" onClick={handleSwitchAccount}>
                Đăng nhập
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-label-sm text-emerald-600 font-bold flex items-center gap-1">
                <Icon name="check_circle" className="text-[16px]" />
                Đang sử dụng
              </span>
              <Button
                variant="outline"
                icon="logout"
                onClick={() => {
                  logout();
                  setShowPermissionModal(false);
                  toast.info('Đã đăng xuất tài khoản', 'Vui lòng nhập mã PIN để tiếp tục.');
                }}
              >
                Đăng xuất
              </Button>
            </div>
          )}
        </div>

        {errorMsg && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-600 text-body-sm flex items-center gap-2">
            <Icon name="error" className="text-[18px]" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Permissions Grid: Allowed vs Forbidden */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Column 1: Allowed Actions */}
          <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-emerald-500/20">
              <h4 className="font-bold text-label-md text-emerald-800 flex items-center gap-1.5">
                <Icon name="check_circle" className="text-emerald-600 text-[18px]" />
                Tác vụ ĐƯỢC PHÉP thực hiện ({activeStaff.allowedActions.length})
              </h4>
              <span className="text-[11px] text-emerald-600 font-bold uppercase tracking-wider">
                Khả dụng
              </span>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {activeStaff.allowedActions.map((act) => (
                <div
                  key={act.id}
                  className="p-2.5 rounded-lg bg-white/80 border border-emerald-500/20 shadow-xs flex items-start gap-2.5"
                >
                  <div className="w-7 h-7 rounded bg-emerald-500/15 text-emerald-700 flex items-center justify-center shrink-0">
                    <Icon name={act.icon} className="text-[16px]" />
                  </div>
                  <div>
                    <p className="font-bold text-label-sm text-on-surface leading-tight">
                      {act.name}
                    </p>
                    <p className="text-[11px] text-outline mt-0.5 leading-snug">
                      {act.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Column 2: Forbidden / Restricted Actions */}
          <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-rose-500/20">
              <h4 className="font-bold text-label-md text-rose-800 flex items-center gap-1.5">
                <Icon name="block" className="text-rose-600 text-[18px]" />
                Tác vụ BỊ CẤM / Giới hạn ({activeStaff.forbiddenActions.length})
              </h4>
              <span className="text-[11px] text-rose-600 font-bold uppercase tracking-wider">
                Khóa quyền
              </span>
            </div>

            {activeStaff.forbiddenActions.length === 0 ? (
              <div className="p-6 text-center text-outline">
                <Icon name="verified_user" className="text-emerald-500 text-[36px] mx-auto mb-2" />
                <p className="font-bold text-on-surface text-label-md">Toàn quyền quản trị cao nhất</p>
                <p className="text-[12px] text-outline mt-1">
                  Tài khoản Quản Lý không bị giới hạn bất kỳ tác vụ nào.
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {activeStaff.forbiddenActions.map((fb) => (
                  <div
                    key={fb.id}
                    className="p-2.5 rounded-lg bg-white/80 border border-rose-500/20 shadow-xs flex items-start gap-2.5"
                  >
                    <div className="w-7 h-7 rounded bg-rose-500/15 text-rose-700 flex items-center justify-center shrink-0">
                      <Icon name={fb.icon} className="text-[16px]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p className="font-bold text-label-sm text-rose-900 leading-tight">
                          {fb.name}
                        </p>
                        {fb.requiresManagerPin && (
                          <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-700 text-[10px] font-bold shrink-0">
                            Cần PIN QL
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-outline mt-0.5 leading-snug">
                        {fb.reason}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer info note */}
        <div className="p-3 rounded-lg bg-surface-container-low text-[12px] text-outline flex items-center gap-2">
          <Icon name="info" className="text-[16px] text-primary" />
          <span>
            Bảng phân quyền này được thiết lập tự động theo quy chuẩn quản trị cửa hàng vật tư thủy sản để bảo vệ kho hàng và phòng chống thất thoát tài chính.
          </span>
        </div>
      </div>
    </Modal>
  );
};
