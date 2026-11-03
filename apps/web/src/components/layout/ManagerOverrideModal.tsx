'use client';

import React, { useState } from 'react';
import { Icon, Modal, Button, useToast } from '@/components/ui';
import { useAuthStore } from '@/stores/authStore';

export const ManagerOverrideModal: React.FC = () => {
  const {
    showManagerOverrideModal,
    managerOverrideAction,
    verifyManagerPin,
    closeManagerOverrideModal,
    currentUser,
  } = useAuthStore();
  const toast = useToast();

  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  if (!showManagerOverrideModal) return null;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!pin.trim()) {
      setError('Vui lòng nhập mã PIN Quản lý!');
      return;
    }

    const result = verifyManagerPin(pin);
    if (result.success) {
      toast.success(
        'Đã phê duyệt quyền Quản lý!',
        `Tác vụ "${managerOverrideAction}" đã được mở khóa và thực hiện thành công.`,
      );
      setPin('');
      setError('');
    } else {
      setError(result.error || 'Mã PIN Quản lý không đúng!');
    }
  };

  const handleKeyClick = (digit: string) => {
    if (digit === 'clear') {
      setPin((prev) => prev.slice(0, -1));
    } else if (pin.length < 6) {
      setPin((prev) => prev + digit);
      setError('');
    }
  };

  return (
    <Modal
      isOpen={showManagerOverrideModal}
      onClose={closeManagerOverrideModal}
      title="🔒 Yêu Cầu Mã PIN Phê Duyệt Của Quản Lý"
      maxWidth="md"
    >
      <div className="space-y-4 text-center">
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 text-left">
          <div className="flex items-start gap-2.5">
            <Icon name="gavel" className="text-amber-600 text-[22px] shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-label-md">Tác vụ bị giới hạn quyền hạn</p>
              <p className="text-[12px] text-amber-800/90 mt-0.5">
                Tài khoản <span className="font-bold">{currentUser?.name}</span> ({currentUser?.roleName}) không đủ thẩm quyền để thực hiện tác vụ:
              </p>
              <div className="mt-2 px-2.5 py-1.5 rounded bg-white/70 font-bold text-label-sm text-on-surface border border-amber-500/20">
                👉 {managerOverrideAction}
              </div>
            </div>
          </div>
        </div>

        <p className="text-body-sm text-outline">
          Vui lòng nhờ Quản lý cửa hàng nhập mã PIN bảo mật để phê duyệt:
        </p>

        {/* PIN Dots Display */}
        <div className="flex justify-center items-center gap-3 py-2">
          {[0, 1, 2, 3].map((idx) => (
            <div
              key={idx}
              className={`w-4 h-4 rounded-full border-2 transition-all ${
                pin.length > idx
                  ? 'bg-primary border-primary scale-110'
                  : 'border-outline-variant/60 bg-surface-container-low'
              }`}
            />
          ))}
        </div>

        {error && (
          <p className="text-label-sm font-semibold text-rose-600 bg-rose-500/10 py-1.5 px-3 rounded-lg border border-rose-500/30">
            {error}
          </p>
        )}

        {/* On-screen Touch Numpad */}
        <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto pt-2">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleKeyClick(digit)}
              className="h-12 rounded-xl bg-surface-container hover:bg-surface-container-high active:scale-95 text-headline-sm font-bold text-on-surface transition-all border border-outline-variant/20 shadow-xs"
            >
              {digit}
            </button>
          ))}
          <button
            type="button"
            onClick={() => handleKeyClick('clear')}
            className="h-12 rounded-xl bg-surface-container hover:bg-surface-container-high text-label-md font-bold text-outline active:scale-95 transition-all"
          >
            Xóa
          </button>
          <button
            type="button"
            onClick={() => handleKeyClick('0')}
            className="h-12 rounded-xl bg-surface-container hover:bg-surface-container-high active:scale-95 text-headline-sm font-bold text-on-surface transition-all border border-outline-variant/20 shadow-xs"
          >
            0
          </button>
          <button
            type="button"
            onClick={() => handleSubmit()}
            className="h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold active:scale-95 transition-all flex items-center justify-center shadow-md"
            title="Xác nhận"
          >
            <Icon name="check" className="text-[24px]" />
          </button>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-outline-variant/20">
          <Button variant="outline" onClick={closeManagerOverrideModal}>
            Hủy bỏ
          </Button>
          <Button variant="primary" icon="verified" onClick={() => handleSubmit()}>
            Phê duyệt [Enter]
          </Button>
        </div>
      </div>
    </Modal>
  );
};
