/**
 * OmniPOS Shared Types & Enums
 * Hệ Thống POS Quản Lý Cửa Hàng Vật Tư Thủy Sản
 */

// Danh mục ngành hàng vật tư thủy sản
export enum ProductCategory {
  ANTIBIOTIC = 'ANTIBIOTIC',             // Thuốc kháng sinh / Trị bệnh
  AQUA_MEDICINE = 'AQUA_MEDICINE',       // Thuốc thú y thủy sản / Thảo dược gan ruột
  PROBIOTIC = 'PROBIOTIC',               // Men vi sinh xử lý đáy & đường ruột
  WATER_TREATMENT = 'WATER_TREATMENT',   // Hóa chất xử lý nước (Yucca, Zeolite, Chlorine, Vôi)
  MINERAL_NUTRITION = 'MINERAL_NUTRITION', // Khoáng tạt ao, thảo dược, bổ gan ruột
  AQUA_FEED = 'AQUA_FEED',               // Thức ăn tôm / cá
  EQUIPMENT = 'EQUIPMENT',               // Thiết bị ao nuôi (Mô tơ quạt, máy sục oxy, bút đo)
  EQUIPMENT_SUPPLIES = 'EQUIPMENT_SUPPLIES', // Thiết bị & Vật tư phụ trợ ao nuôi
  ACCESSORY = 'ACCESSORY',               // Dụng cụ, ống nano, bạt ao
}

// Phương thức thanh toán quầy POS
export enum PaymentMethod {
  VIETQR = 'VIETQR',                     // Chuyển khoản VietQR động (Napas247)
  CASH = 'CASH',                         // Tiền mặt tại quầy
  CARD = 'CARD',                         // Quẹt thẻ máy POS ngân hàng
  CREDIT_SEASON = 'CREDIT_SEASON',       // Bán nợ vụ nuôi (Ghi nợ chủ đầm)
  SPLIT = 'SPLIT',                       // Thanh toán kết hợp (VD: Một phần tiền mặt + một phần VietQR)
}

// Trạng thái đơn hàng
export enum OrderStatus {
  COMPLETED = 'COMPLETED',
  PENDING = 'PENDING',
  DRAFT = 'DRAFT',                       // Đơn lưu tạm (F8)
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

// Trạng thái hạn sử dụng của Lô thuốc / Chế phẩm
export enum BatchExpiryStatus {
  SAFE = 'SAFE',                         // > 90 ngày (Xanh)
  NEAR_EXPIRY = 'NEAR_EXPIRY',           // 30 - 90 ngày (Vàng - Cảnh báo ưu tiên FEFO)
  CRITICAL = 'CRITICAL',                 // < 30 ngày (Đỏ - Sắp hết date)
  EXPIRED = 'EXPIRED',                   // Đã quá hạn (Khóa xuất bán)
}

// Đơn vị tính phổ biến
export enum UnitType {
  BOTTLE = 'CHAI',                       // Chai (VD: 500ml, 1L)
  PACK = 'GOI',                          // Gói (VD: 500g, 1kg)
  BAG = 'BAO',                           // Bao (VD: 20kg, 25kg, 50kg)
  BOX = 'THUNG',                         // Thùng (VD: 12 chai, 24 chai)
  CANISTER = 'CAN',                      // Can (VD: 5L, 20L)
  KG = 'KG',                             // Kilogram
  LITER = 'LIT',                         // Lít
  PIECE = 'CAI',                         // Cái / Máy
}

// Vai trò nhân viên
export enum StaffRole {
  ADMIN = 'ADMIN',                       // Quản trị viên
  CASHIER = 'CASHIER',                   // Thu ngân
  STOREKEEPER = 'STOREKEEPER',           // Thủ kho
  AQUA_ENGINEER = 'AQUA_ENGINEER',       // Kỹ sư thủy sản (Đo nước, kê đơn)
}

// Thông số đo đạc chất lượng nước ao nuôi
export interface WaterTestMetrics {
  salinity: number;                      // Độ mặn (‰)
  pH_morning: number;                    // pH sáng (7.5 - 8.5)
  pH_afternoon: number;                  // pH chiều
  alkalinity: number;                    // Độ kiềm (mg/L CaCO3, chuẩn 120-160)
  nitrite_NO2: number;                   // Khí độc NO2 (mg/L)
  ammonia_NH3: number;                   // Khí độc NH3 (mg/L)
  hydrogen_sulfide_H2S?: number;         // Khí độc H2S (mg/L)
  transparency_cm?: number;              // Độ trong (cm)
  water_color?: string;                  // Màu nước (Nâu trà, xanh nõn chuối, xanh đậm)
}

// Giỏ hàng tại Quầy POS
export interface CartItem {
  id: string;
  sku: string;
  name: string;
  category: ProductCategory;
  unit: string;
  unitPrice: number;
  quantity: number;
  batchNumber?: string;
  expiryDate?: string;
  discount: number;
  total: number;
}
