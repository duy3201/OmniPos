import { create } from 'zustand';
import { PaymentMethod, ProductCategory, CartItem } from '@omnipos/shared';

export interface CustomerSummary {
  id: string;
  name: string;
  phone: string;
  tier: 'Đồng' | 'Bạc' | 'Vàng' | 'Kim Cương';
  points: number;
  creditLimit: number;       // Hạn mức nợ tối đa (VND)
  currentDebt: number;       // Nợ hiện tại (VND)
  ponds: { id: string; name: string; crop: string }[];
}

export interface ParkedOrder {
  id: string;
  orderNumber: string;
  createdAt: string;
  items: CartItem[];
  customer: CustomerSummary | null;
  pondId: string | null;
  note: string;
  total: number;
}

export interface OrderDiscount {
  type: 'PERCENT' | 'AMOUNT';
  value: number;
  note?: string;
  code?: string;
}

interface CartStore {
  activeTab: number;
  orders: { [tabId: number]: CartItem[] };
  selectedCustomer: { [tabId: number]: CustomerSummary | null };
  selectedPondId: { [tabId: number]: string | null };
  paymentMethods: { [tabId: number]: PaymentMethod };
  orderDiscounts: { [tabId: number]: OrderDiscount | null };
  parkedOrders: ParkedOrder[];
  
  // Actions
  setActiveTab: (tabId: number) => void;
  addToCart: (item: Omit<CartItem, 'quantity' | 'total'>) => void;
  updateQuantity: (itemId: string, delta: number) => void;
  removeItem: (itemId: string) => void;
  updateUnit: (itemId: string, unit: string, unitPrice: number) => void;
  updateBatch: (itemId: string, batchNumber: string, expiryDate: string) => void;
  setCustomer: (customer: CustomerSummary | null) => void;
  setPondId: (pondId: string | null) => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  setOrderDiscount: (discount: OrderDiscount | null) => void;
  clearCurrentOrder: () => void;
  parkCurrentOrder: (note?: string) => boolean;
  restoreParkedOrder: (parkedId: string) => void;
  deleteParkedOrder: (parkedId: string) => void;
  
  // Computations for active tab
  getSubtotal: () => number;
  getDiscount: () => number;
  getVat: () => number;
  getTotal: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  activeTab: 1,
  orders: {
    1: [],
    2: [],
    3: [],
  },
  selectedCustomer: {
    1: null,
    2: null,
    3: null,
  },
  selectedPondId: {
    1: null,
    2: null,
    3: null,
  },
  paymentMethods: {
    1: PaymentMethod.CASH,
    2: PaymentMethod.VIETQR,
    3: PaymentMethod.CREDIT_SEASON,
  },
  orderDiscounts: {
    1: null,
    2: null,
    3: null,
  },
  parkedOrders: [],

  setActiveTab: (tabId) => set({ activeTab: tabId }),

  setOrderDiscount: (discount) => {
    const { activeTab, orderDiscounts } = get();
    set({
      orderDiscounts: {
        ...orderDiscounts,
        [activeTab]: discount,
      },
    });
  },

  addToCart: (item) => {
    const { activeTab, orders } = get();
    const currentItems = orders[activeTab] || [];
    const existingIndex = currentItems.findIndex((i) => i.id === item.id && i.unit === item.unit);

    let updated: CartItem[];
    if (existingIndex > -1) {
      updated = currentItems.map((ci, idx) =>
        idx === existingIndex
          ? {
              ...ci,
              quantity: ci.quantity + 1,
              total: (ci.quantity + 1) * ci.unitPrice,
            }
          : ci
      );
    } else {
      updated = [
        ...currentItems,
        {
          ...item,
          quantity: 1,
          total: item.unitPrice,
        },
      ];
    }

    set({ orders: { ...orders, [activeTab]: updated } });
  },

  updateQuantity: (itemId, delta) => {
    const { activeTab, orders } = get();
    const currentItems = orders[activeTab] || [];
    const updated = currentItems
      .map((item) => {
        if (item.id === itemId) {
          const newQty = Math.max(1, item.quantity + delta);
          return {
            ...item,
            quantity: newQty,
            total: newQty * item.unitPrice - item.discount,
          };
        }
        return item;
      })
      .filter(Boolean);

    set({ orders: { ...orders, [activeTab]: updated } });
  },

  removeItem: (itemId) => {
    const { activeTab, orders } = get();
    const currentItems = orders[activeTab] || [];
    set({
      orders: {
        ...orders,
        [activeTab]: currentItems.filter((i) => i.id !== itemId),
      },
    });
  },

  updateUnit: (itemId, unit, unitPrice) => {
    const { activeTab, orders } = get();
    const currentItems = orders[activeTab] || [];
    const updated = currentItems.map((item) => {
      if (item.id === itemId) {
        return {
          ...item,
          unit,
          unitPrice,
          total: item.quantity * unitPrice - item.discount,
        };
      }
      return item;
    });
    set({ orders: { ...orders, [activeTab]: updated } });
  },

  updateBatch: (itemId, batchNumber, expiryDate) => {
    const { activeTab, orders } = get();
    const currentItems = orders[activeTab] || [];
    const updated = currentItems.map((item) => {
      if (item.id === itemId) {
        return {
          ...item,
          batchNumber,
          expiryDate,
        };
      }
      return item;
    });
    set({ orders: { ...orders, [activeTab]: updated } });
  },

  setCustomer: (customer) => {
    const { activeTab, selectedCustomer } = get();
    set({
      selectedCustomer: {
        ...selectedCustomer,
        [activeTab]: customer,
      },
    });
  },

  setPondId: (pondId) => {
    const { activeTab, selectedPondId } = get();
    set({
      selectedPondId: {
        ...selectedPondId,
        [activeTab]: pondId,
      },
    });
  },

  setPaymentMethod: (method) => {
    const { activeTab, paymentMethods } = get();
    set({
      paymentMethods: {
        ...paymentMethods,
        [activeTab]: method,
      },
    });
  },

  clearCurrentOrder: () => {
    const { activeTab, orders, orderDiscounts } = get();
    set({
      orders: {
        ...orders,
        [activeTab]: [],
      },
      orderDiscounts: {
        ...orderDiscounts,
        [activeTab]: null,
      },
    });
  },

  parkCurrentOrder: (note = 'Đơn lưu tạm') => {
    const { activeTab, orders, selectedCustomer, selectedPondId, parkedOrders, getTotal } = get();
    const currentItems = orders[activeTab] || [];
    if (currentItems.length === 0) return false;

    const newParked: ParkedOrder = {
      id: `parked-${Date.now()}`,
      orderNumber: `LT-${Date.now().toString().slice(-4)}`,
      createdAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      items: [...currentItems],
      customer: selectedCustomer[activeTab] || null,
      pondId: selectedPondId[activeTab] || null,
      note,
      total: getTotal(),
    };

    set({
      parkedOrders: [newParked, ...parkedOrders],
      orders: { ...orders, [activeTab]: [] },
      selectedCustomer: { ...selectedCustomer, [activeTab]: null },
      selectedPondId: { ...selectedPondId, [activeTab]: null },
    });
    return true;
  },

  restoreParkedOrder: (parkedId: string) => {
    const { activeTab, orders, selectedCustomer, selectedPondId, parkedOrders } = get();
    const parked = parkedOrders.find((p) => p.id === parkedId);
    if (!parked) return;

    set({
      orders: { ...orders, [activeTab]: [...parked.items] },
      selectedCustomer: { ...selectedCustomer, [activeTab]: parked.customer },
      selectedPondId: { ...selectedPondId, [activeTab]: parked.pondId },
      parkedOrders: parkedOrders.filter((p) => p.id !== parkedId),
    });
  },

  deleteParkedOrder: (parkedId: string) => {
    const { parkedOrders } = get();
    set({
      parkedOrders: parkedOrders.filter((p) => p.id !== parkedId),
    });
  },

  getSubtotal: () => {
    const { activeTab, orders } = get();
    const items = orders[activeTab] || [];
    return items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  },

  getDiscount: () => {
    const { activeTab, selectedCustomer, orderDiscounts, getSubtotal } = get();
    const subtotal = getSubtotal();
    let discount = 0;

    const custom = orderDiscounts[activeTab];
    if (custom) {
      if (custom.type === 'PERCENT') {
        discount += Math.round((subtotal * Math.min(100, Math.max(0, custom.value))) / 100);
      } else {
        discount += Math.min(subtotal, Math.max(0, custom.value));
      }
    }

    const cust = selectedCustomer[activeTab];
    if (cust && (cust.tier === 'Vàng' || cust.tier === 'Kim Cương') && !custom) {
      discount += Math.min(subtotal, 50000);
    }

    return discount;
  },

  getVat: () => {
    // Thuốc và thức ăn thú y thủy sản thường chịu thuế GTGT 5% hoặc 0%
    return 0;
  },

  getTotal: () => {
    const subtotal = get().getSubtotal();
    const discount = get().getDiscount();
    const vat = get().getVat();
    return Math.max(0, subtotal - discount + vat);
  },
}));
