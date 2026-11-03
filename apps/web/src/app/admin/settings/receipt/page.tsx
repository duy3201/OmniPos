'use client';

import React, { useState } from 'react';
import { Icon, Button, BentoCard, Badge } from '@/components/ui';

export default function ReceiptSettingsPage() {
  const [storeName, setStoreName] = useState('ĐẠI LÝ VẬT TƯ THỦY SẢN BẾN TRE');
  const [address, setAddress] = useState('Ấp 4, Xã Thạnh Phú, Huyện Thạnh Phú, Tỉnh Bến Tre');
  const [phone, setPhone] = useState('0918.455.789 - 0275.3888.999');
  const [footerNote, setFooterNote] = useState('Chúc quý bà con trúng mùa tôm được giá! Hỗ trợ kỹ thuật đo nước 24/7.');
  
  const [showBatchInfo, setShowBatchInfo] = useState(true);
  const [showCustomerDebt, setShowCustomerDebt] = useState(true);
  const [showVietQr, setShowVietQr] = useState(true);
  const [paperSize, setPaperSize] = useState('80mm');

  const handleTestPrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-outline-variant/30">
        <div>
          <h1 className="font-headline-sm text-headline-lg font-bold text-on-surface">
            Cài Đặt Hệ Thống &amp; Thiết Kế Mẫu Hóa Đơn K80
          </h1>
          <p className="text-body-sm text-outline">
            Tùy biến mẫu in nhiệt K80 • Hiển thị số Lô/Hạn dùng thuốc và thông tin nợ vụ nuôi của chủ đầm
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="primary" icon="print" onClick={handleTestPrint}>
            In thử hóa đơn kiểm tra [Test Print]
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Configuration Form (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <BentoCard title="1. Thông tin đại lý in trên tiêu đề Bill">
            <div className="space-y-3 text-body-sm">
              <div>
                <label className="block text-[11px] font-semibold text-outline mb-1">
                  Tên cửa hàng / Đại lý vật tư
                </label>
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-outline-variant/40 bg-surface-container-lowest font-bold text-on-surface text-label-md"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-outline mb-1">
                  Địa chỉ cửa hàng
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-outline-variant/40 bg-surface-container-lowest text-on-surface text-label-sm"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-outline mb-1">
                  Số điện thoại &amp; Hotline kỹ sư ao nuôi
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-outline-variant/40 bg-surface-container-lowest text-on-surface text-label-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-outline mb-1">
                  Lời dặn / Ghi chú chân trang
                </label>
                <textarea
                  rows={2}
                  value={footerNote}
                  onChange={(e) => setFooterNote(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-outline-variant/40 bg-surface-container-lowest text-body-sm text-on-surface resize-none"
                />
              </div>
            </div>
          </BentoCard>

          <BentoCard title="2. Tùy chọn hiển thị đặc thù ngành thủy sản">
            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 rounded-lg border border-outline-variant/30 hover:bg-surface-container-low cursor-pointer">
                <div>
                  <p className="font-semibold text-label-md text-on-surface">
                    In chi tiết Số Lô &amp; Hạn dùng của thuốc
                  </p>
                  <p className="text-[11px] text-outline">
                    Hiển thị mã Lô và Date dưới từng dòng thuốc để nông dân theo dõi
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={showBatchInfo}
                  onChange={(e) => setShowBatchInfo(e.target.checked)}
                  className="w-5 h-5 rounded text-primary cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-lg border border-outline-variant/30 hover:bg-surface-container-low cursor-pointer">
                <div>
                  <p className="font-semibold text-label-md text-on-surface">
                    In thông tin Công Nợ Vụ Nuôi của chủ đầm
                  </p>
                  <p className="text-[11px] text-outline">
                    In dòng: Nợ cũ + Đơn này = Tổng nợ mới cần trả cuối vụ
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={showCustomerDebt}
                  onChange={(e) => setShowCustomerDebt(e.target.checked)}
                  className="w-5 h-5 rounded text-primary cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-lg border border-outline-variant/30 hover:bg-surface-container-low cursor-pointer">
                <div>
                  <p className="font-semibold text-label-md text-on-surface">
                    In mã QR VietQR động (Napas247)
                  </p>
                  <p className="text-[11px] text-outline">
                    Khách có thể quét app ngân hàng thanh toán ngay trên bill
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={showVietQr}
                  onChange={(e) => setShowVietQr(e.target.checked)}
                  className="w-5 h-5 rounded text-primary cursor-pointer"
                />
              </label>
            </div>
          </BentoCard>
        </div>

        {/* Right: Realistic 80mm Thermal Paper Preview (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="w-full flex items-center justify-between mb-2 px-1">
            <span className="text-[11px] uppercase font-bold text-outline">
              MẪU IN NHIỆT K80 THỰC TẾ
            </span>
            <Badge variant="primary" size="sm">Khổ giấy 80mm</Badge>
          </div>

          {/* Thermal Receipt Paper Sheet */}
          <div
            id="receipt-print-area"
            className="w-full max-w-[340px] bg-white text-black p-5 rounded-lg shadow-xl border border-outline-variant/40 font-mono text-[12px] leading-relaxed space-y-3"
          >
            {/* Header */}
            <div className="text-center space-y-0.5 border-b border-dashed border-black pb-3">
              <h3 className="font-bold text-[14px] leading-tight uppercase font-sans">
                {storeName}
              </h3>
              <p className="text-[10px] text-gray-600">{address}</p>
              <p className="text-[10px] font-bold">Hotline: {phone}</p>
              <div className="pt-2">
                <span className="font-bold text-[13px] uppercase">HÓA ĐƠN BÁN LẺ VẬT TƯ</span>
                <p className="text-[10px] text-gray-500">Số: #POS-20261017-09 • 17/10/2026 09:15</p>
                <p className="text-[10px]">Thu ngân: Minh Anh (Kỹ sư)</p>
              </div>
            </div>

            {/* Customer Info */}
            <div className="text-[11px] space-y-0.5 border-b border-dashed border-black pb-2">
              <p>Khách hàng: <strong>Anh Ba Hùng</strong> (0918.455.789)</p>
              <p>Ao nhận: <strong>Ao Số 1 (Lót bạt 3.000m²)</strong></p>
              <p>Hình thức: <strong>GHI NỢ VỤ NUÔI</strong></p>
            </div>

            {/* Line Items */}
            <div className="space-y-1.5 border-b border-dashed border-black pb-2">
              <div className="flex justify-between font-bold text-[11px]">
                <span>Tên hàng</span>
                <span>T.Tiền</span>
              </div>

              <div>
                <div className="flex justify-between font-medium">
                  <span>1. Yucca Cấp Tốc 1L (2 Chai)</span>
                  <span>560.000₫</span>
                </div>
                {showBatchInfo && (
                  <p className="text-[9px] text-gray-500 pl-2">Lô: YC-202610-01 • HSD: 15/10/2027</p>
                )}
              </div>

              <div>
                <div className="flex justify-between font-medium">
                  <span>2. Khoáng Tạt Cứng Vỏ (1 Bao)</span>
                  <span>420.000₫</span>
                </div>
                {showBatchInfo && (
                  <p className="text-[9px] text-gray-500 pl-2">Lô: MIN-2026-03 • HSD: 01/01/2028</p>
                )}
              </div>

              <div>
                <div className="flex justify-between font-medium">
                  <span>3. Thức Ăn Tôm Số 2 (1 Bao 25kg)</span>
                  <span>680.000₫</span>
                </div>
                {showBatchInfo && (
                  <p className="text-[9px] text-gray-500 pl-2">Lô: FEED-CP-892 • HSD: 12/04/2027</p>
                )}
              </div>
            </div>

            {/* Total Calculation */}
            <div className="space-y-1 border-b border-dashed border-black pb-2 text-[11px]">
              <div className="flex justify-between">
                <span>Tạm tính (4 món):</span>
                <span>1.660.000₫</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Chiết khấu chủ đầm VIP:</span>
                <span>-50.000₫</span>
              </div>
              <div className="flex justify-between font-bold text-[13px] pt-1">
                <span>TỔNG ĐƠN NÀY:</span>
                <span>1.610.000₫</span>
              </div>
            </div>

            {/* Aquaculture Debt Tracking Info */}
            {showCustomerDebt && (
              <div className="p-2 bg-gray-100 rounded border border-gray-300 text-[10px] space-y-0.5">
                <p className="font-bold uppercase text-center border-b border-gray-300 pb-0.5">
                  THEO DÕI NỢ VỤ NUÔI
                </p>
                <div className="flex justify-between">
                  <span>Dư nợ đầu kỳ:</span>
                  <span>68.500.000₫</span>
                </div>
                <div className="flex justify-between">
                  <span>Cộng đơn hàng này:</span>
                  <span>+1.610.000₫</span>
                </div>
                <div className="flex justify-between font-bold text-black border-t border-gray-300 pt-0.5">
                  <span>DƯ NỢ CUỐI VỤ CẦN TRẢ:</span>
                  <span>70.110.000₫</span>
                </div>
              </div>
            )}

            {/* VietQR Code on Bill */}
            {showVietQr && (
              <div className="text-center pt-1 flex flex-col items-center">
                <div className="w-24 h-24 border border-black p-1 rounded flex items-center justify-center">
                  <svg className="w-20 h-20 text-black" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M2 2h7v7H2V2zm2 2v3h3V4H4zm5 0h2v2H9V4zm2 2h2v2h-2V6zm2-2h2v2h-2V4zm2 0h7v7h-7V2zm2 2v3h3V4h-3zm-6 7h2v2h-2v-2zm-3 2H2v7h7v-7zm-2 2v3H4v-3h3zm5 0h2v3h-2v-3zm3 2h2v2h-2v-2zm2-2h2v2h-2v-2zm-2 4h4v3h-4v-3zm6-2h2v5h-2v-5zm0-4h2v2h-2v-2z"></path>
                  </svg>
                </div>
                <span className="text-[9px] text-gray-500 mt-1">
                  Quét VietQR chuyển khoản (VCB 888999)
                </span>
              </div>
            )}

            {/* Footer */}
            <div className="text-center text-[10px] text-gray-600 pt-2 border-t border-dashed border-black">
              <p>{footerNote}</p>
              <p className="mt-1 font-bold text-black">CẢM ƠN QUÝ KHÁCH HÀNG!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
