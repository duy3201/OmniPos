'use client';

import React, { useState, useEffect } from 'react';
import { Icon, Badge, Button, BentoCard, Modal, useToast, useNotice } from '@/components/ui';
import { useAuthStore } from '@/stores/authStore';

interface DebtRecord {
  id: string;
  customerId?: string;
  customerName: string;
  phone: string;
  pondName: string;
  cropSeason: string;
  creditLimit: number;
  currentDebt: number;
  lastPaymentDate: string;
  status: 'NORMAL' | 'OVER_LIMIT' | 'HARVEST_PENDING';
}

export default function DebtsPage() {
  const toast = useToast();
  const { showNotice } = useNotice();
  const { currentUser } = useAuthStore();
  const [debts, setDebts] = useState<DebtRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedDebt, setSelectedDebt] = useState<DebtRecord | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('20000000');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [paymentNote, setPaymentNote] = useState('Thu nợ đợt bán tỉa tôm');

  const formatVND = (val: number) => `${(val || 0).toLocaleString('vi-VN')}₫`;

  const fetchDebts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/debts');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setDebts(data);
        }
      }
    } catch (err) {
      console.error('Error fetching debts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDebts();
  }, []);

  const totalDebt = debts.reduce((sum, d) => sum + (d.currentDebt || 0), 0);
  const harvestPendingDebt = debts.filter((d) => d.status === 'HARVEST_PENDING').reduce((sum, d) => sum + (d.currentDebt || 0), 0);
  const overLimitDebt = debts.filter((d) => d.status === 'OVER_LIMIT').reduce((sum, d) => sum + (d.currentDebt || 0), 0);

  const filteredDebts = debts.filter((d) => {
    const matchesSearch =
      searchQuery === '' ||
      d.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.phone.includes(searchQuery) ||
      d.pondName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'NORMAL' && d.status === 'NORMAL') ||
      (statusFilter === 'OVER_LIMIT' && d.status === 'OVER_LIMIT') ||
      (statusFilter === 'HARVEST_PENDING' && d.status === 'HARVEST_PENDING');
    return matchesSearch && matchesStatus;
  });

  const handleOpenPayment = (debt: DebtRecord) => {
    if (currentUser?.role === 'WAREHOUSE_KEEPER') {
      showNotice({
        type: 'error',
        title: 'Tác Vụ Bị Cấm Đối Với Thủ Kho',
        message: 'Tài khoản Thủ kho (Võ Văn Thành) bị cấm thu nợ và quản lý tiền mặt theo nguyên tắc bất kiêm nhiệm tài chính của cửa hàng (Tránh rủi ro giữa Quản lý tồn kho và Thu tiền mặt). Thao tác này chỉ dành cho Thu ngân (Lê Thảo Vy) hoặc Quản lý (Nguyễn Hoàng Nam).',
        details: [
          { label: 'Nhân sự thao tác', value: `${currentUser?.name} (${currentUser?.roleName})` },
          { label: 'Nguyên tắc an toàn', value: 'Bất kiêm nhiệm Thủ kho & Thu quỹ tiền mặt' },
          { label: 'Quyền hạn yêu cầu', value: 'Thu ngân quầy hoặc Quản lý cửa hàng' },
        ],
        primaryButtonText: 'Đã hiểu',
      });
      return;
    }
    setSelectedDebt(debt);
    setPaymentAmount(String(Math.min(20000000, debt.currentDebt || 20000000)));
    setShowPaymentModal(true);
  };

  const handleSubmitPayment = async () => {
    if (currentUser?.role === 'WAREHOUSE_KEEPER') {
      showNotice({
        type: 'error',
        title: 'Tác Vụ Bị Cấm',
        message: 'Thủ kho không được phép ghi nhận phiếu thu nợ!',
      });
      return;
    }

    if (!selectedDebt) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/debts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: selectedDebt.customerId || selectedDebt.id,
          amount: Number(paymentAmount),
          paymentMethod,
          notes: paymentNote,
          staffId: currentUser?.id,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Thu nợ thất bại');
      }

      const data = await res.json();
      setShowPaymentModal(false);
      toast.success('Lập phiếu thu nợ thành công!', `Đã thu ${Number(paymentAmount).toLocaleString('vi-VN')}₫ cho ${selectedDebt?.customerName}`);
      showNotice({
        type: 'success',
        title: 'Lập Phiếu Thu Tiền Nợ Vụ Nuôi Thành Công!',
        message: `Đã ghi nhận thanh toán tiền bán tôm của chủ đầm ${selectedDebt?.customerName} và tự động cấn trừ vào Sổ công nợ vụ nuôi trên Database PostgreSQL.`,
        details: [
          { label: 'Chủ đầm / Khách hàng', value: selectedDebt?.customerName || '' },
          { label: 'Ao nuôi / Vụ', value: `${selectedDebt?.pondName} (${selectedDebt?.cropSeason})` },
          { label: 'Số tiền thu đợt này', value: `${Number(paymentAmount).toLocaleString('vi-VN')}₫`, isHighlight: true },
          { label: 'Dư nợ còn lại', value: `${(data.newDebt || 0).toLocaleString('vi-VN')}₫` },
          { label: 'Thu ngân tiếp nhận', value: `${currentUser?.name || 'Lê Thảo Vy'} (${currentUser?.roleName || 'Thu ngân'})` },
          { label: 'Chứng từ kế toán', value: `Mã phiếu thu: ${data.receipt?.receiptCode || 'PT-SUCCESS'}` },
        ],
        primaryButtonText: 'In Phiếu Thu K80 & Đóng',
        secondaryButtonText: 'Đóng',
      });
      fetchDebts();
    } catch (err: any) {
      toast.error('Lỗi thu nợ', err.message || 'Không thể kết nối máy chủ');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline-sm text-headline-lg font-bold text-on-surface">
            Sổ Công Nợ Vụ Nuôi &amp; Khách Hàng (Crop Credit)
          </h1>
          <p className="text-body-sm text-outline">
            Quản trị công nợ gối đầu theo từng ao/vụ tôm • Hạn mức tín dụng &amp; Thu nợ từng đợt bán tôm
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" icon="file_download">
            Xuất Sổ Nợ Vụ (Excel)
          </Button>
          <Button
            variant={currentUser?.role === 'WAREHOUSE_KEEPER' ? 'outline' : 'primary'}
            icon={currentUser?.role === 'WAREHOUSE_KEEPER' ? 'lock' : 'payments'}
            onClick={() => debts[0] && handleOpenPayment(debts[0])}
            disabled={debts.length === 0}
            className={currentUser?.role === 'WAREHOUSE_KEEPER' ? 'border-rose-400 text-rose-600 bg-rose-50' : ''}
          >
            {currentUser?.role === 'WAREHOUSE_KEEPER' ? '🔒 Thu Nợ (Bị Khóa Với Thủ Kho)' : '+ Lập phiếu thu nợ'}
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <BentoCard>
          <span className="text-label-sm uppercase text-outline font-bold tracking-wider block">
            Tổng nợ vụ nuôi đang theo dõi
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-display text-headline-lg font-black text-primary">
              {formatVND(totalDebt)}
            </span>
            <Badge variant="primary" size="sm">{debts.length} chủ đầm</Badge>
          </div>
          <span className="text-[11px] text-outline mt-1 block">
            Dữ liệu trực tiếp từ PostgreSQL Neon Cloud
          </span>
        </BentoCard>

        <BentoCard>
          <span className="text-label-sm uppercase text-tertiary font-bold tracking-wider block">
            Sắp đến kỳ thu hoạch tôm
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-display text-headline-lg font-black text-tertiary">
              {formatVND(harvestPendingDebt)}
            </span>
            <Badge variant="warning" dot size="sm">Cần đối soát nợ</Badge>
          </div>
          <span className="text-[11px] text-tertiary mt-1 block">
            Các ao nuôi đang chuẩn bị thu hoạch bán thương lái
          </span>
        </BentoCard>

        <BentoCard>
          <span className="text-label-sm uppercase text-error font-bold tracking-wider block">
            Vượt hạn mức tín dụng (Over limit)
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-display text-headline-lg font-black text-error">
              {formatVND(overLimitDebt)}
            </span>
            <Badge variant="danger" dot size="sm">Cần duyệt sếp</Badge>
          </div>
          <span className="text-[11px] text-error mt-1 block">
            Tạm dừng cho nợ thêm nếu chưa thu hồi nợ
          </span>
        </BentoCard>

        <BentoCard>
          <span className="text-label-sm uppercase text-secondary font-bold tracking-wider block">
            Đã kết nối Database
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-display text-headline-md font-black text-secondary">
              Neon PostgreSQL
            </span>
            <Badge variant="success" size="sm">Online</Badge>
          </div>
          <span className="text-[11px] text-secondary mt-1 block">
            Hạn mức nợ &amp; Dư nợ đồng bộ tự động 100%
          </span>
        </BentoCard>
      </div>

      {/* Debt Table */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-sm overflow-hidden">
        <div className="p-3 border-b border-outline-variant/20 bg-surface-container-low/40 flex items-center justify-between">
          <div className="relative w-80">
            <Icon name="search" className="absolute left-3 top-2.5 text-outline text-[18px]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên chủ đầm, SĐT, tên ao..."
              className="w-full h-9 pl-9 pr-3 rounded-lg bg-surface-container-lowest text-body-sm border border-outline-variant/30 focus:outline-none focus:border-primary"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[12px] text-outline">Lọc trạng thái:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 px-3 rounded-lg bg-surface-container-lowest text-label-sm border border-outline-variant/30 text-on-surface outline-none"
            >
              <option value="ALL">Tất cả khách hàng nợ</option>
              <option value="NORMAL">Trong hạn mức an toàn</option>
              <option value="OVER_LIMIT">Vượt hạn mức tín dụng</option>
              <option value="HARVEST_PENDING">Đến kỳ thu hoạch tôm</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-body-sm min-w-[800px]">
          <thead>
            <tr className="bg-surface-container-low text-outline uppercase text-[11px] font-bold border-b border-outline-variant/20">
              <th className="py-3 px-4">Chủ Đầm / Khách Hàng</th>
              <th className="py-3 px-3">Ao Nuôi / Mùa Vụ</th>
              <th className="py-3 px-3 text-right">Hạn Mức Tín Dụng</th>
              <th className="py-3 px-4 text-right bg-primary-fixed/20 text-primary font-bold">
                Dư Nợ Hiện Tại
              </th>
              <th className="py-3 px-4 text-center">Tỷ lệ nợ</th>
              <th className="py-3 px-3 text-center">Lần trả gần nhất</th>
              <th className="py-3 px-3 text-center">Trạng thái</th>
              <th className="py-3 px-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/15">
            {isLoading ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-outline">
                  <Icon name="sync" className="animate-spin text-[24px] inline-block mb-2" />
                  <p>Đang tải dữ liệu công nợ từ Database...</p>
                </td>
              </tr>
            ) : filteredDebts.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-outline">
                  <p className="font-semibold text-on-surface">Không tìm thấy bản ghi công nợ nào</p>
                  <p className="text-body-sm text-outline mt-1">Hệ thống chưa ghi nhận công nợ hoặc không khớp bộ lọc.</p>
                </td>
              </tr>
            ) : (
              filteredDebts.map((d) => {
              const ratio = Math.min(100, Math.round((d.currentDebt / d.creditLimit) * 100));
              return (
                <tr key={d.id} className="hover:bg-surface-container-low/50 transition-colors">
                  <td className="py-3 px-4">
                    <p className="font-semibold text-on-surface">{d.customerName}</p>
                    <p className="text-[11px] text-outline font-mono">{d.phone}</p>
                  </td>

                  <td className="py-3 px-3">
                    <p className="font-medium text-on-surface">{d.pondName}</p>
                    <span className="text-[11px] text-outline">{d.cropSeason}</span>
                  </td>

                  <td className="py-3 px-3 text-right font-tabular-stat text-outline font-medium">
                    {formatVND(d.creditLimit)}
                  </td>

                  <td className="py-3 px-4 text-right font-tabular-stat font-bold text-headline-sm text-primary bg-primary-fixed/10">
                    {formatVND(d.currentDebt)}
                  </td>

                  <td className="py-3 px-4">
                    <div className="w-24 mx-auto space-y-1">
                      <div className="w-full h-2 rounded-full bg-surface-container-high overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            ratio > 100
                              ? 'bg-error'
                              : ratio > 80
                              ? 'bg-tertiary'
                              : 'bg-primary'
                          }`}
                          style={{ width: `${Math.min(ratio, 100)}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-outline font-mono block text-center">
                        {ratio}%
                      </span>
                    </div>
                  </td>

                  <td className="py-3 px-3 text-center font-mono text-[11px] text-outline">
                    {d.lastPaymentDate}
                  </td>

                  <td className="py-3 px-3 text-center">
                    {d.status === 'NORMAL' && (
                      <Badge variant="success" size="sm">An toàn</Badge>
                    )}
                    {d.status === 'OVER_LIMIT' && (
                      <Badge variant="danger" dot size="sm">Vượt hạn mức</Badge>
                    )}
                    {d.status === 'HARVEST_PENDING' && (
                      <Badge variant="warning" dot size="sm">Kỳ thu hoạch</Badge>
                    )}
                  </td>

                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenPayment(d)}
                        className={`px-2.5 py-1 rounded text-label-sm font-semibold transition-colors flex items-center gap-1 ${
                          currentUser?.role === 'WAREHOUSE_KEEPER'
                            ? 'bg-rose-500/10 text-rose-600 border border-rose-200 hover:bg-rose-500/20'
                            : 'bg-secondary-container text-on-secondary-container hover:bg-secondary hover:text-white'
                        }`}
                        title={currentUser?.role === 'WAREHOUSE_KEEPER' ? 'Thủ kho bị cấm thu nợ tiền mặt' : 'Lập phiếu thu nợ'}
                      >
                        <Icon name={currentUser?.role === 'WAREHOUSE_KEEPER' ? 'lock' : 'payments'} className="text-[14px]" />
                        <span>{currentUser?.role === 'WAREHOUSE_KEEPER' ? 'Khóa' : 'Thu nợ'}</span>
                      </button>
                      <button
                        type="button"
                        className="p-1 rounded hover:bg-surface-container text-outline"
                        title="Xem lịch sử đơn nợ"
                      >
                        <Icon name="history" className="text-[18px]" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            }))}
          </tbody>
        </table>
        </div>
      </div>

      {/* Modal Lập Phiếu Thu Nợ */}
      <Modal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        title="Lập Phiếu Thu Tiền Nợ Vụ Nuôi"
        subtitle={selectedDebt?.customerName}
        maxWidth="md"
      >
        {selectedDebt && (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/30 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-outline block">Dư nợ hiện tại:</span>
                <span className="font-tabular-stat text-headline-sm font-black text-primary">
                  {formatVND(selectedDebt.currentDebt)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-outline block">Ao ghi nợ:</span>
                <span className="font-bold text-label-sm text-on-surface">
                  {selectedDebt.pondName}
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-label-sm font-semibold text-on-surface">
                Số tiền thu nợ đợt này (VNĐ) <span className="text-error">*</span>
              </label>
              <input
                type="text"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                className="w-full h-11 px-3 rounded-lg border border-outline-variant/40 bg-surface-container-lowest font-tabular-stat text-headline-sm font-bold text-secondary focus:outline-none focus:border-secondary"
              />
              <div className="flex items-center gap-2 pt-1">
                {[10000000, 20000000, 50000000, selectedDebt.currentDebt].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setPaymentAmount(String(amt))}
                    className="px-2 py-0.5 rounded bg-surface-container text-[11px] font-mono hover:bg-surface-container-high"
                  >
                    {amt === selectedDebt.currentDebt ? 'Tất toán hết' : `${amt / 1000000}tr`}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-label-sm font-semibold text-on-surface">
                Hình thức thanh toán
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('CASH')}
                  className={`py-2 px-3 rounded-lg font-semibold text-label-sm border transition-all flex items-center justify-center gap-1.5 ${
                    paymentMethod === 'CASH'
                      ? 'bg-secondary text-white border-secondary'
                      : 'bg-surface-container text-on-surface border-outline-variant/30'
                  }`}
                >
                  <Icon name="payments" className="text-[16px]" />
                  <span>Tiền mặt</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('TRANSFER')}
                  className={`py-2 px-3 rounded-lg font-semibold text-label-sm border transition-all flex items-center justify-center gap-1.5 ${
                    paymentMethod === 'TRANSFER'
                      ? 'bg-primary text-white border-primary'
                      : 'bg-surface-container text-on-surface border-outline-variant/30'
                  }`}
                >
                  <Icon name="qr_code_scanner" className="text-[16px]" />
                  <span>Chuyển khoản / VietQR</span>
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-label-sm font-semibold text-on-surface">
                Ghi chú thu nợ (Đợt bán tôm, người nộp)
              </label>
              <textarea
                rows={2}
                value={paymentNote}
                onChange={(e) => setPaymentNote(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-outline-variant/40 bg-surface-container-lowest text-body-sm focus:outline-none focus:border-primary resize-none"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <Button variant="outline" disabled={isSubmitting} onClick={() => setShowPaymentModal(false)}>
                Hủy bỏ
              </Button>
              <Button variant="success" icon="check_circle" disabled={isSubmitting} onClick={handleSubmitPayment}>
                {isSubmitting ? 'Đang lưu vào Database...' : 'Xác nhận gạch nợ & In phiếu thu'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
