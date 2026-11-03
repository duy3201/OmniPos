'use client';

import React, { useState, useEffect } from 'react';
import { Icon, Button, useToast } from '@/components/ui';

interface VietQrPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalAmount: number;
  orderCode?: string;
  customerName?: string;
  onConfirmSuccess: () => void;
}

export const VietQrPaymentModal: React.FC<VietQrPaymentModalProps> = ({
  isOpen,
  onClose,
  totalAmount,
  orderCode = `HD${Date.now().toString().slice(-6)}`,
  customerName = 'Khách lẻ',
  onConfirmSuccess,
}) => {
  const toast = useToast();
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const bankName = 'Vietcombank';
  const bankFullName = 'Ngân hàng TMCP Ngoại Thương Việt Nam';
  const accountNumber = '0918112233';
  const accountName = 'NGUYEN HOANG NAM';
  const transferContent = `OMNIPOS ${orderCode}`;

  useEffect(() => {
    if (!isOpen) {
      setTimeLeft(300);
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    toast.success('Đã sao chép!', `${fieldName}: ${text}`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleConfirm = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onConfirmSuccess();
      onClose();
    }, 600);
  };

  const qrImageUrl = `https://img.vietqr.io/image/970436-${accountNumber}-compact2.png?amount=${totalAmount}&addInfo=${encodeURIComponent(transferContent)}&accountName=${encodeURIComponent(accountName)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-surface-container-lowest rounded-3xl shadow-2xl border border-outline-variant/30 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-700 to-teal-800 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <Icon name="qr_code_2" className="text-[26px] text-white" />
            </div>
            <div>
              <h3 className="font-bold text-headline-sm text-white">Thanh Toán VietQR Pro</h3>
              <p className="text-xs text-white/80">Quét mã Napas247 tự động nhận tiền</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <Icon name="close" className="text-[18px]" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Amount Highlight */}
          <div className="text-center p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50">
            <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider block">
              Tổng số tiền cần thanh toán
            </span>
            <span className="font-display text-headline-xl font-black text-emerald-700 dark:text-emerald-400 mt-1 block tracking-tight">
              {totalAmount.toLocaleString('vi-VN')}₫
            </span>
            <div className="mt-1 flex items-center justify-center gap-2 text-xs text-on-surface-variant">
              <span>Đơn: <strong className="text-on-surface">{orderCode}</strong></span>
              <span>•</span>
              <span>Khách: <strong className="text-on-surface">{customerName}</strong></span>
            </div>
          </div>

          {/* QR Code Container */}
          <div className="flex flex-col items-center justify-center">
            <div className="p-3 bg-white rounded-2xl shadow-md border border-outline-variant/30 relative group">
              <img
                src={qrImageUrl}
                alt="VietQR Code"
                className="w-56 h-56 sm:w-64 sm:h-64 object-contain rounded-lg"
                onError={(e) => {
                  // Fallback if image proxy is unavailable
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div className="absolute inset-x-0 bottom-1 flex justify-center">
                <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                  Vietcombank Napas247
                </span>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-2 text-xs text-on-surface-variant">
              <Icon name="timer" className="text-[16px] text-primary" />
              <span>Thời gian giữ mã:</span>
              <span className={`font-mono font-bold text-sm ${timeLeft < 60 ? 'text-error animate-pulse' : 'text-primary'}`}>
                {formattedTime}
              </span>
            </div>
          </div>

          {/* Bank Transfer Details Box */}
          <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/30 space-y-2 text-body-sm">
            <div className="flex items-center justify-between">
              <span className="text-outline text-xs">Ngân hàng thụ hưởng:</span>
              <span className="font-bold text-on-surface text-xs">{bankName} ({bankFullName})</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-outline text-xs">Số tài khoản:</span>
              <div className="flex items-center gap-1.5">
                <span className="font-mono font-bold text-headline-sm text-primary">{accountNumber}</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(accountNumber, 'Số tài khoản')}
                  className="p-1 hover:bg-surface-container rounded text-primary text-xs flex items-center gap-0.5"
                  title="Sao chép STK"
                >
                  <Icon name={copiedField === 'Số tài khoản' ? 'check' : 'content_copy'} className="text-[15px]" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-outline text-xs">Chủ tài khoản:</span>
              <span className="font-bold text-on-surface text-xs">{accountName}</span>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-outline-variant/20">
              <span className="text-outline text-xs">Nội dung chuyển khoản:</span>
              <div className="flex items-center gap-1.5">
                <span className="font-mono font-bold text-xs text-secondary bg-secondary-container/40 px-2 py-0.5 rounded">
                  {transferContent}
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(transferContent, 'Nội dung CK')}
                  className="p-1 hover:bg-surface-container rounded text-secondary text-xs"
                  title="Sao chép nội dung"
                >
                  <Icon name={copiedField === 'Nội dung CK' ? 'check' : 'content_copy'} className="text-[15px]" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-surface-container-low border-t border-outline-variant/20 flex items-center justify-between gap-3">
          <Button variant="outline" onClick={onClose} disabled={isProcessing}>
            Đổi hình thức khác
          </Button>
          <Button
            variant="primary"
            icon="verified"
            loading={isProcessing}
            onClick={handleConfirm}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
          >
            Xác nhận đã nhận tiền ({totalAmount.toLocaleString('vi-VN')}₫) [F9]
          </Button>
        </div>
      </div>
    </div>
  );
};
