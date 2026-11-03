"use strict";
/**
 * OmniPOS Shared Types & Enums
 * Hệ Thống POS Quản Lý Cửa Hàng Vật Tư Thủy Sản
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.StaffRole = exports.UnitType = exports.BatchExpiryStatus = exports.OrderStatus = exports.PaymentMethod = exports.ProductCategory = void 0;
// Danh mục ngành hàng vật tư thủy sản
var ProductCategory;
(function (ProductCategory) {
    ProductCategory["ANTIBIOTIC"] = "ANTIBIOTIC";
    ProductCategory["AQUA_MEDICINE"] = "AQUA_MEDICINE";
    ProductCategory["PROBIOTIC"] = "PROBIOTIC";
    ProductCategory["WATER_TREATMENT"] = "WATER_TREATMENT";
    ProductCategory["MINERAL_NUTRITION"] = "MINERAL_NUTRITION";
    ProductCategory["AQUA_FEED"] = "AQUA_FEED";
    ProductCategory["EQUIPMENT"] = "EQUIPMENT";
    ProductCategory["EQUIPMENT_SUPPLIES"] = "EQUIPMENT_SUPPLIES";
    ProductCategory["ACCESSORY"] = "ACCESSORY";
})(ProductCategory || (exports.ProductCategory = ProductCategory = {}));
// Phương thức thanh toán quầy POS
var PaymentMethod;
(function (PaymentMethod) {
    PaymentMethod["VIETQR"] = "VIETQR";
    PaymentMethod["CASH"] = "CASH";
    PaymentMethod["CARD"] = "CARD";
    PaymentMethod["CREDIT_SEASON"] = "CREDIT_SEASON";
    PaymentMethod["SPLIT"] = "SPLIT";
})(PaymentMethod || (exports.PaymentMethod = PaymentMethod = {}));
// Trạng thái đơn hàng
var OrderStatus;
(function (OrderStatus) {
    OrderStatus["COMPLETED"] = "COMPLETED";
    OrderStatus["PENDING"] = "PENDING";
    OrderStatus["DRAFT"] = "DRAFT";
    OrderStatus["CANCELLED"] = "CANCELLED";
    OrderStatus["REFUNDED"] = "REFUNDED";
})(OrderStatus || (exports.OrderStatus = OrderStatus = {}));
// Trạng thái hạn sử dụng của Lô thuốc / Chế phẩm
var BatchExpiryStatus;
(function (BatchExpiryStatus) {
    BatchExpiryStatus["SAFE"] = "SAFE";
    BatchExpiryStatus["NEAR_EXPIRY"] = "NEAR_EXPIRY";
    BatchExpiryStatus["CRITICAL"] = "CRITICAL";
    BatchExpiryStatus["EXPIRED"] = "EXPIRED";
})(BatchExpiryStatus || (exports.BatchExpiryStatus = BatchExpiryStatus = {}));
// Đơn vị tính phổ biến
var UnitType;
(function (UnitType) {
    UnitType["BOTTLE"] = "CHAI";
    UnitType["PACK"] = "GOI";
    UnitType["BAG"] = "BAO";
    UnitType["BOX"] = "THUNG";
    UnitType["CANISTER"] = "CAN";
    UnitType["KG"] = "KG";
    UnitType["LITER"] = "LIT";
    UnitType["PIECE"] = "CAI";
})(UnitType || (exports.UnitType = UnitType = {}));
// Vai trò nhân viên
var StaffRole;
(function (StaffRole) {
    StaffRole["ADMIN"] = "ADMIN";
    StaffRole["CASHIER"] = "CASHIER";
    StaffRole["STOREKEEPER"] = "STOREKEEPER";
    StaffRole["AQUA_ENGINEER"] = "AQUA_ENGINEER";
})(StaffRole || (exports.StaffRole = StaffRole = {}));
