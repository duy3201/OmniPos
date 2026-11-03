import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(category?: string, query?: string) {
    const where: any = { active: true };
    if (category && category !== 'ALL') {
      where.category = category;
    }
    if (query) {
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { sku: { contains: query, mode: 'insensitive' } },
        { barcode: { contains: query, mode: 'insensitive' } },
        { activeIngredients: { contains: query, mode: 'insensitive' } },
      ];
    }

    return this.prisma.client.product.findMany({
      where,
      include: {
        unitConversions: true,
        batches: {
          orderBy: { expiryDate: 'asc' }, // FEFO sort
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findByBarcode(barcode: string) {
    return this.prisma.client.product.findFirst({
      where: {
        OR: [
          { barcode },
          { unitConversions: { some: { barcode } } },
        ],
      },
      include: {
        unitConversions: true,
        batches: {
          where: { quantity: { gt: 0 } },
          orderBy: { expiryDate: 'asc' },
        },
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.client.product.findUnique({
      where: { id },
      include: {
        unitConversions: true,
        batches: true,
        stockCards: {
          take: 20,
          orderBy: { createdAt: 'desc' },
          include: { staff: true },
        },
      },
    });
  }

  async create(data: {
    sku: string;
    barcode: string;
    name: string;
    scientificName?: string;
    activeIngredients?: string;
    category: any;
    baseUnit: string;
    costPrice: number;
    retailPrice: number;
    wholesalePrice?: number;
    usageInstructions?: string;
    minStockAlert?: number;
    maxStockAlert?: number;
    initialStock?: number;
    initialBatchNumber?: string;
    expiryDate?: string;
    conversions?: { unitName: string; conversionRate: number; price: number; barcode?: string }[];
  }) {
    return this.prisma.client.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          sku: data.sku,
          barcode: data.barcode,
          name: data.name,
          scientificName: data.scientificName,
          activeIngredients: data.activeIngredients,
          category: data.category,
          baseUnit: data.baseUnit,
          costPrice: data.costPrice,
          retailPrice: data.retailPrice,
          wholesalePrice: data.wholesalePrice || data.retailPrice * 0.9,
          usageInstructions: data.usageInstructions,
          minStockAlert: data.minStockAlert || 10,
          maxStockAlert: data.maxStockAlert || 500,
          active: true,
        },
      });

      if (data.conversions && data.conversions.length > 0) {
        for (const conv of data.conversions) {
          await tx.unitConversion.create({
            data: {
              productId: product.id,
              unitName: conv.unitName,
              conversionRate: conv.conversionRate,
              price: conv.price,
              barcode: conv.barcode || `${data.barcode}-${conv.unitName}`,
            },
          });
        }
      }

      if (data.initialStock && data.initialStock > 0) {
        const batchNumber =
          data.initialBatchNumber ||
          `L-${new Date().toISOString().slice(2, 7).replace('-', '')}-01`;
        const expDate = data.expiryDate
          ? new Date(data.expiryDate)
          : new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000);

        const batch = await tx.batch.create({
          data: {
            productId: product.id,
            batchNumber,
            manufacturingDate: new Date(),
            expiryDate: expDate,
            quantity: data.initialStock,
            costPrice: data.costPrice,
            status: 'GOOD',
            warehouseLocation: 'Kệ Hàng Mới Nhập',
          },
        });

        const staff = await tx.staff.findFirst();
        if (staff) {
          await tx.stockCard.create({
            data: {
              productId: product.id,
              batchId: batch.id,
              transactionType: 'PURCHASE_RECEIPT',
              documentNo: `#INIT-${data.sku}`,
              staffId: staff.id,
              changeQuantity: data.initialStock,
              balanceAfter: data.initialStock,
              unitPrice: data.costPrice,
              reasonNote: `Nhập tồn ban đầu khi tạo sản phẩm mới`,
            },
          });
        }
      }

      return tx.product.findUnique({
        where: { id: product.id },
        include: {
          unitConversions: true,
          batches: true,
        },
      });
    });
  }

  async update(
    id: string,
    data: {
      name?: string;
      scientificName?: string;
      activeIngredients?: string;
      category?: any;
      baseUnit?: string;
      costPrice?: number;
      retailPrice?: number;
      wholesalePrice?: number;
      usageInstructions?: string;
      minStockAlert?: number;
      maxStockAlert?: number;
      conversions?: { unitName: string; conversionRate: number; price: number; barcode?: string }[];
    },
  ) {
    return this.prisma.client.$transaction(async (tx) => {
      const updateData: any = {};
      if (data.name !== undefined) updateData.name = data.name;
      if (data.scientificName !== undefined) updateData.scientificName = data.scientificName;
      if (data.activeIngredients !== undefined) updateData.activeIngredients = data.activeIngredients;
      if (data.category !== undefined) updateData.category = data.category;
      if (data.baseUnit !== undefined) updateData.baseUnit = data.baseUnit;
      if (data.costPrice !== undefined) updateData.costPrice = data.costPrice;
      if (data.retailPrice !== undefined) updateData.retailPrice = data.retailPrice;
      if (data.wholesalePrice !== undefined) updateData.wholesalePrice = data.wholesalePrice;
      if (data.usageInstructions !== undefined) updateData.usageInstructions = data.usageInstructions;
      if (data.minStockAlert !== undefined) updateData.minStockAlert = data.minStockAlert;
      if (data.maxStockAlert !== undefined) updateData.maxStockAlert = data.maxStockAlert;

      await tx.product.update({
        where: { id },
        data: updateData,
      });

      // Update unit conversion variants if provided
      if (data.conversions) {
        await tx.unitConversion.deleteMany({
          where: { productId: id },
        });

        for (const conv of data.conversions) {
          await tx.unitConversion.create({
            data: {
              productId: id,
              unitName: conv.unitName,
              conversionRate: conv.conversionRate,
              price: conv.price,
              barcode: conv.barcode || `${id}-${conv.unitName}`,
            },
          });
        }
      }

      return tx.product.findUnique({
        where: { id },
        include: {
          unitConversions: true,
          batches: true,
        },
      });
    });
  }

  async remove(id: string) {
    return this.prisma.client.product.update({
      where: { id },
      data: { active: false },
    });
  }
}

