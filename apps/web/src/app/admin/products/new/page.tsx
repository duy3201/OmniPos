'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Icon, Button, BentoCard, Badge, KeycapBadge, useToast } from '@/components/ui';
import { useProductStore } from '@/stores/productStore';

export default function NewProductPage() {
  const router = useRouter();
  const toast = useToast();
  const { addProduct } = useProductStore();

  const [productName, setProductName] = useState('Khoáng Tạt Cứng Vỏ Cao Cấp Tôm Sú/Thẻ');
  const [sku, setSku] = useState('KHOANG-TAT-25KG');
  const [barcode, setBarcode] = useState('8936012445892');
  const [category, setCategory] = useState('MINERAL_NUTRITION');
  const [baseUnit, setBaseUnit] = useState('Bao');
  const [costPrice, setCostPrice] = useState('320000');
  const [sellPrice, setSellPrice] = useState('420000');
  const [initialStock, setInitialStock] = useState('50');
  const [manageBatch, setManageBatch] = useState(true);
  const [manageSerial, setManageSerial] = useState(false);

  // Unit conversions: 1 Bao = 25 Kg
  const [conversions, setConversions] = useState([
    { id: '1', subUnit: 'Kg', factor: 25, sellPrice: 18000, barcode: '8936012445892-KG' },
  ]);

  const [isSaved, setIsSaved] = useState(false);

  const handleSave = async () => {
    if (!productName.trim()) {
      toast.error('Thiếu tên sản phẩm', 'Vui lòng nhập tên sản phẩm vật tư thủy sản!');
      return;
    }
    if (!sku.trim()) {
      toast.error('Thiếu mã SKU', 'Vui lòng nhập mã SKU cho sản phẩm!');
      return;
    }

    const cleanCost = Number(costPrice.toString().replace(/\D/g, '')) || 0;
    const cleanSell = Number(sellPrice.toString().replace(/\D/g, '')) || 0;
    const cleanStock = Number(initialStock.toString().replace(/\D/g, '')) || 0;

    if (cleanSell <= 0) {
      toast.error('Giá bán không hợp lệ', 'Giá bán niêm yết phải lớn hơn 0₫!');
      return;
    }

    setIsSaved(true);
    try {
      await addProduct({
        name: productName.trim(),
        sku: sku.trim().toUpperCase(),
        barcode: barcode.trim() || `893${Date.now().toString().slice(-10)}`,
        category,
        baseUnit: baseUnit.trim() || 'Bao',
        costPrice: cleanCost,
        retailPrice: cleanSell,
        initialStock: cleanStock,
        initialBatchNumber: `L-${new Date().toISOString().slice(2, 7).replace('-', '')}-01`,
        expiryDate: new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000).toISOString(),
        conversions: conversions.map((c) => ({
          unitName: c.subUnit,
          conversionRate: c.factor,
          price: c.sellPrice,
          barcode: c.barcode,
        })),
      });

      toast.success(
        'Đã tạo sản phẩm thành công!',
        `Sản phẩm "${productName}" (${sku.toUpperCase()}) đã được thêm vào kho và đồng bộ với cơ sở dữ liệu.`,
      );

      // Chuyển hướng ngay sang danh sách sản phẩm để người dùng nhìn thấy
      router.push('/admin/inventory');
    } catch (err: any) {
      toast.error('Lỗi khi lưu sản phẩm', err.message || 'Không thể kết nối đến máy chủ.');
      setIsSaved(false);
    }
  };


  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-outline-variant/30">
        <div>
          <div className="flex items-center gap-2 text-label-sm text-outline mb-1">
            <Link href="/admin/inventory" className="hover:text-primary">
              Kho hàng
            </Link>
            <span>/</span>
            <span className="text-on-surface">Tạo sản phẩm mới</span>
          </div>
          <h1 className="font-headline-sm text-headline-lg font-bold text-on-surface">
            Tạo Hàng Hóa Vật Tư Thủy Sản
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/admin/inventory">
            <Button variant="outline">Hủy bỏ</Button>
          </Link>
          <Button variant="primary" icon="save" onClick={handleSave} loading={isSaved}>
            Lưu sản phẩm [Ctrl+S]
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Section 1: General Info */}
          <BentoCard title="1. Thông tin chung &amp; Phân loại thủy sản">
            <div className="space-y-4">
              <div>
                <label className="block text-label-sm font-semibold text-on-surface mb-1">
                  Tên sản phẩm vật tư <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-outline-variant/40 bg-surface-container-lowest text-on-surface font-semibold focus:outline-none focus:border-primary text-body-md"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-label-sm font-semibold text-on-surface mb-1">
                    Ngành hàng chuyên biệt <span className="text-error">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-outline-variant/40 bg-surface-container-lowest text-on-surface text-body-sm outline-none cursor-pointer"
                  >
                    <option value="WATER_TREATMENT">Hóa chất xử lý nước ao (Yucca, Zeolite, Vôi...)</option>
                    <option value="PROBIOTIC">Men vi sinh xử lý đáy &amp; đường ruột</option>
                    <option value="MINERAL_NUTRITION">Khoáng tạt, chất bổ gan ruột</option>
                    <option value="AQUA_FEED">Thức ăn tôm / cá</option>
                    <option value="ANTIBIOTIC">Thuốc đặc trị bệnh thủy sản</option>
                    <option value="EQUIPMENT">Thiết bị quạt oxy, máy đo pH/mặn</option>
                  </select>
                </div>

                <div>
                  <label className="block text-label-sm font-semibold text-on-surface mb-1">
                    Đơn vị tính cơ bản (Gốc) <span className="text-error">*</span>
                  </label>
                  <input
                    type="text"
                    value={baseUnit}
                    onChange={(e) => setBaseUnit(e.target.value)}
                    placeholder="VD: Bao, Chai, Gói, Hộp, Can, Cái"
                    className="w-full h-10 px-3 rounded-lg border border-outline-variant/40 bg-surface-container-lowest text-on-surface text-body-sm focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-label-sm font-semibold text-on-surface mb-1">
                    Mã SKU <span className="text-error">*</span>
                  </label>
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-outline-variant/40 bg-surface-container-lowest text-on-surface font-mono text-body-sm focus:outline-none focus:border-primary uppercase"
                  />
                </div>

                <div>
                  <label className="block text-label-sm font-semibold text-on-surface mb-1">
                    Mã vạch Barcode (In trên bao bì)
                  </label>
                  <input
                    type="text"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-outline-variant/40 bg-surface-container-lowest text-on-surface font-mono text-body-sm focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Price Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-outline-variant/20">
                <div>
                  <label className="block text-label-sm font-semibold text-on-surface mb-1">
                    Giá nhập dự kiến (Giá vốn)
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      value={costPrice}
                      onChange={(e) => setCostPrice(e.target.value)}
                      className="w-full h-10 pl-3 pr-10 rounded-lg border border-outline-variant/40 bg-surface-container-lowest text-on-surface font-tabular-stat font-semibold focus:outline-none focus:border-primary"
                    />
                    <span className="absolute right-3 text-outline text-label-sm">₫</span>
                  </div>
                </div>

                <div>
                  <label className="block text-label-sm font-semibold text-on-surface mb-1">
                    Giá bán niêm yết POS quầy
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      value={sellPrice}
                      onChange={(e) => setSellPrice(e.target.value)}
                      className="w-full h-10 pl-3 pr-10 rounded-lg border border-outline-variant/40 bg-surface-container-lowest text-primary font-tabular-stat text-headline-sm font-bold focus:outline-none focus:border-primary"
                    />
                    <span className="absolute right-3 text-primary text-label-sm font-bold">₫</span>
                  </div>
                </div>
              </div>
            </div>
          </BentoCard>

          {/* Section 2: Special Governance: Lot / Expiry & Serial */}
          <BentoCard title="2. Quy chuẩn quản lý Lô &amp; Bảo hành đặc thù">
            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 rounded-lg border border-outline-variant/30 hover:bg-surface-container-low cursor-pointer transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-tertiary-fixed text-on-tertiary-container flex items-center justify-center">
                    <Icon name="event_busy" className="text-[18px]" />
                  </div>
                  <div>
                    <p className="font-semibold text-label-md text-on-surface">
                      Quản lý theo Số Lô (Lot) &amp; Hạn sử dụng (Expiry Date)
                    </p>
                    <p className="text-[11px] text-outline">
                      Bắt buộc đối với Thuốc thú y thủy sản, Men vi sinh, Hóa chất ao (Cảnh báo FEFO)
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={manageBatch}
                  onChange={(e) => setManageBatch(e.target.checked)}
                  className="w-5 h-5 rounded text-primary focus:ring-0 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-lg border border-outline-variant/30 hover:bg-surface-container-low cursor-pointer transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary-fixed text-primary flex items-center justify-center">
                    <Icon name="verified" className="text-[18px]" />
                  </div>
                  <div>
                    <p className="font-semibold text-label-md text-on-surface">
                      Quản lý theo Số Serial / IMEI máy
                    </p>
                    <p className="text-[11px] text-outline">
                      Áp dụng cho Mô tơ điện 3 pha, Quạt nước, Bút đo pH/độ mặn điện tử (Bảo hành 6 - 12T)
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={manageSerial}
                  onChange={(e) => setManageSerial(e.target.checked)}
                  className="w-5 h-5 rounded text-primary focus:ring-0 cursor-pointer"
                />
              </label>
            </div>
          </BentoCard>

          {/* Section 3: Multi-UOM Unit Conversion Table */}
          <BentoCard
            title="3. Quy đổi đơn vị tính sỉ - lẻ đa cấp"
            subtitle="Cho phép bán cả theo Thùng/Bao và xé lẻ theo Chai/Kg tại quầy POS"
            action={
              <button
                type="button"
                onClick={() =>
                  setConversions([
                    ...conversions,
                    {
                      id: String(Date.now()),
                      subUnit: 'Gói',
                      factor: 10,
                      sellPrice: 45000,
                      barcode: `${barcode}-GOI`,
                    },
                  ])
                }
                className="text-primary text-label-sm font-semibold hover:underline flex items-center gap-1"
              >
                <Icon name="add" className="text-[16px]" />
                <span>+ Thêm quy đổi</span>
              </button>
            }
          >
            <div className="space-y-3">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-body-sm">
                  <thead>
                    <tr className="bg-surface-container-low text-outline text-[11px] uppercase font-bold border-b border-outline-variant/20">
                      <th className="py-2 px-3">Tỷ lệ quy đổi</th>
                      <th className="py-2 px-3">Đơn vị quy đổi</th>
                      <th className="py-2 px-3 text-right">Giá bán lẻ lẻ</th>
                      <th className="py-2 px-3">Mã vạch phụ</th>
                      <th className="py-2 px-2 text-center">Xóa</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/15">
                    {conversions.map((conv) => (
                      <tr key={conv.id}>
                        <td className="py-2 px-3 font-semibold text-on-surface">
                          1 {baseUnit} = {conv.factor} {conv.subUnit}
                        </td>
                        <td className="py-2 px-3 font-mono">{conv.subUnit}</td>
                        <td className="py-2 px-3 text-right font-tabular-stat font-bold text-primary">
                          {conv.sellPrice.toLocaleString('vi-VN')}₫
                        </td>
                        <td className="py-2 px-3 font-mono text-[11px] text-outline">
                          {conv.barcode}
                        </td>
                        <td className="py-2 px-2 text-center">
                          <button
                            type="button"
                            onClick={() =>
                              setConversions(conversions.filter((c) => c.id !== conv.id))
                            }
                            className="text-outline hover:text-error"
                          >
                            <Icon name="delete" className="text-[16px]" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </BentoCard>
        </div>

        {/* Right Preview & Barcode Label Generator (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          <BentoCard title="Xem trước &amp; In tem Barcode">
            <div className="flex flex-col items-center p-4 bg-surface-container-low/60 rounded-xl border border-outline-variant/30 text-center space-y-3">
              <span className="text-[10px] font-bold uppercase text-outline tracking-wider">
                TEM DÁN BAO BÌ VẬT TƯ THỦY SẢN
              </span>

              <p className="font-bold text-label-md text-on-surface line-clamp-2">
                {productName}
              </p>

              {/* Barcode SVG Preview */}
              <div className="bg-white p-3 rounded-lg border border-outline-variant/30 shadow-sm flex flex-col items-center w-full">
                <span className="text-[9px] font-bold text-black mb-1">
                  ĐẠI LÝ THỦY SẢN BẾN TRE
                </span>
                {/* Simulated Barcode Stripes */}
                <div className="flex items-center justify-center gap-0.5 h-12 w-full my-1">
                  {[4,2,6,1,3,5,2,4,1,6,3,2,5,4,2,6,1,3,2,5,4,2,6,1,3,5,2,4].map((w, idx) => (
                    <div
                      key={idx}
                      className="bg-black h-full"
                      style={{ width: `${w}px` }}
                    />
                  ))}
                </div>
                <span className="font-mono text-label-sm font-bold tracking-widest text-black">
                  {barcode}
                </span>
              </div>

              <div className="w-full flex items-center justify-between text-[11px] border-t border-outline-variant/20 pt-2 text-outline">
                <span>Giá bán lẻ:</span>
                <span className="font-tabular-stat font-bold text-primary text-label-md">
                  {Number(sellPrice).toLocaleString('vi-VN')}₫ / {baseUnit}
                </span>
              </div>

              <button
                type="button"
                onClick={() =>
                  toast.info(
                    'Lệnh in tem mã vạch',
                    `Đang gửi lệnh in 100 tem mã vạch [${barcode}] tới máy in nhiệt Bixolon K80...`
                  )
                }
                className="w-full py-2.5 rounded-lg bg-surface-container hover:bg-surface-container-high border border-outline-variant/40 text-on-surface text-label-md font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
              >
                <Icon name="print" className="text-[18px]" />
                <span>In thử tem mã vạch</span>
              </button>
            </div>
          </BentoCard>

          {/* Quick Shortcuts Hint */}
          <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/20 space-y-1.5 text-[11px] text-outline">
            <div className="flex items-center justify-between">
              <span>Lưu sản phẩm</span>
              <KeycapBadge label="Ctrl + S" />
            </div>
            <div className="flex items-center justify-between">
              <span>In tem mã vạch</span>
              <KeycapBadge label="Ctrl + P" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
