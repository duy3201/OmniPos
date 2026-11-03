import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ProductCategory } from '@prisma/client';

export const dynamic = 'force-dynamic';

function mapCategory(cat: string): ProductCategory {
  if (cat === 'ANTIBIOTIC') return ProductCategory.AQUA_MEDICINE;
  if (cat === 'EQUIPMENT') return ProductCategory.EQUIPMENT_SUPPLIES;
  if (Object.values(ProductCategory).includes(cat as ProductCategory)) {
    return cat as ProductCategory;
  }
  return ProductCategory.WATER_TREATMENT;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryParam = searchParams.get('category');
    const query = searchParams.get('q');

    const where: any = { active: true };
    if (categoryParam && categoryParam !== 'ALL') {
      where.category = mapCategory(categoryParam);
    }
    if (query) {
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { sku: { contains: query, mode: 'insensitive' } },
        { barcode: { contains: query, mode: 'insensitive' } },
      ];
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        unitConversions: true,
        batches: {
          orderBy: { expiryDate: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const mapped = products.map((p) => ({
      ...p,
      unitPrice: Number(p.retailPrice),
      retailPrice: Number(p.retailPrice),
      costPrice: Number(p.costPrice),
      wholesalePrice: p.wholesalePrice ? Number(p.wholesalePrice) : null,
    }));

    return NextResponse.json(mapped);
  } catch (error: any) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.name || !body.sku) {
      return NextResponse.json(
        { error: 'Tên sản phẩm và mã SKU là bắt buộc.' },
        { status: 400 }
      );
    }

    const category = mapCategory(body.category);
    const retailPrice = Number(body.retailPrice) || 0;
    const costPrice = Number(body.costPrice) || Math.round(retailPrice * 0.75);
    const initialStock = Number(body.initialStock) || 0;

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Product
      const product = await tx.product.create({
        data: {
          sku: body.sku.trim().toUpperCase(),
          barcode: body.barcode?.trim() || `893${Date.now().toString().slice(-10)}`,
          name: body.name.trim(),
          scientificName: body.scientificName?.trim() || null,
          activeIngredients: body.activeIngredients?.trim() || null,
          category,
          baseUnit: body.baseUnit?.trim() || 'Chai',
          costPrice,
          retailPrice,
          wholesalePrice: Number(body.wholesalePrice) || Math.round(retailPrice * 0.9),
          usageInstructions: body.usageInstructions?.trim() || null,
          minStockAlert: 10,
          maxStockAlert: 500,
          active: true,
        },
      });

      // 2. Create Unit Conversions
      if (body.conversions && Array.isArray(body.conversions) && body.conversions.length > 0) {
        for (const conv of body.conversions) {
          if (conv.unitName && conv.conversionRate) {
            await tx.unitConversion.create({
              data: {
                productId: product.id,
                unitName: conv.unitName.trim(),
                conversionRate: Number(conv.conversionRate),
                price: Number(conv.price) || Math.round(retailPrice * Number(conv.conversionRate)),
                barcode: conv.barcode?.trim() || `${product.barcode}-${conv.unitName}`,
              },
            });
          }
        }
      }

      // 3. Create initial Batch if stock > 0
      if (initialStock > 0) {
        const batchNumber =
          body.initialBatchNumber?.trim() ||
          `L-${new Date().toISOString().slice(2, 7).replace('-', '')}-01`;
        const expDate = body.expiryDate
          ? new Date(body.expiryDate)
          : new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000);

        await tx.batch.create({
          data: {
            productId: product.id,
            batchNumber,
            manufacturingDate: new Date(),
            expiryDate: expDate,
            quantity: initialStock,
            costPrice,
            status: 'GOOD',
            warehouseLocation: 'Kệ Hàng Mới Nhập',
          },
        });
      }

      return tx.product.findUnique({
        where: { id: product.id },
        include: {
          unitConversions: true,
          batches: true,
        },
      });
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
