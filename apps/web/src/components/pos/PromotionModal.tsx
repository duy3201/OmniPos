'use client';

import React, { useState } from 'react';
import { Icon, Button, Modal, useToast } from '@/components/ui';
import { useCartStore, OrderDiscount } from '@/stores/cartStore';
import { useAuthStore } from '@/stores/authStore';
import { formatVND } from '@/lib/format';

interface PromotionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_VOUCHERS = [
  {
    code: 'AQUA-START-5',
    title: 'Hỗ Trợ Thả Giống Đầu Vụ',
    desc: 'Giảm 5% cho đơn hàng thức ăn & vi sinh gây màu nước',
    type: 'PERCENT' as const,
    value: 5,
    minOrder: 0,
    badge: 'Đầu Vụ',
  },
  {
    code: 'MUATRAO-10',
    title: 'Cấp Cứu Mưa Bão & Sụp Tảo',
    desc: 'Giảm 10% khoáng tạt, Yucca hấp thu khí độc NO2/NH3',
    type: 'PERCENT' as const,
    value: 10,
    minOrder: 1000000,
    badge: 'Kỹ Thuật',
  },
  {
    code: 'VIP-SHRIMP-200K',
    title: 'Khách Hàng Thân Thiết (VIP)',
    desc: 'Giảm 200.000₫ trực tiếp cho đơn hàng từ 3.000.000₫',
    type: 'AMOUNT' as const,
    value: 200000,
    minOrder: 3000000,
    badge: 'VIP',
  },
  {
    code: 'TRIAN-500K',
    title: 'Tri Ân Vụ Nuôi Trúng Lớn',
    desc: 'Giảm 500.000₫ cho đơn hàng tổng đàn từ 8.000.000₫',
    type: 'AMOUNT' as const,
    value: 500000,
    minOrder: 8000000,
    badge: 'Tri Ân',
  },
];

export const PromotionModal: React.FC<PromotionModalProps> = ({ isOpen, onClose }) => {
  const toast = useToast();
  const { activeTab, orderDiscounts, setOrderDiscount, getSubtotal } = useCartStore();
  const { currentUser, requestManagerOverride } = useAuthStore();

  const subtotal = getSubtotal();
  const currentDiscount = orderDiscounts[activeTab];

  const [activeTabType, setActiveTabType] = useState<'PERCENT' | 'AMOUNT' | 'VOUCHER'>(
    currentDiscount ? (currentDiscount.code ? 'VOUCHER' : currentDiscount.type) : 'PERCENT'
  );

  const [percentValue, setPercentValue] = useState<number>(
    currentDiscount?.type === 'PERCENT' ? currentDiscount.value : 5
  );
  const [amountValue, setAmountValue] = useState<number>(
    currentDiscount?.type === 'AMOUNT' ? currentDiscount.value : 50000
  );
  const [discountNote, setDiscountNote] = useState<string>(currentDiscount?.note || '');

  // Calculate equivalent percent for amount discount
  const computedPercent =
    activeTabType === 'PERCENT'
      ? percentValue
      : subtotal > 0
      ? (amountValue / subtotal) * 100
      : 0;

  const staffLimit = currentUser?.discountLimitPercent ?? 5;
  const isOverLimit = computedPercent > staffLimit && currentUser?.role !== 'SUPER_ADMIN';

  const applyDiscountObject = (discountObj: OrderDiscount | null) => {
    setOrderDiscount(discountObj);
    if (discountObj) {
      toast.success(
        'Đã áp dụng khuyến mãi',
        `Chiết khấu: ${
          discountObj.type === 'PERCENT' ? `${discountObj.value}%` : formatVND(discountObj.value)
        } cho đơn hàng hiện tại.`
      );
    } else {
      toast.info('Đã xóa chiết khấu', 'Đã hủy áp dụng chiết khấu cho đơn hàng.');
    }
    onClose();
  };

  const handleApply = () => {
    let discountObj: OrderDiscount;

    if (activeTabType === 'PERCENT') {
      if (percentValue <= 0) {
        applyDiscountObject(null);
        return;
      }
      discountObj = {
        type: 'PERCENT',
        value: percentValue,
        note: discountNote.trim() || `Chiết khấu ${percentValue}%`,
      };
    } else if (activeTabType === 'AMOUNT') {
      if (amountValue <= 0) {
        applyDiscountObject(null);
        return;
      }
      discountObj = {
        type: 'AMOUNT',
        value: amountValue,
        note: discountNote.trim() || `Giảm ${formatVND(amountValue)}`,
      };
    } else {
      return;
    }

    // Check staff permission limit
    if (isOverLimit) {
      requestManagerOverride(
        `Chiết khấu ${computedPercent.toFixed(1)}% vượt hạn mức nhân viên (${staffLimit}%)`,
        () => applyDiscountObject(discountObj)
      );
    } else {
      applyDiscountObject(discountObj);
    }
  };

  const handleSelectVoucher = (v: typeof PRESET_VOUCHERS[0]) => {
    if (subtotal < v.minOrder) {
      toast.warning(
        'Chưa đủ điều kiện voucher',
        `Voucher ${v.code} yêu cầu giá trị đơn tối thiểu ${formatVND(v.minOrder)} (Hiện tại: ${formatVND(subtotal)}).`
      );
      return;
    }

    const eqPercent = v.type === 'PERCENT' ? v.value : subtotal > 0 ? (v.value / subtotal) * 100 : 0;
    const over = eqPercent > staffLimit && currentUser?.role !== 'SUPER_ADMIN';

    const discountObj: OrderDiscount = {
      type: v.type,
      value: v.value,
      code: v.code,
      note: v.title,
    };

    if (over) {
      requestManagerOverride(
        `Áp dụng voucher ${v.code} (${eqPercent.toFixed(1)}%) vượt hạn mức nhân sự`,
        () => applyDiscountObject(discountObj)
      );
    } else {
      applyDiscountObject(discountObj);
    }
  };

  const previewDiscountAmount =
    activeTabType === 'PERCENT'
      ? Math.round((subtotal * percentValue) / 100)
      : activeTabType === 'AMOUNT'
      ? Math.min(subtotal, amountValue)
      : 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Khuyến Mãi & Chiết Khấu POS (F6)"
      subtitle={`Nhân sự: ${currentUser?.name || 'Thu ngân'} • Hạn mức chiết khấu: Tối đa ${staffLimit}%`}
      maxWidth="lg"
    >
      <div className="space-y-4">
        {/* Navigation Tabs */}
        <div className="flex rounded-xl bg-surface-container p-1 text-label-sm font-semibold">
          <button
            type="button"
            onClick={() => setActiveTabType('PERCENT')}
            className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
              activeTabType === 'PERCENT'
                ? 'bg-primary text-on-primary shadow-xs'
                : 'text-on-surface hover:text-primary'
            }`}
          >
            <Icon name="percent" className="text-[18px]" />
            <span>Giảm theo %</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTabType('AMOUNT')}
            className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
              activeTabType === 'AMOUNT'
                ? 'bg-primary text-on-primary shadow-xs'
                : 'text-on-surface hover:text-primary'
            }`}
          >
            <Icon name="payments" className="text-[18px]" />
            <span>Giảm Tiền Mặt (₫)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTabType('VOUCHER')}
            className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
              activeTabType === 'VOUCHER'
                ? 'bg-primary text-on-primary shadow-xs'
                : 'text-on-surface hover:text-primary'
            }`}
          >
            <Icon name="sell" className="text-[18px]" />
            <span>Voucher Vụ Nuôi</span>
          </button>
        </div>

        {/* Tab 1: Percentage Discount */}
        {activeTabType === 'PERCENT' && (
          <div className="space-y-3">
            <div>
              <label className="block text-label-sm font-semibold text-on-surface mb-1">
                Tỷ lệ chiết khấu (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={percentValue}
                  onChange={(e) => setPercentValue(Math.min(100, Math.max(0, Number(e.target.value))))}
                  className="w-full h-12 px-4 rounded-xl border border-outline-variant/40 bg-surface-container-lowest font-display text-headline-sm font-bold text-primary focus:outline-none focus:border-primary"
                />
                <span className="absolute right-4 top-3 text-headline-sm font-bold text-outline">%</span>
              </div>
            </div>

            {/* Quick buttons */}
            <div className="grid grid-cols-6 gap-1.5">
              {[2, 5, 8, 10, 15, 20].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => setPercentValue(pct)}
                  className={`py-1.5 rounded-lg border text-label-sm font-bold transition-all ${
                    percentValue === pct
                      ? 'bg-primary text-on-primary border-primary'
                      : 'bg-surface-container hover:bg-surface-container-high border-outline-variant/30 text-on-surface'
                  }`}
                >
                  {pct}%
                </button>
              ))}
            </div>

            <div>
              <label className="block text-label-sm font-semibold text-on-surface mb-1">
                Lý do / Ghi chú chiết khấu
              </label>
              <input
                type="text"
                placeholder="VD: Hỗ trợ đầm tôm ao số 2 bị mưa lớn..."
                value={discountNote}
                onChange={(e) => setDiscountNote(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-outline-variant/40 bg-surface-container-lowest text-body-sm text-on-surface focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        )}

        {/* Tab 2: Fixed Amount Discount */}
        {activeTabType === 'AMOUNT' && (
          <div className="space-y-3">
            <div>
              <label className="block text-label-sm font-semibold text-on-surface mb-1">
                Số tiền giảm trực tiếp (VND)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={0}
                  step={10000}
                  value={amountValue}
                  onChange={(e) => setAmountValue(Math.max(0, Number(e.target.value)))}
                  className="w-full h-12 px-4 rounded-xl border border-outline-variant/40 bg-surface-container-lowest font-display text-headline-sm font-bold text-primary focus:outline-none focus:border-primary"
                />
                <span className="absolute right-4 top-3 text-body-md font-bold text-outline">₫</span>
              </div>
            </div>

            {/* Quick amount buttons */}
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {[20000, 50000, 100000, 200000, 500000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setAmountValue(amt)}
                  className={`py-2 rounded-lg border text-label-xs font-bold transition-all ${
                    amountValue === amt
                      ? 'bg-primary text-on-primary border-primary'
                      : 'bg-surface-container hover:bg-surface-container-high border-outline-variant/30 text-on-surface'
                  }`}
                >
                  {formatVND(amt)}
                </button>
              ))}
            </div>

            <div>
              <label className="block text-label-sm font-semibold text-on-surface mb-1">
                Lý do giảm tiền mặt
              </label>
              <input
                type="text"
                placeholder="VD: Bù tiền bao bì hoặc hỗ trợ vận chuyển ghe..."
                value={discountNote}
                onChange={(e) => setDiscountNote(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-outline-variant/40 bg-surface-container-lowest text-body-sm text-on-surface focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        )}

        {/* Tab 3: Shrimp Farm Vouchers */}
        {activeTabType === 'VOUCHER' && (
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {PRESET_VOUCHERS.map((v) => {
              const eligible = subtotal >= v.minOrder;
              const isSelected = currentDiscount?.code === v.code;

              return (
                <div
                  key={v.code}
                  onClick={() => handleSelectVoucher(v)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-primary/10 border-primary ring-2 ring-primary/20'
                      : eligible
                      ? 'bg-surface-container-lowest hover:bg-surface-container border-outline-variant/30'
                      : 'bg-surface-container-low opacity-60 border-outline-variant/20'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                        {v.code}
                      </span>
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-500/20 text-amber-800">
                        {v.badge}
                      </span>
                    </div>
                    <p className="font-bold text-on-surface text-label-md mt-1">{v.title}</p>
                    <p className="text-body-xs text-outline">{v.desc}</p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-display font-bold text-primary text-label-lg block">
                      {v.type === 'PERCENT' ? `-${v.value}%` : `-${formatVND(v.value)}`}
                    </span>
                    <span className="text-[10px] text-outline">
                      {v.minOrder > 0 ? `Đơn > ${formatVND(v.minOrder)}` : 'Mọi đơn'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Over Limit Warning */}
        {isOverLimit && activeTabType !== 'VOUCHER' && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 text-body-sm flex items-start gap-2">
            <Icon name="warning" className="text-[20px] text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Mức chiết khấu vượt hạn mức cho phép!</p>
              <p className="text-[12px] text-amber-800">
                Hạn mức của bạn ({currentUser?.roleName}): tối đa <strong>{staffLimit}%</strong>. Khi nhấn &quot;Áp dụng&quot;, hệ thống sẽ yêu cầu mã PIN phê duyệt của Quản lý (8888 hoặc 9999).
              </p>
            </div>
          </div>
        )}

        {/* Calculation Preview */}
        <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/30 flex items-center justify-between text-body-sm">
          <div>
            <span className="text-outline block text-xs">Giá trị tạm tính:</span>
            <span className="font-bold text-on-surface">{formatVND(subtotal)}</span>
          </div>
          <div className="text-center">
            <span className="text-outline block text-xs">Tiền giảm dự kiến:</span>
            <span className="font-bold text-rose-600">
              -{formatVND(previewDiscountAmount)}
            </span>
          </div>
          <div className="text-right">
            <span className="text-outline block text-xs">Khách cần thanh toán:</span>
            <span className="font-display font-black text-primary text-label-lg">
              {formatVND(Math.max(0, subtotal - previewDiscountAmount))}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-2 flex items-center justify-between gap-2 border-t border-outline-variant/20">
          {currentDiscount ? (
            <Button
              variant="outline"
              icon="delete"
              onClick={() => applyDiscountObject(null)}
              className="text-error border-error/30 hover:bg-error-container/20"
            >
              Hủy chiết khấu
            </Button>
          ) : (
            <div></div>
          )}

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onClose}>
              Đóng
            </Button>
            {activeTabType !== 'VOUCHER' && (
              <Button
                variant="primary"
                icon={isOverLimit ? 'lock' : 'check'}
                onClick={handleApply}
              >
                {isOverLimit ? 'Yêu Cầu Quản Lý Duyệt' : 'Áp Dụng Chiết Khấu'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
