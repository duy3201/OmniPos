'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Icon, KeycapBadge, Badge, Button, useToast, useNotice } from '@/components/ui';
import { useCartStore } from '@/stores/cartStore';
import { useProductStore, ProductItem } from '@/stores/productStore';
import { useAuthStore } from '@/stores/authStore';
import { useUiStore } from '@/stores/uiStore';
import { useActivityLogStore } from '@/stores/activityLogStore';
import { VietQrPaymentModal } from '@/components/pos/VietQrPaymentModal';
import { BarcodeCameraModal } from '@/components/pos/BarcodeCameraModal';
import { ParkedOrdersModal } from '@/components/pos/ParkedOrdersModal';
import { CustomerSelectModal } from '@/components/pos/CustomerSelectModal';
import { PromotionModal } from '@/components/pos/PromotionModal';
import { PaymentMethod, ProductCategory } from '@omnipos/shared';
import { formatVND, formatDateTime } from '@/lib/format';

export default function PosTerminalPage() {
  const router = useRouter();
  const toast = useToast();
  const { showNotice } = useNotice();
  const { products, loadProducts } = useProductStore();
  const { currentUser, requestManagerOverride } = useAuthStore();
  const { posMobileView, setPosMobileView } = useUiStore();
  const { logAction } = useActivityLogStore();

  const {
    orders,
    activeTab,
    selectedCustomer,
    selectedPondId,
    paymentMethods,
    parkedOrders,
    addToCart,
    updateQuantity,
    removeItem,
    updateUnit,
    setCustomer,
    setPondId,
    setPaymentMethod,
    clearCurrentOrder,
    parkCurrentOrder,
    restoreParkedOrder,
    deleteParkedOrder,
    getSubtotal,
    getDiscount,
    getTotal,
  } = useCartStore();

  useEffect(() => {
    loadProducts();
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [isFastScan, setIsFastScan] = useState(true);
  const [isPaying, setIsPaying] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [showVietQrModal, setShowVietQrModal] = useState(false);
  const [showCameraScanner, setShowCameraScanner] = useState(false);
  const [showParkedModal, setShowParkedModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showPromotionModal, setShowPromotionModal] = useState(false);

  const barcodeInputRef = useRef<HTMLInputElement>(null);

  const currentItems = orders[activeTab] || [];
  const customer = selectedCustomer[activeTab];
  const pondId = selectedPondId[activeTab];
  const currentPaymentMethod = paymentMethods[activeTab] || PaymentMethod.CREDIT_SEASON;

  // Filter products by category and search dynamically from productStore
  const filteredProducts = products.filter((p) => {
    const matchesCat =
      selectedCategory === 'ALL' || p.category === selectedCategory;
    const matchesQuery =
      searchQuery === '' ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.barcode && p.barcode.includes(searchQuery));
    return matchesCat && matchesQuery;
  });

  const handleSaveParkedOrder = () => {
    if (currentItems.length === 0) {
      toast.info('Giỏ hàng trống', 'Không có sản phẩm nào để lưu tạm.');
      return;
    }
    const success = parkCurrentOrder(`Lưu lúc ${new Date().toLocaleTimeString('vi-VN')}`);
    if (success) {
      toast.success('Đã lưu tạm đơn hàng [F8]!', 'Giỏ hàng đã được giải phóng cho khách tiếp theo.');
      logAction({
        staffName: currentUser?.name || 'Nhân viên POS',
        staffRole: currentUser?.roleName || 'Thu Ngân',
        actionType: 'POS_SALE',
        actionName: 'Lưu tạm đơn hàng POS [F8]',
        details: `Đã lưu tạm đơn gồm ${currentItems.length} món (${formatVND(getTotal())}) cho khách: ${customer?.name || 'Khách lẻ'}`,
        status: 'SUCCESS',
      });
    }
  };

  // Global Keyboard Shortcuts (F1 - F9)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F4') {
        e.preventDefault();
        barcodeInputRef.current?.focus();
        barcodeInputRef.current?.select();
      } else if (e.key === 'F9') {
        e.preventDefault();
        handleCompletePayment();
      } else if (e.key === 'F8') {
        e.preventDefault();
        handleSaveParkedOrder();
      } else if (e.key === 'F6') {
        e.preventDefault();
        setShowPromotionModal(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentItems, currentPaymentMethod, customer]);

  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const found = products.find(
      (p) =>
        p.sku.toLowerCase() === searchQuery.toLowerCase() ||
        (p.barcode && p.barcode.toLowerCase() === searchQuery.toLowerCase()) ||
        (p.batchNumber && p.batchNumber.toLowerCase() === searchQuery.toLowerCase())
    );
    if (found) {
      addToCart({
        id: found.id,
        sku: found.sku,
        name: found.name,
        category: found.category,
        unit: found.unit,
        unitPrice: found.unitPrice,
        batchNumber: found.batchNumber,
        expiryDate: found.expiryDate,
        discount: 0,
      });
      setSearchQuery('');
    } else {
      toast.warning(
        'Không tìm thấy sản phẩm',
        `Không có sản phẩm nào khớp với mã vạch hoặc SKU: "${searchQuery}"`,
      );
    }
  };

  const handleCameraProductScanned = (product: ProductItem) => {
    addToCart({
      id: product.id,
      sku: product.sku,
      name: product.name,
      category: product.category,
      unit: product.unit,
      unitPrice: product.unitPrice,
      batchNumber: product.batchNumber,
      expiryDate: product.expiryDate,
      discount: 0,
    });
    logAction({
      staffName: currentUser?.name || 'Nhân viên POS',
      staffRole: currentUser?.roleName || 'Thu Ngân',
      actionType: 'POS_SALE',
      actionName: 'Quét mã vạch camera điện thoại',
      details: `Đã quét và thêm "${product.name}" (${product.unit}) vào giỏ hàng POS`,
      status: 'SUCCESS',
    });
  };

  const executePayment = async () => {
    setIsPaying(true);
    const isCredit = currentPaymentMethod === PaymentMethod.CREDIT_SEASON;
    const totalAmount = getTotal();
    const itemCount = currentItems.length;

    try {
      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: customer?.id || null,
          pondId: pondId || null,
          subtotal: getSubtotal(),
          discountAmount: getDiscount(),
          vatAmount: 0,
          totalAmount,
          paymentMethod: isCredit ? 'CROP_DEBT' : currentPaymentMethod,
          items: currentItems.map((item) => ({
            productId: item.id,
            unitName: item.unit,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.total,
          })),
        }),
      });
      loadProducts();
    } catch (err) {
      console.warn('Orders API error, local fallback:', err);
    }

    setIsPaying(false);
    setPaymentSuccess(true);

    toast.success(
      isCredit ? 'Đã ghi nợ vụ nuôi & In phiếu xuất!' : 'Thanh toán thành công & Đã in bill!',
      isCredit
        ? `Đã ghi nợ ${formatVND(totalAmount)} vào sổ vụ nuôi của ${customer?.name}.`
        : `Đã thu ${formatVND(totalAmount)}. Hóa đơn nhiệt K80 đã được in.`,
    );

    // Audit Log
    logAction({
      staffName: currentUser?.name || 'Nhân viên POS',
      staffRole: currentUser?.roleName || 'Thu Ngân',
      actionType: 'POS_SALE',
      actionName: isCredit ? 'Bán nợ vụ nuôi ao tôm' : 'Bán lẻ POS & In hóa đơn',
      details: `Tổng tiền: ${formatVND(totalAmount)} (${itemCount} mặt hàng). Khách: ${customer?.name || 'Khách lẻ'}. PTTT: ${currentPaymentMethod}`,
      status: 'SUCCESS',
    });

    setTimeout(() => {
      setPaymentSuccess(false);
      clearCurrentOrder();
    }, 1500);
  };

  const handleCompletePayment = () => {
    if (currentItems.length === 0) {
      toast.warning(
        'Giỏ hàng đang trống',
        'Vui lòng chọn hoặc quét mã vạch sản phẩm trước khi thanh toán!',
      );
      return;
    }

    if (currentPaymentMethod === PaymentMethod.VIETQR) {
      setShowVietQrModal(true);
      return;
    }

    if (currentPaymentMethod === PaymentMethod.CREDIT_SEASON) {
      if (!customer) {
        toast.error(
          'Chưa chọn khách hàng',
          'Bán nợ vụ nuôi bắt buộc phải chọn Hộ nuôi / Chủ đầm!',
        );
        return;
      }
      if (customer.currentDebt + getTotal() > customer.creditLimit) {
        if (!currentUser?.canApproveCropDebt) {
          requestManagerOverride(
            `Duyệt xuất nợ vượt hạn mức tín dụng (${formatVND(customer.currentDebt + getTotal())} / HM ${formatVND(customer.creditLimit)}) cho ${customer.name}`,
            () => executePayment(),
          );
          return;
        }
      }
    }

    executePayment();
  };

  const handleVoidOrder = () => {
    if (currentItems.length === 0) {
      toast.info('Giỏ hàng trống', 'Không có mặt hàng nào cần hủy.');
      return;
    }

    const cancelAction = () => {
      logAction({
        staffName: currentUser?.name || 'Nhân viên POS',
        staffRole: currentUser?.roleName || 'Thu Ngân',
        actionType: 'POS_VOID',
        actionName: 'Hủy đơn hàng POS đang thao tác',
        details: `Hủy giỏ hàng gồm ${currentItems.length} mặt hàng, giá trị: ${formatVND(getTotal())}`,
        status: 'SUCCESS',
      });
      clearCurrentOrder();
      toast.info('Đã hủy đơn hàng', 'Toàn bộ mặt hàng trong giỏ đã được xóa.');
    };

    if (!currentUser?.canVoidOrder) {
      requestManagerOverride('Hủy toàn bộ đơn hàng POS đang thao tác', cancelAction);
    } else {
      cancelAction();
    }
  };

  if (currentUser?.role === 'WAREHOUSE_KEEPER') {
    return (
      <div className="h-[calc(100vh-56px)] flex items-center justify-center bg-surface-container-low p-6 select-none">
        <div className="w-full max-w-xl bg-surface-container-lowest rounded-3xl p-8 border border-error/30 shadow-2xl text-center space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-error/10 border-2 border-error/30 text-error flex items-center justify-center mx-auto ring-8 ring-error/10 animate-pulse">
            <Icon name="block" className="text-[44px]" />
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-error/10 text-error text-label-sm font-bold uppercase tracking-wider mb-3">
              <Icon name="gavel" className="text-[16px]" />
              Nguyên Tắc Bất Kiêm Nhiệm • Cấm Bán Hàng
            </div>
            <h2 className="text-headline-md font-bold text-on-surface">
              Thủ Kho Bị Cấm Thao Tác Bán Hàng POS
            </h2>
            <p className="text-body-md text-on-surface-variant mt-2 max-w-md mx-auto leading-relaxed">
              Tài khoản <span className="font-bold text-on-surface">{currentUser.name}</span> (<span className="text-primary font-semibold">{currentUser.roleName}</span>) không có thẩm quyền lập hóa đơn bán lẻ hoặc thu tiền tại Quầy POS theo quy chế an toàn tài chính của cửa hàng.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/30 text-left space-y-2.5 text-label-md">
            <div className="flex items-center justify-between">
              <span className="text-on-surface-variant flex items-center gap-2">
                <Icon name="cancel" className="text-error text-[18px]" />
                Bán hàng quầy &amp; Quét mã thanh toán:
              </span>
              <span className="font-bold text-error">BỊ CẤM</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-on-surface-variant flex items-center gap-2">
                <Icon name="cancel" className="text-error text-[18px]" />
                Thu tiền mặt &amp; Thu nợ vụ nuôi:
              </span>
              <span className="font-bold text-error">BỊ CẤM</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-on-surface-variant flex items-center gap-2">
                <Icon name="check_circle" className="text-emerald-500 text-[18px]" />
                Nhập kho NCC &amp; Thẻ kho bất biến:
              </span>
              <span className="font-bold text-emerald-600">ĐƯỢC PHÉP</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-on-surface-variant flex items-center gap-2">
                <Icon name="check_circle" className="text-emerald-500 text-[18px]" />
                Kiểm kê &amp; Cân bằng tồn kho:
              </span>
              <span className="font-bold text-emerald-600">ĐƯỢC PHÉP</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              variant="outline"
              icon="inventory"
              className="flex-1 h-12 font-bold"
              onClick={() => router.push('/admin/inventory')}
            >
              Về Thẻ Kho &amp; Nhập Hàng
            </Button>
            <Button
              variant="primary"
              icon="switch_account"
              className="flex-1 h-12 font-bold shadow-lg shadow-primary/25"
              onClick={() => {
                useAuthStore.getState().setShowPermissionModal(true);
              }}
            >
              Đổi Sang Tài Khoản Thu Ngân
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-56px)] flex flex-col lg:flex-row overflow-hidden bg-surface-container font-body-md text-on-surface select-none">
      {/* Mobile POS Switcher Tab (Only visible on < lg screens) */}
      <div className="lg:hidden flex items-center bg-surface-container-lowest border-b border-outline-variant/30 p-2 gap-2 shrink-0">
        <button
          type="button"
          onClick={() => setPosMobileView('catalog')}
          className={`flex-1 py-2 px-3 rounded-xl font-bold text-label-md flex items-center justify-center gap-1.5 transition-all ${
            posMobileView === 'catalog'
              ? 'bg-primary text-white shadow-sm'
              : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
          }`}
        >
          <Icon name="inventory_2" className="text-[18px]" />
          <span>Vật Tư &amp; Thuốc</span>
        </button>
        <button
          type="button"
          onClick={() => setPosMobileView('cart')}
          className={`flex-1 py-2 px-3 rounded-xl font-bold text-label-md flex items-center justify-center gap-1.5 transition-all relative ${
            posMobileView === 'cart'
              ? 'bg-primary text-white shadow-sm'
              : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
          }`}
        >
          <Icon name="shopping_cart" className="text-[18px]" />
          <span>Giỏ Hàng</span>
          {currentItems.length > 0 && (
            <span
              className={`px-1.5 py-0.2 rounded-full text-xs font-mono font-bold ${
                posMobileView === 'cart' ? 'bg-white text-primary' : 'bg-primary text-white'
              }`}
            >
              {currentItems.reduce((acc, i) => acc + i.quantity, 0)}
            </span>
          )}
        </button>
      </div>

      {/* ================= LEFT PANEL: CATALOG & FAST SCANNER ================= */}
      <section
        className={`w-full lg:w-[60%] xl:w-[62%] flex-col h-full bg-surface-container-low border-r border-outline-variant/30 ${
          posMobileView === 'catalog' ? 'flex' : 'hidden lg:flex'
        }`}
      >
        {/* 1. Top Search & Barcode Scanner Bar */}
        <div className="p-2 sm:p-space-md bg-surface-container-lowest shadow-sm flex items-center gap-2 sm:gap-space-md z-10">
          <form onSubmit={handleBarcodeSubmit} className="flex-1 relative flex items-center">
            <div className="absolute left-3.5 flex items-center pointer-events-none text-surface-tint">
              <Icon name="barcode_scanner" className="text-[22px]" />
            </div>
            <input
              ref={barcodeInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Quét mã vạch (Barcode), số Lô thuốc hoặc tìm tên, SKU... [F4]"
              className="w-full h-11 pl-11 pr-28 rounded-lg bg-surface-container-lowest text-on-surface text-body-md placeholder:text-outline border border-outline-variant/40 focus:outline-none focus:border-primary focus:shadow-[0_0_0_2px_#004ac6,0_0_12px_rgba(0,74,198,0.2)] transition-all font-body-md"
            />
            <div className="absolute right-2.5 flex items-center gap-1.5">
              <KeycapBadge label="F4" />
            </div>
          </form>

          {/* Camera Barcode Scanner Trigger Button */}
          <button
            type="button"
            onClick={() => setShowCameraScanner(true)}
            className="h-11 px-3 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-label-md font-bold flex items-center gap-1.5 shrink-0 border border-outline-variant/30 transition-transform active:scale-95"
            title="Quét mã vạch trực tiếp bằng camera điện thoại"
          >
            <Icon name="photo_camera" className="text-primary text-[20px]" />
            <span className="hidden sm:inline">Quét Camera</span>
          </button>

          {/* Parked Orders Modal Trigger Button */}
          <button
            type="button"
            onClick={() => setShowParkedModal(true)}
            className={`h-11 px-3 rounded-lg text-label-md font-bold flex items-center gap-1.5 shrink-0 border transition-transform active:scale-95 ${
              parkedOrders.length > 0
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-700 dark:text-amber-300'
                : 'bg-surface-container border-outline-variant/30 text-on-surface-variant hover:bg-surface-container-high'
            }`}
            title="Xem danh sách đơn lưu tạm"
          >
            <Icon name="pause_circle" className="text-[20px]" />
            <span className="hidden sm:inline">Lưu tạm</span>
            {parkedOrders.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-600 text-white text-[11px] font-mono font-bold">
                {parkedOrders.length}
              </span>
            )}
          </button>

          {/* Fast Scan Switch Pill */}
          <label className="hidden md:flex items-center gap-2.5 px-3 py-2 rounded-lg bg-surface-container text-on-surface-variant cursor-pointer hover:bg-surface-container-high transition-colors shrink-0">
            <span className="text-label-md font-label-md text-on-surface flex items-center gap-1">
              <Icon name="bolt" fill className="text-tertiary-container text-[16px]" />
              <span>Quét nhanh</span>
            </span>
            <input
              type="checkbox"
              checked={isFastScan}
              onChange={(e) => setIsFastScan(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-8 h-4.5 bg-outline-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-primary-container relative"></div>
          </label>
        </div>

        {/* 2. Aquaculture Category Filter Bar */}
        <div className="px-space-md py-2 bg-surface-container-lowest border-b border-outline-variant/20 flex items-center gap-space-xs overflow-x-auto text-label-md shrink-0">
          {[
            { id: 'ALL', name: 'Tất cả vật tư', count: products.length },
            { id: ProductCategory.WATER_TREATMENT, name: 'Xử lý nước ao', count: products.filter(p => p.category === ProductCategory.WATER_TREATMENT).length },
            { id: ProductCategory.PROBIOTIC, name: 'Vi sinh đáy', count: products.filter(p => p.category === ProductCategory.PROBIOTIC).length },
            { id: ProductCategory.MINERAL_NUTRITION, name: 'Khoáng tạt', count: products.filter(p => p.category === ProductCategory.MINERAL_NUTRITION).length },
            { id: ProductCategory.AQUA_FEED, name: 'Thức ăn tôm', count: products.filter(p => p.category === ProductCategory.AQUA_FEED).length },
            { id: ProductCategory.ANTIBIOTIC, name: 'Thuốc bổ gan/đặc trị', count: products.filter(p => p.category === ProductCategory.ANTIBIOTIC || (p.category as any) === 'AQUA_MEDICINE').length },
            { id: ProductCategory.EQUIPMENT, name: 'Thiết bị & Test kit', count: products.filter(p => p.category === ProductCategory.EQUIPMENT || (p.category as any) === 'EQUIPMENT_SUPPLIES').length },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg font-label-md shadow-sm whitespace-nowrap transition-transform active:scale-95 flex items-center gap-1.5 ${
                selectedCategory === cat.id
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
              }`}
            >
              <span>{cat.name}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-label-sm ${
                  selectedCategory === cat.id
                    ? 'bg-white/20 text-white'
                    : 'bg-surface-container-high text-outline'
                }`}
              >
                {cat.count}
              </span>
            </button>
          ))}
        </div>

        {/* 3. High-Density Product Bento Grid */}
        <div className="p-2 sm:p-space-md flex-1 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-3 content-start">
          {filteredProducts.map((p) => (
            <div
              key={p.id}
              onClick={() =>
                addToCart({
                  id: p.id,
                  sku: p.sku,
                  name: p.name,
                  category: p.category,
                  unit: p.unit,
                  unitPrice: p.unitPrice,
                  batchNumber: p.batchNumber,
                  expiryDate: p.expiryDate,
                  discount: 0,
                })
              }
              className="group relative flex flex-col justify-between p-3 rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm hover:shadow-md hover:bg-surface-bright hover:border-primary/40 transition-all cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between text-outline text-label-sm font-label-sm mb-1">
                  <span className="flex items-center gap-1 font-mono tracking-wider text-[11px]">
                    <Icon name="qr_code_2" className="text-[14px]" />
                    {p.sku}
                  </span>
                  {p.stock > 10 ? (
                    <Badge variant="success" dot size="sm">
                      Tồn: {p.stock} {p.unit}
                    </Badge>
                  ) : p.stock > 0 ? (
                    <Badge variant="warning" dot size="sm">
                      Sắp hết: {p.stock}
                    </Badge>
                  ) : (
                    <Badge variant="danger" dot size="sm">
                      Hết hàng
                    </Badge>
                  )}
                </div>

                <h3 className="font-headline-sm text-label-md text-on-surface group-hover:text-primary transition-colors line-clamp-2">
                  {p.name}
                </h3>

                {p.batchNumber && (
                  <p className="text-[10px] text-outline mt-1 font-mono">
                    Lô: {p.batchNumber} • HSD: {p.expiryDate}
                  </p>
                )}
              </div>

              <div className="mt-3 pt-2 border-t border-outline-variant/20 flex items-end justify-between">
                <div>
                  <span className="text-[11px] text-outline block">
                    Đơn vị: {p.unit}
                  </span>
                  <span className="font-tabular-stat text-tabular-stat text-primary font-bold">
                    {formatVND(p.unitPrice)}
                  </span>
                </div>
                <div className="w-7 h-7 rounded-lg bg-primary-fixed group-hover:bg-primary group-hover:text-on-primary text-on-primary-fixed flex items-center justify-center transition-colors">
                  <Icon name="add" className="text-[18px]" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile Sticky Cart Bar (Shown when viewing catalog on mobile) */}
        {currentItems.length > 0 && (
          <div className="lg:hidden p-3 bg-surface-container-lowest border-t border-outline-variant/30 shadow-lg flex items-center justify-between gap-3 shrink-0">
            <div>
              <span className="text-[11px] text-outline block">
                Giỏ hàng: {currentItems.reduce((acc, i) => acc + i.quantity, 0)} sản phẩm
              </span>
              <span className="font-bold text-primary text-label-lg font-tabular-stat">
                {formatVND(getTotal())}
              </span>
            </div>
            <Button
              variant="primary"
              icon="arrow_forward"
              onClick={() => setPosMobileView('cart')}
              className="h-10 px-4 font-bold shadow-md shadow-primary/20"
            >
              Xem Giỏ &amp; Thanh Toán
            </Button>
          </div>
        )}
      </section>

      {/* ================= RIGHT PANEL: CART & PAYMENT SETTLEMENT ================= */}
      <section
        className={`w-full lg:w-[40%] xl:w-[38%] flex-col h-full bg-surface-container-lowest ${
          posMobileView === 'cart' ? 'flex' : 'hidden lg:flex'
        }`}
      >
        {/* Mobile back to catalog button */}
        <div className="lg:hidden p-2.5 bg-surface-container-low border-b border-outline-variant/20 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={() => setPosMobileView('catalog')}
            className="flex items-center gap-1.5 text-primary text-label-md font-bold hover:underline"
          >
            <Icon name="arrow_back" className="text-[18px]" />
            <span>Tiếp tục chọn hàng</span>
          </button>
          <span className="text-[11px] font-semibold text-outline">
            {currentItems.length} mặt hàng
          </span>
        </div>
        {/* 1. Customer & Pond Credit Header Bar */}
        <div className="p-3 bg-surface-container-low border-b border-outline-variant/30 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xs">
                <Icon name="person" className="text-[16px]" />
              </div>
              <div>
                <p className="font-headline-sm text-label-md text-on-surface leading-tight font-bold">
                  {customer ? customer.name : 'Khách vãng lai mua lẻ'}
                </p>
                {customer && (
                  <p className="text-[11px] text-outline leading-tight font-mono">
                    {customer.phone} • Thẻ {customer.tier} ({customer.points} điểm)
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {customer && (
                <button
                  type="button"
                  onClick={() => {
                    setCustomer(null);
                    setPondId(null);
                  }}
                  className="px-2 py-1 bg-surface-container hover:bg-error-container hover:text-error rounded text-label-sm text-outline font-medium transition-colors"
                  title="Hủy chọn chủ đầm, chuyển về khách lẻ"
                >
                  Bỏ chọn
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowCustomerModal(true)}
                className="px-2 py-1 bg-primary/10 hover:bg-primary/20 rounded text-label-sm text-primary font-medium transition-colors"
              >
                {customer ? 'Đổi khách' : '+ Chọn chủ đầm'}
              </button>
            </div>
          </div>

          {/* Aquaculture Specific: Select Pond & Credit Limit Bar */}
          {customer && (
            <div className="p-2 rounded-lg bg-surface-container-lowest border border-outline-variant/30 flex items-center justify-between text-label-sm">
              <div className="flex items-center gap-1.5 flex-1 min-w-0">
                <Icon name="water" className="text-[16px] text-primary" />
                <span className="text-outline text-[11px]">Ao nhận vật tư:</span>
                <select
                  value={pondId || ''}
                  onChange={(e) => setPondId(e.target.value)}
                  className="bg-transparent font-semibold text-on-surface text-label-sm outline-none cursor-pointer truncate max-w-[170px]"
                >
                  {customer.ponds.map((pond) => (
                    <option key={pond.id} value={pond.id}>
                      {pond.name} ({pond.crop})
                    </option>
                  ))}
                </select>
              </div>

              {/* Debt & Credit Limit Alert */}
              <div className="text-right shrink-0">
                <span className="text-[10px] text-outline block">
                  Dư nợ: {formatVND(customer.currentDebt)}
                </span>
                <span className="text-[10px] font-mono text-secondary font-bold">
                  Hạn mức: {formatVND(customer.creditLimit)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* 2. Cart Items Dense List */}
        <div className="p-space-md flex-1 overflow-y-auto space-y-2">
          {currentItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-outline gap-2">
              <Icon name="shopping_cart" className="text-[48px] text-outline-variant" />
              <p className="text-body-md">Giỏ hàng đang trống</p>
              <p className="text-body-sm text-[12px]">
                Quét mã vạch [F4] hoặc nhấp vào sản phẩm bên trái
              </p>
            </div>
          ) : (
            currentItems.map((item, index) => (
              <div
                key={`${item.id}-${item.unit}`}
                className="p-2.5 rounded-xl bg-surface-container-lowest hover:bg-surface-container-low transition-colors border border-outline-variant/30 shadow-sm flex items-center justify-between gap-2"
              >
                <div className="flex-1 min-w-0">
                  <h4 className="font-headline-sm text-label-md text-on-surface truncate">
                    {index + 1}. {item.name}
                  </h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-body-sm text-outline font-tabular-stat">
                      {formatVND(item.unitPrice)}
                    </span>
                    <span className="text-label-sm text-outline-variant bg-surface-container px-1 rounded font-mono">
                      {item.unit}
                    </span>
                    {item.batchNumber && (
                      <span className="text-[10px] text-primary/80 bg-primary-fixed/40 px-1 rounded font-mono">
                        Lô: {item.batchNumber}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {/* Stepper */}
                  <div className="flex items-center rounded-lg bg-surface-container p-0.5">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, -1)}
                      className="w-6 h-6 rounded flex items-center justify-center text-on-surface-variant hover:bg-surface-container-lowest active:scale-95 transition"
                    >
                      <Icon name="remove" className="text-[14px]" />
                    </button>
                    <span className="w-7 text-center font-tabular-stat text-label-md font-bold text-on-surface">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, 1)}
                      className="w-6 h-6 rounded flex items-center justify-center text-on-surface-variant hover:bg-surface-container-lowest active:scale-95 transition"
                    >
                      <Icon name="add" className="text-[14px]" />
                    </button>
                  </div>

                  {/* Line Total */}
                  <div className="w-24 text-right">
                    <span className="font-tabular-stat text-label-md font-bold text-on-surface">
                      {formatVND(item.total)}
                    </span>
                  </div>

                  {/* Delete Item */}
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="text-outline hover:text-error p-1 rounded transition-colors"
                  >
                    <Icon name="delete" className="text-[18px]" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 3. Checkout & Payment Settlement Section */}
        <div className="p-space-md bg-surface-container-low border-t border-outline-variant/30 flex flex-col gap-2.5">
          {/* Calculation Breakdown */}
          <div className="p-3 rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm space-y-1.5">
            <div className="flex items-center justify-between text-body-sm text-outline">
              <span>Tạm tính ({currentItems.reduce((acc, i) => acc + i.quantity, 0)} sản phẩm)</span>
              <span className="font-tabular-stat text-on-surface font-semibold">
                {formatVND(getSubtotal())}
              </span>
            </div>

            <div
              onClick={() => setShowPromotionModal(true)}
              className="flex items-center justify-between text-body-sm cursor-pointer hover:bg-surface-container/60 p-1.5 -mx-1.5 rounded-lg transition-colors group"
              title="Nhấp để chọn Voucher hoặc giảm % / tiền mặt (Phím F6)"
            >
              <span className="text-secondary flex items-center gap-1.5 font-medium">
                <Icon name="sell" className="text-[16px]" />
                <span>Khuyến mãi / Chiết khấu</span>
                <span className="px-1.5 py-0.2 rounded bg-secondary/15 text-[10px] font-mono text-secondary font-bold group-hover:bg-secondary group-hover:text-white transition-colors">
                  F6
                </span>
              </span>
              <span className="font-tabular-stat text-secondary font-bold flex items-center gap-1">
                <span>-{formatVND(getDiscount())}</span>
                <Icon name="edit" className="text-[13px] opacity-70 group-hover:opacity-100 transition-opacity" />
              </span>
            </div>

            <div className="pt-2 border-t border-outline-variant/20 flex items-baseline justify-between">
              <div>
                <span className="font-headline-sm text-label-md text-on-surface block uppercase tracking-wider font-bold">
                  Khách cần trả
                </span>
                <span className="text-label-sm text-outline font-label-sm">
                  Đã bao gồm thuế & hỗ trợ kỹ thuật ao
                </span>
              </div>
              <div className="text-right">
                <span className="font-display text-headline-lg text-primary font-black tabular-nums tracking-tight">
                  {formatVND(getTotal())}
                </span>
              </div>
            </div>
          </div>

          {/* 4 Payment Method Tabs (Includes Bán Nợ Vụ Nuôi!) */}
          <div className="grid grid-cols-4 gap-1.5">
            {/* Tab 1: VietQR */}
            <button
              type="button"
              onClick={() => setPaymentMethod(PaymentMethod.VIETQR)}
              className={`py-2 px-1 rounded-lg text-label-sm font-semibold transition flex flex-col items-center justify-center gap-0.5 ${
                currentPaymentMethod === PaymentMethod.VIETQR
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
              }`}
            >
              <Icon name="qr_code_scanner" className="text-[16px]" />
              <span>VietQR</span>
            </button>

            {/* Tab 2: Tiền mặt */}
            <button
              type="button"
              onClick={() => setPaymentMethod(PaymentMethod.CASH)}
              className={`py-2 px-1 rounded-lg text-label-sm font-semibold transition flex flex-col items-center justify-center gap-0.5 ${
                currentPaymentMethod === PaymentMethod.CASH
                  ? 'bg-secondary text-on-secondary shadow-sm'
                  : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
              }`}
            >
              <Icon name="payments" className="text-[16px]" />
              <span>Tiền mặt</span>
            </button>

            {/* Tab 3: Quẹt thẻ */}
            <button
              type="button"
              onClick={() => setPaymentMethod(PaymentMethod.CARD)}
              className={`py-2 px-1 rounded-lg text-label-sm font-semibold transition flex flex-col items-center justify-center gap-0.5 ${
                currentPaymentMethod === PaymentMethod.CARD
                  ? 'bg-primary-container text-white shadow-sm'
                  : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
              }`}
            >
              <Icon name="credit_card" className="text-[16px]" />
              <span>Quẹt thẻ</span>
            </button>

            {/* Tab 4: BÁN NỢ VỤ NUÔI (AQUACULTURE CREDIT) */}
            <button
              type="button"
              onClick={() => setPaymentMethod(PaymentMethod.CREDIT_SEASON)}
              className={`py-2 px-1 rounded-lg text-label-sm font-semibold transition flex flex-col items-center justify-center gap-0.5 ${
                currentPaymentMethod === PaymentMethod.CREDIT_SEASON
                  ? 'bg-tertiary-container text-on-tertiary-container shadow-sm ring-2 ring-tertiary'
                  : 'bg-tertiary-fixed/60 hover:bg-tertiary-fixed text-on-tertiary-container'
              }`}
            >
              <Icon name="credit_score" className="text-[16px]" />
              <span>Bán Nợ Vụ</span>
            </button>
          </div>

          {/* Dynamic Payment State Box */}
          {currentPaymentMethod === PaymentMethod.CREDIT_SEASON ? (
            <div className="p-2.5 rounded-xl bg-tertiary-fixed/40 border border-tertiary/30 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-tertiary text-on-tertiary flex items-center justify-center shrink-0">
                  <Icon name="assignment" className="text-[18px]" />
                </div>
                <div>
                  <p className="font-headline-sm text-label-md text-on-surface font-bold">
                    Ký nhận nợ vụ nuôi: {customer ? customer.name : 'Chưa chọn chủ đầm'}
                  </p>
                  <p className="text-[11px] text-outline font-mono">
                    Hóa đơn này sẽ được cộng dồn vào sổ cái nợ cuối vụ
                  </p>
                </div>
              </div>
              <Badge variant="warning">Nợ gối đầu</Badge>
            </div>
          ) : currentPaymentMethod === PaymentMethod.VIETQR ? (
            <div className="p-2.5 rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm flex items-center gap-3 relative overflow-hidden">
              <div className="relative shrink-0 w-16 h-16 bg-white p-1 rounded-lg shadow-sm flex items-center justify-center border border-outline-variant/20">
                {/* SVG VietQR Blueprint */}
                <svg className="w-14 h-14 text-inverse-surface" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M2 2h7v7H2V2zm2 2v3h3V4H4zm5 0h2v2H9V4zm2 2h2v2h-2V6zm2-2h2v2h-2V4zm2 0h7v7h-7V2zm2 2v3h3V4h-3zm-6 7h2v2h-2v-2zm-3 2H2v7h7v-7zm-2 2v3H4v-3h3zm5 0h2v3h-2v-3zm3 2h2v2h-2v-2zm2-2h2v2h-2v-2zm-2 4h4v3h-4v-3zm6-2h2v5h-2v-5zm0-4h2v2h-2v-2z"></path>
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-secondary text-label-sm font-label-md">
                    <span className="w-2 h-2 rounded-full bg-secondary animate-ping"></span>
                    <span>Sẵn sàng nhận tiền</span>
                  </div>
                  <span className="text-tertiary font-tabular-stat text-[11px] font-bold bg-tertiary-fixed px-1.5 py-0.2 rounded">
                    02:45s
                  </span>
                </div>
                <p className="font-headline-sm text-label-md text-on-surface font-bold mt-0.5 truncate">
                  Chờ quét: {formatVND(getTotal())}
                </p>
                <p className="text-[11px] text-outline truncate mt-0.5">
                  Khớp tự động • Napas247 • VCB Thủy Sản 888999
                </p>
              </div>
            </div>
          ) : null}

          {/* Giant Bottom Operational Actions */}
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleVoidOrder}
              className={`w-[22%] h-12 rounded-xl border border-rose-500/30 hover:bg-rose-500/10 text-rose-700 font-headline-sm text-label-md transition flex items-center justify-center gap-1 active:scale-95 ${
                !currentUser?.canVoidOrder ? 'opacity-85' : ''
              }`}
              title={
                !currentUser?.canVoidOrder
                  ? 'Tác vụ bị cấm đối với Thu ngân. Bấm để yêu cầu Quản lý quét mã PIN'
                  : 'Hủy toàn bộ đơn hàng hiện tại'
              }
            >
              <Icon
                name={!currentUser?.canVoidOrder ? 'lock' : 'delete_forever'}
                className="text-[18px]"
              />
              <span className="truncate">{!currentUser?.canVoidOrder ? 'Hủy [QL]' : 'Hủy đơn'}</span>
            </button>

            <button
              type="button"
              onClick={handleSaveParkedOrder}
              className="w-[26%] h-12 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-headline-sm text-label-md transition flex items-center justify-center gap-1 active:scale-95"
            >
              <Icon name="pause_circle" className="text-[18px]" />
              <span>Lưu tạm</span>
              <KeycapBadge label="F8" />
            </button>

            <button
              type="button"
              disabled={isPaying || paymentSuccess}
              onClick={handleCompletePayment}
              className={`w-[52%] h-12 rounded-xl text-on-secondary font-headline-sm text-headline-sm shadow-lg flex items-center justify-center gap-2 transition active:scale-[0.99] ${
                paymentSuccess
                  ? 'bg-secondary'
                  : currentPaymentMethod === PaymentMethod.CREDIT_SEASON
                  ? 'bg-tertiary-container hover:bg-tertiary text-white shadow-tertiary/20'
                  : 'bg-secondary hover:bg-on-secondary-container shadow-secondary/20'
              }`}
            >
              {isPaying ? (
                <>
                  <Icon name="refresh" className="text-[20px] animate-spin" />
                  <span>ĐANG IN HÓA ĐƠN K80...</span>
                </>
              ) : paymentSuccess ? (
                <>
                  <Icon name="check_circle" className="text-[20px]" />
                  <span>HOÀN TẤT &amp; ĐÃ IN BILL!</span>
                </>
              ) : (
                <>
                  <Icon name="print_connect" className="text-[20px]" />
                  <span>
                    {currentPaymentMethod === PaymentMethod.CREDIT_SEASON
                      ? 'XÁC NHẬN NỢ & IN PHIẾU'
                      : currentPaymentMethod === PaymentMethod.VIETQR
                      ? 'MÃ VIETQR & IN BILL'
                      : 'THANH TOÁN & IN BILL'}
                  </span>
                  <KeycapBadge label="F9" variant="dark" />
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* Dynamic VietQR Payment Modal */}
      <VietQrPaymentModal
        isOpen={showVietQrModal}
        onClose={() => setShowVietQrModal(false)}
        totalAmount={getTotal()}
        customerName={customer ? customer.name : 'Khách lẻ'}
        onConfirmSuccess={executePayment}
      />

      {/* Camera Barcode Scanner Modal */}
      <BarcodeCameraModal
        isOpen={showCameraScanner}
        onClose={() => setShowCameraScanner(false)}
        products={products}
        onProductScanned={handleCameraProductScanned}
      />

      {/* Parked Orders Modal */}
      <ParkedOrdersModal
        isOpen={showParkedModal}
        onClose={() => setShowParkedModal(false)}
      />

      {/* Real Customer Select Modal */}
      <CustomerSelectModal
        isOpen={showCustomerModal}
        onClose={() => setShowCustomerModal(false)}
        onSelectCustomer={(c) => {
          setCustomer(c);
          if (c && c.ponds && c.ponds.length > 0) {
            setPondId(c.ponds[0].id);
          } else {
            setPondId(null);
          }
        }}
      />

      {/* Promotion & Discount Modal (F6) */}
      <PromotionModal
        isOpen={showPromotionModal}
        onClose={() => setShowPromotionModal(false)}
      />
    </div>
  );
}
