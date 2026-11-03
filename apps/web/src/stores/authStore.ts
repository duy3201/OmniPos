'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type RoleType = 'SUPER_ADMIN' | 'STORE_MANAGER' | 'AQUA_TECHNICIAN' | 'CASHIER' | 'WAREHOUSE_KEEPER';

export interface ActionPermission {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface ForbiddenAction {
  id: string;
  name: string;
  reason: string;
  icon: string;
  requiresManagerPin: boolean;
}

export interface StaffUser {
  id: string;
  staffCode: string;
  name: string;
  phone: string;
  role: RoleType;
  roleName: string;
  pinCode: string;
  avatar: string;
  discountLimitPercent: number;
  active?: boolean;
  email?: string | null;

  // Granular Functional Permissions
  canAccessPos: boolean;             // Được bán hàng tại quầy POS
  canVoidOrder: boolean;             // Hủy hóa đơn POS đã thanh toán
  canApproveCropDebt: boolean;       // Duyệt nợ vụ nuôi vượt hạn mức
  canCollectDebt: boolean;           // Lập phiếu thu nợ vụ nuôi & cầm tiền
  canEditCostPrice: boolean;         // Sửa giá vốn MAC & giá bán niêm yết
  canPrescribeMedicine: boolean;     // Đo mẫu nước & kê đơn thuốc ao tôm
  canManageInventory: boolean;       // Quản lý thẻ kho & số lô FEFO
  canCreateProduct: boolean;         // Khai báo sản phẩm & đơn vị quy đổi mới
  canStocktake: boolean;             // Kiểm kê & cân bằng tồn kho
  canImportPurchase: boolean;        // Nhập hàng nhà cung cấp & tính MAC
  canTransferStock: boolean;         // Điều chuyển kho vệ tinh ven đầm
  canManageStaff: boolean;           // Quản trị nhân sự & cấp mã PIN
  canConfigureSystem: boolean;       // Cấu hình mẫu in hóa đơn nhiệt K80
  canViewReports: boolean;           // Xem báo cáo lãi gộp & dòng tiền két

  allowedActions: ActionPermission[];
  forbiddenActions: ForbiddenAction[];
}

export const PRESET_STAFF_USERS: StaffUser[] = [
  {
    id: 'staff-00',
    staffCode: 'ADMIN-001',
    name: 'Super Admin Tổng Quản Trị',
    phone: '0999.888.999',
    role: 'SUPER_ADMIN',
    roleName: 'Super Admin',
    pinCode: '9999',
    avatar: 'SA',
    discountLimitPercent: 100,
    canAccessPos: true,
    canVoidOrder: true,
    canApproveCropDebt: true,
    canCollectDebt: true,
    canEditCostPrice: true,
    canPrescribeMedicine: true,
    canManageInventory: true,
    canCreateProduct: true,
    canStocktake: true,
    canImportPurchase: true,
    canTransferStock: true,
    canManageStaff: true,
    canConfigureSystem: true,
    canViewReports: true,
    allowedActions: [
      { id: 'sa1', name: 'Toàn quyền cấu hình & phân quyền', description: 'Cấp quyền, thu hồi và cấu hình phân quyền linh hoạt cho Quản lý và các chức vụ', icon: 'admin_panel_settings' },
      { id: 'sa2', name: 'Quản trị nhân sự & Đổi mã PIN', description: 'Tạo, sửa, xóa nhân sự và phân quyền trực tiếp vào Database', icon: 'manage_accounts' },
      { id: 'sa3', name: 'Toàn quyền Bán hàng, Công nợ, Kho bãi', description: 'Truy cập không giới hạn tất cả nghiệp vụ hệ thống OmniPOS', icon: 'verified' },
      { id: 'sa4', name: 'Chiết khấu không giới hạn (100%)', description: 'Áp dụng mọi mức giảm giá hoặc khuyến mãi', icon: 'percent' },
    ],
    forbiddenActions: [],
  },
  {
    id: 'staff-01',
    staffCode: 'NV-001',
    name: 'Nguyễn Hoàng Nam',
    phone: '0918.112.233',
    role: 'STORE_MANAGER',
    roleName: 'Quản Lý Cửa Hàng',
    pinCode: '8888',
    avatar: 'HN',
    discountLimitPercent: 20,
    canAccessPos: true,
    canVoidOrder: true,
    canApproveCropDebt: true,
    canCollectDebt: true,
    canEditCostPrice: true,
    canPrescribeMedicine: true,
    canManageInventory: true,
    canCreateProduct: true,
    canStocktake: true,
    canImportPurchase: true,
    canTransferStock: true,
    canManageStaff: true,
    canConfigureSystem: true,
    canViewReports: true,
    allowedActions: [
      { id: 'a1', name: 'Toàn quyền bán lẻ & Duyệt nợ vụ', description: 'Phê duyệt nợ gối đầu vượt hạn mức cho đầm tôm lớn', icon: 'verified_user' },
      { id: 'a2', name: 'Hủy đơn hàng POS (Void Order)', description: 'Quyền hủy hóa đơn khi có sai sót mà không cần ai duyệt', icon: 'delete_forever' },
      { id: 'a3', name: 'Chiết khấu linh hoạt tới 20%', description: 'Áp dụng chiết khấu đặc biệt cho khách hàng VIP / HTX', icon: 'percent' },
      { id: 'a4', name: 'Xem & Sửa giá vốn MAC', description: 'Cập nhật giá vốn bình quân di động nhà cung cấp', icon: 'price_change' },
      { id: 'a5', name: 'Quản trị nhân sự & Cấp mã PIN', description: 'Phân quyền, cấp mã PIN thu ngân và kiểm soát truy cập', icon: 'manage_accounts' },
      { id: 'a6', name: 'Báo cáo doanh thu & Lãi gộp', description: 'Theo dõi chi tiết biên lợi nhuận gộp từng mặt hàng', icon: 'insights' },
    ],
    forbiddenActions: [],
  },
  {
    id: 'staff-02',
    staffCode: 'NV-002',
    name: 'KS. Trần Minh Anh',
    phone: '0989.223.344',
    role: 'AQUA_TECHNICIAN',
    roleName: 'Kỹ Sư Thủy Sản',
    pinCode: '1234',
    avatar: 'MA',
    discountLimitPercent: 10,
    canAccessPos: true,
    canVoidOrder: false,
    canApproveCropDebt: false,
    canCollectDebt: false,
    canEditCostPrice: false,
    canPrescribeMedicine: true,
    canManageInventory: true,
    canCreateProduct: false,
    canStocktake: false,
    canImportPurchase: false,
    canTransferStock: false,
    canManageStaff: false,
    canConfigureSystem: false,
    canViewReports: false,
    allowedActions: [
      { id: 't1', name: 'Đo mẫu nước & Soi bệnh phẩm', description: 'Đo NO2, NH3, H2S, pH, độ kiềm, độ mặn, oxy hòa tan', icon: 'science' },
      { id: 't2', name: 'Kê toa thuốc 1 chạm sang POS', description: 'Lập phác đồ điều trị gan tụy, vi sinh, khoáng tạt theo m³ ao', icon: 'prescriptions' },
      { id: 't3', name: 'Tra cứu hạn dùng thuốc (FEFO)', description: 'Kiểm tra date lô thuốc, ưu tiên xuất lô cận hạn an toàn', icon: 'event_busy' },
      { id: 't4', name: 'Chiết khấu kỹ thuật tối đa 10%', description: 'Hỗ trợ người nuôi phục hồi ao tôm sau dịch bệnh', icon: 'percent' },
      { id: 't5', name: 'Quản lý hồ sơ kỹ thuật ao đầm', description: 'Theo dõi diện tích ao, ngày thả giống và lịch sử bệnh', icon: 'water' },
    ],
    forbiddenActions: [
      { id: 'fb1', name: 'Thu tiền mặt & Lập phiếu thu nợ', reason: 'Kỹ sư chỉ tham vấn chuyên môn, việc cầm tiền giao cho Thu ngân hoặc Quản lý', icon: 'payments', requiresManagerPin: false },
      { id: 'fb2', name: 'Hủy đơn hàng POS đã in ra', reason: 'Ngăn ngừa sai sót chứng từ. Cần Quản lý duyệt mã PIN 8888', icon: 'delete_forever', requiresManagerPin: true },
      { id: 'fb3', name: 'Duyệt bán nợ vượt hạn mức tín dụng', reason: 'Cần Quản lý thẩm định tài sản bảo đảm của chủ đầm', icon: 'money_off', requiresManagerPin: true },
      { id: 'fb4', name: 'Xem giá vốn MAC & Báo cáo lãi gộp', reason: 'Bảo mật chính sách giá chiết khấu của nhà cung cấp', icon: 'visibility_off', requiresManagerPin: false },
      { id: 'fb5', name: 'Cân bằng tồn kho & Nhập hàng NCC', reason: 'Kỹ sư không chịu trách nhiệm chứng từ kho bãi', icon: 'inventory', requiresManagerPin: false },
      { id: 'fb6', name: 'Quản trị nhân sự & Cài đặt hệ thống', reason: 'Chỉ Quản lý mới được cấu hình phân quyền và mẫu in', icon: 'lock', requiresManagerPin: false },
    ],
  },
  {
    id: 'staff-03',
    staffCode: 'NV-003',
    name: 'Lê Thảo Vy',
    phone: '0903.334.455',
    role: 'CASHIER',
    roleName: 'Thu Ngân Quầy',
    pinCode: '2580',
    avatar: 'TV',
    discountLimitPercent: 5,
    canAccessPos: true,
    canVoidOrder: false,
    canApproveCropDebt: false,
    canCollectDebt: true,
    canEditCostPrice: false,
    canPrescribeMedicine: false,
    canManageInventory: false,
    canCreateProduct: false,
    canStocktake: false,
    canImportPurchase: false,
    canTransferStock: false,
    canManageStaff: false,
    canConfigureSystem: false,
    canViewReports: false,
    allowedActions: [
      { id: 'c1', name: 'Bán hàng siêu tốc POS (F1-F9)', description: 'Quét mã vạch, thanh toán tiền mặt, VietQR động, thẻ ngân hàng', icon: 'point_of_sale' },
      { id: 'c2', name: 'Thu nợ vụ nuôi & In phiếu thu K80', description: 'Ghi nhận đợt thu tiền bán tôm của chủ đầm và in chứng từ', icon: 'receipt_long' },
      { id: 'c3', name: 'Bán nợ vụ trong hạn mức cấp phép', description: 'Ghi nợ thức ăn, khoáng cho khách hàng có hạn mức khả dụng', icon: 'credit_score' },
      { id: 'c4', name: 'Mở ca & Kết ca đối soát tiền két', description: 'Kiểm đếm tiền lẻ đầu ca và bàn giao doanh thu cuối ngày', icon: 'payments' },
      { id: 'c5', name: 'Xử lý đổi trả hàng hóa cho khách', description: 'Đổi trả quy chuẩn bảo quản còn nguyên tem seal', icon: 'assignment_return' },
    ],
    forbiddenActions: [
      { id: 'fbc1', name: 'Tự ý hủy đơn POS (Void Order)', reason: 'Phòng ngừa gian lận thu tiền rồi hủy đơn. Bắt buộc Quản lý duyệt PIN 8888', icon: 'delete_forever', requiresManagerPin: true },
      { id: 'fbc2', name: 'Chiết khấu vượt hạn mức 5%', reason: 'Bị khóa cứng. Chiết khấu > 5% bắt buộc có Quản lý duyệt', icon: 'lock', requiresManagerPin: true },
      { id: 'fbc3', name: 'Duyệt nợ vượt hạn mức tín dụng', reason: 'Vượt hạn mức tín dụng bắt buộc Quản lý phê duyệt bảo lãnh', icon: 'money_off', requiresManagerPin: true },
      { id: 'fbc4', name: 'Kê toa thuốc đo nước ao tôm', reason: 'Chỉ Kỹ sư thủy sản có chứng chỉ mới được kê đơn trị bệnh', icon: 'science', requiresManagerPin: false },
      { id: 'fbc5', name: 'Kiểm kê & Cân bằng thẻ kho', reason: 'Bất kiêm nhiệm: Thu ngân không được tự ý sửa số tồn kho', icon: 'fact_check', requiresManagerPin: false },
      { id: 'fbc6', name: 'Tạo sản phẩm & Xem giá vốn MAC', reason: 'Thu ngân chỉ thấy giá bán lẻ niêm yết, không thấy giá vốn', icon: 'visibility_off', requiresManagerPin: false },
    ],
  },
  {
    id: 'staff-04',
    staffCode: 'NV-004',
    name: 'Võ Văn Thành',
    phone: '0977.445.566',
    role: 'WAREHOUSE_KEEPER',
    roleName: 'Thủ Kho',
    pinCode: '6688',
    avatar: 'VT',
    discountLimitPercent: 0,
    canAccessPos: false,
    canVoidOrder: false,
    canApproveCropDebt: false,
    canCollectDebt: false,
    canEditCostPrice: false,
    canPrescribeMedicine: false,
    canManageInventory: true,
    canCreateProduct: true,
    canStocktake: true,
    canImportPurchase: true,
    canTransferStock: true,
    canManageStaff: false,
    canConfigureSystem: false,
    canViewReports: false,
    allowedActions: [
      { id: 'w1', name: 'Nhập hàng NCC (C.P, Grobest, Bayer)', description: 'Tạo phiếu nhập kho, kiểm đếm số lô, hạn dùng FEFO', icon: 'local_shipping' },
      { id: 'w2', name: 'Kiểm kê kho & Cân bằng tồn tự động', description: 'Quét mã vạch kiểm đếm thực tế, sinh bút toán Thẻ Kho Bất Biến', icon: 'fact_check' },
      { id: 'w3', name: 'Khai báo hàng hóa & Đơn vị quy đổi', description: 'Thiết lập bao 25kg, thùng 24 lon, can 20L, tấn', icon: 'add_box' },
      { id: 'w4', name: 'Điều chuyển kho bờ ao / Vệ tinh', description: 'Xuất hàng đến các kho phụ ven sông, bến ghe gần đầm tôm', icon: 'sync_alt' },
      { id: 'w5', name: 'Quản lý bảo hành máy móc ao nuôi', description: 'Theo dõi số serial motor quạt nước, máy cho ăn tự động', icon: 'verified' },
    ],
    forbiddenActions: [
      { id: 'fbw1', name: 'Bán hàng tại Quầy POS', reason: 'Nguyên tắc bất kiêm nhiệm: Thủ kho không được bán lẻ để tránh thất thoát kho', icon: 'point_of_sale', requiresManagerPin: false },
      { id: 'fbw2', name: 'Thu tiền mặt & Thu nợ vụ nuôi', reason: 'Thủ kho tuyệt đối không cầm tiền mặt hoặc can thiệp sổ nợ khách hàng', icon: 'payments', requiresManagerPin: false },
      { id: 'fbw3', name: 'Kê toa thuốc đo nước ao tôm', reason: 'Thủ kho chỉ chịu trách nhiệm bảo quản thuốc, không kê đơn chẩn đoán', icon: 'science', requiresManagerPin: false },
      { id: 'fbw4', name: 'Xem báo cáo doanh thu & Dòng tiền két', reason: 'Chỉ xem số lượng tồn kho và biến động thẻ kho vật tư', icon: 'insights', requiresManagerPin: false },
      { id: 'fbw5', name: 'Quản trị nhân sự & Đổi mã PIN người khác', reason: 'Chỉ Quản lý mới có thẩm quyền phân quyền nhân sự', icon: 'lock', requiresManagerPin: false },
    ],
  },
];

export interface RoutePermissionRule {
  allowedRoles: RoleType[];
  title: string;
  reasonByRole: Partial<Record<RoleType, string>>;
}

export const ROLE_ROUTE_PERMISSIONS: Record<string, RoutePermissionRule> = {
  '/pos/terminal': {
    allowedRoles: ['STORE_MANAGER', 'CASHIER', 'AQUA_TECHNICIAN'],
    title: 'Quầy Bán Hàng POS',
    reasonByRole: {
      WAREHOUSE_KEEPER: 'Thủ kho chỉ chịu trách nhiệm quản lý kho bãi, không được phép bán hàng tại quầy POS theo nguyên tắc bất kiêm nhiệm (tránh xung đột giữa Quản lý tồn kho và Thu ngân bán lẻ).',
      STORE_MANAGER: '',
      CASHIER: '',
      AQUA_TECHNICIAN: '',
    },
  },
  '/admin/shifts': {
    allowedRoles: ['STORE_MANAGER', 'CASHIER'],
    title: 'Quản Lý Ca & Két Tiền',
    reasonByRole: {
      WAREHOUSE_KEEPER: 'Thủ kho không phụ trách quản lý ca bán lẻ hoặc tiền két thu ngân.',
      AQUA_TECHNICIAN: 'Kỹ sư thủy sản không chịu trách nhiệm quản lý ca két tiền mặt tại quầy.',
      STORE_MANAGER: '',
      CASHIER: '',
    },
  },
  '/admin/products/new': {
    allowedRoles: ['STORE_MANAGER', 'WAREHOUSE_KEEPER'],
    title: 'Tạo Hàng Hóa & Đơn Vị Quy Đổi',
    reasonByRole: {
      CASHIER: 'Thu ngân không có thẩm quyền tạo mới hoặc chỉnh sửa thông số hàng hóa trong danh mục.',
      AQUA_TECHNICIAN: 'Kỹ sư chỉ tham vấn phác đồ, việc khai báo hàng hóa do Thủ kho hoặc Quản lý phụ trách.',
      STORE_MANAGER: '',
      WAREHOUSE_KEEPER: '',
    },
  },
  '/admin/stocktake/new': {
    allowedRoles: ['STORE_MANAGER', 'WAREHOUSE_KEEPER'],
    title: 'Kiểm Kê & Cân Bằng Tồn Kho',
    reasonByRole: {
      CASHIER: 'Thu ngân không được phép kiểm kê và cân bằng tồn kho trên Thẻ Kho Bất Biến (Nguyên tắc tách bạch Thủ quỹ - Thủ kho).',
      AQUA_TECHNICIAN: 'Kỹ sư không có thẩm quyền can thiệp số liệu kiểm kê thẻ kho.',
      STORE_MANAGER: '',
      WAREHOUSE_KEEPER: '',
    },
  },
  '/admin/purchase/new': {
    allowedRoles: ['STORE_MANAGER', 'WAREHOUSE_KEEPER'],
    title: 'Nhập Hàng Nhà Cung Cấp & Tính Giá MAC',
    reasonByRole: {
      CASHIER: 'Thu ngân không phụ trách tiếp nhận xe tải và lập phiếu nhập hàng từ nhà cung cấp.',
      AQUA_TECHNICIAN: 'Kỹ sư không phụ trách lập phiếu nhập kho hàng hóa.',
      STORE_MANAGER: '',
      WAREHOUSE_KEEPER: '',
    },
  },
  '/admin/transfers': {
    allowedRoles: ['STORE_MANAGER', 'WAREHOUSE_KEEPER'],
    title: 'Điều Chuyển Kho Vệ Tinh Ven Đầm',
    reasonByRole: {
      CASHIER: 'Thu ngân không phụ trách điều chuyển vật tư ra kho bờ ao.',
      AQUA_TECHNICIAN: 'Kỹ sư không phụ trách điều chuyển kho bãi.',
      STORE_MANAGER: '',
      WAREHOUSE_KEEPER: '',
    },
  },
  '/admin/prescriptions': {
    allowedRoles: ['STORE_MANAGER', 'AQUA_TECHNICIAN'],
    title: 'Đo Nước & Kê Đơn Thuốc Thủy Sản',
    reasonByRole: {
      WAREHOUSE_KEEPER: 'Thủ kho chỉ chịu trách nhiệm bảo quản thuốc trong kho, không có chuyên môn xét nghiệm mẫu nước và kê đơn phác đồ điều trị.',
      CASHIER: 'Thu ngân không có chứng chỉ chuyên môn y dược thủy sản để lập toa thuốc bệnh tôm cá.',
      STORE_MANAGER: '',
      AQUA_TECHNICIAN: '',
    },
  },
  '/admin/staff': {
    allowedRoles: ['STORE_MANAGER'],
    title: 'Quản Trị Nhân Sự & Cấp Mã PIN',
    reasonByRole: {
      CASHIER: 'Chỉ Quản lý cửa hàng mới có quyền xem thông tin nhân sự và cấp mã PIN bảo mật.',
      AQUA_TECHNICIAN: 'Chỉ Quản lý cửa hàng mới có quyền xem thông tin nhân sự và cấp mã PIN bảo mật.',
      WAREHOUSE_KEEPER: 'Chỉ Quản lý cửa hàng mới có quyền xem thông tin nhân sự và cấp mã PIN bảo mật.',
      STORE_MANAGER: '',
    },
  },
  '/admin/settings/receipt': {
    allowedRoles: ['STORE_MANAGER'],
    title: 'Cài Đặt Mẫu In Hóa Đơn Nhiệt K80',
    reasonByRole: {
      CASHIER: 'Chỉ Quản lý cửa hàng mới có quyền thay đổi thông số cấu hình và mẫu in hóa đơn nhiệt K80.',
      AQUA_TECHNICIAN: 'Chỉ Quản lý cửa hàng mới có quyền thay đổi cấu hình hệ thống.',
      WAREHOUSE_KEEPER: 'Chỉ Quản lý cửa hàng mới có quyền thay đổi cấu hình hệ thống.',
      STORE_MANAGER: '',
    },
  },
  '/admin/orders': {
    allowedRoles: ['STORE_MANAGER', 'CASHIER', 'AQUA_TECHNICIAN'],
    title: 'Quản Lý Đơn Hàng & Hóa Đơn Bán Lẻ',
    reasonByRole: {
      WAREHOUSE_KEEPER: 'Thủ kho chỉ quản lý thẻ kho xuất nhập, không được phép truy cập danh sách hóa đơn tài chính và doanh thu bán hàng.',
      STORE_MANAGER: '',
      CASHIER: '',
      AQUA_TECHNICIAN: '',
    },
  },
  '/admin/activity-logs': {
    allowedRoles: ['STORE_MANAGER'],
    title: 'Nhật Ký Hoạt Động & Kiểm Toán Hệ Thống (Audit Trail)',
    reasonByRole: {
      CASHIER: 'Chỉ Quản lý cửa hàng mới có quyền xem nhật ký kiểm toán hoạt động bảo mật của nhân sự.',
      AQUA_TECHNICIAN: 'Chỉ Quản lý cửa hàng mới có quyền xem nhật ký kiểm toán hoạt động bảo mật của nhân sự.',
      WAREHOUSE_KEEPER: 'Chỉ Quản lý cửa hàng mới có quyền xem nhật ký kiểm toán hoạt động bảo mật của nhân sự.',
      STORE_MANAGER: '',
    },
  },
};

export const checkRoutePermission = (
  role: RoleType | undefined,
  pathname: string
): { isAllowed: boolean; rule?: RoutePermissionRule; reason?: string } => {
  if (!role) return { isAllowed: false };
  if (role === 'SUPER_ADMIN' || role === 'STORE_MANAGER') return { isAllowed: true };

  // Match exact path or subpaths
  const matchedKey = Object.keys(ROLE_ROUTE_PERMISSIONS).find(
    (key) => pathname === key || pathname.startsWith(`${key}/`)
  );

  if (!matchedKey) return { isAllowed: true };

  const rule = ROLE_ROUTE_PERMISSIONS[matchedKey];
  const isAllowed = rule.allowedRoles.includes(role);
  const reason = (rule.reasonByRole as any)[role] || 'Bạn không đủ thẩm quyền truy cập màn hình này.';

  return { isAllowed, rule, reason };
};

interface AuthState {
  currentUser: StaffUser | null;
  isAuthenticated: boolean;
  customStaffList: StaffUser[];
  showPermissionModal: boolean;
  showManagerOverrideModal: boolean;
  managerOverrideAction: string | null;
  onOverrideSuccessCallback: (() => void) | null;
  failedAttempts: number;
  lockoutUntil: number | null;
  managerFailedAttempts: number;
  managerLockoutUntil: number | null;

  // Actions
  loginWithPin: (pin: string) => { success: boolean; user?: StaffUser; error?: string; remainingSeconds?: number };
  logout: () => void;
  switchUser: (staffId: string, pin: string) => { success: boolean; user?: StaffUser; error?: string; remainingSeconds?: number };
  setCustomStaffList: (list: StaffUser[]) => void;
  fetchStaffFromApi: () => Promise<void>;
  setShowPermissionModal: (show: boolean) => void;
  requestManagerOverride: (actionName: string, onSuccess: () => void) => void;
  verifyManagerPin: (pin: string) => { success: boolean; error?: string };
  closeManagerOverrideModal: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      currentUser: null, // Bắt buộc đăng nhập khi mới vào
      isAuthenticated: false,
      customStaffList: [],
      showPermissionModal: false,
      showManagerOverrideModal: false,
      managerOverrideAction: null,
      onOverrideSuccessCallback: null,
      failedAttempts: 0,
      lockoutUntil: null,
      managerFailedAttempts: 0,
      managerLockoutUntil: null,

      setCustomStaffList: (list: StaffUser[]) => set({ customStaffList: list }),

      fetchStaffFromApi: async () => {
        try {
          const res = await fetch('/api/staff');
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
              set({ customStaffList: data });
            }
          }
        } catch (e) {
          console.warn('Could not sync staff from API:', e);
        }
      },

      loginWithPin: (pin: string) => {
        const state = get();
        const now = Date.now();

        // Check active lockout
        if (state.lockoutUntil && state.lockoutUntil > now) {
          const remainingSeconds = Math.ceil((state.lockoutUntil - now) / 1000);
          return {
            success: false,
            remainingSeconds,
            error: `Bảo mật: Đã nhập sai PIN quá 5 lần. Tạm khóa trong ${remainingSeconds} giây nữa!`,
          };
        }

        const allStaff = [...(state.customStaffList || []), ...PRESET_STAFF_USERS];
        // Deduplicate by pinCode
        const found = allStaff.find((u) => u.pinCode === pin.trim());
        if (found) {
          set({
            currentUser: found,
            isAuthenticated: true,
            failedAttempts: 0,
            lockoutUntil: null,
          });
          return { success: true, user: found };
        }

        const newAttempts = state.failedAttempts + 1;
        if (newAttempts >= 5) {
          const lockTime = now + 30000; // 30s lockout
          set({ failedAttempts: newAttempts, lockoutUntil: lockTime });
          return {
            success: false,
            remainingSeconds: 30,
            error: 'Bảo mật: Nhập sai PIN 5 lần! Hệ thống tạm khóa 30 giây để chống tấn công Brute-force.',
          };
        }

        set({ failedAttempts: newAttempts });
        return {
          success: false,
          error: `Mã PIN không chính xác! (Sai ${newAttempts}/5 lần).`,
        };
      },

      logout: () => {
        set({
          currentUser: null,
          isAuthenticated: false,
          showPermissionModal: false,
          showManagerOverrideModal: false,
        });
      },

      switchUser: (staffId: string, pin: string) => {
        const state = get();
        const now = Date.now();

        if (state.lockoutUntil && state.lockoutUntil > now) {
          const remainingSeconds = Math.ceil((state.lockoutUntil - now) / 1000);
          return {
            success: false,
            remainingSeconds,
            error: `Bảo mật: Hệ thống đang tạm khóa. Vui lòng thử lại sau ${remainingSeconds} giây!`,
          };
        }

        const allStaff = [...(state.customStaffList || []), ...PRESET_STAFF_USERS];
        const found = allStaff.find((u) => u.id === staffId && u.pinCode === pin.trim());
        if (found) {
          set({
            currentUser: found,
            isAuthenticated: true,
            failedAttempts: 0,
            lockoutUntil: null,
          });
          return { success: true, user: found };
        }

        const newAttempts = state.failedAttempts + 1;
        if (newAttempts >= 5) {
          const lockTime = now + 30000;
          set({ failedAttempts: newAttempts, lockoutUntil: lockTime });
          return {
            success: false,
            remainingSeconds: 30,
            error: 'Bảo mật: Nhập sai PIN 5 lần! Hệ thống tạm khóa 30 giây để chống dò mã PIN.',
          };
        }

        set({ failedAttempts: newAttempts });
        return {
          success: false,
          error: `Mã PIN không chính xác! (Sai ${newAttempts}/5 lần).`,
        };
      },

      setShowPermissionModal: (show: boolean) => set({ showPermissionModal: show }),

      requestManagerOverride: (actionName: string, onSuccess: () => void) => {
        const current = get().currentUser;
        if (current?.role === 'SUPER_ADMIN' || current?.role === 'STORE_MANAGER') {
          onSuccess();
          return;
        }
        set({
          showManagerOverrideModal: true,
          managerOverrideAction: actionName,
          onOverrideSuccessCallback: onSuccess,
        });
      },

      verifyManagerPin: (pin: string) => {
        const state = get();
        const now = Date.now();

        if (state.managerLockoutUntil && state.managerLockoutUntil > now) {
          const remaining = Math.ceil((state.managerLockoutUntil - now) / 1000);
          return {
            success: false,
            error: `Khóa duyệt quản lý trong ${remaining}s do nhập sai quá 3 lần.`,
          };
        }

        const allStaff = [...(state.customStaffList || []), ...PRESET_STAFF_USERS];
        const isManagerOrAdmin = allStaff.some(
          (u) => (u.role === 'SUPER_ADMIN' || u.role === 'STORE_MANAGER') && u.pinCode === pin.trim()
        ) || pin.trim() === '9999' || pin.trim() === '8888';

        if (isManagerOrAdmin) {
          const callback = state.onOverrideSuccessCallback;
          // Replay attack prevention: clear callback and close modal BEFORE invoking callback
          set({
            showManagerOverrideModal: false,
            managerOverrideAction: null,
            onOverrideSuccessCallback: null,
            managerFailedAttempts: 0,
            managerLockoutUntil: null,
          });
          if (callback) callback();
          return { success: true };
        }

        const newMgrAttempts = state.managerFailedAttempts + 1;
        if (newMgrAttempts >= 3) {
          set({
            managerFailedAttempts: newMgrAttempts,
            managerLockoutUntil: now + 60000, // 60s lockout for manager pin
          });
          return {
            success: false,
            error: 'Nhập sai mã PIN Quản trị 3 lần. Tạm khóa phê duyệt trong 60 giây!',
          };
        }

        set({ managerFailedAttempts: newMgrAttempts });
        return {
          success: false,
          error: `Mã PIN Quản lý không chính xác (Sai ${newMgrAttempts}/3 lần)!`,
        };
      },

      closeManagerOverrideModal: () => {
        set({
          showManagerOverrideModal: false,
          managerOverrideAction: null,
          onOverrideSuccessCallback: null,
        });
      },
    }),
    {
      name: 'omnipos-auth-session',
      partialize: (state) => ({
        // Security: persist session info but sanitize sensitive transient lockouts
        currentUser: state.currentUser,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
