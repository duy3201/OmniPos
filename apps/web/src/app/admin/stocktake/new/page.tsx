'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Icon, Button, Badge, KeycapBadge, useToast, useNotice } from '@/components/ui';
import { useAuthStore } from '@/stores/authStore';

interface StocktakeItem {
  id: string;
  name: string;
  sku: string;
  unit: string;
  bookStock: number;
  actualStock: number;
  unitPrice: number;
  reason?: string;
}

export default function StocktakePage() {
  const router = useRouter();
  const toast = useToast();
  const { showNotice } = useNotice();
  const { currentUser } = useAuthStore();
  const [items, setItems] = useState<StocktakeItem[]>([
    {
      id: '1',
      name: 'Yucca Cấp Tốc Hấp Thu Khí Độc Ao Tôm (Chai 1L)',
      sku: 'YUC-LIQ-1L',
      unit: 'Chai',
      bookStock: 46,
      actualStock: 45, // Thiếu 1
      unitPrice: 280000,
      reason: 'Bể 1 chai khi bốc xếp',
    },
    {
      id: '2',
      name: 'Men Vi Sinh Xử Lý Đáy Ao Tôm Bio-Active (Gói 500g)',
      sku: 'BIO-FLOC-500G',
      unit: 'Gói',
      bookStock: 82,
      actualStock: 82, // Khớp
      unitPrice: 210000,
    },
    {
      id: '3',
      name: 'Khoáng Tạt Cứng Vỏ Cao Cấp Tôm Sú/Thẻ (Bao 25kg)',
      sku: 'KHOANG-TAT-25KG',
      unit: 'Bao',
      bookStock: 118,
      actualStock: 120, // Thừa 2
      unitPrice: 420000,
      reason: 'Nhập thừa đợt xe trước chưa ghi sổ',
    },
    {
      id: '4',
      name: 'Thức Ăn Tôm Thẻ Chân Trắng Số 2 (Bao 25kg)',
      sku: 'FEED-SHRIMP-NO2',
      unit: 'Bao',
      bookStock: 350,
      actualStock: 350, // Khớp
      unitPrice: 680000,
    },
  ]);

  const [barcodeScan, setBarcodeScan] = useState('');
  const [isBalancing, setIsBalancing] = useState(false);

  const formatVND = (val: number) => `${val.toLocaleString('vi-VN')}₫`;

  const handleUpdateActual = (id: string, delta: number) => {
    setItems((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, actualStock: Math.max(0, i.actualStock + delta) } : i
      )
    );
  };

  const handleBalanceStock = () => {
    if (currentUser?.role === 'CASHIER') {
      showNotice({
        type: 'error',
        title: 'Tác Vụ Bị Cấm Đối Với Thu Ngân',
        message: 'Thu ngân không có thẩm quyền kiểm kê và cân bằng thẻ kho. Thao tác này chỉ dành cho Thủ kho (Võ Văn Thành) hoặc Quản lý cửa hàng.',
      });
      return;
    }

    setIsBalancing(true);
    setTimeout(() => {
      setIsBalancing(false);
      toast.success('Cân bằng tồn kho thành công!', 'Đã tự động cập nhật Thẻ Kho Bất Biến.');
      showNotice({
        type: 'success',
        title: 'Cân Bằng Tồn Kho Tự Động Thành Công!',
        message: 'Hệ thống đã tự động đối chiếu số liệu kiểm đếm thực tế và cập nhật Thẻ Kho Bất Biến theo thời gian thực.',
        details: [
          { label: 'Mã phiếu đối soát', value: 'KK-20261029-01' },
          { label: 'Bút toán sinh ra', value: '1 Bút toán Nhập bù + 1 Bút toán Xuất hao hụt', isHighlight: true },
          { label: 'Chênh lệch tài chính', value: `${totalDiffVal.toLocaleString('vi-VN')}₫` },
          { label: 'Người thực hiện', value: `${currentUser?.name || 'Võ Văn Thành'} (${currentUser?.roleName || 'Thủ kho'})` },
          { label: 'Trạng thái thẻ kho', value: 'Đã khóa sổ & Ghi nhận bất biến' },
        ],
        primaryButtonText: 'Đã hiểu & Về Danh mục kho',
        onPrimaryClick: () => router.push('/admin/inventory'),
      });
    }, 800);
  };

  const totalDiffVal = items.reduce(
    (sum, i) => sum + (i.actualStock - i.bookStock) * i.unitPrice,
    0
  );

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
            <span className="text-on-surface">Kiểm Kê Kho #STK-20261017-01</span>
          </div>
          <h1 className="font-headline-sm text-headline-lg font-bold text-on-surface">
            Phiếu Kiểm Kê &amp; Cân Bằng Tồn Kho Thủy Sản
          </h1>
          <p className="text-body-sm text-outline">
            Chốt số dư sổ sách • Quét barcode kiểm đếm thực tế và tự động điều chỉnh thẻ kho
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/admin/inventory">
            <Button variant="outline">Hủy bỏ</Button>
          </Link>
          <Button
            variant="success"
            icon="balance"
            loading={isBalancing}
            onClick={handleBalanceStock}
          >
            Cân Bằng Tồn Kho Tự Động
          </Button>
        </div>
      </div>

      {/* Metadata Strip */}
      <div className="p-4 bg-surface-container-lowest rounded-xl border border-outline-variant/30 grid grid-cols-1 sm:grid-cols-4 gap-4 text-body-sm">
        <div>
          <span className="text-[10px] text-outline uppercase font-bold block">Kho đối soát</span>
          <span className="font-bold text-on-surface">Kho Trung Tâm Bến Tre</span>
        </div>
        <div>
          <span className="text-[10px] text-outline uppercase font-bold block">Người kiểm kê</span>
          <span className="font-bold text-primary">Minh Anh (Kỹ sư)</span>
        </div>
        <div>
          <span className="text-[10px] text-outline uppercase font-bold block">Thời điểm chốt sổ</span>
          <span className="font-bold font-mono text-on-surface">17/10/2026 - 18:00</span>
        </div>
        <div>
          <span className="text-[10px] text-outline uppercase font-bold block">Chênh lệch ròng</span>
          <span className={`font-tabular-stat font-bold text-label-md ${totalDiffVal >= 0 ? 'text-secondary' : 'text-error'}`}>
            {totalDiffVal >= 0 ? `+${formatVND(totalDiffVal)}` : formatVND(totalDiffVal)}
          </span>
        </div>
      </div>

      {/* Scanner Toolbar */}
      <div className="p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/30 flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-xl">
          <Icon name="barcode_scanner" className="absolute left-3 top-2.5 text-primary text-[20px]" />
          <input
            type="text"
            value={barcodeScan}
            onChange={(e) => setBarcodeScan(e.target.value)}
            placeholder="Quét mã vạch sản phẩm để cộng dồn (+1) vào số lượng thực tế..."
            className="w-full h-11 pl-10 pr-24 rounded-lg bg-surface-container-low text-on-surface border border-outline-variant/30 focus:outline-none focus:border-primary text-body-sm font-semibold"
          />
          <div className="absolute right-2 top-2">
            <KeycapBadge label="Enter" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="success" dot>Chế độ quét cộng dồn BẬT</Badge>
        </div>
      </div>

      {/* Table Data */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse text-body-sm">
          <thead>
            <tr className="bg-surface-container-low text-outline uppercase text-[11px] font-bold border-b border-outline-variant/20">
              <th className="py-3 px-4">Sản Phẩm &amp; SKU</th>
              <th className="py-3 px-2 text-center">ĐVT</th>
              <th className="py-3 px-3 text-right">Tồn Sổ Sách</th>
              <th className="py-3 px-4 text-center bg-primary-fixed/20 text-primary font-bold">
                Thực Tế Đếm Được
              </th>
              <th className="py-3 px-3 text-right">Chênh Lệch</th>
              <th className="py-3 px-3 text-right">Giá Trị Lệch</th>
              <th className="py-3 px-4">Lý Do / Ghi Chú</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/15">
            {items.map((item) => {
              const diffQty = item.actualStock - item.bookStock;
              const diffMoney = diffQty * item.unitPrice;
              return (
                <tr key={item.id} className="hover:bg-surface-container-low/40">
                  <td className="py-3 px-4">
                    <p className="font-bold text-on-surface">{item.name}</p>
                    <p className="text-[11px] text-outline font-mono">{item.sku}</p>
                  </td>

                  <td className="py-3 px-2 text-center font-mono text-[11px]">
                    {item.unit}
                  </td>

                  <td className="py-3 px-3 text-right font-tabular-stat text-outline font-medium">
                    {item.bookStock} {item.unit}
                  </td>

                  {/* Actual Stepper */}
                  <td className="py-3 px-4 bg-primary-fixed/10">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleUpdateActual(item.id, -1)}
                        className="w-7 h-7 rounded bg-surface-container flex items-center justify-center text-on-surface hover:bg-white"
                      >
                        <Icon name="remove" className="text-[14px]" />
                      </button>
                      <span className="w-12 text-center font-tabular-stat font-bold text-headline-sm text-primary">
                        {item.actualStock}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleUpdateActual(item.id, 1)}
                        className="w-7 h-7 rounded bg-surface-container flex items-center justify-center text-on-surface hover:bg-white"
                      >
                        <Icon name="add" className="text-[14px]" />
                      </button>
                    </div>
                  </td>

                  <td className="py-3 px-3 text-right font-tabular-stat font-bold">
                    {diffQty === 0 ? (
                      <span className="text-outline">0 (Khớp)</span>
                    ) : diffQty > 0 ? (
                      <span className="text-secondary">+{diffQty} {item.unit} (Thừa)</span>
                    ) : (
                      <span className="text-error">{diffQty} {item.unit} (Thiếu)</span>
                    )}
                  </td>

                  <td className="py-3 px-3 text-right font-tabular-stat font-bold">
                    {diffMoney === 0 ? (
                      <span className="text-outline">0₫</span>
                    ) : diffMoney > 0 ? (
                      <span className="text-secondary">+{formatVND(diffMoney)}</span>
                    ) : (
                      <span className="text-error">{formatVND(diffMoney)}</span>
                    )}
                  </td>

                  <td className="py-3 px-4 text-[12px] text-outline">
                    {item.reason || '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
