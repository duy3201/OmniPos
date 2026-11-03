'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Icon, Badge, Button, BentoCard } from '@/components/ui';
import { useProductStore } from '@/stores/productStore';
import { ProductEditModal } from '@/components/inventory/ProductEditModal';
import { BarcodePrintModal, BarcodePrintItem } from '@/components/inventory/BarcodePrintModal';
import { formatVND } from '@/lib/format';

export default function InventoryPage() {
  const { products, loadProducts, newlyAddedId } = useProductStore();
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showStockCardDrawer, setShowStockCardDrawer] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [barcodeItem, setBarcodeItem] = useState<BarcodePrintItem | null>(null);
  const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    if (products.length > 0) {
      if (newlyAddedId) {
        const found = products.find((p) => p.id === newlyAddedId);
        if (found) setSelectedProduct(found);
      } else if (!selectedProduct) {
        setSelectedProduct(products[0]);
      }
    }
  }, [products, newlyAddedId]);



  // Sample Stock Card Timeline (Thẻ kho bất biến)
  const stockCardEntries = [
    {
      id: 'tx-01',
      time: '17/10/2026 09:15:30',
      type: 'BÁN LẺ POS',
      docNo: '#POS-20261017-09',
      staff: 'Minh Anh (Kỹ sư)',
      changeQty: -2,
      balanceAfter: 45,
      note: 'Xuất bán nợ cho Ao số 1 - Chú Ba Hùng',
      badgeColor: 'bg-error-container text-on-error-container',
    },
    {
      id: 'tx-02',
      time: '16/10/2026 14:20:10',
      type: 'NHẬP KHO NCC',
      docNo: '#PO-20261016-04',
      staff: 'Hoàng Nam (Thủ kho)',
      changeQty: +30,
      balanceAfter: 47,
      note: 'Nhập hàng lô mới YC-202610-01 từ Cty Bayer Bio',
      badgeColor: 'bg-secondary-container text-on-secondary-container',
    },
    {
      id: 'tx-03',
      time: '15/10/2026 17:45:00',
      type: 'KIỂM KÊ KHO',
      docNo: '#STK-20261015-01',
      staff: 'Minh Anh (Kiểm kê)',
      changeQty: -1,
      balanceAfter: 17,
      note: 'Khớp sổ kiểm kê cuối ngày, hao hụt 1 chai',
      badgeColor: 'bg-tertiary-fixed text-on-tertiary-container',
    },
    {
      id: 'tx-04',
      time: '14/10/2026 10:05:12',
      type: 'BÁN LẺ POS',
      docNo: '#POS-20261014-44',
      staff: 'Thảo Vy (Thu ngân)',
      changeQty: -5,
      balanceAfter: 18,
      note: 'Xuất bán tiền mặt đầm tôm anh Năm Cà Mau',
      badgeColor: 'bg-error-container text-on-error-container',
    },
  ];

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      searchQuery === '' ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.batchNumber && p.batchNumber.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory =
      filterCategory === 'ALL' || p.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">

      {/* Top Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline-sm text-headline-lg font-bold text-on-surface">
            Quản Lý Sản Phẩm &amp; Tồn Kho Thủy Sản
          </h1>
          <p className="text-body-sm text-outline">
            Sổ cái thẻ kho bất biến (Immutable Stock Card) • Cập nhật biến động theo thời gian thực
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/admin/stocktake/new">
            <Button variant="secondary" icon="fact_check">
              Kiểm kê kho
            </Button>
          </Link>
          <Link href="/admin/purchase/new">
            <Button variant="secondary" icon="local_shipping">
              Nhập hàng NCC
            </Button>
          </Link>
          <Link href="/admin/products/new">
            <Button variant="primary" icon="add">
              + Tạo hàng hóa mới
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Bento Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <BentoCard>
          <span className="text-label-sm uppercase text-outline tracking-wider block font-bold">
            Tổng giá trị vốn tồn kho (MAC)
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-display text-headline-lg font-black text-primary">
              {formatVND(
                products.reduce(
                  (acc, p) => acc + (p.costPrice || Math.round(p.unitPrice * 0.75)) * p.stock,
                  0,
                ),
              )}
            </span>
            <Badge variant="success" size="sm">Đồng bộ DB</Badge>
          </div>
          <span className="text-[11px] text-outline mt-1 block">
            Theo giá vốn bình quân gia quyền di động
          </span>
        </BentoCard>

        <BentoCard>
          <span className="text-label-sm uppercase text-outline tracking-wider block font-bold">
            Tổng mã vật tư thủy sản
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-display text-headline-lg font-black text-on-surface">
              {products.length} <span className="text-sm font-normal text-outline">mặt hàng</span>
            </span>
            <Badge variant="primary" size="sm">Đang kinh doanh</Badge>
          </div>
          <span className="text-[11px] text-outline mt-1 block">
            Thuốc, Men vi sinh, Hóa chất, Thức ăn, Máy móc
          </span>
        </BentoCard>

        <BentoCard>
          <span className="text-label-sm uppercase text-tertiary tracking-wider block font-bold">
            Cảnh báo sắp hết hàng
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-display text-headline-lg font-black text-tertiary">
              {products.filter((p) => p.stock <= 20).length}{' '}
              <span className="text-sm font-normal text-outline">sản phẩm</span>
            </span>
            <Badge variant="warning" dot size="sm">Dưới mức an toàn</Badge>
          </div>
          <span className="text-[11px] text-tertiary mt-1 block">
            Oxy viên, Yucca đậm đặc, Khoáng tạt hạt...
          </span>
        </BentoCard>

        <BentoCard>
          <span className="text-label-sm uppercase text-error tracking-wider block font-bold">
            Hết hàng (Khóa bán POS)
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-display text-headline-lg font-black text-error">
              2 <span className="text-sm font-normal text-outline">mặt hàng</span>
            </span>
            <Badge variant="danger" dot size="sm">Tồn = 0</Badge>
          </div>
          <span className="text-[11px] text-error mt-1 block">
            Cần lên đơn nhập hàng NCC gấp
          </span>
        </BentoCard>
      </div>

      {/* Main Table & Stock Card Drawer Split */}
      <div className="flex flex-col lg:flex-row items-start gap-4">
        {/* Left Side: Product Table (Expands or contracts when Drawer is open) */}
        <div className={`bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-sm overflow-hidden flex flex-col transition-all ${
          showStockCardDrawer ? 'w-full lg:w-[62%]' : 'w-full'
        }`}>
          {/* Filter Bar */}
          <div className="p-3 border-b border-outline-variant/20 bg-surface-container-low/40 flex items-center justify-between gap-3">
            <div className="relative flex-1">
              <Icon name="search" className="absolute left-3 top-2.5 text-outline text-[18px]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm mã SKU, tên thuốc, số lô..."
                className="w-full h-9 pl-9 pr-3 rounded-lg bg-surface-container-lowest text-body-sm text-on-surface border border-outline-variant/30 focus:outline-none focus:border-primary"
              />
            </div>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="h-9 px-3 rounded-lg bg-surface-container-lowest text-label-sm border border-outline-variant/30 text-on-surface outline-none"
            >
              <option value="ALL">Tất cả danh mục</option>
              <option value="WATER_TREATMENT">Xử lý nước ao</option>
              <option value="PROBIOTIC">Men vi sinh</option>
              <option value="MINERAL_NUTRITION">Khoáng tạt</option>
              <option value="AQUA_FEED">Thức ăn tôm</option>
              <option value="ANTIBIOTIC">Thuốc bổ gan/đặc trị</option>
              <option value="EQUIPMENT">Thiết bị</option>
            </select>
          </div>

          {/* Table Data */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-body-sm">
              <thead>
                <tr className="bg-surface-container-low text-outline uppercase text-[11px] font-bold select-none border-b border-outline-variant/20">
                  <th className="py-3 px-3">Tên Hàng Hóa &amp; Số Lô</th>
                  <th className="py-3 px-2 text-center">ĐVT</th>
                  <th className="py-3 px-3 text-right">Giá vốn MAC</th>
                  <th className="py-3 px-3 text-right">Giá bán POS</th>
                  <th className="py-3 px-3 text-right bg-primary-fixed/20 text-primary font-bold">
                    Tồn khả dụng
                  </th>
                  <th className="py-3 px-2 text-center">Trạng thái</th>
                  <th className="py-3 px-3 text-center">Thẻ kho</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/15">
                {filteredProducts.map((prod) => {
                  const isSelected = selectedProduct?.id === prod.id;
                  const isJustAdded = prod.id === newlyAddedId || prod.isNew;
                  return (
                    <tr
                      key={prod.id}
                      onClick={() => {
                        setSelectedProduct(prod);
                        setShowStockCardDrawer(true);
                      }}
                      className={`cursor-pointer transition-colors ${
                        isJustAdded
                          ? 'bg-emerald-500/15 border-l-4 border-emerald-500 font-medium'
                          : isSelected
                            ? 'bg-primary-fixed/30 font-medium'
                            : 'hover:bg-surface-container-low/60'
                      }`}
                    >
                      <td className="py-2.5 px-3">
                        <div className="min-w-[180px]">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-on-surface line-clamp-1">
                              {prod.name}
                            </p>
                            {isJustAdded && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-600 text-white font-bold tracking-wide animate-pulse">
                                MỚI TẠO
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-outline font-mono">
                            <span>{prod.sku}</span>
                            {prod.batchNumber && (
                              <>
                                <span>•</span>
                                <span className="text-primary">Lô: {prod.batchNumber}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-2.5 px-2 text-center font-mono text-[11px]">
                        {prod.unit}
                      </td>

                      <td className="py-2.5 px-3 text-right font-tabular-stat text-outline">
                        {formatVND(Math.round(prod.unitPrice * 0.78))}
                      </td>

                      <td className="py-2.5 px-3 text-right font-tabular-stat text-on-surface font-semibold">
                        {formatVND(prod.unitPrice)}
                      </td>

                      <td className="py-2.5 px-3 text-right font-tabular-stat font-bold text-primary bg-primary-fixed/10">
                        {prod.stock} {prod.unit}
                      </td>

                      <td className="py-2.5 px-2 text-center">
                        {prod.stock > 10 ? (
                          <Badge variant="success" size="sm">Đủ hàng</Badge>
                        ) : prod.stock > 0 ? (
                          <Badge variant="warning" size="sm">Sắp hết</Badge>
                        ) : (
                          <Badge variant="danger" size="sm">Hết hàng</Badge>
                        )}
                      </td>

                      <td className="py-2.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setBarcodeItem({
                                id: prod.id,
                                name: prod.name,
                                sku: prod.sku,
                                barcode: prod.barcode || prod.sku,
                                price: prod.unitPrice,
                                unit: prod.unit,
                                batchNumber: prod.batchNumber,
                                expiryDate: prod.expiryDate,
                              });
                              setIsBarcodeModalOpen(true);
                            }}
                            className="p-1 rounded hover:bg-white text-on-surface hover:text-primary transition-colors"
                            title="In tem mã vạch Barcode"
                          >
                            <Icon name="qr_code_2" className="text-[18px]" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedProduct(prod);
                              setIsEditModalOpen(true);
                            }}
                            className="p-1 rounded hover:bg-white text-secondary transition-colors"
                            title="Chỉnh sửa sản phẩm & biến thể"
                          >
                            <Icon name="edit" className="text-[18px]" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedProduct(prod);
                              setShowStockCardDrawer(true);
                            }}
                            className="p-1 rounded hover:bg-white text-primary transition-colors"
                            title="Xem thẻ kho chi tiết"
                          >
                            <Icon name="history_edu" className="text-[18px]" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Side: Immutable Stock Card Timeline Drawer */}
        {showStockCardDrawer && selectedProduct && (
          <div className="w-full lg:w-[38%] bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-md p-4 space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-outline-variant/20">
              <div>
                <span className="text-[10px] font-bold uppercase text-primary tracking-wider block">
                  SỔ CÁI BẤT BIẾN (STOCK CARD)
                </span>
                <h3 className="font-headline-sm text-label-md font-bold text-on-surface">
                  {selectedProduct.name}
                </h3>
                <p className="text-[11px] text-outline font-mono mt-0.5">
                  SKU: {selectedProduct.sku} • Đơn vị: {selectedProduct.unit}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowStockCardDrawer(false)}
                className="w-7 h-7 rounded flex items-center justify-center text-outline hover:bg-surface-container"
              >
                <Icon name="close" className="text-[18px]" />
              </button>
            </div>

            {/* Current Stock Balance Summary */}
            <div className="p-3 rounded-lg bg-surface-container-low border border-outline-variant/20 grid grid-cols-2 gap-2 text-center">
              <div>
                <span className="text-[10px] text-outline block">Tồn kho hiện tại</span>
                <span className="font-tabular-stat text-headline-sm font-black text-primary">
                  {selectedProduct.stock} {selectedProduct.unit}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-outline block">Giá vốn MAC</span>
                <span className="font-tabular-stat text-headline-sm font-black text-on-surface">
                  {formatVND(selectedProduct.costPrice || Math.round(selectedProduct.unitPrice * 0.78))}
                </span>
              </div>
            </div>

            {/* Quick Edit & Print Barcode Triggers */}
            <div className="flex gap-2">
              <Button
                variant="secondary"
                icon="edit"
                className="flex-1 font-bold shadow-xs text-xs"
                onClick={() => setIsEditModalOpen(true)}
              >
                Chỉnh Sửa
              </Button>
              <Button
                variant="outline"
                icon="qr_code_2"
                className="flex-1 font-bold shadow-xs text-xs"
                onClick={() => {
                  setBarcodeItem({
                    id: selectedProduct.id,
                    name: selectedProduct.name,
                    sku: selectedProduct.sku,
                    barcode: selectedProduct.barcode || selectedProduct.sku,
                    price: selectedProduct.unitPrice,
                    unit: selectedProduct.unit,
                    batchNumber: selectedProduct.batchNumber,
                    expiryDate: selectedProduct.expiryDate,
                  });
                  setIsBarcodeModalOpen(true);
                }}
              >
                In Tem Barcode
              </Button>
            </div>

            {/* Unit Conversions Variants Showcase */}
            {selectedProduct.conversions && selectedProduct.conversions.length > 0 && (
              <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/25 space-y-2">
                <span className="text-[11px] font-bold uppercase text-tertiary tracking-wider block">
                  Biến thể đơn vị quy đổi ({selectedProduct.conversions.length} đơn vị)
                </span>
                <div className="space-y-1.5 text-xs">
                  {selectedProduct.conversions.map((conv: any, idx: number) => (
                    <div
                      key={conv.id || idx}
                      className="flex items-center justify-between p-2 rounded-lg bg-surface-container-lowest border border-outline-variant/15"
                    >
                      <div>
                        <span className="font-bold text-on-surface block">
                          {conv.unitName}
                        </span>
                        <span className="text-[11px] text-outline font-mono">
                          Tỷ lệ: x{conv.conversionRate} {selectedProduct.unit}
                          {conv.barcode ? ` • Barcode: ${conv.barcode}` : ''}
                        </span>
                      </div>
                      <span className="font-tabular-stat font-bold text-label-md text-emerald-600">
                        {formatVND(conv.price)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Audit Trail Timeline */}
            <div className="space-y-3">
              <p className="text-[11px] font-bold uppercase text-outline tracking-wider">
                Lịch sử xuất nhập theo thời gian thực
              </p>

              <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                {stockCardEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="p-2.5 rounded-lg bg-surface-container-low/50 border border-outline-variant/20 space-y-1"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className={`px-1.5 py-0.2 rounded font-mono font-bold text-[10px] ${entry.badgeColor}`}>
                        {entry.type}
                      </span>
                      <span className="text-outline font-mono text-[10px]">{entry.time}</span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div>
                        <span className="font-bold text-label-sm text-on-surface">
                          {entry.docNo}
                        </span>
                        <p className="text-[11px] text-outline">{entry.note}</p>
                      </div>

                      <div className="text-right">
                        <span
                          className={`font-tabular-stat font-bold text-label-md ${
                            entry.changeQty > 0 ? 'text-secondary' : 'text-error'
                          }`}
                        >
                          {entry.changeQty > 0 ? `+${entry.changeQty}` : entry.changeQty} {selectedProduct.unit}
                        </span>
                        <p className="text-[10px] text-outline font-mono">
                          Tồn sau: {entry.balanceAfter}
                        </p>
                      </div>
                    </div>

                    <p className="text-[10px] text-outline/70 border-t border-outline-variant/10 pt-1 mt-1 flex items-center gap-1">
                      <Icon name="person" className="text-[12px]" />
                      <span>Thực hiện: {entry.staff}</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Product & Unit Conversions Edit Modal */}
      <ProductEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        product={selectedProduct}
        onSaveSuccess={(updated) => setSelectedProduct(updated)}
      />

      {/* Barcode Print Modal */}
      <BarcodePrintModal
        isOpen={isBarcodeModalOpen}
        onClose={() => setIsBarcodeModalOpen(false)}
        item={barcodeItem}
      />
    </div>
  );
}
