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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        unitConversions: true,
        batches: {
          orderBy: { expiryDate: 'asc' },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Không tìm thấy sản phẩm' }, { status: 404 });
    }

    return NextResponse.json({
      ...product,
      unitPrice: Number(product.retailPrice),
      retailPrice: Number(product.retailPrice),
      costPrice: Number(product.costPrice),
      wholesalePrice: product.wholesalePrice ? Number(product.wholesalePrice) : null,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const category = body.category ? mapCategory(body.category) : undefined;
    const retailPrice = body.retailPrice !== undefined ? Number(body.retailPrice) : undefined;
    const costPrice = body.costPrice !== undefined ? Number(body.costPrice) : undefined;

    const result = await prisma.$transaction(async (tx) => {
      // 1. Update Product Details
      const updated = await tx.product.update({
        where: { id },
        data: {
          name: body.name ? body.name.trim() : undefined,
          sku: body.sku ? body.sku.trim().toUpperCase() : undefined,
          barcode: body.barcode ? body.barcode.trim() : undefined,
          scientificName: body.scientificName !== undefined ? body.scientificName : undefined,
          activeIngredients: body.activeIngredients !== undefined ? body.activeIngredients : undefined,
          category,
          baseUnit: body.baseUnit ? body.baseUnit.trim() : undefined,
          costPrice,
          retailPrice,
          wholesalePrice: body.wholesalePrice !== undefined ? Number(body.wholesalePrice) : undefined,
          usageInstructions: body.usageInstructions !== undefined ? body.usageInstructions : undefined,
        },
      });

      // 2. Synchronize Unit Conversions if provided
      if (body.conversions && Array.isArray(body.conversions)) {
        // Delete old conversions for clean sync
        await tx.unitConversion.deleteMany({
          where: { productId: id },
        });

        for (const conv of body.conversions) {
          if (conv.unitName && conv.conversionRate) {
            await tx.unitConversion.create({
              data: {
                productId: id,
                unitName: conv.unitName.trim(),
                conversionRate: Number(conv.conversionRate),
                price: Number(conv.price) || Math.round((retailPrice || 0) * Number(conv.conversionRate)),
                barcode: conv.barcode?.trim() || `${updated.barcode}-${conv.unitName}`,
              },
            });
          }
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

    return NextResponse.json({
      ...result,
      unitPrice: Number(result?.retailPrice),
      retailPrice: Number(result?.retailPrice),
      costPrice: Number(result?.costPrice),
      wholesalePrice: result?.wholesalePrice ? Number(result?.wholesalePrice) : null,
    });
  } catch (error: any) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Soft delete to protect relational FK integrity with order items
    const deleted = await prisma.product.update({
      where: { id },
      data: { active: false },
    });

    return NextResponse.json({ success: true, product: deleted });
  } catch (error: any) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
