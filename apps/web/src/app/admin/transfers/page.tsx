'use client';

import React, { useState } from 'react';
import { Icon, Badge, Button, BentoCard, useNotice, useToast } from '@/components/ui';

interface TransferOrder {
  id: string;
  code: string;
  sourceWarehouse: string;
  destWarehouse: string;
  transporter: string;
  itemCount: number;
  totalVal: number;
  createdAt: string;
  status: 'SHIPPED' | 'DELIVERED' | 'DISCREPANCY';
}

export default function TransfersPage() {
  const toast = useToast();
  const { showNotice } = useNotice();
  const [transfers] = useState<TransferOrder[]>([
    {
      id: 't1',
      code: 'TR-20261017-01',
      sourceWarehouse: 'Kho Tổng Trung Tâm Bến Tre',
      destWarehouse: 'Kho Vệ Tinh Đầm Thạnh Phú (Ven Sông)',
      transporter: 'Ghe máy vỏ lãi • Bác Ba chèo',
      itemCount: 45,
      totalVal: 38500000,
      createdAt: '17/10/2026 08:30',
      status: 'SHIPPED',
    },
    {
      id: 't2',
      code: 'TR-20261016-03',
      sourceWarehouse: 'Kho Tổng Trung Tâm Bến Tre',
      destWarehouse: 'Điểm Bán Lẻ Ba Tri (Ao Tôm Sú)',
      transporter: 'Xe tải 1.5 tấn • Tài xế Hải',
      itemCount: 120,
      totalVal: 112000000,
      createdAt: '16/10/2026 14:00',
      status: 'DELIVERED',
    },
  ]);

  const formatVND = (val: number) => `${val.toLocaleString('vi-VN')}₫`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline-sm text-headline-lg font-bold text-on-surface">
            Phiếu Điều Chuyển Vật Tư Kho Nội Bộ
          </h1>
          <p className="text-body-sm text-outline">
            Luân chuyển thuốc, thức ăn, vi sinh giữa Kho tổng và các Điểm kho vệ tinh ven đầm nuôi
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="primary" icon="add">
            + Lập phiếu điều chuyển mới
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <BentoCard>
          <span className="text-label-sm uppercase text-outline font-bold tracking-wider block">
            Đang vận chuyển trên đường (Ghe/Xe tải)
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-display text-headline-lg font-black text-primary">
              1 <span className="text-sm font-normal text-outline">chuyến ghe</span>
            </span>
            <Badge variant="warning" dot size="sm">Đang đi</Badge>
          </div>
          <span className="text-[11px] text-outline mt-1 block">
            Giá trị hàng: 38.500.000₫
          </span>
        </BentoCard>

        <BentoCard>
          <span className="text-label-sm uppercase text-secondary font-bold tracking-wider block">
            Đã nhận đủ tại kho đầm
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-display text-headline-lg font-black text-secondary">
              18 <span className="text-sm font-normal text-outline">chuyến</span>
            </span>
            <Badge variant="success" size="sm">100% khớp</Badge>
          </div>
          <span className="text-[11px] text-outline mt-1 block">
            Đã nhập tồn kho vệ tinh
          </span>
        </BentoCard>

        <BentoCard>
          <span className="text-label-sm uppercase text-outline font-bold tracking-wider block">
            Lệch hàng khi giao nhận
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-display text-headline-lg font-black text-on-surface">
              0 <span className="text-sm font-normal text-outline">phiếu</span>
            </span>
            <Badge variant="neutral" size="sm">An toàn</Badge>
          </div>
          <span className="text-[11px] text-outline mt-1 block">
            Không có thất thoát bốc xếp
          </span>
        </BentoCard>
      </div>

      {/* Transfers Table */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse text-body-sm">
          <thead>
            <tr className="bg-surface-container-low text-outline uppercase text-[11px] font-bold border-b border-outline-variant/20">
              <th className="py-3 px-4">Mã Điều Chuyển</th>
              <th className="py-3 px-4">Kho Xuất &amp; Kho Đích</th>
              <th className="py-3 px-4">Phương Tiện Vận Chuyển</th>
              <th className="py-3 px-3 text-right">Số Mặt Hàng</th>
              <th className="py-3 px-4 text-right">Tổng Giá Trị</th>
              <th className="py-3 px-3 text-center">Trạng Thái</th>
              <th className="py-3 px-4 text-right">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/15">
            {transfers.map((t) => (
              <tr key={t.id} className="hover:bg-surface-container-low/50">
                <td className="py-3 px-4 font-mono font-bold text-primary">
                  {t.code}
                  <span className="block text-[11px] text-outline font-normal">
                    {t.createdAt}
                  </span>
                </td>

                <td className="py-3 px-4">
                  <p className="font-semibold text-on-surface">{t.destWarehouse}</p>
                  <p className="text-[11px] text-outline">Từ: {t.sourceWarehouse}</p>
                </td>

                <td className="py-3 px-4 text-on-surface font-medium">
                  {t.transporter}
                </td>

                <td className="py-3 px-3 text-right font-tabular-stat font-bold">
                  {t.itemCount} bao/thùng
                </td>

                <td className="py-3 px-4 text-right font-tabular-stat font-bold text-primary">
                  {formatVND(t.totalVal)}
                </td>

                <td className="py-3 px-3 text-center">
                  {t.status === 'SHIPPED' ? (
                    <Badge variant="warning" dot size="sm">Đang vận chuyển</Badge>
                  ) : (
                    <Badge variant="success" size="sm">Đã nhận đủ</Badge>
                  )}
                </td>

                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {t.status === 'SHIPPED' ? (
                      <button
                        type="button"
                        onClick={() => {
                          toast.success('Xác nhận nhận hàng thành công!', `Đã nhập đủ ${t.itemCount} món vào ${t.destWarehouse}`);
                          showNotice({
                            type: 'success',
                            title: 'Xác Nhận Nhận Hàng Điều Chuyển Kho Thành Công!',
                            message: `Kho đích ${t.destWarehouse} đã kiểm đếm và xác nhận nhập kho đầy đủ hàng hóa theo Lệnh điều chuyển ${t.code}.`,
                            details: [
                              { label: 'Mã điều chuyển', value: t.code },
                              { label: 'Kho xuất (Nguồn)', value: t.sourceWarehouse },
                              { label: 'Kho nhập (Đích)', value: t.destWarehouse },
                              { label: 'Số lượng mặt hàng', value: `${t.itemCount} món`, isHighlight: true },
                              { label: 'Tổng giá trị hàng', value: `${t.totalVal.toLocaleString('vi-VN')}₫` },
                              { label: 'Tài xế vận chuyển', value: t.transporter },
                              { label: 'Thẻ kho 2 đầu', value: 'Đã hoàn tất khớp số tồn kho bất biến' },
                            ],
                            primaryButtonText: 'Đã hiểu & Đóng',
                          });
                        }}
                        className="px-2.5 py-1 rounded bg-secondary-container text-on-secondary-container font-semibold text-label-sm"
                      >
                        Xác nhận nhận hàng
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="px-2.5 py-1 rounded hover:bg-surface-container text-outline"
                      >
                        <Icon name="visibility" className="text-[18px]" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
