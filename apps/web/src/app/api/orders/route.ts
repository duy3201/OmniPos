import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PaymentMethod, StockTransactionType } from '@prisma/client';

export const dynamic = 'force-dynamic';

function mapPaymentMethod(method?: string): PaymentMethod {
  if (method === 'CREDIT_SEASON' || method === 'CROP_DEBT') return PaymentMethod.CROP_DEBT;
  if (method === 'VIETQR') return PaymentMethod.VIETQR;
  if (method === 'BANK_TRANSFER' || method === 'TRANSFER') return PaymentMethod.BANK_TRANSFER;
  if (method === 'MIXED') return PaymentMethod.MIXED;
  return PaymentMethod.CASH;
}

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      include: {
        customer: true,
        pond: true,
        staff: true,
        items: {
          include: {
            product: true,
            batch: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    // Map orderCode to orderNumber for frontend consistency
    const mapped = orders.map((o) => ({
      ...o,
      orderNumber: o.orderCode,
    }));

    return NextResponse.json(mapped);
  } catch (error: any) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const orderCode = body.orderCode || body.orderNumber || `HD-${Date.now().toString().slice(-6)}`;
    const paymentMethod = mapPaymentMethod(body.paymentMethod);

    // Default staff if not supplied
    let staffId = body.staffId;
    if (!staffId) {
      const firstStaff = await prisma.staff.findFirst();
      staffId = firstStaff?.id;
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Order
      const order = await tx.order.create({
        data: {
          orderCode,
          customerId: body.customerId || null,
          pondId: body.pondId || null,
          staffId: staffId!,
          subtotal: Number(body.subtotal) || Number(body.totalAmount) || 0,
          discountAmount: Number(body.discountAmount) || 0,
          vatAmount: Number(body.vatAmount) || 0,
          totalAmount: Number(body.totalAmount) || 0,
          paymentMethod,
          notes: body.notes || 'Bán hàng POS Terminal',
          status: 'COMPLETED',
        },
      });

      // 2. Create Order Items & Deduct Inventory Batches
      if (body.items && Array.isArray(body.items)) {
        for (const item of body.items) {
          const qty = Number(item.quantity) || 1;
          const unitPrice = Number(item.unitPrice) || 0;
          const totalPrice = Number(item.totalPrice) || qty * unitPrice;

          await tx.orderItem.create({
            data: {
              orderId: order.id,
              productId: item.productId,
              batchId: item.batchId || null,
              unitName: item.unitName || 'Đơn vị',
              quantity: qty,
              unitPrice,
              totalPrice,
            },
          });

          // Deduct from batch if batchId exists
          if (item.batchId) {
            const updatedBatch = await tx.batch.update({
              where: { id: item.batchId },
              data: {
                quantity: { decrement: qty },
              },
            });

            // Record Immutable Stock Card
            await tx.stockCard.create({
              data: {
                productId: item.productId,
                batchId: item.batchId,
                staffId: staffId!,
                transactionType: StockTransactionType.POS_SALE,
                documentNo: orderCode,
                changeQuantity: -qty,
                balanceAfter: updatedBatch.quantity,
                reasonNote: `Xuất bán đơn hàng #${orderCode}`,
              },
            });
          }
        }
      }

      // 3. Update customer crop debt if payment method is CROP_DEBT
      if (body.customerId && paymentMethod === PaymentMethod.CROP_DEBT) {
        await tx.customer.update({
          where: { id: body.customerId },
          data: {
            currentDebt: { increment: Number(body.totalAmount) || 0 },
          },
        });
      }

      const completeOrder = await tx.order.findUnique({
        where: { id: order.id },
        include: {
          customer: true,
          pond: true,
          staff: true,
          items: {
            include: {
              product: true,
              batch: true,
            },
          },
        },
      });

      return {
        ...completeOrder,
        orderNumber: completeOrder?.orderCode,
      };
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
