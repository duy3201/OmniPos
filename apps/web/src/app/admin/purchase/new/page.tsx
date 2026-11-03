'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Icon, Button, BentoCard, Badge, KeycapBadge, useNotice, useToast } from '@/components/ui';

interface PurchaseItem {
  id: string;
  name: string;
  sku: string;
  batchNumber: string;
  expiryDate: string;
  unit: string;
  qty: number;
  importPrice: number;
  oldStock: number;
  oldMac: number;
  newMac: number;
  lineTotal: number;
}

export default function NewPurchasePage() {
  const router = useRouter();
  const toast = useToast();
  const { showNotice } = useNotice();
  const [supplier, setSupplier] = useState('Công Ty TNHH Bayer Animal Health VN');
  const [supplierDebt, setSupplierDebt] = useState(25000000);
  const [warehouse, setWarehouse] = useState('Kho Trung Tâm Bến Tre');
  const [docRef, setDocRef] = useState('HD-BAYER-2026-88');
  const [searchQuery, setSearchQuery] = useState('');
  const [paidAmount, setPaidAmount] = useState('15000000');

  const [items, setItems] = useState<PurchaseItem[]>([
    {
      id: '1',
      name: 'Yucca Cấp Tốc Hấp Thu Khí Độc Ao Tôm (Chai 1L)',
      sku: 'YUC-LIQ-1L',
      batchNumber: 'YC-202610-02',
      expiryDate: '15/10/2028',
      unit: 'Chai',
      qty: 50,
      importPrice: 215000,
      oldStock: 45,
      oldMac: 220000,
      // (45 * 220000 + 50 * 215000) / 95 = 217368
      newMac: 217368,
      lineTotal: 10750000,
    },
    {
      id: '2',
      name: 'Men Vi Sinh Xử Lý Đáy Ao Tôm Bio-Active (Gói 500g)',
      sku: 'BIO-FLOC-500G',
      batchNumber: 'BIO-2610-99',
      expiryDate: '20/10/2027',
      unit: 'Gói',
      qty: 100,
      importPrice: 160000,
      oldStock: 82,
      oldMac: 165000,
      newMac: 162252,
      lineTotal: 16000000,
    },
  ]);

  const formatVND = (val: number) => `${Math.round(val).toLocaleString('vi-VN')}₫`;

  const subtotal = items.reduce((sum, i) => sum + i.lineTotal, 0);
  const shippingFee = 250000;
  const totalPayable = subtotal + shippingFee;
  const remainingDebt = Math.max(0, totalPayable - Number(paidAmount));

  const handleCompletePurchase = () => {
    toast.success('Nhập kho thành công!', 'Đã tính lại giá vốn MAC di động');
    showNotice({
      type: 'success',
      title: 'Nhập Hàng & Điều Chỉnh Giá Vốn MAC Thành Công!',
      message: 'Đã hoàn tất lập Phiếu Nhập Kho PN-20261029-01 từ Nhà Cung Cấp C.P. Việt Nam và tự động cập nhật Thẻ Kho Bất Biến.',
      details: [
        { label: 'Nhà cung cấp', value: 'Công Ty Cổ Phần Chăn Nuôi C.P. Việt Nam' },
        { label: 'Số mặt hàng', value: `${items.length} vật tư & thuốc thủy sản` },
        { label: 'Tổng tiền hàng', value: `${totalPayable.toLocaleString('vi-VN')}₫`, isHighlight: true },
        { label: 'Công thức giá vốn', value: 'Bình quân di động (Moving Average Cost)' },
        { label: 'Trạng thái kho', value: 'Đã sinh lô mới & Sẵn sàng xuất bán' },
      ],
      primaryButtonText: 'Đã hiểu & Về Danh Mục Kho',
      onPrimaryClick: () => router.push('/admin/inventory'),
    });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-outline-variant/30">
        <div>
          <div className="flex items-center gap-2 text-label-sm text-outline mb-1">
            <Link href="/admin/inventory" className="hover:text-primary">
              Kho hàng
            </Link>
            <span>/</span>
            <span className="text-on-surface">Phiếu Nhập Kho #PO-20261017-08</span>
          </div>
          <h1 className="font-headline-sm text-headline-lg font-bold text-on-surface">
            Nhập Hàng Nhà Cung Cấp &amp; Tính Giá Vốn MAC
          </h1>
          <p className="text-body-sm text-outline">
            Tự động tính lại giá vốn bình quân gia quyền di động (Moving Average Cost) và cập nhật số Lô/Date
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/admin/inventory">
            <Button variant="outline">Hủy bỏ</Button>
          </Link>
          <Button
            variant="primary"
            icon="save"
            onClick={handleCompletePurchase}
          >
            Hoàn Tất Nhập Kho &amp; Tính MAC
          </Button>
        </div>
      </div>

      {/* 3 Summary Bento Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Supplier */}
        <BentoCard>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary">
              <Icon name="storefront" className="text-[18px]" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-outline tracking-wider block">
                NHÀ CUNG CẤP VẬT TƯ
              </span>
              <h4 className="font-bold text-label-md text-on-surface truncate">
                {supplier}
              </h4>
            </div>
          </div>
          <div className="text-[12px] space-y-1 text-on-surface-variant pt-1 border-t border-outline-variant/20">
            <div className="flex justify-between">
              <span className="text-outline">Đang nợ NCC:</span>
              <span className="font-tabular-stat font-bold text-error">
                {formatVND(supplierDebt)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-outline">Đại diện hãng:</span>
              <span className="font-medium">Anh Tuấn • 0918.889.999</span>
            </div>
          </div>
        </BentoCard>

        {/* Card 2: Destination Warehouse */}
        <BentoCard>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-secondary">
              <Icon name="warehouse" className="text-[18px]" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-outline tracking-wider block">
                KHO ĐÍCH TIẾP NHẬN
              </span>
              <h4 className="font-bold text-label-md text-on-surface truncate">
                {warehouse}
              </h4>
            </div>
          </div>
          <div className="text-[12px] space-y-1 text-on-surface-variant pt-1 border-t border-outline-variant/20">
            <div className="flex justify-between">
              <span className="text-outline">Phương tiện:</span>
              <span className="font-medium text-secondary font-bold">Xe tải thùng lạnh</span>
            </div>
            <div className="flex justify-between">
              <span className="text-outline">Thủ kho nhận:</span>
              <span className="font-medium">Hoàng Nam (Thủ kho)</span>
            </div>
          </div>
        </BentoCard>

        {/* Card 3: Payment & Invoice Reference */}
        <BentoCard>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-tertiary">
              <Icon name="receipt_long" className="text-[18px]" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-outline tracking-wider block">
                CHỨNG TỪ &amp; CÔNG NỢ
              </span>
              <h4 className="font-bold text-label-md text-primary font-mono truncate">
                {docRef}
              </h4>
            </div>
          </div>
          <div className="text-[12px] space-y-1 text-on-surface-variant pt-1 border-t border-outline-variant/20">
            <div className="flex justify-between">
              <span className="text-outline">Thanh toán đợt 1:</span>
              <span className="font-tabular-stat font-bold text-secondary">
                {formatVND(Number(paidAmount))}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-outline">Ghi nợ hãng:</span>
              <span className="font-tabular-stat font-bold text-tertiary">
                {formatVND(remainingDebt)}
              </span>
            </div>
          </div>
        </BentoCard>
      </div>

      {/* Items Table Section */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-sm overflow-hidden">
        {/* Scanner Bar */}
        <div className="p-3 border-b border-outline-variant/20 bg-surface-container-low/40 flex items-center justify-between gap-3">
          <div className="relative flex-1 max-w-lg">
            <Icon name="barcode_scanner" className="absolute left-3 top-2.5 text-outline text-[18px]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Quét mã vạch hoặc tìm SKU thuốc để thêm dòng nhập kho... [F4]"
              className="w-full h-9 pl-9 pr-12 rounded-lg bg-surface-container-lowest text-body-sm border border-outline-variant/30 focus:outline-none focus:border-primary"
            />
            <div className="absolute right-2 top-1.5">
              <KeycapBadge label="F4" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-outline font-mono">
              Công thức MAC: (Tồn cũ × Giá cũ + Nhập mới × Giá mới) / Tổng tồn
            </span>
          </div>
        </div>

        {/* Table Data */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-body-sm">
            <thead>
              <tr className="bg-surface-container-low text-outline uppercase text-[11px] font-bold border-b border-outline-variant/20">
                <th className="py-3 px-3">Sản phẩm &amp; Lô Hàng Mới</th>
                <th className="py-3 px-2 text-center">ĐVT</th>
                <th className="py-3 px-3 text-right">SL Nhập</th>
                <th className="py-3 px-3 text-right">Đơn giá nhập</th>
                <th className="py-3 px-3 text-right">Giá vốn MAC cũ</th>
                <th className="py-3 px-3 text-right bg-primary-fixed/20 text-primary font-bold">
                  Giá vốn MAC MỚI
                </th>
                <th className="py-3 px-3 text-right">Thành tiền</th>
                <th className="py-3 px-2 text-center">Xóa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/15">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-surface-container-low/40">
                  <td className="py-3 px-3">
                    <p className="font-bold text-on-surface">{item.name}</p>
                    <div className="flex items-center gap-2 text-[11px] text-outline font-mono mt-0.5">
                      <span>{item.sku}</span>
                      <span>•</span>
                      <span className="text-secondary font-bold">Lô: {item.batchNumber}</span>
                      <span>•</span>
                      <span>HSD: {item.expiryDate}</span>
                    </div>
                  </td>

                  <td className="py-3 px-2 text-center font-mono text-[11px]">
                    {item.unit}
                  </td>

                  <td className="py-3 px-3 text-right font-tabular-stat font-bold text-on-surface">
                    {item.qty}
                  </td>

                  <td className="py-3 px-3 text-right font-tabular-stat font-semibold text-outline">
                    {formatVND(item.importPrice)}
                  </td>

                  <td className="py-3 px-3 text-right font-tabular-stat text-outline">
                    {formatVND(item.oldMac)}
                  </td>

                  {/* Calculated MAC */}
                  <td className="py-3 px-3 text-right font-tabular-stat font-bold text-primary bg-primary-fixed/10">
                    <div className="flex items-center justify-end gap-1">
                      <span>{formatVND(item.newMac)}</span>
                      {item.newMac < item.oldMac ? (
                        <Icon name="trending_down" className="text-secondary text-[14px]" />
                      ) : (
                        <Icon name="trending_up" className="text-error text-[14px]" />
                      )}
                    </div>
                  </td>

                  <td className="py-3 px-3 text-right font-tabular-stat font-bold text-on-surface">
                    {formatVND(item.lineTotal)}
                  </td>

                  <td className="py-3 px-2 text-center">
                    <button
                      type="button"
                      onClick={() => setItems(items.filter((i) => i.id !== item.id))}
                      className="text-outline hover:text-error"
                    >
                      <Icon name="delete" className="text-[16px]" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals & Settlement */}
        <div className="p-4 bg-surface-container-low/50 border-t border-outline-variant/20 flex flex-col sm:flex-row items-end sm:items-center justify-between gap-4">
          <div className="space-y-1 text-body-sm text-outline">
            <p>Tổng số lượng nhập: <strong className="text-on-surface">{items.reduce((s, i) => s + i.qty, 0)} sản phẩm</strong></p>
            <p>Cước vận chuyển đường thủy / đường bộ: <strong className="text-on-surface">{formatVND(shippingFee)}</strong></p>
          </div>

          <div className="text-right space-y-1">
            <div className="flex items-baseline justify-end gap-3">
              <span className="text-label-sm font-bold text-outline uppercase">
                Tổng giá trị phiếu nhập:
              </span>
              <span className="font-display text-headline-lg font-black text-primary">
                {formatVND(totalPayable)}
              </span>
            </div>
            <p className="text-[11px] text-tertiary font-mono">
              Đã thanh toán {formatVND(Number(paidAmount))} • Còn nợ hãng {formatVND(remainingDebt)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
