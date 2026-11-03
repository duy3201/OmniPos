import { PrismaClient, StaffRole, ProductCategory, PaymentMethod, BatchExpiryStatus, StockTransactionType, CustomerTier, PrescriptionStatus, WarrantyStatus, TransferStatus, ShiftStatus, OrderStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Bắt đầu nạp dữ liệu thực tế cho hệ thống OmniPOS Thủy Sản...');

  // 1. Dọn sạch dữ liệu cũ theo thứ tự quan hệ khóa ngoại
  await prisma.warrantyRecord.deleteMany({});
  await prisma.transferOrderItem.deleteMany({});
  await prisma.transferOrder.deleteMany({});
  await prisma.prescriptionItem.deleteMany({});
  await prisma.waterTestPrescription.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.debtPaymentReceipt.deleteMany({});
  await prisma.cropDebtLedger.deleteMany({});
  await prisma.farmPond.deleteMany({});
  await prisma.customer.deleteMany({});
  await prisma.stockCard.deleteMany({});
  await prisma.purchaseOrderItem.deleteMany({});
  await prisma.purchaseOrder.deleteMany({});
  await prisma.batch.deleteMany({});
  await prisma.unitConversion.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.supplier.deleteMany({});
  await prisma.shiftSession.deleteMany({});
  await prisma.staff.deleteMany({});

  console.log('🧹 Đã dọn sạch cơ sở dữ liệu cũ.');

  // 2. Tạo Nhân sự cửa hàng (Staff)
  const staffNam = await prisma.staff.create({
    data: {
      staffCode: 'NV-001',
      name: 'Nguyễn Hoàng Nam',
      phone: '0918112233',
      email: 'nam.nh@omnipos.vn',
      role: StaffRole.STORE_MANAGER,
      pinCode: '8888',
      active: true,
      discountLimitPercent: 20.0,
      canVoidOrder: true,
    },
  });

  const staffMinhAnh = await prisma.staff.create({
    data: {
      staffCode: 'NV-002',
      name: 'KS. Trần Minh Anh',
      phone: '0989223344',
      email: 'minhanh.aqua@omnipos.vn',
      role: StaffRole.AQUA_TECHNICIAN,
      pinCode: '1234',
      active: true,
      discountLimitPercent: 10.0,
      canVoidOrder: false,
    },
  });

  const staffVy = await prisma.staff.create({
    data: {
      staffCode: 'NV-003',
      name: 'Lê Thảo Vy',
      phone: '0903334455',
      email: 'vy.cashier@omnipos.vn',
      role: StaffRole.CASHIER,
      pinCode: '2580',
      active: true,
      discountLimitPercent: 5.0,
      canVoidOrder: false,
    },
  });

  const staffThanh = await prisma.staff.create({
    data: {
      staffCode: 'NV-004',
      name: 'Võ Văn Thành',
      phone: '0977445566',
      email: 'thanh.kho@omnipos.vn',
      role: StaffRole.WAREHOUSE_KEEPER,
      pinCode: '6688',
      active: true,
      discountLimitPercent: 0.0,
      canVoidOrder: false,
    },
  });

  console.log('✅ Đã tạo 4 nhân sự (Quản lý, Kỹ sư xét nghiệm, Thu ngân, Thủ kho).');

  // 3. Tạo Nhà cung cấp thực tế (Suppliers)
  const supCP = await prisma.supplier.create({
    data: {
      supplierCode: 'NCC-CP',
      name: 'Công ty Cổ phần Chăn nuôi C.P. Việt Nam',
      taxCode: '3600224423',
      phone: '0273.3855.999',
      address: 'KCN Mỹ Tho, Tỉnh Tiền Giang',
      contactPerson: 'Anh Trần Quốc Bảo (Trưởng kinh doanh thủy sản)',
      totalPurchased: 2450000000,
      currentDebt: 320000000,
      paymentTerms: 'Gối đầu 30 ngày, chiết khấu quý 2.5%',
    },
  });

  const supGrobest = await prisma.supplier.create({
    data: {
      supplierCode: 'NCC-GROBEST',
      name: 'Công ty TNHH Dinh Dưỡng Thủy Sản Grobest Việt Nam',
      taxCode: '3600456789',
      phone: '0251.3836.111',
      address: 'KCN Amata, Biên Hòa, Đồng Nai',
      contactPerson: 'Chị Mai Lan (Giám đốc bán hàng vùng ĐBSCL)',
      totalPurchased: 1850000000,
      currentDebt: 180000000,
      paymentTerms: 'Gối đầu 45 ngày theo vụ nuôi',
    },
  });

  const supVemedim = await prisma.supplier.create({
    data: {
      supplierCode: 'NCC-VEMEDIM',
      name: 'Công ty CP Dược Phẩm Thú Y & Thủy Sản Vemedim Cần Thơ',
      taxCode: '1800109922',
      phone: '0292.3832.222',
      address: 'KCN Trà Nóc, Bình Thủy, TP. Cần Thơ',
      contactPerson: 'Dược sĩ Nguyễn Văn Đức',
      totalPurchased: 980000000,
      currentDebt: 85000000,
      paymentTerms: 'Thanh toán chuyển khoản sau 15 ngày nhận hàng',
    },
  });

  const supThanVuong = await prisma.supplier.create({
    data: {
      supplierCode: 'NCC-THANVUONG',
      name: 'Công ty TNHH Thần Vương (Thảo Dược & Men Vi Sinh)',
      taxCode: '0312456710',
      phone: '028.3844.5566',
      address: 'Quận Tân Bình, TP. Hồ Chí Minh',
      contactPerson: 'Kỹ sư Lâm Tấn Hưng',
      totalPurchased: 620000000,
      currentDebt: 45000000,
      paymentTerms: 'Gối đầu 30 ngày',
    },
  });

  const supTanHoanCau = await prisma.supplier.create({
    data: {
      supplierCode: 'NCC-TANHOANCAU',
      name: 'Công ty TNHH Kỹ Thuật Cơ Điện Tân Hoàn Cầu',
      taxCode: '0303889911',
      phone: '0272.3779.888',
      address: 'KCN Đức Hòa, Tỉnh Long An',
      contactPerson: 'Anh Hoàng Văn Kiên (Bảo hành & Phân phối)',
      totalPurchased: 450000000,
      currentDebt: 50000000,
      paymentTerms: 'Thanh toán ngay khi giao hàng, bảo hành động cơ 12 tháng',
    },
  });

  console.log('✅ Đã tạo 5 nhà cung cấp uy tín ngành thủy sản.');

  // 4. Tạo Khách hàng & Hồ sơ Ao nuôi thực tế (Customers & Farm Ponds)
  const custSauTung = await prisma.customer.create({
    data: {
      customerCode: 'KH-001',
      name: 'Nguyễn Văn Tùng',
      nickname: 'Chú Sáu Tùng',
      phone: '0918455789',
      idCard: '094078001234',
      address: 'Ấp Phước Thọ, Xã Phước Long',
      district: 'Huyện Phước Long',
      province: 'Bạc Liêu',
      tier: CustomerTier.GOLD,
      rewardPoints: 2850,
      creditLimit: 350000000,
      currentDebt: 185000000,
      notes: 'Trại tôm công nghệ cao 6 ao bạt đáy. Thanh toán uy tín cuối vụ khi thu hoạch tôm.',
      ponds: {
        create: [
          {
            name: 'Ao Số 1 (Lót bạt đáy oxy đáy)',
            pondType: 'Ao bạt đáy 2 tầng oxy',
            areaM2: 2500,
            waterVolumeM3: 3200,
            targetSpecies: 'Tôm thẻ chân trắng',
            stockingDate: new Date('2026-09-04'),
            shrimpAgeDays: 55,
            status: 'Đang nuôi',
            notes: 'Mật độ 200 con/m2, tôm đang giai đoạn phát triển mạnh',
          },
          {
            name: 'Ao Tròn Nổi 2 (HDPE công nghệ cao)',
            pondType: 'Ao tròn nổi HDPE',
            areaM2: 1200,
            waterVolumeM3: 1800,
            targetSpecies: 'Tôm thẻ chân trắng',
            stockingDate: new Date('2026-09-27'),
            shrimpAgeDays: 32,
            status: 'Đang nuôi',
            notes: 'Mật độ 250 con/m2, sục khí liên tục',
          },
          {
            name: 'Ao Ươm Giống Vèo (Post 12)',
            pondType: 'Ao tròn ươm giống có mái che',
            areaM2: 500,
            waterVolumeM3: 600,
            targetSpecies: 'Tôm thẻ giống CP Moana',
            stockingDate: new Date('2026-10-17'),
            shrimpAgeDays: 12,
            status: 'Đang nuôi',
            notes: 'Chuẩn bị chuyển sang ao nuôi thương phẩm',
          },
          {
            name: 'Ao Lắng Xử Lý Nước Mặn',
            pondType: 'Ao lắng khử trùng',
            areaM2: 4000,
            waterVolumeM3: 6000,
            targetSpecies: 'Trữ nước mặn 18‰',
            status: 'Trữ nước',
            notes: 'Đã xử lý Chlorine và thuốc tím, sẵn sàng cấp vào ao nuôi',
          },
        ],
      },
    },
    include: { ponds: true },
  });

  const custBayCaMau = await prisma.customer.create({
    data: {
      customerCode: 'KH-002',
      name: 'Trần Văn Bảy',
      nickname: 'Chú Bảy Cà Mau',
      phone: '0903112334',
      idCard: '096082005678',
      address: 'Kênh Biện Nhị, Xã Tân Duyệt',
      district: 'Huyện Đầm Dơi',
      province: 'Cà Mau',
      tier: CustomerTier.SILVER,
      rewardPoints: 1120,
      creditLimit: 150000000,
      currentDebt: 92400000,
      notes: 'Mô hình tôm sú quảng canh cải tiến kết hợp cua biển 15 hecta.',
      ponds: {
        create: [
          {
            name: 'Đầm Nuôi Sú Quảng Canh Vùng Đầm Dơi',
            pondType: 'Đất tự nhiên rừng ngập mặn',
            areaM2: 150000,
            waterVolumeM3: 180000,
            targetSpecies: 'Tôm sú sinh thái & Cua Cà Mau',
            stockingDate: new Date('2026-06-15'),
            shrimpAgeDays: 136,
            status: 'Đang nuôi',
            notes: 'Chuẩn bị thu hoạch đợt rằm tháng tới',
          },
        ],
      },
    },
    include: { ponds: true },
  });

  const custMaiBaTri = await prisma.customer.create({
    data: {
      customerCode: 'KH-003',
      name: 'Lê Thị Mai',
      nickname: 'Chị Mai Ao Tròn',
      phone: '0939887665',
      idCard: '083185009876',
      address: 'Ấp Thạnh Hòa, Xã Bảo Thạnh',
      district: 'Huyện Ba Tri',
      province: 'Bến Tre',
      tier: CustomerTier.DIAMOND,
      rewardPoints: 6400,
      creditLimit: 300000000,
      currentDebt: 45000000,
      notes: 'Hộ nuôi tiêu biểu tỉnh Bến Tre, 4 ao tròn nổi tuần hoàn nước.',
      ponds: {
        create: [
          {
            name: 'Ao Tròn Nổi 1 (1.000m² - Nuôi Về Size Lớn)',
            pondType: 'Ao tròn khung sắt bạt HDPE',
            areaM2: 1000,
            waterVolumeM3: 1400,
            targetSpecies: 'Tôm thẻ chân trắng',
            stockingDate: new Date('2026-08-22'),
            shrimpAgeDays: 68,
            status: 'Đang nuôi',
            notes: 'Tôm đạt size 40 con/kg, phát triển cực tốt',
          },
          {
            name: 'Ao Tròn Nổi 2 (1.000m²)',
            pondType: 'Ao tròn khung sắt bạt HDPE',
            areaM2: 1000,
            waterVolumeM3: 1400,
            targetSpecies: 'Tôm thẻ chân trắng',
            stockingDate: new Date('2026-09-17'),
            shrimpAgeDays: 42,
            status: 'Đang nuôi',
            notes: 'Đang theo dõi chỉ số NO2',
          },
        ],
      },
    },
    include: { ponds: true },
  });

  const custDatBinhDai = await prisma.customer.create({
    data: {
      customerCode: 'KH-004',
      name: 'Phạm Quốc Đạt',
      nickname: 'Anh Ba Đạt',
      phone: '0919334488',
      idCard: '083088002345',
      address: 'Xã Thừa Đức',
      district: 'Huyện Bình Đại',
      province: 'Bến Tre',
      tier: CustomerTier.GOLD,
      rewardPoints: 3100,
      creditLimit: 250000000,
      currentDebt: 142000000,
      notes: 'Khu nuôi tôm 8 ao, sử dụng nhiều khoáng và vi sinh.',
      ponds: {
        create: [
          {
            name: 'Ao Nuôi Bờ Bạt A1',
            pondType: 'Ao đất lót bạt bờ',
            areaM2: 3500,
            waterVolumeM3: 4200,
            targetSpecies: 'Tôm thẻ chân trắng',
            stockingDate: new Date('2026-09-11'),
            shrimpAgeDays: 48,
            status: 'Đang nuôi',
          },
        ],
      },
    },
    include: { ponds: true },
  });

  const custHtxCuLao = await prisma.customer.create({
    data: {
      customerCode: 'KH-005',
      name: 'HTX Thủy Sản Cù Lao Dung (ĐD: Ông Huỳnh Văn Nam)',
      nickname: 'HTX Cù Lao Dung',
      phone: '02993888999',
      idCard: '094065008899',
      address: 'Xã An Thạnh 3',
      district: 'Huyện Cù Lao Dung',
      province: 'Sóc Trăng',
      tier: CustomerTier.DIAMOND,
      rewardPoints: 12500,
      creditLimit: 800000000,
      currentDebt: 380000000,
      notes: 'Hợp tác xã 18 ao nuôi quy mô lớn. Nhập thức ăn và khoáng số lượng tấn.',
      ponds: {
        create: [
          {
            name: 'Khu Ao Nuôi Tập Trung Cụm Bạt 1 (Ao 1-4)',
            pondType: 'Cụm ao bạt liên hoàn',
            areaM2: 12000,
            waterVolumeM3: 16000,
            targetSpecies: 'Tôm thẻ chân trắng siêu thâm canh',
            stockingDate: new Date('2026-09-09'),
            shrimpAgeDays: 50,
            status: 'Đang nuôi',
          },
        ],
      },
    },
    include: { ponds: true },
  });

  console.log('✅ Đã tạo 5 khách hàng & hợp tác xã trọng điểm kèm hồ sơ ao nuôi chi tiết.');

  // 5. Tạo Sổ nợ vụ nuôi (CropDebtLedger)
  const debtSauTung = await prisma.cropDebtLedger.create({
    data: {
      customerId: custSauTung.id,
      pondId: custSauTung.ponds[0].id,
      cropSeasonName: 'Vụ Nuôi Tôm Thẻ Mùa Mưa 2026 - Ao 1',
      initialDebt: 85000000,
      totalDebt: 185000000,
      dueDate: new Date('2026-12-15'),
      status: 'ACTIVE',
      notes: 'Hạn mức nợ 350tr. Cam kết thanh toán bằng tiền bán tôm cho công ty chế biến.',
    },
  });

  const debtBayCaMau = await prisma.cropDebtLedger.create({
    data: {
      customerId: custBayCaMau.id,
      pondId: custBayCaMau.ponds[0].id,
      cropSeasonName: 'Vụ Tôm Sú Sinh Thái Rừng Đước 2026',
      initialDebt: 50000000,
      totalDebt: 92400000,
      dueDate: new Date('2026-11-30'),
      status: 'ACTIVE',
      notes: 'Thanh toán đợt thu hoạch tôm sú rằm tháng 10 âm lịch.',
    },
  });

  const debtMaiBaTri = await prisma.cropDebtLedger.create({
    data: {
      customerId: custMaiBaTri.id,
      pondId: custMaiBaTri.ponds[0].id,
      cropSeasonName: 'Vụ Tôm Thẻ Ao Tròn Nổi Giai Đoạn 2',
      initialDebt: 25000000,
      totalDebt: 45000000,
      dueDate: new Date('2026-11-20'),
      status: 'ACTIVE',
      notes: 'Khách hàng Kim Cương, lịch sử thanh toán luôn đúng hạn.',
    },
  });

  console.log('✅ Đã khởi tạo sổ nợ vụ nuôi gắn liền từng ao và kỳ hạn thu hoạch.');

  // 6. Tạo Danh mục 30 Sản phẩm thực tế ngành Thủy sản (Products, Units, Batches & StockCards)
  interface SeedProductDef {
    sku: string;
    barcode: string;
    name: string;
    scientificName?: string;
    activeIngredients: string;
    category: ProductCategory;
    baseUnit: string;
    costPrice: number;
    retailPrice: number;
    wholesalePrice: number;
    usageInstructions: string;
    conversions: { unitName: string; conversionRate: number; price: number; isDefault?: boolean }[];
    batches: {
      batchNumber: string;
      mfgDate: string;
      expDate: string;
      qty: number;
      cost: number;
      status: BatchExpiryStatus;
      location: string;
    }[];
  }

  const productsCatalog: SeedProductDef[] = [
    // Nhóm 1: Xử lý nước & Diệt khuẩn
    {
      sku: 'YUC-LIQ-1L',
      barcode: '8936012340011',
      name: 'Yucca Cấp Tốc Hấp Thu Khí Độc Ao Tôm Nguyên Chất Mỹ (Chai 1L)',
      scientificName: 'Yucca Schidigera Extract 100%',
      activeIngredients: 'Chiết xuất cây Yucca Schidigera nguyên chất 100%, Saponin >= 12%',
      category: ProductCategory.WATER_TREATMENT,
      baseUnit: 'Chai',
      costPrice: 215000,
      retailPrice: 280000,
      wholesalePrice: 255000,
      usageInstructions: 'Cấp cứu khí độc tạt 1 lít/1.500m³ nước lúc 17h - 18h. Định kỳ 1 lít/3.000m³ nước 7 ngày/lần.',
      conversions: [
        { unitName: 'Thùng (12 Chai)', conversionRate: 12, price: 3200000, isDefault: false },
      ],
      batches: [
        { batchNumber: 'YC-202610-01', mfgDate: '2026-10-01', expDate: '2028-10-01', qty: 45, cost: 215000, status: BatchExpiryStatus.GOOD, location: 'Kệ A1 - Dược phẩm' },
        { batchNumber: 'YC-202511-88', mfgDate: '2025-11-15', expDate: '2026-11-15', qty: 12, cost: 210000, status: BatchExpiryStatus.NEAR_EXPIRY, location: 'Kệ A1 - Hàng ưu tiên xuất FEFO' },
      ],
    },
    {
      sku: 'IOD-9000-1L',
      barcode: '8936012340028',
      name: 'Dung Dịch Diệt Khuẩn Phổ Rộng Iodine 9000 Vemedim (Chai 1L)',
      scientificName: 'PVP-Iodine Complex',
      activeIngredients: 'Povidone Iodine 90g/L, dung môi đặc biệt an toàn cho tôm',
      category: ProductCategory.WATER_TREATMENT,
      baseUnit: 'Chai',
      costPrice: 190000,
      retailPrice: 245000,
      wholesalePrice: 225000,
      usageInstructions: 'Diệt khuẩn định kỳ: 1L cho 3.000m³ nước ao nuôi. Trị phát sáng, đứt râu: 1L cho 2.000m³ vào chiều mát.',
      conversions: [
        { unitName: 'Thùng (12 Chai)', conversionRate: 12, price: 2800000 },
      ],
      batches: [
        { batchNumber: 'IOD-202608-04', mfgDate: '2026-08-10', expDate: '2028-08-10', qty: 60, cost: 190000, status: BatchExpiryStatus.GOOD, location: 'Kệ A2 - Diệt khuẩn' },
      ],
    },
    {
      sku: 'BKC-80-CAN5L',
      barcode: '8936012340035',
      name: 'Thuốc Diệt Khuẩn Ao BKC 80% Super Tech (Can 5L)',
      scientificName: 'Benzalkonium Chloride 80%',
      activeIngredients: 'Benzalkonium Chloride 80% w/v',
      category: ProductCategory.WATER_TREATMENT,
      baseUnit: 'Can',
      costPrice: 420000,
      retailPrice: 530000,
      wholesalePrice: 485000,
      usageInstructions: 'Tạt 1 lít/2.000m³ nước khi trời nắng gắt để cắt tảo độc và diệt khuẩn bám mình tôm.',
      conversions: [
        { unitName: 'Phuy (200 Lít)', conversionRate: 40, price: 19500000 },
      ],
      batches: [
        { batchNumber: 'BKC-2605-12', mfgDate: '2026-05-15', expDate: '2028-05-15', qty: 25, cost: 420000, status: BatchExpiryStatus.GOOD, location: 'Kho Hóa Chất Ngoài Trời' },
      ],
    },
    {
      sku: 'OXY-VIEN-25KG',
      barcode: '8936012340042',
      name: 'Oxy Viên Cấp Cứu Ao Tôm Sodium Percarbonate (Bao 25kg)',
      scientificName: 'Sodium Percarbonate Coated 2Na2CO3.3H2O2',
      activeIngredients: 'Sodium Percarbonate hạt chìm đáy, Oxy hoạt tính >= 13.5%',
      category: ProductCategory.WATER_TREATMENT,
      baseUnit: 'Bao',
      costPrice: 720000,
      retailPrice: 890000,
      wholesalePrice: 820000,
      usageInstructions: 'Cấp cứu tôm nổi đầu rạng sáng: rải đều 2 - 3kg/1.000m² ngay vị trí quạt nước và góc ao.',
      conversions: [
        { unitName: 'Kg', conversionRate: 0.04, price: 40000 },
        { unitName: 'Xô (5kg)', conversionRate: 0.2, price: 210000 },
      ],
      batches: [
        { batchNumber: 'OXY-202609-99', mfgDate: '2026-09-01', expDate: '2028-09-01', qty: 85, cost: 720000, status: BatchExpiryStatus.GOOD, location: 'Kho Trung Tâm - Kệ Nặng B1' },
      ],
    },
    {
      sku: 'GLUTAR-50-CAN5L',
      barcode: '8936012340059',
      name: 'Chế Phẩm Trị Đốm Đen & Ngoại Ký Sinh Glutaraldehyde 50% (Can 5L)',
      scientificName: 'Glutaraldehyde Solution 50%',
      activeIngredients: 'Glutaraldehyde 500g/L',
      category: ProductCategory.WATER_TREATMENT,
      baseUnit: 'Can',
      costPrice: 510000,
      retailPrice: 650000,
      wholesalePrice: 590000,
      usageInstructions: 'Trị bệnh đốm đen, mòn đuôi: 1L cho 2.500m³ nước, đánh lúc 15h chiều mát.',
      conversions: [],
      batches: [
        { batchNumber: 'GLU-2607-02', mfgDate: '2026-07-20', expDate: '2028-07-20', qty: 30, cost: 510000, status: BatchExpiryStatus.GOOD, location: 'Kệ A2' },
      ],
    },

    // Nhóm 2: Vi sinh & Chế phẩm sinh học
    {
      sku: 'BIO-BZT-500G',
      barcode: '8936012340066',
      name: 'Men Vi Sinh Xử Lý Đáy & Phân Hủy Khí Độc Bio-Active BZT (Gói 500g)',
      scientificName: 'Bacillus subtilis, B. licheniformis, B. megaterium',
      activeIngredients: 'Bacillus subtilis >= 10^9 CFU/g, Protease, Amylase, Cellulase hoạt tính cao',
      category: ProductCategory.PROBIOTIC,
      baseUnit: 'Gói',
      costPrice: 165000,
      retailPrice: 210000,
      wholesalePrice: 190000,
      usageInstructions: 'Ủ với 2kg mật rỉ đường + 50L nước ao trong 4-6 tiếng, tạt lúc 9h sáng khi trời nắng đẹp.',
      conversions: [
        { unitName: 'Thùng (20 Gói)', conversionRate: 20, price: 3950000, isDefault: true },
      ],
      batches: [
        { batchNumber: 'BIO-2609-88', mfgDate: '2026-09-10', expDate: '2028-09-10', qty: 120, cost: 165000, status: BatchExpiryStatus.GOOD, location: 'Kệ Vi Sinh C1' },
      ],
    },
    {
      sku: 'RHODO-ACT-CAN5L',
      barcode: '8936012340073',
      name: 'Vi Sinh Quang Dưỡng Rhodo-Active Khử Khí Độc H2S Đáy Ao (Can 5L)',
      scientificName: 'Rhodobacter sphaeroides, Rhodopseudomonas palustris',
      activeIngredients: 'Vi khuẩn quang hợp Rhodobacter sphaeroides >= 10^9 CFU/ml',
      category: ProductCategory.PROBIOTIC,
      baseUnit: 'Can',
      costPrice: 320000,
      retailPrice: 420000,
      wholesalePrice: 380000,
      usageInstructions: 'Tạt trực tiếp 5 lít/2.000m³ nước lúc 10h trưa nắng gắt để hấp thu hoàn toàn khí độc H2S phát sinh từ bùn đáy.',
      conversions: [
        { unitName: 'Can (20L)', conversionRate: 4, price: 1550000 },
      ],
      batches: [
        { batchNumber: 'RHO-202608-15', mfgDate: '2026-08-15', expDate: '2027-08-15', qty: 40, cost: 320000, status: BatchExpiryStatus.GOOD, location: 'Kệ Vi Sinh C2' },
      ],
    },
    {
      sku: 'EM-ZONE-500G',
      barcode: '8936012340080',
      name: 'Men Vi Sinh Emzone Cắt Tảo Lam & Tảo Giáp Độc (Gói 500g)',
      scientificName: 'Probiotic Enzyme Complex for Algae Control',
      activeIngredients: 'Enzyme Algalase, Bacillus pumilus >= 2.5 x 10^9 CFU/g',
      category: ProductCategory.PROBIOTIC,
      baseUnit: 'Gói',
      costPrice: 180000,
      retailPrice: 235000,
      wholesalePrice: 210000,
      usageInstructions: 'Đánh vào ban đêm (21h - 22h) để cắt tảo tàn êm dịu, không gây sốc tôm. Liều 500g/2.000m³.',
      conversions: [
        { unitName: 'Thùng (24 Gói)', conversionRate: 24, price: 5200000 },
      ],
      batches: [
        { batchNumber: 'EMZ-202610-09', mfgDate: '2026-10-05', expDate: '2028-10-05', qty: 75, cost: 180000, status: BatchExpiryStatus.GOOD, location: 'Kệ Vi Sinh C1' },
      ],
    },
    {
      sku: 'TOI-DEN-CAN5L',
      barcode: '8936012340097',
      name: 'Men Tỏi Đen Lên Men Tự Nhiên Trị Nhiễm Khuẩn Đường Ruột (Can 5L)',
      scientificName: 'Fermented Black Garlic Extract + Probiotics',
      activeIngredients: 'Allicin tự nhiên đậm đặc, Lactobacillus acidophilus',
      category: ProductCategory.PROBIOTIC,
      baseUnit: 'Can',
      costPrice: 280000,
      retailPrice: 360000,
      wholesalePrice: 325000,
      usageInstructions: 'Trộn 10ml - 15ml/kg thức ăn, cho ăn liên tục trong suốt vụ nuôi để tạo rào cản kháng khuẩn.',
      conversions: [],
      batches: [
        { batchNumber: 'TOI-202607-33', mfgDate: '2026-07-01', expDate: '2027-07-01', qty: 50, cost: 280000, status: BatchExpiryStatus.GOOD, location: 'Kệ Dinh Dưỡng D1' },
      ],
    },

    // Nhóm 3: Thức ăn tôm cá
    {
      sku: 'FEED-CP-NO1-25KG',
      barcode: '8936012340103',
      name: 'Thức Ăn Tôm Thẻ C.P. Super Nova 5001 Đạm 42% (Bao 25kg)',
      scientificName: 'CP Shrimp Feed No.1 - Pellet Size 1.0mm',
      activeIngredients: 'Đạm thô >= 42%, Béo thô >= 6.5%, Xơ thô <= 3.0%, Tro thô <= 15%',
      category: ProductCategory.AQUA_FEED,
      baseUnit: 'Bao',
      costPrice: 590000,
      retailPrice: 685000,
      wholesalePrice: 650000,
      usageInstructions: 'Dùng cho tôm từ 15 đến 35 ngày tuổi. Cho ăn 4 - 5 cữ/ngày theo bảng trọng lượng chuẩn.',
      conversions: [
        { unitName: 'Kg', conversionRate: 0.04, price: 29000 },
        { unitName: 'Tấn (40 Bao)', conversionRate: 40, price: 25600000 },
      ],
      batches: [
        { batchNumber: 'FEED-CP-892', mfgDate: '2026-09-20', expDate: '2027-03-20', qty: 250, cost: 590000, status: BatchExpiryStatus.GOOD, location: 'Kho Thức Ăn C.P. - Dãy 1' },
      ],
    },
    {
      sku: 'FEED-CP-NO2-25KG',
      barcode: '8936012340110',
      name: 'Thức Ăn Tôm Thẻ C.P. Super Nova 5002 Đạm 40% (Bao 25kg)',
      scientificName: 'CP Shrimp Feed No.2 - Pellet Size 1.4mm',
      activeIngredients: 'Đạm thô >= 40%, Béo thô >= 6.0%, Xơ thô <= 3.5%',
      category: ProductCategory.AQUA_FEED,
      baseUnit: 'Bao',
      costPrice: 575000,
      retailPrice: 668000,
      wholesalePrice: 635000,
      usageInstructions: 'Dùng cho tôm từ 35 đến 60 ngày tuổi. Điều chỉnh lượng ăn dựa trên sàng ăn thực tế.',
      conversions: [
        { unitName: 'Kg', conversionRate: 0.04, price: 28000 },
        { unitName: 'Tấn (40 Bao)', conversionRate: 40, price: 25000000 },
      ],
      batches: [
        { batchNumber: 'FEED-CP-904', mfgDate: '2026-09-25', expDate: '2027-03-25', qty: 320, cost: 575000, status: BatchExpiryStatus.GOOD, location: 'Kho Thức Ăn C.P. - Dãy 2' },
      ],
    },
    {
      sku: 'FEED-GROBEST-S2',
      barcode: '8936012340127',
      name: 'Thức Ăn Tôm Thẻ Grobest Gold Shield S2 Đạm 40% (Bao 25kg)',
      scientificName: 'Grobest Functional Immune Shrimp Feed S2',
      activeIngredients: 'Bổ sung peptide kháng khuẩn sinh học độc quyền, Đạm >= 40%',
      category: ProductCategory.AQUA_FEED,
      baseUnit: 'Bao',
      costPrice: 610000,
      retailPrice: 710000,
      wholesalePrice: 675000,
      usageInstructions: 'Dòng thức ăn chức năng tăng cường hệ miễn dịch gan tụy và phòng chống bệnh đường ruột.',
      conversions: [
        { unitName: 'Kg', conversionRate: 0.04, price: 30000 },
        { unitName: 'Tấn (40 Bao)', conversionRate: 40, price: 26600000 },
      ],
      batches: [
        { batchNumber: 'GRO-S2-2609', mfgDate: '2026-09-18', expDate: '2027-03-18', qty: 180, cost: 610000, status: BatchExpiryStatus.GOOD, location: 'Kho Thức Ăn Grobest - Dãy 3' },
      ],
    },
    {
      sku: 'FEED-DEHEUS-SU-25KG',
      barcode: '8936012340134',
      name: 'Thức Ăn Tôm Sú De Heus Ruby Đạm 44% (Bao 25kg)',
      scientificName: 'De Heus Black Tiger Shrimp Feed Ruby 44',
      activeIngredients: 'Đạm thô hảo hạng >= 44%, Kích thích bắt mồi nhanh, không tan rã trong nước 3h',
      category: ProductCategory.AQUA_FEED,
      baseUnit: 'Bao',
      costPrice: 640000,
      retailPrice: 745000,
      wholesalePrice: 710000,
      usageInstructions: 'Dành riêng cho mô hình tôm sú công nghệ cao và quảng canh cải tiến.',
      conversions: [
        { unitName: 'Kg', conversionRate: 0.04, price: 32000 },
      ],
      batches: [
        { batchNumber: 'DH-RUBY-2608', mfgDate: '2026-08-30', expDate: '2027-02-28', qty: 90, cost: 640000, status: BatchExpiryStatus.GOOD, location: 'Kho Thức Ăn De Heus' },
      ],
    },

    // Nhóm 4: Khoáng & Dinh dưỡng ao nuôi
    {
      sku: 'KHOANG-CALCI-25KG',
      barcode: '8936012340141',
      name: 'Khoáng Tạt Cứng Vỏ Nhanh Calci-Phos Cao Cấp C.P. (Bao 25kg)',
      scientificName: 'Chelated Macro & Micro Minerals for Crustaceans',
      activeIngredients: 'Canxi (Ca) >= 18%, Phốt pho (P) >= 8%, Magie (Mg) >= 5%, Kali (K) >= 4%',
      category: ProductCategory.MINERAL_NUTRITION,
      baseUnit: 'Bao',
      costPrice: 340000,
      retailPrice: 430000,
      wholesalePrice: 395000,
      usageInstructions: 'Tạt 5kg/1.000m³ trước khi tôm lột xác 2 giờ (thường lúc 20h - 22h đêm). Giúp vỏ tôm cứng bóng sau 3 giờ.',
      conversions: [
        { unitName: 'Kg', conversionRate: 0.04, price: 19000 },
        { unitName: 'Tấn (40 Bao)', conversionRate: 40, price: 15400000 },
      ],
      batches: [
        { batchNumber: 'MIN-CP-2608', mfgDate: '2026-08-01', expDate: '2028-08-01', qty: 150, cost: 340000, status: BatchExpiryStatus.GOOD, location: 'Kho Khoáng Sản Phẩm' },
      ],
    },
    {
      sku: 'SODA-SOLVAY-25KG',
      barcode: '8936012340158',
      name: 'Soda Nóng NaHCO3 Solvay Ý Tăng Kiềm Nhanh 99.2% (Bao 25kg)',
      scientificName: 'Sodium Bicarbonate Technical Grade 99.2%',
      activeIngredients: 'NaHCO3 >= 99.2%, Hàm lượng kiềm tự do cực thấp',
      category: ProductCategory.MINERAL_NUTRITION,
      baseUnit: 'Bao',
      costPrice: 285000,
      retailPrice: 360000,
      wholesalePrice: 330000,
      usageInstructions: 'Tăng độ kiềm cấp tốc: Đánh 10 - 15kg/1.000m³ vào ban đêm giúp kiềm tăng 15-20 ppm ổn định.',
      conversions: [
        { unitName: 'Kg', conversionRate: 0.04, price: 16000 },
        { unitName: 'Tấn (40 Bao)', conversionRate: 40, price: 12800000 },
      ],
      batches: [
        { batchNumber: 'SOL-202607-77', mfgDate: '2026-07-15', expDate: '2029-07-15', qty: 220, cost: 285000, status: BatchExpiryStatus.GOOD, location: 'Kho Hóa Chất Cơ Bản' },
      ],
    },
    {
      sku: 'KALI-ISRAEL-25KG',
      barcode: '8936012340165',
      name: 'Kali Clorua KCl Tinh Khiết Israel Trị Đục Cơ & Cong Thân (Bao 25kg)',
      scientificName: 'Potassium Chloride White Powder 99%',
      activeIngredients: 'KCl >= 99%, K2O >= 60%',
      category: ProductCategory.MINERAL_NUTRITION,
      baseUnit: 'Bao',
      costPrice: 410000,
      retailPrice: 515000,
      wholesalePrice: 475000,
      usageInstructions: 'Cân bằng ion K/Na trong nước ao độ mặn thấp. Đánh 5 - 10kg/1.000m³ khi tôm có biểu hiện đục cơ.',
      conversions: [
        { unitName: 'Kg', conversionRate: 0.04, price: 23000 },
      ],
      batches: [
        { batchNumber: 'KCL-2606-11', mfgDate: '2026-06-01', expDate: '2029-06-01', qty: 95, cost: 410000, status: BatchExpiryStatus.GOOD, location: 'Kho Khoáng Sản Phẩm' },
      ],
    },
    {
      sku: 'MAGIE-MGCL2-25KG',
      barcode: '8936012340172',
      name: 'Magie Clorua MgCl2 Vảy Trắng Kích Thích Lột Xác Đồng Loạt (Bao 25kg)',
      scientificName: 'Magnesium Chloride Flakes 99%',
      activeIngredients: 'MgCl2 >= 99%',
      category: ProductCategory.MINERAL_NUTRITION,
      baseUnit: 'Bao',
      costPrice: 230000,
      retailPrice: 295000,
      wholesalePrice: 270000,
      usageInstructions: 'Duy trì tỷ lệ Mg:Ca:K = 3:1:1. Tạt 10kg/1.000m³ nước định kỳ 5 ngày/lần.',
      conversions: [],
      batches: [
        { batchNumber: 'MG-202605-88', mfgDate: '2026-05-10', expDate: '2029-05-10', qty: 110, cost: 230000, status: BatchExpiryStatus.GOOD, location: 'Kho Khoáng Sản Phẩm' },
      ],
    },
    {
      sku: 'DOLOMITE-50KG',
      barcode: '8936012340189',
      name: 'Vôi Nông Nghiệp Dolomite Xám Siêu Mịn Nâng Kiềm Ổn Định (Bao 50kg)',
      scientificName: 'Calcium Magnesium Carbonate CaMg(CO3)2',
      activeIngredients: 'CaCO3 >= 54%, MgCO3 >= 36%',
      category: ProductCategory.MINERAL_NUTRITION,
      baseUnit: 'Bao',
      costPrice: 85000,
      retailPrice: 115000,
      wholesalePrice: 102000,
      usageInstructions: 'Rải đáy ao khi cải tạo hoặc tạt trực tiếp 20kg/1.000m³ để ổn định hệ đệm nước ao tôm.',
      conversions: [
        { unitName: 'Tấn (20 Bao)', conversionRate: 20, price: 1980000 },
      ],
      batches: [
        { batchNumber: 'DOLO-202609', mfgDate: '2026-09-01', expDate: '2029-09-01', qty: 300, cost: 85000, status: BatchExpiryStatus.GOOD, location: 'Sân Kho Ngoài Trời' },
      ],
    },

    // Nhóm 5: Thuốc thú y thủy sản, Dược liệu gan & Men ruột
    {
      sku: 'HEPA-MAX-1L',
      barcode: '8936012340196',
      name: 'Thảo Dược Bổ Gan Tôm Tạt & Trộn Ăn Hepa-Max Vemedim (Chai 1L)',
      scientificName: 'Herbal Hepatoprotective Liquid',
      activeIngredients: 'Chiết xuất Diệp hạ châu, Actiso, Inositol, Sorbitol đậm đặc',
      category: ProductCategory.AQUA_MEDICINE,
      baseUnit: 'Chai',
      costPrice: 260000,
      retailPrice: 345000,
      wholesalePrice: 310000,
      usageInstructions: 'Phòng ngừa: trộn 5ml/kg thức ăn. Hỗ trợ điều trị gan sưng, gan teo, mờ gan: tạt 1L/1.000m³ nước kết hợp trộn 10ml/kg thức ăn.',
      conversions: [
        { unitName: 'Thùng (12 Chai)', conversionRate: 12, price: 3950000 },
      ],
      batches: [
        { batchNumber: 'HEP-202609-02', mfgDate: '2026-09-05', expDate: '2028-09-05', qty: 80, cost: 260000, status: BatchExpiryStatus.GOOD, location: 'Kệ Thuốc Gan D2' },
      ],
    },
    {
      sku: 'MEGA-ENZYME-500G',
      barcode: '8936012340202',
      name: 'Men Tiêu Hóa Nong To Đường Ruột Ngừa Phân Trắng Mega-Enzyme (Gói 500g)',
      scientificName: 'High Potency Digestive Enzyme Complex',
      activeIngredients: 'Amylase, Phytase, Protease, Xylanase, Beta-Glucanase',
      category: ProductCategory.AQUA_MEDICINE,
      baseUnit: 'Gói',
      costPrice: 175000,
      retailPrice: 230000,
      wholesalePrice: 205000,
      usageInstructions: 'Trộn 3 - 5g/kg thức ăn mỗi ngày. Giúp ruột tôm to tròn đều, phân dài, không bị đứt khúc.',
      conversions: [
        { unitName: 'Thùng (20 Gói)', conversionRate: 20, price: 4350000 },
      ],
      batches: [
        { batchNumber: 'ENZ-202608-20', mfgDate: '2026-08-12', expDate: '2028-08-12', qty: 95, cost: 175000, status: BatchExpiryStatus.GOOD, location: 'Kệ Thuốc Đường Ruột D3' },
      ],
    },
    {
      sku: 'BETA-GLUCAN-1KG',
      barcode: '8936012340219',
      name: 'Beta-Glucan 50% Tăng Cường Miễn Dịch & Chống Sốc Môi Trường (Gói 1kg)',
      scientificName: 'Beta-(1,3/1,6)-D-Glucan from Yeast',
      activeIngredients: 'Beta-Glucan tinh chế >= 50%, Mannan Oligosaccharide (MOS)',
      category: ProductCategory.AQUA_MEDICINE,
      baseUnit: 'Gói',
      costPrice: 290000,
      retailPrice: 380000,
      wholesalePrice: 345000,
      usageInstructions: 'Cho ăn 5g/kg thức ăn trước những ngày thời tiết biến động hoặc trước khi sang ao nuôi mới.',
      conversions: [
        { unitName: 'Thùng (10 Gói)', conversionRate: 10, price: 3600000 },
      ],
      batches: [
        { batchNumber: 'BG-2607-15', mfgDate: '2026-07-10', expDate: '2028-07-10', qty: 60, cost: 290000, status: BatchExpiryStatus.GOOD, location: 'Kệ Dinh Dưỡng D1' },
      ],
    },
    {
      sku: 'VIT-C-99-1KG',
      barcode: '8936012340226',
      name: 'Vitamin C Tạt & Trộn Ăn Chống Sốc Khi Mưa Đột Ngột 99% (Gói 1kg)',
      scientificName: 'Coated Ascorbic Acid 99%',
      activeIngredients: 'L-Ascorbic Acid bọc màng vi nang chống oxy hóa >= 99%',
      category: ProductCategory.AQUA_MEDICINE,
      baseUnit: 'Gói',
      costPrice: 135000,
      retailPrice: 185000,
      wholesalePrice: 165000,
      usageInstructions: 'Tạt 1kg/1.000m³ khi trời chuyển mưa lớn hoặc khi thay nước ao đột ngột.',
      conversions: [
        { unitName: 'Thùng (25 Gói)', conversionRate: 25, price: 4300000 },
      ],
      batches: [
        { batchNumber: 'VITC-2609-08', mfgDate: '2026-09-01', expDate: '2028-09-01', qty: 110, cost: 135000, status: BatchExpiryStatus.GOOD, location: 'Kệ Dinh Dưỡng D1' },
      ],
    },
    {
      sku: 'EMS-PROTECT-1L',
      barcode: '8936012340233',
      name: 'Thảo Dược Đặc Trị Hội Chứng Hoại Tử Gan Tụy Cấp EMS Thần Vương (Chai 1L)',
      scientificName: 'Anti-AHPND/EMS Herbal Essence',
      activeIngredients: 'Phức hệ Flavonoid thực vật, Berberin, Nano Bạc hữu cơ',
      category: ProductCategory.AQUA_MEDICINE,
      baseUnit: 'Chai',
      costPrice: 380000,
      retailPrice: 495000,
      wholesalePrice: 450000,
      usageInstructions: 'Trộn ăn 15ml/kg thức ăn khi tôm có hiện tượng mờ gan trong 30 ngày tuổi đầu tiên.',
      conversions: [],
      batches: [
        { batchNumber: 'EMS-202610-18', mfgDate: '2026-10-10', expDate: '2028-10-10', qty: 45, cost: 380000, status: BatchExpiryStatus.GOOD, location: 'Kệ Thuốc Gan D2' },
      ],
    },

    // Nhóm 6: Thiết bị & Máy móc cơ điện ao nuôi
    {
      sku: 'MOTOR-THC-3HP',
      barcode: '8936012340240',
      name: 'Động Cơ Quạt Nước Tân Hoàn Cầu 3HP (2.2kW) 3 Pha Chuyên Nuôi Tôm',
      scientificName: 'Electric Motor 3HP 380V - IP55 Marine Grade',
      activeIngredients: 'Dây đồng 100%, Trục Inox 304 chống rỉ sét, Bạc đạn NSK Nhật Bản siêu bền',
      category: ProductCategory.EQUIPMENT_SUPPLIES,
      baseUnit: 'Cái',
      costPrice: 3850000,
      retailPrice: 4650000,
      wholesalePrice: 4350000,
      usageInstructions: 'Lắp ráp cho giàn quạt nước 8 - 12 cánh. Kiểm tra dầu hộp số định kỳ mỗi 60 ngày.',
      conversions: [],
      batches: [
        { batchNumber: 'MOT-2026-991', mfgDate: '2026-08-01', expDate: '2031-08-01', qty: 15, cost: 3850000, status: BatchExpiryStatus.GOOD, location: 'Kho Thiết Bị Cơ Điện' },
      ],
    },
    {
      sku: 'CANH-QUAT-8C',
      barcode: '8936012340257',
      name: 'Cánh Quạt Đập Nước Nuôi Tôm 8 Cánh Nhựa PP Nguyên Sinh Chống Gãy',
      scientificName: 'Polypropylene 8-Blade Paddlewheel Aerator',
      activeIngredients: 'Nhựa PP kỹ thuật kháng tia UV, chịu tải sóng biển cao',
      category: ProductCategory.EQUIPMENT_SUPPLIES,
      baseUnit: 'Cái',
      costPrice: 120000,
      retailPrice: 165000,
      wholesalePrice: 145000,
      usageInstructions: 'Lắp trục láp phi 34 hoặc 38mm. Tạo dòng chảy gom bùn tốt và cung cấp oxy dồi dào.',
      conversions: [
        { unitName: 'Kiện (10 Cái)', conversionRate: 10, price: 1550000 },
      ],
      batches: [
        { batchNumber: 'PADDLE-202609', mfgDate: '2026-09-01', expDate: '2036-09-01', qty: 120, cost: 120000, status: BatchExpiryStatus.GOOD, location: 'Kho Thiết Bị Cơ Điện' },
      ],
    },
    {
      sku: 'ONG-NANO-100M',
      barcode: '8936012340264',
      name: 'Ống Xốp Nano Tạo Oxy Đáy Ao Nuôi Tôm Siêu Bọt Khí (Cuộn 100m)',
      scientificName: 'Micro-Porous Aeration Nano Tube 12x25mm',
      activeIngredients: 'Cao su EPDM xốp bọt khí nano siêu mịn',
      category: ProductCategory.EQUIPMENT_SUPPLIES,
      baseUnit: 'Cuộn',
      costPrice: 950000,
      retailPrice: 1280000,
      wholesalePrice: 1150000,
      usageInstructions: 'Cắt đoạn 1m uốn thành vòng cung hoặc hình chữ nhật, nối với máy thổi khí con sò 5.5HP.',
      conversions: [
        { unitName: 'Mét', conversionRate: 0.01, price: 15000 },
      ],
      batches: [
        { batchNumber: 'TUBE-202608', mfgDate: '2026-08-10', expDate: '2031-08-10', qty: 35, cost: 950000, status: BatchExpiryStatus.GOOD, location: 'Kho Thiết Bị Cơ Điện' },
      ],
    },
    {
      sku: 'MAY-CHO-AN-50KG',
      barcode: '8936012340271',
      name: 'Máy Cho Tôm Ăn Tự Động Định Giờ 50kg Inox 304 Toàn Phần',
      scientificName: 'Automated Solar/Electric Shrimp Feeder 50kg Inox 304',
      activeIngredients: 'Thùng chứa Inox 304 dày 1.2mm, Bo mạch hẹn giờ kỹ thuật số chống ẩm',
      category: ProductCategory.EQUIPMENT_SUPPLIES,
      baseUnit: 'Cái',
      costPrice: 2800000,
      retailPrice: 3500000,
      wholesalePrice: 3200000,
      usageInstructions: 'Cài đặt chu kỳ quăng cám 5 giây/lần, ngưng 15 giây. Bắn xa bán kính 8 - 12 mét.',
      conversions: [],
      batches: [
        { batchNumber: 'FEEDER-202609', mfgDate: '2026-09-15', expDate: '2031-09-15', qty: 10, cost: 2800000, status: BatchExpiryStatus.GOOD, location: 'Kệ Thiết Bị Bán Lẻ' },
      ],
    },
    {
      sku: 'TESTKIT-SERA-4IN1',
      barcode: '8936012340288',
      name: 'Bộ Test Kit Thử Mẫu Nước Ao Tôm Sera Đức (Đo pH, NO2, NH3, KH)',
      scientificName: 'Sera Water Quality Chemical Test Kit Box',
      activeIngredients: 'Dung dịch thuốc thử chuẩn độ màu chính xác cao',
      category: ProductCategory.EQUIPMENT_SUPPLIES,
      baseUnit: 'Bộ',
      costPrice: 680000,
      retailPrice: 850000,
      wholesalePrice: 780000,
      usageInstructions: 'Nhỏ thuốc thử theo đúng số giọt hướng dẫn, so màu trên thang đo để xác định chính xác nồng độ độc chất.',
      conversions: [],
      batches: [
        { batchNumber: 'SERA-202609', mfgDate: '2026-09-01', expDate: '2029-09-01', qty: 25, cost: 680000, status: BatchExpiryStatus.GOOD, location: 'Phòng Xét Nghiệm Nước' },
      ],
    },
    {
      sku: 'BOM-CHIM-2HP',
      barcode: '8936012340295',
      name: 'Máy Bơm Chìm Đẩy Nước Mặn Thân Gang Cánh Đồng 2HP (1.5kW)',
      scientificName: 'Submersible Seawater Pump 2HP Single Phase',
      activeIngredients: 'Thân gang phủ sơn chống ăn mòn nước mặn, Phốt cơ khí carbon-ceramic',
      category: ProductCategory.EQUIPMENT_SUPPLIES,
      baseUnit: 'Cái',
      costPrice: 2450000,
      retailPrice: 3100000,
      wholesalePrice: 2850000,
      usageInstructions: 'Lưu lượng 45m³/giờ, cột áp cao 12 mét. Sử dụng bơm cấp nước và xi phông đáy ao.',
      conversions: [],
      batches: [
        { batchNumber: 'PUMP-2026-04', mfgDate: '2026-07-20', expDate: '2031-07-20', qty: 8, cost: 2450000, status: BatchExpiryStatus.GOOD, location: 'Kho Thiết Bị Cơ Điện' },
      ],
    },
  ];

  const createdProductsMap = new Map<string, any>();

  for (const p of productsCatalog) {
    const productRecord = await prisma.product.create({
      data: {
        sku: p.sku,
        barcode: p.barcode,
        name: p.name,
        scientificName: p.scientificName,
        activeIngredients: p.activeIngredients,
        category: p.category,
        baseUnit: p.baseUnit,
        costPrice: p.costPrice,
        retailPrice: p.retailPrice,
        wholesalePrice: p.wholesalePrice,
        usageInstructions: p.usageInstructions,
        minStockAlert: 10,
        maxStockAlert: 500,
        active: true,
      },
    });

    createdProductsMap.set(p.sku, productRecord);

    // Tạo các đơn vị quy đổi
    for (const conv of p.conversions) {
      await prisma.unitConversion.create({
        data: {
          productId: productRecord.id,
          unitName: conv.unitName,
          conversionRate: conv.conversionRate,
          price: conv.price,
          isDefaultSaleUnit: conv.isDefault || false,
        },
      });
    }

    // Tạo các lô hàng thực tế (FEFO) và ghi nhận Thẻ kho (StockCard) ban đầu
    for (const b of p.batches) {
      const batchRecord = await prisma.batch.create({
        data: {
          productId: productRecord.id,
          batchNumber: b.batchNumber,
          manufacturingDate: new Date(b.mfgDate),
          expiryDate: new Date(b.expDate),
          quantity: b.qty,
          costPrice: b.cost,
          status: b.status,
          warehouseLocation: b.location,
        },
      });

      // Tạo thẻ kho lịch sử nhập kho ban đầu
      await prisma.stockCard.create({
        data: {
          productId: productRecord.id,
          batchId: batchRecord.id,
          transactionType: StockTransactionType.PURCHASE_RECEIPT,
          documentNo: `#PO-INIT-${b.batchNumber}`,
          staffId: staffThanh.id,
          changeQuantity: b.qty,
          balanceAfter: b.qty,
          unitPrice: b.cost,
          reasonNote: `Nhập tồn đầu kỳ cho lô ${b.batchNumber} tại vị trí ${b.location}`,
          createdAt: new Date(b.mfgDate),
        },
      });
    }
  }

  console.log(`✅ Đã tạo thành công ${productsCatalog.length} mặt hàng thực tế kèm quy đổi đơn vị và lô FEFO.`);

  // 7. Tạo Phiếu xét nghiệm nước & Toa thuốc điều trị thực tế (Lab Water Test & Prescriptions)
  const prodYucca = createdProductsMap.get('YUC-LIQ-1L');
  const prodHepa = createdProductsMap.get('HEPA-MAX-1L');
  const prodSoda = createdProductsMap.get('SODA-SOLVAY-25KG');
  const prodBioBzt = createdProductsMap.get('BIO-BZT-500G');
  const prodOxy = createdProductsMap.get('OXY-VIEN-25KG');

  const presSauTung = await prisma.waterTestPrescription.create({
    data: {
      prescriptionCode: 'TOA-20261029-01',
      customerId: custSauTung.id,
      pondId: custSauTung.ponds[0].id, // Ao Số 1
      technicianId: staffMinhAnh.id,
      testDate: new Date('2026-10-29T08:30:00Z'),
      ph: 7.4,
      alkalinity: 95.0, // Thấp (< 120)
      salinization: 15.0,
      no2: 3.5, // Rất cao (> 1.0 là độc)
      nh3: 0.8,
      h2s: 0.05,
      dissolvedO2: 3.8, // Thấp (< 4.5)
      tempC: 28.5,
      symptoms: 'Tôm lội bờ rải rác sau cơn mưa lớn đêm qua, gan teo nhẹ, ruột đứt khúc phân lỏng.',
      diagnosis: 'Khí độc NO2 bùng phát kết hợp tụt pH và tụt kiềm sau mưa lớn, nguy cơ hoại tử gan tụy sớm.',
      treatmentPlan: 'Cấp cứu ngay: Rải Oxy viên và tạt Yucca hạ khí độc lúc 18h. Tạt Soda nóng Solvay nâng kiềm lúc 21h. Sáng mai trộn Thảo dược Hepa-Max và Bio-BZT cho ăn.',
      status: PrescriptionStatus.DISPATCHED_TO_POS,
      notes: 'Đã xuất chỉ định sang quầy thu ngân POS để xuất bán nợ vụ nuôi cho Chú Sáu Tùng.',
      items: {
        create: [
          {
            productId: prodYucca.id,
            unitName: 'Chai',
            quantity: 2,
            dosageAfternoon: 'Tạt 2 chai (2L) cho 3.200m³ lúc 17h30 chiều',
            daysDuration: 1,
            instructions: 'Bật toàn bộ giàn quạt nước khi tạt',
          },
          {
            productId: prodOxy.id,
            unitName: 'Bao',
            quantity: 1,
            dosageAfternoon: 'Rải 15kg viên chìm tại khu vực tụ khí độc lúc 18h',
            daysDuration: 1,
            instructions: 'Rải cách xa mép bờ 3 mét',
          },
          {
            productId: prodSoda.id,
            unitName: 'Bao',
            quantity: 2,
            dosageAfternoon: 'Ngâm tan tạt 50kg lúc 21h đêm để nâng kiềm lên 120 ppm',
            daysDuration: 2,
            instructions: 'Tạt đều khắp ao',
          },
          {
            productId: prodHepa.id,
            unitName: 'Chai',
            quantity: 3,
            dosageMorning: 'Trộn 10ml/kg thức ăn cữ 7h sáng',
            dosageNoon: 'Trộn 10ml/kg thức ăn cữ 11h trưa',
            daysDuration: 5,
            instructions: 'Bọc thức ăn bằng dầu mực hoặc chuối chín',
          },
        ],
      },
    },
  });

  console.log('✅ Đã tạo Phiếu xét nghiệm nước và Toa thuốc thủy sản mẫu thực tế.');

  // 8. Tạo Ca bán hàng (ShiftSession) thực tế
  const shiftToday = await prisma.shiftSession.create({
    data: {
      shiftCode: 'CA-20261029-SANG',
      staffId: staffVy.id,
      openedAt: new Date('2026-10-29T06:30:00Z'),
      openingCash: 2000000,
      expectedCash: 14850000,
      actualCash: 14850000,
      cashDifference: 0,
      totalSalesCash: 12850000,
      totalSalesQr: 35400000,
      totalSalesDebt: 45000000,
      totalOrdersCount: 14,
      status: ShiftStatus.OPEN,
      notes: 'Ca sáng hoạt động bình thường, quầy POS ổn định.',
    },
  });

  // 9. Tạo Hóa đơn bán lẻ POS thực tế (#POS-20261029-01)
  const order1 = await prisma.order.create({
    data: {
      orderCode: 'POS-20261029-01',
      customerId: custSauTung.id,
      pondId: custSauTung.ponds[0].id,
      cropDebtLedgerId: debtSauTung.id,
      staffId: staffVy.id,
      subtotal: 2470000,
      discountAmount: 70000,
      vatAmount: 0,
      totalAmount: 2400000,
      paymentMethod: PaymentMethod.CROP_DEBT,
      paymentDetails: JSON.stringify({
        terms: 'Ghi sổ nợ vụ nuôi tôm thẻ Ao 1',
        cropSeason: 'Vụ Nuôi Tôm Thẻ Mùa Mưa 2026',
        approvedBy: 'Nguyễn Hoàng Nam (Quản lý)',
      }),
      status: OrderStatus.COMPLETED,
      notes: 'Xuất thuốc theo Toa xét nghiệm nước TOA-20261029-01',
      items: {
        create: [
          {
            productId: prodYucca.id,
            unitName: 'Chai',
            quantity: 2,
            unitPrice: 280000,
            discountPercent: 0,
            totalPrice: 560000,
          },
          {
            productId: prodSoda.id,
            unitName: 'Bao',
            quantity: 2,
            unitPrice: 360000,
            discountPercent: 0,
            totalPrice: 720000,
          },
          {
            productId: prodHepa.id,
            unitName: 'Chai',
            quantity: 3,
            unitPrice: 345000,
            discountPercent: 0,
            totalPrice: 1035000,
          },
          {
            productId: prodOxy.id,
            unitName: 'Kg',
            quantity: 4,
            unitPrice: 40000,
            discountPercent: 0,
            totalPrice: 160000,
          },
        ],
      },
    },
  });

  // 10. Tạo Sổ bảo hành thiết bị cơ điện theo Serial/IMEI thực tế
  const prodMotor = createdProductsMap.get('MOTOR-THC-3HP');
  const prodFeeder = createdProductsMap.get('MAY-CHO-AN-50KG');

  await prisma.warrantyRecord.create({
    data: {
      serialImei: 'THC-2026-9921',
      productId: prodMotor.id,
      customerId: custSauTung.id,
      customerName: 'Nguyễn Văn Tùng (Chú Sáu Tùng)',
      customerPhone: '0918455789',
      purchaseDate: new Date('2026-09-05'),
      warrantyMonths: 12,
      expiryDate: new Date('2027-09-05'),
      status: WarrantyStatus.ACTIVE,
      notes: 'Mô tơ quạt nước 3HP ao số 1. Bảo hành cuộn dây đồng và bạc đạn chính hãng Tân Hoàn Cầu.',
    },
  });

  await prisma.warrantyRecord.create({
    data: {
      serialImei: 'AT-FEED-50K-08',
      productId: prodFeeder.id,
      customerId: custMaiBaTri.id,
      customerName: 'Lê Thị Mai (Chị Mai Ao Tròn)',
      customerPhone: '0939887665',
      purchaseDate: new Date('2026-08-25'),
      warrantyMonths: 12,
      expiryDate: new Date('2027-08-25'),
      status: WarrantyStatus.ACTIVE,
      notes: 'Máy cho tôm ăn tự động 50kg Inox 304 ao tròn số 1.',
    },
  });

  console.log('✅ Đã tạo Phiếu bảo hành máy móc thiết bị theo Serial/IMEI.');

  // 11. Tạo Phiếu điều chuyển kho vệ tinh (Kho bờ ao)
  await prisma.transferOrder.create({
    data: {
      transferCode: 'DC-20261028-01',
      fromWarehouse: 'Kho Tổng Trung Tâm (Khu Bến Tre)',
      toWarehouse: 'Kho Bờ Ao Vệ Tinh (Đầm Chú Sáu Tùng - Bạc Liêu)',
      staffId: staffThanh.id,
      status: TransferStatus.COMPLETED,
      notes: 'Điều chuyển trước 20 bao thức ăn số 1 và 5 bao khoáng tạt để dự phòng bão.',
      items: {
        create: [
          {
            productId: createdProductsMap.get('FEED-CP-NO1-25KG').id,
            quantity: 20,
            unit: 'Bao',
          },
          {
            productId: prodSoda.id,
            quantity: 5,
            unit: 'Bao',
          },
        ],
      },
    },
  });

  console.log('🎉 Hoàn tất 100% quá trình nạp dữ liệu thực tế vào cơ sở dữ liệu PostgreSQL!');
}

main()
  .catch((e) => {
    console.error('❌ Lỗi khi nạp dữ liệu:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
