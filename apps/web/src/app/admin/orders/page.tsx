'use client';

import React, { useState, useEffect } from 'react';
import { Icon, Badge, Button, BentoCard, useToast } from '@/components/ui';
import { API_BASE_URL } from '@/lib/api';
import { formatVND, formatDateTime } from '@/lib/format';

interface OrderItem {
  id: string;
  unitName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  product?: {
    name: string;
    sku: string;
  };
  batch?: {
    batchNumber: string;
    expiryDate: string;
  };
}

interface OrderRecord {
  id: string;
  orderNumber: string;
  createdAt: string;
  status: 'COMPLETED' | 'CANCELLED' | 'PENDING';
  paymentMethod: 'CASH' | 'VIETQR' | 'CREDIT_SEASON' | 'BANK_TRANSFER' | 'CREDIT_CARD';
  subtotal: number;
  discountAmount: number;
  totalAmount: number;
  notes?: string;
  customer?: {
    name: string;
    phone: string;
    tier?: string;
  };
  pond?: {
    name: string;
  };
  staff?: {
    name: string;
    role?: string;
  };
  items: OrderItem[];
}

export default function AdminOrdersPage() {
  const toast = useToast();
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('ALL');
  const [selectedOrder, setSelectedOrder] = useState<OrderRecord | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/orders`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setOrders(data);
        }
      }
    } catch (err) {
      console.warn('API error, using cached orders');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesPayment = paymentFilter === 'ALL' || o.paymentMethod === paymentFilter;
    const matchesSearch =
      searchQuery === '' ||
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.customer?.name && o.customer.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (o.customer?.phone && o.customer.phone.includes(searchQuery)) ||
      (o.pond?.name && o.pond.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesPayment && matchesSearch;
  });

  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const creditSeasonTotal = orders
    .filter((o) => o.paymentMethod === 'CREDIT_SEASON')
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const vietQrTotal = orders
    .filter((o) => o.paymentMethod === 'VIETQR')
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  const getPaymentBadge = (method: string) => {
    switch (method) {
      case 'CREDIT_SEASON':
        return <Badge variant="warning" size="sm">Bán Nợ Vụ Nuôi</Badge>;
      case 'VIETQR':
        return <Badge variant="primary" size="sm">VietQR Napas247</Badge>;
      case 'CASH':
        return <Badge variant="success" size="sm">Tiền Mặt</Badge>;
      default:
        return <Badge variant="secondary" size="sm">{method}</Badge>;
    }
  };

  const handlePrintReceipt = (order: OrderRecord) => {
    setSelectedOrder(order);
    setShowReceiptModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline-sm text-headline-lg font-bold text-on-surface">
            Quản Lý Đơn Hàng &amp; Hóa Đơn Bán Lẻ POS
          </h1>
          <p className="text-body-sm text-outline">
            Chi tiết từng hóa đơn, số lô hàng xuất kho, sổ nợ chủ đầm và in lại hóa đơn nhiệt K80
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" icon="refresh" loading={isLoading} onClick={fetchOrders}>
            Làm mới danh sách
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <BentoCard>
          <span className="text-label-sm uppercase text-outline font-bold tracking-wider block">
            Tổng giá trị đơn hàng
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-display text-headline-lg font-black text-primary">
              {formatVND(totalRevenue)}
            </span>
            <Badge variant="primary" size="sm">{orders.length} đơn</Badge>
          </div>
          <span className="text-[11px] text-outline mt-1 block">
            Tất cả kênh bán lẻ và xuất đầm
          </span>
        </BentoCard>

        <BentoCard>
          <span className="text-label-sm uppercase text-tertiary font-bold tracking-wider block">
            Doanh số nợ vụ nuôi (Chủ đầm)
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-display text-headline-lg font-black text-tertiary">
              {formatVND(creditSeasonTotal)}
            </span>
            <Badge variant="warning" size="sm">Ghi sổ vụ</Badge>
          </div>
          <span className="text-[11px] text-tertiary mt-1 block">
            Thức ăn và thuốc định kỳ ao tôm
          </span>
        </BentoCard>

        <BentoCard>
          <span className="text-label-sm uppercase text-secondary font-bold tracking-wider block">
            Thanh toán VietQR Napas247
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-display text-headline-lg font-black text-secondary">
              {formatVND(vietQrTotal)}
            </span>
            <Badge variant="success" size="sm">Tài khoản VCB</Badge>
          </div>
          <span className="text-[11px] text-secondary mt-1 block">
            Chuyển khoản trực tiếp qua mã QR
          </span>
        </BentoCard>

        <BentoCard>
          <span className="text-label-sm uppercase text-outline font-bold tracking-wider block">
            Tỷ lệ hoàn thành đơn
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-display text-headline-lg font-black text-on-surface">
              100%
            </span>
            <span className="font-mono text-secondary font-bold text-label-sm">
              0 đơn hủy
            </span>
          </div>
          <span className="text-[11px] text-outline mt-1 block">
            Đã trừ tồn kho theo số lô FEFO
          </span>
        </BentoCard>
      </div>

      {/* Main Order Table Container */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-sm overflow-hidden">
        {/* Filter Bar */}
        <div className="p-4 border-b border-outline-variant/20 bg-surface-container-low/40 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Icon name="search" className="absolute left-3 top-2.5 text-outline text-[18px]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm mã hóa đơn, chủ đầm, SĐT..."
              className="w-full h-10 pl-9 pr-3 rounded-xl bg-surface-container-lowest text-body-sm text-on-surface border border-outline-variant/40 focus:outline-none focus:border-primary"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="h-10 px-3 rounded-xl bg-surface-container-lowest text-label-sm border border-outline-variant/40 text-on-surface outline-none"
            >
              <option value="ALL">Tất cả hình thức thanh toán</option>
              <option value="CREDIT_SEASON">Bán nợ vụ nuôi</option>
              <option value="VIETQR">Chuyển khoản VietQR</option>
              <option value="CASH">Tiền mặt tại quầy</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-body-sm min-w-[800px]">
            <thead>
              <tr className="bg-surface-container-low text-outline uppercase text-[11px] font-bold select-none border-b border-outline-variant/20">
                <th className="py-3 px-4">Mã Hóa Đơn</th>
                <th className="py-3 px-3">Thời Gian</th>
                <th className="py-3 px-4">Khách Hàng / Ao Nuôi</th>
                <th className="py-3 px-3">Phương Thức</th>
                <th className="py-3 px-3 text-center">Số Mặt Hàng</th>
                <th className="py-3 px-4 text-right font-bold text-primary">Tổng Tiền</th>
                <th className="py-3 px-3 text-center">Nhân Viên</th>
                <th className="py-3 px-4 text-center">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/15">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-outline">
                    <Icon name="sync" className="animate-spin text-[24px] inline-block mb-2" />
                    <p>Đang tải danh sách hóa đơn từ Database...</p>
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-outline">
                    <p className="font-semibold text-on-surface">Chưa có đơn hàng nào trong cơ sở dữ liệu</p>
                    <p className="text-body-sm text-outline mt-1">
                      Đơn hàng tạo từ màn hình POS Terminal sẽ lưu trữ vĩnh viễn trên PostgreSQL và hiển thị tại đây.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const formattedDate = order.createdAt ? new Date(order.createdAt).toLocaleString('vi-VN') : '';
                  return (
                    <tr key={order.id} className="hover:bg-surface-container-low/60 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-primary text-label-md">
                          #{order.orderNumber}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-xs text-outline font-mono">
                        {formattedDate}
                      </td>
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-semibold text-on-surface text-label-sm">
                        {order.customer?.name || 'Khách Vãng Lai'}
                      </p>
                      {order.customer?.phone && (
                        <p className="text-[11px] text-outline font-mono">{order.customer.phone}</p>
                      )}
                      {order.pond?.name && (
                        <p className="text-[10px] text-tertiary flex items-center gap-0.5 mt-0.5">
                          <Icon name="water" className="text-[12px]" />
                          {order.pond.name}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    {getPaymentBadge(order.paymentMethod)}
                  </td>
                  <td className="py-3 px-3 text-center font-semibold">
                    {order.items?.length || 0} món
                  </td>
                  <td className="py-3 px-4 text-right font-tabular-stat font-bold text-headline-sm text-emerald-600">
                    {formatVND(order.totalAmount)}
                  </td>
                  <td className="py-3 px-3 text-center text-xs text-on-surface-variant">
                    {order.staff?.name || 'KS. Minh Anh'}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setSelectedOrder(order)}
                        className="p-1.5 rounded-lg hover:bg-surface-container text-primary transition-colors"
                        title="Xem chi tiết đơn hàng"
                      >
                        <Icon name="visibility" className="text-[18px]" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePrintReceipt(order)}
                        className="p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant transition-colors"
                        title="In lại hóa đơn K80"
                      >
                        <Icon name="print" className="text-[18px]" />
                      </button>
                    </div>
                  </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && !showReceiptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-surface-container-lowest rounded-3xl shadow-2xl border border-outline-variant/30 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-outline-variant/30 flex items-center justify-between bg-surface-container-low">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                  <Icon name="receipt_long" className="text-[24px]" />
                </div>
                <div>
                  <h3 className="font-bold text-headline-sm text-on-surface">
                    Chi Tiết Hóa Đơn #{selectedOrder.orderNumber}
                  </h3>
                  <p className="text-xs text-outline font-mono">
                    Ngày lập: {selectedOrder.createdAt} • NV: {selectedOrder.staff?.name || 'KS. Minh Anh'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center text-outline transition-colors"
              >
                <Icon name="close" className="text-[20px]" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
              {/* Customer & Pond Info */}
              <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/30 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-outline block">Khách hàng / Chủ hộ nuôi:</span>
                  <span className="font-bold text-on-surface text-label-md">
                    {selectedOrder.customer?.name || 'Khách lẻ vãng lai'}
                  </span>
                  {selectedOrder.customer?.phone && (
                    <p className="text-outline font-mono mt-0.5">{selectedOrder.customer.phone}</p>
                  )}
                </div>
                <div>
                  <span className="text-outline block">Hình thức thanh toán:</span>
                  <div className="mt-1">{getPaymentBadge(selectedOrder.paymentMethod)}</div>
                  {selectedOrder.pond?.name && (
                    <p className="text-tertiary mt-1 font-semibold flex items-center gap-1">
                      <Icon name="water" className="text-[13px]" />
                      {selectedOrder.pond.name}
                    </p>
                  )}
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-outline uppercase tracking-wider">
                  Danh mục hàng hóa xuất kho ({selectedOrder.items?.length || 0} món)
                </h4>
                <div className="border border-outline-variant/30 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-surface-container-low text-outline font-semibold border-b border-outline-variant/20">
                        <th className="p-2.5">Sản Phẩm &amp; Lô</th>
                        <th className="p-2.5 text-center">ĐVT</th>
                        <th className="p-2.5 text-center">SL</th>
                        <th className="p-2.5 text-right">Đơn Giá</th>
                        <th className="p-2.5 text-right">Thành Tiền</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/15">
                      {selectedOrder.items?.map((it, idx) => (
                        <tr key={idx} className="hover:bg-surface-container-low/40">
                          <td className="p-2.5">
                            <span className="font-semibold text-on-surface block">
                              {it.product?.name || `Mặt hàng #${idx + 1}`}
                            </span>
                            {it.batch?.batchNumber && (
                              <span className="text-[10px] text-outline font-mono">
                                Lô: {it.batch.batchNumber} (HSD: {it.batch.expiryDate || 'N/A'})
                              </span>
                            )}
                          </td>
                          <td className="p-2.5 text-center font-medium">{it.unitName}</td>
                          <td className="p-2.5 text-center font-bold">{it.quantity}</td>
                          <td className="p-2.5 text-right font-mono">{formatVND(it.unitPrice)}</td>
                          <td className="p-2.5 text-right font-bold text-on-surface">
                            {formatVND(it.totalPrice)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Order Financials */}
              <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/30 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-outline">Tiền hàng:</span>
                  <span className="font-semibold text-on-surface">{formatVND(selectedOrder.subtotal)}</span>
                </div>
                {selectedOrder.discountAmount > 0 && (
                  <div className="flex justify-between text-secondary">
                    <span>Chiết khấu:</span>
                    <span>-{formatVND(selectedOrder.discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-1 border-t border-outline-variant/20 text-label-md font-bold text-on-surface">
                  <span>Tổng tiền thanh toán:</span>
                  <span className="text-headline-sm font-black text-emerald-600">
                    {formatVND(selectedOrder.totalAmount)}
                  </span>
                </div>
              </div>

              {selectedOrder.notes && (
                <p className="text-xs text-outline italic">
                  Ghi chú đơn: {selectedOrder.notes}
                </p>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-outline-variant/20 bg-surface-container-low flex justify-between gap-3">
              <Button variant="outline" onClick={() => setSelectedOrder(null)}>
                Đóng
              </Button>
              <Button
                variant="primary"
                icon="print"
                onClick={() => setShowReceiptModal(true)}
              >
                In Lại Hóa Đơn Nhiệt K80
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* K80 Thermal Receipt Modal */}
      {showReceiptModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white text-black rounded-2xl shadow-2xl p-6 space-y-4 max-h-[95vh] overflow-y-auto">
            {/* Thermal Receipt Header */}
            <div className="text-center space-y-1 border-b border-dashed border-gray-400 pb-3">
              <h2 className="font-black text-lg tracking-wider">OMNIPOS AQUA</h2>
              <p className="text-xs text-gray-600">Vật Tư &amp; Thuốc Thủy Sản Nam Bộ</p>
              <p className="text-xs text-gray-500">Đ/C: TX. Giá Rai, Tỉnh Bạc Liêu</p>
              <p className="text-xs text-gray-500">Hotline: 0918.112.233</p>
              <div className="pt-2 font-bold text-sm uppercase">HÓA ĐƠN BÁN HÀNG</div>
              <p className="text-[11px] font-mono text-gray-600">Số: #{selectedOrder.orderNumber}</p>
              <p className="text-[11px] font-mono text-gray-500">{selectedOrder.createdAt}</p>
            </div>

            {/* Customer Details */}
            <div className="text-xs space-y-0.5 border-b border-dashed border-gray-400 pb-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Khách hàng:</span>
                <span className="font-bold">{selectedOrder.customer?.name || 'Khách lẻ'}</span>
              </div>
              {selectedOrder.pond?.name && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Ao nuôi:</span>
                  <span className="font-medium truncate max-w-[180px]">{selectedOrder.pond.name}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">Thanh toán:</span>
                <span className="font-bold">{selectedOrder.paymentMethod}</span>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="border-b border-dashed border-gray-400 pb-3 space-y-2 text-xs">
              {selectedOrder.items?.map((it, i) => (
                <div key={i} className="space-y-0.5">
                  <div className="font-semibold text-gray-900">
                    {it.product?.name || `Mặt hàng #${i + 1}`}
                  </div>
                  <div className="flex justify-between text-gray-600 text-[11px]">
                    <span>
                      {it.quantity} {it.unitName} x {it.unitPrice.toLocaleString('vi-VN')}₫
                    </span>
                    <span className="font-bold text-black font-mono">
                      {it.totalPrice.toLocaleString('vi-VN')}₫
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="space-y-1 text-xs border-b border-dashed border-gray-400 pb-3">
              <div className="flex justify-between">
                <span>Tiền hàng:</span>
                <span className="font-mono">{formatVND(selectedOrder.subtotal)}</span>
              </div>
              {selectedOrder.discountAmount > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>Chiết khấu:</span>
                  <span className="font-mono">-{formatVND(selectedOrder.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-black pt-1">
                <span>TỔNG CỘNG:</span>
                <span className="font-mono">{formatVND(selectedOrder.totalAmount)}</span>
              </div>
            </div>

            <div className="text-center text-[10px] text-gray-500 space-y-1 pt-1">
              <p>Cảm ơn Quý khách! Chúc bà con vụ mùa bội thu!</p>
              <p className="font-mono">Powered by OmniPOS Aquaculture 2026</p>
            </div>

            {/* Print Buttons */}
            <div className="pt-2 flex gap-2">
              <Button
                variant="outline"
                className="flex-1 text-black border-gray-300"
                onClick={() => setShowReceiptModal(false)}
              >
                Đóng
              </Button>
              <Button
                variant="primary"
                icon="print"
                className="flex-1 bg-black text-white hover:bg-gray-800"
                onClick={() => {
                  window.print();
                  toast.success('Lệnh in thành công', 'Đã chuyển sang máy in nhiệt K80.');
                }}
              >
                In K80 ngay
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
