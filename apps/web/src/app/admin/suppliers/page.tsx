'use client';

import React, { useState } from 'react';
import { Icon, Badge, Button, BentoCard, useNotice, useToast } from '@/components/ui';

interface SupplierItem {
  id: string;
  name: string;
  phone: string;
  contactPerson: string;
  products: string;
  totalImport: number;
  currentDebt: number;
  paymentTerm: string;
}

export default function SuppliersPage() {
  const toast = useToast();
  const { showNotice } = useNotice();
  const [suppliers] = useState<SupplierItem[]>([
    {
      id: 's1',
      name: 'Công Ty TNHH Bayer Animal Health VN',
      phone: '028.3829.8888',
      contactPerson: 'Anh Tuấn (Giám đốc vùng)',
      products: 'Yucca, Men vi sinh đáy, Thuốc giải độc gan',
      totalImport: 520000000,
      currentDebt: 25000000,
      paymentTerm: 'Gối đầu 30 ngày',
    },
    {
      id: 's2',
      name: 'Tập Đoàn Thủy Sản C.P. Việt Nam',
      phone: '0251.383.6251',
      contactPerson: 'Chị Lan (Phòng kinh doanh thức ăn)',
      products: 'Thức ăn tôm thẻ số 1, 2, 3, Tôm giống F1',
      totalImport: 1450000000,
      currentDebt: 110000000,
      paymentTerm: 'Thanh toán theo tuần',
    },
    {
      id: 's3',
      name: 'Công Ty CP Dược Thú Y Thủy Sản Tân Việt Hoa',
      phone: '0272.377.9922',
      contactPerson: 'Anh Hoàng (Kỹ thuật)',
      products: 'Thảo dược gan tụy, Khoáng tạt hạt',
      totalImport: 310000000,
      currentDebt: 0,
      paymentTerm: 'Đã thanh toán hết',
    },
  ]);

  const formatVND = (val: number) => `${val.toLocaleString('vi-VN')}₫`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline-sm text-headline-lg font-bold text-on-surface">
            Nhà Cung Cấp &amp; Công Nợ Phải Trả NCC
          </h1>
          <p className="text-body-sm text-outline">
            Danh bạ các công ty sản xuất thức ăn, giống &amp; thuốc thú y thủy sản • Theo dõi công nợ nhập hàng
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="primary" icon="add">
            + Thêm nhà cung cấp mới
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <BentoCard>
          <span className="text-label-sm uppercase text-outline font-bold tracking-wider block">
            Tổng nợ phải trả các hãng
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-display text-headline-lg font-black text-error">
              135.000.000₫
            </span>
            <Badge variant="danger" size="sm">Cần thanh toán</Badge>
          </div>
          <span className="text-[11px] text-outline mt-1 block">
            CP Việt Nam (110tr), Bayer VN (25tr)
          </span>
        </BentoCard>

        <BentoCard>
          <span className="text-label-sm uppercase text-primary font-bold tracking-wider block">
            Tổng doanh số nhập trong năm
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-display text-headline-lg font-black text-primary">
              2.280.000.000₫
            </span>
            <Badge variant="primary" size="sm">3 đối tác chính</Badge>
          </div>
          <span className="text-[11px] text-outline mt-1 block">
            Đạt chiết khấu thưởng sản lượng năm 3.5%
          </span>
        </BentoCard>

        <BentoCard>
          <span className="text-label-sm uppercase text-secondary font-bold tracking-wider block">
            Đã thanh toán trong tháng
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-display text-headline-lg font-black text-secondary">
              285.000.000₫
            </span>
            <Badge variant="success" size="sm">Đúng hạn</Badge>
          </div>
          <span className="text-[11px] text-secondary mt-1 block">
            Uy tín tín dụng đại lý cấp 1 xuất sắc
          </span>
        </BentoCard>
      </div>

      {/* Table */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse text-body-sm">
          <thead>
            <tr className="bg-surface-container-low text-outline uppercase text-[11px] font-bold border-b border-outline-variant/20">
              <th className="py-3 px-4">Tên Nhà Cung Cấp</th>
              <th className="py-3 px-3">Người Đại Diện &amp; Hotline</th>
              <th className="py-3 px-4">Mặt Hàng Cung Ứng Chính</th>
              <th className="py-3 px-3 text-right">Tổng Tiền Đã Nhập</th>
              <th className="py-3 px-4 text-right bg-error-container/20 text-error font-bold">
                Công Nợ Phải Trả
              </th>
              <th className="py-3 px-3 text-center">Chính Sách Nợ</th>
              <th className="py-3 px-4 text-right">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/15">
            {suppliers.map((s) => (
              <tr key={s.id} className="hover:bg-surface-container-low/50">
                <td className="py-3 px-4">
                  <p className="font-bold text-on-surface">{s.name}</p>
                </td>

                <td className="py-3 px-3">
                  <p className="font-semibold text-on-surface">{s.contactPerson}</p>
                  <p className="text-[11px] text-outline font-mono">{s.phone}</p>
                </td>

                <td className="py-3 px-4 text-[12px] text-outline">
                  {s.products}
                </td>

                <td className="py-3 px-3 text-right font-tabular-stat font-medium text-on-surface">
                  {formatVND(s.totalImport)}
                </td>

                <td className="py-3 px-4 text-right font-tabular-stat font-bold text-headline-sm text-error bg-error-container/10">
                  {formatVND(s.currentDebt)}
                </td>

                <td className="py-3 px-3 text-center font-mono text-[11px]">
                  <Badge variant={s.currentDebt > 0 ? 'warning' : 'success'} size="sm">
                    {s.paymentTerm}
                  </Badge>
                </td>

                <td className="py-3 px-4 text-right">
                  <button
                    type="button"
                    onClick={() => {
                      toast.info('Lập phiếu chi', `Chuẩn bị phiếu chi trả tiền hàng cho ${s.name}`);
                      showNotice({
                        type: 'info',
                        title: 'Lập Phiếu Chi Trả Tiền Hàng NCC',
                        message: `Đang lập lệnh chi thanh toán tiền hàng nhập kho cho nhà cung cấp ${s.name}.`,
                        details: [
                          { label: 'Nhà cung cấp', value: s.name },
                          { label: 'Người liên hệ', value: s.contactPerson },
                          { label: 'Dư nợ phải trả', value: `${s.currentDebt.toLocaleString('vi-VN')}₫`, isHighlight: true },
                          { label: 'Hạn thanh toán', value: s.paymentTerm },
                        ],
                        primaryButtonText: 'Xác Nhận Lập Phiếu Chi',
                        secondaryButtonText: 'Đóng',
                      });
                    }}
                    className="px-2.5 py-1 rounded bg-secondary-container text-on-secondary-container hover:bg-secondary hover:text-white font-semibold text-label-sm"
                  >
                    Trả tiền hãng
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
