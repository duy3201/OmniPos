'use client';

import React, { useState } from 'react';
import { Icon, Badge, Button, BentoCard } from '@/components/ui';
import { BarcodePrintModal, BarcodePrintItem } from '@/components/inventory/BarcodePrintModal';

interface BatchItem {
  id: string;
  batchNumber: string;
  productName: string;
  sku: string;
  manufacturer: string;
  mfgDate: string;
  expDate: string;
  daysRemaining: number;
  stockQty: number;
  unit: string;
  status: 'SAFE' | 'NEAR' | 'CRITICAL' | 'EXPIRED';
}

export default function BatchesPage() {
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [barcodeItem, setBarcodeItem] = useState<BarcodePrintItem | null>(null);
  const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState(false);

  const sampleBatches: BatchItem[] = [
    {
      id: 'b1',
      batchNumber: 'OXY-26-004',
      productName: 'Oxy Viên Cấp Cứu Nổi Đầu Ao Nuôi Tôm Ban Đêm',
      sku: 'OXY-VIEN-5KG',
      manufacturer: 'Cty Hóa Chất Thủy Sản Đại Dương',
      mfgDate: '10/11/2024',
      expDate: '10/11/2026',
      daysRemaining: 24, // < 30 ngày -> CRITICAL
      stockQty: 3,
      unit: 'Hũ',
      status: 'CRITICAL',
    },
    {
      id: 'b2',
      batchNumber: 'BIO-2609-88',
      productName: 'Men Vi Sinh Xử Lý Đáy & Nước Ao Tôm Bio-Active',
      sku: 'BIO-FLOC-500G',
      manufacturer: 'Viện Công Nghệ Sinh Học Bio-Aqua',
      mfgDate: '20/09/2024',
      expDate: '20/12/2026',
      daysRemaining: 64, // 30 - 90 ngày -> NEAR
      stockQty: 82,
      unit: 'Gói',
      status: 'NEAR',
    },
    {
      id: 'b3',
      batchNumber: 'YC-202610-01',
      productName: 'Yucca Cấp Tốc Hấp Thu Khí Độc Ao Tôm',
      sku: 'YUC-LIQ-1L',
      manufacturer: 'Bayer Animal Health Bio',
      mfgDate: '15/10/2025',
      expDate: '15/10/2027',
      daysRemaining: 363, // > 90 ngày -> SAFE
      stockQty: 45,
      unit: 'Chai',
      status: 'SAFE',
    },
    {
      id: 'b4',
      batchNumber: 'LIV-26-44',
      productName: 'Thảo Dược Bổ Gan, Trị Teo Gan Tôm Gan Tụy AHPND',
      sku: 'ANTI-LIVER-500ML',
      manufacturer: 'Tân Việt Hoa Thủy Sản',
      mfgDate: '15/06/2025',
      expDate: '15/06/2027',
      daysRemaining: 241,
      stockQty: 28,
      unit: 'Chai',
      status: 'SAFE',
    },
    {
      id: 'b5',
      batchNumber: 'CHLOR-OLD-09',
      productName: 'Chlorine Cá Heo Diệt Khuẩn Nước Ao Nuôi (Thùng 45kg)',
      sku: 'CHLOR-IND-45KG',
      manufacturer: 'Ấn Độ Nippon Soda',
      mfgDate: '01/01/2024',
      expDate: '01/10/2026',
      daysRemaining: -16, // EXPIRED
      stockQty: 1,
      unit: 'Thùng',
      status: 'EXPIRED',
    },
  ];

  const filteredBatches = sampleBatches.filter((b) => {
    if (filterStatus === 'ALL') return true;
    return b.status === filterStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline-sm text-headline-lg font-bold text-on-surface">
            Quản Lý Lô (Batch) &amp; Hạn Sử Dụng Thuốc Thủy Sản
          </h1>
          <p className="text-body-sm text-outline">
            Cơ chế xuất kho ưu tiên FEFO (First Expired First Out) • Tránh rủi ro bán thuốc cận hạn cho ao tôm cá
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" icon="file_download">
            Xuất Excel Lô Cận Date
          </Button>
          <Button variant="primary" icon="assignment_return">
            Lập phiếu xuất trả NCC
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <BentoCard>
          <span className="text-label-sm uppercase text-secondary font-bold tracking-wider block">
            Lô an toàn (&gt; 90 ngày)
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-display text-headline-lg font-black text-secondary">
              128 <span className="text-sm font-normal text-outline">lô hàng</span>
            </span>
            <Badge variant="success" dot size="sm">An toàn</Badge>
          </div>
          <span className="text-[11px] text-outline mt-1 block">
            Đủ điều kiện xuất bán bình thường
          </span>
        </BentoCard>

        <BentoCard>
          <span className="text-label-sm uppercase text-tertiary font-bold tracking-wider block">
            Cận Date (30 - 90 ngày)
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-display text-headline-lg font-black text-tertiary">
              9 <span className="text-sm font-normal text-outline">lô hàng</span>
            </span>
            <Badge variant="warning" dot size="sm">Ưu tiên FEFO</Badge>
          </div>
          <span className="text-[11px] text-tertiary mt-1 block">
            Cần ưu tiên bán trước trên quầy POS
          </span>
        </BentoCard>

        <BentoCard>
          <span className="text-label-sm uppercase text-error font-bold tracking-wider block">
            Nguy cấp (&lt; 30 ngày)
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-display text-headline-lg font-black text-error">
              3 <span className="text-sm font-normal text-outline">lô hàng</span>
            </span>
            <Badge variant="danger" dot size="sm">Cảnh báo đỏ</Badge>
          </div>
          <span className="text-[11px] text-error mt-1 block">
            Cần xả kho chiết khấu hoặc trả nhà sản xuất
          </span>
        </BentoCard>

        <BentoCard>
          <span className="text-label-sm uppercase text-outline font-bold tracking-wider block">
            Đã quá hạn sử dụng
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-display text-headline-lg font-black text-on-surface">
              1 <span className="text-sm font-normal text-outline">lô</span>
            </span>
            <Badge variant="danger" size="sm">Khóa POS</Badge>
          </div>
          <span className="text-[11px] text-outline mt-1 block">
            Hệ thống tự động chặn xuất bán
          </span>
        </BentoCard>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-surface-container-lowest p-3 rounded-xl border border-outline-variant/30 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {[
            { id: 'ALL', label: 'Tất cả các lô' },
            { id: 'CRITICAL', label: '🔴 Cận date dưới 30 ngày' },
            { id: 'NEAR', label: '🟡 Cận date 30 - 90 ngày' },
            { id: 'SAFE', label: '🟢 An toàn trên 90 ngày' },
            { id: 'EXPIRED', label: '⛔ Đã hết hạn' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-label-sm font-semibold transition-all ${
                filterStatus === tab.id
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <span className="text-[12px] text-outline font-mono">
          Hiển thị {filteredBatches.length} lô thuốc
        </span>
      </div>

      {/* Batches Table */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-body-sm min-w-[750px]">
            <thead>
              <tr className="bg-surface-container-low text-outline uppercase text-[11px] font-bold border-b border-outline-variant/20">
                <th className="py-3 px-4">Số Lô (Lot Number)</th>
                <th className="py-3 px-4">Tên Thuốc / Chế Phẩm &amp; Hãng</th>
                <th className="py-3 px-3 text-center">Ngày SX</th>
                <th className="py-3 px-3 text-center">Hạn Sử Dụng</th>
                <th className="py-3 px-3 text-center">Thời gian còn lại</th>
                <th className="py-3 px-4 text-right">Tồn kho theo Lô</th>
                <th className="py-3 px-3 text-center">Trạng thái FEFO</th>
                <th className="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/15">
              {filteredBatches.map((item) => (
                <tr key={item.id} className="hover:bg-surface-container-low/50 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-primary">
                    {item.batchNumber}
                  </td>

                  <td className="py-3 px-4">
                    <p className="font-semibold text-on-surface line-clamp-1">
                      {item.productName}
                    </p>
                    <p className="text-[11px] text-outline font-mono">
                      {item.manufacturer} • SKU: {item.sku}
                    </p>
                  </td>

                  <td className="py-3 px-3 text-center font-mono text-[11px] text-outline">
                    {item.mfgDate}
                  </td>

                  <td className="py-3 px-3 text-center font-mono font-bold text-on-surface">
                    {item.expDate}
                  </td>

                  <td className="py-3 px-3 text-center">
                    {item.daysRemaining > 90 ? (
                      <span className="font-mono text-secondary font-bold text-[12px]">
                        Còn {item.daysRemaining} ngày
                      </span>
                    ) : item.daysRemaining > 0 ? (
                      <span className="px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-container font-mono font-bold text-[11px]">
                        Còn {item.daysRemaining} ngày!
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-error-container text-on-error-container font-mono font-bold text-[11px]">
                        Hết hạn ({Math.abs(item.daysRemaining)} ngày)
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-4 text-right font-tabular-stat font-bold text-on-surface">
                    {item.stockQty} {item.unit}
                  </td>

                  <td className="py-3 px-3 text-center">
                    {item.status === 'SAFE' && (
                      <Badge variant="success" size="sm">An toàn</Badge>
                    )}
                    {item.status === 'NEAR' && (
                      <Badge variant="warning" dot size="sm">Xuất trước (FEFO)</Badge>
                    )}
                    {item.status === 'CRITICAL' && (
                      <Badge variant="danger" dot size="sm">Cảnh báo đỏ</Badge>
                    )}
                    {item.status === 'EXPIRED' && (
                      <Badge variant="neutral" size="sm">Khóa bán POS</Badge>
                    )}
                  </td>

                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setBarcodeItem({
                            id: item.id,
                            name: item.productName,
                            sku: item.sku,
                            barcode: item.batchNumber,
                            price: 150000,
                            unit: item.unit,
                            batchNumber: item.batchNumber,
                            expiryDate: item.expDate,
                          });
                          setIsBarcodeModalOpen(true);
                        }}
                        className="p-1 rounded hover:bg-surface-container text-on-surface hover:text-primary transition-colors"
                        title="In tem mã vạch Lô Hàng"
                      >
                        <Icon name="qr_code_2" className="text-[16px]" />
                      </button>
                      <button
                        type="button"
                        className="px-2.5 py-1 rounded bg-primary-fixed hover:bg-primary hover:text-white text-primary text-[11px] font-semibold transition-colors"
                      >
                        Bán ưu tiên
                      </button>
                      <button
                        type="button"
                        className="px-2 py-1 rounded hover:bg-surface-container text-outline hover:text-error"
                        title="Trả NCC"
                      >
                        <Icon name="assignment_return" className="text-[16px]" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Barcode Print Modal for Batches */}
      <BarcodePrintModal
        isOpen={isBarcodeModalOpen}
        onClose={() => setIsBarcodeModalOpen(false)}
        item={barcodeItem}
      />
    </div>
  );
}
