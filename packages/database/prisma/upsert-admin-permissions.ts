import { PrismaClient, StaffRole } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Khởi tạo Super Admin và Cấu hình phân quyền động...');

  // 1. Tạo hoặc cập nhật Super Admin
  const superAdmin = await prisma.staff.upsert({
    where: { staffCode: 'ADMIN-001' },
    update: {
      name: 'Super Admin Tổng Quản Trị',
      phone: '0999888999',
      email: 'admin@omnipos.vn',
      role: StaffRole.SUPER_ADMIN,
      pinCode: '9999',
      active: true,
      discountLimitPercent: 100.0,
      canVoidOrder: true,
    },
    create: {
      staffCode: 'ADMIN-001',
      name: 'Super Admin Tổng Quản Trị',
      phone: '0999888999',
      email: 'admin@omnipos.vn',
      role: StaffRole.SUPER_ADMIN,
      pinCode: '9999',
      active: true,
      discountLimitPercent: 100.0,
      canVoidOrder: true,
    },
  });
  console.log('✅ Super Admin:', superAdmin.staffCode, superAdmin.name, 'Mã PIN: 9999');

  // 2. Cấu hình bảng ma trận phân quyền mặc định cho từng chức vụ
  const configs = [
    {
      role: StaffRole.SUPER_ADMIN,
      allowedRoutes: [
        '/pos/terminal',
        '/admin/inventory',
        '/admin/batches',
        '/admin/products/new',
        '/admin/orders',
        '/admin/debts',
        '/admin/shifts',
        '/admin/prescriptions',
        '/admin/stocktake/new',
        '/admin/transfers',
        '/admin/warranties',
        '/admin/customers',
        '/admin/staff',
        '/admin/reports',
        '/admin/settings',
      ],
      allowedActions: [
        'pos.sell',
        'pos.void',
        'pos.discount_unlimited',
        'debt.approve',
        'debt.collect',
        'inventory.manage',
        'inventory.edit_mac',
        'inventory.stocktake',
        'inventory.import',
        'inventory.transfer',
        'prescription.test_water',
        'prescription.prescribe',
        'staff.manage',
        'staff.permissions',
        'system.config',
        'report.view_financials',
      ],
      forbiddenActions: [],
      maxDiscountPercent: 100.0,
      notes: 'Toàn quyền tối cao hệ thống OmniPOS, có quyền phân quyền cho Quản lý và các chức vụ',
    },
    {
      role: StaffRole.STORE_MANAGER,
      allowedRoutes: [
        '/pos/terminal',
        '/admin/inventory',
        '/admin/batches',
        '/admin/products/new',
        '/admin/orders',
        '/admin/debts',
        '/admin/shifts',
        '/admin/prescriptions',
        '/admin/stocktake/new',
        '/admin/transfers',
        '/admin/warranties',
        '/admin/customers',
        '/admin/staff',
        '/admin/reports',
      ],
      allowedActions: [
        'pos.sell',
        'pos.void',
        'debt.approve',
        'debt.collect',
        'inventory.manage',
        'inventory.edit_mac',
        'inventory.stocktake',
        'inventory.import',
        'inventory.transfer',
        'prescription.test_water',
        'prescription.prescribe',
        'staff.manage',
        'report.view_financials',
      ],
      forbiddenActions: ['system.root_config'],
      maxDiscountPercent: 20.0,
      notes: 'Quản lý cửa hàng, toàn quyền tác vụ bán lẻ, công nợ, kho bãi và nhân sự cơ sở',
    },
    {
      role: StaffRole.AQUA_TECHNICIAN,
      allowedRoutes: [
        '/pos/terminal',
        '/admin/inventory',
        '/admin/batches',
        '/admin/prescriptions',
        '/admin/customers',
      ],
      allowedActions: [
        'pos.sell',
        'prescription.test_water',
        'prescription.prescribe',
        'inventory.check_expiry',
        'customer.view_pond_profile',
      ],
      forbiddenActions: [
        'debt.collect',
        'pos.void',
        'debt.approve_over_limit',
        'inventory.edit_mac',
        'inventory.stocktake',
        'staff.manage',
      ],
      maxDiscountPercent: 10.0,
      notes: 'Kỹ sư thủy sản phụ trách xét nghiệm nước, phác đồ điều trị và tư vấn bán hàng thuốc/vi sinh',
    },
    {
      role: StaffRole.CASHIER,
      allowedRoutes: [
        '/pos/terminal',
        '/admin/orders',
        '/admin/debts',
        '/admin/shifts',
        '/admin/customers',
      ],
      allowedActions: [
        'pos.sell',
        'debt.collect',
        'shift.open_close',
        'customer.return_goods',
        'debt.sell_within_limit',
      ],
      forbiddenActions: [
        'pos.void',
        'inventory.stocktake',
        'inventory.edit_mac',
        'prescription.prescribe',
        'staff.manage',
      ],
      maxDiscountPercent: 5.0,
      notes: 'Thu ngân quầy bán lẻ, thu tiền mặt, quét VietQR, in hóa đơn và thu nợ vụ nuôi',
    },
    {
      role: StaffRole.WAREHOUSE_KEEPER,
      allowedRoutes: [
        '/admin/inventory',
        '/admin/batches',
        '/admin/products/new',
        '/admin/stocktake/new',
        '/admin/transfers',
        '/admin/warranties',
      ],
      allowedActions: [
        'inventory.import',
        'inventory.stocktake',
        'inventory.create_product',
        'inventory.transfer',
        'inventory.manage_warranty',
      ],
      forbiddenActions: [
        'pos.sell',
        'debt.collect',
        'prescription.prescribe',
        'report.view_financials',
        'staff.manage',
      ],
      maxDiscountPercent: 0.0,
      notes: 'Thủ kho chuyên trách xuất nhập tồn, quản lý số lô FEFO, in tem mã vạch và kiểm kê kho',
    },
  ];

  for (const cfg of configs) {
    await prisma.rolePermissionConfig.upsert({
      where: { role: cfg.role },
      update: {
        allowedRoutes: cfg.allowedRoutes,
        allowedActions: cfg.allowedActions,
        forbiddenActions: cfg.forbiddenActions,
        maxDiscountPercent: cfg.maxDiscountPercent,
        notes: cfg.notes,
      },
      create: {
        role: cfg.role,
        allowedRoutes: cfg.allowedRoutes,
        allowedActions: cfg.allowedActions,
        forbiddenActions: cfg.forbiddenActions,
        maxDiscountPercent: cfg.maxDiscountPercent,
        notes: cfg.notes,
      },
    });
  }

  console.log('✅ Đã nạp thành công 5 cấu hình phân quyền chức vụ động vào PostgreSQL!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
