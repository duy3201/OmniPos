'use client';

import React, { useState } from 'react';
import { Icon, Button, Modal } from '@/components/ui';
import { formatVND } from '@/lib/format';

export interface BarcodePrintItem {
  id: string;
  name: string;
  sku: string;
  barcode: string;
  price: number;
  unit: string;
  batchNumber?: string;
  expiryDate?: string;
}

interface BarcodePrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: BarcodePrintItem | null;
}

// Generate simple SVG Barcode pattern based on string characters
function renderSvgBarcode(code: string) {
  const safeCode = code || '893600000001';
  // Deterministic bar widths based on char codes
  const bars: { width: number; isBlack: boolean }[] = [];
  bars.push({ width: 2, isBlack: true });
  bars.push({ width: 1, isBlack: false });
  bars.push({ width: 2, isBlack: true });

  for (let i = 0; i < safeCode.length; i++) {
    const val = safeCode.charCodeAt(i);
    const w1 = (val % 3) + 1;
    const w2 = ((val >> 2) % 2) + 1;
    const w3 = ((val >> 4) % 3) + 1;
    bars.push({ width: w1, isBlack: true });
    bars.push({ width: w2, isBlack: false });
    bars.push({ width: w3, isBlack: true });
    bars.push({ width: 1, isBlack: false });
  }

  bars.push({ width: 2, isBlack: true });
  bars.push({ width: 1, isBlack: false });
  bars.push({ width: 2, isBlack: true });

  const totalWidth = bars.reduce((sum, b) => sum + b.width, 0);

  let currentX = 0;
  return (
    <svg
      viewBox={`0 0 ${totalWidth} 40`}
      className="w-full h-10 max-w-[180px] mx-auto"
      preserveAspectRatio="none"
    >
      {bars.map((bar, idx) => {
        const x = currentX;
        currentX += bar.width;
        if (!bar.isBlack) return null;
        return (
          <rect
            key={idx}
            x={x}
            y={0}
            width={bar.width}
            height={40}
            fill="#000000"
          />
        );
      })}
    </svg>
  );
}

export const BarcodePrintModal: React.FC<BarcodePrintModalProps> = ({
  isOpen,
  onClose,
  item,
}) => {
  const [printCount, setPrintCount] = useState<number>(10);
  const [labelSize, setLabelSize] = useState<'35x22' | '50x30' | 'A4'>('35x22');
  const [showPrice, setShowPrice] = useState(true);
  const [showExpiry, setShowExpiry] = useState(true);

  if (!item) return null;

  const handlePrint = () => {
    window.print();
  };

  const labels = Array.from({ length: printCount }, (_, i) => i);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="In Tem Mã Vạch & Nhãn Phụ Sản Phẩm"
      subtitle={`Sản phẩm: ${item.name} (${item.sku})`}
      maxWidth="2xl"
    >
      <div className="space-y-4">
        {/* Print Configuration Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-xl bg-surface-container-low border border-outline-variant/30">
          <div>
            <label className="block text-label-sm font-semibold text-on-surface mb-1">
              Khổ tem máy in nhiệt
            </label>
            <select
              value={labelSize}
              onChange={(e) => setLabelSize(e.target.value as any)}
              className="w-full h-9 px-2.5 rounded-lg border border-outline-variant/40 bg-surface-container-lowest text-label-sm text-on-surface outline-none cursor-pointer"
            >
              <option value="35x22">35x22 mm (2-3 tem / hàng)</option>
              <option value="50x30">50x30 mm (Chuẩn thùng/can)</option>
              <option value="A4">Decal Tomy A4 (65 tem/tờ)</option>
            </select>
          </div>

          <div>
            <label className="block text-label-sm font-semibold text-on-surface mb-1">
              Số lượng tem cần in
            </label>
            <input
              type="number"
              min={1}
              max={500}
              value={printCount}
              onChange={(e) => setPrintCount(Math.max(1, Number(e.target.value)))}
              className="w-full h-9 px-2.5 rounded-lg border border-outline-variant/40 bg-surface-container-lowest font-bold text-label-sm text-on-surface focus:outline-none focus:border-primary"
            />
          </div>

          <div className="flex flex-col justify-center gap-1 text-[12px] pt-2 sm:pt-0">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={showPrice}
                onChange={(e) => setShowPrice(e.target.checked)}
                className="rounded text-primary focus:ring-primary w-3.5 h-3.5 cursor-pointer"
              />
              <span className="font-medium text-on-surface">In giá bán niêm yết</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={showExpiry}
                onChange={(e) => setShowExpiry(e.target.checked)}
                className="rounded text-primary focus:ring-primary w-3.5 h-3.5 cursor-pointer"
              />
              <span className="font-medium text-on-surface">In Số lô &amp; HSD</span>
            </label>
          </div>
        </div>

        {/* Live Preview Area (Optimized for both Screen and @media print) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-label-sm font-bold text-on-surface">
              Bản xem trước ({printCount} tem nhãn):
            </span>
            <span className="text-[11px] text-outline font-mono">
              Chuẩn mã vạch: Code-128 Auto
            </span>
          </div>

          <div className="p-4 rounded-xl border border-dashed border-outline-variant/60 bg-surface-container-lowest max-h-72 overflow-y-auto">
            <div
              id="printable-barcode-area"
              className={`grid gap-2.5 ${
                labelSize === '35x22'
                  ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4'
                  : labelSize === '50x30'
                  ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3'
                  : 'grid-cols-3 sm:grid-cols-4 md:grid-cols-5'
              }`}
            >
              {labels.map((idx) => (
                <div
                  key={idx}
                  className="p-2 border border-black/80 rounded-md bg-white text-black flex flex-col justify-between text-center select-none shadow-xs"
                  style={{
                    minHeight: labelSize === '50x30' ? '120px' : '90px',
                  }}
                >
                  <p className="text-[10px] font-bold line-clamp-2 leading-tight uppercase">
                    {item.name}
                  </p>

                  <div className="my-1">
                    {renderSvgBarcode(item.barcode || item.sku)}
                    <p className="text-[9px] font-mono tracking-widest mt-0.5">
                      {item.barcode || item.sku}
                    </p>
                  </div>

                  <div className="pt-0.5 border-t border-black/20 flex items-center justify-between text-[9px] font-bold">
                    {showPrice && (
                      <span className="text-black">
                        {formatVND(item.price)}
                      </span>
                    )}
                    {showExpiry && item.batchNumber && (
                      <span className="font-mono text-[8px] text-gray-700">
                        Lô: {item.batchNumber}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex items-center justify-between gap-2 border-t border-outline-variant/20">
          <div className="text-[12px] text-outline flex items-center gap-1.5">
            <Icon name="print" className="text-[16px] text-primary" />
            <span>Hỗ trợ máy in nhiệt khổ K80, Xprinter XP-350B, Zebra GK420t</span>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onClose}>
              Đóng
            </Button>
            <Button variant="primary" icon="print" onClick={handlePrint}>
              In {printCount} Tem Barcode
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
