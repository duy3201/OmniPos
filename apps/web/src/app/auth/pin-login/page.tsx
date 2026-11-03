'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Icon, KeycapBadge, useToast } from '@/components/ui';
import { useAuthStore, PRESET_STAFF_USERS } from '@/stores/authStore';

function PinLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  const { switchUser } = useAuthStore();

  const redirectUrl = searchParams.get('redirect') || '/pos/terminal';

  const [selectedStaffId, setSelectedStaffId] = useState<string>(PRESET_STAFF_USERS[1].id); // Mặc định Kỹ sư KS. Trần Minh Anh
  const [pin, setPin] = useState('');
  const [startingCash, setStartingCash] = useState('2.000.000');
  const [notes, setNotes] = useState('Két tiền đầy đủ tiền lẻ 10k, 20k, 50k phục vụ thối tiền cho chủ đầm.');
  const [isOpening, setIsOpening] = useState(false);
  const [errorNotice, setErrorNotice] = useState('');

  const currentSelectedStaff =
    PRESET_STAFF_USERS.find((s) => s.id === selectedStaffId) || PRESET_STAFF_USERS[0];

  const handleKeyClick = (key: string) => {
    setErrorNotice('');
    if (key === 'clear') {
      setPin((prev) => prev.slice(0, -1));
    } else if (pin.length < 6) {
      const nextPin = pin + key;
      setPin(nextPin);
      if (nextPin.length === 4) {
        verifyAndLogin(nextPin);
      }
    }
  };

  const verifyAndLogin = (pinToTest: string) => {
    setIsOpening(true);
    setTimeout(() => {
      const res = switchUser(selectedStaffId, pinToTest);
      if (res.success) {
        toast.success(
          'Đăng nhập thành công!',
          `Chào mừng ${res.user?.name} (${res.user?.roleName}) đã vào ca làm việc.`,
        );
        router.push(redirectUrl);
      } else {
        setIsOpening(false);
        const errMsg = res.error || 'Mã PIN không chính xác!';
        setErrorNotice(errMsg);
        toast.error('Xác thực thất bại!', errMsg);
        setPin('');
      }
    }, 400);
  };

  const handleOpenShift = () => {
    if (pin.length < 4) {
      toast.warning('Chưa nhập đủ mã PIN', 'Vui lòng nhập đủ mã PIN 4 số của nhân viên!');
      return;
    }
    verifyAndLogin(pin);
  };

  return (
    <div className="w-full max-w-5xl bg-[#0F172A] border border-white/10 rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-6 text-white my-2 sm:my-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 sm:pb-5 border-b border-white/10 mb-4 sm:mb-6 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-container flex items-center justify-center text-white font-bold text-xl shadow-sm shrink-0">
            <Icon name="point_of_sale" className="text-[24px]" />
          </div>
          <div>
            <h1 className="font-headline-sm text-label-lg sm:text-headline-sm font-bold tracking-tight">
              OmniPOS Aquaculture Terminal
            </h1>
            <p className="text-body-sm text-outline-variant text-[11px] sm:text-[12px]">
              Xác thực danh tính nhân sự &amp; Khởi tạo ca thu ngân bảo mật
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-secondary/20 text-secondary-fixed text-[11px] sm:text-label-sm border border-secondary/30">
            <span className="w-2 h-2 rounded-full bg-secondary-fixed animate-pulse"></span>
            <span>Trạm POS #01 • Kho Bến Tre</span>
          </div>
        </div>
      </div>

      {/* Main Split Layout: Left PIN Touchscreen + Right Shift Declaration */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ================= LEFT HALF: STAFF SELECTOR & NUMPAD (6 COLS) ================= */}
        <div className="lg:col-span-6 flex flex-col justify-between bg-white/[0.03] border border-white/5 rounded-xl p-5">
          <div>
            <span className="text-label-sm text-primary-fixed uppercase tracking-wider block font-bold mb-1">
              BƯỚC 1: XÁC THỰC DANH TÍNH
            </span>
            <h2 className="font-headline-sm text-headline-sm text-white mb-3">
              Chọn nhân sự nhận ca
            </h2>

            {/* Staff Selector Pills (4 pre-set staff) */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              {PRESET_STAFF_USERS.map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => {
                    setSelectedStaffId(st.id);
                    setPin('');
                    setErrorNotice('');
                  }}
                  className={`p-2.5 rounded-xl text-left border transition-all flex items-center gap-2.5 ${
                    selectedStaffId === st.id
                      ? 'bg-primary-container/30 border-primary text-white shadow-md'
                      : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-primary text-white text-[12px] font-bold flex items-center justify-center shrink-0">
                    {st.avatar}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-label-sm font-bold truncate leading-tight">
                      {st.name}
                    </p>
                    <p className="text-[10px] text-white/60 truncate leading-tight">
                      {st.roleName}
                    </p>
                    <p className="text-[9px] text-primary-fixed font-mono mt-0.5">
                      PIN: {st.pinCode}
                    </p>
                  </div>
                  {selectedStaffId === st.id && (
                    <Icon name="check_circle" className="text-[18px] text-primary-fixed shrink-0" />
                  )}
                </button>
              ))}
            </div>

            {/* PIN Code LED Dots */}
            <div className="flex flex-col items-center justify-center py-3 bg-black/40 rounded-xl border border-white/10 mb-3">
              <span className="text-[11px] text-white/60 mb-2">
                NHẬP MÃ PIN CỦA {currentSelectedStaff.name.toUpperCase()} ({currentSelectedStaff.roleName})
              </span>
              <div className="flex items-center gap-3">
                {[0, 1, 2, 3].map((index) => (
                  <div
                    key={index}
                    className={`w-4 h-4 rounded-full transition-all ${
                      pin.length > index
                        ? 'bg-primary-fixed shadow-[0_0_12px_#38bdf8] scale-110'
                        : 'bg-white/20'
                    }`}
                  />
                ))}
              </div>
              {errorNotice && (
                <p className="text-[11px] text-rose-400 mt-2 font-semibold">
                  {errorNotice}
                </p>
              )}
            </div>

            {/* Tactile 3x4 Touch Numeric Keypad */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { k: '1', sub: '' },
                { k: '2', sub: 'ABC' },
                { k: '3', sub: 'DEF' },
                { k: '4', sub: 'GHI' },
                { k: '5', sub: 'JKL' },
                { k: '6', sub: 'MNO' },
                { k: '7', sub: 'PQRS' },
                { k: '8', sub: 'TUV' },
                { k: '9', sub: 'WXYZ' },
              ].map(({ k, sub }) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => handleKeyClick(k)}
                  className="h-12 bg-white/10 hover:bg-white/15 active:bg-primary active:text-white rounded-lg flex flex-col items-center justify-center transition-all shadow-sm border border-white/5"
                >
                  <span className="font-headline-md text-headline-md text-white leading-none font-bold">
                    {k}
                  </span>
                  {sub && (
                    <span className="text-[9px] text-white/40 mt-0.5 font-mono">
                      {sub}
                    </span>
                  )}
                </button>
              ))}

              {/* Clear button */}
              <button
                type="button"
                onClick={() => handleKeyClick('clear')}
                className="h-12 bg-rose-500/20 hover:bg-rose-500/30 active:scale-95 text-rose-300 rounded-lg flex items-center justify-center gap-1 transition-all border border-rose-500/30"
              >
                <Icon name="backspace" className="text-[18px]" />
                <span className="text-label-sm font-semibold">Xóa</span>
              </button>

              {/* Zero */}
              <button
                type="button"
                onClick={() => handleKeyClick('0')}
                className="h-12 bg-white/10 hover:bg-white/15 active:bg-primary active:text-white rounded-lg flex flex-col items-center justify-center transition-all shadow-sm border border-white/5"
              >
                <span className="font-headline-md text-headline-md text-white leading-none font-bold">
                  0
                </span>
              </button>

              {/* Quick Fill Demo PIN */}
              <button
                type="button"
                onClick={() => {
                  setPin(currentSelectedStaff.pinCode);
                  verifyAndLogin(currentSelectedStaff.pinCode);
                }}
                className="h-12 bg-primary/20 hover:bg-primary/30 text-primary-fixed rounded-lg flex items-center justify-center gap-1 transition-all border border-primary/30"
                title={`Điền nhanh mã PIN (${currentSelectedStaff.pinCode})`}
              >
                <Icon name="key" className="text-[18px]" />
                <span className="text-label-sm font-bold">Nhập PIN</span>
              </button>
            </div>
          </div>

          <div className="mt-3 p-2.5 bg-white/5 rounded-lg flex items-center justify-between text-[11px] text-white/60">
            <span>Mã PIN demo: <strong className="text-primary-fixed">{currentSelectedStaff.pinCode}</strong></span>
            <span className="text-white/40">Hạn mức CK: {currentSelectedStaff.discountLimitPercent}%</span>
          </div>
        </div>

        {/* ================= RIGHT HALF: ROLE PERMISSIONS & SHIFT DECLARATION (6 COLS) ================= */}
        <div className="lg:col-span-6 flex flex-col justify-between bg-white/[0.03] border border-white/5 rounded-xl p-5 space-y-4">
          <div>
            <div className="flex items-start justify-between mb-3">
              <div>
                <span className="text-label-sm text-secondary-fixed uppercase tracking-wider block font-bold">
                  BƯỚC 2: QUYỀN HẠN &amp; KHAI BÁO CA
                </span>
                <h2 className="font-headline-sm text-headline-sm text-white">
                  Phân quyền của {currentSelectedStaff.name}
                </h2>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-label-sm border border-emerald-500/30">
                <Icon name="verified" className="text-[14px]" />
                <span>{currentSelectedStaff.roleName}</span>
              </span>
            </div>

            {/* Permissions Summary Pills on Login */}
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-2 mb-4 text-body-sm">
              <div className="flex items-center justify-between">
                <span className="text-white/60 text-[12px] flex items-center gap-1">
                  <Icon name="check_circle" className="text-emerald-400 text-[14px]" />
                  Tác vụ cho phép:
                </span>
                <span className="text-emerald-300 font-bold text-[12px]">
                  {currentSelectedStaff.allowedActions.map((a) => a.name).slice(0, 2).join(', ')}...
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/60 text-[12px] flex items-center gap-1">
                  <Icon name="block" className="text-rose-400 text-[14px]" />
                  Tác vụ bị cấm:
                </span>
                <span className="text-rose-300 font-bold text-[12px]">
                  {currentSelectedStaff.forbiddenActions.length > 0
                    ? `${currentSelectedStaff.forbiddenActions[0].name}...`
                    : 'Không (Toàn quyền)'}
                </span>
              </div>
            </div>

            {/* Starting Cash Drawer Declaration */}
            <div className="space-y-1.5 mb-3">
              <label className="block text-label-sm font-semibold text-white/80">
                Tiền mặt đầu ca trong két (Starting Cash)
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-primary-fixed">
                  <Icon name="payments" className="text-[20px]" />
                </div>
                <input
                  type="text"
                  value={startingCash}
                  onChange={(e) => setStartingCash(e.target.value)}
                  className="w-full h-11 pl-11 pr-14 rounded-lg bg-black/40 text-white font-tabular-stat text-headline-sm font-bold border border-white/20 focus:border-primary focus:outline-none"
                />
                <span className="absolute right-3.5 text-white/50 font-bold">VNĐ</span>
              </div>
              <div className="flex items-center gap-1.5 pt-1">
                {['1.000.000', '2.000.000', '3.000.000', '5.000.000'].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setStartingCash(amt)}
                    className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-[11px] font-mono text-white/80 transition-colors"
                  >
                    {amt}đ
                  </button>
                ))}
              </div>
            </div>

            {/* Shift Notes */}
            <div className="space-y-1.5">
              <label className="block text-label-sm font-semibold text-white/80">
                Ghi chú bàn giao két tiền
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-2.5 rounded-lg bg-black/40 text-white text-body-sm border border-white/20 focus:border-primary focus:outline-none resize-none"
              />
            </div>
          </div>

          {/* Action Open Shift Button */}
          <div className="pt-2">
            <button
              type="button"
              disabled={isOpening}
              onClick={handleOpenShift}
              className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-headline-sm font-bold text-headline-sm shadow-lg shadow-primary/30 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
            >
              {isOpening ? (
                <>
                  <Icon name="refresh" className="text-[20px] animate-spin" />
                  <span>ĐANG XÁC THỰC MÃ PIN...</span>
                </>
              ) : (
                <>
                  <Icon name="login" className="text-[20px]" />
                  <span>XÁC NHẬN PIN &amp; BẮT ĐẦU CA</span>
                  <KeycapBadge label="Enter" variant="dark" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PinLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-surface-dim flex items-center justify-center text-on-surface-variant font-medium">
          Đang tải màn hình đăng nhập PIN...
        </div>
      }
    >
      <PinLoginContent />
    </Suspense>
  );
}
