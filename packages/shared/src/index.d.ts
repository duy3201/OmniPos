/**
 * OmniPOS Shared Types & Enums
 * Hệ Thống POS Quản Lý Cửa Hàng Vật Tư Thủy Sản
 */
export declare enum ProductCategory {
    ANTIBIOTIC = "ANTIBIOTIC",// Thuốc kháng sinh / Trị bệnh
    AQUA_MEDICINE = "AQUA_MEDICINE",// Thuốc thú y thủy sản / Thảo dược gan ruột
    PROBIOTIC = "PROBIOTIC",// Men vi sinh xử lý đáy & đường ruột
    WATER_TREATMENT = "WATER_TREATMENT",// Hóa chất xử lý nước (Yucca, Zeolite, Chlorine, Vôi)
    MINERAL_NUTRITION = "MINERAL_NUTRITION",// Khoáng tạt ao, thảo dược, bổ gan ruột
    AQUA_FEED = "AQUA_FEED",// Thức ăn tôm / cá
    EQUIPMENT = "EQUIPMENT",// Thiết bị ao nuôi (Mô tơ quạt, máy sục oxy, bút đo)
    EQUIPMENT_SUPPLIES = "EQUIPMENT_SUPPLIES",// Thiết bị & Vật tư phụ trợ ao nuôi
    ACCESSORY = "ACCESSORY"
}
export declare enum PaymentMethod {
    VIETQR = "VIETQR",// Chuyển khoản VietQR động (Napas247)
    CASH = "CASH",// Tiền mặt tại quầy
    CARD = "CARD",// Quẹt thẻ máy POS ngân hàng
    CREDIT_SEASON = "CREDIT_SEASON",// Bán nợ vụ nuôi (Ghi nợ chủ đầm)
    SPLIT = "SPLIT"
}
export declare enum OrderStatus {
    COMPLETED = "COMPLETED",
    PENDING = "PENDING",
    DRAFT = "DRAFT",// Đơn lưu tạm (F8)
    CANCELLED = "CANCELLED",
    REFUNDED = "REFUNDED"
}
export declare enum BatchExpiryStatus {
    SAFE = "SAFE",// > 90 ngày (Xanh)
    NEAR_EXPIRY = "NEAR_EXPIRY",// 30 - 90 ngày (Vàng - Cảnh báo ưu tiên FEFO)
    CRITICAL = "CRITICAL",// < 30 ngày (Đỏ - Sắp hết date)
    EXPIRED = "EXPIRED"
}
export declare enum UnitType {
    BOTTLE = "CHAI",// Chai (VD: 500ml, 1L)
    PACK = "GOI",// Gói (VD: 500g, 1kg)
    BAG = "BAO",// Bao (VD: 20kg, 25kg, 50kg)
    BOX = "THUNG",// Thùng (VD: 12 chai, 24 chai)
    CANISTER = "CAN",// Can (VD: 5L, 20L)
    KG = "KG",// Kilogram
    LITER = "LIT",// Lít
    PIECE = "CAI"
}
export declare enum StaffRole {
    ADMIN = "ADMIN",// Quản trị viên
    CASHIER = "CASHIER",// Thu ngân
    STOREKEEPER = "STOREKEEPER",// Thủ kho
    AQUA_ENGINEER = "AQUA_ENGINEER"
}
export interface WaterTestMetrics {
    salinity: number;
    pH_morning: number;
    pH_afternoon: number;
    alkalinity: number;
    nitrite_NO2: number;
    ammonia_NH3: number;
    hydrogen_sulfide_H2S?: number;
    transparency_cm?: number;
    water_color?: string;
}
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
