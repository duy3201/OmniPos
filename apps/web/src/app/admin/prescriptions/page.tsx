'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Icon, Button, BentoCard, Badge, useToast } from '@/components/ui';
import { useCartStore } from '@/stores/cartStore';
import { ProductCategory } from '@omnipos/shared';

export default function PrescriptionsPage() {
  const router = useRouter();
  const toast = useToast();
  const { addToCart } = useCartStore();

  const [customerName, setCustomerName] = useState('Anh Ba Hùng (Đầm Thạnh Phú)');
  const [pondName, setPondName] = useState('Ao Số 1 (Lót bạt 3.000m²)');
  const [pondVolume, setPondVolume] = useState('3600'); // 3.600 m3
  const [shrimpAge, setShrimpAge] = useState('45'); // 45 ngày
  const [symptoms, setSymptoms] = useState('Tôm tấp mé nhẹ vào sáng sớm, gan hơi nhạt màu, nước có bọt khó tan.');

  // Water Test Metrics
  const [salinity, setSalinity] = useState('16'); // 16 ‰
  const [pHSang, setPhSang] = useState('7.6');
  const [pHChieu, setPhChieu] = useState('8.4');
  const [alkalinity, setAlkalinity] = useState('110'); // 110 mg/L (Thấp)
  const [no2, setNo2] = useState('0.5'); // Độc
  const [nh3, setNh3] = useState('0.1');

  // Prescribed items
  const [prescribedItems, setPrescribedItems] = useState([
    {
      id: 'p1',
      sku: 'YUC-LIQ-1L',
      name: 'Yucca Cấp Tốc Hấp Thu Khí Độc Ao Tôm (Chai 1L)',
      category: ProductCategory.WATER_TREATMENT,
      dosage: '1 chai / 2.000m³ (Tạt lúc 9h sáng)',
      qty: 2,
      unit: 'Chai',
      unitPrice: 280000,
    },
    {
      id: 'p3',
      sku: 'KHOANG-TAT-25KG',
      name: 'Khoáng Tạt Cứng Vỏ Cao Cấp Tôm Sú/Thẻ (Bao 25kg)',
      category: ProductCategory.MINERAL_NUTRITION,
      dosage: '1 bao / 3.000m³ (Tạt ban đêm lúc 21h)',
      qty: 2,
      unit: 'Bao',
      unitPrice: 420000,
    },
    {
      id: 'p7',
      sku: 'ANTI-LIVER-500ML',
      name: 'Thảo Dược Bổ Gan, Trị Teo Gan Tôm Gan Tụy AHPND',
      category: ProductCategory.ANTIBIOTIC,
      dosage: '10ml / kg thức ăn (Trộn 2 cữ sáng/chiều)',
      qty: 3,
      unit: 'Chai',
      unitPrice: 350000,
    },
  ]);

  const handleExportToPos = () => {
    // Add all prescribed items to POS cart
    prescribedItems.forEach((item) => {
      addToCart({
        id: item.id,
        sku: item.sku,
        name: item.name,
        category: item.category,
        unit: item.unit,
        unitPrice: item.unitPrice,
        discount: 0,
      });
    });

    toast.success(
      'Kê toa thuốc thành công!',
      'Đã tự động chuyển 3 loại thuốc theo đơn vào Giỏ hàng POS để thu ngân thanh toán.'
    );
    router.push('/pos/terminal');
  };

  const totalPrescription = prescribedItems.reduce((sum, i) => sum + i.qty * i.unitPrice, 0);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-outline-variant/30">
        <div>
          <h1 className="font-headline-sm text-headline-lg font-bold text-on-surface">
            Phiếu Đo Nước Ao &amp; Kê Đơn Thuốc Thủy Sản
          </h1>
          <p className="text-body-sm text-outline">
            Chẩn đoán lâm sàng bệnh phẩm tôm cá • Tự động tính liều theo thể tích ao và nạp vào giỏ POS
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" icon="print">
            In Phiếu Chỉ Dẫn Tạt Thuốc
          </Button>
          <Button
            variant="success"
            icon="point_of_sale"
            onClick={handleExportToPos}
          >
            Chuyển Đơn Thuốc Sang Quầy POS ➔
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Pond & Water Lab Testing Results (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Customer & Pond Information */}
          <BentoCard title="1. Thông tin ao &amp; Tình trạng tôm">
            <div className="space-y-3 text-body-sm">
              <div>
                <label className="block text-[11px] font-semibold text-outline mb-1">
                  Chủ đầm / Khách hàng
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-outline-variant/40 bg-surface-container-lowest font-semibold text-on-surface text-label-md"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-outline mb-1">
                    Tên Ao / Đầm
                  </label>
                  <input
                    type="text"
                    value={pondName}
                    onChange={(e) => setPondName(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-outline-variant/40 bg-surface-container-lowest text-on-surface text-label-sm"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-outline mb-1">
                    Thể tích nước (m³)
                  </label>
                  <input
                    type="text"
                    value={pondVolume}
                    onChange={(e) => setPondVolume(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-outline-variant/40 bg-surface-container-lowest font-mono font-bold text-primary text-label-md"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-outline mb-1">
                  Tuổi tôm thả nuôi (Ngày tuổi)
                </label>
                <input
                  type="text"
                  value={shrimpAge}
                  onChange={(e) => setShrimpAge(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-outline-variant/40 bg-surface-container-lowest font-mono text-on-surface text-label-sm"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-outline mb-1">
                  Triệu chứng bệnh ghi nhận
                </label>
                <textarea
                  rows={2}
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  className="w-full p-2 rounded-lg border border-outline-variant/40 bg-surface-container-lowest text-[12px] text-on-surface resize-none"
                />
              </div>
            </div>
          </BentoCard>

          {/* Water Lab Metrics Grid */}
          <BentoCard title="2. Kết quả đo chỉ số nước ao">
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 rounded-lg bg-surface-container-low border border-outline-variant/20">
                  <span className="text-[10px] text-outline block">Độ mặn (‰)</span>
                  <input
                    type="text"
                    value={salinity}
                    onChange={(e) => setSalinity(e.target.value)}
                    className="w-full text-center font-bold text-headline-sm bg-transparent outline-none text-primary"
                  />
                  <span className="text-[9px] text-secondary">Tốt (15-20‰)</span>
                </div>

                <div className="p-2 rounded-lg bg-surface-container-low border border-outline-variant/20">
                  <span className="text-[10px] text-outline block">pH Sáng/Chiều</span>
                  <div className="flex items-center justify-center gap-1 font-bold text-headline-sm text-on-surface">
                    <input
                      type="text"
                      value={pHSang}
                      onChange={(e) => setPhSang(e.target.value)}
                      className="w-8 text-center bg-transparent outline-none"
                    />
                    <span>/</span>
                    <input
                      type="text"
                      value={pHChieu}
                      onChange={(e) => setPhChieu(e.target.value)}
                      className="w-8 text-center bg-transparent outline-none text-primary"
                    />
                  </div>
                  <span className="text-[9px] text-outline">Chuẩn 7.5-8.3</span>
                </div>

                <div className="p-2 rounded-lg bg-tertiary-fixed/30 border border-tertiary/20">
                  <span className="text-[10px] text-tertiary block font-bold">Độ kiềm (mg/L)</span>
                  <input
                    type="text"
                    value={alkalinity}
                    onChange={(e) => setAlkalinity(e.target.value)}
                    className="w-full text-center font-bold text-headline-sm bg-transparent outline-none text-tertiary"
                  />
                  <span className="text-[9px] text-error font-bold">Thấp (&lt; 120)</span>
                </div>
              </div>

              {/* Toxic Gases */}
              <div className="grid grid-cols-2 gap-2 text-center pt-1">
                <div className="p-2 rounded-lg bg-error-container/20 border border-error/20">
                  <span className="text-[10px] text-error font-bold block">Khí độc NO2 (mg/L)</span>
                  <input
                    type="text"
                    value={no2}
                    onChange={(e) => setNo2(e.target.value)}
                    className="w-full text-center font-bold text-headline-sm bg-transparent outline-none text-error"
                  />
                  <span className="text-[9px] text-error">Rất độc (&gt; 0.1)</span>
                </div>

                <div className="p-2 rounded-lg bg-surface-container-low border border-outline-variant/20">
                  <span className="text-[10px] text-outline block">Khí độc NH3 (mg/L)</span>
                  <input
                    type="text"
                    value={nh3}
                    onChange={(e) => setNh3(e.target.value)}
                    className="w-full text-center font-bold text-headline-sm bg-transparent outline-none text-secondary"
                  />
                  <span className="text-[9px] text-secondary">An toàn (&lt; 0.3)</span>
                </div>
              </div>
            </div>
          </BentoCard>
        </div>

        {/* Right Column: Prescribed Treatment Protocol & POS Push (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <BentoCard
            title="3. Phác đồ kê toa điều trị &amp; Hướng dẫn tạt thuốc"
            subtitle={`Tính toán cho thể tích ${Number(pondVolume).toLocaleString('vi-VN')} m³ nước`}
          >
            <div className="space-y-3">
              {prescribedItems.map((item, idx) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/30 flex items-start justify-between gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-primary text-white text-[11px] font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <h4 className="font-bold text-label-md text-on-surface truncate">
                        {item.name}
                      </h4>
                    </div>

                    <p className="text-[12px] text-primary font-medium mt-1 pl-7 flex items-center gap-1">
                      <Icon name="medication" className="text-[14px]" />
                      <span>{item.dosage}</span>
                    </p>

                    <p className="text-[11px] text-outline font-mono pl-7 mt-0.5">
                      Đơn giá: {item.unitPrice.toLocaleString('vi-VN')}₫ / {item.unit}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="px-2 py-1 rounded bg-primary-fixed font-bold text-primary font-mono text-label-md block">
                      {item.qty} {item.unit}
                    </span>
                    <span className="font-tabular-stat text-[12px] font-bold text-on-surface mt-1 block">
                      {(item.qty * item.unitPrice).toLocaleString('vi-VN')}₫
                    </span>
                  </div>
                </div>
              ))}

              {/* Total & Action Box */}
              <div className="p-3 rounded-xl bg-surface-container-lowest border border-outline-variant/30 flex items-center justify-between mt-4">
                <div>
                  <span className="text-[11px] text-outline block">Tổng tiền đơn thuốc dự kiến:</span>
                  <span className="font-display text-headline-lg font-black text-primary">
                    {totalPrescription.toLocaleString('vi-VN')}₫
                  </span>
                </div>

                <Button
                  variant="success"
                  size="lg"
                  icon="shopping_cart_checkout"
                  onClick={handleExportToPos}
                >
                  Nạp Giỏ Hàng &amp; Thu Tiền POS
                </Button>
              </div>
            </div>
          </BentoCard>
        </div>
      </div>
    </div>
  );
}
