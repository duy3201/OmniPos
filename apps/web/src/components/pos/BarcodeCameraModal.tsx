'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Icon, Button, useToast } from '@/components/ui';
import { ProductItem } from '@/stores/productStore';

interface BarcodeCameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: ProductItem[];
  onProductScanned: (product: ProductItem) => void;
}

export const BarcodeCameraModal: React.FC<BarcodeCameraModalProps> = ({
  isOpen,
  onClose,
  products,
  onProductScanned,
}) => {
  const toast = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [hasCamera, setHasCamera] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [manualBarcode, setManualBarcode] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [lastScanned, setLastScanned] = useState<string | null>(null);

  // Sound beep on success scan
  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1046.5, audioCtx.currentTime); // C6 note
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.12);
    } catch (e) {
      // AudioContext might be restricted until user interaction
    }
  };

  const startCamera = async () => {
    setErrorMessage(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setHasCamera(false);
        setErrorMessage('Trình duyệt không hỗ trợ truy cập máy ảnh.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setHasCamera(true);
        setIsScanning(true);
      }
    } catch (err: any) {
      console.warn('Camera error:', err);
      setHasCamera(false);
      if (err.name === 'NotAllowedError') {
        setErrorMessage('Bạn đã từ chối quyền truy cập máy ảnh. Vui lòng cho phép quyền trong cài đặt trình duyệt.');
      } else {
        setErrorMessage('Không thể khởi động máy ảnh. Bạn có thể nhập mã vạch thủ công bên dưới.');
      }
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  // Barcode detection loop using native BarcodeDetector if available
  useEffect(() => {
    if (!isOpen || !isScanning) return;

    let animationFrameId: number;
    let detector: any = null;

    if ('BarcodeDetector' in window) {
      try {
        detector = new (window as any).BarcodeDetector({
          formats: ['ean_13', 'ean_8', 'code_128', 'code_39', 'qr_code', 'upc_a', 'upc_e'],
        });
      } catch (e) {
        detector = null;
      }
    }

    const scanFrame = async () => {
      if (!videoRef.current || videoRef.current.readyState < 2) {
        animationFrameId = requestAnimationFrame(scanFrame);
        return;
      }

      if (detector) {
        try {
          const barcodes = await detector.detect(videoRef.current);
          if (barcodes.length > 0) {
            const rawValue = barcodes[0].rawValue;
            if (rawValue && rawValue !== lastScanned) {
              handleBarcodeDetected(rawValue);
            }
          }
        } catch (e) {
          // ignore detection error per frame
        }
      }

      animationFrameId = requestAnimationFrame(scanFrame);
    };

    animationFrameId = requestAnimationFrame(scanFrame);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isOpen, isScanning, lastScanned, products]);

  const handleBarcodeDetected = (code: string) => {
    const trimmed = code.trim();
    setLastScanned(trimmed);
    playBeep();

    const matched = products.find(
      (p) =>
        (p.barcode && p.barcode.toLowerCase() === trimmed.toLowerCase()) ||
        p.sku.toLowerCase() === trimmed.toLowerCase() ||
        (p.conversions && p.conversions.some((c) => c.barcode && c.barcode.toLowerCase() === trimmed.toLowerCase()))
    );

    if (matched) {
      onProductScanned(matched);
      toast.success('Đã thêm sản phẩm!', `${matched.name} (${matched.unit})`);
    } else {
      toast.warning('Mã vạch chưa đăng ký', `Mã vạch: ${trimmed} chưa có trong cơ sở dữ liệu.`);
    }

    // Delay 2.5s before allowing next scan of same barcode
    setTimeout(() => {
      setLastScanned(null);
    }, 2500);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualBarcode.trim()) return;
    handleBarcodeDetected(manualBarcode);
    setManualBarcode('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-surface-container-lowest rounded-3xl shadow-2xl border border-outline-variant/30 overflow-hidden flex flex-col max-h-[95vh]">
        {/* Header */}
        <div className="bg-[#0F172A] text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Icon name="photo_camera" className="text-primary text-[24px]" />
            <div>
              <h3 className="font-bold text-label-lg text-white">Quét Mã Vạch Camera</h3>
              <p className="text-[11px] text-white/70">Hướng camera điện thoại vào mã vạch trên bao bì</p>
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

        {/* Viewfinder View */}
        <div className="relative bg-black h-72 sm:h-80 flex items-center justify-center overflow-hidden">
          {hasCamera !== false ? (
            <>
              <video
                ref={videoRef}
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <canvas ref={canvasRef} className="hidden" />

              {/* Viewfinder Overlay with Red Laser Line */}
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-8">
                <div className="w-64 h-44 sm:w-72 sm:h-48 border-2 border-emerald-400/80 rounded-2xl relative shadow-[0_0_20px_rgba(52,211,153,0.3)] flex items-center justify-center">
                  {/* Corner Markers */}
                  <div className="absolute -top-1 -left-1 w-5 h-5 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg" />
                  <div className="absolute -top-1 -right-1 w-5 h-5 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg" />
                  <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg" />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-4 border-r-4 border-emerald-400 rounded-br-lg" />

                  {/* Pulsing Red Laser Line */}
                  <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent shadow-[0_0_8px_rgba(239,68,68,0.9)] animate-bounce" />

                  <span className="absolute bottom-2 text-[10px] text-white/90 bg-black/60 px-2 py-0.5 rounded-full font-mono">
                    Đặt mã vạch vào khung giữa
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="p-6 text-center text-white space-y-3">
              <Icon name="videocam_off" className="text-[44px] text-white/60 mx-auto" />
              <p className="text-body-sm text-white/80">{errorMessage || 'Không tìm thấy camera.'}</p>
              <Button variant="secondary" size="sm" onClick={startCamera}>
                Thử lại quyền camera
              </Button>
            </div>
          )}

          {lastScanned && (
            <div className="absolute top-3 inset-x-4 bg-emerald-600/90 text-white text-center py-1.5 px-3 rounded-xl text-xs font-bold animate-in fade-in shadow-lg">
              ✓ Đã nhận diện mã: {lastScanned}
            </div>
          )}
        </div>

        {/* Manual Barcode / SKU Fallback Form */}
        <div className="p-4 bg-surface-container-low border-t border-outline-variant/30 space-y-3">
          <form onSubmit={handleManualSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Icon name="barcode" className="absolute left-3 top-2.5 text-outline text-[20px]" />
              <input
                type="text"
                value={manualBarcode}
                onChange={(e) => setManualBarcode(e.target.value)}
                placeholder="Nhập hoặc quét mã vạch bằng tay..."
                className="w-full h-10 pl-9 pr-3 rounded-xl bg-surface-container-lowest text-body-sm text-on-surface border border-outline-variant/40 focus:outline-none focus:border-primary font-mono"
              />
            </div>
            <Button type="submit" variant="primary" icon="search">
              Thêm
            </Button>
          </form>

          <div className="flex items-center justify-between text-xs text-outline pt-1">
            <span>Hỗ trợ EAN-13, Code 128, QR Code bao bì thủy sản</span>
            <Button variant="outline" size="sm" onClick={onClose}>
              Đóng lại
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
