'use client';

import React, { useState, useEffect } from 'react';
import { Icon, Button, Badge, useToast } from '@/components/ui';
import { useProductStore, ProductItem, UnitConversionVariant } from '@/stores/productStore';
import { ProductCategory } from '@omnipos/shared';

interface ProductEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: ProductItem | null;
  onSaveSuccess?: (updated: ProductItem) => void;
}

export const ProductEditModal: React.FC<ProductEditModalProps> = ({
  isOpen,
  onClose,
  product,
  onSaveSuccess,
}) => {
  const toast = useToast();
  const { updateProduct, deleteProduct } = useProductStore();

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [barcode, setBarcode] = useState('');
  const [category, setCategory] = useState<ProductCategory>(ProductCategory.WATER_TREATMENT);
  const [baseUnit, setBaseUnit] = useState('Chai');
  const [retailPrice, setRetailPrice] = useState<number>(0);
  const [costPrice, setCostPrice] = useState<number>(0);
  const [stock, setStock] = useState<number>(0);
  const [activeIngredients, setActiveIngredients] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [conversions, setConversions] = useState<UnitConversionVariant[]>([]);

  useEffect(() => {
    if (product) {
      setName(product.name || '');
      setSku(product.sku || '');
      setBarcode(product.barcode || '');
      setCategory(product.category || ProductCategory.WATER_TREATMENT);
      setBaseUnit(product.unit || 'Chai');
      setRetailPrice(product.unitPrice || 0);
      setCostPrice(product.costPrice || Math.round((product.unitPrice || 0) * 0.75));
      setStock(product.stock || 0);
      setActiveIngredients(product.activeIngredients || '');
      setBatchNumber(product.batchNumber || '');
      setExpiryDate(product.expiryDate || '');
      setConversions(product.conversions ? [...product.conversions] : []);
    }
  }, [product, isOpen]);

  if (!isOpen || !product) return null;

  // Add new conversion variant row
  const handleAddVariant = () => {
    const defaultRate = 12;
    const calculatedPrice = retailPrice * defaultRate;
    const newVariant: UnitConversionVariant = {
      id: `conv-temp-${Date.now()}`,
      unitName: `Thùng (${defaultRate} ${baseUnit})`,
      conversionRate: defaultRate,
      price: calculatedPrice,
      barcode: `${barcode}-V${conversions.length + 1}`,
    };
    setConversions([...conversions, newVariant]);
  };

  const handleUpdateVariant = (index: number, field: keyof UnitConversionVariant, value: any) => {
    setConversions((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      // If conversionRate changes, optionally update suggested price
      if (field === 'conversionRate') {
        const rate = Number(value) || 1;
        copy[index].price = Math.round(retailPrice * rate * 0.95); // 5% bulk discount default
      }
      return copy;
    });
  };

  const handleRemoveVariant = (index: number) => {
    setConversions((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Thiếu thông tin', 'Vui lòng nhập tên sản phẩm.');
      return;
    }

    setIsSaving(true);
    try {
      const updated = await updateProduct(product.id, {
        name,
        sku,
        barcode,
        category,
        baseUnit,
        retailPrice: Number(retailPrice),
        costPrice: Number(costPrice),
        activeIngredients,
        batchNumber,
        expiryDate,
        conversions,
      });

      toast.success('Đã lưu thành công!', `Thông tin và ${conversions.length} biến thể của "${name}" đã được cập nhật vào cơ sở dữ liệu.`);
      if (updated && onSaveSuccess) {
        onSaveSuccess(updated);
      }
      onClose();
    } catch (err) {
      toast.error('Lỗi cập nhật', 'Không thể lưu dữ liệu sản phẩm.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Bạn có chắc chắn muốn xóa/ngừng kinh doanh sản phẩm "${name}"?`)) return;
    setIsDeleting(true);
    try {
      await deleteProduct(product.id);
      toast.success('Đã xóa sản phẩm', `Sản phẩm ${name} đã được gỡ bỏ khỏi hệ thống.`);
      onClose();
    } catch (err) {
      toast.error('Lỗi khi xóa', 'Không thể hoàn tất thao tác.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-3xl bg-surface-container-lowest rounded-3xl shadow-2xl border border-outline-variant/30 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-outline-variant/30 flex items-center justify-between bg-surface-container-low">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <Icon name="edit_note" className="text-[26px]" />
            </div>
            <div>
              <h3 className="font-bold text-headline-sm text-on-surface">
                Chỉnh Sửa Sản Phẩm &amp; Biến Thể Quy Đổi
              </h3>
              <p className="text-body-sm text-outline">
                SKU: <span className="font-mono font-bold text-on-surface">{sku}</span> • Cập nhật giá bán, giá vốn MAC và đơn vị sỉ lẻ
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center text-outline transition-colors"
          >
            <Icon name="close" className="text-[20px]" />
          </button>
        </div>

        {/* Form Body */}
        <form id="edit-product-form" onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Section 1: Basic Information */}
          <div className="space-y-4">
            <h4 className="text-label-md font-bold text-primary flex items-center gap-1.5 uppercase tracking-wide">
              <Icon name="inventory_2" className="text-[18px]" />
              1. Thông tin hàng hóa &amp; Đặc tính thủy sản
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-semibold text-on-surface">Tên thương mại sản phẩm *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-surface-container-low border border-outline-variant/40 text-body-sm text-on-surface focus:outline-none focus:border-primary font-medium"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-on-surface">Mã SKU *</label>
                <input
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-surface-container-low border border-outline-variant/40 text-body-sm text-on-surface font-mono"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-on-surface">Mã vạch bao bì (Barcode)</label>
                <input
                  type="text"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-surface-container-low border border-outline-variant/40 text-body-sm text-on-surface font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-on-surface">Danh mục chuyên ngành *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ProductCategory)}
                  className="w-full h-10 px-3 rounded-xl bg-surface-container-low border border-outline-variant/40 text-body-sm text-on-surface"
                >
                  <option value={ProductCategory.WATER_TREATMENT}>Xử lý nước ao tôm</option>
                  <option value={ProductCategory.PROBIOTIC}>Men vi sinh & Khử đáy</option>
                  <option value={ProductCategory.MINERAL_NUTRITION}>Khoáng tạt & Dinh dưỡng</option>
                  <option value={ProductCategory.AQUA_FEED}>Thức ăn tôm & cá</option>
                  <option value={ProductCategory.ANTIBIOTIC}>Thuốc bổ gan & Thảo dược</option>
                  <option value={ProductCategory.EQUIPMENT}>Vật tư & Thiết bị ao nuôi</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-on-surface">Đơn vị cơ bản (ĐVT nhỏ nhất) *</label>
                <input
                  type="text"
                  value={baseUnit}
                  onChange={(e) => setBaseUnit(e.target.value)}
                  placeholder="Chai, Gói, Can, Bao, Kg..."
                  className="w-full h-10 px-3 rounded-xl bg-surface-container-low border border-outline-variant/40 text-body-sm text-on-surface"
                  required
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-semibold text-on-surface">Hoạt chất / Công dụng đặc trị</label>
                <input
                  type="text"
                  value={activeIngredients}
                  onChange={(e) => setActiveIngredients(e.target.value)}
                  placeholder="Ví dụ: Yucca schidigera 90%, Bacillus subtilis 10^9 CFU/g..."
                  className="w-full h-10 px-3 rounded-xl bg-surface-container-low border border-outline-variant/40 text-body-sm text-on-surface"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Pricing & Inventory */}
          <div className="space-y-4 pt-3 border-t border-outline-variant/20">
            <h4 className="text-label-md font-bold text-secondary flex items-center gap-1.5 uppercase tracking-wide">
              <Icon name="payments" className="text-[18px]" />
              2. Đơn giá &amp; Quản trị lô hạn dùng
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-on-surface">Giá bán lẻ POS (ĐVT gốc) *</label>
                <div className="relative">
                  <input
                    type="number"
                    value={retailPrice}
                    onChange={(e) => setRetailPrice(Number(e.target.value))}
                    className="w-full h-10 pl-3 pr-8 rounded-xl bg-surface-container-low border border-outline-variant/40 text-body-sm font-bold text-primary focus:outline-none"
                    required
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-outline font-bold">₫</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-on-surface">Giá vốn MAC bình quân</label>
                <div className="relative">
                  <input
                    type="number"
                    value={costPrice}
                    onChange={(e) => setCostPrice(Number(e.target.value))}
                    className="w-full h-10 pl-3 pr-8 rounded-xl bg-surface-container-low border border-outline-variant/40 text-body-sm font-semibold text-on-surface focus:outline-none"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-outline font-bold">₫</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-on-surface">Tồn kho khả dụng ({baseUnit})</label>
                <input
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(Number(e.target.value))}
                  className="w-full h-10 px-3 rounded-xl bg-surface-container-low border border-outline-variant/40 text-body-sm font-bold text-on-surface"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-on-surface">Số lô sản xuất (Batch)</label>
                <input
                  type="text"
                  value={batchNumber}
                  onChange={(e) => setBatchNumber(e.target.value)}
                  placeholder="YC-202610-01"
                  className="w-full h-10 px-3 rounded-xl bg-surface-container-low border border-outline-variant/40 text-body-sm font-mono text-on-surface"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-semibold text-on-surface">Hạn sử dụng (EXP Date)</label>
                <input
                  type="text"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  placeholder="15/10/2028"
                  className="w-full h-10 px-3 rounded-xl bg-surface-container-low border border-outline-variant/40 text-body-sm text-on-surface"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Unit Conversions / Biến thể đơn vị quy đổi */}
          <div className="space-y-3 pt-3 border-t border-outline-variant/20">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-label-md font-bold text-tertiary flex items-center gap-1.5 uppercase tracking-wide">
                  <Icon name="swap_horiz" className="text-[18px]" />
                  3. Biến thể đơn vị quy đổi (Bán Thùng / Bao / Can sỉ)
                </h4>
                <p className="text-xs text-outline">
                  Cho phép bán lẻ theo Chai hoặc bán sỉ theo Thùng với giá ưu đãi riêng
                </p>
              </div>

              <Button
                type="button"
                variant="secondary"
                size="sm"
                icon="add"
                onClick={handleAddVariant}
              >
                Thêm biến thể
              </Button>
            </div>

            {conversions.length === 0 ? (
              <div className="p-4 rounded-xl border border-dashed border-outline-variant/40 bg-surface-container-low/30 text-center text-xs text-outline space-y-1">
                <p>Sản phẩm này chỉ bán theo đơn vị cơ bản ({baseUnit}).</p>
                <p>Bấm nút <strong>"+ Thêm biến thể"</strong> để cấu hình bán theo Thùng 12 chai, Can 20L hoặc Bao 25kg.</p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="grid grid-cols-12 gap-2 text-[11px] font-bold text-outline uppercase px-2">
                  <div className="col-span-4">Đơn vị biến thể</div>
                  <div className="col-span-2 text-center">Tỷ lệ quy đổi</div>
                  <div className="col-span-3 text-right">Giá bán biến thể</div>
                  <div className="col-span-2">Mã vạch riêng</div>
                  <div className="col-span-1 text-center">Xóa</div>
                </div>

                {conversions.map((variant, idx) => (
                  <div
                    key={variant.id || idx}
                    className="grid grid-cols-12 gap-2 items-center p-2 rounded-xl bg-surface-container-low border border-outline-variant/30"
                  >
                    <div className="col-span-4">
                      <input
                        type="text"
                        value={variant.unitName}
                        onChange={(e) => handleUpdateVariant(idx, 'unitName', e.target.value)}
                        placeholder="Thùng (12 Chai)..."
                        className="w-full h-9 px-2.5 rounded-lg bg-surface-container-lowest border border-outline-variant/30 text-xs font-semibold text-on-surface"
                      />
                    </div>

                    <div className="col-span-2">
                      <div className="relative">
                        <input
                          type="number"
                          value={variant.conversionRate}
                          onChange={(e) => handleUpdateVariant(idx, 'conversionRate', Number(e.target.value))}
                          className="w-full h-9 pl-2 pr-6 rounded-lg bg-surface-container-lowest border border-outline-variant/30 text-xs font-bold text-center text-primary"
                        />
                        <span className="absolute right-1.5 top-2 text-[10px] text-outline font-mono">x</span>
                      </div>
                    </div>

                    <div className="col-span-3">
                      <div className="relative">
                        <input
                          type="number"
                          value={variant.price}
                          onChange={(e) => handleUpdateVariant(idx, 'price', Number(e.target.value))}
                          className="w-full h-9 pl-2 pr-6 rounded-lg bg-surface-container-lowest border border-outline-variant/30 text-xs font-bold text-right text-emerald-600"
                        />
                        <span className="absolute right-1.5 top-2 text-[10px] text-outline font-bold">₫</span>
                      </div>
                    </div>

                    <div className="col-span-2">
                      <input
                        type="text"
                        value={variant.barcode || ''}
                        onChange={(e) => handleUpdateVariant(idx, 'barcode', e.target.value)}
                        placeholder="Barcode..."
                        className="w-full h-9 px-2 rounded-lg bg-surface-container-lowest border border-outline-variant/30 text-[11px] font-mono text-on-surface"
                      />
                    </div>

                    <div className="col-span-1 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveVariant(idx)}
                        className="w-7 h-7 rounded-lg text-outline hover:text-error hover:bg-error-container/20 flex items-center justify-center transition-colors mx-auto"
                        title="Xóa biến thể này"
                      >
                        <Icon name="delete" className="text-[16px]" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-outline-variant/30 bg-surface-container-low flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="ghost"
            icon="delete"
            loading={isDeleting}
            onClick={handleDelete}
            className="text-error hover:bg-error-container/20"
          >
            Xóa sản phẩm
          </Button>

          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
              Hủy bỏ
            </Button>
            <Button
              type="submit"
              form="edit-product-form"
              variant="primary"
              icon="save"
              loading={isSaving}
            >
              Lưu thay đổi &amp; Đồng bộ DB
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
