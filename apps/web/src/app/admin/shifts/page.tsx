'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Icon, Badge, Button, BentoCard, useNotice, useToast } from '@/components/ui';
import { useAuthStore } from '@/stores/authStore';

export default function ShiftsPage() {
  const router = useRouter();
  const toast = useToast();
  const { showNotice } = useNotice();
  const { logout, currentUser } = useAuthStore();
  const [actualCash, setActualCash] = useState('6.250.000');
  const [isClosingShift, setIsClosingShift] = useState(false);

  const formatVND = (val: number) => `${val.toLocaleString('vi-VN')}₫`;

  // Calculated shift metrics
  const startingCash = 2000000;
  const cashSales = 4250000;
  const expectedCash = startingCash + cashSales; // 6.250.000
  const actualCashNumber = Number(actualCash.replace(/\./g, '')) || 0;
  const cashDiff = actualCashNumber - expectedCash;

  const vietQrSales = 8450000;
  const cardSales = 1500000;
  const creditSeasonSales = 14250000; // Bán nợ vụ nuôi
  const totalRevenue = cashSales + vietQrSales + cardSales + creditSeasonSales;
  const cogsMac = Math.round(totalRevenue * 0.72); // Giá vốn MAC
  const grossProfit = totalRevenue - cogsMac;

  const handleCloseShift = () => {
    setIsClosingShift(true);
    setTimeout(() => {
      setIsClosingShift(false);
      toast.success('Kết thúc ca thành công!', 'Đã đóng két tiền và bàn giao phiên làm việc.');
      showNotice({
        type: 'success',
        title: 'Kết Thúc Ca & Bàn Giao Tiền Két Thành Công!',
        message: 'Đã hoàn tất kiểm đếm tiền mặt đầu ca - cuối ca, đối soát tài khoản VietQR và doanh số bán nợ vụ nuôi. Hệ thống sẽ tự động đăng xuất để đảm bảo an toàn phiên làm việc.',
        details: [
          { label: 'Tổng doanh thu ca', value: `${totalRevenue.toLocaleString('vi-VN')}₫`, isHighlight: true },
          { label: 'Tiền mặt thực tế đếm', value: `${actualCashNumber.toLocaleString('vi-VN')}₫` },
          { label: 'Chênh lệch tiền két', value: `${cashDiff >= 0 ? '+' : ''}${cashDiff.toLocaleString('vi-VN')}₫ (Khớp két 100%)` },
          { label: 'Lãi gộp ước tính (MAC)', value: `${grossProfit.toLocaleString('vi-VN')}₫` },
        ],
        primaryButtonText: 'Đăng xuất & Trở về màn hình đăng nhập PIN',
        onPrimaryClick: () => {
          logout();
          router.push('/auth/pin-login');
        },
      });
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline-sm text-headline-lg font-bold text-on-surface">
            Quản Lý Ca Làm Việc &amp; Báo Cáo Lãi Gộp Real-time
          </h1>
          <p className="text-body-sm text-outline">
            Ca sáng: Minh Anh (08:00 - 15:00) • Đối soát két tiền mặt, VietQR và doanh số ghi nợ vụ nuôi
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" icon="print">
            In Biên Bản Giao Ca (K80)
          </Button>
          <Button
            variant="destructive"
            icon="logout"
            loading={isClosingShift}
            onClick={handleCloseShift}
          >
            Đóng Ca &amp; Chốt Két Tiền
          </Button>
        </div>
      </div>

      {/* KPI Real-time Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <BentoCard>
          <span className="text-label-sm uppercase text-outline font-bold tracking-wider block">
            Tổng doanh số trong ca
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-display text-headline-lg font-black text-primary">
              {formatVND(totalRevenue)}
            </span>
            <Badge variant="primary" size="sm">24 đơn</Badge>
          </div>
          <span className="text-[11px] text-outline mt-1 block">
            Tiền mặt + Chuyển khoản + Nợ vụ
          </span>
        </BentoCard>

        <BentoCard>
          <span className="text-label-sm uppercase text-secondary font-bold tracking-wider block">
            Lợi nhuận gộp thực tế (Gross Profit)
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-display text-headline-lg font-black text-secondary">
              {formatVND(grossProfit)}
            </span>
            <span className="font-mono text-secondary font-bold text-label-sm">
              28.0%
            </span>
          </div>
          <span className="text-[11px] text-secondary mt-1 block">
            Đã trừ giá vốn MAC ({formatVND(cogsMac)})
          </span>
        </BentoCard>

        <BentoCard>
          <span className="text-label-sm uppercase text-outline font-bold tracking-wider block">
            Tiền mặt lý thuyết trong két
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-display text-headline-lg font-black text-on-surface">
              {formatVND(expectedCash)}
            </span>
            <Badge variant="success" size="sm">Khớp 100%</Badge>
          </div>
          <span className="text-[11px] text-outline mt-1 block">
            Đầu ca: {formatVND(startingCash)} + Bán: {formatVND(cashSales)}
          </span>
        </BentoCard>

        <BentoCard>
          <span className="text-label-sm uppercase text-tertiary font-bold tracking-wider block">
            Bán nợ vụ nuôi trong ca
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-display text-headline-lg font-black text-tertiary">
              {formatVND(creditSeasonSales)}
            </span>
            <Badge variant="warning" size="sm">5 chủ ao</Badge>
          </div>
          <span className="text-[11px] text-tertiary mt-1 block">
            Ghi nợ thức ăn và khoáng tạt ao
          </span>
        </BentoCard>
      </div>

      {/* Cash Drawer Reconciliation & Hourly Chart Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Cash Drawer Reconciliation (6 Cols) */}
        <div className="lg:col-span-6 space-y-6">
          <BentoCard title="Đối soát két tiền &amp; Bàn giao ca">
            <div className="space-y-4 text-body-sm">
              <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/20 space-y-2">
                <div className="flex justify-between">
                  <span className="text-outline">Tiền mặt khai báo đầu ca:</span>
                  <span className="font-tabular-stat font-semibold">{formatVND(startingCash)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-outline">Tiền mặt thu bán hàng:</span>
                  <span className="font-tabular-stat font-semibold text-secondary">+{formatVND(cashSales)}</span>
                </div>
                <div className="pt-2 border-t border-outline-variant/20 flex justify-between">
                  <span className="font-bold text-on-surface">Số dư két sổ sách:</span>
                  <span className="font-tabular-stat font-bold text-headline-sm text-primary">
                    {formatVND(expectedCash)}
                  </span>
                </div>
              </div>

              {/* Actual Cash Count Input */}
              <div className="space-y-1.5">
                <label className="block text-label-sm font-semibold text-on-surface">
                  Tiền mặt thực tế đếm được trong két (VNĐ)
                </label>
                <div className="relative flex items-center">
                  <Icon name="payments" className="absolute left-3 text-secondary text-[20px]" />
                  <input
                    type="text"
                    value={actualCash}
                    onChange={(e) => setActualCash(e.target.value)}
                    className="w-full h-11 pl-10 pr-12 rounded-lg border border-outline-variant/40 bg-surface-container-lowest font-tabular-stat text-headline-sm font-bold text-secondary focus:outline-none focus:border-secondary"
                  />
                  <span className="absolute right-3 text-outline font-bold">₫</span>
                </div>
              </div>

              {/* Diff Result */}
              <div className={`p-3 rounded-xl border flex items-center justify-between ${
                cashDiff === 0
                  ? 'bg-secondary-container/30 border-secondary/30 text-on-secondary-container'
                  : 'bg-error-container/30 border-error/30 text-error'
              }`}>
                <div className="flex items-center gap-2">
                  <Icon
                    name={cashDiff === 0 ? 'check_circle' : 'warning'}
                    className="text-[20px]"
                  />
                  <span className="font-semibold text-label-md">
                    {cashDiff === 0
                      ? 'Két tiền hoàn toàn khớp với sổ sách!'
                      : cashDiff > 0
                      ? `Thừa tiền két: +${formatVND(cashDiff)}`
                      : `Thiếu tiền két: ${formatVND(cashDiff)}`}
                  </span>
                </div>
                <Badge variant={cashDiff === 0 ? 'success' : 'danger'}>
                  {cashDiff === 0 ? 'Khớp 100%' : 'Lệch'}
                </Badge>
              </div>
            </div>
          </BentoCard>
        </div>

        {/* Right: Payment Channels & Hourly Breakdown (6 Cols) */}
        <div className="lg:col-span-6 space-y-6">
          <BentoCard title="Cơ cấu kênh doanh thu trong ca">
            <div className="space-y-3 text-body-sm">
              {[
                { label: 'Bán nợ vụ nuôi (Chủ đầm)', amount: creditSeasonSales, pct: '50.1%', color: 'bg-tertiary', textColor: 'text-tertiary' },
                { label: 'Chuyển khoản VietQR (Napas247)', amount: vietQrSales, pct: '29.7%', color: 'bg-primary', textColor: 'text-primary' },
                { label: 'Tiền mặt tại quầy', amount: cashSales, pct: '14.9%', color: 'bg-secondary', textColor: 'text-secondary' },
                { label: 'Quẹt thẻ máy POS', amount: cardSales, pct: '5.3%', color: 'bg-outline', textColor: 'text-outline' },
              ].map((channel, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-surface-container-low border border-outline-variant/20 space-y-1">
                  <div className="flex justify-between items-center text-[12px]">
                    <span className="font-semibold text-on-surface">{channel.label}</span>
                    <span className="font-tabular-stat font-bold text-label-md text-on-surface">
                      {formatVND(channel.amount)} ({channel.pct})
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-surface-container-high overflow-hidden">
                    <div className={`h-full rounded-full ${channel.color}`} style={{ width: channel.pct }} />
                  </div>
                </div>
              ))}
            </div>
          </BentoCard>
        </div>
      </div>
    </div>
  );
}
