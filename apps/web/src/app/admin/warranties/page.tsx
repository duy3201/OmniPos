'use client';

import React, { useState } from 'react';
import { Icon, Badge, Button, BentoCard } from '@/components/ui';

interface WarrantyItem {
  id: string;
  serialNumber: string;
  deviceName: string;
  customerName: string;
  phone: string;
  saleDate: string;
  warrantyMonths: number;
  expDate: string;
  status: 'ACTIVE' | 'EXPIRED';
}

export default function WarrantiesPage() {
  const [warranties] = useState<WarrantyItem[]>([
    {
      id: 'w1',
      serialNumber: 'SER-MT3HP-991',
      deviceName: 'Mô-tơ Giảm Tốc 3 Pha Kéo Dàn Quạt Oxy Ao Tôm 3HP',
      customerName: 'Anh Ba Hùng',
      phone: '0918.455.789',
      saleDate: '15/05/2026',
      warrantyMonths: 12,
      expDate: '15/05/2027',
      status: 'ACTIVE',
    },
    {
      id: 'w2',
      serialNumber: 'SN-PH-DIGITAL-042',
      deviceName: 'Bút Đo Độ pH Nước Điện Tử Cầm Tay Chống Nước Hanna',
      customerName: 'Chị Mai',
      phone: '0939.887.665',
      saleDate: '10/08/2026',
      warrantyMonths: 6,
      expDate: '10/02/2027',
      status: 'ACTIVE',
    },
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline-sm text-headline-lg font-bold text-on-surface">
            Quản Lý Thiết Bị Nuôi &amp; Bảo Hành Theo Serial/IMEI
          </h1>
          <p className="text-body-sm text-outline">
            Theo dõi thời hạn bảo hành mô-tơ quạt nước, máy thổi oxy đáy, bút đo pH/mặn điện tử
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="primary" icon="search">
            Tra cứu Serial máy
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse text-body-sm">
          <thead>
            <tr className="bg-surface-container-low text-outline uppercase text-[11px] font-bold border-b border-outline-variant/20">
              <th className="py-3 px-4">Số Serial / IMEI Máy</th>
              <th className="py-3 px-4">Tên Thiết Bị &amp; Thông Số</th>
              <th className="py-3 px-4">Khách Hàng Sở Hữu</th>
              <th className="py-3 px-3 text-center">Ngày Xuất Bán</th>
              <th className="py-3 px-3 text-center">Thời Hạn BH</th>
              <th className="py-3 px-3 text-center">Hết Hạn BH</th>
              <th className="py-3 px-3 text-center">Trạng Thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/15">
            {warranties.map((w) => (
              <tr key={w.id} className="hover:bg-surface-container-low/50">
                <td className="py-3 px-4 font-mono font-bold text-primary">
                  {w.serialNumber}
                </td>

                <td className="py-3 px-4">
                  <p className="font-bold text-on-surface">{w.deviceName}</p>
                </td>

                <td className="py-3 px-4">
                  <p className="font-semibold text-on-surface">{w.customerName}</p>
                  <p className="text-[11px] text-outline font-mono">{w.phone}</p>
                </td>

                <td className="py-3 px-3 text-center font-mono text-[11px] text-outline">
                  {w.saleDate}
                </td>

                <td className="py-3 px-3 text-center font-bold text-on-surface">
                  {w.warrantyMonths} Tháng
                </td>

                <td className="py-3 px-3 text-center font-mono font-bold text-primary">
                  {w.expDate}
                </td>

                <td className="py-3 px-3 text-center">
                  <Badge variant="success" size="sm">Đang bảo hành</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
