'use client';

import { create } from 'zustand';
import { ProductCategory } from '@omnipos/shared';
import { API_BASE_URL } from '@/lib/api';

export interface UnitConversionVariant {
  id?: string;
  unitName: string;
  conversionRate: number;
  price: number;
  barcode?: string;
}

export interface ProductItem {
  id: string;
  sku: string;
  barcode: string;
  name: string;
  scientificName?: string;
  activeIngredients?: string;
  category: ProductCategory;
  unit: string;
  unitPrice: number;
  costPrice?: number;
  stock: number;
  batchNumber?: string;
  expiryDate?: string;
  availableUnits?: { unit: string; price: number }[];
  conversions?: UnitConversionVariant[];
  isNew?: boolean;
}

interface ProductStore {
  products: ProductItem[];
  isLoading: boolean;
  newlyAddedId: string | null;
  loadProducts: () => Promise<void>;
  addProduct: (productData: any) => Promise<ProductItem>;
  updateProduct: (id: string, productData: any) => Promise<ProductItem | null>;
  deleteProduct: (id: string) => Promise<boolean>;
  setNewlyAddedId: (id: string | null) => void;
}

export const useProductStore = create<ProductStore>((set, get) => ({
  products: [],
  isLoading: true,
  newlyAddedId: null,

  loadProducts: async () => {
    try {
      set({ isLoading: true });
      const res = await fetch(`${API_BASE_URL}/products`);
      if (!res.ok) {
        console.error('Failed to fetch products from DB:', res.statusText);
        set({ isLoading: false });
        return;
      }
      const data = await res.json();
      if (Array.isArray(data)) {
        const formatted: ProductItem[] = data.map((item: any) => {
          const totalStock = item.batches?.reduce(
            (acc: number, b: any) => acc + Number(b.quantity || 0),
            0,
          ) || 0;
          const firstBatch = item.batches?.[0];

          const conversions: UnitConversionVariant[] = (item.unitConversions || []).map((c: any) => ({
            id: c.id,
            unitName: c.unitName,
            conversionRate: Number(c.conversionRate),
            price: Number(c.price),
            barcode: c.barcode,
          }));

          return {
            id: item.id,
            sku: item.sku,
            barcode: item.barcode,
            name: item.name,
            scientificName: item.scientificName,
            activeIngredients: item.activeIngredients,
            category: item.category,
            unit: item.baseUnit,
            unitPrice: Number(item.retailPrice),
            costPrice: Number(item.costPrice),
            stock: totalStock,
            batchNumber: firstBatch?.batchNumber || 'LÔ MỚI',
            expiryDate: firstBatch?.expiryDate
              ? new Date(firstBatch.expiryDate).toLocaleDateString('vi-VN')
              : 'Còn hạn dài',
            availableUnits: [
              { unit: item.baseUnit, price: Number(item.retailPrice) },
              ...conversions.map((c) => ({
                unit: c.unitName,
                price: c.price,
              })),
            ],
            conversions,
          };
        });

        const currentNewlyAdded = get().newlyAddedId;
        set({ products: formatted, isLoading: false, newlyAddedId: currentNewlyAdded });
      } else {
        set({ products: [], isLoading: false });
      }
    } catch (err) {
      console.error('Error fetching products from real DB:', err);
      set({ isLoading: false });
    }
  },

  addProduct: async (productData: any) => {
    const res = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Không thể tạo sản phẩm trong cơ sở dữ liệu.');
    }

    const createdProduct = await res.json();

    const totalStock = createdProduct.batches?.reduce(
      (acc: number, b: any) => acc + Number(b.quantity || 0),
      0,
    ) || Number(productData.initialStock || 0);

    const firstBatch = createdProduct.batches?.[0];

    const conversions: UnitConversionVariant[] = (createdProduct.unitConversions || productData.conversions || []).map((c: any) => ({
      id: c.id,
      unitName: c.unitName,
      conversionRate: Number(c.conversionRate),
      price: Number(c.price),
      barcode: c.barcode,
    }));

    const newProductItem: ProductItem = {
      id: createdProduct.id,
      sku: createdProduct.sku,
      barcode: createdProduct.barcode,
      name: createdProduct.name,
      scientificName: createdProduct.scientificName,
      activeIngredients: createdProduct.activeIngredients,
      category: createdProduct.category,
      unit: createdProduct.baseUnit,
      unitPrice: Number(createdProduct.retailPrice),
      costPrice: Number(createdProduct.costPrice),
      stock: totalStock,
      batchNumber: firstBatch?.batchNumber || productData.initialBatchNumber || 'LÔ MỚI',
      expiryDate: firstBatch?.expiryDate
        ? new Date(firstBatch.expiryDate).toLocaleDateString('vi-VN')
        : 'Còn hạn dài',
      availableUnits: [
        { unit: createdProduct.baseUnit, price: Number(createdProduct.retailPrice) },
        ...conversions.map((c) => ({
          unit: c.unitName,
          price: c.price,
        })),
      ],
      conversions,
      isNew: true,
    };

    set((state) => ({
      products: [newProductItem, ...state.products.filter((p) => p.id !== newProductItem.id)],
      newlyAddedId: newProductItem.id,
    }));

    return newProductItem;
  },

  updateProduct: async (id: string, productData: any) => {
    const res = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Không thể cập nhật sản phẩm trong cơ sở dữ liệu.');
    }

    const updated = await res.json();

    const conversions: UnitConversionVariant[] = (updated.unitConversions || productData.conversions || []).map((c: any) => ({
      id: c.id,
      unitName: c.unitName,
      conversionRate: Number(c.conversionRate),
      price: Number(c.price),
      barcode: c.barcode,
    }));

    let updatedItem: ProductItem | null = null;
    set((state) => ({
      products: state.products.map((p) => {
        if (p.id === id) {
          updatedItem = {
            ...p,
            name: updated.name ?? productData.name ?? p.name,
            sku: updated.sku ?? productData.sku ?? p.sku,
            barcode: updated.barcode ?? productData.barcode ?? p.barcode,
            category: updated.category ?? productData.category ?? p.category,
            unit: updated.baseUnit ?? productData.baseUnit ?? p.unit,
            unitPrice: Number(updated.retailPrice ?? productData.retailPrice ?? p.unitPrice),
            costPrice: Number(updated.costPrice ?? productData.costPrice ?? p.costPrice),
            activeIngredients: updated.activeIngredients ?? productData.activeIngredients ?? p.activeIngredients,
            scientificName: updated.scientificName ?? productData.scientificName ?? p.scientificName,
            availableUnits: [
              { unit: updated.baseUnit ?? p.unit, price: Number(updated.retailPrice ?? p.unitPrice) },
              ...conversions.map((c) => ({
                unit: c.unitName,
                price: c.price,
              })),
            ],
            conversions,
          };
          return updatedItem;
        }
        return p;
      }),
    }));

    return updatedItem;
  },

  deleteProduct: async (id: string) => {
    const res = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'DELETE',
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Không thể xóa sản phẩm trong cơ sở dữ liệu.');
    }

    set((state) => ({
      products: state.products.filter((p) => p.id !== id),
    }));
    return true;
  },

  setNewlyAddedId: (id) => set({ newlyAddedId: id }),
}));
