'use client';

import React from 'react';
import { Icon, Button, Badge } from '@/components/ui';
import { useCartStore, ParkedOrder } from '@/stores/cartStore';

interface ParkedOrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ParkedOrdersModal: React.FC<ParkedOrdersModalProps> = ({ isOpen, onClose }) => {
  const { parkedOrders, restoreParkedOrder, deleteParkedOrder } = useCartStore();

  if (!isOpen) return null;

  const handleRestore = (id: string) => {
    restoreParkedOrder(id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-surface-container-lowest rounded-3xl shadow-2xl border border-outline-variant/30 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-outline-variant/30 flex items-center justify-between bg-surface-container-low">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
              <Icon name="pause_circle" className="text-[24px]" />
            </div>
            <div>
              <h3 className="font-bold text-headline-sm text-on-surface">Danh Sách Đơn Hàng Lưu Tạm</h3>
              <p className="text-body-sm text-outline">
                {parkedOrders.length} đơn đang chờ phục hồi để tiếp tục thanh toán
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center text-outline transition-colors"
          >
            <Icon name="close" className="text-[20px]" />
          </button>
        </div>

        {/* List Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-3 flex-1">
          {parkedOrders.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-surface-container-low text-outline flex items-center justify-center mx-auto">
                <Icon name="inbox" className="text-[32px]" />
              </div>
              <p className="font-bold text-on-surface">Không có đơn hàng lưu tạm nào</p>
              <p className="text-body-sm text-outline max-w-sm mx-auto">
                Để lưu tạm một đơn đang nhập dở dang và giải phóng giỏ hàng cho khách tiếp theo, hãy bấm nút <strong>"Lưu tạm đơn [F8]"</strong> tại quầy POS.
              </p>
            </div>
          ) : (
            parkedOrders.map((order) => (
              <div
                key={order.id}
                className="p-4 rounded-2xl border border-outline-variant/30 bg-surface-container-low/40 hover:bg-surface-container-low transition-colors space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-primary text-label-md">
                      #{order.orderNumber}
                    </span>
                    <Badge variant="warning" size="sm">
                      Lưu lúc {order.createdAt}
                    </Badge>
                    {order.customer && (
                      <span className="text-body-sm font-semibold text-on-surface">
                        • {order.customer.name} ({order.customer.phone})
                      </span>
                    )}
                  </div>
                  <div className="font-tabular-stat font-bold text-headline-sm text-emerald-600">
                    {order.total.toLocaleString('vi-VN')}₫
                  </div>
                </div>

                {/* Items preview */}
                <div className="text-xs text-on-surface-variant space-y-1 bg-surface-container-lowest/70 p-2.5 rounded-xl border border-outline-variant/20">
                  <div className="font-semibold text-outline text-[11px] mb-1">
                    Gồm {order.items.length} mặt hàng:
                  </div>
                  {order.items.slice(0, 3).map((it, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span className="truncate pr-2">
                        {it.name} ({it.unit})
                      </span>
                      <span className="font-mono font-semibold shrink-0">
                        x{it.quantity} = {it.total.toLocaleString('vi-VN')}₫
                      </span>
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <div className="text-[11px] text-outline italic">
                      + thêm {order.items.length - 3} mặt hàng khác...
                    </div>
                  )}
                </div>

                {order.note && (
                  <p className="text-xs text-outline italic">
                    Ghi chú: {order.note}
                  </p>
                )}

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 pt-1 border-t border-outline-variant/20">
                  <Button
                    variant="ghost"
                    size="sm"
                    icon="delete"
                    className="text-error hover:bg-error-container/20"
                    onClick={() => deleteParkedOrder(order.id)}
                  >
                    Hủy bỏ đơn này
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    icon="play_arrow"
                    onClick={() => handleRestore(order.id)}
                  >
                    Phục hồi vào quầy POS
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-outline-variant/20 bg-surface-container-low flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Đóng
          </Button>
        </div>
      </div>
    </div>
  );
};
