'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Icon, Button, BentoCard, Badge, useNotice, useToast } from '@/components/ui';

export default function ReturnsPage() {
  const toast = useToast();
  const { showNotice } = useNotice();
  const [returnQty, setReturnQty] = useState(1);
  const [exchangeQty, setExchangeQty] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);

  const formatVND = (val: number) => `${val.toLocaleString('vi-VN')}₫`;

  // Original item returned: Yucca 1L (280.000d)
  const returnItem = {
    name: 'Yucca Cấp Tốc Hấp Thu Khí Độc Ao Tôm (Chai 1L)',
    sku: 'YUC-LIQ-1L',
    unitPrice: 280000,
    unit: 'Chai',
    condition: 'Còn nguyên màng seal, hạn dùng 2027',
  };

  // New item exchanged: Men vi sinh Bio-Active 500g (210.000d x 1 = 210.000d)
  const exchangeItem = {
    name: 'Men Vi Sinh Xử Lý Đáy Ao Tôm Bio-Active (Gói 500g)',
    sku: 'BIO-FLOC-500G',
    unitPrice: 210000,
    unit: 'Gói',
  };

  const totalReturnVal = returnItem.unitPrice * returnQty;
  const totalExchangeVal = exchangeItem.unitPrice * exchangeQty;
  const netRefund = totalReturnVal - totalExchangeVal; // > 0: Hoàn tiền cho khách

  const handleCompleteReturn = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      toast.success('Xử lý đổi trả thành công!', 'Hàng trả đã được hoàn vào Thẻ Kho Bất Biến.');
      showNotice({
        type: 'success',
        title: 'Xử Lý Đổi Trả Hàng Thành Công!',
        message: 'Đã hoàn tất thủ tục đổi trả hàng hóa theo quy chuẩn kiểm soát số lô & hạn dùng.',
        details: [
          { label: 'Hàng trả lại', value: `${returnQty}x ${returnItem.name}` },
          { label: 'Hàng đổi lấy', value: `${exchangeQty}x ${exchangeItem.name}` },
          { label: 'Chênh lệch hoàn khách', value: `${netRefund.toLocaleString('vi-VN')}₫`, isHighlight: true },
          { label: 'Thẻ kho bất biến', value: 'Đã tự động cộng lại tồn kho cho lô trả về' },
        ],
        primaryButtonText: 'In Phiếu Đổi Trả & Đóng',
      });
    }, 800);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-outline-variant/30">
        <div>
          <div className="flex items-center gap-2 text-label-sm text-outline mb-1">
            <Link href="/pos/terminal" className="hover:text-primary">
              Bán hàng POS
            </Link>
            <span>/</span>
            <span className="text-on-surface">Đổi trả đơn #POS-1049</span>
          </div>
          <h1 className="font-headline-sm text-headline-lg font-bold text-on-surface">
            Xử Lý Đổi / Trả Hàng Hoàn Kho Thông Minh
          </h1>
          <p className="text-body-sm text-outline">
            Hóa đơn gốc: #POS-1049 • Khách hàng: Anh Ba Hùng • Thu ngân: Minh Anh
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" icon="close">
            Hủy bỏ
          </Button>
          <Button
            variant="primary"
            icon="print"
            loading={isProcessing}
            onClick={handleCompleteReturn}
          >
            Hoàn Tất Đổi Trả &amp; In Biên Bản
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Return & Exchange Items (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Section 1: Item Returned */}
          <BentoCard
            title="1. Sản phẩm khách mang trả lại (Nhập lại kho)"
            subtitle="Kiểm tra tem nhãn và số lô trước khi hoàn kho"
          >
            <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/30 flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Badge variant="danger" size="sm">Hàng trả lại</Badge>
                  <h4 className="font-bold text-label-md text-on-surface truncate">
                    {returnItem.name}
                  </h4>
                </div>
                <p className="text-[11px] text-outline font-mono mt-1">
                  SKU: {returnItem.sku} • Đơn giá mua: {formatVND(returnItem.unitPrice)}
                </p>
                <p className="text-[11px] text-secondary mt-0.5">
                  Tình trạng: {returnItem.condition} (Đủ điều kiện hoàn kho)
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="flex items-center rounded-lg bg-surface-container-lowest border border-outline-variant/30 p-0.5">
                  <button
                    type="button"
                    onClick={() => setReturnQty(Math.max(1, returnQty - 1))}
                    className="w-7 h-7 flex items-center justify-center hover:bg-surface-container"
                  >
                    <Icon name="remove" className="text-[14px]" />
                  </button>
                  <span className="w-8 text-center font-bold font-mono">
                    {returnQty}
                  </span>
                  <button
                    type="button"
                    onClick={() => setReturnQty(returnQty + 1)}
                    className="w-7 h-7 flex items-center justify-center hover:bg-surface-container"
                  >
                    <Icon name="add" className="text-[14px]" />
                  </button>
                </div>
                <span className="font-tabular-stat font-bold text-label-md text-error">
                  +{formatVND(totalReturnVal)}
                </span>
              </div>
            </div>
          </BentoCard>

          {/* Section 2: New Item Exchanged */}
          <BentoCard
            title="2. Chọn sản phẩm khách lấy đổi mới (Xuất kho)"
            subtitle="Khách muốn đổi sang men vi sinh đáy ao"
          >
            <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/30 flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Badge variant="success" size="sm">Hàng đổi mới</Badge>
                  <h4 className="font-bold text-label-md text-on-surface truncate">
                    {exchangeItem.name}
                  </h4>
                </div>
                <p className="text-[11px] text-outline font-mono mt-1">
                  SKU: {exchangeItem.sku} • Đơn giá: {formatVND(exchangeItem.unitPrice)}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="flex items-center rounded-lg bg-surface-container-lowest border border-outline-variant/30 p-0.5">
                  <button
                    type="button"
                    onClick={() => setExchangeQty(Math.max(1, exchangeQty - 1))}
                    className="w-7 h-7 flex items-center justify-center hover:bg-surface-container"
                  >
                    <Icon name="remove" className="text-[14px]" />
                  </button>
                  <span className="w-8 text-center font-bold font-mono">
                    {exchangeQty}
                  </span>
                  <button
                    type="button"
                    onClick={() => setExchangeQty(exchangeQty + 1)}
                    className="w-7 h-7 flex items-center justify-center hover:bg-surface-container"
                  >
                    <Icon name="add" className="text-[14px]" />
                  </button>
                </div>
                <span className="font-tabular-stat font-bold text-label-md text-primary">
                  -{formatVND(totalExchangeVal)}
                </span>
              </div>
            </div>
          </BentoCard>
        </div>

        {/* Right: Settlement Summary (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          <BentoCard title="Quyết toán bù trừ đổi trả">
            <div className="space-y-3 text-body-sm">
              <div className="flex justify-between">
                <span className="text-outline">Giá trị hàng trả lại:</span>
                <span className="font-tabular-stat font-bold text-on-surface">
                  {formatVND(totalReturnVal)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-outline">Giá trị hàng lấy mới:</span>
                <span className="font-tabular-stat font-bold text-on-surface">
                  {formatVND(totalExchangeVal)}
                </span>
              </div>

              <div className="pt-2 border-t border-outline-variant/20 flex flex-col gap-1">
                <span className="text-[11px] uppercase font-bold text-outline">
                  {netRefund >= 0 ? 'Số tiền hoàn lại cho khách:' : 'Khách phải trả thêm:'}
                </span>
                <span
                  className={`font-display text-headline-lg font-black ${
                    netRefund >= 0 ? 'text-secondary' : 'text-error'
                  }`}
                >
                  {formatVND(Math.abs(netRefund))}
                </span>
              </div>

              <div className="p-3 bg-surface-container-low rounded-lg text-[11px] text-outline space-y-1">
                <p>• Tồn kho của Yucca sẽ tự động tăng +{returnQty} chai.</p>
                <p>• Tồn kho của Men vi sinh sẽ tự động giảm -{exchangeQty} gói.</p>
                <p>• Công nợ vụ nuôi của khách sẽ được cập nhật tự động.</p>
              </div>

              <Button
                variant="primary"
                size="lg"
                icon="check_circle"
                className="w-full mt-2"
                onClick={handleCompleteReturn}
              >
                Xác Nhận &amp; Cập Nhật Kho
              </Button>
            </div>
          </BentoCard>
        </div>
      </div>
    </div>
  );
}
